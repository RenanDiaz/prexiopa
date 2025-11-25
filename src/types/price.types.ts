/**
 * Price Types
 * Tipos relacionados con precios, historial y comparaciones
 */

/**
 * Moneda utilizada
 */
export enum Currency {
  USD = 'USD',
  PAB = 'PAB', // Balboa panameño (equivalente a USD)
}

/**
 * Unidad de medida para precios
 */
export enum PriceUnit {
  UNIT = 'unidad',
  KG = 'kg',
  LB = 'lb',
  G = 'g',
  OZ = 'oz',
  L = 'l',
  ML = 'ml',
  GAL = 'gal',
  PACK = 'pack',
}

/**
 * Registro de precio de un producto en una tienda
 */
export interface Price {
  /** ID único del registro de precio */
  id: string;
  /** ID del producto */
  productId: string;
  /** ID de la tienda */
  storeId: string;
  /** Precio regular (precio unitario) */
  price: number;
  /** Precio con descuento (si aplica) - deprecated, use discount instead */
  discountPrice?: number;
  /** Moneda */
  currency: Currency;
  /** Unidad de medida */
  unit: PriceUnit;
  /** Indica si el producto está disponible */
  isAvailable: boolean;
  /** Fecha y hora del registro */
  recordedAt: Date;
  /** ID de la ubicación específica (opcional) */
  locationId?: string;
  /** Fuente del dato (ej: 'web_scraping', 'manual', 'api') */
  source?: string;
  /** Notas adicionales */
  notes?: string;
}

/**
 * Registro de precio extendido con soporte para deals y promociones
 * (Fase 5.2 - Enhanced Price Tracking)
 */
export interface PriceEntry {
  /** ID único del registro de precio */
  id: string;
  /** ID del producto */
  product_id: string;
  /** ID de la tienda */
  store_id: string;
  /** Precio unitario */
  price: number;
  /** Cantidad (para deals como "2 por $5") */
  quantity: number;
  /** Descuento aplicado (ej: $1 de descuento) */
  discount: number;
  /** Precio total pagado (price * quantity - discount) */
  total_price: number;
  /** ¿Es precio promocional? */
  is_promotion: boolean;
  /** Notas sobre el deal (ej: "2x1", "3 por $10") */
  notes?: string;
  /** Fecha del precio */
  date: string;
  /** Usuario que reportó el precio */
  reported_by?: string;
  /** ¿Está en stock? */
  in_stock: boolean;
  /** Fecha de creación */
  created_at?: string;
  /** Información de la tienda */
  store?: {
    id: string;
    name: string;
    logo: string;
  };
  /** Información del producto */
  product?: {
    id: string;
    name: string;
    unit?: string;
    measurement_value?: number;
  };
}

/**
 * Entrada para crear un nuevo precio
 */
export interface CreatePriceEntry {
  product_id: string;
  store_id: string;
  price: number;
  quantity?: number;
  discount?: number;
  total_price?: number;
  is_promotion?: boolean;
  notes?: string;
  date?: string;
  in_stock?: boolean;
}

/**
 * Precio con información de deal calculada
 */
export interface PriceWithDeal extends PriceEntry {
  /** Precio efectivo por unidad (total_price / quantity) */
  effective_unit_price: number;
  /** Porcentaje de ahorro */
  savings_percentage: number;
  /** Etiqueta del deal para mostrar */
  deal_label?: string;
}

/**
 * Formatea el label de un deal para mostrar
 */
export function formatDealLabel(priceEntry: PriceEntry): string | null {
  if (!priceEntry.is_promotion && priceEntry.quantity === 1 && priceEntry.discount === 0) {
    return null;
  }

  if (priceEntry.notes) {
    return priceEntry.notes;
  }

  if (priceEntry.quantity > 1) {
    return `${priceEntry.quantity} por $${priceEntry.total_price.toFixed(2)}`;
  }

  if (priceEntry.discount > 0) {
    return `$${priceEntry.discount.toFixed(2)} de descuento`;
  }

  if (priceEntry.is_promotion) {
    return 'Oferta';
  }

  return null;
}

/**
 * Calcula el precio efectivo por unidad
 */
export function calculateEffectiveUnitPrice(priceEntry: PriceEntry): number {
  if (priceEntry.quantity <= 0) {
    return priceEntry.price;
  }
  return Math.round((priceEntry.total_price / priceEntry.quantity) * 100) / 100;
}

