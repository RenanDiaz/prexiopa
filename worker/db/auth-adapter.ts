import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { getDb } from './client';
import { authAccounts, authSessions, authUsers, authVerifications } from './schema';

// Better Auth solo toca sus propias tablas (auth_*), nunca los datos del usuario.
export function authAdapter(d1: D1Database) {
  return drizzleAdapter(getDb(d1), {
    provider: 'sqlite',
    schema: {
      user: authUsers,
      session: authSessions,
      account: authAccounts,
      verification: authVerifications,
    },
  });
}
