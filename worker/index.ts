import { Hono, type Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { createAuth, sessionAuth, type AppEnv, type AuthOptions } from './auth';
import { extractCufe, invoiceUrl } from './cafe/cufe';
import { DgiUnavailableError, fetchCafe, type FetchCafeOptions } from './cafe/fetch';
import type { CodeFormat } from './cafe/codes';
import { CafeNotFoundError, CafeParseError } from './cafe/parse';
import type { StoreQuantities } from './catalog/rules';
import type { HistoryTarget } from './db/catalog';
import { ManualPurchaseError, type ManualLineInput, type ManualPurchaseInput } from './db/manual';
import { scoped } from './db/scoped';
import { linesCsv, purchasesCsv } from './export/csv';

export type AppOptions = AuthOptions & {
  /** Para tests: reemplaza la consulta a la DGI. */
  dgi?: FetchCafeOptions;
};

/** Tope de `scan_ms` (CA1.8): una hora. Más que eso es una pestaña olvidada, no un escaneo. */
const MAX_SCAN_MS = 3_600_000;

/** `scanMs` es una métrica: un valor inválido se descarta y no impide guardar la compra. */
function scanMsFrom(value: unknown): number | null {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= MAX_SCAN_MS ? value : null;
}

/** Body de los endpoints CAFE: `{ input, scanMs? }` con el CUFE o la URL del QR. */
async function cafeBody(req: Request): Promise<{ cufe: string; scanMs: number | null }> {
  const body = (await req.json().catch(() => ({}))) as { input?: unknown; scanMs?: unknown };
  const cufe = typeof body.input === 'string' ? extractCufe(body.input) : null;
  if (!cufe) throw new HTTPException(400, { message: 'No es un CUFE ni una URL de factura válida' });
  return { cufe, scanMs: scanMsFrom(body.scanMs) };
}

async function jsonBody(req: Request): Promise<Record<string, unknown>> {
  const body: unknown = await req.json().catch(() => null);
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new HTTPException(400, { message: 'El cuerpo debe ser un objeto JSON' });
  }
  return body as Record<string, unknown>;
}

function cleanName(value: unknown): string {
  const name = typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : '';
  if (!name || name.length > 120) throw new HTTPException(400, { message: 'El nombre debe tener entre 1 y 120 caracteres' });
  return name;
}

const CODE_FORMATS: CodeFormat[] = ['gtin', 'gtin_no_check', 'internal'];
const STORE_QUANTITIES: StoreQuantities[] = ['reliable', 'always_one'];

const bad = (message: string) => new HTTPException(400, { message });

