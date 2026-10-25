import { env } from 'cloudflare:workers';
import { describe, expect, it } from 'vitest';
import type { CafeInvoice } from '../worker/cafe/parse';
import { as, fakeDgi } from './helpers';
import withDiscounts from './fixtures/don-antonio-descuentos.html?raw';
import oneLine from './fixtures/don-antonio-1-linea.html?raw';

const ONE_LINE_CUFE = 'FE0120000000541-81-118009-0610192025120300001102620310312027507502';
const DISCOUNTS_CUFE = 'FE0120000000541-81-118009-0610192025112400001055650310311336416413';
// CUFE con formato válido que no corresponde a ningún fixture (para fallas de la DGI).
const UNKNOWN_CUFE = 'FE0120000000541-81-118009-0610192025120300009999990310312027507502';

const post = (body: unknown) => ({
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

const count = async (table: string) =>
  (await env.DB.prepare(`SELECT COUNT(*) AS n FROM ${table}`).first<{ n: number }>())?.n ?? 0;

describe('POST /api/purchases/cafe/preview', () => {
  it('devuelve la factura sin guardar nada (CA1.3)', async () => {
    const dgi = fakeDgi(oneLine);
    const before = await count('purchases');
    const res = await as('preview@example.com', dgi.options)('/purchases/cafe/preview', post({ input: ONE_LINE_CUFE }));

    expect(res.status).toBe(200);
    const body = await res.json<{ invoice: CafeInvoice; existingPurchaseId: string | null }>();
    expect(body.existingPurchaseId).toBeNull();
    expect(body.invoice.issuer.name).toBe('Inmobiliaria Don Antonio, S.A.');
    expect(body.invoice.lines).toHaveLength(1);
    expect(await count('purchases')).toBe(before);
  });

  it('acepta la URL del QR (CA1.2)', async () => {
    const dgi = fakeDgi(oneLine);
    const qr = `https://dgi-fep.mef.gob.pa/Consultas/FacturasPorQR?chFE=${ONE_LINE_CUFE}&iAmb=1`;
    const res = await as('preview@example.com', dgi.options)('/purchases/cafe/preview', post({ input: qr }));
    expect(res.status).toBe(200);
  });

  it('rechaza un texto que no es CUFE', async () => {
    const res = await as('preview@example.com', fakeDgi(oneLine).options)('/purchases/cafe/preview', post({ input: 'hola' }));
    expect(res.status).toBe(400);
  });

  it('devuelve 502 con el CUFE si la DGI no responde (CA1.6)', async () => {
    const dgi = fakeDgi('error', 503);
    const res = await as('preview@example.com', dgi.options)('/purchases/cafe/preview', post({ input: UNKNOWN_CUFE }));
    expect(res.status).toBe(502);
    expect(await res.json()).toMatchObject({ code: 'dgi_unavailable', cufe: UNKNOWN_CUFE });
  });

  it('devuelve 404 si la DGI no tiene la factura', async () => {
    const dgi = fakeDgi('<div id="facturaHTML">\n        </div><form id="fImprimir"></form>');
    const res = await as('preview@example.com', dgi.options)('/purchases/cafe/preview', post({ input: UNKNOWN_CUFE }));
    expect(res.status).toBe(404);
    expect(await res.json()).toMatchObject({ code: 'not_found', cufe: UNKNOWN_CUFE });
  });

  it('devuelve 502 si la DGI cambia el formato (CA1.6)', async () => {
    const dgi = fakeDgi('<html><body>Página nueva</body></html>');
    const res = await as('preview@example.com', dgi.options)('/purchases/cafe/preview', post({ input: UNKNOWN_CUFE }));
    expect(res.status).toBe(502);
    expect(await res.json()).toMatchObject({ code: 'dgi_format', cufe: UNKNOWN_CUFE });
  });
});

describe('POST /api/purchases/cafe', () => {
  it('guarda la compra, sus líneas y crea la tienda (CA1.4)', async () => {
    const dgi = fakeDgi(withDiscounts);
    const user = as('guardar@example.com', dgi.options);
    const res = await user('/purchases/cafe', post({ input: DISCOUNTS_CUFE }));

    expect(res.status).toBe(201);
    const { id } = await res.json<{ id: string }>();
    const detail = await (await user(`/purchases/${id}`)).json<{
      storeName: string;
      totalCents: number;
      discountCents: number;
      taxBreakdown: { rateBp: number; taxCents: number }[];
      lines: unknown[];
    }>();
    expect(detail.storeName).toBe('Inmobiliaria Don Antonio, S.A.');
    expect(detail.totalCents).toBe(4771);
    expect(detail.discountCents).toBe(342);
    expect(detail.lines).toHaveLength(17);
    expect(detail.taxBreakdown).toEqual([
      { rateBp: 0, taxCents: 0, lineCount: 16 },
      { rateBp: 700, taxCents: 15, lineCount: 1 },
    ]);

    const store = await env.DB.prepare('SELECT code_format FROM stores WHERE ruc = ?')
      .bind('541-81-118009')
      .first<{ code_format: string }>();
    expect(store?.code_format).toBe('gtin_no_check');
  });

  it('usa la factura en caché del preview y no vuelve a consultar la DGI', async () => {
    const dgi = fakeDgi(oneLine);
    const user = as('cache@example.com', dgi.options);
    await user('/purchases/cafe/preview', post({ input: ONE_LINE_CUFE }));
    const callsAfterPreview = dgi.calls.length;
    expect((await user('/purchases/cafe', post({ input: ONE_LINE_CUFE }))).status).toBe(201);
    expect(dgi.calls.length).toBe(callsAfterPreview);
  });

  it('no duplica una factura ya importada (CA1.5)', async () => {
    const dgi = fakeDgi(withDiscounts);
    const user = as('duplicada@example.com', dgi.options);
    const first = await (await user('/purchases/cafe', post({ input: DISCOUNTS_CUFE }))).json<{ id: string }>();

    const again = await user('/purchases/cafe', post({ input: DISCOUNTS_CUFE }));
    expect(again.status).toBe(200);
    expect(await again.json()).toEqual({ id: first.id, created: false });

    const preview = await user('/purchases/cafe/preview', post({ input: DISCOUNTS_CUFE }));
    expect(await preview.json()).toMatchObject({ existingPurchaseId: first.id });
  });

  describe('scan_ms (CA1.8)', () => {
    const scanMsOf = async (id: string) =>
      (await env.DB.prepare('SELECT scan_ms FROM purchases WHERE id = ?').bind(id).first<{ scan_ms: number | null }>())
        ?.scan_ms;

    it('guarda los ms medidos en el cliente', async () => {
      const user = as('scan-ms@example.com', fakeDgi(oneLine).options);
      const res = await user('/purchases/cafe', post({ input: ONE_LINE_CUFE, scanMs: 14250 }));
      expect(await scanMsOf((await res.json<{ id: string }>()).id)).toBe(14250);
    });

    it('queda en NULL si el cliente no lo manda', async () => {
      const user = as('scan-ms-null@example.com', fakeDgi(oneLine).options);
      const res = await user('/purchases/cafe', post({ input: ONE_LINE_CUFE }));
      expect(await scanMsOf((await res.json<{ id: string }>()).id)).toBeNull();
    });

    it('descarta valores inválidos sin impedir el guardado', async () => {
      for (const [i, scanMs] of [-1, 1.5, 3_600_001, '500', null].entries()) {
        const user = as(`scan-ms-bad${i}@example.com`, fakeDgi(oneLine).options);
        const res = await user('/purchases/cafe', post({ input: ONE_LINE_CUFE, scanMs }));
        expect(res.status).toBe(201);
        expect(await scanMsOf((await res.json<{ id: string }>()).id)).toBeNull();
      }
    });

    it('no pisa el valor de una compra ya importada (CA1.5)', async () => {
      const user = as('scan-ms-dup@example.com', fakeDgi(oneLine).options);
      const first = await user('/purchases/cafe', post({ input: ONE_LINE_CUFE, scanMs: 9000 }));
      const { id } = await first.json<{ id: string }>();
      const again = await user('/purchases/cafe', post({ input: ONE_LINE_CUFE, scanMs: 99 }));
      expect(await again.json()).toEqual({ id, created: false });
      expect(await scanMsOf(id)).toBe(9000);
    });
  });

  it('reutiliza los store_items de la tienda entre compras', async () => {
    const dgi = fakeDgi(withDiscounts);
    const user = as('items@example.com', dgi.options);
    await user('/purchases/cafe', post({ input: DISCOUNTS_CUFE }));
    const items = await env.DB.prepare(
      "SELECT COUNT(*) AS n FROM store_items si JOIN users u ON u.id = si.user_id WHERE u.email = 'items@example.com'",
    ).first<{ n: number }>();
    expect(items?.n).toBe(17);
  });

  it('no guarda nada si la DGI falla (CA1.6)', async () => {
    const before = await count('purchases');
    const res = await as('falla@example.com', fakeDgi('error', 500).options)('/purchases/cafe', post({ input: UNKNOWN_CUFE }));
    expect(res.status).toBe(502);
    expect(await count('purchases')).toBe(before);
  });
});

describe('GET /api/purchases (CA2.1, CA2.4)', () => {
  it('pagina por fecha descendente con cursor', async () => {
    const user = as('paginas@example.com', fakeDgi(oneLine).options);
    await user('/purchases/cafe', post({ input: ONE_LINE_CUFE })); // 2025-12-03
    await as('paginas@example.com', fakeDgi(withDiscounts).options)('/purchases/cafe', post({ input: DISCOUNTS_CUFE })); // 2025-11-24

    const first = await (await user('/purchases?limit=1')).json<{ items: { issuedAt: string; lineCount: number }[]; nextCursor: string | null }>();
    expect(first.items).toHaveLength(1);
    expect(first.items[0]?.issuedAt).toBe('2025-12-04T01:27:50.000Z');
    expect(first.items[0]?.lineCount).toBe(1);
    expect(first.nextCursor).not.toBeNull();

    const second = await (await user(`/purchases?limit=1&cursor=${encodeURIComponent(first.nextCursor!)}`)).json<{
      items: { lineCount: number }[];
      nextCursor: string | null;
    }>();
    expect(second.items[0]?.lineCount).toBe(17);
    expect(second.nextCursor).toBeNull();
  });
});
