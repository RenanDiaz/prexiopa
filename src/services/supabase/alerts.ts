/**
 * Alerts Service
 *
 * Servicio para gestionar alertas de precios de productos.
 * Permite a los usuarios crear alertas cuando un producto alcanza un precio objetivo.
 */

import { supabase } from '../../supabaseClient';

/**
 * Alert interface matching database schema
 */
export interface Alert {
  id: string;
  user_id: string;
  product_id: string;
  store_id: string | null;
  target_price: number;
  active: boolean;
  notified_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Alert with product and store details
 */
export interface AlertWithDetails extends Alert {
  product: {
    id: string;
    name: string;
    image: string;
    brand: string | null;
    category: string;
  };
  store: {
    id: string;
    name: string;
    logo: string;
  } | null;
}

/**
 * Alert summary from database function
 */
export interface AlertSummary {
  alert_id: string;
  product_name: string;
  product_image: string;
  store_name: string;
  target_price: number;
  current_price: number;
  price_diff: number;
  should_notify: boolean;
  created_at: string;
}

/**
 * Create alert input
 */
export interface CreateAlertInput {
  product_id: string;
  store_id?: string | null;
  target_price: number;
}

/**
 * Update alert input
 */
export interface UpdateAlertInput {
  target_price?: number;
  active?: boolean;
  store_id?: string | null;
}

/**
 * Alert filters
 */
export interface AlertFilters {
  active?: boolean;
  product_id?: string;
  store_id?: string;
}

/**
 * Get all alerts for authenticated user
 */
export const getUserAlerts = async (
  filters: AlertFilters = {}
): Promise<AlertWithDetails[]> => {
  let query = supabase
    .from('alerts')
    .select(`
      *,
      product:products (
        id,
        name,
        image,
        brand,
        category
      ),
      store:stores (
        id,
        name,
        logo
      )
    `)
    .order('created_at', { ascending: false });

  // Apply filters
  if (filters.active !== undefined) {
    query = query.eq('active', filters.active);
  }

  if (filters.product_id) {
    query = query.eq('product_id', filters.product_id);
  }

  if (filters.store_id) {
    query = query.eq('store_id', filters.store_id);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching alerts:', error);
    throw new Error(`Failed to fetch alerts: ${error.message}`);
  }

  return data as unknown as AlertWithDetails[];
};

/**
 * Get alert by ID
 */
export const getAlertById = async (id: string): Promise<AlertWithDetails | null> => {
  const { data, error } = await supabase
    .from('alerts')
    .select(`
      *,
      product:products (
        id,
        name,
        image,
        brand,
        category
      ),
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
    console.error('Error fetching alert:', error);
    throw new Error(`Failed to fetch alert: ${error.message}`);
  }

  return data as unknown as AlertWithDetails;
};

/**
 * Get alert summary for authenticated user
 * Uses the database function for optimized querying
 */
export const getUserAlertsSummary = async (): Promise<AlertSummary[]> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase.rpc('get_user_alerts_summary', {
    p_user_id: user.id,
  });

  if (error) {
    console.error('Error fetching alerts summary:', error);
    throw new Error(`Failed to fetch alerts summary: ${error.message}`);
  }

  return data || [];
};

/**
 * Create a new alert
 */
export const createAlert = async (input: CreateAlertInput): Promise<Alert> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('alerts')
    .insert({
      user_id: user.id,
      product_id: input.product_id,
      store_id: input.store_id || null,
      target_price: input.target_price,
      active: true,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating alert:', error);

    // Handle unique constraint violation
    if (error.code === '23505') {
      throw new Error('Ya existe una alerta para este producto en esta tienda');
    }

    throw new Error(`Failed to create alert: ${error.message}`);
  }

  return data;
};

/**
 * Update an existing alert
 */
export const updateAlert = async (
  id: string,
  input: UpdateAlertInput
): Promise<Alert> => {
  const { data, error } = await supabase
    .from('alerts')
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating alert:', error);
    throw new Error(`Failed to update alert: ${error.message}`);
  }

  return data;
};

/**
 * Delete an alert
 */
export const deleteAlert = async (id: string): Promise<void> => {
  const { error } = await supabase.from('alerts').delete().eq('id', id);

  if (error) {
    console.error('Error deleting alert:', error);
    throw new Error(`Failed to delete alert: ${error.message}`);
  }
};

/**
 * Toggle alert active status
 */
export const toggleAlertActive = async (id: string): Promise<Alert> => {
  // First get current status
  const { data: currentAlert, error: fetchError } = await supabase
    .from('alerts')
    .select('active')
    .eq('id', id)
    .single();

  if (fetchError) {
    throw new Error(`Failed to fetch alert: ${fetchError.message}`);
  }

  // Update with opposite value
  return updateAlert(id, { active: !currentAlert.active });
};

/**
 * Check if user has alert for product
 */
export const hasAlertForProduct = async (
  productId: string,
  storeId?: string | null
): Promise<boolean> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return false;
  }

  let query = supabase
    .from('alerts')
    .select('id')
    .eq('user_id', user.id)
    .eq('product_id', productId)
    .eq('active', true);

  if (storeId) {
    query = query.eq('store_id', storeId);
  } else {
    query = query.is('store_id', null);
  }

  const { data, error } = await query.single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return false;
    }
    console.error('Error checking alert:', error);
    return false;
  }

  return !!data;
};

/**
 * Get count of active alerts for user
 */
export const getActiveAlertsCount = async (): Promise<number> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return 0;
  }

  const { count, error } = await supabase
    .from('alerts')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('active', true);

  if (error) {
    console.error('Error counting alerts:', error);
    return 0;
  }

  return count || 0;
};

/**
 * Get alerts that should trigger (price met)
 */
export const getTriggeredAlerts = async (): Promise<AlertSummary[]> => {
  const summary = await getUserAlertsSummary();
  return summary.filter((alert) => alert.should_notify);
};
