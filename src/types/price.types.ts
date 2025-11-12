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
  /** Precio regular */
  price: number;
  /** Precio con descuento (si aplica) */
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
