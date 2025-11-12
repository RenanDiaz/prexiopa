/**
 * Favorite Service
 * Servicio para gestión de productos favoritos del usuario
 */

import apiClient from './api';
import type { ApiResponse, PaginatedResponse, QueryParams, MutationResponse } from '../types/api.types';
import type { ProductWithPrice, ProductSummary } from '../types/product.types';

/**
 * Parámetros para obtener favoritos
 */
export interface GetFavoritesParams extends QueryParams {
  category?: string;
  onSale?: boolean;
  sortBy?: 'name' | 'price' | 'addedAt';
}

/**
 * Respuesta de sincronización de favoritos
 */
export interface SyncFavoritesResponse {
  synced: string[];
  failed: string[];
  removed: string[];
  total: number;
}

/**
 * Obtiene todos los productos favoritos del usuario autenticado
 * @param params Parámetros de consulta y filtros
 * @returns Promise con respuesta paginada de productos favoritos
 */
export const getUserFavorites = async (
  params?: GetFavoritesParams
): Promise<PaginatedResponse<ProductWithPrice>> => {
  try {
    const response = await apiClient.get<PaginatedResponse<ProductWithPrice>>('/favorites', {
      params,
    });
    return response.data;
  } catch (error) {
    console.error('[favoriteService] Error al obtener favoritos del usuario:', error);
    throw error;
  }
};

/**
 * Obtiene solo los IDs de productos favoritos del usuario
 * Útil para sincronización rápida y verificación de estado
 * @returns Promise con array de IDs de productos favoritos
 */
export const getFavoriteIds = async (): Promise<ApiResponse<string[]>> => {
  try {
    const response = await apiClient.get<ApiResponse<string[]>>('/favorites/ids');
    return response.data;
  } catch (error) {
    console.error('[favoriteService] Error al obtener IDs de favoritos:', error);
    throw error;
  }
};

/**
 * Agrega un producto a favoritos
 * @param productId ID del producto a agregar
 * @returns Promise con resultado de la operación
 */
export const addFavorite = async (productId: string): Promise<MutationResponse<void>> => {
  try {
    const response = await apiClient.post<MutationResponse<void>>('/favorites', {
      productId,
    });
    return response.data;
  } catch (error) {
    console.error(`[favoriteService] Error al agregar producto ${productId} a favoritos:`, error);
    throw error;
  }
};

/**
 * Elimina un producto de favoritos
 * @param productId ID del producto a eliminar
 * @returns Promise con resultado de la operación
 */
export const removeFavorite = async (productId: string): Promise<MutationResponse<void>> => {
  try {
    const response = await apiClient.delete<MutationResponse<void>>(
      `/favorites/${productId}`
    );
    return response.data;
  } catch (error) {
    console.error(
      `[favoriteService] Error al eliminar producto ${productId} de favoritos:`,
      error
    );
    throw error;
  }
};

/**
 * Verifica si un producto está en favoritos
 * @param productId ID del producto
 * @returns Promise con estado de favorito
 */
export const isFavorite = async (
  productId: string
): Promise<ApiResponse<{ isFavorite: boolean }>> => {
  try {
    const response = await apiClient.get<ApiResponse<{ isFavorite: boolean }>>(
      `/favorites/check/${productId}`
    );
    return response.data;
  } catch (error) {
    console.error(`[favoriteService] Error al verificar favorito ${productId}:`, error);
    throw error;
  }
};

/**
 * Sincroniza favoritos locales con el servidor
 * Útil después de trabajar offline o al iniciar sesión
 * @param localIds Array de IDs de productos favoritos locales
 * @returns Promise con resultado de la sincronización
 */
export const syncFavorites = async (
  localIds: string[]
): Promise<ApiResponse<SyncFavoritesResponse>> => {
  try {
    const response = await apiClient.post<ApiResponse<SyncFavoritesResponse>>(
      '/favorites/sync',
      { productIds: localIds }
    );
    return response.data;
  } catch (error) {
    console.error('[favoriteService] Error al sincronizar favoritos:', error);
    throw error;
  }
};

/**
 * Agrega múltiples productos a favoritos en batch
 * @param productIds Array de IDs de productos
 * @returns Promise con resultado de la operación
 */
export const addBatchFavorites = async (
  productIds: string[]
): Promise<MutationResponse<{ added: number; failed: string[] }>> => {
  try {
    const response = await apiClient.post<
      MutationResponse<{ added: number; failed: string[] }>
    >('/favorites/batch', {
      productIds,
    });
    return response.data;
  } catch (error) {
    console.error('[favoriteService] Error al agregar favoritos en batch:', error);
    throw error;
  }
};

/**
 * Elimina múltiples productos de favoritos en batch
 * @param productIds Array de IDs de productos
 * @returns Promise con resultado de la operación
 */
export const removeBatchFavorites = async (
  productIds: string[]
): Promise<MutationResponse<{ removed: number; failed: string[] }>> => {
  try {
    const response = await apiClient.delete<
      MutationResponse<{ removed: number; failed: string[] }>
    >('/favorites/batch', {
      data: { productIds },
    });
    return response.data;
  } catch (error) {
    console.error('[favoriteService] Error al eliminar favoritos en batch:', error);
    throw error;
  }
};

