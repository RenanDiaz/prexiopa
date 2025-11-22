/**
 * Shopping Service
 *
 * Servicio para gestionar sesiones de compra y listas de compras.
 * Permite crowdsourcing de precios mientras los usuarios compran.
 */

import { supabase } from '../../supabaseClient';

/**
 * Shopping session status
 */
export type SessionStatus = 'in_progress' | 'completed' | 'cancelled';

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
}

/**
 * Create session input
 */
export interface CreateSessionData {
  store_id?: string | null;
  store_name?: string | null;
  date?: string;
  notes?: string;
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
  const subtotal = input.price * (input.quantity || 1);

  const { data, error } = await supabase
    .from('shopping_items')
    .insert({
      session_id: input.session_id,
      product_id: input.product_id || null,
      product_name: input.product_name,
      price: input.price,
      quantity: input.quantity || 1,
      unit: input.unit || 'unidad',
      subtotal,
      store_id: input.store_id || null,
      store_name: input.store_name || null,
      purchased: false,
      notes: input.notes || null,
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
  // Get current item to calculate new subtotal if needed
  const { data: currentItem } = await supabase
    .from('shopping_items')
    .select('*')
    .eq('id', id)
    .single();

  const updateData: any = { ...input };

  // Recalculate subtotal if price or quantity changed
  if (currentItem && (input.price !== undefined || input.quantity !== undefined)) {
    const newPrice = input.price ?? currentItem.price;
    const newQuantity = input.quantity ?? currentItem.quantity;
    updateData.subtotal = newPrice * newQuantity;
  }

  const { data, error } = await supabase
    .from('shopping_items')
    .update(updateData)
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
