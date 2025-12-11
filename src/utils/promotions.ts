/**
 * Promotion Calculation Helpers
 *
 * Funciones para calcular descuentos según el tipo de promoción.
 * Todas las funciones son puras (sin efectos secundarios).
 */

import type {
  Promotion,
  ProductPromotion,
  PercentageDetails,
  FixedAmountDetails,
  BuyXGetYDetails,
  BulkPriceDetails,
  BundleFreeDetails,
  CouponDetails,
  LoyaltyDetails,
} from '@/types/promotion';

// =====================================================
// TYPES FOR CALCULATION RESULTS
// =====================================================

export interface PromotionCalculationResult {
  /** Original price (unit price * quantity) */
  originalPrice: number;
  /** Final price after discount */
  finalPrice: number;
  /** Amount saved */
  discountAmount: number;
  /** Percentage saved (0-100) */
  discountPercent: number;
  /** Number of free items (for buy_x_get_y) */
  freeItemsCount?: number;
  /** Whether the promotion is applicable */
  isApplicable: boolean;
  /** Reason why promotion is not applicable (if not applicable) */
  notApplicableReason?: string;
}

// =====================================================
// PERCENTAGE DISCOUNT
// =====================================================

/**
 * Calculate percentage discount (e.g., 15% off)
 */
export function calculatePercentageDiscount(
  unitPrice: number,
  quantity: number,
  details: PercentageDetails
): PromotionCalculationResult {
  const originalPrice = unitPrice * quantity;
  const discountPercent = details.discount_percent;
  const discountAmount = originalPrice * (discountPercent / 100);
  const finalPrice = originalPrice - discountAmount;

  return {
    originalPrice,
    finalPrice: Number(finalPrice.toFixed(2)),
    discountAmount: Number(discountAmount.toFixed(2)),
    discountPercent,
    isApplicable: true,
  };
}

// =====================================================
// FIXED AMOUNT DISCOUNT
// =====================================================

/**
 * Calculate fixed amount discount (e.g., $2 off or from $6.99 to $4.99)
 */
export function calculateFixedAmountDiscount(
  unitPrice: number,
  quantity: number,
  details: FixedAmountDetails
): PromotionCalculationResult {
  const originalPrice = unitPrice * quantity;

  // Calculate discount amount
  let discountAmount = 0;
  if (details.discount_amount) {
    // Direct discount amount (e.g., $2 off)
    discountAmount = details.discount_amount * quantity;
  } else if (details.original_price && details.promo_price) {
    // Price difference (e.g., from $6.99 to $4.99)
    const unitDiscount = details.original_price - details.promo_price;
    discountAmount = unitDiscount * quantity;
  }

  const finalPrice = Math.max(0, originalPrice - discountAmount);
  const discountPercent = originalPrice > 0 ? (discountAmount / originalPrice) * 100 : 0;

  return {
    originalPrice,
    finalPrice: Number(finalPrice.toFixed(2)),
    discountAmount: Number(discountAmount.toFixed(2)),
    discountPercent: Number(discountPercent.toFixed(2)),
    isApplicable: true,
  };
}

// =====================================================
// BUY X GET Y (2x1, 3x2, etc.)
// =====================================================

/**
 * Calculate buy X get Y discount (e.g., buy 3, pay for 2)
 */
