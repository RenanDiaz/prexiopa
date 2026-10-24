import { env } from 'cloudflare:workers';
import { describe, expect, it } from 'vitest';
import { as, fakeDgi, seedPurchase } from './helpers';
import oneLine from './fixtures/don-antonio-1-linea.html?raw';

const CUFE = 'FE0120000000541-81-118009-0610192025120300001102620310312027507502';
const post = (input: string) => ({
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ input }),
});

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

  it('POST /purchases/cafe: la misma factura importada por otro usuario es una compra aparte', async () => {
    const dgi = fakeDgi(oneLine);
    const carla = await (await as('carla@example.com', dgi.options)('/purchases/cafe', post(CUFE))).json<{ id: string }>();

    const dani = as('dani@example.com', dgi.options);
    const preview = await (await dani('/purchases/cafe/preview', post(CUFE))).json<{ existingPurchaseId: string | null }>();
    expect(preview.existingPurchaseId).toBeNull();

    const res = await dani('/purchases/cafe', post(CUFE));
    expect(res.status).toBe(201);
    const daniPurchase = await res.json<{ id: string }>();
    expect(daniPurchase.id).not.toBe(carla.id);

    expect((await dani(`/purchases/${carla.id}`)).status).toBe(404);
    const store_items = await env.DB.prepare(
      "SELECT COUNT(DISTINCT user_id) AS n FROM store_items WHERE code = '8964613281'",
    ).first<{ n: number }>();
    expect(store_items?.n).toBe(2);
  });
});
