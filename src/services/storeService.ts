/**
 * Store Service
 * Servicio para gestión de tiendas y supermercados
 */

import apiClient from './api';
import type { ApiResponse, PaginatedResponse, QueryParams } from '../types/api.types';
import type {
  Store,
  StoreSummary,
  StoreLocation,
  StoreChain,
  Coordinates,
} from '../types/store.types';
import type { ProductWithPrice } from '../types/product.types';

/**
 * Parámetros para buscar tiendas cercanas
 */
export interface NearbyStoresParams {
  latitude: number;
  longitude: number;
  radius?: number; // Radio en kilómetros (default: 5)
  chain?: StoreChain;
  limit?: number;
}

/**
 * Parámetros para obtener productos de una tienda
 */
export interface StoreProductsParams extends QueryParams {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  onSale?: boolean;
}

/**
 * Obtiene todas las tiendas disponibles
 * @param params Parámetros de consulta
 * @returns Promise con respuesta paginada de tiendas
 */
export const getAllStores = async (
  params?: QueryParams
): Promise<PaginatedResponse<StoreSummary>> => {
  try {
    const response = await apiClient.get<PaginatedResponse<StoreSummary>>('/stores', {
      params,
    });
    return response.data;
  } catch (error) {
    console.error('[storeService] Error al obtener tiendas:', error);
    throw error;
  }
};

/**
 * Obtiene una tienda específica por ID
 * @param id ID de la tienda
 * @returns Promise con información completa de la tienda
 */
export const getStoreById = async (id: string): Promise<ApiResponse<Store>> => {
  try {
    const response = await apiClient.get<ApiResponse<Store>>(`/stores/${id}`);
    return response.data;
  } catch (error) {
    console.error(`[storeService] Error al obtener tienda ${id}:`, error);
    throw error;
  }
};

/**
 * Obtiene tiendas de una cadena específica
 * @param chain Cadena de supermercados
 * @param params Parámetros adicionales
 * @returns Promise con respuesta paginada de tiendas
 */
export const getStoresByChain = async (
  chain: StoreChain,
  params?: QueryParams
): Promise<PaginatedResponse<StoreSummary>> => {
  try {
    const response = await apiClient.get<PaginatedResponse<StoreSummary>>(
      `/stores/chain/${chain}`,
      { params }
    );
    return response.data;
  } catch (error) {
    console.error(`[storeService] Error al obtener tiendas de cadena ${chain}:`, error);
    throw error;
  }
};

/**
 * Obtiene productos disponibles en una tienda
 * @param storeId ID de la tienda
 * @param params Parámetros de consulta y filtros
 * @returns Promise con respuesta paginada de productos
 */
export const getStoreProducts = async (
  storeId: string,
  params?: StoreProductsParams
): Promise<PaginatedResponse<ProductWithPrice>> => {
  try {
    const response = await apiClient.get<PaginatedResponse<ProductWithPrice>>(
      `/stores/${storeId}/products`,
      { params }
    );
    return response.data;
  } catch (error) {
    console.error(`[storeService] Error al obtener productos de tienda ${storeId}:`, error);
    throw error;
  }
};

/**
 * Obtiene tiendas cercanas a una ubicación
 * @param params Parámetros de búsqueda (coordenadas, radio, etc)
 * @returns Promise con array de tiendas cercanas
 */
export const getNearbyStores = async (
  params: NearbyStoresParams
): Promise<ApiResponse<StoreLocation[]>> => {
  try {
    const { latitude, longitude, radius = 5, chain, limit = 10 } = params;

    const response = await apiClient.get<ApiResponse<StoreLocation[]>>('/stores/nearby', {
      params: {
        lat: latitude,
        lng: longitude,
        radius,
        chain,
        limit,
      },
    });

    return response.data;
  } catch (error) {
    console.error('[storeService] Error al obtener tiendas cercanas:', error);
    throw error;
  }
};

/**
 * Obtiene todas las cadenas disponibles
 * @returns Promise con array de cadenas
 */
export const getAllChains = async (): Promise<ApiResponse<StoreChain[]>> => {
  try {
    const response = await apiClient.get<ApiResponse<StoreChain[]>>('/stores/chains');
    return response.data;
  } catch (error) {
    console.error('[storeService] Error al obtener cadenas:', error);
    throw error;
  }
};

/**
 * Obtiene las ubicaciones de una tienda específica
 * @param storeId ID de la tienda
 * @returns Promise con array de ubicaciones
 */
export const getStoreLocations = async (
  storeId: string
): Promise<ApiResponse<StoreLocation[]>> => {
  try {
    const response = await apiClient.get<ApiResponse<StoreLocation[]>>(
      `/stores/${storeId}/locations`
    );
    return response.data;
  } catch (error) {
    console.error(`[storeService] Error al obtener ubicaciones de tienda ${storeId}:`, error);
    throw error;
  }
};

/**
 * Obtiene una ubicación específica de una tienda
 * @param storeId ID de la tienda
 * @param locationId ID de la ubicación
 * @returns Promise con información de la ubicación
 */
