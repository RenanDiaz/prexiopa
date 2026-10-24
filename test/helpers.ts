import { env } from 'cloudflare:workers';
import { createLocalJWKSet, exportJWK, generateKeyPair, SignJWT } from 'jose';
import { getDb } from '../worker/db/client';
import { purchaseLines, purchases, storeItems, stores } from '../worker/db/schema';
import { upsertUserByEmail } from '../worker/db/users';
import { createApp } from '../worker/index';

export const TEAM = 'prexiopa-test.cloudflareaccess.com';
export const AUD = 'test-aud';

export const prodEnv = (overrides: Partial<Env> = {}): Env => ({
  ...env,
  ENVIRONMENT: 'production',
  ACCESS_TEAM_DOMAIN: TEAM,
  ACCESS_AUD: AUD,
  DEV_USER_EMAIL: undefined,
  ...overrides,
});

export const devEnv = (email: string): Env => ({ ...env, ENVIRONMENT: 'development', DEV_USER_EMAIL: email });

/** Llaves locales que imitan los certs de Cloudflare Access. */
export async function accessKeys() {
  const { privateKey, publicKey } = await generateKeyPair('RS256');
  const jwk = { ...(await exportJWK(publicKey)), kid: 'test', alg: 'RS256' };
  const getKey = createLocalJWKSet({ keys: [jwk] });

  const sign = (claims: { email?: string; aud?: string; iss?: string; exp?: string } = {}) => {
    const jwt = new SignJWT(claims.email === undefined ? {} : { email: claims.email })
      .setProtectedHeader({ alg: 'RS256', kid: 'test' })
      .setIssuer(claims.iss ?? `https://${TEAM}`)
      .setAudience(claims.aud ?? AUD)
      .setIssuedAt()
      .setExpirationTime(claims.exp ?? '5m');
    return jwt.sign(privateKey);
  };

  return { getKey, sign, app: createApp({ getKey }) };
}

/** App con bypass de desarrollo: cada request actúa como `email`. */
export function as(email: string) {
  const app = createApp();
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
