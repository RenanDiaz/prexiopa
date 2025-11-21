/**
 * Stores Service
 * Funciones para interactuar con la tabla de tiendas en Supabase
 */

import { supabase } from '../../supabaseClient';
import type { Store as StoreType } from '@/types/store.types';

export type Store = StoreType;

/**
 * Obtener todas las tiendas
 */
export const getStores = async (): Promise<Store[]> => {
  try {
    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('[Stores Service] Error fetching stores:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('[Stores Service] Unexpected error:', error);
    throw error;
  }
};

/**
 * Obtener tienda por ID
 */
export const getStoreById = async (id: string): Promise<Store | null> => {
  try {
    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('[Stores Service] Error fetching store:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('[Stores Service] Unexpected error:', error);
    throw error;
  }
};

/**
 * Obtener productos de una tienda específica
 */
export const getStoreProducts = async (storeId: string) => {
  try {
    const { data, error } = await supabase
      .from('prices')
      .select(`
        *,
        products (
          id,
          name,
          image,
          category,
          brand
        )
      `)
      .eq('store_id', storeId)
      .eq('in_stock', true)
      .order('price', { ascending: true });

    if (error) {
      console.error('[Stores Service] Error fetching store products:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('[Stores Service] Unexpected error:', error);
    throw error;
  }
};