export function calculateBuyXGetYDiscount(
  unitPrice: number,
  quantity: number,
  details: BuyXGetYDetails
): PromotionCalculationResult {
  const { buy_quantity, pay_quantity } = details;

  // Check if promotion is applicable
  if (quantity < buy_quantity) {
    return {
      originalPrice: unitPrice * quantity,
      finalPrice: unitPrice * quantity,
      discountAmount: 0,
      discountPercent: 0,
      isApplicable: false,
      notApplicableReason: `Necesitas comprar al menos ${buy_quantity} unidades para aplicar esta promoción`,
    };
  }

  // Calculate how many complete sets and remaining items
  const completeSets = Math.floor(quantity / buy_quantity);
  const remainingItems = quantity % buy_quantity;

  // Items you pay for
  const paidItems = completeSets * pay_quantity + remainingItems;
  const freeItems = quantity - paidItems;

  const originalPrice = unitPrice * quantity;
  const finalPrice = unitPrice * paidItems;
  const discountAmount = originalPrice - finalPrice;
  const discountPercent = (discountAmount / originalPrice) * 100;

  return {
    originalPrice,
    finalPrice: Number(finalPrice.toFixed(2)),
    discountAmount: Number(discountAmount.toFixed(2)),
    discountPercent: Number(discountPercent.toFixed(2)),
    freeItemsCount: freeItems,
    isApplicable: true,
  };
}

// =====================================================
// BULK PRICE (Ahorra 4)
// =====================================================

/**
 * Calculate bulk price discount (e.g., buy 4, each costs $0.76 instead of $0.80)
 */
export function calculateBulkPriceDiscount(
  unitPrice: number,
  quantity: number,
  details: BulkPriceDetails
): PromotionCalculationResult {
  const { min_quantity, unit_price: discountedUnitPrice } = details;

  // Check if promotion is applicable
  if (quantity < min_quantity) {
    return {
      originalPrice: unitPrice * quantity,
      finalPrice: unitPrice * quantity,
      discountAmount: 0,
      discountPercent: 0,
      isApplicable: false,
      notApplicableReason: `Necesitas comprar al menos ${min_quantity} unidades para aplicar esta promoción`,
    };
  }

  const originalPrice = unitPrice * quantity;
  const finalPrice = discountedUnitPrice * quantity;
  const discountAmount = originalPrice - finalPrice;
  const discountPercent = (discountAmount / originalPrice) * 100;

  return {
    originalPrice,
    finalPrice: Number(finalPrice.toFixed(2)),
    discountAmount: Number(discountAmount.toFixed(2)),
    discountPercent: Number(discountPercent.toFixed(2)),
    isApplicable: true,
  };
}

// =====================================================
// BUNDLE FREE
// =====================================================

/**
 * Calculate bundle free discount (e.g., buy 2 nachos, get cheese free)
 * Note: This requires checking if user has required products in cart
 */
export function calculateBundleFreeDiscount(
  unitPrice: number,
  quantity: number,
  _details: BundleFreeDetails,
  hasRequiredProducts: boolean = false
): PromotionCalculationResult {
  // This is for when the current product IS the free one
  if (!hasRequiredProducts) {
    return {
      originalPrice: unitPrice * quantity,
      finalPrice: unitPrice * quantity,
      discountAmount: 0,
      discountPercent: 0,
      isApplicable: false,
      notApplicableReason: 'Necesitas comprar los productos requeridos para obtener este producto gratis',
    };
  }

  // User gets the product for free
  const originalPrice = unitPrice * quantity;
  const finalPrice = 0;
  const discountAmount = originalPrice;
  const discountPercent = 100;

  return {
    originalPrice,
    finalPrice,
    discountAmount: Number(discountAmount.toFixed(2)),
    discountPercent,
    isApplicable: true,
  };
}

// =====================================================
// COUPON
// =====================================================

/**
 * Calculate coupon discount
 */
