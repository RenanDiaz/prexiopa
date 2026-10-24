import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { createAuth, sessionAuth, type AppEnv, type AuthOptions } from './auth';
import { scoped } from './db/scoped';

export function createApp(authOptions: AuthOptions = {}) {
  const app = new Hono<AppEnv>().basePath('/api');

  // Rutas de Better Auth (login con Google, callback, logout). Van antes del
  // middleware: responden sin llamar a next(), así que no exigen sesión.
  app.on(['GET', 'POST'], '/auth/*', (c) => createAuth(c.env, authOptions).handler(c.req.raw));

  app.use('*', sessionAuth(authOptions));

  app.get('/me', (c) => c.json({ email: c.var.user.email }));

  app.get('/purchases', async (c) => {
    const items = await scoped(c.env.DB, c.var.user.id).purchases.list();
    return c.json({ items });
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
