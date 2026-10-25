import { describe, expect, it } from 'vitest';
import { summaryRepo } from '../worker/db/summary';
import { getDb } from '../worker/db/client';
import { env } from 'cloudflare:workers';
import { as, fakeDgi } from './helpers';
import cityMall from './fixtures/city-mall.html?raw';

const CITY_MALL_CUFE = 'FE01200001513069-1-650069-7700042026101700001475510240114502652914';

const send = (method: string, body?: unknown) => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: body === undefined ? undefined : JSON.stringify(body),
});

type Detail = {
  source: string;
  storeId: string;
  storeName: string;
  totalCents: number;
  lines: { description: string; quantity: number; quantitySource: string; lineTotalCents: number; productId: string | null }[];
};

describe('compra manual (F4)', () => {
  it('crea la tienda solo con nombre y guarda las líneas como Manual (CA4.1, CA4.2, CA4.4)', async () => {
    const user = as('manual@example.com');
    const res = await user(
      '/purchases/manual',
      send('POST', {
        store: { name: 'Chino de la esquina' },
        date: '2026-10-20',
        lines: [
          { description: 'Pan de molde', quantity: 1, lineTotalCents: 250 },
          { description: 'Huevos', quantity: 2, lineTotalCents: 380 },
        ],
      }),
    );
    expect(res.status).toBe(201);
    const { id } = await res.json<{ id: string }>();
    const detail = await (await user(`/purchases/${id}`)).json<Detail & { issuedAt: string }>();
    expect(detail).toMatchObject({ source: 'manual', storeName: 'Chino de la esquina', totalCents: 630 });
    expect(detail.issuedAt).toBe('2026-10-20T17:00:00.000Z');
    expect(detail.lines.map((line) => [line.description, line.quantity, line.quantitySource])).toEqual([
      ['Pan de molde', 1, 'user'],
      ['Huevos', 2, 'user'],
    ]);

    // La tienda aparece en el autocompletado y se reutiliza, igual que el ítem de texto libre.
    const stores = await (await user('/stores?q=chino')).json<{ items: { id: string; name: string }[] }>();
    expect(stores.items).toEqual([expect.objectContaining({ id: detail.storeId, name: 'Chino de la esquina' })]);
    const again = await user(
      '/purchases/manual',
      send('POST', { store: { id: detail.storeId }, lines: [{ description: 'pan de molde', quantity: 1, lineTotalCents: 260 }] }),
    );
    const second = await (await user(`/purchases/${(await again.json<{ id: string }>()).id}`)).json<Detail>();
    const history = await (await user('/catalog/search?q=pan%20molde')).json<{ results: unknown[] }>();
    expect(history.results).toHaveLength(1);
    expect(second.source).toBe('manual');

    const list = await (await user('/purchases')).json<{ items: { source: string }[] }>();
    expect(list.items.every((item) => item.source === 'manual')).toBe(true);
  });

  it('vincula un producto existente y un código escaneado por GTIN', async () => {
    const user = as('manual-gtin@example.com', fakeDgi(cityMall).options);
    await user('/purchases/cafe', send('POST', { input: CITY_MALL_CUFE }));
    const [sazonador] = (await (await user('/catalog/search?code=7411000222904')).json<{ results: { id: string }[] }>()).results;

    const res = await user(
      '/purchases/manual',
      send('POST', {
        store: { name: 'Minisúper Lupita' },
        lines: [
          { productId: sazonador!.id, description: 'McCormick sazonador', quantity: 1, lineTotalCents: 300 },
          { code: '7411000204221', description: 'Mostaza miel', quantity: 1, lineTotalCents: 275 },
        ],
      }),
    );
    expect(res.status).toBe(201);
    const detail = await (await user(`/purchases/${(await res.json<{ id: string }>()).id}`)).json<Detail>();
    const [first, second] = detail.lines;
    expect(first!.productId).toBe(sazonador!.id);
    expect(second!.productId).not.toBeNull(); // GTIN de la mostaza de CITY MALL

    const prices = await (await user(`/catalog/products/${sazonador!.id}`)).json<{ entries: { storeName: string; unitPriceCents: number }[] }>();
    expect(prices.entries.find((entry) => entry.storeName === 'Minisúper Lupita')?.unitPriceCents).toBe(300);
  });

  it.each([
    ['sin tienda', { lines: [{ description: 'x', quantity: 1, lineTotalCents: 1 }] }],
    ['sin líneas', { store: { name: 'X' }, lines: [] }],
    ['cantidad 0', { store: { name: 'X' }, lines: [{ description: 'x', quantity: 0, lineTotalCents: 1 }] }],
    ['total con decimales', { store: { name: 'X' }, lines: [{ description: 'x', quantity: 1, lineTotalCents: 1.5 }] }],
    ['fecha futura', { store: { name: 'X' }, date: '2999-01-01', lines: [{ description: 'x', quantity: 1, lineTotalCents: 1 }] }],
    ['tienda ajena', { store: { id: 'no-existe' }, lines: [{ description: 'x', quantity: 1, lineTotalCents: 1 }] }],
  ])('rechaza %s', async (_, body) => {
    expect((await as('manual-invalida@example.com')('/purchases/manual', send('POST', body))).status).toBe(400);
  });
});

describe('resumen mensual (F6)', () => {
  it('suma por mes en hora de Panamá y por tienda del mes actual (CA6.1)', async () => {
    const user = as('resumen@example.com');
    const buy = (date: string, cents: number, store = 'Tienda A') =>
      user('/purchases/manual', send('POST', { store: { name: store }, date, lines: [{ description: 'x', quantity: 1, lineTotalCents: cents }] }));
    await buy('2026-10-01', 1000);
    await buy('2026-10-15', 500, 'Tienda B');
    await buy('2026-09-30', 700);

    const userId = (await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind('resumen@example.com').first<{ id: string }>())!.id;
    // 2026-11-01T04:00Z todavía es 31 de octubre a las 23:00 en Panamá.
    const summary = await summaryRepo(getDb(env.DB), userId).monthly(new Date('2026-11-01T04:00:00Z'));
    expect(summary.currentMonth).toBe('2026-10');
    expect(summary.months).toHaveLength(12);
    expect(summary.months.at(-1)).toEqual({ month: '2026-10', totalCents: 1500, count: 2 });
    expect(summary.months.at(-2)).toEqual({ month: '2026-09', totalCents: 700, count: 1 });
    expect(summary.byStore.map((store) => [store.storeName, store.totalCents])).toEqual([
      ['Tienda A', 1000],
      ['Tienda B', 500],
    ]);

    const res = await user('/summary');
    expect(res.status).toBe(200);
  });
});
