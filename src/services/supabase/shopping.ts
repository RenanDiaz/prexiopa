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
export type ShoppingSessionStatus = 'in_progress' | 'completed' | 'cancelled';

/**
 * Shopping session interface
 */
export interface ShoppingSession {
  id: string;
  user_id: string;
  store_id: string | null;
  date: string;
  total: number;
  status: ShoppingSessionStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

/**
 * Shopping session with store details
 */
export interface ShoppingSessionWithStore extends ShoppingSession {
  store: {
    id: string;
    name: string;
    logo: string;
  } | null;
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
  notes: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Shopping item with product details
 */
export interface ShoppingItemWithProduct extends ShoppingItem {
  product: {
    id: string;
    name: string;
    image: string;
    brand: string | null;
    category: string;
  } | null;
}

/**
 * Create session input
 */
export interface CreateSessionInput {
  store_id?: string | null;
  date?: string;
  notes?: string;
}

/**
 * Update session input
 */
export interface UpdateSessionInput {
  store_id?: string | null;
  status?: ShoppingSessionStatus;
  notes?: string;
}

/**
 * Create item input
 */
export interface CreateItemInput {
  session_id: string;
  product_id?: string | null;
  product_name: string;
  price: number;
  quantity?: number;
  unit?: string;
  notes?: string;
}

/**
 * Update item input
 */
export interface UpdateItemInput {
  product_name?: string;
  price?: number;
  quantity?: number;
  unit?: string;
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
export const getUserShoppingSessions = async (
  status?: ShoppingSessionStatus
): Promise<ShoppingSessionWithStore[]> => {
  let query = supabase
    .from('shopping_sessions')
    .select(`
      *,
      store:stores (
        id,
        name,
        logo
      )
    `)
    .order('date', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching shopping sessions:', error);
    throw new Error(`Failed to fetch shopping sessions: ${error.message}`);
  }

  return data as unknown as ShoppingSessionWithStore[];
};

/**
 * Get shopping session by ID
 */
export const getShoppingSessionById = async (
  id: string
): Promise<ShoppingSessionWithStore | null> => {
  const { data, error } = await supabase
    .from('shopping_sessions')
    .select(`
      *,
      store:stores (
        id,
        name,
        logo
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching shopping session:', error);
    throw new Error(`Failed to fetch shopping session: ${error.message}`);
  }

  return data as unknown as ShoppingSessionWithStore;
};

/**
 * Get active shopping session for current user
 */
export const getActiveShoppingSession = async (): Promise<ShoppingSessionWithStore | null> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase.rpc('get_active_shopping_session', {
    p_user_id: user.id,
  });

  if (error) {
    console.error('Error fetching active session:', error);
    throw new Error(`Failed to fetch active session: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return getShoppingSessionById(data);
};

/**
 * Create a new shopping session
 */
export const createShoppingSession = async (
  input: CreateSessionInput = {}
): Promise<ShoppingSession> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('shopping_sessions')
    .insert({
      user_id: user.id,
      store_id: input.store_id || null,
      date: input.date || new Date().toISOString().split('T')[0],
      notes: input.notes || null,
      status: 'in_progress',
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
 * Complete shopping session (updates prices in database)
 */
export const completeShoppingSession = async (id: string): Promise<boolean> => {
  const { data, error } = await supabase.rpc('complete_shopping_session', {
    p_session_id: id,
  });

  if (error) {
    console.error('Error completing shopping session:', error);
    throw new Error(`Failed to complete shopping session: ${error.message}`);
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
export const getSessionItems = async (
  sessionId: string
): Promise<ShoppingItemWithProduct[]> => {
  const { data, error } = await supabase
    .from('shopping_items')
    .select(`
      *,
      product:products (
        id,
        name,
        image,
        brand,
        category
      )
    `)
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching shopping items:', error);
    throw new Error(`Failed to fetch shopping items: ${error.message}`);
  }

  return data as unknown as ShoppingItemWithProduct[];
};

/**
 * Add item to shopping session
 */
export const addShoppingItem = async (
  input: CreateItemInput
): Promise<ShoppingItem> => {
  const { data, error } = await supabase
    .from('shopping_items')
    .insert({
      session_id: input.session_id,
      product_id: input.product_id || null,
      product_name: input.product_name,
      price: input.price,
      quantity: input.quantity || 1,
      unit: input.unit || 'unidad',
      notes: input.notes || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding shopping item:', error);
    throw new Error(`Failed to add shopping item: ${error.message}`);
  }

  return data;
};

/**
 * Update shopping item
 */
export const updateShoppingItem = async (
  id: string,
  input: UpdateItemInput
): Promise<ShoppingItem> => {
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

  return data;
};

/**
 * Delete shopping item
 */
export const deleteShoppingItem = async (id: string): Promise<void> => {
  const { error } = await supabase.from('shopping_items').delete().eq('id', id);

  if (error) {
    console.error('Error deleting shopping item:', error);
    throw new Error(`Failed to delete shopping item: ${error.message}`);
  }
};

// ============================================
// STATISTICS
// ============================================

/**
 * Get shopping statistics for current user
 */
export const getUserShoppingStats = async (): Promise<ShoppingStats> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase.rpc('get_user_shopping_stats', {
    p_user_id: user.id,
  });

  if (error) {
    console.error('Error fetching shopping stats:', error);
    throw new Error(`Failed to fetch shopping stats: ${error.message}`);
  }

  return data?.[0] || {
    total_sessions: 0,
    completed_sessions: 0,
    total_spent: 0,
    total_items: 0,
    avg_session_total: 0,
    most_visited_store: null,
  };
};

/**
 * Get or create active shopping session
 */
export const getOrCreateActiveSession = async (
  storeId?: string | null
): Promise<ShoppingSessionWithStore> => {
  // Try to get active session
  const activeSession = await getActiveShoppingSession();

  if (activeSession) {
    // Update store if provided and different
    if (storeId && activeSession.store_id !== storeId) {
      const updated = await updateShoppingSession(activeSession.id, {
        store_id: storeId,
      });
      return { ...activeSession, ...updated };
    }
    return activeSession;
  }

  // Create new session
  const newSession = await createShoppingSession({ store_id: storeId });
  return getShoppingSessionById(newSession.id) as Promise<ShoppingSessionWithStore>;
};
