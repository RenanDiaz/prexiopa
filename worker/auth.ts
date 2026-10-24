import { createMiddleware } from 'hono/factory';
import { HTTPException } from 'hono/http-exception';
import { createRemoteJWKSet, jwtVerify, type JWTVerifyGetKey } from 'jose';
import { upsertUserByEmail, type User } from './db/users';

// Auth con Cloudflare Access (spec §6.2). Access protege todo el Worker; aquí
// validamos su JWT de todos modos para no confiar en que nadie lo saltó.

export type AppEnv = {
  Bindings: Env;
  Variables: { user: User };
};

export type AuthOptions = {
  /** Para tests: llaves locales en vez de los certs remotos del team. */
  getKey?: JWTVerifyGetKey;
};

const remoteKeySets = new Map<string, JWTVerifyGetKey>();

function keysFor(teamDomain: string): JWTVerifyGetKey {
  let keys = remoteKeySets.get(teamDomain);
  if (!keys) {
    keys = createRemoteJWKSet(new URL(`https://${teamDomain}/cdn-cgi/access/certs`));
    remoteKeySets.set(teamDomain, keys);
  }
  return keys;
}

async function emailFromAccessJwt(env: Env, token: string, options: AuthOptions): Promise<string> {
  const { ACCESS_TEAM_DOMAIN: team, ACCESS_AUD: aud } = env;
  // Fail closed: sin configuración no se acepta ningún token.
  if (!team || !aud) throw new HTTPException(500, { message: 'Access no está configurado' });

  try {
    const { payload } = await jwtVerify(token, options.getKey ?? keysFor(team), {
      issuer: `https://${team}`,
      audience: aud,
    });
    if (typeof payload.email !== 'string' || !payload.email) throw new Error('JWT sin email');
    return payload.email;
  } catch {
    throw new HTTPException(401, { message: 'Token de Access inválido' });
  }
}

export function accessAuth(options: AuthOptions = {}) {
  return createMiddleware<AppEnv>(async (c, next) => {
    let email: string;
    // El bypass de desarrollo solo existe con ENVIRONMENT=development explícito.
    if (c.env.ENVIRONMENT === 'development' && c.env.DEV_USER_EMAIL) {
      email = c.env.DEV_USER_EMAIL;
    } else {
      const token = c.req.header('Cf-Access-Jwt-Assertion');
      if (!token) throw new HTTPException(401, { message: 'Falta el token de Access' });
      email = await emailFromAccessJwt(c.env, token, options);
    }

    c.set('user', await upsertUserByEmail(c.env.DB, email.trim().toLowerCase()));
    await next();
  });
}