/**
 * Calcula el porcentaje de ahorro
 */
export function calculateSavingsPercentage(priceEntry: PriceEntry): number {
  const regularTotal = priceEntry.price * priceEntry.quantity;
  if (regularTotal <= 0 || priceEntry.discount <= 0) {
    return 0;
  }
  return Math.round((priceEntry.discount / regularTotal) * 100 * 10) / 10;
}

/**
 * Punto de datos en el historial de precios
 */
export interface PriceHistoryPoint {
  /** Precio en ese momento */
  price: number;
  /** Precio con descuento (si aplica) */
  discountPrice?: number;
  /** Fecha del registro */
  date: Date;
  /** Indica si estaba disponible */
  isAvailable: boolean;
}

/**
 * Periodo de tiempo para análisis de historial
 */
export enum HistoryPeriod {
  WEEK = '7d',
  MONTH = '30d',
  THREE_MONTHS = '90d',
  SIX_MONTHS = '180d',
  YEAR = '365d',
  ALL = 'all',
}

/**
 * Historial de precios de un producto en una tienda
 */
export interface PriceHistory {
  /** ID del producto */
  productId: string;
  /** ID de la tienda */
  storeId: string;
  /** Array de puntos de precio históricos */
  prices: PriceHistoryPoint[];
  /** Periodo del historial */
  period: HistoryPeriod;
  /** Precio mínimo en el periodo */
  minPrice: number;
  /** Precio máximo en el periodo */
  maxPrice: number;
  /** Precio promedio en el periodo */
  averagePrice: number;
  /** Precio actual */
  currentPrice: number;
}

/**
 * Precio de un producto en una tienda específica para comparación
 */
export interface StorePriceComparison {
  /** ID de la tienda */
  storeId: string;
  /** Nombre de la tienda */
  storeName: string;
  /** Logo de la tienda */
  storeLogo?: string;
  /** Precio actual */
  price: number;
  /** Precio con descuento (si aplica) */
  discountPrice?: number;
  /** Porcentaje de descuento */
  discountPercentage?: number;
  /** Indica si está disponible */
  isAvailable: boolean;
  /** Fecha del último registro */
  lastUpdated: Date;
  /** Diferencia con el precio más bajo */
  differenceFromLowest?: number;
  /** Porcentaje de diferencia con el precio más bajo */
  percentageDifferenceFromLowest?: number;
  /** Ubicaciones donde está disponible */
  availableLocations?: string[];
}

/**
 * Comparación de precios de un producto entre tiendas
 */
export interface PriceComparison {
  /** Información del producto */
  product: {
    id: string;
    name: string;
    brand: string;
    image?: string;
  };
  /** Array de precios por tienda */
  prices: StorePriceComparison[];
  /** Mejor precio (más bajo) */
  bestPrice: number;
  /** Tienda con el mejor precio */
  bestStore?: StorePriceComparison;
  /** Precio promedio entre tiendas */
  averagePrice: number;
  /** Precio más alto */
  highestPrice: number;
  /** Número de tiendas comparadas */
  storeCount: number;
  /** Fecha de la comparación */
  comparedAt: Date;
}

/**
 * Estadísticas de precio para un producto
 */
export interface PriceStatistics {
  /** ID del producto */
  productId: string;
  /** Precio mínimo histórico */
  allTimeMin: number;
  /** Precio máximo histórico */
  allTimeMax: number;
  /** Precio promedio histórico */
  allTimeAverage: number;
  /** Precio actual promedio */
  currentAverage: number;
  /** Tendencia de precio ('rising' | 'falling' | 'stable') */
  trend: 'rising' | 'falling' | 'stable';
  /** Porcentaje de cambio en el último periodo */
  changePercentage: number;
  /** Mejor día para comprar (0=Domingo, 6=Sábado) */
  bestDayToBuy?: number;
  /** Última actualización */
  lastUpdated: Date;
}

/**
 * Parámetros para registrar un nuevo precio
 */
export type CreatePriceInput = Omit<Price, 'id' | 'recordedAt'>;

/**
 * Parámetros para consultar historial de precios
 */
export interface PriceHistoryQuery {
  productId: string;
  storeId?: string;
  period?: HistoryPeriod;
  startDate?: Date;
  endDate?: Date;
}
