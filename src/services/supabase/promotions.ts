/**
 * Promotions Service
 *
 * Service for managing promotions and discounts.
 * Supports crowdsourced promotions with moderation.
 */

import { supabase } from '../../supabaseClient';
import type {
  Promotion,
  ProductPromotion,
  CreatePromotionInput,
  VerifyPromotionInput,
  PromotionWithProducts,
  PromotionType,
} from '@/types/promotion';

// =====================================================
// GET PROMOTIONS
// =====================================================

/**
 * Get active promotions for a product
 */
export async function getProductPromotions(
  productId: string,
  storeId?: string
): Promise<ProductPromotion[]> {
  const { data, error } = await supabase.rpc('get_product_promotions', {
    p_product_id: productId,
    p_store_id: storeId || null,
  });

  if (error) {
    console.error('Error fetching product promotions:', error);
    throw new Error(`Failed to fetch product promotions: ${error.message}`);
  }

  return data || [];
}

/**
 * Get a single promotion by ID with its products
 */
export async function getPromotion(promotionId: string): Promise<PromotionWithProducts | null> {
  const { data: promotion, error } = await supabase
    .from('promotions')
    .select('*')
    .eq('id', promotionId)
    .single();

  if (error) {
    console.error('Error fetching promotion:', error);
    throw new Error(`Failed to fetch promotion: ${error.message}`);
  }

  if (!promotion) {
    return null;
  }

  // Get associated products
  const { data: promotionProducts } = await supabase
    .from('promotion_products')
    .select(`
      product_id,
      role,
      products (
        id,
        name
      )
    `)
    .eq('promotion_id', promotionId);

  const products = promotionProducts?.map((pp) => {
    // Handle both array and single object cases from Supabase join
    const productData = Array.isArray(pp.products) ? pp.products[0] : pp.products;
    return {
      id: (productData as { id: string; name: string })?.id || '',
      name: (productData as { id: string; name: string })?.name || '',
      role: pp.role,
    };
  }).filter(p => p.id) || [];

  return {
    ...promotion,
    products,
  } as PromotionWithProducts;
}

/**
 * Get all active promotions for a store
 */
export async function getStorePromotions(
  storeId: string,
  limit: number = 50
): Promise<Promotion[]> {
  const { data, error } = await supabase
    .from('promotions')
    .select('*')
    .eq('store_id', storeId)
    .in('status', ['verified', 'unverified'])
    .or(`is_indefinite.eq.true,and(start_date.lte.${new Date().toISOString().split('T')[0]},end_date.gte.${new Date().toISOString().split('T')[0]})`)
    .order('verification_count', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching store promotions:', error);
    throw new Error(`Failed to fetch store promotions: ${error.message}`);
  }

  return data || [];
}

/**
 * Get pending promotions for moderation
 */
export async function getPendingPromotions(limit: number = 50): Promise<PromotionWithProducts[]> {
  const { data, error } = await supabase.rpc('get_pending_promotions', {
    p_limit: limit,
  });

  if (error) {
    console.error('Error fetching pending promotions:', error);
    throw new Error(`Failed to fetch pending promotions: ${error.message}`);
  }

  return data || [];
}

/**
 * Get user's contributed promotions
 */
export async function getUserPromotions(userId: string): Promise<Promotion[]> {
  const { data, error } = await supabase
    .from('promotions')
    .select('*')
    .eq('contributor_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user promotions:', error);
    throw new Error(`Failed to fetch user promotions: ${error.message}`);
  }

  return data || [];
}

// =====================================================
// CREATE PROMOTION
// =====================================================

/**
 * Create a new promotion (crowdsourced)
 */
export async function createPromotion(input: CreatePromotionInput): Promise<Promotion> {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User must be authenticated to create a promotion');
  }

  // Create the promotion
  const { data: promotion, error: promotionError } = await supabase
    .from('promotions')
    .insert({
      name: input.name,
      description: input.description || null,
      promotion_type: input.promotion_type,
      store_id: input.store_id || null,
      store_name: input.store_name || null,
      start_date: input.start_date || null,
      end_date: input.end_date || null,
      is_indefinite: input.is_indefinite ?? false,
      details: input.details,
      contributor_id: user.id,
      status: 'unverified', // Start as unverified, can still be used with warning
    })
    .select()
    .single();

  if (promotionError) {
    console.error('Error creating promotion:', promotionError);
    throw new Error(`Failed to create promotion: ${promotionError.message}`);
  }

  // Add main products
  if (input.product_ids && input.product_ids.length > 0) {
    const productLinks = input.product_ids.map((productId) => ({
      promotion_id: promotion.id,
      product_id: productId,
      role: 'main' as const,
    }));

    const { error: linkError } = await supabase
      .from('promotion_products')
      .insert(productLinks);

    if (linkError) {
      console.error('Error linking products to promotion:', linkError);
      // Don't throw, promotion was created successfully
    }
  }

  // Add free product for bundle_free type
  if (input.promotion_type === 'bundle_free' && input.free_product_id) {
    const { error: freeError } = await supabase
      .from('promotion_products')
      .insert({
        promotion_id: promotion.id,
        product_id: input.free_product_id,
        role: 'free',
      });

    if (freeError) {
      console.error('Error linking free product:', freeError);
    }
  }

  return promotion;
}

