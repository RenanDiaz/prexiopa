import { env } from 'cloudflare:workers';
import { describe, expect, it } from 'vitest';
import { gtinCheckDigit } from '../worker/cafe/codes';
import { as } from './helpers';

// CA5.7 — agregar el código de barras a un producto o ítem ya creados.
// La BD de tests se comparte entre casos: cada caso usa su propio usuario.

const gtin = (body: string) => `${body}${gtinCheckDigit(body)}`;
const CODE_A = gtin('750105530001'); // GTIN-13 con dígito verificador válido
const CODE_B = gtin('750105530002');

const send = (method: string, body?: unknown) => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: body === undefined ? undefined : JSON.stringify(body),
});

type Api = ReturnType<typeof as>;

/** Compra manual con una línea de texto libre: deja un ítem sin código ni producto. */
async function freeTextItem(user: Api, description: string, store = 'Chino de la esquina') {
  const res = await user(
    '/purchases/manual',
    send('POST', { store: { name: store }, lines: [{ description, quantity: 1, lineTotalCents: 250 }] }),
  );
  const { id } = await res.json<{ id: string }>();
  const detail = await (await user(`/purchases/${id}`)).json<{ lines: { storeItemId: string }[] }>();
  return detail.lines[0]!.storeItemId;
}

const putBarcode = (user: Api, kind: 'items' | 'products', id: string, code: string) =>
  user(`/catalog/${kind}/${id}/barcode`, send('PUT', { code }));

const productRow = (id: string) =>
  env.DB.prepare('SELECT gtin, name FROM products WHERE id = ?').bind(id).first<{ gtin: string | null; name: string }>();

describe('PUT /api/catalog/items/:id/barcode (CA5.7)', () => {
  it('crea el producto con ese GTIN, vincula el ítem y ya se encuentra al escanear', async () => {
    const user = as('barras-item@example.com');
    const itemId = await freeTextItem(user, 'Leche Estrella 1L');

    const res = await putBarcode(user, 'items', itemId, CODE_A);
    expect(res.status).toBe(200);
    const { productId } = await res.json<{ productId: string }>();
    expect(await productRow(productId)).toEqual({ gtin: CODE_A, name: 'Leche Estrella 1L' });

    const item = await env.DB.prepare('SELECT product_id, link_source, code FROM store_items WHERE id = ?')
      .bind(itemId)
      .first<{ product_id: string; link_source: string; code: string | null }>();
    expect(item).toEqual({ product_id: productId, link_source: 'user', code: null }); // no toca el código de la tienda

    const found = await (await user(`/catalog/search?code=${CODE_A}`)).json<{ results: { kind: string; id: string }[] }>();
    expect(found.results).toEqual([expect.objectContaining({ kind: 'product', id: productId })]);
  });

  it('rechaza un código con dígito verificador inválido o de peso variable sin cambiar nada', async () => {
    const user = as('barras-invalido@example.com');
    const itemId = await freeTextItem(user, 'Arroz 5 lb');
    const badCheck = `${CODE_A.slice(0, -1)}${(Number(CODE_A.at(-1)) + 1) % 10}`;
    const weighed = gtin('200000000001');

    for (const code of [badCheck, weighed, '12345', 'abc']) {
      const res = await putBarcode(user, 'items', itemId, code);
      expect(res.status).toBe(400);
      expect(await res.json()).toMatchObject({ code: 'invalid_code' });
    }
    const item = await env.DB.prepare('SELECT product_id FROM store_items WHERE id = ?')
      .bind(itemId)
      .first<{ product_id: string | null }>();
    expect(item?.product_id).toBeNull();
  });

  it('vincula el ítem al producto que ya tiene ese código en vez de crear otro', async () => {
    const user = as('barras-existente@example.com');
    const first = await freeTextItem(user, 'Leche Estrella 1L', 'Tienda A');
    const { productId } = await (await putBarcode(user, 'items', first, CODE_A)).json<{ productId: string }>();

    const second = await freeTextItem(user, 'LCH EST AZ 1L', 'Tienda B');
    const res = await putBarcode(user, 'items', second, CODE_A);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ productId });

    const { n } = (await env.DB.prepare('SELECT COUNT(*) AS n FROM store_items WHERE product_id = ?')
      .bind(productId)
      .first<{ n: number }>())!;
    expect(n).toBe(2);
  });

  it('un ítem que ya tiene producto sin código lo recibe en el producto', async () => {
    const user = as('barras-producto-sin-codigo@example.com');
    const itemId = await freeTextItem(user, 'Pan de molde');
    const { productId } = await (
      await user(`/catalog/items/${itemId}`, send('PATCH', { name: 'Pan de molde Bimbo' }))
    ).json<{ productId: string }>();
    expect((await productRow(productId))?.gtin).toBeNull();

    const res = await putBarcode(user, 'items', itemId, CODE_B);
    expect(await res.json()).toEqual({ productId });
    expect((await productRow(productId))?.gtin).toBe(CODE_B);
  });

  it('devuelve 404 para un ítem inexistente', async () => {
    const res = await putBarcode(as('barras-404@example.com'), 'items', 'no-existe', CODE_A);
    expect(res.status).toBe(404);
  });
});

describe('PUT /api/catalog/products/:id/barcode (CA5.7)', () => {
  async function productWithoutCode(user: Api, description: string) {
    const itemId = await freeTextItem(user, description);
    const { productId } = await (
      await user(`/catalog/items/${itemId}`, send('PATCH', { name: description }))
    ).json<{ productId: string }>();
    return productId;
  }

  it('agrega el GTIN a un producto que no tiene', async () => {
    const user = as('barras-prod@example.com');
    const productId = await productWithoutCode(user, 'Galletas Saltinas');

    expect((await putBarcode(user, 'products', productId, CODE_A)).status).toBe(200);
    expect((await productRow(productId))?.gtin).toBe(CODE_A);
    // Repetir el mismo código es inocuo.
    expect((await putBarcode(user, 'products', productId, CODE_A)).status).toBe(200);
  });

  it('responde 409 si el producto ya tiene otro código', async () => {
    const user = as('barras-tiene@example.com');
    const productId = await productWithoutCode(user, 'Atún Van Camps');
    await putBarcode(user, 'products', productId, CODE_A);

    const res = await putBarcode(user, 'products', productId, CODE_B);
    expect(res.status).toBe(409);
    expect(await res.json()).toMatchObject({ code: 'has_code' });
    expect((await productRow(productId))?.gtin).toBe(CODE_A);
  });

  it('responde 409 con el producto dueño si el código ya es de otro, sin fusionar', async () => {
    const user = as('barras-en-uso@example.com');
    const owner = await productWithoutCode(user, 'Leche Estrella 1L');
    await putBarcode(user, 'products', owner, CODE_A);
    const other = await productWithoutCode(user, 'LCH EST AZ 1L');

    const res = await putBarcode(user, 'products', other, CODE_A);
    expect(res.status).toBe(409);
    expect(await res.json()).toMatchObject({ code: 'in_use', productId: owner, name: 'Leche Estrella 1L' });
    expect((await productRow(other))?.gtin).toBeNull();
  });
});