export const getStoreLocation = async (
  storeId: string,
  locationId: string
): Promise<ApiResponse<StoreLocation>> => {
  try {
    const response = await apiClient.get<ApiResponse<StoreLocation>>(
      `/stores/${storeId}/locations/${locationId}`
    );
    return response.data;
  } catch (error) {
    console.error('[storeService] Error al obtener ubicación específica:', error);
    throw error;
  }
};

/**
 * Busca tiendas por nombre o descripción
 * @param query Texto de búsqueda
 * @param params Parámetros adicionales
 * @returns Promise con respuesta paginada de tiendas
 */
export const searchStores = async (
  query: string,
  params?: QueryParams
): Promise<PaginatedResponse<StoreSummary>> => {
  try {
    const response = await apiClient.get<PaginatedResponse<StoreSummary>>('/stores/search', {
      params: {
        ...params,
        q: query,
      },
    });
    return response.data;
  } catch (error) {
    console.error('[storeService] Error al buscar tiendas:', error);
    throw error;
  }
};

/**
 * Obtiene tiendas por provincia
 * @param province Nombre de la provincia
 * @param params Parámetros adicionales
 * @returns Promise con respuesta paginada de ubicaciones
 */
export const getStoresByProvince = async (
  province: string,
  params?: QueryParams
): Promise<PaginatedResponse<StoreLocation>> => {
  try {
    const response = await apiClient.get<PaginatedResponse<StoreLocation>>(
      '/stores/locations/province',
      {
        params: {
          ...params,
          province,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(`[storeService] Error al obtener tiendas de provincia ${province}:`, error);
    throw error;
  }
};

/**
 * Obtiene ofertas especiales de una tienda
 * @param storeId ID de la tienda
 * @param params Parámetros de consulta
 * @returns Promise con respuesta paginada de productos en oferta
 */
export const getStoreDeals = async (
  storeId: string,
  params?: QueryParams
): Promise<PaginatedResponse<ProductWithPrice>> => {
  try {
    const response = await apiClient.get<PaginatedResponse<ProductWithPrice>>(
      `/stores/${storeId}/deals`,
      { params }
    );
    return response.data;
  } catch (error) {
    console.error(`[storeService] Error al obtener ofertas de tienda ${storeId}:`, error);
    throw error;
  }
};

/**
 * Verifica si una tienda está operando en este momento
 * @param storeId ID de la tienda
 * @param locationId ID de la ubicación (opcional)
 * @returns Promise con estado de operación
 */
export const checkStoreStatus = async (
  storeId: string,
  locationId?: string
): Promise<ApiResponse<{ isOpen: boolean; nextOpenTime?: string; nextCloseTime?: string }>> => {
  try {
    const url = locationId
      ? `/stores/${storeId}/locations/${locationId}/status`
      : `/stores/${storeId}/status`;

    const response = await apiClient.get<
      ApiResponse<{ isOpen: boolean; nextOpenTime?: string; nextCloseTime?: string }>
    >(url);

    return response.data;
  } catch (error) {
    console.error('[storeService] Error al verificar estado de tienda:', error);
    throw error;
  }
};

/**
 * Obtiene estadísticas de precios de una tienda
 * @param storeId ID de la tienda
 * @returns Promise con estadísticas de la tienda
 */
export const getStoreStatistics = async (
  storeId: string
): Promise<
  ApiResponse<{
    productCount: number;
    averagePrice: number;
    lowestPrice: number;
    highestPrice: number;
    discountCount: number;
  }>
> => {
  try {
    const response = await apiClient.get<
      ApiResponse<{
        productCount: number;
        averagePrice: number;
        lowestPrice: number;
        highestPrice: number;
        discountCount: number;
      }>
    >(`/stores/${storeId}/stats`);

    return response.data;
  } catch (error) {
    console.error(`[storeService] Error al obtener estadísticas de tienda ${storeId}:`, error);
    throw error;
  }
};

/**
 * Calcula la distancia entre una ubicación y una tienda
 * @param coords Coordenadas del usuario
 * @param locationId ID de la ubicación de la tienda
 * @returns Promise con distancia en kilómetros
 */
export const calculateDistance = async (
  coords: Coordinates,
  locationId: string
): Promise<ApiResponse<{ distance: number; unit: 'km' }>> => {
  try {
    const response = await apiClient.post<ApiResponse<{ distance: number; unit: 'km' }>>(
      `/stores/locations/${locationId}/distance`,
      coords
    );
    return response.data;
  } catch (error) {
    console.error('[storeService] Error al calcular distancia:', error);
    throw error;
  }
};

/**
 * Servicio de tiendas exportado
 */
export const storeService = {
  getAllStores,
  getStoreById,
  getStoresByChain,
  getStoreProducts,
  getNearbyStores,
  getAllChains,
  getStoreLocations,
  getStoreLocation,
  searchStores,
  getStoresByProvince,
  getStoreDeals,
  checkStoreStatus,
  getStoreStatistics,
  calculateDistance,
};

export default storeService;
