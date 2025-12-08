/**
 * CAFE Types - Comprobante Auxiliar de Factura Electrónica
 * Types for Panama's electronic invoice system (DGI)
 */

import type { TaxRateCode } from './tax';

// =====================================================
// DGI ITBMS CODES (from electronic invoice specification)
// =====================================================

/**
 * ITBMS codes used in DGI electronic invoices
 * 0 = Exempt (0%)
 * 1 = General (7%)
 * 2 = Selective - Alcohol (10%)
 * 3 = Selective - Tobacco (15%)
 */
export type DGITaxCode = '0' | '1' | '2' | '3';

/**
 * Map DGI tax code to internal tax rate code
 */
export const DGI_TAX_CODE_MAP: Record<DGITaxCode, TaxRateCode> = {
  '0': 'exempt',
  '1': 'general',
  '2': 'selective',
  '3': 'services', // 15% for tobacco/services
};

/**
 * Map DGI tax code to tax rate percentage
 */
export const DGI_TAX_RATE_MAP: Record<DGITaxCode, number> = {
  '0': 0,
  '1': 7,
  '2': 10,
  '3': 15,
};

// =====================================================
// CAFE ITEM TYPES
// =====================================================

/**
 * Individual item/line from a CAFE invoice
 */
export interface CAFEItem {
  /** Line number in the invoice */
  lineNumber: number;
  /** Product description from invoice */
  description: string;
  /** Quantity purchased */
  quantity: number;
  /** Unit of measurement (e.g., "UND", "KG", "LB") */
  unit: string;
  /** Unit price (price per unit) */
  unitPrice: number;
  /** Total price for this line (quantity * unitPrice) */
  totalPrice: number;
  /** DGI tax code (0, 1, 2, or 3) */
  taxCode: DGITaxCode;
  /** Tax rate percentage */
  taxRate: number;
  /** Tax amount for this line */
  taxAmount: number;
  /** Internal tax rate code (mapped from DGI code) */
  taxRateCode: TaxRateCode;
  /** Product code/barcode if available */
  productCode?: string;
}

// =====================================================
// CAFE INVOICE TYPES
// =====================================================

/**
 * Parsed CAFE invoice data
 */
export interface CAFEInvoice {
  /** CUFE - Código Único de Factura Electrónica */
  cufe: string;
  /** Invoice number */
  invoiceNumber: string;
  /** Point of sale identifier */
  pointOfSale?: string;
  /** Issue date */
  issueDate: string;
  /** Authorization date */
  authorizationDate?: string;
  /** Authorization protocol number */
  authorizationProtocol?: string;

  // Emitter (Store/Business) information
  emitter: {
    /** RUC (tax ID) of the business */
    ruc: string;
    /** Business name */
    name: string;
    /** DV (verification digit) */
    dv?: string;
    /** Branch/location name */
    branch?: string;
    /** Address */
    address?: string;
    /** Phone number */
    phone?: string;
  };

  // Receiver (Customer) information
  receiver?: {
    /** RUC or ID of the customer */
    ruc?: string;
    /** Customer name */
    name?: string;
    /** Customer type (1=Contribuyente, 2=Consumidor Final, etc.) */
    type?: string;
  };

  // Items/Lines
  items: CAFEItem[];

  // Totals
  totals: {
    /** Subtotal before tax */
    subtotal: number;
    /** Total tax amount */
    totalTax: number;
    /** Grand total (subtotal + tax) */
    grandTotal: number;
    /** Total taxable amount (base for 7%) */
    taxableAmount7?: number;
    /** Total taxable amount (base for 10%) */
    taxableAmount10?: number;
    /** Total taxable amount (base for 15%) */
    taxableAmount15?: number;
    /** Total exempt amount */
    exemptAmount?: number;
    /** Discount amount if any */
    discount?: number;
    /** Rounding adjustment */
    rounding?: number;
  };

  // Payment information
  payment?: {
    /** Payment method (Efectivo, Tarjeta, etc.) */
    method?: string;
    /** Amount paid */
    amountPaid?: number;
    /** Change given */
    change?: number;
  };

  // Metadata
  metadata: {
    /** Raw XML content (for reference) */
    rawXml?: string;
    /** When this invoice was fetched/imported */
    fetchedAt: string;
    /** Source URL */
    sourceUrl?: string;
  };
}

// =====================================================
// IMPORT STATUS AND RESULTS
// =====================================================

/**
 * Status of a CAFE import operation
 */
export type CAFEImportStatus =
  | 'pending'      // Waiting to start
  | 'fetching'     // Fetching from DGI
  | 'parsing'      // Parsing XML/HTML
  | 'preview'      // Showing preview to user
  | 'importing'    // Creating shopping session
  | 'completed'    // Successfully imported
  | 'error';       // Error occurred

