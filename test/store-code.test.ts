import { env } from 'cloudflare:workers';
import { describe, expect, it } from 'vitest';
import { as, fakeDgi } from './helpers';
import oneLine from './fixtures/don-antonio-1-linea.html?raw';

// CA4.6 y CA5.8 — código interno de tienda en ítems de compras manuales.
// La BD de tests se comparte entre casos: cada caso usa su propio usuario.

const ONE_LINE_CUFE = 'FE0120000000541-81-118009-0610192025120300001102620310312027507502';

const send = (method: string, body?: unknown) => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: body === undefined ? undefined : JSON.stringify(body),
});

type Api = ReturnType<typeof as>;
type Line = { productId?: string; code?: string; description: string; quantity: number; lineTotalCents: number };

async function manualPurchase(user: Api, store: { name: string } | { id: string }, lines: Line[]) {
  return user('/purchases/manual', send('POST', { store, lines }));
}

async function purchaseLines(user: Api, purchaseId: string) {
  const detail = await (await user(`/purchases/${purchaseId}`)).json<{
    storeId: string;
    lines: { storeItemId: string; productId: string | null }[];
  }>();
  return detail;
}

const line = (description: string, extra: Partial<Line> = {}): Line => ({
  description,
  quantity: 1,
  lineTotalCents: 250,
  ...extra,
});

const itemRow = (id: string) =>
  env.DB.prepare('SELECT code, product_id FROM store_items WHERE id = ?')
    .bind(id)
    .first<{ code: string | null; product_id: string | null }>();

const putCode = (user: Api, itemId: string, code: string | null) =>
  user(`/catalog/items/${itemId}/code`, send('PUT', { code }));

/** Ítem de texto libre (sin código ni producto) en una tienda manual nueva. */
async function freeTextItem(user: Api, description: string, store = 'Chino de la esquina') {
  const { id } = await (await manualPurchase(user, { name: store }, [line(description)])).json<{ id: string }>();
  const detail = await purchaseLines(user, id);
  return { itemId: detail.lines[0]!.storeItemId, storeId: detail.storeId };
}

describe('PUT /api/catalog/items/:id/code (CA5.8)', () => {
  it('agrega, cambia y quita el código de un ítem manual, y se muestra como editable', async () => {
    const user = as('codigo-manual@example.com');
    const { itemId } = await freeTextItem(user, 'Pan de molde');

    expect((await putCode(user, itemId, ' 4011 ')).status).toBe(204);
    expect((await itemRow(itemId))?.code).toBe('4011');

    const history = await (await user(`/catalog/items/${itemId}`)).json<{
      items: { id: string; code: string | null; codeEditable: boolean }[];
    }>();
    expect(history.items).toEqual([expect.objectContaining({ id: itemId, code: '4011', codeEditable: true })]);

    expect((await putCode(user, itemId, '123456')).status).toBe(204);
    expect((await itemRow(itemId))?.code).toBe('123456');
    // Códigos cortos de la tienda (p. ej. de 3 dígitos) también valen.
    expect((await putCode(user, itemId, '123')).status).toBe(204);
    expect((await itemRow(itemId))?.code).toBe('123');
    expect((await putCode(user, itemId, null)).status).toBe(204);
    expect((await itemRow(itemId))?.code).toBeNull();
  });

  it('un código corto en un ítem manual no lo marca como pesable', async () => {
    const user = as('codigo-corto@example.com');
    const { itemId } = await freeTextItem(user, 'Empanada');
    expect((await putCode(user, itemId, '480')).status).toBe(204);
    const row = await env.DB.prepare('SELECT code, is_weighed FROM store_items WHERE id = ?')
      .bind(itemId)
      .first<{ code: string; is_weighed: number }>();
    expect(row).toEqual({ code: '480', is_weighed: 0 });
  });

  it('rechaza códigos que no son de 1 a 14 dígitos', async () => {
    const user = as('codigo-invalido@example.com');
    const { itemId } = await freeTextItem(user, 'Galletas');
    for (const code of ['ABC123', '12-3', '123456789012345']) {
      const res = await putCode(user, itemId, code);
      expect(res.status).toBe(400);
      expect(await res.json()).toMatchObject({ code: 'invalid_code' });
    }
    expect((await itemRow(itemId))?.code).toBeNull();
  });

  it('no deja repetir el código de otro ítem de la misma tienda', async () => {
    const user = as('codigo-repetido@example.com');
    const { id } = await (
      await manualPurchase(user, { name: 'Abarrotería' }, [line('Pan'), line('Leche')])
    ).json<{ id: string }>();
    const [pan, leche] = (await purchaseLines(user, id)).lines;
    expect((await putCode(user, pan!.storeItemId, '4011')).status).toBe(204);

    const res = await putCode(user, leche!.storeItemId, '4011');
    expect(res.status).toBe(409);
    expect(await res.json()).toMatchObject({ code: 'in_use', itemId: pan!.storeItemId, name: 'Pan' });
    expect((await itemRow(leche!.storeItemId))?.code).toBeNull();
  });

  it('no cambia el código de un ítem que viene de una factura', async () => {
    const dgi = fakeDgi(oneLine);
    const user = as('codigo-factura@example.com', dgi.options);
    const saved = await user('/purchases/cafe', send('POST', { input: ONE_LINE_CUFE }));
    const { id } = await saved.json<{ id: string }>();
    const itemId = (await purchaseLines(user, id)).lines[0]!.storeItemId;
    const before = (await itemRow(itemId))?.code;

    const history = await (await user(`/catalog/items/${itemId}`)).json<
      { items: { codeEditable: boolean }[] } | { redirectTo: { productId: string } }
    >();
    const shown =
      'redirectTo' in history
        ? await (await user(`/catalog/products/${history.redirectTo.productId}`)).json<{ items: { codeEditable: boolean }[] }>()
        : history;
    expect(shown.items.every((item) => !item.codeEditable)).toBe(true);

    const res = await putCode(user, itemId, '4011');
    expect(res.status).toBe(409);
    expect(await res.json()).toMatchObject({ code: 'from_invoice' });
    expect((await itemRow(itemId))?.code).toBe(before);
  });

  it('un código que es GTIN vincula el ítem como al importar (CA5.3)', async () => {
    const user = as('codigo-gtin@example.com');
    const { itemId } = await freeTextItem(user, 'Leche Estrella 1L');
    expect((await putCode(user, itemId, '7501055300013')).status).toBe(204);
    expect((await itemRow(itemId))?.product_id).not.toBeNull();
  });
});

