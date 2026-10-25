import { env } from 'cloudflare:workers';
import { describe, expect, it } from 'vitest';
import { as, fakeDgi } from './helpers';
import cityMall from './fixtures/city-mall.html?raw';
import oneLine from './fixtures/don-antonio-1-linea.html?raw';
import withDiscounts from './fixtures/don-antonio-descuentos.html?raw';

// F3, F5 y §10.6. La BD de tests se comparte entre casos: cada caso usa su propio usuario.

const ONE_LINE_CUFE = 'FE0120000000541-81-118009-0610192025120300001102620310312027507502';
const DISCOUNTS_CUFE = 'FE0120000000541-81-118009-0610192025112400001055650310311336416413';
const CITY_MALL_CUFE = 'FE01200001513069-1-650069-7700042026101700001475510240114502652914';

/**
 * Variante de la factura de una línea de Don Antonio: otro CUFE (cambia el último
 * dígito del bloque de 13), y opcionalmente otro código, descripción o múltiplo del monto.
 */
function variant(suffix: string, options: { code?: string; description?: string; units?: number } = {}) {
  const cufe = ONE_LINE_CUFE.replace('0000110262031', `000011026203${suffix}`);
  let html = oneLine.replaceAll(ONE_LINE_CUFE, cufe);
  if (options.code) html = html.replace('>8964613281<', `>${options.code}<`);
  if (options.description) html = html.replace('>ATLAS LATA 355 ML<', `>${options.description}<`);
  if (options.units) {
    const money = (cents: number) => (cents * options.units! / 100).toFixed(2);
    html = html.replaceAll('4.62', money(462)).replaceAll('4.20', money(420)).replaceAll('0.42', money(42));
  }
  return { cufe, html };
}

const send = (method: string, body?: unknown) => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: body === undefined ? undefined : JSON.stringify(body),
});

type Line = { id: string; description: string; quantity: number; quantitySource: string; storeItemId: string; productId: string | null };
type Detail = { storeId: string; storeName: string; storeQuantities: string; lines: Line[] };
type Entry = { storeName: string; quantity: number; quantitySource: string; unitPriceCents: number | null; lineTotalCents: number; unit: string };
type History = { kind: string; id: string; name: string; entries: Entry[]; items: { id: string; storeName: string }[]; last: Entry | null };
type Result = { kind: 'product' | 'item'; id: string; name: string; storeNames: string[] };

function user(email: string) {
  const call = (path: string, init?: RequestInit, html = oneLine) => as(email, fakeDgi(html).options)(path, init);
  return {
    call,
    async importInvoice(html: string, cufe: string): Promise<Detail> {
      const res = await call('/purchases/cafe', send('POST', { input: cufe }), html);
      expect([200, 201]).toContain(res.status);
      const { id } = await res.json<{ id: string }>();
      return (await call(`/purchases/${id}`)).json<Detail>();
    },
    async search(query: string): Promise<Result[]> {
      return (await (await call(`/catalog/search?${query}`)).json<{ results: Result[] }>()).results;
    },
    async history(kind: 'products' | 'items', id: string): Promise<History> {
      return (await call(`/catalog/${kind}/${id}`)).json<History>();
    },
  };
}

