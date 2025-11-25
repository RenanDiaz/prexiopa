/**
 * Prices Service
 * Funciones para interactuar con la tabla de precios en Supabase
 * Fase 5.2 - Enhanced Price Tracking
 */

import { supabase } from '../../supabaseClient';
import type { PriceEntry, CreatePriceEntry, PriceWithDeal } from '../../types/price.types';
import {
  formatDealLabel,
  calculateEffectiveUnitPrice,
  calculateSavingsPercentage,
} from '../../types/price.types';

/**
 * Obtener precios de un producto con información de deals
 */
export const getProductPrices = async (productId: string): Promise<PriceWithDeal[]> => {
  try {
    const { data, error } = await supabase
      .from('prices')
      .select(`
        id,
        product_id,
        store_id,
        price,
        quantity,
        discount,
        total_price,
        is_promotion,
        notes,
        date,
        in_stock,
        reported_by,
        created_at,
        stores (
          id,
          name,
          logo
        )
      `)
      .eq('product_id', productId)
      .order('date', { ascending: false });

    if (error) {
      console.error('[Prices Service] Error fetching product prices:', error);
      throw error;
    }

    // Transform to PriceWithDeal
    return (data || []).map((price: any) => ({
      ...price,
      store: price.stores,
      quantity: price.quantity || 1,
      discount: price.discount || 0,
      total_price: price.total_price || price.price,
      is_promotion: price.is_promotion || false,
      effective_unit_price: calculateEffectiveUnitPrice({
        ...price,
        quantity: price.quantity || 1,
        discount: price.discount || 0,
        total_price: price.total_price || price.price,
        is_promotion: price.is_promotion || false,
        in_stock: price.in_stock ?? true,
      }),
      savings_percentage: calculateSavingsPercentage({
        ...price,
        quantity: price.quantity || 1,
        discount: price.discount || 0,
        total_price: price.total_price || price.price,
        is_promotion: price.is_promotion || false,
        in_stock: price.in_stock ?? true,
      }),
      deal_label: formatDealLabel({
        ...price,
        quantity: price.quantity || 1,
        discount: price.discount || 0,
        total_price: price.total_price || price.price,
        is_promotion: price.is_promotion || false,
        in_stock: price.in_stock ?? true,
      }),
    }));
  } catch (error) {
    console.error('[Prices Service] Unexpected error:', error);
    throw error;
  }
};

/**
 * Obtener precios actuales de un producto (más recientes por tienda)
 */
export const getCurrentPrices = async (productId: string): Promise<PriceWithDeal[]> => {
  try {
    // Get most recent price per store
    const { data, error } = await supabase
      .from('prices')
      .select(`
        id,
        product_id,
        store_id,
        price,
        quantity,
        discount,
        total_price,
        is_promotion,
        notes,
        date,
        in_stock,
        stores (
          id,
          name,
          logo
        )
      `)
      .eq('product_id', productId)
      .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]) // Last 30 days
      .order('date', { ascending: false });

    if (error) {
      console.error('[Prices Service] Error fetching current prices:', error);
      throw error;
    }

    // Group by store and get most recent
    const pricesByStore = new Map<string, any>();
    for (const price of data || []) {
      if (!pricesByStore.has(price.store_id)) {
        pricesByStore.set(price.store_id, price);
      }
    }

    // Transform to PriceWithDeal
    return Array.from(pricesByStore.values()).map((price: any) => ({
      ...price,
      store: price.stores,
      quantity: price.quantity || 1,
      discount: price.discount || 0,
      total_price: price.total_price || price.price,
      is_promotion: price.is_promotion || false,
      effective_unit_price: calculateEffectiveUnitPrice({
        ...price,
        quantity: price.quantity || 1,
        discount: price.discount || 0,
        total_price: price.total_price || price.price,
        is_promotion: price.is_promotion || false,
        in_stock: price.in_stock ?? true,
      }),
      savings_percentage: calculateSavingsPercentage({
        ...price,
        quantity: price.quantity || 1,
        discount: price.discount || 0,
        total_price: price.total_price || price.price,
        is_promotion: price.is_promotion || false,
        in_stock: price.in_stock ?? true,
      }),
      deal_label: formatDealLabel({
        ...price,
        quantity: price.quantity || 1,
        discount: price.discount || 0,
        total_price: price.total_price || price.price,
        is_promotion: price.is_promotion || false,
        in_stock: price.in_stock ?? true,
      }),
    }));
  } catch (error) {
    console.error('[Prices Service] Unexpected error:', error);
    throw error;
  }
};

