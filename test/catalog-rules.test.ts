import { describe, expect, it } from 'vitest';
import {
  detectStoreQuantities,
  effectiveUnitPriceCents,
  inferUnits,
  isWeighedItem,
  normalizeGtin,
} from '../worker/catalog/rules';

describe('normalizeGtin (§10.2)', () => {
  it.each([
    ['7411000222904', 'gtin', '7411000222904'],
    ['0873292001792', 'gtin', '0873292001792'],
    ['873292001792', 'gtin', '0873292001792'], // UPC-A → GTIN-13
    ['7411000222905', 'gtin', null], // dígito verificador inválido
    ['741100022290', 'gtin_no_check', '7411000222904'], // Don Antonio: sin dígito verificador
    ['87329200179', 'gtin_no_check', '0873292001792'], // y sin ceros iniciales
    ['10085482', 'internal', null],
    ['203056000000', 'gtin', null], // etiqueta de balanza (CITY MALL)
    ['20786500000', 'gtin_no_check', null], // etiqueta de balanza (Don Antonio)
    ['4238', 'gtin_no_check', null], // PLU
    [null, 'gtin', null],
  ] as const)('%s (%s) → %s', (code, format, gtin) => {
    expect(normalizeGtin(code, format)).toBe(gtin);
  });
});

describe('isWeighedItem (§10.6 regla 2)', () => {
  it.each([
    ['4238', 'GUINEO 1 KG', true],
    ['20786500000', 'DON PEDRO MOZZAREL', true], // queso pesado por el dependiente
    ['20202200000', 'POLLO ROSTIZADO EN', true],
    ['203056000000', 'PIMENTON REDONDO ROJO x KG', true],
    ['20047700000', 'FRES FILE1KG', true],
    ['10085482', 'PLATANO VERDE X KG', true],
    ['741100022290', 'MC C SAZO148ML', false],
    ['750954670009', 'SUAVITEL PRI 800ML', false],
  ])('%s %s → %s', (code, description, weighed) => {
    expect(isWeighedItem(code, description)).toBe(weighed);
  });
});

describe('inferUnits (§10.6 regla 3)', () => {
  it.each([
    [240, 80, 3],
    [241, 80, 3], // 1 centavo de redondeo por unidad
    [80, 80, 1],
    [245, 80, null], // no es múltiplo: cambió el precio
    [80 * 25, 80, null], // fuera de rango (máx. 24)
    [100, 0, null],
  ])('%i / %i → %s', (total, unit, units) => {
    expect(inferUnits(total, unit)).toBe(units);
  });
});

describe('detectStoreQuantities (§10.6 regla 1)', () => {
  it('es always_one si todo viene en 1 y hay pesables en 1', () => {
    expect(detectStoreQuantities({ largeInvoiceLines: 17, largeInvoiceNonUnitLines: 0, weighedUnitLines: 2 })).toBe(
      'always_one',
    );
  });

  it('es reliable si alguna cantidad no es 1', () => {
    expect(detectStoreQuantities({ largeInvoiceLines: 77, largeInvoiceNonUnitLines: 20, weighedUnitLines: 3 })).toBe(
      'reliable',
    );
  });

  it('es reliable sin facturas grandes o sin pesables', () => {
    expect(detectStoreQuantities({ largeInvoiceLines: 0, largeInvoiceNonUnitLines: 0, weighedUnitLines: 0 })).toBe(
      'reliable',
    );
    expect(detectStoreQuantities({ largeInvoiceLines: 12, largeInvoiceNonUnitLines: 0, weighedUnitLines: 0 })).toBe(
      'reliable',
    );
  });
});

describe('effectiveUnitPriceCents (§5.3)', () => {
  const line = { lineTotalCents: 354, quantity: 0.745, quantitySource: 'invoice' as const, storeQuantities: 'reliable' as const };

  it('divide por la cantidad real', () => {
    expect(effectiveUnitPriceCents(line)).toBe(475);
  });

  it('es null con cantidad 1 de una tienda always_one sin corregir', () => {
    expect(effectiveUnitPriceCents({ ...line, quantity: 1, storeQuantities: 'always_one' })).toBeNull();
  });

  it('usa la cantidad inferida o corregida', () => {
    expect(effectiveUnitPriceCents({ lineTotalCents: 240, quantity: 3, quantitySource: 'inferred', storeQuantities: 'always_one' })).toBe(80);
    expect(effectiveUnitPriceCents({ lineTotalCents: 94, quantity: 0.4, quantitySource: 'user', storeQuantities: 'always_one' })).toBe(235);
  });
});
