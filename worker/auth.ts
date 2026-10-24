import { betterAuth, type BetterAuthPlugin } from 'better-auth';
import { APIError } from 'better-auth/api';
import { createMiddleware } from 'hono/factory';
import { HTTPException } from 'hono/http-exception';
import { authAdapter } from './db/auth-adapter';
import { upsertUserByEmail, type User } from './db/users';
import { newId } from './lib/id';

// Auth con Better Auth + Google (spec §6.2). Better Auth guarda sus sesiones en
// las tablas auth_*; la app sigue identificando al usuario por email en `users`.

export type AppEnv = {
  Bindings: Env;
  Variables: { user: User };
};

export type AuthOptions<Plugins extends BetterAuthPlugin[] = BetterAuthPlugin[]> = {
  /** Para tests: plugins extra, p. ej. `testUtils()` para crear sesiones. */
  plugins?: Plugins;
};

const normalizeEmail = (email: string) => email.trim().toLowerCase();

/** ALLOWED_EMAILS es una lista separada por comas. Vacía = nadie entra. */
export function isAllowedEmail(env: Env, email: string): boolean {
  const allowed = (env.ALLOWED_EMAILS ?? '').split(',').map(normalizeEmail).filter(Boolean);
  return allowed.includes(normalizeEmail(email));
}

export function createAuth<Plugins extends BetterAuthPlugin[] = []>(env: Env, options: AuthOptions<Plugins> = {}) {
  const {
    BETTER_AUTH_URL: baseURL,
    BETTER_AUTH_SECRET: secret,
    GOOGLE_CLIENT_ID: clientId,
    GOOGLE_CLIENT_SECRET: clientSecret,
  } = env;
  // Fail closed: sin configuración no se acepta ninguna sesión.
  if (!baseURL || !secret || !clientId || !clientSecret) {
    throw new HTTPException(500, { message: 'Auth no está configurado' });
  }

  return betterAuth({
    baseURL,
    basePath: '/api/auth',
    secret,
    database: authAdapter(env.DB),
    socialProviders: {
      google: { clientId, clientSecret, prompt: 'select_account' },
    },
    advanced: { database: { generateId: () => newId() } },
    // Los errores del login (p. ej. correo sin acceso) vuelven a la SPA con ?error=.
    onAPIError: { errorURL: '/' },
    databaseHooks: {
      user: {
        create: {
          // Solo se registran los correos de ALLOWED_EMAILS (spec D2).
          before: async (user) => {
            if (!isAllowedEmail(env, user.email)) {
              throw new APIError('FORBIDDEN', { message: 'Este correo no tiene acceso a Prexiopá' });
            }
          },
        },
      },
    },
    plugins: options.plugins ?? ([] as unknown as Plugins),
  });
}

export function sessionAuth(options: AuthOptions = {}) {
  return createMiddleware<AppEnv>(async (c, next) => {
    let email: string;
    // El bypass de desarrollo solo existe con ENVIRONMENT=development explícito.
    if (c.env.ENVIRONMENT === 'development' && c.env.DEV_USER_EMAIL) {
      email = c.env.DEV_USER_EMAIL;
    } else {
      const session = await createAuth(c.env, options).api.getSession({ headers: c.req.raw.headers });
      if (!session) throw new HTTPException(401, { message: 'Inicia sesión para continuar' });
      email = session.user.email;
      // Quitar un correo de ALLOWED_EMAILS corta también las sesiones abiertas.
      if (!isAllowedEmail(c.env, email)) throw new HTTPException(403, { message: 'Este correo no tiene acceso' });
    }

    c.set('user', await upsertUserByEmail(c.env.DB, normalizeEmail(email)));
    await next();
  });
}
