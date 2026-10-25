import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { createAuth, sessionAuth, type AppEnv, type AuthOptions } from './auth';
import { extractCufe, invoiceUrl } from './cafe/cufe';
import { DgiUnavailableError, fetchCafe, type FetchCafeOptions } from './cafe/fetch';
import type { CodeFormat } from './cafe/codes';
import { CafeNotFoundError, CafeParseError } from './cafe/parse';
import type { StoreQuantities } from './catalog/rules';
import { scoped } from './db/scoped';

export type AppOptions = AuthOptions & {
  /** Para tests: reemplaza la consulta a la DGI. */
  dgi?: FetchCafeOptions;
};

/** Body de los endpoints CAFE: `{ input }` con el CUFE o la URL del QR. */
async function cufeFromBody(req: Request): Promise<string> {
  const body = (await req.json().catch(() => ({}))) as { input?: unknown };
  const cufe = typeof body.input === 'string' ? extractCufe(body.input) : null;
  if (!cufe) throw new HTTPException(400, { message: 'No es un CUFE ni una URL de factura válida' });
  return cufe;
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
    const cufe = await cufeFromBody(c.req.raw);
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
    const cufe = await cufeFromBody(c.req.raw);
    const purchases = scoped(c.env.DB, c.var.user.id).purchases;
    // Idempotente (CA1.5): si ya existe no se vuelve a consultar la DGI.
    const existingId = await purchases.findIdByCufe(cufe);
    if (existingId) return c.json({ id: existingId, created: false });

    try {
      const invoice = await fetchCafe(cufe, options.dgi);
      const { id, created } = await purchases.importCafe(invoice, invoiceUrl(cufe));
      return c.json({ id, created }, created ? 201 : 200);
    } catch (error) {
      const failure = dgiError(error, cufe);
      if (!failure) throw error;
      return c.json(failure.body, failure.status);
    }
  });

  app.get('/purchases/:id', async (c) => {
    const purchase = await scoped(c.env.DB, c.var.user.id).purchases.get(c.req.param('id'));
    if (!purchase) return c.json({ error: 'No encontrada' }, 404);
    return c.json(purchase);
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
