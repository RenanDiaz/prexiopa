import { getDb } from './client';
import { users } from './schema';

export type User = { id: string; email: string };

/** Crea el usuario si no existe y lo devuelve. El email ya viene normalizado. */
export async function upsertUserByEmail(d1: D1Database, email: string): Promise<User> {
  const db = getDb(d1);
  const [user] = await db
    .insert(users)
    .values({ email })
    .onConflictDoUpdate({ target: users.email, set: { email } })
    .returning({ id: users.id, email: users.email });
  if (!user) throw new Error(`No se pudo crear el usuario ${email}`);
  return user;
}
