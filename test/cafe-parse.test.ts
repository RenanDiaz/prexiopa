import { describe, expect, it } from 'vitest';
import { detectCodeFormat, hasValidCheckDigit } from '../worker/cafe/codes';
import { extractCufe } from '../worker/cafe/cufe';
import { multiplyToCents, toCents } from '../worker/cafe/money';
import { CafeParseError, parseInvoiceHtml } from '../worker/cafe/parse';
import cityMall from './fixtures/city-mall.html?raw';
import oneLine from './fixtures/don-antonio-1-linea.html?raw';
import withDiscounts from './fixtures/don-antonio-descuentos.html?raw';
import tamek from './fixtures/tamek.html?raw';

// Fixtures: facturas reales de la DGI con el bloque RECEPTOR redactado (spec §10.5).

describe('montos (§10.3)', () => {
  it.each([
    ['4.62', 462],
    ['1.639999', 164],
    ['3.53875', 354],
    ['0.005', 1],
    ['0.004', 0],
    ['151.07', 15107],
    ['1,234.50', 123450],
    ['', 0],
  ])('toCents(%j) = %i', (raw, cents) => {
    expect(toCents(raw)).toBe(cents);
  });

  it('rechaza texto que no es un monto', () => {
    expect(() => toCents('abc')).toThrow();
  });

  it('multiplica sin floats', () => {
    expect(multiplyToCents('0.11', '2')).toBe(22);
    expect(multiplyToCents('2.20', '1.000000')).toBe(220);
    expect(multiplyToCents('0.335', '3')).toBe(101);
  });
});

describe('extractCufe', () => {
  const cufe = 'FE0120000000541-81-118009-0610192025120300001102620310312027507502';

  it('acepta el CUFE pegado, con espacios o en minúsculas', () => {
    expect(extractCufe(`  ${cufe.toLowerCase()} `)).toBe(cufe);
  });

  it('extrae el CUFE de la URL del QR', () => {
    const qr = `https://dgi-fep.mef.gob.pa/Consultas/FacturasPorQR?chFE=${cufe}&iAmb=1&digestValue=abc&jwt=xyz`;
    expect(extractCufe(qr)).toBe(cufe);
  });

  it('extrae el CUFE de la URL de consulta por CUFE', () => {
    expect(extractCufe(`https://dgi-fep.mef.gob.pa/Consultas/FacturasPorCUFE/${cufe}`)).toBe(cufe);
  });

  it.each(['', 'hola', cufe.slice(0, 40), `https://example.com/?chFE=nada`])('rechaza %j', (input) => {
    expect(extractCufe(input)).toBeNull();
  });
});

describe('formato de códigos (§10.2)', () => {
  it('valida el dígito verificador GTIN', () => {
    expect(hasValidCheckDigit('7411000222904')).toBe(true);
    expect(hasValidCheckDigit('7411000222905')).toBe(false);
  });

  it.each([
    ['CITY MALL', cityMall, 'gtin'],
    ['Don Antonio', withDiscounts, 'gtin_no_check'],
    ['TAMEK', tamek, 'internal'],
  ])('detecta el formato de %s', (_, html, format) => {
    expect(detectCodeFormat(parseInvoiceHtml(html).lines.map((line) => line.code))).toBe(format);
  });
});

describe('parseInvoiceHtml', () => {
  it('lee una factura de una línea con ITBMS 10 %', () => {
    const invoice = parseInvoiceHtml(oneLine);
    expect(invoice).toMatchObject({
      cufe: 'FE0120000000541-81-118009-0610192025120300001102620310312027507502',
      number: '0000110262',
      issuedAt: '2025-12-04T01:27:50.000Z', // 03/12/2025 20:27:50 en Panamá (UTC-5)
      issuer: { ruc: '541-81-118009', dv: '06', name: 'Inmobiliaria Don Antonio, S.A.' },
      totals: { subtotalCents: 420, taxCents: 42, discountCents: 0, totalCents: 462, paidCents: 462 },
      warnings: [],
    });
    expect(invoice.lines).toEqual([
      {
        lineNo: 1,
        code: '8964613281',
        description: 'ATLAS LATA 355 ML',
        quantity: 1,
        listPriceCents: 420,
        discountCents: 0,
        lineTotalCents: 462,
        taxRateBp: 1000,
        taxCents: 42,
      },
    ]);
  });

  it('lee los descuentos por línea (antes ignorados en v0)', () => {
    const invoice = parseInvoiceHtml(withDiscounts);
    expect(invoice.lines).toHaveLength(17);
    expect(invoice.lines.find((line) => line.description === 'SUAVITEL PRI 800ML')).toMatchObject({
      listPriceCents: 440,
      discountCents: 220,
      lineTotalCents: 235,
      taxRateBp: 700,
      taxCents: 15,
    });
    expect(invoice.totals).toEqual({
      subtotalCents: 4756,
      taxCents: 15,
      discountCents: 342,
      totalCents: 4771,
      paidCents: 4771,
    });
  });

  it('toma los totales del encabezado aunque las líneas no cuadren (CITY MALL)', () => {
    const invoice = parseInvoiceHtml(cityMall);
    expect(invoice.issuer.name).toBe('CITY MALL, S.A.');
    expect(invoice.lines).toHaveLength(77);
    expect(invoice.totals).toEqual({
      subtotalCents: 15438,
      taxCents: 184,
      discountCents: 0,
      totalCents: 15622,
      paidCents: 15624,
    });
    expect(invoice.lines[0]).toMatchObject({ description: 'PIMENTON REDONDO ROJO x KG', quantity: 0.745, lineTotalCents: 354 });
  });

  it('redondea los 6 decimales de TAMEK y decodifica "\\/"', () => {
    const invoice = parseInvoiceHtml(tamek);
    expect(invoice.lines).toHaveLength(81);
    expect(invoice.lines.find((line) => line.code === '10081102')).toMatchObject({
      description: 'PAPA PC KG',
      quantity: 1.45122,
      listPriceCents: 164,
      lineTotalCents: 238,
    });
    expect(invoice.lines.find((line) => line.code === '10086784')?.description).toBe(
      'YOG FRESA BOLAS D/ARROZ ESTRELLAAZUL130',
    );
    expect(invoice.totals).toMatchObject({ totalCents: 15107, taxCents: 64, discountCents: 238 });
  });

  it.each([
    ['CITY MALL', cityMall],
    ['TAMEK', tamek],
  ])('no incluye datos del receptor (%s)', (_, html) => {
    const json = JSON.stringify(parseInvoiceHtml(html));
    expect(json).not.toContain('REDACTADO');
    expect(json).not.toMatch(/receptor/i);
  });

  it('avisa si las líneas difieren del encabezado en más de $0.05', () => {
    const html = oneLine.replace('Valor Total: <div style="width: 100px;display: inline-block;">4.62', 'Valor Total: <div style="width: 100px;display: inline-block;">5.00');
    expect(parseInvoiceHtml(html).warnings).toHaveLength(1);
  });

  it.each([
    ['una página sin factura', '<html><body>No se encontró el documento</body></html>'],
    ['una factura sin totales', oneLine.replace(/<tfoot>[\s\S]*?<\/tfoot>/, '<tfoot></tfoot>')],
    ['una línea con monto inválido', oneLine.replace('>4.62</td>', '>N/A</td>')],
  ])('lanza CafeParseError con %s', (_, html) => {
    expect(() => parseInvoiceHtml(html)).toThrow(CafeParseError);
  });
});
