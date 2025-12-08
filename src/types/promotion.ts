/**
 * Promotion Types for Prexiopá
 *
 * Supports 7 types of promotions:
 * 1. percentage - 15% off
 * 2. fixed_amount - $2 off or from $6.99 to $4.99
 * 3. buy_x_get_y - Buy 2, get 1 free (3x2, 2x1, etc)
 * 4. bulk_price - Buy 4, each costs $0.76 instead of $0.80 (Ahorra 4)
 * 5. bundle_free - Buy X+Y products, get Z free
 * 6. coupon - Requires coupon code
 * 7. loyalty - Requires loyalty card/stickers
 */

// =====================================================
// PROMOTION TYPES
// =====================================================

export type PromotionType =
  | 'percentage'
  | 'fixed_amount'
  | 'buy_x_get_y'
  | 'bulk_price'
  | 'bundle_free'
  | 'coupon'
  | 'loyalty';

export type PromotionStatus =
  | 'pending'
  | 'verified'
  | 'unverified'
  | 'rejected'
  | 'expired';

export type PromotionProductRole = 'main' | 'required' | 'free';

// =====================================================
// PROMOTION DETAILS BY TYPE
// =====================================================

export interface PercentageDetails {
  discount_percent: number; // e.g., 15 for 15% off
}

export interface FixedAmountDetails {
  original_price?: number; // e.g., 6.99
  promo_price?: number; // e.g., 4.99
  discount_amount?: number; // e.g., 2.00 (alternative to original/promo)
}

export interface BuyXGetYDetails {
  buy_quantity: number; // e.g., 2 (buy 2)
  get_quantity: number; // e.g., 1 (get 1 free)
  pay_quantity: number; // e.g., 2 (pay for 2) - for 3x2: buy 3, pay 2
}

export interface BulkPriceDetails {
  min_quantity: number; // e.g., 4 (minimum to get discount)
  unit_price: number; // e.g., 0.76 (discounted price per unit)
  regular_price: number; // e.g., 0.80 (original price per unit)
}

export interface BundleFreeDetails {
  required_products: string[]; // UUIDs of required products
  required_product_names?: string[]; // Names for display
  free_product_id: string; // UUID of free product
  free_product_name?: string; // Name for display
}

export interface CouponDetails {
  coupon_code: string; // e.g., "SUMMER20"
  discount_percent?: number; // e.g., 20 for 20% off
  discount_amount?: number; // e.g., 5 for $5 off (alternative)
}

export interface LoyaltyDetails {
  stickers_required?: number; // e.g., 10 stickers needed
  card_type?: string; // e.g., "Gold", "Platinum"
  discount_percent?: number; // e.g., 50 for 50% off
  discount_amount?: number; // alternative
}

export type PromotionDetails =
  | PercentageDetails
  | FixedAmountDetails
  | BuyXGetYDetails
  | BulkPriceDetails
  | BundleFreeDetails
  | CouponDetails
  | LoyaltyDetails;

// =====================================================
// MAIN INTERFACES
// =====================================================

export interface Promotion {
  id: string;
  name: string;
  description: string | null;
  promotion_type: PromotionType;
  store_id: string | null;
  store_name: string | null;
  start_date: string | null;
  end_date: string | null;
  is_indefinite: boolean;
  details: PromotionDetails;
  contributor_id: string | null;
  status: PromotionStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  verification_count: number;
  created_at: string;
  updated_at: string;
}

export interface PromotionProduct {
  id: string;
  promotion_id: string;
  product_id: string;
  role: PromotionProductRole;
  created_at: string;
}

export interface PromotionVerification {
  id: string;
  promotion_id: string;
  user_id: string;
  confirmed: boolean;
  comment: string | null;
  created_at: string;
}

// =====================================================
// INPUT TYPES
// =====================================================

export interface CreatePromotionInput {
  name: string;
  description?: string;
  promotion_type: PromotionType;
  store_id?: string;
  store_name?: string;
  start_date?: string;
  end_date?: string;
  is_indefinite?: boolean;
  details: PromotionDetails;
  product_ids: string[]; // Main products that have this promotion
  free_product_id?: string; // For bundle_free type
}