/**
 * Crear un nuevo registro de precio
 */
export const createPrice = async (input: CreatePriceEntry): Promise<PriceEntry> => {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();

    // Calculate total_price if not provided
    const quantity = input.quantity || 1;
    const discount = input.discount || 0;
    const total_price = input.total_price ?? (input.price * quantity - discount);

    const { data, error } = await supabase
      .from('prices')
      .insert({
        product_id: input.product_id,
        store_id: input.store_id,
        price: input.price,
        quantity,
        discount,
        total_price,
        is_promotion: input.is_promotion || false,
        notes: input.notes || null,
        date: input.date || new Date().toISOString().split('T')[0],
        in_stock: input.in_stock ?? true,
        reported_by: user?.id || null,
      })
      .select(`
        *,
        stores (
          id,
          name,
          logo
        )
      `)
      .single();

    if (error) {
      console.error('[Prices Service] Error creating price:', error);
      throw error;
    }

    return {
      ...data,
      store: data.stores,
    };
  } catch (error) {
    console.error('[Prices Service] Unexpected error creating price:', error);
    throw error;
  }
};

/**
 * Obtener precios promocionales activos
 */
export const getActivePromotions = async (limit: number = 10): Promise<PriceWithDeal[]> => {
  try {
    const { data, error } = await supabase
      .from('prices')
      .select(`
        id,
        product_id,
        store_id,
        price,
        quantity,
        discount,
        total_price,
        is_promotion,
        notes,
        date,
        in_stock,
        stores (
          id,
          name,
          logo
        ),
        products (
          id,
          name,
          image,
          unit,
          measurement_value
        )
      `)
      .eq('is_promotion', true)
      .eq('in_stock', true)
      .gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]) // Last 7 days
      .order('date', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[Prices Service] Error fetching promotions:', error);
      throw error;
    }

    return (data || []).map((price: any) => ({
      ...price,
      store: price.stores,
      product: price.products,
      quantity: price.quantity || 1,
      discount: price.discount || 0,
      total_price: price.total_price || price.price,
      effective_unit_price: calculateEffectiveUnitPrice({
        ...price,
        quantity: price.quantity || 1,
        discount: price.discount || 0,
        total_price: price.total_price || price.price,
        is_promotion: true,
        in_stock: true,
      }),
      savings_percentage: calculateSavingsPercentage({
        ...price,
        quantity: price.quantity || 1,
        discount: price.discount || 0,
        total_price: price.total_price || price.price,
        is_promotion: true,
        in_stock: true,
      }),
      deal_label: formatDealLabel({
        ...price,
        quantity: price.quantity || 1,
        discount: price.discount || 0,
        total_price: price.total_price || price.price,
        is_promotion: true,
        in_stock: true,
      }),
    }));
  } catch (error) {
    console.error('[Prices Service] Unexpected error:', error);
    throw error;
  }
};

/**
 * Obtener el mejor deal para un producto
 */
export const getBestDeal = async (productId: string): Promise<PriceWithDeal | null> => {
  try {
    const prices = await getCurrentPrices(productId);

    if (prices.length === 0) {
      return null;
    }

    // Sort by effective unit price (lowest first)
    const sorted = prices
      .filter(p => p.in_stock)
      .sort((a, b) => a.effective_unit_price - b.effective_unit_price);

    return sorted[0] || null;
  } catch (error) {
    console.error('[Prices Service] Unexpected error getting best deal:', error);
    throw error;
  }
};