/**
 * Result of fetching a CAFE from DGI
 */
export interface CAFEFetchResult {
  success: boolean;
  invoice?: CAFEInvoice;
  error?: string;
  errorCode?: CAFEErrorCode;
}

/**
 * Error codes for CAFE operations
 */
export type CAFEErrorCode =
  | 'INVALID_CUFE'        // CUFE format is invalid
  | 'NOT_FOUND'           // Invoice not found in DGI
  | 'FETCH_ERROR'         // Network/fetch error
  | 'PARSE_ERROR'         // Error parsing response
  | 'TIMEOUT'             // Request timeout
  | 'RATE_LIMITED'        // Too many requests
  | 'ALREADY_IMPORTED'    // Invoice already imported by user
  | 'UNKNOWN';            // Unknown error

/**
 * Imported invoice record (stored in database)
 */
export interface ImportedInvoice {
  id: string;
  userId: string;
  cufe: string;
  invoiceNumber: string;
  emitterRuc: string;
  emitterName: string;
  issueDate: string;
  grandTotal: number;
  totalTax: number;
  itemCount: number;
  /** Shopping session created from this invoice */
  shoppingSessionId?: string;
  /** Original invoice data (JSON) */
  invoiceData: CAFEInvoice;
  createdAt: string;
  updatedAt: string;
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Convert DGI tax code to internal tax rate code
 */
export function dgiCodeToTaxRateCode(dgiCode: DGITaxCode | string): TaxRateCode {
  const code = dgiCode as DGITaxCode;
  return DGI_TAX_CODE_MAP[code] || 'general';
}

/**
 * Convert DGI tax code to tax rate percentage
 */
export function dgiCodeToTaxRate(dgiCode: DGITaxCode | string): number {
  const code = dgiCode as DGITaxCode;
  return DGI_TAX_RATE_MAP[code] ?? 7;
}

/**
 * Validate CUFE format
 * CUFE format: FE + RUC + timestamp + sequence
 * Example: FE01200000045400-2-299934-0900002022050500000000389990117686690628
 */
export function validateCUFE(cufe: string): boolean {
  // Basic validation - CUFE should start with FE and have a certain length
  if (!cufe || typeof cufe !== 'string') {
    return false;
  }

  const cleanCufe = cufe.trim().toUpperCase();

  // CUFE should start with "FE" for Factura Electrónica
  // NC for Nota de Crédito, ND for Nota de Débito
  const validPrefixes = ['FE', 'NC', 'ND'];
  const hasValidPrefix = validPrefixes.some(prefix => cleanCufe.startsWith(prefix));

  if (!hasValidPrefix) {
    return false;
  }

  // CUFE should be at least 40 characters long (typical format)
  if (cleanCufe.length < 40) {
    return false;
  }

  return true;
}

/**
 * Extract CUFE from a DGI URL
 * URL format: https://dgi-fep.mef.gob.pa/Consultas/FacturasPorCUFE/{CUFE}
 */
export function extractCUFEFromUrl(url: string): string | null {
  if (!url || typeof url !== 'string') {
    return null;
  }

  // Try to extract from DGI URL pattern
  const dgiPattern = /FacturasPorCUFE\/([A-Za-z0-9\-]+)/i;
  const match = url.match(dgiPattern);

  if (match && match[1]) {
    return match[1];
  }

  // If it's not a URL, it might be just the CUFE
  if (validateCUFE(url)) {
    return url.trim().toUpperCase();
  }

  return null;
}

/**
 * Build DGI consultation URL from CUFE
 */
export function buildDGIUrl(cufe: string): string {
  const cleanCufe = cufe.trim();
  return `https://dgi-fep.mef.gob.pa/Consultas/FacturasPorCUFE/${cleanCufe}`;
}

/**
 * Format CUFE for display (truncated with ellipsis)
 */
export function formatCUFEForDisplay(cufe: string, maxLength: number = 20): string {
  if (!cufe) return '';
  if (cufe.length <= maxLength) return cufe;
  return `${cufe.substring(0, maxLength)}...`;
}

/**
 * Parse date from DGI format
 * DGI uses ISO 8601 format: 2022-05-05T12:30:00
 */
export function parseDGIDate(dateString: string): Date | null {
  if (!dateString) return null;

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return null;
    }
    return date;
  } catch {
    return null;
  }
}

/**
 * Format currency for display (Panama uses USD)
 */
export function formatCAFECurrency(amount: number): string {
  return new Intl.NumberFormat('es-PA', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}
