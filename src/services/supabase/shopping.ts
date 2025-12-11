/**
 * Shopping Service
 *
 * Servicio para gestionar sesiones de compra y listas de compras.
 * Permite crowdsourcing de precios mientras los usuarios compran.
 */

import { supabase } from '../../supabaseClient';
import type { TaxRateCode } from '@/types/tax';
import { DEFAULT_TAX_RATE_CODE, DEFAULT_TAX_RATE, calculateBasePrice, calculateTaxAmount } from '@/types/tax';

/**
 * Shopping session status
 */
export type SessionStatus = 'in_progress' | 'completed' | 'cancelled';

/**
 * Shopping session mode (Phase 5.3)
 * - 'planning': Future purchase, uses prices from DB
 * - 'completed': Past purchase, user enters actual paid prices
 */
export type SessionMode = 'planning' | 'completed';

/**
 * Shopping session interface
 */
export interface ShoppingSession {
  id: string;
  user_id: string;
  store_id: string | null;
  store_name?: string | null;
  date: string;
  total: number;
  status: SessionStatus;
  mode: SessionMode;
  notes: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  items?: ShoppingItem[];
}

/**
 * Shopping item interface
 */
export interface ShoppingItem {
  id: string;
  session_id: string;
  product_id: string | null;
  product_name: string;
  price: number;
  quantity: number;
  unit: string;
  subtotal: number;
  store_id?: string | null;
  store_name?: string | null;
  purchased: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Phase 5.3 - Dual Mode fields
  paid_price?: number | null;
  paid_quantity?: number | null;
  paid_discount?: number | null;
  save_to_history?: boolean;
  // Tax fields (ITBMS)
  tax_rate_code?: TaxRateCode;
  tax_rate?: number;
  price_includes_tax?: boolean;
  base_price?: number;
  tax_amount?: number;
  // Promotion fields
  applied_promotion_id?: string | null;
  original_price?: number | null;
  discount_amount?: number | null;
}

/**
 * Create session input
 */
export interface CreateSessionData {
  store_id?: string | null;
  store_name?: string | null;
  date?: string;
  notes?: string;
  mode?: SessionMode;
}

/**
 * Update session input
 */
export interface UpdateSessionInput {
  store_id?: string | null;
  store_name?: string | null;
  status?: SessionStatus;
  notes?: string;
}

/**
 * Create item input
 */
export interface AddItemData {
  session_id: string;
  product_id?: string | null;
  product_name: string;
  price: number;
  quantity?: number;
  unit?: string;
  store_id?: string | null;
  store_name?: string | null;
  notes?: string;
  // Tax fields (ITBMS)
  taxRateCode?: TaxRateCode;
  taxRate?: number;
  priceIncludesTax?: boolean;
  // Promotion fields
  appliedPromotionId?: string | null;
  originalPrice?: number;
  discountAmount?: number;
}

/**
 * Update item input
 */
export interface UpdateItemData {
  product_name?: string;
  price?: number;
  quantity?: number;
  unit?: string;
  purchased?: boolean;
  notes?: string;
  // Phase 5.3 - Dual Mode fields
  paid_price?: number | null;
  paid_quantity?: number | null;
  paid_discount?: number | null;
  save_to_history?: boolean;
}

/**
 * Shopping statistics
 */
export interface ShoppingStats {
  total_sessions: number;
  completed_sessions: number;
  total_spent: number;
  total_items: number;
  avg_session_total: number;
  most_visited_store: string | null;
}

// ============================================
// SHOPPING SESSIONS
// ============================================

/**
 * Get all shopping sessions for authenticated user
 */
export const getShoppingSessions = async (
  status?: SessionStatus
): Promise<ShoppingSession[]> => {
  let query = supabase
    .from('shopping_sessions')
    .select('*')
    .order('date', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching shopping sessions:', error);
    throw new Error(`Failed to fetch shopping sessions: ${error.message}`);
  }

  return data || [];
};

/**
 * Get active shopping session
 */
export const getActiveSession = async (): Promise<ShoppingSession | null> => {
  const { data, error } = await supabase
    .from('shopping_sessions')
    .select('*')
    .eq('status', 'in_progress')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error fetching active session:', error);
    throw new Error(`Failed to fetch active session: ${error.message}`);
  }

  return data;
};

/**
 * Get shopping session by ID
 */
export const getShoppingSession = async (
  id: string
): Promise<ShoppingSession | null> => {
  const { data, error } = await supabase
    .from('shopping_sessions')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching shopping session:', error);
    throw new Error(`Failed to fetch shopping session: ${error.message}`);
  }

  return data;
};

/**
 * Create new shopping session
 */
