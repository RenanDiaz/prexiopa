/**
 * Barcode Validation Utilities
 *
 * Validates and formats different barcode standards:
 * - EAN-8 (8 digits)
 * - EAN-13 (13 digits)
 * - UPC-A (12 digits)
 * - UPC-E (8 digits)
 */

export type BarcodeFormat = 'EAN-8' | 'EAN-13' | 'UPC-A' | 'UPC-E' | 'UNKNOWN';

export interface BarcodeValidationResult {
  isValid: boolean;
  format: BarcodeFormat;
  checksum: number | null;
  expectedChecksum: number | null;
  message: string;
}

/**
 * Calculate EAN-8 checksum
 * Formula: (10 - ((sum of odd positions * 3 + sum of even positions) % 10)) % 10
 */
export function calculateEAN8Checksum(code: string): number {
  const digits = code.substring(0, 7).split('').map(Number);

  // EAN-8: multiply odd positions (1,3,5,7) by 3
  const sum = digits.reduce((acc, digit, index) => {
    const multiplier = index % 2 === 0 ? 3 : 1;
    return acc + digit * multiplier;
  }, 0);

  return (10 - (sum % 10)) % 10;
}

/**
 * Calculate EAN-13 checksum
 * Formula: (10 - ((sum of odd positions * 1 + sum of even positions * 3) % 10)) % 10
 */
export function calculateEAN13Checksum(code: string): number {
  const digits = code.substring(0, 12).split('').map(Number);

  // EAN-13: multiply even positions (2,4,6...) by 3
  const sum = digits.reduce((acc, digit, index) => {
    const multiplier = index % 2 === 0 ? 1 : 3;
    return acc + digit * multiplier;
  }, 0);

  return (10 - (sum % 10)) % 10;
}

/**
 * Calculate UPC-A checksum (same as EAN-13)
 */
export function calculateUPCAChecksum(code: string): number {
  const digits = code.substring(0, 11).split('').map(Number);

  // UPC-A: multiply odd positions by 3
  const sum = digits.reduce((acc, digit, index) => {
    const multiplier = index % 2 === 0 ? 3 : 1;
    return acc + digit * multiplier;
  }, 0);

  return (10 - (sum % 10)) % 10;
}

/**
 * Detect barcode format based on length
 */
export function detectBarcodeFormat(code: string): BarcodeFormat {
  const cleanCode = code.replace(/\D/g, ''); // Remove non-digits

  switch (cleanCode.length) {
    case 8:
      return 'EAN-8';
    case 12:
      return 'UPC-A';
    case 13:
      return 'EAN-13';
    default:
      return 'UNKNOWN';
  }
}

/**
 * Validate EAN-8 barcode
 */
export function validateEAN8(code: string): BarcodeValidationResult {
  const cleanCode = code.replace(/\D/g, '');

  if (cleanCode.length !== 8) {
    return {
      isValid: false,
      format: 'EAN-8',
      checksum: null,
      expectedChecksum: null,
      message: `EAN-8 debe tener 8 dígitos. Recibido: ${cleanCode.length}`,
    };
  }

  const providedChecksum = parseInt(cleanCode[7], 10);
  const calculatedChecksum = calculateEAN8Checksum(cleanCode);

  const isValid = providedChecksum === calculatedChecksum;

  return {
    isValid,
    format: 'EAN-8',
    checksum: providedChecksum,
    expectedChecksum: calculatedChecksum,
    message: isValid
      ? '✅ EAN-8 válido'
      : `❌ Checksum inválido. Esperado: ${calculatedChecksum}, Recibido: ${providedChecksum}`,
  };
}

/**
 * Validate EAN-13 barcode
 */
export function validateEAN13(code: string): BarcodeValidationResult {
  const cleanCode = code.replace(/\D/g, '');

  if (cleanCode.length !== 13) {
    return {
      isValid: false,
      format: 'EAN-13',
      checksum: null,
      expectedChecksum: null,
      message: `EAN-13 debe tener 13 dígitos. Recibido: ${cleanCode.length}`,
    };
  }

  const providedChecksum = parseInt(cleanCode[12], 10);
  const calculatedChecksum = calculateEAN13Checksum(cleanCode);

  const isValid = providedChecksum === calculatedChecksum;

  return {
    isValid,
    format: 'EAN-13',
    checksum: providedChecksum,
    expectedChecksum: calculatedChecksum,
    message: isValid
      ? '✅ EAN-13 válido'
      : `❌ Checksum inválido. Esperado: ${calculatedChecksum}, Recibido: ${providedChecksum}`,
  };
}

