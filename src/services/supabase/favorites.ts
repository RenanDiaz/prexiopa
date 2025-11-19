/**
 * Favorites Service
 * Funciones para interactuar con la tabla de favoritos en Supabase
 */

import { supabase } from '../../supabaseClient';
import type { Product } from '../../types/product';

export interface Favorite {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product?: Product;
}

/**
 * Obtener favoritos de un usuario
 */
export const getFavorites = async (userId: string): Promise<Favorite[]> => {
  try {
    const { data, error } = await supabase
      .from('favorites')
      .select(`
        *,
        products (
          *,
          prices (
            id,
            price,
            store_id,
            in_stock,
            stores (
              id,
              name,
              logo
            )
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Favorites Service] Error fetching favorites:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('[Favorites Service] Unexpected error:', error);
    throw error;
  }
};

/**
 * Agregar producto a favoritos
 */
export const addFavorite = async (userId: string, productId: string): Promise<Favorite> => {
  try {
    // Verificar si ya existe
    const { data: existing } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single();

    if (existing) {
      // Ya existe, obtener el registro completo
      const { data: fullData } = await supabase
        .from('favorites')
        .select('*')
        .eq('id', existing.id)
        .single();
      return fullData as Favorite;
    }

    // Crear nuevo favorito
    const { data, error } = await supabase
      .from('favorites')
      .insert({
        user_id: userId,
        product_id: productId,
      })
      .select()
      .single();

    if (error) {
      console.error('[Favorites Service] Error adding favorite:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('[Favorites Service] Unexpected error:', error);
    throw error;
  }
};

/**
 * Remover producto de favoritos
 */
export const removeFavorite = async (userId: string, productId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);

    if (error) {
      console.error('[Favorites Service] Error removing favorite:', error);
      throw error;
    }
  } catch (error) {
    console.error('[Favorites Service] Unexpected error:', error);
    throw error;
  }
};

/**
 * Verificar si un producto está en favoritos
 */
export const isFavorite = async (userId: string, productId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 es el código para "no rows returned"
      console.error('[Favorites Service] Error checking favorite:', error);
      throw error;
    }

    return !!data;
  } catch (error) {
    console.error('[Favorites Service] Unexpected error:', error);
    return false;
  }
};

/**
 * Obtener IDs de productos favoritos de un usuario
 */
export const getFavoriteProductIds = async (userId: string): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('favorites')
      .select('product_id')
      .eq('user_id', userId);

    if (error) {
      console.error('[Favorites Service] Error fetching favorite IDs:', error);
      throw error;
    }

    return (data || []).map((item) => item.product_id);
  } catch (error) {
    console.error('[Favorites Service] Unexpected error:', error);
    throw error;
  }
};

/**
 * Limpiar todos los favoritos de un usuario
 */
export const clearAllFavorites = async (userId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('[Favorites Service] Error clearing favorites:', error);
      throw error;
    }
  } catch (error) {
    console.error('[Favorites Service] Unexpected error:', error);
    throw error;
  }
};
