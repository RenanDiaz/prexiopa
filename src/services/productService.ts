/**
 * Product Service
 * Servicio para gestión de productos
 */

import apiClient from './api';
import type {
  ApiResponse,
  PaginatedResponse,
  QueryParams,
} from '../types/api.types';
import type {
  Product,
  ProductSummary,
  ProductWithPrice,
  ProductCategory,
} from '../types/product.types';

/**
 * Parámetros para obtener productos
 */
export interface GetProductsParams extends QueryParams {
  category?: ProductCategory;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  storeId?: string;
  tags?: string[];
}

/**
 * Parámetros para búsqueda de productos
 */
export interface SearchProductsParams extends QueryParams {
  query: string;
  category?: ProductCategory;
  storeId?: string;
}

/**
 * Obtiene listado de productos con paginación
 * @param params Parámetros de consulta y filtros
 * @returns Promise con respuesta paginada de productos
 */
export const getAllProducts = async (
  params?: GetProductsParams
): Promise<PaginatedResponse<ProductSummary>> => {
  try {
    const response = await apiClient.get<PaginatedResponse<ProductSummary>>('/products', {
      params,
    });
    return response.data;
  } catch (error) {
    console.error('[productService] Error al obtener productos:', error);
    throw error;
  }
};

/**
 * Obtiene un producto específico por ID
 * @param id ID del producto
 * @returns Promise con el producto completo
 */
export const getProductById = async (id: string): Promise<ApiResponse<Product>> => {
  try {
    const response = await apiClient.get<ApiResponse<Product>>(`/products/${id}`);
    return response.data;
  } catch (error) {
    console.error(`[productService] Error al obtener producto ${id}:`, error);
    throw error;
  }
};

/**
 * Obtiene productos por categoría
 * @param category Categoría de productos
 * @param params Parámetros adicionales de consulta
 * @returns Promise con respuesta paginada de productos
 */
export const getProductsByCategory = async (
  category: ProductCategory,
  params?: QueryParams
): Promise<PaginatedResponse<ProductSummary>> => {
  try {
    const response = await apiClient.get<PaginatedResponse<ProductSummary>>(
      `/products/category/${category}`,
      { params }
    );
    return response.data;
  } catch (error) {
    console.error(`[productService] Error al obtener productos de categoría ${category}:`, error);
    throw error;
  }
};

/**
 * Busca un producto por código de barras
 * @param barcode Código de barras (UPC/EAN)
 * @returns Promise con el producto encontrado
 */
export const getProductByBarcode = async (barcode: string): Promise<ApiResponse<Product>> => {
  try {
    const response = await apiClient.get<ApiResponse<Product>>(`/products/barcode/${barcode}`);
    return response.data;
  } catch (error) {
    console.error(`[productService] Error al buscar producto por barcode ${barcode}:`, error);
    throw error;
  }
};

/**
 * Busca productos por texto
 * @param params Parámetros de búsqueda
 * @returns Promise con respuesta paginada de productos
 */
export const searchProducts = async (
  params: SearchProductsParams
): Promise<PaginatedResponse<ProductSummary>> => {
  try {
    const response = await apiClient.get<PaginatedResponse<ProductSummary>>('/products/search', {
      params,
    });
    return response.data;
  } catch (error) {
    console.error('[productService] Error al buscar productos:', error);
    throw error;
  }
};

/**
 * Obtiene los productos más populares/buscados
 * @param limit Número de productos a retornar (default: 10)
 * @returns Promise con array de productos populares
 */
export const getMostPopular = async (
  limit: number = 10
): Promise<ApiResponse<ProductWithPrice[]>> => {
  try {
    const response = await apiClient.get<ApiResponse<ProductWithPrice[]>>(
      '/products/popular',
      {
        params: { limit },
      }
    );
    return response.data;
  } catch (error) {
    console.error('[productService] Error al obtener productos populares:', error);
    throw error;
  }
};

/**
 * Obtiene productos nuevos recién agregados
 * @param limit Número de productos a retornar (default: 10)
 * @returns Promise con array de productos nuevos
 */
export const getNewProducts = async (
  limit: number = 10
): Promise<ApiResponse<ProductWithPrice[]>> => {
  try {
    const response = await apiClient.get<ApiResponse<ProductWithPrice[]>>(
      '/products/new',
      {
        params: { limit },
      }
    );
    return response.data;
  } catch (error) {
    console.error('[productService] Error al obtener productos nuevos:', error);
    throw error;
  }
};

/**
 * Obtiene productos con descuento activo
 * @param params Parámetros de consulta
 * @returns Promise con respuesta paginada de productos en oferta
 */
export const getProductsOnSale = async (
  params?: QueryParams
): Promise<PaginatedResponse<ProductWithPrice>> => {
  try {
    const response = await apiClient.get<PaginatedResponse<ProductWithPrice>>(
      '/products/on-sale',
      { params }
    );
    return response.data;
  } catch (error) {
    console.error('[productService] Error al obtener productos en oferta:', error);
    throw error;
  }
};

/**
 * Obtiene productos de una marca específica
 * @param brand Nombre de la marca
 * @param params Parámetros adicionales
 * @returns Promise con respuesta paginada de productos
 */
export const getProductsByBrand = async (
  brand: string,
  params?: QueryParams
): Promise<PaginatedResponse<ProductSummary>> => {
  try {
    const response = await apiClient.get<PaginatedResponse<ProductSummary>>(
      `/products/brand/${encodeURIComponent(brand)}`,
      { params }
    );
    return response.data;
  } catch (error) {
    console.error(`[productService] Error al obtener productos de marca ${brand}:`, error);
    throw error;
  }
};

/**
 * Obtiene productos relacionados a un producto dado
 * @param productId ID del producto
 * @param limit Número de productos relacionados (default: 5)
 * @returns Promise con array de productos relacionados
 */
export const getRelatedProducts = async (
  productId: string,
  limit: number = 5
): Promise<ApiResponse<ProductSummary[]>> => {
  try {
    const response = await apiClient.get<ApiResponse<ProductSummary[]>>(
      `/products/${productId}/related`,
      {
        params: { limit },
      }
    );
    return response.data;
  } catch (error) {
    console.error(`[productService] Error al obtener productos relacionados:`, error);
    throw error;
  }
};

/**
 * Obtiene todas las marcas disponibles
 * @returns Promise con array de marcas
 */
export const getAllBrands = async (): Promise<ApiResponse<string[]>> => {
  try {
    const response = await apiClient.get<ApiResponse<string[]>>('/products/brands');
    return response.data;
  } catch (error) {
    console.error('[productService] Error al obtener marcas:', error);
    throw error;
  }
};

/**
 * Obtiene estadísticas de productos por categoría
 * @returns Promise con estadísticas
 */
export const getCategoryStats = async (): Promise<
  ApiResponse<Record<ProductCategory, number>>
> => {
  try {
    const response = await apiClient.get<ApiResponse<Record<ProductCategory, number>>>(
      '/products/stats/categories'
    );
    return response.data;
  } catch (error) {
    console.error('[productService] Error al obtener estadísticas de categorías:', error);
    throw error;
  }
};

/**
 * Servicio de productos exportado
 */
export const productService = {
  getAllProducts,
  getProductById,
  getProductsByCategory,
  getProductByBarcode,
  searchProducts,
  getMostPopular,
  getNewProducts,
  getProductsOnSale,
  getProductsByBrand,
  getRelatedProducts,
  getAllBrands,
  getCategoryStats,
};

export default productService;