// =====================================================
// VERIFY PROMOTION
// =====================================================

/**
 * Verify a promotion (user confirms it works)
 */
export async function verifyPromotion(input: VerifyPromotionInput): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User must be authenticated to verify a promotion');
  }

  const { error } = await supabase.rpc('verify_promotion', {
    p_promotion_id: input.promotion_id,
    p_user_id: user.id,
    p_confirmed: input.confirmed,
    p_comment: input.comment || null,
  });

  if (error) {
    console.error('Error verifying promotion:', error);
    throw new Error(`Failed to verify promotion: ${error.message}`);
  }
}

/**
 * Check if user has verified a promotion
 */
export async function hasUserVerified(
  promotionId: string,
  userId: string
): Promise<{ verified: boolean; confirmed?: boolean }> {
  const { data, error } = await supabase
    .from('promotion_verifications')
    .select('confirmed')
    .eq('promotion_id', promotionId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error checking verification:', error);
    return { verified: false };
  }

  if (!data) {
    return { verified: false };
  }

  return { verified: true, confirmed: data.confirmed };
}

// =====================================================
// MODERATION
// =====================================================

/**
 * Approve a promotion (moderator action)
 */
export async function approvePromotion(promotionId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User must be authenticated');
  }

  const { error } = await supabase.rpc('approve_promotion', {
    p_promotion_id: promotionId,
    p_reviewer_id: user.id,
  });

  if (error) {
    console.error('Error approving promotion:', error);
    throw new Error(`Failed to approve promotion: ${error.message}`);
  }
}

/**
 * Reject a promotion (moderator action)
 */
export async function rejectPromotion(promotionId: string, reason: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User must be authenticated');
  }

  const { error } = await supabase.rpc('reject_promotion', {
    p_promotion_id: promotionId,
    p_reviewer_id: user.id,
    p_reason: reason,
  });

  if (error) {
    console.error('Error rejecting promotion:', error);
    throw new Error(`Failed to reject promotion: ${error.message}`);
  }
}

// =====================================================
// UPDATE & DELETE
// =====================================================

/**
 * Update a promotion (only by contributor if pending/unverified)
 */
export async function updatePromotion(
  promotionId: string,
  updates: Partial<CreatePromotionInput>
): Promise<Promotion> {
  const { data, error } = await supabase
    .from('promotions')
    .update({
      name: updates.name,
      description: updates.description,
      start_date: updates.start_date,
      end_date: updates.end_date,
      is_indefinite: updates.is_indefinite,
      details: updates.details,
    })
    .eq('id', promotionId)
    .select()
    .single();

  if (error) {
    console.error('Error updating promotion:', error);
    throw new Error(`Failed to update promotion: ${error.message}`);
  }

  return data;
}

/**
 * Delete a promotion (only by contributor if pending/unverified)
 */
export async function deletePromotion(promotionId: string): Promise<void> {
  const { error } = await supabase
    .from('promotions')
    .delete()
    .eq('id', promotionId);

  if (error) {
    console.error('Error deleting promotion:', error);
    throw new Error(`Failed to delete promotion: ${error.message}`);
  }
}

// =====================================================
// STATISTICS
// =====================================================

/**
 * Get promotion statistics for admin dashboard
 */
export async function getPromotionStats(): Promise<{
  total: number;
  pending: number;
  verified: number;
  unverified: number;
  expired: number;
  byType: Record<PromotionType, number>;
}> {
  const { data, error } = await supabase
    .from('promotions')
    .select('status, promotion_type');

  if (error) {
    console.error('Error fetching promotion stats:', error);
    throw new Error(`Failed to fetch promotion stats: ${error.message}`);
  }

  const stats = {
    total: data?.length || 0,
    pending: 0,
    verified: 0,
    unverified: 0,
    expired: 0,
    byType: {
      percentage: 0,
      fixed_amount: 0,
      buy_x_get_y: 0,
      bulk_price: 0,
      bundle_free: 0,
      coupon: 0,
      loyalty: 0,
    } as Record<PromotionType, number>,
  };

  data?.forEach((p) => {
    // Count by status
    if (p.status === 'pending') stats.pending++;
    else if (p.status === 'verified') stats.verified++;
    else if (p.status === 'unverified') stats.unverified++;
    else if (p.status === 'expired') stats.expired++;

    // Count by type
    if (p.promotion_type in stats.byType) {
      stats.byType[p.promotion_type as PromotionType]++;
    }
  });

  return stats;
}