export const createShoppingSession = async (
  input: CreateSessionData
): Promise<ShoppingSession> => {
  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User must be authenticated to create a shopping session');
  }

  const { data, error } = await supabase
    .from('shopping_sessions')
    .insert({
      user_id: user.id,
      store_id: input.store_id || null,
      store_name: input.store_name || null,
      date: input.date || new Date().toISOString(),
      status: 'in_progress',
      mode: input.mode || 'planning',
      total: 0,
      notes: input.notes || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating shopping session:', error);
    throw new Error(`Failed to create shopping session: ${error.message}`);
  }

  return data;
};

/**
 * Update shopping session
 */
export const updateShoppingSession = async (
  id: string,
  input: UpdateSessionInput
): Promise<ShoppingSession> => {
  const { data, error } = await supabase
    .from('shopping_sessions')
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating shopping session:', error);
    throw new Error(`Failed to update shopping session: ${error.message}`);
  }

  return data;
};

/**
 * Complete shopping session
 */
export const completeShoppingSession = async (
  id: string
): Promise<ShoppingSession> => {
  const { data, error } = await supabase
    .from('shopping_sessions')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error completing shopping session:', error);
    throw new Error(`Failed to complete shopping session: ${error.message}`);
  }

  return data;
};

/**
 * Cancel shopping session
 */
export const cancelShoppingSession = async (
  id: string
): Promise<ShoppingSession> => {
  const { data, error } = await supabase
    .from('shopping_sessions')
    .update({
      status: 'cancelled',
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error cancelling shopping session:', error);
    throw new Error(`Failed to cancel shopping session: ${error.message}`);
  }

  return data;
};

/**
 * Delete shopping session
 */
export const deleteShoppingSession = async (id: string): Promise<void> => {
  const { error } = await supabase.from('shopping_sessions').delete().eq('id', id);

  if (error) {
    console.error('Error deleting shopping session:', error);
    throw new Error(`Failed to delete shopping session: ${error.message}`);
  }
};

// ============================================
// SHOPPING ITEMS
// ============================================

/**
 * Get items for a shopping session
 */
export const getShoppingItems = async (
  sessionId: string
): Promise<ShoppingItem[]> => {
  const { data, error } = await supabase
    .from('shopping_items')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching shopping items:', error);
    throw new Error(`Failed to fetch shopping items: ${error.message}`);
  }

  return data || [];
};

/**
 * Add item to shopping session
 */
export const addShoppingItem = async (
  input: AddItemData
): Promise<ShoppingItem> => {
  // Calculate tax values
  const taxRateCode = input.taxRateCode || DEFAULT_TAX_RATE_CODE;
  const taxRate = input.taxRate ?? DEFAULT_TAX_RATE;
  const priceIncludesTax = input.priceIncludesTax ?? true;
  const quantity = input.quantity || 1;

  // Calculate base price and tax amount
  const basePrice = calculateBasePrice(input.price, taxRate, priceIncludesTax);
  const taxAmount = calculateTaxAmount(basePrice, taxRate, quantity);

  const { data, error } = await supabase
    .from('shopping_items')
    .insert({
      session_id: input.session_id,
      product_id: input.product_id || null,
      product_name: input.product_name,
      price: input.price,
      quantity: quantity,
      unit: input.unit || 'unidad',
      store_id: input.store_id || null,
      store_name: input.store_name || null,
      purchased: false,
      notes: input.notes || null,
      // Tax fields
      tax_rate_code: taxRateCode,
      tax_rate: taxRate,
      price_includes_tax: priceIncludesTax,
      base_price: basePrice,
      tax_amount: taxAmount,
      // Promotion fields
      applied_promotion_id: input.appliedPromotionId || null,
      original_price: input.originalPrice || null,
      discount_amount: input.discountAmount || 0,
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding shopping item:', error);
    throw new Error(`Failed to add shopping item: ${error.message}`);
  }

  // Update session total
  await updateSessionTotal(input.session_id);

  return data;
};

/**
 * Update shopping item
 */
export const updateShoppingItem = async (
  id: string,
  input: UpdateItemData
): Promise<ShoppingItem> => {
  // Get current item's session_id for updating total
  const { data: currentItem } = await supabase
    .from('shopping_items')
    .select('session_id')
    .eq('id', id)
    .single();

  const { data, error } = await supabase
    .from('shopping_items')
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating shopping item:', error);
    throw new Error(`Failed to update shopping item: ${error.message}`);
  }

  // Update session total
  if (currentItem) {
    await updateSessionTotal(currentItem.session_id);
  }

  return data;
};

/**
 * Delete shopping item
 */
export const deleteShoppingItem = async (id: string): Promise<void> => {
  // Get item to know which session to update
  const { data: item } = await supabase
    .from('shopping_items')
    .select('session_id')
    .eq('id', id)
    .single();

  const { error } = await supabase.from('shopping_items').delete().eq('id', id);

  if (error) {
    console.error('Error deleting shopping item:', error);
    throw new Error(`Failed to delete shopping item: ${error.message}`);
  }

  // Update session total
  if (item) {
    await updateSessionTotal(item.session_id);
  }
};

/**
 * Helper: Update session total based on items
 */