export interface VerifyPromotionInput {
  promotion_id: string;
  confirmed: boolean;
  comment?: string;
}

// =====================================================
// DISPLAY TYPES
// =====================================================

export interface PromotionWithProducts extends Promotion {
  products?: Array<{
    id: string;
    name: string;
    role: PromotionProductRole;
  }>;
}

export interface ProductPromotion {
  id: string;
  name: string;
  description: string | null;
  promotion_type: PromotionType;
  store_id: string | null;
  store_name: string | null;
  start_date: string | null;
  end_date: string | null;
  is_indefinite: boolean;
  details: PromotionDetails;
  status: PromotionStatus;
  verification_count: number;
}

// =====================================================
// CONSTANTS
// =====================================================

export const PROMOTION_TYPE_LABELS: Record<PromotionType, string> = {
  percentage: 'Descuento porcentual',
  fixed_amount: 'Precio especial',
  buy_x_get_y: 'Lleva X, paga Y',
  bulk_price: 'Precio por volumen',
  bundle_free: 'Producto gratis al comprar',
  coupon: 'Cupón de descuento',
  loyalty: 'Cartilla/Stickers',
};

export const PROMOTION_TYPE_DESCRIPTIONS: Record<PromotionType, string> = {
  percentage: 'Ej: 15% de descuento',
  fixed_amount: 'Ej: De $6.99 a $4.99',
  buy_x_get_y: 'Ej: 3x2, 2x1',
  bulk_price: 'Ej: Lleva 4 y cada uno a $0.76',
  bundle_free: 'Ej: Compra 2 nachos y llévate un queso gratis',
  coupon: 'Requiere presentar cupón',
  loyalty: 'Requiere cartilla o stickers',
};

export const PROMOTION_STATUS_LABELS: Record<PromotionStatus, string> = {
  pending: 'Pendiente de revisión',
  verified: 'Verificada',
  unverified: 'Sin verificar',
  rejected: 'Rechazada',
  expired: 'Expirada',
};

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Check if a promotion is currently active based on dates
 */
