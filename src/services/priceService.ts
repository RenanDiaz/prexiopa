/**
 * Price Service
 * Servicio para gestión de precios, historial y comparaciones
 */

import apiClient from './api';
import type { ApiResponse, PaginatedResponse, QueryParams } from '../types/api.types';
import type {
  Price,
  PriceHistory,
  PriceComparison,
  PriceStatistics,
  StorePriceComparison,
} from '../types/price.types';
import { HistoryPeriod } from '../types/price.types';
import type { ProductWithPrice } from '../types/product.types';

/**
 * Parámetros para filtrar precios
 */
export interface GetPricesParams extends QueryParams {
  storeId?: string;
  minPrice?: number;
  maxPrice?: number;
  onlyAvailable?: boolean;
}

/**
 * Parámetros para obtener historial de precios
 */
export interface GetPriceHistoryParams {
  productId: string;
  storeId?: string;
  period?: HistoryPeriod;
  startDate?: Date;
  endDate?: Date;
}

/**
 * Obtiene los precios actuales de un producto en todas las tiendas
 * @param productId ID del producto
 * @param params Parámetros de filtrado
 * @returns Promise con array de precios
 */
export const getProductPrices = async (
  productId: string,
  params?: GetPricesParams
): Promise<ApiResponse<Price[]>> => {
  try {
    const response = await apiClient.get<ApiResponse<Price[]>>(
      `/prices/product/${productId}`,
      { params }
    );
    return response.data;
  } catch (error) {
    console.error(`[priceService] Error al obtener precios del producto ${productId}:`, error);
    throw error;
  }
};

/**
 * Obtiene el historial de precios de un producto
 * @param params Parámetros de consulta
 * @returns Promise con historial de precios
 */
export const getPriceHistory = async (
  params: GetPriceHistoryParams
): Promise<ApiResponse<PriceHistory>> => {
  try {
    const { productId, storeId, period, startDate, endDate } = params;

    const queryParams: any = {
      period: period || HistoryPeriod.MONTH,
    };

    if (startDate) {
      queryParams.startDate = startDate.toISOString();
    }
    if (endDate) {
      queryParams.endDate = endDate.toISOString();
    }

    const url = storeId
      ? `/prices/history/${productId}/${storeId}`
      : `/prices/history/${productId}`;

    const response = await apiClient.get<ApiResponse<PriceHistory>>(url, {
      params: queryParams,
    });

    return response.data;
  } catch (error) {
    console.error('[priceService] Error al obtener historial de precios:', error);
    throw error;
  }
};

/**
 * Obtiene comparación de precios de un producto entre tiendas
 * @param productId ID del producto
 * @returns Promise con comparación de precios
 */
export const getPriceComparison = async (
  productId: string
): Promise<ApiResponse<PriceComparison>> => {
  try {
    const response = await apiClient.get<ApiResponse<PriceComparison>>(
      `/prices/compare/${productId}`
    );
    return response.data;
  } catch (error) {
    console.error(`[priceService] Error al comparar precios del producto ${productId}:`, error);
    throw error;
  }
};

/**
 * Obtiene las mejores ofertas del día
 * @param limit Número de ofertas a retornar (default: 20)
 * @returns Promise con array de productos en oferta
 */
export const getBestPrices = async (
  limit: number = 20
): Promise<ApiResponse<ProductWithPrice[]>> => {
  try {
    const response = await apiClient.get<ApiResponse<ProductWithPrice[]>>('/prices/best', {
      params: { limit },
    });
    return response.data;
  } catch (error) {
    console.error('[priceService] Error al obtener mejores precios:', error);
    throw error;
  }
};

/**
 * Obtiene productos en un rango de precio específico
 * @param min Precio mínimo
 * @param max Precio máximo
 * @param params Parámetros adicionales
 * @returns Promise con respuesta paginada de productos
 */
