/**
 * Product Types
 * Tipos relacionados con productos en la plataforma Prexiopá
 */

/**
 * Unidades de medida válidas para productos
 */
export type ProductUnit = 'L' | 'mL' | 'kg' | 'g' | 'lb' | 'oz' | 'un';

/**
 * Labels de visualización para unidades base
 */
export const UNIT_BASE_LABELS: Record<ProductUnit, string> = {
  L: '/L',
  mL: '/L',
  kg: '/kg',
  g: '/kg',
  lb: '/kg',
  oz: '/kg',
  un: '/un',
};

/**
 * Nombres completos de las unidades
 */
export const UNIT_NAMES: Record<ProductUnit, string> = {
  L: 'Litros',
  mL: 'Mililitros',
  kg: 'Kilogramos',
  g: 'Gramos',
  lb: 'Libras',
  oz: 'Onzas',
  un: 'Unidades',
};

/**
 * Categorías de productos disponibles en Prexiopá
 */
export enum ProductCategory {
  ALIMENTOS = 'alimentos',
  BEBIDAS = 'bebidas',
  LIMPIEZA = 'limpieza',
  CUIDADO_PERSONAL = 'cuidado_personal',
  HOGAR = 'hogar',
  MASCOTAS = 'mascotas',
  BEBES = 'bebes',
  ELECTRONICA = 'electronica',
  FARMACIA = 'farmacia',
  CONGELADOS = 'congelados',
  PANADERIA = 'panaderia',
  CARNES = 'carnes',
  FRUTAS_VERDURAS = 'frutas_verduras',
  LACTEOS = 'lacteos',
  SNACKS = 'snacks',
  OTROS = 'otros',
}

/**
 * Imagen de producto con metadata
 */
export interface ProductImage {
  /** URL de la imagen */
  url: string;
  /** Texto alternativo para accesibilidad */
  alt: string;
  /** Indica si es la imagen principal del producto */
  isPrimary: boolean;
  /** Ancho de la imagen en píxeles (opcional) */
  width?: number;
  /** Alto de la imagen en píxeles (opcional) */
  height?: number;
}

/**
 * Información completa de un producto
 */
export interface Product {
  /** ID único del producto */
  id: string;
  /** Nombre del producto */
  name: string;
  /** Descripción detallada del producto */
  description?: string;
  /** Marca del producto */
  brand?: string;
  /** Categoría del producto */
  category?: ProductCategory | string;
  /** Código de barras (UPC/EAN) */
  barcode?: string;
  /** Imágenes del producto */
  images?: ProductImage[];
  /** Imagen principal (backward compatibility) */
  image?: string;
  /** Unidad de medida (L, mL, kg, g, lb, oz, un) */
  unit?: ProductUnit | string;
  /** Valor de la medida (ej: 1 para 1L, 500 para 500g, 12 para 12 unidades) */
  measurement_value?: number;
  /** @deprecated Use measurement_value instead */
  unitQuantity?: number;
  /** Porcentaje de impuesto (0 para exento, 7 para ITBMS en Panamá) */
  tax_percentage?: number;
  /** Precio por unidad base calculado ($/L, $/kg, $/un) */
  price_per_base_unit?: number;
  /** Tags para búsqueda y filtrado */
  tags?: string[];
  /** Fecha de creación del registro */
  createdAt?: Date | string;
  /** Fecha de última actualización */
  updatedAt?: Date | string;
  /** Precios asociados (backward compatibility) */
  prices?: any[];
  /** Campos adicionales de la base de datos */
  created_at?: string;
  updated_at?: string;
  /** Lowest price (backward compatibility) */
  lowest_price?: number;
  /** Store with lowest price (backward compatibility) */
  store_with_lowest_price?: {
    id: string;
    name: string;
    logo: string;
    website?: string;
  };
}

/**
 * Versión simplificada de producto para listados
 */
export interface ProductSummary {
  id: string;
  name: string;
  brand: string;
  category: ProductCategory;
  image?: string;
  /** Precio más bajo actual */
  lowestPrice?: number;
  /** Precio promedio actual */
  averagePrice?: number;
}

/**
 * Producto con información de precio agregada
 */
export interface ProductWithPrice extends Product {
  /** Precio actual más bajo */
  currentPrice?: number;
  /** Tienda con el precio más bajo */
  bestStore?: string;
  /** Indica si hay descuento activo */
  hasDiscount?: boolean;
  /** Porcentaje de descuento */
  discountPercentage?: number;
}

/**
 * Parámetros para crear un nuevo producto
 */
export type CreateProductInput = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Parámetros para actualizar un producto
 */
export type UpdateProductInput = Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>;

/**
 * Calcula el precio por unidad base ($/L, $/kg, $/un)
 * @param price - Precio del producto
 * @param unit - Unidad de medida
 * @param measurementValue - Valor de la medida
 * @returns Precio normalizado por unidad base
 */
export function calculatePricePerBaseUnit(
  price: number,
  unit?: ProductUnit | string | null,
  measurementValue?: number | null
): number | null {
  if (!unit || !measurementValue || measurementValue === 0) {
    return null;
  }

  let pricePerBase: number;

  switch (unit) {
    // Volume: normalize to Liters
    case 'L':
      pricePerBase = price / measurementValue;
      break;
    case 'mL':
      pricePerBase = (price * 1000) / measurementValue;
      break;

    // Weight: normalize to Kilograms
    case 'kg':
      pricePerBase = price / measurementValue;
      break;
    case 'g':
      pricePerBase = (price * 1000) / measurementValue;
      break;
    case 'lb':
      pricePerBase = (price / 0.453592) / measurementValue;
      break;
    case 'oz':
      pricePerBase = (price / 0.0283495) / measurementValue;
      break;

    // Count: normalize to single unit
    case 'un':
      pricePerBase = price / measurementValue;
      break;

    default:
      return null;
  }

  return Math.round(pricePerBase * 100) / 100;
}

/**
 * Formatea el precio por unidad base para mostrar
 * @param pricePerBaseUnit - Precio por unidad base
 * @param unit - Unidad de medida
 * @returns String formateado (ej: "$1.50/L")
 */
export function formatPricePerBaseUnit(
  pricePerBaseUnit: number | null,
  unit?: ProductUnit | string | null
): string | null {
  if (pricePerBaseUnit === null || !unit) {
    return null;
  }

  const baseLabel = UNIT_BASE_LABELS[unit as ProductUnit] || '';
  return `$${pricePerBaseUnit.toFixed(2)}${baseLabel}`;
}

/**
 * Formatea la medida del producto para mostrar
 * @param measurementValue - Valor de la medida
 * @param unit - Unidad de medida
 * @returns String formateado (ej: "500g", "1L", "12 un")
 */
export function formatProductMeasurement(
  measurementValue?: number | null,
  unit?: ProductUnit | string | null
): string | null {
  if (!measurementValue || !unit) {
    return null;
  }

  // For units, add space before
  if (unit === 'un') {
    return `${measurementValue} un`;
  }

  return `${measurementValue}${unit}`;
}
