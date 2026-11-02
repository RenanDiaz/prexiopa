import { describe, expect, it } from 'vitest';
import { as, fakeDgi } from './helpers';
import withDiscounts from './fixtures/don-antonio-descuentos.html?raw';

// CA3.6 — encontrar un pesable escaneando la etiqueta de balanza.

const DISCOUNTS_CUFE = 'FE0120000000541-81-118009-0610192025112400001055650310311336416413';

const send = (method: string, body?: unknown) => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: body === undefined ? undefined : JSON.stringify(body),
});

type Result = { kind: string; id: string; name: string };
const searchCode = async (user: ReturnType<typeof as>, code: string) =>
  (await (await user(`/catalog/search?code=${code}`)).json<{ results: Result[] }>()).results;

describe('GET /api/catalog/search?code= con etiqueta de balanza (CA3.6)', () => {
  it('PriceSmart: la etiqueta 2 086621 … encuentra el ítem con código 86621', async () => {
    const user = as('etiqueta-pricesmart@example.com');
    await user(
      '/purchases/manual',
      send('POST', {
        store: { name: 'PriceSmart David' },
        lines: [{ description: 'Chuleta ahumada', code: '86621', quantity: 1, lineTotalCents: 1279 }],
      }),
    );

    for (const label of ['2086621015065', '2086621000005']) {
      expect(await searchCode(user, label)).toEqual([expect.objectContaining({ name: 'Chuleta ahumada' })]);
    }
    expect(await searchCode(user, '2086622015065')).toEqual([]);
  });

  it('Don Antonio: la etiqueta UPC-A encuentra el ítem que la factura trae con el precio en ceros', async () => {
    const user = as('etiqueta-donantonio@example.com', fakeDgi(withDiscounts).options);
    expect((await user('/purchases/cafe', send('POST', { input: DISCOUNTS_CUFE }))).status).toBe(201);

    const results = await searchCode(user, '0207865012345');
    expect(results).toEqual([expect.objectContaining({ name: expect.stringMatching(/DON PEDRO MOZZAREL/i) })]);
  });

  it('CA5.7 rechaza guardar la etiqueta como código de barras, explicando por qué', async () => {
    const user = as('etiqueta-barcode@example.com');
    const res = await user(
      '/purchases/manual',
      send('POST', { store: { name: 'PriceSmart David' }, lines: [{ description: 'Filete', quantity: 1, lineTotalCents: 963 }] }),
    );
    const { id } = await res.json<{ id: string }>();
    const { lines } = await (await user(`/purchases/${id}`)).json<{ lines: { storeItemId: string }[] }>();

    const put = await user(`/catalog/items/${lines[0]!.storeItemId}/barcode`, send('PUT', { code: '2497289000006' }));
    expect(put.status).toBe(400);
    expect(await put.json()).toMatchObject({ code: 'scale_label' });
  });
});