describe('cantidades no confiables (§10.6)', () => {
  it('marca a Don Antonio como always_one y a CITY MALL como reliable', async () => {
    const u = user('detecta@example.com');
    const donAntonio = await u.importInvoice(withDiscounts, DISCOUNTS_CUFE);
    expect(donAntonio.storeQuantities).toBe('always_one');
    const city = await u.importInvoice(cityMall, CITY_MALL_CUFE);
    expect(city.storeQuantities).toBe('reliable');
  });

  it('sin precio unitario conocido no infiere y muestra el precio de la línea', async () => {
    const u = user('sin-referencia@example.com');
    await u.importInvoice(withDiscounts, DISCOUNTS_CUFE);
    const detail = await u.importInvoice(oneLine, ONE_LINE_CUFE);
    const line = detail.lines[0]!;
    expect(line).toMatchObject({ quantity: 1, quantitySource: 'invoice' });

    const history = await u.history('products', line.productId!);
    expect(history.entries[0]).toMatchObject({ unitPriceCents: null, lineTotalCents: 462 });
  });

  it('una corrección del usuario permite inferir las unidades de otras compras (CA5.5, CA5.6)', async () => {
    const u = user('infiere@example.com');
    await u.importInvoice(withDiscounts, DISCOUNTS_CUFE);
    const single = await u.importInvoice(oneLine, ONE_LINE_CUFE);
    const double = variant('2', { units: 2 });
    const twice = await u.importInvoice(double.html, double.cufe);
    expect(twice.lines[0]).toMatchObject({ quantity: 1, quantitySource: 'invoice' });

    // El usuario confirma que la primera compra fue de 1 unidad.
    const res = await u.call(`/purchase-lines/${single.lines[0]!.id}`, send('PATCH', { quantity: 1 }));
    expect(res.status).toBe(204);

    const history = await u.history('products', single.lines[0]!.productId!);
    // Las dos compras tienen la misma fecha: se compara sin orden.
    const sources = history.entries.map((entry) => `${entry.quantitySource}:${entry.quantity}:${entry.unitPriceCents}`);
    expect(sources.sort()).toEqual(['inferred:2:462', 'user:1:462']);

    // Una compra nueva se infiere al importarla.
    const triple = variant('3', { units: 3 });
    const thrice = await u.importInvoice(triple.html, triple.cufe);
    expect(thrice.lines[0]).toMatchObject({ quantity: 3, quantitySource: 'inferred' });
  });

  it('no infiere pesables y acepta peso como cantidad', async () => {
    const u = user('pesables@example.com');
    const detail = await u.importInvoice(withDiscounts, DISCOUNTS_CUFE);
    const cheese = detail.lines.find((line) => line.description === 'DON PEDRO MOZZAREL')!;
    expect(cheese.quantitySource).toBe('invoice');

    await u.call(`/purchase-lines/${cheese.id}`, send('PATCH', { quantity: 0.454 }));
    const history = await u.history('items', cheese.storeItemId);
    expect(history.entries[0]).toMatchObject({ quantity: 0.454, unit: 'kg', unitPriceCents: 1427 });
  });

  it('valida la cantidad', async () => {
    const u = user('pesables@example.com');
    expect((await u.call('/purchase-lines/x', send('PATCH', { quantity: 0 }))).status).toBe(400);
    expect((await u.call('/purchase-lines/x', send('PATCH', { quantity: 'dos' }))).status).toBe(400);
  });
});

describe('consulta de precios (F3)', () => {
  it('vincula el mismo GTIN entre cadenas y lo encuentra al escanear (CA3.1, CA5.3)', async () => {
    const u = user('entre-cadenas@example.com');
    await u.importInvoice(cityMall, CITY_MALL_CUFE);
    const sazonador = variant('4', { code: '741100022290', description: 'MC C SAZO148ML' });
    await u.importInvoice(sazonador.html, sazonador.cufe);

    const results = await u.search('code=7411000222904');
    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({ kind: 'product' });
    expect(results[0]!.storeNames.sort()).toEqual(['CITY MALL, S.A.', 'Inmobiliaria Don Antonio, S.A.']);

    const history = await u.history('products', results[0]!.id);
    expect(history.items).toHaveLength(2);
    const city = history.entries.find((entry) => entry.storeName === 'CITY MALL, S.A.')!;
    expect(city.unitPriceCents).toBe(city.lineTotalCents / city.quantity);
  });

  it('busca por texto con varias palabras e ignora acentos (CA3.3)', async () => {
    const u = user('busca@example.com');
    await u.importInvoice(withDiscounts, DISCOUNTS_CUFE);
    expect((await u.search('q=suavitel')).map((r) => r.name)).toEqual(['SUAVITEL PRI 800ML']);
    expect(await u.search('q=estrella%20azul')).toHaveLength(3);
    expect(await u.search('q=Melóna%20coco')).toHaveLength(1);
    expect(await u.search('q=no%20existe')).toEqual([]);
  });
});