/** Valida el body de POST /purchases/manual (CA4.1, CA4.2). */
/** "AAAA-MM-DD" del selector de fecha → mediodía de Panamá (17:00 UTC). */
function parseManualDate(value: unknown): string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) throw bad('Fecha inválida');
  const date = new Date(`${value}T17:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.getTime() > Date.now() + 86_400_000) throw bad('Fecha inválida');
  return date.toISOString();
}

function parseManualPurchase(body: Record<string, unknown>): ManualPurchaseInput {
  const store = body.store as Record<string, unknown> | undefined;
  let parsedStore: ManualPurchaseInput['store'];
  if (store && typeof store.id === 'string') parsedStore = { id: store.id };
  else if (store && typeof store.name === 'string') parsedStore = { name: cleanName(store.name) };
  else throw bad('Falta la tienda');

  const issuedAt = body.date === undefined ? undefined : parseManualDate(body.date);

  if (!Array.isArray(body.lines) || body.lines.length === 0 || body.lines.length > 200) {
    throw bad('La compra debe tener entre 1 y 200 líneas');
  }
  const lines = body.lines.map((raw, i): ManualLineInput => {
    const line = (raw ?? {}) as Record<string, unknown>;
    const { quantity, lineTotalCents } = line;
    if (typeof quantity !== 'number' || !(quantity > 0) || quantity > 10_000) throw bad(`Cantidad inválida en la línea ${i + 1}`);
    if (typeof lineTotalCents !== 'number' || !Number.isInteger(lineTotalCents) || lineTotalCents < 0 || lineTotalCents > 10_000_000) {
      throw bad(`Total inválido en la línea ${i + 1}`);
    }
    const code = typeof line.code === 'string' && /^\d{6,14}$/.test(line.code) ? line.code : undefined;
    return {
      productId: typeof line.productId === 'string' ? line.productId : undefined,
      code,
      description: cleanName(line.description),
      quantity: Math.round(quantity * 1000) / 1000,
      lineTotalCents,
    };
  });
  return { store: parsedStore, issuedAt, lines };
}

/** Errores de la DGI con el CUFE visible, para poder reintentar (CA1.6). */
function dgiError(error: unknown, cufe: string) {
  if (error instanceof CafeNotFoundError) {
    return {
      status: 404 as const,
      body: {
        error: 'La DGI no tiene una factura con este CUFE. Si es de hoy, espera unos minutos y reintenta.',
        code: 'not_found',
        cufe,
      },
    };
  }
  if (error instanceof DgiUnavailableError) {
    return { status: 502 as const, body: { error: 'La DGI no respondió. Intenta de nuevo.', code: 'dgi_unavailable', cufe } };
  }
  if (error instanceof CafeParseError) {
    return {
      status: 502 as const,
      body: { error: `La DGI devolvió un formato desconocido: ${error.message}`, code: 'dgi_format', cufe },
    };
  }
  return null;
}

export function createApp(options: AppOptions = {}) {
  const app = new Hono<AppEnv>().basePath('/api');

  // Rutas de Better Auth (login con Google, callback, logout). Van antes del
  // middleware: responden sin llamar a next(), así que no exigen sesión.
  app.on(['GET', 'POST'], '/auth/*', (c) => createAuth(c.env, options).handler(c.req.raw));

  app.use('*', sessionAuth(options));

  app.get('/me', async (c) => {
    // Aplica una vez las reglas de catálogo nuevas a los datos ya importados.
    try {
      await scoped(c.env.DB, c.var.user.id).catalog.ensureUpToDate();
    } catch (error) {
      console.error('No se pudo actualizar el catálogo', error);
    }
    return c.json({ email: c.var.user.email });
  });

  // F3 — Consulta de precios.
  app.get('/catalog/search', async (c) => {
    const catalog = scoped(c.env.DB, c.var.user.id).catalog;
    const code = c.req.query('code');
    const results = code ? await catalog.findByCode(code) : await catalog.search(c.req.query('q') ?? '');
    return c.json({ results });
  });

  app.get('/catalog/products/:id', async (c) => {
    const history = await scoped(c.env.DB, c.var.user.id).catalog.history({ productId: c.req.param('id') });
    if (!history) return c.json({ error: 'No encontrado' }, 404);
    return c.json(history);
  });

  app.get('/catalog/items/:id', async (c) => {
    const history = await scoped(c.env.DB, c.var.user.id).catalog.history({ itemId: c.req.param('id') });
    if (!history) return c.json({ error: 'No encontrado' }, 404);
    return c.json(history);
  });

  // F5 — Nombrar y vincular productos.
  app.patch('/catalog/products/:id', async (c) => {
    const { name } = await jsonBody(c.req.raw);
    const result = await scoped(c.env.DB, c.var.user.id).catalog.rename({ productId: c.req.param('id') }, cleanName(name));
    if (!result) return c.json({ error: 'No encontrado' }, 404);
    return c.json(result);
  });

  app.patch('/catalog/items/:id', async (c) => {
    const { name } = await jsonBody(c.req.raw);
    const result = await scoped(c.env.DB, c.var.user.id).catalog.rename({ itemId: c.req.param('id') }, cleanName(name));
    if (!result) return c.json({ error: 'No encontrado' }, 404);
    return c.json(result);
  });

  app.patch('/catalog/items/:id/weighed', async (c) => {
    const { isWeighed } = await jsonBody(c.req.raw);
    if (typeof isWeighed !== 'boolean') throw new HTTPException(400, { message: 'isWeighed debe ser true o false' });
    const updated = await scoped(c.env.DB, c.var.user.id).catalog.setWeighed(c.req.param('id'), isWeighed);
    if (!updated) return c.json({ error: 'No encontrado' }, 404);
    return c.body(null, 204);
  });

  // CA5.7 — Agregar el código de barras a un producto o ítem ya creados.
  const setBarcode = async (c: Context<AppEnv>, target: HistoryTarget) => {
    const { code } = await jsonBody(c.req.raw);
    if (typeof code !== 'string') throw new HTTPException(400, { message: 'Falta el código' });
    const result = await scoped(c.env.DB, c.var.user.id).catalog.setBarcode(target, code);
    if (result.ok) return c.json({ productId: result.productId });
    switch (result.error) {
      case 'not_found':
        return c.json({ error: 'No encontrado' }, 404);
      case 'invalid_code':
        return c.json({ error: 'Código de barras inválido. Revisa los dígitos.', code: 'invalid_code' }, 400);
      case 'has_code':
        return c.json({ error: 'Este producto ya tiene un código de barras.', code: 'has_code' }, 409);
      case 'in_use':
        return c.json(
          { error: `Ese código ya es de «${result.name}».`, code: 'in_use', productId: result.productId, name: result.name },
          409,
        );
    }
  };
  app.put('/catalog/products/:id/barcode', (c) => setBarcode(c, { productId: c.req.param('id') }));
  app.put('/catalog/items/:id/barcode', (c) => setBarcode(c, { itemId: c.req.param('id') }));

  app.put('/catalog/items/:id/product', async (c) => {
    const { productId } = await jsonBody(c.req.raw);
    if (typeof productId !== 'string') throw new HTTPException(400, { message: 'Falta productId' });
    const linked = await scoped(c.env.DB, c.var.user.id).catalog.link(c.req.param('id'), productId);
    if (!linked) return c.json({ error: 'No encontrado' }, 404);
    return c.body(null, 204);
  });

  app.delete('/catalog/items/:id/product', async (c) => {
    const unlinked = await scoped(c.env.DB, c.var.user.id).catalog.unlink(c.req.param('id'));
    if (!unlinked) return c.json({ error: 'No encontrado' }, 404);
    return c.body(null, 204);
  });

  // CA5.5 — Corregir la cantidad o el peso de una línea.
  app.patch('/purchase-lines/:id', async (c) => {
    const { quantity } = await jsonBody(c.req.raw);
    if (typeof quantity !== 'number' || !Number.isFinite(quantity) || quantity <= 0 || quantity > 10_000) {
      throw new HTTPException(400, { message: 'La cantidad debe ser un número mayor que 0' });
    }
    const updated = await scoped(c.env.DB, c.var.user.id).catalog.setLineQuantity(
      c.req.param('id'),
      Math.round(quantity * 1000) / 1000,
    );
    if (!updated) return c.json({ error: 'No encontrada' }, 404);
    return c.body(null, 204);
  });

  // CA5.4 — Tiendas: nombre visible y formatos (§10.2, §10.6).
  app.get('/stores/:id', async (c) => {
    const store = await scoped(c.env.DB, c.var.user.id).catalog.getStore(c.req.param('id'));
    if (!store) return c.json({ error: 'No encontrada' }, 404);
    return c.json(store);
  });

  app.patch('/stores/:id', async (c) => {
    const body = await jsonBody(c.req.raw);
    const changes: { displayName?: string | null; codeFormat?: CodeFormat; quantities?: StoreQuantities } = {};
    if ('displayName' in body) {
      changes.displayName = body.displayName === null || body.displayName === '' ? null : cleanName(body.displayName);
    }
    if ('codeFormat' in body) {
      if (!CODE_FORMATS.includes(body.codeFormat as CodeFormat)) throw new HTTPException(400, { message: 'codeFormat inválido' });
      changes.codeFormat = body.codeFormat as CodeFormat;
    }
    if ('quantities' in body) {
      if (!STORE_QUANTITIES.includes(body.quantities as StoreQuantities)) {
        throw new HTTPException(400, { message: 'quantities inválido' });
      }
      changes.quantities = body.quantities as StoreQuantities;
    }
    const updated = await scoped(c.env.DB, c.var.user.id).catalog.updateStore(c.req.param('id'), changes);
    if (!updated) return c.json({ error: 'No encontrada' }, 404);
    return c.body(null, 204);
  });

  app.get('/purchases', async (c) => {
    const page = await scoped(c.env.DB, c.var.user.id).purchases.list({
      cursor: c.req.query('cursor'),
      limit: Number(c.req.query('limit')) || undefined,
    });
    return c.json(page);
  });

  app.post('/purchases/cafe/preview', async (c) => {
    const { cufe } = await cafeBody(c.req.raw);
    const existingId = await scoped(c.env.DB, c.var.user.id).purchases.findIdByCufe(cufe);
    try {
      const invoice = await fetchCafe(cufe, options.dgi);
      return c.json({ invoice, existingPurchaseId: existingId });
    } catch (error) {
      const failure = dgiError(error, cufe);
      if (!failure) throw error;
      return c.json(failure.body, failure.status);
    }
  });

  app.post('/purchases/cafe', async (c) => {
    const { cufe, scanMs } = await cafeBody(c.req.raw);
    const purchases = scoped(c.env.DB, c.var.user.id).purchases;
    // Idempotente (CA1.5): si ya existe no se vuelve a consultar la DGI.
    const existingId = await purchases.findIdByCufe(cufe);
    if (existingId) return c.json({ id: existingId, created: false });

    try {
      const invoice = await fetchCafe(cufe, options.dgi);
      const { id, created } = await purchases.importCafe(invoice, invoiceUrl(cufe), scanMs);
      return c.json({ id, created }, created ? 201 : 200);
    } catch (error) {
      const failure = dgiError(error, cufe);
      if (!failure) throw error;
      return c.json(failure.body, failure.status);
    }
  });

  // F4 — Compra manual.
  app.get('/stores', async (c) => {
    const items = await scoped(c.env.DB, c.var.user.id).stores.list(c.req.query('q') ?? '');
    return c.json({ items });
  });

  app.post('/purchases/manual', async (c) => {
    const input = parseManualPurchase(await jsonBody(c.req.raw));
    try {
      const { id } = await scoped(c.env.DB, c.var.user.id).purchases.createManual(input);
      return c.json({ id }, 201);
    } catch (error) {
      if (error instanceof ManualPurchaseError) return c.json({ error: error.message }, 400);
      throw error;
    }
  });

  // F8 — Exportar a CSV (CA8.1): snapshot completo, con nombre fijo.
  const csv = (body: string, filename: string) =>
    new Response(body, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    });
  app.get('/export/compras.csv', async (c) =>
    csv(purchasesCsv(await scoped(c.env.DB, c.var.user.id).export.purchases()), 'prexiopa-compras.csv'),
  );
  app.get('/export/lineas.csv', async (c) =>
    csv(linesCsv(await scoped(c.env.DB, c.var.user.id).export.lines()), 'prexiopa-lineas.csv'),
  );

  // F6 — Resumen mensual.
  app.get('/summary', async (c) => c.json(await scoped(c.env.DB, c.var.user.id).summary.monthly()));

  app.get('/purchases/:id', async (c) => {
    const purchase = await scoped(c.env.DB, c.var.user.id).purchases.get(c.req.param('id'));
    if (!purchase) return c.json({ error: 'No encontrada' }, 404);
    return c.json(purchase);
  });

  // F4 (CA4.5): solo la fecha de una compra manual; las importadas conservan la de la DGI.
  app.patch('/purchases/:id', async (c) => {
    const body = await jsonBody(c.req.raw);
    const result = await scoped(c.env.DB, c.var.user.id).purchases.setManualDate(
      c.req.param('id'),
      parseManualDate(body.date),
    );
    if (result === 'not_found') return c.json({ error: 'No encontrada' }, 404);
    if (result === 'not_manual') return c.json({ error: 'Solo se puede cambiar la fecha de una compra manual' }, 409);
    return c.body(null, 204);
  });

  app.delete('/purchases/:id', async (c) => {
    const deleted = await scoped(c.env.DB, c.var.user.id).purchases.delete(c.req.param('id'));
    if (!deleted) return c.json({ error: 'No encontrada' }, 404);
    return c.body(null, 204);
  });

  app.notFound((c) => c.json({ error: 'Ruta no encontrada' }, 404));

  app.onError((err, c) => {
    if (err instanceof HTTPException) return c.json({ error: err.message }, err.status);
    console.error(err);
    return c.json({ error: 'Error interno' }, 500);
  });

  return app;
}

export default createApp();