export function calculateCouponDiscount(
  unitPrice: number,
  quantity: number,
  details: CouponDetails,
  providedCouponCode?: string
): PromotionCalculationResult {
  // Validate coupon code
  if (!providedCouponCode || providedCouponCode.trim().toUpperCase() !== details.coupon_code.trim().toUpperCase()) {
    return {
      originalPrice: unitPrice * quantity,
      finalPrice: unitPrice * quantity,
      discountAmount: 0,
      discountPercent: 0,
      isApplicable: false,
      notApplicableReason: 'Código de cupón inválido',
    };
  }

  const originalPrice = unitPrice * quantity;

  // Calculate discount (percentage or fixed amount)
  let discountAmount = 0;
  let discountPercent = 0;

  if (details.discount_percent) {
    discountPercent = details.discount_percent;
    discountAmount = originalPrice * (discountPercent / 100);
  } else if (details.discount_amount) {
    discountAmount = details.discount_amount * quantity;
    discountPercent = (discountAmount / originalPrice) * 100;
  }

  const finalPrice = Math.max(0, originalPrice - discountAmount);

  return {
    originalPrice,
    finalPrice: Number(finalPrice.toFixed(2)),
    discountAmount: Number(discountAmount.toFixed(2)),
    discountPercent: Number(discountPercent.toFixed(2)),
    isApplicable: true,
  };
}

// =====================================================
// LOYALTY (Cartilla de stickers)
// =====================================================

/**
 * Calculate loyalty discount (requires loyalty card/stickers)
 */
export function calculateLoyaltyDiscount(
  unitPrice: number,
  quantity: number,
  details: LoyaltyDetails,
  hasLoyaltyCard: boolean = false
): PromotionCalculationResult {
  if (!hasLoyaltyCard) {
    return {
      originalPrice: unitPrice * quantity,
      finalPrice: unitPrice * quantity,
      discountAmount: 0,
      discountPercent: 0,
      isApplicable: false,
      notApplicableReason: details.stickers_required
        ? `Necesitas ${details.stickers_required} stickers en tu cartilla`
        : 'Necesitas una tarjeta de lealtad',
    };
  }

  const originalPrice = unitPrice * quantity;

  // Calculate discount (percentage or fixed amount)
  let discountAmount = 0;
  let discountPercent = 0;

  if (details.discount_percent) {
    discountPercent = details.discount_percent;
    discountAmount = originalPrice * (discountPercent / 100);
  } else if (details.discount_amount) {
    discountAmount = details.discount_amount * quantity;
    discountPercent = (discountAmount / originalPrice) * 100;
  }

  const finalPrice = Math.max(0, originalPrice - discountAmount);

  return {
    originalPrice,
    finalPrice: Number(finalPrice.toFixed(2)),
    discountAmount: Number(discountAmount.toFixed(2)),
    discountPercent: Number(discountPercent.toFixed(2)),
    isApplicable: true,
  };
}

// =====================================================
// MAIN CALCULATION FUNCTION
// =====================================================

/**
 * Calculate discount for any promotion type
 */