describe('nombrar y vincular (F5)', () => {
  it('renombra, vincula y desvincula ítems', async () => {
    const u = user('vincula@example.com');
    const detail = await u.importInvoice(withDiscounts, DISCOUNTS_CUFE);
    const yogurts = detail.lines.filter((line) => line.description === 'ESTRELLA AZUL YOGU');
    const [a, b] = yogurts as [Line, Line];

    // CA5.1: nombre legible.
    expect((await u.call(`/catalog/products/${b.productId}`, send('PATCH', { name: 'Yogur Estrella Azul' }))).status).toBe(200);

    // CA5.2: vincular a con el producto de b; el producto de a queda huérfano y se borra.
    expect((await u.call(`/catalog/items/${a.storeItemId}/product`, send('PUT', { productId: b.productId }))).status).toBe(204);
    const linked = await u.history('products', b.productId!);
    expect(linked.name).toBe('Yogur Estrella Azul');
    expect(linked.items).toHaveLength(2);
    expect((await u.call(`/catalog/products/${a.productId}`)).status).toBe(404);

    // Desvincular: el ítem queda solo y el GTIN no lo vuelve a vincular al reindexar.
    expect((await u.call(`/catalog/items/${a.storeItemId}/product`, send('DELETE'))).status).toBe(204);
    await u.call(`/stores/${detail.storeId}`, send('PATCH', { codeFormat: 'gtin_no_check' }));
    const alone = await u.history('items', a.storeItemId);
    expect(alone.kind).toBe('item');
  });

  it('un ítem sin producto se renombra creando uno (CA5.1)', async () => {
    const u = user('renombra@example.com');
    const detail = await u.importInvoice(withDiscounts, DISCOUNTS_CUFE);
    const chicken = detail.lines.find((line) => line.description === 'POLLO ROSTIZADO EN')!;
    expect(chicken.productId).toBeNull(); // etiqueta de balanza: sin GTIN

    const res = await u.call(`/catalog/items/${chicken.storeItemId}`, send('PATCH', { name: 'Pollo rostizado entero' }));
    const { productId } = await res.json<{ productId: string }>();
    expect((await u.history('products', productId)).name).toBe('Pollo rostizado entero');
    expect((await u.call(`/catalog/items/${chicken.storeItemId}`)).status).toBe(200);
  });

  it('edita el nombre visible de la tienda (CA5.4)', async () => {
    const u = user('tienda@example.com');
    const detail = await u.importInvoice(withDiscounts, DISCOUNTS_CUFE);
    expect((await u.call(`/stores/${detail.storeId}`, send('PATCH', { displayName: 'El Rey' }))).status).toBe(204);
    const list = await (await u.call('/purchases')).json<{ items: { storeName: string }[] }>();
    expect(list.items[0]!.storeName).toBe('El Rey');
    await u.call(`/stores/${detail.storeId}`, send('PATCH', { displayName: null }));
  });

  it('rechaza formatos inválidos', async () => {
    const u = user('tienda@example.com');
    const detail = await u.importInvoice(withDiscounts, DISCOUNTS_CUFE);
    expect((await u.call(`/stores/${detail.storeId}`, send('PATCH', { codeFormat: 'otro' }))).status).toBe(400);
    expect((await u.call(`/stores/${detail.storeId}`, send('PATCH', { quantities: 'a veces' }))).status).toBe(400);
  });
});

describe('reglas nuevas sobre datos ya importados', () => {
  it('GET /me recalcula una vez el catálogo de compras viejas', async () => {
    const u = user('legado@example.com');
    const detail = await u.importInvoice(withDiscounts, DISCOUNTS_CUFE);
    const userId = (await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind('legado@example.com').first<{ id: string }>())!.id;
    // Simula datos importados antes de la Fase 3.
    await env.DB.batch([
      env.DB.prepare('UPDATE store_items SET product_id = NULL, link_source = NULL, is_weighed = 0 WHERE user_id = ?').bind(userId),
      env.DB.prepare('DELETE FROM products WHERE user_id = ?').bind(userId),
      env.DB.prepare('UPDATE users SET catalog_version = 0 WHERE id = ?').bind(userId),
    ]);

    expect((await u.call('/me')).status).toBe(200);
    const after = await (await u.call(`/purchases/${(await (await u.call('/purchases')).json<{ items: { id: string }[] }>()).items[0]!.id}`)).json<Detail>();
    expect(after.lines.find((line) => line.description === 'SUAVITEL PRI 800ML')!.productId).not.toBeNull();
    const version = await env.DB.prepare('SELECT catalog_version AS v FROM users WHERE id = ?').bind(userId).first<{ v: number }>();
    expect(version?.v).toBe(1);
    expect(detail.storeId).toBeTruthy();
  });
});

describe('pesables corregidos por el usuario', () => {
  it('un PLU marcado por unidad deja de ser pesable y no lo cambia el reindexado', async () => {
    const u = user('plu@example.com');
    const detail = await u.importInvoice(withDiscounts, DISCOUNTS_CUFE);
    const banana = detail.lines.find((line) => line.description === 'GUINEO 1 KG')!;

    expect((await u.call(`/catalog/items/${banana.storeItemId}/weighed`, send('PATCH', { isWeighed: false }))).status).toBe(204);
    await u.call(`/stores/${detail.storeId}`, send('PATCH', { codeFormat: 'gtin_no_check' })); // reindexa
    const history = await u.history('items', banana.storeItemId);
    expect(history.entries[0]!.unit).toBe('u');
    expect((await u.call(`/catalog/items/${banana.storeItemId}/weighed`, send('PATCH', { isWeighed: 'no' }))).status).toBe(400);
  });
});