export function isPromotionActive(promotion: Promotion | ProductPromotion): boolean {
  if (promotion.status !== 'verified' && promotion.status !== 'unverified') {
    return false;
  }

  if (promotion.is_indefinite) {
    return true;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (promotion.start_date) {
    const startDate = new Date(promotion.start_date);
    if (startDate > today) {
      return false;
    }
  }

  if (promotion.end_date) {
    const endDate = new Date(promotion.end_date);
    if (endDate < today) {
      return false;
    }
  }

  return true;
}

/**
 * Calculate the effective discount for display
 */
export function calculateEffectiveDiscount(
  promotion: Promotion | ProductPromotion,
  originalPrice?: number
): { type: 'percent' | 'amount' | 'special'; value: number; label: string } | null {
  const details = promotion.details;

  switch (promotion.promotion_type) {
    case 'percentage': {
      const d = details as PercentageDetails;
      return {
        type: 'percent',
        value: d.discount_percent,
        label: `${d.discount_percent}% OFF`,
      };
    }

    case 'fixed_amount': {
      const d = details as FixedAmountDetails;
      if (d.discount_amount) {
        return {
          type: 'amount',
          value: d.discount_amount,
          label: `$${d.discount_amount.toFixed(2)} OFF`,
        };
      }
      if (d.original_price && d.promo_price) {
        const discount = d.original_price - d.promo_price;
        const percent = Math.round((discount / d.original_price) * 100);
        return {
          type: 'amount',
          value: discount,
          label: `$${d.promo_price.toFixed(2)} (${percent}% OFF)`,
        };
      }
      return null;
    }

    case 'buy_x_get_y': {
      const d = details as BuyXGetYDetails;
      const total = d.buy_quantity + d.get_quantity;
      const freeItems = total - d.pay_quantity;
      const percent = Math.round((freeItems / total) * 100);
      return {
        type: 'special',
        value: percent,
        label: `${total}x${d.pay_quantity}`,
      };
    }

    case 'bulk_price': {
      const d = details as BulkPriceDetails;
      const savings = d.regular_price - d.unit_price;
      const percent = Math.round((savings / d.regular_price) * 100);
      return {
        type: 'special',
        value: percent,
        label: `${d.min_quantity}+ a $${d.unit_price.toFixed(2)} c/u`,
      };
    }

    case 'bundle_free': {
      return {
        type: 'special',
        value: 0,
        label: 'Producto GRATIS',
      };
    }

    case 'coupon': {
      const d = details as CouponDetails;
      if (d.discount_percent) {
        return {
          type: 'percent',
          value: d.discount_percent,
          label: `${d.discount_percent}% con cupón`,
        };
      }
      if (d.discount_amount) {
        return {
          type: 'amount',
          value: d.discount_amount,
          label: `$${d.discount_amount.toFixed(2)} con cupón`,
        };
      }
      return null;
    }

    case 'loyalty': {
      const d = details as LoyaltyDetails;
      if (d.discount_percent) {
        return {
          type: 'percent',
          value: d.discount_percent,
          label: `${d.discount_percent}% con cartilla`,
        };
      }
      if (d.discount_amount) {
        return {
          type: 'amount',
          value: d.discount_amount,
          label: `$${d.discount_amount.toFixed(2)} con cartilla`,
        };
      }
      return null;
    }

    default:
      return null;
  }
}

/**
 * Format promotion validity dates for display
 */
export function formatPromotionValidity(promotion: Promotion | ProductPromotion): string {
  if (promotion.is_indefinite) {
    return 'Promoción permanente';
  }

  if (!promotion.start_date && !promotion.end_date) {
    return 'Fechas no especificadas';
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-PA', { day: 'numeric', month: 'short' });
  };

  if (promotion.start_date && promotion.end_date) {
    return `Del ${formatDate(promotion.start_date)} al ${formatDate(promotion.end_date)}`;
  }

  if (promotion.start_date) {
    return `Desde ${formatDate(promotion.start_date)}`;
  }

  if (promotion.end_date) {
    return `Hasta ${formatDate(promotion.end_date)}`;
  }

  return '';
}

/**
 * Get promotion badge color based on status
 */
export function getPromotionBadgeColor(
  status: PromotionStatus
): 'success' | 'warning' | 'error' | 'info' | 'default' {
  switch (status) {
    case 'verified':
      return 'success';
    case 'unverified':
      return 'warning';
    case 'pending':
      return 'info';
    case 'rejected':
      return 'error';
    case 'expired':
      return 'default';
    default:
      return 'default';
  }
}

/**
 * Generate a short description for a promotion
 */
export function getPromotionShortDescription(promotion: Promotion | ProductPromotion): string {
  const details = promotion.details;

  switch (promotion.promotion_type) {
    case 'percentage': {
      const d = details as PercentageDetails;
      return `${d.discount_percent}% de descuento`;
    }

    case 'fixed_amount': {
      const d = details as FixedAmountDetails;
      if (d.promo_price) {
        return `Precio especial: $${d.promo_price.toFixed(2)}`;
      }
      if (d.discount_amount) {
        return `$${d.discount_amount.toFixed(2)} de descuento`;
      }
      return 'Precio especial';
    }

    case 'buy_x_get_y': {
      const d = details as BuyXGetYDetails;
      const total = d.buy_quantity + d.get_quantity;
      return `Lleva ${total}, paga ${d.pay_quantity}`;
    }

    case 'bulk_price': {
      const d = details as BulkPriceDetails;
      return `Lleva ${d.min_quantity}+ a $${d.unit_price.toFixed(2)} c/u`;
    }

    case 'bundle_free': {
      const d = details as BundleFreeDetails;
      return d.free_product_name
        ? `Llévate ${d.free_product_name} gratis`
        : 'Producto gratis incluido';
    }

    case 'coupon': {
      const d = details as CouponDetails;
      return `Cupón: ${d.coupon_code}`;
    }

    case 'loyalty': {
      const d = details as LoyaltyDetails;
      if (d.stickers_required) {
        return `Con ${d.stickers_required} stickers`;
      }
      return 'Promoción con cartilla';
    }

    default:
      return promotion.name;
  }
}
