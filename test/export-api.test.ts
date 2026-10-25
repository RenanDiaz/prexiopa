import { env } from 'cloudflare:workers';
import { describe, expect, it } from 'vitest';
import { LINE_COLUMNS, PURCHASE_COLUMNS } from '../worker/export/csv';
import { createApp } from '../worker/index';
import { as, fakeDgi, prodEnv, seedPurchase } from './helpers';
import withDiscounts from './fixtures/don-antonio-descuentos.html?raw';

const DISCOUNTS_CUFE = 'FE0120000000541-81-118009-0610192025112400001055650310311336416413';

const json = (body: unknown) => ({
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

/** Parser mínimo de RFC 4180 para leer lo que produce el export (sin BOM). */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i]!;
    if (quoted && char === '"' && text[i + 1] === '"') {
      cell += '"';
      i++;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (!quoted && char === ',') {
      row.push(cell);
      cell = '';
    } else if (!quoted && char === '\r' && text[i + 1] === '\n') {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
      i++;
    } else {
      cell += char;
    }
  }
  return rows;
}

const table = async (res: Response) => {
  const [header, ...rows] = parseCsv(await res.text());
  return { header: header!, rows: rows.map((r) => Object.fromEntries(header!.map((name, i) => [name, r[i]!]))) };
};

async function seedUser(email: string) {
  const user = as(email, fakeDgi(withDiscounts).options);
  await user('/purchases/cafe', json({ input: DISCOUNTS_CUFE }));
  await user(
    '/purchases/manual',
    json({
      store: { name: 'Chino de la esquina' },
      date: '2026-10-20',
      lines: [
        { description: '=SUMA(A1)', quantity: 1, lineTotalCents: 250 },
        { description: 'Leche "Estrella", 1L', quantity: 2, lineTotalCents: 380 },
      ],
    }),
  );
  return user;
}

