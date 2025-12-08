/**
 * Tax Types for ITBMS (Panama)
 * Impuesto de Transferencia de Bienes Muebles y Servicios
 */

// Tax rate codes used in Panama
export type TaxRateCode = 'exempt' | 'general' | 'selective' | 'services';

// Tax rate values in Panama
export type TaxRateValue = 0 | 7 | 10 | 15;

/**
 * Tax rate record from database
 */
export interface TaxRate {
  id: string;
  code: TaxRateCode;
  name: string;
  rate: number; // 0, 7, 10, or 15
  description: string;
  defaultCategories: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Tax rate for display in UI (simplified)
 */
export interface TaxRateOption {
  code: TaxRateCode;
  name: string;
  rate: number;
  label: string; // e.g., "7% - General"
}

/**
 * Tax information for a shopping item
 */
export interface ItemTaxInfo {
  taxRateCode: TaxRateCode;
  taxRate: number;
  priceIncludesTax: boolean;
  basePrice: number; // Price without tax
  taxAmount: number; // Tax amount for this line
}

/**
 * Tax breakdown by rate for session summary
 */
export interface TaxBreakdown {
  [rate: string]: {
    rate: number;
    name: string;
    itemCount: number;
    taxableAmount: number; // Sum of base prices
    taxAmount: number; // Total tax at this rate
  };
}

/**
 * Session tax summary
 */
export interface SessionTaxSummary {
  subtotalBeforeTax: number;
  totalTax: number;
  grandTotal: number;
  breakdown: TaxBreakdown;
}

// =====================================================
// CONSTANTS
// =====================================================

/**
 * Default tax rates for Panama ITBMS
 */
export const PANAMA_TAX_RATES: TaxRateOption[] = [
  { code: 'exempt', name: 'Exento', rate: 0, label: '0% - Exento' },
  { code: 'general', name: 'General', rate: 7, label: '7% - General' },
  { code: 'selective', name: 'Selectivo', rate: 10, label: '10% - Selectivo' },
  { code: 'services', name: 'Servicios', rate: 15, label: '15% - Servicios' },
];

/**
 * Default tax rate code
 */
export const DEFAULT_TAX_RATE_CODE: TaxRateCode = 'general';

/**
 * Default tax rate percentage
 */
export const DEFAULT_TAX_RATE: number = 7;

/**
 * Categories typically exempt from ITBMS (0%)
 */
export const EXEMPT_CATEGORIES = [
  'Frutas y Verduras',
  'Carnes',
  'Lacteos',
  'Granos y Cereales',
  'Medicamentos',
  'Huevos',
  'Canasta Basica',
];

/**
 * Categories with selective tax (10%)
 */
export const SELECTIVE_TAX_CATEGORIES = [
  'Bebidas Alcoholicas',
  'Licores',
  'Vinos',
  'Cervezas',
  'Tabaco',
  'Cigarrillos',
];

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Get tax rate option by code
 */
export function getTaxRateByCode(code: TaxRateCode): TaxRateOption | undefined {
  return PANAMA_TAX_RATES.find((r) => r.code === code);
}

/**
 * Get tax rate option by rate value
 */
export function getTaxRateByValue(rate: number): TaxRateOption | undefined {
  return PANAMA_TAX_RATES.find((r) => r.rate === rate);
}

/**
 * Get default tax rate for a category
 */
export function getDefaultTaxRateForCategory(category: string): TaxRateOption {
  const normalizedCategory = category.toLowerCase();

  // Check exempt categories
  if (EXEMPT_CATEGORIES.some((c) => normalizedCategory.includes(c.toLowerCase()))) {
    return PANAMA_TAX_RATES.find((r) => r.code === 'exempt')!;
  }

  // Check selective tax categories
  if (SELECTIVE_TAX_CATEGORIES.some((c) => normalizedCategory.includes(c.toLowerCase()))) {
    return PANAMA_TAX_RATES.find((r) => r.code === 'selective')!;
  }

  // Default to general rate
  return PANAMA_TAX_RATES.find((r) => r.code === 'general')!;
}

/**
 * Calculate base price from price that includes tax
 * Formula: basePrice = priceWithTax / (1 + taxRate/100)
 */
export function calculateBasePrice(price: number, taxRate: number, includesTax: boolean): number {
  if (!includesTax) {
    return price;
  }
  return Number((price / (1 + taxRate / 100)).toFixed(2));
}

/**
 * Calculate price with tax from base price
 * Formula: priceWithTax = basePrice * (1 + taxRate/100)
 */
export function calculatePriceWithTax(basePrice: number, taxRate: number): number {
  return Number((basePrice * (1 + taxRate / 100)).toFixed(2));
}

/**
 * Calculate tax amount for a line item
 * Formula: taxAmount = basePrice * (taxRate/100) * quantity
 */
export function calculateTaxAmount(basePrice: number, taxRate: number, quantity: number): number {
  return Number((basePrice * (taxRate / 100) * quantity).toFixed(2));
}

/**
 * Calculate line total (what the user pays)
 * This is always: price * quantity (regardless of whether price includes tax)
 */
export function calculateLineTotal(price: number, quantity: number): number {
  return Number((price * quantity).toFixed(2));
}

/**
 * Calculate complete tax info for an item
 */
export function calculateItemTaxInfo(
  price: number,
  quantity: number,
  taxRateCode: TaxRateCode,
  priceIncludesTax: boolean
): ItemTaxInfo & { subtotal: number } {
  const taxRateOption = getTaxRateByCode(taxRateCode) || PANAMA_TAX_RATES[1]; // Default to general
  const taxRate = taxRateOption.rate;

  const basePrice = calculateBasePrice(price, taxRate, priceIncludesTax);
  const taxAmount = calculateTaxAmount(basePrice, taxRate, quantity);
  const subtotal = calculateLineTotal(price, quantity);

  return {
    taxRateCode,
    taxRate,
    priceIncludesTax,
    basePrice,
    taxAmount,
    subtotal,
  };
}

/**
 * Calculate session tax summary from items
 */
export function calculateSessionTaxSummary(
  items: Array<{
    basePrice: number;
    taxRate: number;
    taxRateCode: TaxRateCode;
    taxAmount: number;
    quantity: number;
    subtotal: number;
  }>
): SessionTaxSummary {
  const breakdown: TaxBreakdown = {};

  let subtotalBeforeTax = 0;
  let totalTax = 0;
  let grandTotal = 0;

  for (const item of items) {
    const rateKey = item.taxRate.toString();
    const taxOption = getTaxRateByCode(item.taxRateCode);

    if (!breakdown[rateKey]) {
      breakdown[rateKey] = {
        rate: item.taxRate,
        name: taxOption?.name || `${item.taxRate}%`,
        itemCount: 0,
        taxableAmount: 0,
        taxAmount: 0,
      };
    }

    const lineBaseTotal = item.basePrice * item.quantity;

    breakdown[rateKey].itemCount += 1;
    breakdown[rateKey].taxableAmount += lineBaseTotal;
    breakdown[rateKey].taxAmount += item.taxAmount;

    subtotalBeforeTax += lineBaseTotal;
    totalTax += item.taxAmount;
    grandTotal += item.subtotal;
  }

  // Round final totals
  return {
    subtotalBeforeTax: Number(subtotalBeforeTax.toFixed(2)),
    totalTax: Number(totalTax.toFixed(2)),
    grandTotal: Number(grandTotal.toFixed(2)),
    breakdown,
  };
}

/**
 * Format tax rate for display
 */
export function formatTaxRate(rate: number): string {
  return `${rate}%`;
}

/**
 * Format currency for Panama (USD)
 */
export function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}
