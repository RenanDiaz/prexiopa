/**
 * Search Types
 * Tipos relacionados con búsqueda y filtrado de productos
 */

import type { ProductCategory } from './product.types';
import type { StoreChain } from './store.types';

/**
 * Opciones de ordenamiento
 */
export enum SortOption {
  /** Ordenar por relevancia (default para búsquedas con texto) */
  RELEVANCE = 'relevance',
  /** Ordenar por precio ascendente */
  PRICE_ASC = 'price_asc',
  /** Ordenar por precio descendente */
  PRICE_DESC = 'price_desc',
  /** Ordenar por nombre A-Z */
  NAME_ASC = 'name_asc',
  /** Ordenar por nombre Z-A */
  NAME_DESC = 'name_desc',
  /** Ordenar por descuento (mayor primero) */
  DISCOUNT = 'discount',
  /** Ordenar por productos más nuevos */
  NEWEST = 'newest',
  /** Ordenar por popularidad */
  POPULAR = 'popular',
  /** Ordenar por rating */
  RATING = 'rating',
}

/**
 * Rango de precios para filtrar
 */
export interface PriceRange {
  /** Precio mínimo */
  min?: number;
  /** Precio máximo */
  max?: number;
}

/**
 * Filtros de búsqueda
 */
export interface SearchFilters {
  /** Categorías de productos */
  categories?: ProductCategory[];
  /** IDs de tiendas específicas */
  stores?: string[];
  /** Cadenas de supermercados */
  chains?: StoreChain[];
  /** Rango de precios */
  priceRange?: PriceRange;
  /** Marcas específicas */
  brands?: string[];
  /** Solo productos en stock */
  inStock?: boolean;
  /** Solo productos con descuento */
  onSale?: boolean;
  /** Porcentaje mínimo de descuento */
  minDiscountPercentage?: number;
  /** Tags de productos */
  tags?: string[];
  /** Ubicación del usuario (para filtrar por tiendas cercanas) */
  location?: {
    latitude: number;
    longitude: number;
    radiusKm?: number;
  };
}

/**
 * Parámetros de paginación
 */
export interface PaginationParams {
  /** Número de página (1-indexed) */
  page: number;
  /** Cantidad de resultados por página */
  pageSize: number;
  /** Total de resultados disponibles */
  total?: number;
  /** Total de páginas */
  totalPages?: number;
}

/**
 * Query completo de búsqueda
 */
export interface SearchQuery {
  /** Texto de búsqueda */
  query?: string;
  /** Filtros aplicados */
  filters?: SearchFilters;
  /** Opción de ordenamiento */
  sort?: SortOption;
  /** Parámetros de paginación */
  pagination?: PaginationParams;
}

/**
 * Resultado individual de búsqueda
 */
export interface SearchResultItem {
  /** ID del producto */
  id: string;
  /** Nombre del producto */
  name: string;
  /** Marca */
  brand: string;
  /** Categoría */
  category: ProductCategory;
  /** Imagen principal */
  image?: string;
  /** Precio más bajo actual */
  lowestPrice?: number;
  /** Precio promedio */
  averagePrice?: number;
  /** Precio con descuento */
  discountPrice?: number;
  /** Porcentaje de descuento */
  discountPercentage?: number;
  /** Tienda con mejor precio */
  bestStore?: {
    id: string;
    name: string;
    logo?: string;
  };
  /** Número de tiendas donde está disponible */
  availableStores?: number;
  /** Score de relevancia (para ordenamiento) */
  relevanceScore?: number;
  /** Indica si está en favoritos del usuario */
  isFavorite?: boolean;
  /** Indica si tiene alerta activa */
  hasActiveAlert?: boolean;
}

/**
 * Resultado completo de búsqueda
 */
export interface SearchResult {
  /** Array de productos encontrados */
  products: SearchResultItem[];
  /** Total de resultados */
  total: number;
  /** Página actual */
  page: number;
  /** Tamaño de página */
  pageSize: number;
  /** Total de páginas */
  totalPages: number;
  /** Filtros aplicados */
  appliedFilters?: SearchFilters;
  /** Ordenamiento aplicado */
  appliedSort?: SortOption;
  /** Tiempo de búsqueda en ms */
  searchTime?: number;
  /** Sugerencias de búsqueda (si no hay resultados) */
  suggestions?: string[];
}

/**
 * Facetas/agregaciones para filtros
 */
export interface SearchFacets {
  /** Categorías disponibles con conteo */
  categories: Array<{
    category: ProductCategory;
    count: number;
  }>;
  /** Marcas disponibles con conteo */
  brands: Array<{
    brand: string;
    count: number;
  }>;
  /** Tiendas disponibles con conteo */
  stores: Array<{
    storeId: string;
    storeName: string;
    count: number;
  }>;
  /** Cadenas disponibles con conteo */
  chains: Array<{
    chain: StoreChain;
    count: number;
  }>;
  /** Rango de precios disponible */
  priceRange: {
    min: number;
    max: number;
  };
}

/**
 * Resultado de búsqueda con facetas
 */
export interface SearchResultWithFacets extends SearchResult {
  /** Facetas para construir filtros */
  facets: SearchFacets;
}

/**
 * Sugerencia de autocompletado
 */
export interface AutocompleteSuggestion {
  /** Texto de la sugerencia */
  text: string;
  /** Tipo de sugerencia */
  type: 'product' | 'brand' | 'category';
  /** ID del producto/marca (si aplica) */
  id?: string;
  /** Imagen (si es producto) */
  image?: string;
  /** Número de resultados para esta sugerencia */
  resultCount?: number;
  /** Score de relevancia */
  score?: number;
}

/**
 * Historial de búsqueda del usuario
 */
export interface SearchHistory {
  /** ID del usuario */
  userId: string;
  /** Término de búsqueda */
  query: string;
  /** Filtros usados */
  filters?: SearchFilters;
  /** Fecha de búsqueda */
  searchedAt: Date;
  /** Número de resultados obtenidos */
  resultsCount?: number;
}

/**
 * Búsqueda guardada
 */
export interface SavedSearch {
  /** ID de la búsqueda guardada */
  id: string;
  /** ID del usuario */
  userId: string;
  /** Nombre de la búsqueda */
  name: string;
  /** Query guardado */
  query: SearchQuery;
  /** Notificar cuando haya nuevos resultados */
  notifyOnNewResults?: boolean;
  /** Fecha de creación */
  createdAt: Date;
  /** Última vez que se ejecutó */
  lastRunAt?: Date;
}

/**
 * Parámetros para búsqueda rápida
 */
export interface QuickSearchParams {
  query: string;
  limit?: number;
  includeProducts?: boolean;
  includeBrands?: boolean;
  includeCategories?: boolean;
}
