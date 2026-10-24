import { env } from 'cloudflare:workers';
import { testUtils } from 'better-auth/plugins';
import { createAuth } from '../worker/auth';
import { getDb } from '../worker/db/client';
import { purchaseLines, purchases, storeItems, stores } from '../worker/db/schema';
import { upsertUserByEmail } from '../worker/db/users';
import { createApp, type AppOptions } from '../worker/index';

export const ALLOWED = 'renan@example.com, familia@example.com';

export const prodEnv = (overrides: Partial<Env> = {}): Env => ({
  ...env,
  ENVIRONMENT: 'production',
  BETTER_AUTH_URL: 'https://prexiopa.test',
  BETTER_AUTH_SECRET: 'secreto-de-prueba-con-al-menos-32-caracteres',
  GOOGLE_CLIENT_ID: 'google-client-id',
  GOOGLE_CLIENT_SECRET: 'google-client-secret',
  ALLOWED_EMAILS: ALLOWED,
  DEV_USER_EMAIL: undefined,
  ...overrides,
});

export const devEnv = (email: string): Env => ({ ...env, ENVIRONMENT: 'development', DEV_USER_EMAIL: email });

/**
 * Crea un usuario de Better Auth con una sesión abierta y devuelve los headers
 * (cookie firmada) para usarla. Evita pasar por Google en los tests.
 */
export async function sessionHeaders(email: string, envOverrides: Partial<Env> = {}): Promise<Headers> {
  const auth = createAuth(prodEnv(envOverrides), { plugins: [testUtils()] });
  const { test, internalAdapter } = await auth.$context;
  // El almacenamiento D1 se comparte entre tests: se reutiliza el usuario si ya existe.
  const existing = await internalAdapter.findUserByEmail(email);
  const user = existing?.user ?? (await test.saveUser(test.createUser({ email, name: 'Prueba' })));
  return test.getAuthHeaders({ userId: user.id });
}

/** App con bypass de desarrollo: cada request actúa como `email`. */
export function as(email: string, options: AppOptions = {}) {
  const app = createApp(options);
  return (path: string, init?: RequestInit) => app.request(`/api${path}`, init, devEnv(email));
}

let rucSeq = 0;

function one<T>(rows: T[]): T {
  const [row] = rows;
  if (!row) throw new Error('El insert no devolvió filas');
  return row;
}

export async function seedPurchase(email: string) {
  const db = getDb(env.DB);
  const user = await upsertUserByEmail(env.DB, email);
  const seq = ++rucSeq;
  const store = one(
    await db.insert(stores).values({ ruc: `TEST-${seq}`, legalName: 'Tienda de Prueba, S.A.' }).returning(),
  );
  const item = one(
    await db
      .insert(storeItems)
      .values({ userId: user.id, storeId: store.id, code: '7411000222904', description: 'MC C SAZO148ML' })
      .returning(),
  );
  const purchase = one(
    await db
      .insert(purchases)
      .values({
        userId: user.id,
        storeId: store.id,
        source: 'cafe',
        cufe: `FE-TEST-${seq}`,
        issuedAt: '2026-10-16T00:00:00.000Z',
        subtotalCents: 260,
        totalCents: 260,
      })
      .returning(),
  );
  await db.insert(purchaseLines).values({
    purchaseId: purchase.id,
    lineNo: 1,
    storeItemId: item.id,
    description: item.description,
    quantity: 1,
    listPriceCents: 260,
    lineTotalCents: 260,
  });
  return { user, purchase };
}

/** DGI falsa: responde con `html` (o con `status`) y cuenta las llamadas. */
export function fakeDgi(html: string, status = 200) {
  const calls: string[] = [];
  const fetch = async (url: string) => {
    calls.push(url);
    return new Response(html, { status });
  };
  return { calls, options: { dgi: { fetch, retries: 0 } } satisfies AppOptions };
}
