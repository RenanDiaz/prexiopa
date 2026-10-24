import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { createAuth, sessionAuth, type AppEnv, type AuthOptions } from './auth';
import { extractCufe, invoiceUrl } from './cafe/cufe';
import { DgiUnavailableError, fetchCafe, type FetchCafeOptions } from './cafe/fetch';
import { CafeNotFoundError, CafeParseError } from './cafe/parse';
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

  app.get('/me', (c) => c.json({ email: c.var.user.email }));

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