export function calculatePromotionDiscount(
  promotion: Promotion | ProductPromotion,
  unitPrice: number,
  quantity: number,
  options?: {
    couponCode?: string;
    hasLoyaltyCard?: boolean;
    hasRequiredProducts?: boolean;
  }
): PromotionCalculationResult {
  const { promotion_type, details } = promotion;

  switch (promotion_type) {
    case 'percentage':
      return calculatePercentageDiscount(unitPrice, quantity, details as PercentageDetails);

    case 'fixed_amount':
      return calculateFixedAmountDiscount(unitPrice, quantity, details as FixedAmountDetails);

    case 'buy_x_get_y':
      return calculateBuyXGetYDiscount(unitPrice, quantity, details as BuyXGetYDetails);

    case 'bulk_price':
      return calculateBulkPriceDiscount(unitPrice, quantity, details as BulkPriceDetails);

    case 'bundle_free':
      return calculateBundleFreeDiscount(
        unitPrice,
        quantity,
        details as BundleFreeDetails,
        options?.hasRequiredProducts
      );

    case 'coupon':
      return calculateCouponDiscount(unitPrice, quantity, details as CouponDetails, options?.couponCode);

    case 'loyalty':
      return calculateLoyaltyDiscount(unitPrice, quantity, details as LoyaltyDetails, options?.hasLoyaltyCard);

    default:
      // Unknown promotion type
      return {
        originalPrice: unitPrice * quantity,
        finalPrice: unitPrice * quantity,
        discountAmount: 0,
        discountPercent: 0,
        isApplicable: false,
        notApplicableReason: 'Tipo de promoción desconocido',
      };
  }
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Format promotion description for display
 */
export function formatPromotionDescription(promotion: Promotion | ProductPromotion): string {
  const { promotion_type, details } = promotion;

  switch (promotion_type) {
    case 'percentage':
      return `${(details as PercentageDetails).discount_percent}% de descuento`;

    case 'fixed_amount':
      const fixedDetails = details as FixedAmountDetails;
      if (fixedDetails.discount_amount) {
        return `$${fixedDetails.discount_amount.toFixed(2)} de descuento`;
      } else if (fixedDetails.original_price && fixedDetails.promo_price) {
        return `De $${fixedDetails.original_price.toFixed(2)} a $${fixedDetails.promo_price.toFixed(2)}`;
      }
      return 'Descuento especial';

    case 'buy_x_get_y':
      const buyGetDetails = details as BuyXGetYDetails;
      const freeItems = buyGetDetails.buy_quantity - buyGetDetails.pay_quantity;
      if (freeItems === 1 && buyGetDetails.pay_quantity === 1) {
        return `${buyGetDetails.buy_quantity}x1`;
      }
      return `Compra ${buyGetDetails.buy_quantity}, paga ${buyGetDetails.pay_quantity}`;

    case 'bulk_price':
      const bulkDetails = details as BulkPriceDetails;
      return `Ahorra ${bulkDetails.min_quantity}: $${bulkDetails.unit_price.toFixed(2)} c/u`;

    case 'bundle_free':
      return 'Producto gratis con compra';

    case 'coupon':
      const couponDetails = details as CouponDetails;
      if (couponDetails.discount_percent) {
        return `Cupón: ${couponDetails.discount_percent}% OFF`;
      } else if (couponDetails.discount_amount) {
        return `Cupón: $${couponDetails.discount_amount.toFixed(2)} OFF`;
      }
      return 'Descuento con cupón';

    case 'loyalty':
      const loyaltyDetails = details as LoyaltyDetails;
      if (loyaltyDetails.discount_percent) {
        return `Tarjeta de lealtad: ${loyaltyDetails.discount_percent}% OFF`;
      } else if (loyaltyDetails.discount_amount) {
        return `Tarjeta de lealtad: $${loyaltyDetails.discount_amount.toFixed(2)} OFF`;
      }
      return 'Descuento con tarjeta de lealtad';

    default:
      return promotion.name || 'Promoción especial';
  }
}

/**
 * Check if promotion is currently active (within date range)
 */
export function isPromotionActive(promotion: Promotion | ProductPromotion): boolean {
  // Indefinite promotions are always active
  if (promotion.is_indefinite) {
    return true;
  }

  // No dates specified = treat as active
  if (!promotion.start_date && !promotion.end_date) {
    return true;
  }

  const now = new Date();

  // Check start date
  if (promotion.start_date) {
    const startDate = new Date(promotion.start_date);
    if (now < startDate) {
      return false;
    }
  }

  // Check end date
  if (promotion.end_date) {
    const endDate = new Date(promotion.end_date);
    // Set to end of day
    endDate.setHours(23, 59, 59, 999);
    if (now > endDate) {
      return false;
    }
  }

  return true;
}

/**
 * Sort promotions by best discount (for user)
 */
export function sortPromotionsByBestDiscount(
  promotions: Array<{ promotion: Promotion; calculation: PromotionCalculationResult }>
): Array<{ promotion: Promotion; calculation: PromotionCalculationResult }> {
  return promotions.sort((a, b) => {
    // Verified promotions first
    if (a.promotion.status === 'verified' && b.promotion.status !== 'verified') return -1;
    if (a.promotion.status !== 'verified' && b.promotion.status === 'verified') return 1;

    // Then by discount amount (highest first)
    return b.calculation.discountAmount - a.calculation.discountAmount;
  });
}