describe('GET /api/export/*.csv', () => {
  it('responde como descarga con nombre fijo y sin caché (CA8.1)', async () => {
    const user = await seedUser('export-headers@example.com');
    for (const [path, filename] of [
      ['compras', 'prexiopa-compras.csv'],
      ['lineas', 'prexiopa-lineas.csv'],
    ]) {
      const res = await user(`/export/${path}.csv`);
      expect(res.status).toBe(200);
      expect(res.headers.get('Content-Type')).toBe('text/csv; charset=utf-8');
      expect(res.headers.get('Content-Disposition')).toBe(`attachment; filename="${filename}"`);
      expect(res.headers.get('Cache-Control')).toBe('no-store');
    }
  });

  it('compras.csv: una fila por compra, ascendente, con montos del encabezado (CA8.2, CA8.4)', async () => {
    const user = await seedUser('export-compras@example.com');
    const res = await user('/export/compras.csv');
    // `text()` descarta el BOM al decodificar: se verifican los bytes (CA8.4).
    const bytes = new Uint8Array(await res.clone().arrayBuffer());
    expect([...bytes.slice(0, 3)]).toEqual([0xef, 0xbb, 0xbf]);
    expect((await res.clone().text()).endsWith('\r\n')).toBe(true);

    const { header, rows } = await table(res);
    expect(header).toEqual([...PURCHASE_COLUMNS]);
    expect(rows).toHaveLength(2);

    const [cafe, manual] = rows;
    expect(cafe).toMatchObject({
      tienda: 'Inmobiliaria Don Antonio, S.A.',
      ruc: '541-81-118009',
      origen: 'cafe',
      total: '47.71',
      descuento: '3.42',
      cufe: DISCOUNTS_CUFE,
    });
    expect(cafe!.fecha).toBe('2025-11-24');
    expect(manual).toMatchObject({
      tienda: 'Chino de la esquina',
      ruc: '',
      sucursal: '',
      origen: 'manual',
      fecha: '2026-10-20',
      emitida_utc: '2026-10-20T17:00:00.000Z',
      subtotal: '',
      itbms: '',
      total: '6.30',
      pagado: '6.30',
      cufe: '',
    });
    for (const column of ['subtotal', 'itbms', 'descuento', 'total']) expect(cafe![column]).toMatch(/^-?\d+\.\d{2}$/);
  });

  it('lineas.csv: una fila por línea, con confiabilidad de la cantidad (CA8.3)', async () => {
    const user = await seedUser('export-lineas@example.com');
    // Tienda que reporta cantidad 1 en todo, y una línea con unidades inferidas (§10.6).
    await env.DB.prepare("UPDATE stores SET quantities = 'always_one' WHERE ruc = ?").bind('541-81-118009').run();
    const list = await (await user('/purchases')).json<{ items: { id: string; source: string }[] }>();
    const cafeId = list.items.find((p) => p.source === 'cafe')!.id;
    await env.DB.prepare(
      "UPDATE purchase_lines SET quantity = 2, quantity_source = 'inferred' WHERE purchase_id = ? AND line_no = 1",
    )
      .bind(cafeId)
      .run();

    const { header, rows } = await table(await user('/export/lineas.csv'));
    expect(header).toEqual([...LINE_COLUMNS]);
    expect(rows).toHaveLength(17 + 2);

    const cafeLines = rows.filter((r) => r.id_compra === cafeId);
    expect(cafeLines.map((r) => r.linea)).toEqual(Array.from({ length: 17 }, (_, i) => String(i + 1)));
    expect(cafeLines[0]).toMatchObject({ cantidad: '2', cantidad_origen: 'inferred', cantidad_confiable: 'si' });
    for (const line of cafeLines.slice(1)) {
      expect(line).toMatchObject({ cantidad_origen: 'invoice', cantidad_confiable: 'no' });
    }

    const manual = rows.filter((r) => r.id_compra !== cafeId);
    expect(manual.map((r) => [r.cantidad, r.cantidad_origen, r.cantidad_confiable, r.total_linea])).toEqual([
      ['1', 'user', 'si', '2.50'],
      ['2', 'user', 'si', '3.80'],
    ]);
    for (const row of cafeLines) {
      for (const column of ['precio_lista', 'descuento', 'total_linea', 'itbms']) expect(row[column]).toMatch(/^-?\d+\.\d{2}$/);
    }
    // Una compra manual no captura ITBMS: vacío, no 0 (CA8.3).
    for (const row of manual) expect([row.tasa_itbms, row.itbms]).toEqual(['', '']);
  });

  it('escapa fórmulas y comillas de los textos (CA8.4, CA8.5)', async () => {
    const user = await seedUser('export-escape@example.com');
    const { rows } = await table(await user('/export/lineas.csv'));
    const manual = rows.filter((r) => r.tienda === 'Chino de la esquina');
    expect(manual.map((r) => r.descripcion)).toEqual(["'=SUMA(A1)", 'Leche "Estrella", 1L']);
  });

  it('no expone raw_json, receptor ni correos (CA8.6)', async () => {
    const user = await seedUser('export-privacidad@example.com');
    for (const path of ['compras', 'lineas']) {
      const text = await (await user(`/export/${path}.csv`)).text();
      expect(text).not.toMatch(/raw_json|receptor|@example\.com|"issuer"/i);
    }
  });

  it('sin compras entrega solo los encabezados (CA8.7)', async () => {
    const user = as('export-vacio@example.com');
    expect(await (await user('/export/compras.csv')).text()).toBe(`${PURCHASE_COLUMNS.join(',')}\r\n`);
    expect(await (await user('/export/lineas.csv')).text()).toBe(`${LINE_COLUMNS.join(',')}\r\n`);
  });

  it('exporta 500 compras con 10 líneas cada una (CA8.7)', async () => {
    const email = 'export-volumen@example.com';
    const { user, purchase } = await seedPurchase(email);
    const ref = await env.DB.prepare(
      'SELECT p.store_id AS storeId, pl.store_item_id AS itemId FROM purchases p JOIN purchase_lines pl ON pl.purchase_id = p.id WHERE p.id = ?',
    )
      .bind(purchase.id)
      .first<{ storeId: string; itemId: string }>();
    await env.DB.batch([
      env.DB.prepare(
        `WITH RECURSIVE n(i) AS (SELECT 1 UNION ALL SELECT i + 1 FROM n WHERE i < 499)
         INSERT INTO purchases (id, user_id, store_id, source, cufe, issued_at, subtotal_cents, total_cents, created_at)
         SELECT 'vol-' || i, ?, ?, 'cafe', 'FE-VOL-' || i, strftime('%Y-%m-%dT%H:%M:%fZ', '2026-01-01', '+' || i || ' hours'), 1000, 1000, '2026-10-25T00:00:00.000Z' FROM n`,
      ).bind(user.id, ref!.storeId),
      env.DB.prepare(
        `WITH RECURSIVE n(i) AS (SELECT 1 UNION ALL SELECT i + 1 FROM n WHERE i < 499),
         l(j) AS (SELECT 1 UNION ALL SELECT j + 1 FROM l WHERE j < 10)
         INSERT INTO purchase_lines (id, purchase_id, line_no, store_item_id, description, quantity, list_price_cents, line_total_cents)
         SELECT 'vol-' || i || '-' || j, 'vol-' || i, j, ?, 'LINEA ' || j, 1, 100, 100 FROM n, l`,
      ).bind(ref!.itemId),
    ]);

    const own = as(email);
    const compras = await table(await own('/export/compras.csv'));
    const lineas = await table(await own('/export/lineas.csv'));
    expect(compras.rows).toHaveLength(500);
    expect(lineas.rows).toHaveLength(499 * 10 + 1);
  });

  it('exige sesión', async () => {
    for (const path of ['compras', 'lineas']) {
      const res = await createApp().request(`/api/export/${path}.csv`, {}, prodEnv());
      expect(res.status).toBe(401);
    }
  });
});