const updateSessionTotal = async (sessionId: string): Promise<void> => {
  const { data: items } = await supabase
    .from('shopping_items')
    .select('subtotal')
    .eq('session_id', sessionId);

  const total = items?.reduce((sum, item) => sum + (item.subtotal || 0), 0) || 0;

  await supabase
    .from('shopping_sessions')
    .update({ total })
    .eq('id', sessionId);
};

/**
 * Get user shopping statistics
 */
export const getUserShoppingStats = async (): Promise<ShoppingStats> => {
  const { data: sessions } = await supabase
    .from('shopping_sessions')
    .select('*');

  if (!sessions) {
    return {
      total_sessions: 0,
      completed_sessions: 0,
      total_spent: 0,
      total_items: 0,
      avg_session_total: 0,
      most_visited_store: null,
    };
  }

  const completedSessions = sessions.filter((s) => s.status === 'completed');
  const totalSpent = completedSessions.reduce((sum, s) => sum + s.total, 0);

  // Get total items count
  const { count } = await supabase
    .from('shopping_items')
    .select('*', { count: 'exact', head: true });

  // Find most visited store
  const storeCounts: Record<string, number> = {};
  sessions.forEach((s) => {
    if (s.store_name) {
      storeCounts[s.store_name] = (storeCounts[s.store_name] || 0) + 1;
    }
  });

  const mostVisitedStore =
    Object.keys(storeCounts).length > 0
      ? Object.entries(storeCounts).sort((a, b) => b[1] - a[1])[0][0]
      : null;

  return {
    total_sessions: sessions.length,
    completed_sessions: completedSessions.length,
    total_spent: totalSpent,
    total_items: count || 0,
    avg_session_total:
      completedSessions.length > 0 ? totalSpent / completedSessions.length : 0,
    most_visited_store: mostVisitedStore,
  };
};

// ============================================
// PHASE 5.3 - DUAL MODE FUNCTIONS
// ============================================

/**
 * Get sessions by mode
 */
export const getSessionsByMode = async (
  mode: SessionMode,
  status?: SessionStatus
): Promise<ShoppingSession[]> => {
  let query = supabase
    .from('shopping_sessions')
    .select('*')
    .eq('mode', mode)
    .order('date', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching sessions by mode:', error);
    throw new Error(`Failed to fetch sessions by mode: ${error.message}`);
  }

  return data || [];
};

/**
 * Update item paid prices (for completed mode)
 */
export interface UpdatePaidPriceData {
  paid_price: number;
  paid_quantity?: number;
  paid_discount?: number;
  save_to_history?: boolean;
}

export const updateItemPaidPrice = async (
  itemId: string,
  data: UpdatePaidPriceData
): Promise<ShoppingItem> => {
  const { data: updatedItem, error } = await supabase
    .from('shopping_items')
    .update({
      paid_price: data.paid_price,
      paid_quantity: data.paid_quantity ?? null,
      paid_discount: data.paid_discount ?? 0,
      save_to_history: data.save_to_history ?? true,
    })
    .eq('id', itemId)
    .select()
    .single();

  if (error) {
    console.error('Error updating paid price:', error);
    throw new Error(`Failed to update paid price: ${error.message}`);
  }

  return updatedItem;
};

/**
 * Mark all items in session to save to history
 */
export const markAllItemsForHistory = async (
  sessionId: string,
  saveToHistory: boolean
): Promise<void> => {
  const { error } = await supabase
    .from('shopping_items')
    .update({ save_to_history: saveToHistory })
    .eq('session_id', sessionId)
    .not('product_id', 'is', null);

  if (error) {
    console.error('Error marking items for history:', error);
    throw new Error(`Failed to mark items for history: ${error.message}`);
  }
};

/**
 * Get purchase history (completed sessions with mode='completed')
 */
export const getPurchaseHistory = async (
  limit: number = 20,
  offset: number = 0
): Promise<ShoppingSession[]> => {
  const { data, error } = await supabase
    .from('shopping_sessions')
    .select('*')
    .eq('mode', 'completed')
    .eq('status', 'completed')
    .order('date', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching purchase history:', error);
    throw new Error(`Failed to fetch purchase history: ${error.message}`);
  }

  return data || [];
};

/**
 * Calculate actual total for completed mode (using paid prices)
 */
export const calculateActualTotal = async (sessionId: string): Promise<number> => {
  const { data: items, error } = await supabase
    .from('shopping_items')
    .select('price, quantity, paid_price, paid_quantity, paid_discount')
    .eq('session_id', sessionId);

  if (error) {
    console.error('Error calculating actual total:', error);
    throw new Error(`Failed to calculate actual total: ${error.message}`);
  }

  const total = items?.reduce((sum, item) => {
    const price = item.paid_price ?? item.price;
    const quantity = item.paid_quantity ?? item.quantity;
    const discount = item.paid_discount ?? 0;
    return sum + (price * quantity) - discount;
  }, 0) || 0;

  return total;
};