/**
 * Elimina todos los productos de favoritos
 * @returns Promise con resultado de la operación
 */
export const clearAllFavorites = async (): Promise<MutationResponse<{ removed: number }>> => {
  try {
    const response = await apiClient.delete<MutationResponse<{ removed: number }>>(
      '/favorites/all'
    );
    return response.data;
  } catch (error) {
    console.error('[favoriteService] Error al limpiar todos los favoritos:', error);
    throw error;
  }
};

/**
 * Obtiene el conteo de productos favoritos del usuario
 * @returns Promise con el número de favoritos
 */
export const getFavoriteCount = async (): Promise<ApiResponse<{ count: number }>> => {
  try {
    const response = await apiClient.get<ApiResponse<{ count: number }>>('/favorites/count');
    return response.data;
  } catch (error) {
    console.error('[favoriteService] Error al obtener conteo de favoritos:', error);
    throw error;
  }
};

/**
 * Obtiene productos favoritos con descuentos activos
 * @param params Parámetros de consulta
 * @returns Promise con respuesta paginada de favoritos en oferta
 */
export const getFavoritesOnSale = async (
  params?: QueryParams
): Promise<PaginatedResponse<ProductWithPrice>> => {
  try {
    const response = await apiClient.get<PaginatedResponse<ProductWithPrice>>(
      '/favorites/on-sale',
      { params }
    );
    return response.data;
  } catch (error) {
    console.error('[favoriteService] Error al obtener favoritos en oferta:', error);
    throw error;
  }
};

/**
 * Obtiene productos similares a los favoritos del usuario
 * Útil para recomendaciones personalizadas
 * @param limit Número de productos a retornar (default: 10)
 * @returns Promise con array de productos recomendados
 */
export const getSimilarToFavorites = async (
  limit: number = 10
): Promise<ApiResponse<ProductSummary[]>> => {
  try {
    const response = await apiClient.get<ApiResponse<ProductSummary[]>>(
      '/favorites/similar',
      {
        params: { limit },
      }
    );
    return response.data;
  } catch (error) {
    console.error('[favoriteService] Error al obtener productos similares a favoritos:', error);
    throw error;
  }
};

/**
 * Obtiene estadísticas de favoritos del usuario
 * @returns Promise con estadísticas
 */
export const getFavoriteStatistics = async (): Promise<
  ApiResponse<{
    total: number;
    byCategory: Record<string, number>;
    onSaleCount: number;
    averageSavings: number;
    mostFavoritedBrand?: string;
  }>
> => {
  try {
    const response = await apiClient.get<
      ApiResponse<{
        total: number;
        byCategory: Record<string, number>;
        onSaleCount: number;
        averageSavings: number;
        mostFavoritedBrand?: string;
      }>
    >('/favorites/stats');

    return response.data;
  } catch (error) {
    console.error('[favoriteService] Error al obtener estadísticas de favoritos:', error);
    throw error;
  }
};

/**
 * Toggle de favorito (agrega si no existe, elimina si existe)
 * @param productId ID del producto
 * @returns Promise con el nuevo estado
 */
export const toggleFavorite = async (
  productId: string
): Promise<MutationResponse<{ isFavorite: boolean }>> => {
  try {
    const response = await apiClient.post<MutationResponse<{ isFavorite: boolean }>>(
      `/favorites/toggle/${productId}`
    );
    return response.data;
  } catch (error) {
    console.error(`[favoriteService] Error al hacer toggle de favorito ${productId}:`, error);
    throw error;
  }
};

/**
 * Exporta favoritos a un archivo JSON
 * @returns Promise con los datos de exportación
 */
export const exportFavorites = async (): Promise<ApiResponse<ProductSummary[]>> => {
  try {
    const response = await apiClient.get<ApiResponse<ProductSummary[]>>('/favorites/export');
    return response.data;
  } catch (error) {
    console.error('[favoriteService] Error al exportar favoritos:', error);
    throw error;
  }
};

/**
 * Importa favoritos desde un archivo JSON
 * @param favorites Array de productos a importar
 * @returns Promise con resultado de la importación
 */
export const importFavorites = async (
  favorites: Array<{ id?: string; barcode?: string }>
): Promise<MutationResponse<{ imported: number; failed: number }>> => {
  try {
    const response = await apiClient.post<
      MutationResponse<{ imported: number; failed: number }>
    >('/favorites/import', {
      favorites,
    });
    return response.data;
  } catch (error) {
    console.error('[favoriteService] Error al importar favoritos:', error);
    throw error;
  }
};

/**
 * Servicio de favoritos exportado
 */
export const favoriteService = {
  getUserFavorites,
  getFavoriteIds,
  addFavorite,
  removeFavorite,
  isFavorite,
  syncFavorites,
  addBatchFavorites,
  removeBatchFavorites,
  clearAllFavorites,
  getFavoriteCount,
  getFavoritesOnSale,
  getSimilarToFavorites,
  getFavoriteStatistics,
  toggleFavorite,
  exportFavorites,
  importFavorites,
};

export default favoriteService;