export const getProductsByPriceRange = async (
  min: number,
  max: number,
  params?: QueryParams
): Promise<PaginatedResponse<ProductWithPrice>> => {
  try {
    const response = await apiClient.get<PaginatedResponse<ProductWithPrice>>(
      '/prices/range',
      {
        params: {
          ...params,
          min,
          max,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('[priceService] Error al obtener productos por rango de precio:', error);
    throw error;
  }
};

/**
 * Obtiene estadísticas de precio de un producto
 * @param productId ID del producto
 * @returns Promise con estadísticas de precio
 */
export const getPriceStatistics = async (
  productId: string
): Promise<ApiResponse<PriceStatistics>> => {
  try {
    const response = await apiClient.get<ApiResponse<PriceStatistics>>(
      `/prices/stats/${productId}`
    );
    return response.data;
  } catch (error) {
    console.error(`[priceService] Error al obtener estadísticas de precio:`, error);
    throw error;
  }
};

/**
 * Obtiene el precio actual más bajo de un producto
 * @param productId ID del producto
 * @returns Promise con el precio más bajo
 */
export const getLowestPrice = async (
  productId: string
): Promise<ApiResponse<StorePriceComparison>> => {
  try {
    const response = await apiClient.get<ApiResponse<StorePriceComparison>>(
      `/prices/lowest/${productId}`
    );
    return response.data;
  } catch (error) {
    console.error(`[priceService] Error al obtener precio más bajo:`, error);
    throw error;
  }
};

/**
 * Obtiene precios de múltiples productos (batch)
 * @param productIds Array de IDs de productos
 * @returns Promise con mapa de precios por producto
 */
export const getBatchPrices = async (
  productIds: string[]
): Promise<ApiResponse<Record<string, Price[]>>> => {
  try {
    const response = await apiClient.post<ApiResponse<Record<string, Price[]>>>(
      '/prices/batch',
      { productIds }
    );
    return response.data;
  } catch (error) {
    console.error('[priceService] Error al obtener precios en batch:', error);
    throw error;
  }
};

/**
 * Obtiene precios de una tienda específica
 * @param storeId ID de la tienda
 * @param params Parámetros de consulta
 * @returns Promise con respuesta paginada de precios
 */
export const getStoreCurrentPrices = async (
  storeId: string,
  params?: QueryParams
): Promise<PaginatedResponse<Price>> => {
  try {
    const response = await apiClient.get<PaginatedResponse<Price>>(
      `/prices/store/${storeId}`,
      { params }
    );
    return response.data;
  } catch (error) {
    console.error(`[priceService] Error al obtener precios de tienda ${storeId}:`, error);
    throw error;
  }
};

/**
 * Obtiene el historial de cambios de precio de un producto
 * @param productId ID del producto
 * @param limit Número de cambios a retornar (default: 50)
 * @returns Promise con array de cambios de precio
 */
export const getPriceChanges = async (
  productId: string,
  limit: number = 50
): Promise<ApiResponse<Price[]>> => {
  try {
    const response = await apiClient.get<ApiResponse<Price[]>>(
      `/prices/changes/${productId}`,
      {
        params: { limit },
      }
    );
    return response.data;
  } catch (error) {
    console.error('[priceService] Error al obtener cambios de precio:', error);
    throw error;
  }
};

/**
 * Obtiene productos con mayores descuentos
 * @param limit Número de productos a retornar (default: 20)
 * @returns Promise con array de productos con descuento
 */
export const getTopDiscounts = async (
  limit: number = 20
): Promise<ApiResponse<ProductWithPrice[]>> => {
  try {
    const response = await apiClient.get<ApiResponse<ProductWithPrice[]>>(
      '/prices/top-discounts',
      {
        params: { limit },
      }
    );
    return response.data;
  } catch (error) {
    console.error('[priceService] Error al obtener mejores descuentos:', error);
    throw error;
  }
};

/**
 * Compara precios entre tiendas específicas
 * @param productId ID del producto
 * @param storeIds Array de IDs de tiendas a comparar
 * @returns Promise con comparación de precios
 */
export const comparePricesBetweenStores = async (
  productId: string,
  storeIds: string[]
): Promise<ApiResponse<StorePriceComparison[]>> => {
  try {
    const response = await apiClient.post<ApiResponse<StorePriceComparison[]>>(
      `/prices/compare/${productId}/stores`,
      { storeIds }
    );
    return response.data;
  } catch (error) {
    console.error('[priceService] Error al comparar precios entre tiendas:', error);
    throw error;
  }
};

/**
 * Servicio de precios exportado
 */
export const priceService = {
  getProductPrices,
  getPriceHistory,
  getPriceComparison,
  getBestPrices,
  getProductsByPriceRange,
  getPriceStatistics,
  getLowestPrice,
  getBatchPrices,
  getStoreCurrentPrices,
  getPriceChanges,
  getTopDiscounts,
  comparePricesBetweenStores,
};

export default priceService;
