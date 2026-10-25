import { describe, expect, it } from 'vitest';
import {
  centsToDecimal,
  formatQuantity,
  linesCsv,
  panamaDate,
  purchasesCsv,
  textCell,
  toCsv,
  type LineExportRow,
  type PurchaseExportRow,
} from '../worker/export/csv';

const BOM = String.fromCharCode(0xfeff);

describe('centsToDecimal (CA8.4)', () => {
  it.each([
    [0, '0.00'],
    [5, '0.05'],
    [1878, '18.78'],
    [100000, '1000.00'],
    [-342, '-3.42'],
  ])('%i → %s', (cents, expected) => {
    expect(centsToDecimal(cents)).toBe(expected);
  });
});

describe('formatQuantity', () => {
  it('usa hasta 3 decimales sin ceros sobrantes', () => {
    expect(formatQuantity(2)).toBe('2');
    expect(formatQuantity(0.7)).toBe('0.7');
    expect(formatQuantity(1.937008)).toBe('1.937');
    expect(formatQuantity(0.1 + 0.2)).toBe('0.3');
  });
});

describe('panamaDate (CA8.2)', () => {
  it('usa la fecha local de Panamá (UTC-5)', () => {
    expect(panamaDate('2026-10-25T14:38:00.000Z')).toBe('2026-10-25');
    // 22:00 del 25 en Panamá ya es el 26 en UTC.
    expect(panamaDate('2026-10-26T03:00:00.000Z')).toBe('2026-10-25');
    expect(panamaDate('2026-10-26T05:00:00.000Z')).toBe('2026-10-26');
  });
});

describe('textCell (CA8.5)', () => {
  it.each(['=SUMA(A1)', '+1', '-1', '@cmd', '\tx', '\rx'])('prefija %j', (text) => {
    expect(textCell(text)).toBe(`'${text}`);
  });

  it('no toca el texto normal ni los vacíos', () => {
    expect(textCell('LECHE ESTRELLA AZUL 1L')).toBe('LECHE ESTRELLA AZUL 1L');
    expect(textCell('')).toBe('');
    expect(textCell(null)).toBe('');
  });
});

describe('toCsv (CA8.4)', () => {
  it('lleva BOM, CRLF y comillas según RFC 4180', () => {
    const csv = toCsv(['a', 'b'], [['x,y', 'dice "hola"'], ['línea\nnueva', 'ñ']]);
    expect(csv).toBe(`${BOM}a,b\r\n"x,y","dice ""hola"""\r\n"línea\nnueva",ñ\r\n`);
  });

  it('con cero filas deja solo los encabezados', () => {
    expect(toCsv(['a', 'b'], [])).toBe(`${BOM}a,b\r\n`);
  });
});

describe('linesCsv', () => {
  const base: LineExportRow = {
    purchaseId: 'p1',
    source: 'cafe',
    lineNo: 1,
    issuedAt: '2026-10-25T14:38:00.000Z',
    storeName: 'Grupo Rey',
    code: '20289900000',
    description: 'A STAR JAMON AHU R',
    productName: null,
    quantity: 0.7,
    quantitySource: 'user',
    storeQuantities: 'always_one',
    isWeighed: true,
    listPriceCents: 679,
    discountCents: 0,
    lineTotalCents: 679,
    taxRateBp: 0,
    taxCents: 0,
  };
  const body = (row: LineExportRow) => linesCsv([row]).split('\r\n')[1]!;

  it('marca la cantidad como no confiable en tiendas always_one sin corregir (§5.3)', () => {
    expect(body({ ...base, quantity: 1, quantitySource: 'invoice' })).toContain(',invoice,no,si,');
    expect(body(base)).toContain(',0.7,user,si,si,');
  });

  it('en tiendas reliable la cantidad de la factura es confiable', () => {
    expect(body({ ...base, storeQuantities: 'reliable', quantity: 6, quantitySource: 'invoice' })).toContain(
      ',6,invoice,si,',
    );
  });

  it('formatea la tasa de ITBMS en porcentaje', () => {
    expect(body({ ...base, taxRateBp: 700, taxCents: 24 })).toMatch(/,7,0\.24$/);
  });

  it('deja vacíos la tasa y el ITBMS de una línea manual, no 0 (CA8.3)', () => {
    expect(body({ ...base, source: 'manual' })).toMatch(/,6\.79,,$/);
  });
});

describe('purchasesCsv', () => {
  const purchase: PurchaseExportRow = {
    id: 'p1',
    issuedAt: '2026-10-20T17:00:00.000Z',
    storeName: 'Chino de la esquina',
    ruc: null,
    branchAddress: null,
    source: 'manual',
    subtotalCents: 630,
    taxCents: 0,
    discountCents: 0,
    totalCents: 630,
    paidCents: 630,
    cufe: null,
  };
  const body = (row: PurchaseExportRow) => purchasesCsv([row]).split('\r\n')[1]!;

  it('deja vacíos el subtotal y el ITBMS de una compra manual, no 0 (CA8.2)', () => {
    expect(body(purchase)).toBe('p1,2026-10-20,2026-10-20T17:00:00.000Z,Chino de la esquina,,,manual,,,0.00,6.30,6.30,');
  });

  it('exporta el subtotal y el ITBMS de una factura electrónica', () => {
    expect(body({ ...purchase, source: 'cafe', subtotalCents: 1843, taxCents: 35, totalCents: 1878 })).toContain(
      ',cafe,18.43,0.35,0.00,18.78,',
    );
  });

  it('deja vacíos el RUC, la sucursal, lo pagado y el CUFE cuando son nulos', () => {
    expect(body({ ...purchase, paidCents: null })).toMatch(/Chino de la esquina,,,manual,,,0\.00,6\.30,,$/);
  });
});
