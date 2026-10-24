import { env } from 'cloudflare:workers';
import { describe, expect, it } from 'vitest';
import { as, seedPurchase } from './helpers';

// Spec §6.4: D1 no tiene RLS. Cada endpoint con datos de usuario debe tener
// aquí un caso que pruebe que otro usuario no puede leerlo, cambiarlo ni borrarlo.

describe('aislamiento entre usuarios', () => {
  it('GET /purchases solo lista las compras propias', async () => {
    const { purchase } = await seedPurchase('ana@example.com');

    const own = await (await as('ana@example.com')('/purchases')).json<{ items: { id: string }[] }>();
    expect(own.items.map((p) => p.id)).toEqual([purchase.id]);

    const other = await (await as('beto@example.com')('/purchases')).json<{ items: unknown[] }>();
    expect(other.items).toEqual([]);
  });

  it('GET /purchases/:id devuelve 404 para compras ajenas', async () => {
    const { purchase } = await seedPurchase('ana@example.com');

    expect((await as('beto@example.com')(`/purchases/${purchase.id}`)).status).toBe(404);

    const res = await as('ana@example.com')(`/purchases/${purchase.id}`);
    expect(res.status).toBe(200);
    const body = await res.json<{ id: string; lines: unknown[]; userId?: string; rawJson?: string }>();
    expect(body.id).toBe(purchase.id);
    expect(body.lines).toHaveLength(1);
    expect(body).not.toHaveProperty('userId');
    expect(body).not.toHaveProperty('rawJson');
  });

  it('DELETE /purchases/:id no borra compras ajenas', async () => {
    const { purchase } = await seedPurchase('ana@example.com');

    expect((await as('beto@example.com')(`/purchases/${purchase.id}`, { method: 'DELETE' })).status).toBe(404);
    const stillThere = await env.DB.prepare('SELECT id FROM purchases WHERE id = ?').bind(purchase.id).first();
    expect(stillThere).not.toBeNull();

    expect((await as('ana@example.com')(`/purchases/${purchase.id}`, { method: 'DELETE' })).status).toBe(204);
    const lines = await env.DB.prepare('SELECT COUNT(*) AS n FROM purchase_lines WHERE purchase_id = ?')
      .bind(purchase.id)
      .first<{ n: number }>();
    expect(lines?.n).toBe(0);
  });
});
