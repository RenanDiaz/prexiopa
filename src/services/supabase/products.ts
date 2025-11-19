/**
 * Products Service
 * Funciones para interactuar con la tabla de productos en Supabase
 */

import { supabase } from '../../supabaseClient';
import type { Product } from '../../types/product';

export interface ProductFilters {
  query?: string;
  category?: string;
  storeId?: string;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
  offset?: number;
}

export interface ProductPrice {
  id: string;
  product_id: string;
  store_id: string;
  price: number;
  date: string;
  in_stock: boolean;
  store?: {
    id: string;
    name: string;
    logo: string;
  };
}

/**
 * Obtener lista de productos con filtros opcionales
 */
export const getProducts = async (filters: ProductFilters = {}): Promise<Product[]> => {
  try {
    let query = supabase
      .from('products')
      .select(`
        *,
        prices (
          id,
          price,
          store_id,
          in_stock,
          date,
          stores (
            id,
            name,
            logo
          )
        )
      `);

    // Aplicar filtro de búsqueda por nombre
    if (filters.query) {
      query = query.ilike('name', `%${filters.query}%`);
    }

    // Aplicar filtro de categoría
    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    // Aplicar paginación
    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    }

    // Ordenar por nombre
    query = query.order('name', { ascending: true });

    const { data, error } = await query;

    if (error) {
      console.error('[Products Service] Error fetching products:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('[Products Service] Unexpected error:', error);
    throw error;
  }
};

/**
 * Obtener producto por ID
 */
export const getProductById = async (id: string): Promise<Product | null> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        prices (
          id,
          price,
          store_id,
          in_stock,
          date,
          stores (
            id,
            name,
            logo,
            website
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('[Products Service] Error fetching product:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('[Products Service] Unexpected error:', error);
    throw error;
  }
};

/**
 * Obtener producto por código de barras
 */
export const getProductByBarcode = async (barcode: string): Promise<Product | null> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        prices (
          id,
          price,
          store_id,
          in_stock,
          date,
          stores (
            id,
            name,
            logo
          )
        )
      `)
      .eq('barcode', barcode)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No se encontró el producto
        return null;
      }
      console.error('[Products Service] Error fetching product by barcode:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('[Products Service] Unexpected error:', error);
    throw error;
  }
};

/**
 * Obtener historial de precios de un producto
 */
export const getProductPrices = async (productId: string): Promise<ProductPrice[]> => {
  try {
    const { data, error } = await supabase
      .from('prices')
      .select(`
        *,
        stores (
          id,
          name,
          logo
        )
      `)
      .eq('product_id', productId)
      .order('date', { ascending: false });

    if (error) {
      console.error('[Products Service] Error fetching product prices:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('[Products Service] Unexpected error:', error);
    throw error;
  }
};

/**
 * Buscar productos (autocompletado)
 */
export const searchProducts = async (query: string, limit: number = 10): Promise<Product[]> => {
  try {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const { data, error } = await supabase
      .from('products')
      .select('id, name, image, category, brand')
      .ilike('name', `%${query}%`)
      .limit(limit);

    if (error) {
      console.error('[Products Service] Error searching products:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('[Products Service] Unexpected error:', error);
    throw error;
  }
};

/**
 * Obtener categorías únicas de productos
 */
export const getCategories = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('category')
      .not('category', 'is', null);

    if (error) {
      console.error('[Products Service] Error fetching categories:', error);
      throw error;
    }

    // Extraer categorías únicas
    const categories = [...new Set(data.map((item: any) => item.category))];
    return categories;
  } catch (error) {
    console.error('[Products Service] Unexpected error:', error);
    throw error;
  }
};