describe('POST /api/purchases/manual con código para un producto existente (CA4.6)', () => {
  /** Producto existente: un ítem de texto libre renombrado (como lo hace el buscador de la compra manual). */
  async function existingProduct(user: Api, store: string) {
    const { itemId, storeId } = await freeTextItem(user, 'Pan de molde', store);
    const { productId } = await (await user(`/catalog/items/${itemId}`, send('PATCH', { name: 'Pan de molde' }))).json<{
      productId: string;
    }>();
    return { itemId, storeId, productId };
  }

  it('escribe el código en el ítem existente de esa tienda', async () => {
    const user = as('linea-codigo@example.com');
    const { itemId, storeId, productId } = await existingProduct(user, 'Tienda A');

    const res = await manualPurchase(user, { id: storeId }, [line('Pan de molde', { productId, code: '4011' })]);
    expect(res.status).toBe(201);
    const { id } = await res.json<{ id: string }>();
    expect((await purchaseLines(user, id)).lines[0]!.storeItemId).toBe(itemId);
    expect(await itemRow(itemId)).toEqual({ code: '4011', product_id: productId });
  });

  it('crea el ítem con el código en una tienda donde el producto no estaba', async () => {
    const user = as('linea-codigo-nueva@example.com');
    const { productId } = await existingProduct(user, 'Tienda A');

    const res = await manualPurchase(user, { name: 'Tienda B' }, [line('Pan de molde', { productId, code: '4011' })]);
    expect(res.status).toBe(201);
    const { id } = await res.json<{ id: string }>();
    const newItem = (await purchaseLines(user, id)).lines[0]!.storeItemId;
    expect(await itemRow(newItem)).toEqual({ code: '4011', product_id: productId });
  });

  it('rechaza un código que ya es de otro ítem de la tienda, o si el ítem ya tiene otro código', async () => {
    const user = as('linea-codigo-choque@example.com');
    const { itemId, storeId, productId } = await existingProduct(user, 'Tienda A');
    await manualPurchase(user, { id: storeId }, [line('Leche', { code: '5000' })]);

    const taken = await manualPurchase(user, { id: storeId }, [line('Pan de molde', { productId, code: '5000' })]);
    expect(taken.status).toBe(400);
    expect(await taken.json()).toMatchObject({ error: expect.stringContaining('Leche') });

    expect((await putCode(user, itemId, '4011')).status).toBe(204);
    const other = await manualPurchase(user, { id: storeId }, [line('Pan de molde', { productId, code: '4012' })]);
    expect(other.status).toBe(400);
    expect((await itemRow(itemId))?.code).toBe('4011');
  });

  it('rechaza el mismo código en dos productos distintos de la misma compra', async () => {
    const user = as('linea-codigo-doble@example.com');
    const res = await manualPurchase(user, { name: 'Tienda C' }, [
      line('Pan', { code: '4011' }),
      line('Leche', { code: '4011' }),
    ]);
    expect(res.status).toBe(400);
  });
});