/**
 * Validate UPC-A barcode
 */
export function validateUPCA(code: string): BarcodeValidationResult {
  const cleanCode = code.replace(/\D/g, '');

  if (cleanCode.length !== 12) {
    return {
      isValid: false,
      format: 'UPC-A',
      checksum: null,
      expectedChecksum: null,
      message: `UPC-A debe tener 12 dígitos. Recibido: ${cleanCode.length}`,
    };
  }

  const providedChecksum = parseInt(cleanCode[11], 10);
  const calculatedChecksum = calculateUPCAChecksum(cleanCode);

  const isValid = providedChecksum === calculatedChecksum;

  return {
    isValid,
    format: 'UPC-A',
    checksum: providedChecksum,
    expectedChecksum: calculatedChecksum,
    message: isValid
      ? '✅ UPC-A válido'
      : `❌ Checksum inválido. Esperado: ${calculatedChecksum}, Recibido: ${providedChecksum}`,
  };
}

/**
 * Validate barcode (auto-detect format)
 */
export function validateBarcode(code: string): BarcodeValidationResult {
  const cleanCode = code.replace(/\D/g, '');
  const format = detectBarcodeFormat(cleanCode);

  switch (format) {
    case 'EAN-8':
      return validateEAN8(cleanCode);
    case 'EAN-13':
      return validateEAN13(cleanCode);
    case 'UPC-A':
      return validateUPCA(cleanCode);
    default:
      return {
        isValid: false,
        format: 'UNKNOWN',
        checksum: null,
        expectedChecksum: null,
        message: `Formato no reconocido. Longitud: ${cleanCode.length} dígitos. Formatos válidos: EAN-8 (8), UPC-A (12), EAN-13 (13)`,
      };
  }
}

/**
 * Convert UPC-A to EAN-13 (add leading zero)
 */
export function upcaToEAN13(upca: string): string {
  const cleanCode = upca.replace(/\D/g, '');

  if (cleanCode.length !== 12) {
    throw new Error('UPC-A debe tener 12 dígitos');
  }

  return '0' + cleanCode;
}

/**
 * Convert EAN-13 to UPC-A (remove leading zero if present)
 */
export function ean13ToUPCA(ean13: string): string | null {
  const cleanCode = ean13.replace(/\D/g, '');

  if (cleanCode.length !== 13) {
    throw new Error('EAN-13 debe tener 13 dígitos');
  }

  // Only valid if starts with 0
  if (cleanCode[0] !== '0') {
    return null;
  }

  return cleanCode.substring(1);
}

/**
 * Format barcode for display (add spaces for readability)
 */
export function formatBarcodeDisplay(code: string): string {
  const cleanCode = code.replace(/\D/g, '');
  const format = detectBarcodeFormat(cleanCode);

  switch (format) {
    case 'EAN-8':
      // Format: XXXX XXXX
      return cleanCode.replace(/(\d{4})(\d{4})/, '$1 $2');
    case 'UPC-A':
      // Format: X XXXXX XXXXX X
      return cleanCode.replace(/(\d{1})(\d{5})(\d{5})(\d{1})/, '$1 $2 $3 $4');
    case 'EAN-13':
      // Format: X XXXXXX XXXXXX X
      return cleanCode.replace(/(\d{1})(\d{6})(\d{5})(\d{1})/, '$1 $2 $3 $4');
    default:
      return cleanCode;
  }
}

/**
 * Fix common barcode input errors
 */
export function normalizeBarcodeInput(input: string): string {
  return input
    .replace(/\s/g, '') // Remove spaces
    .replace(/[^0-9]/g, '') // Remove non-digits
    .trim();
}

/**
 * Check if barcode is valid for scanning
 * (some formats might not be supported by all scanners)
 */
export function isScannable(code: string): { scannable: boolean; reason?: string } {
  const validation = validateBarcode(code);

  if (!validation.isValid) {
    return {
      scannable: false,
      reason: 'Código inválido: ' + validation.message,
    };
  }

  // EAN-8 might have issues with some scanners
  if (validation.format === 'EAN-8') {
    return {
      scannable: true,
      reason: 'EAN-8 puede tener problemas con algunos scanners. Asegúrate de tener buena iluminación y enfoque.',
    };
  }

  return { scannable: true };
}
