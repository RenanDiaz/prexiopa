import ReactGA from 'react-ga4';

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

/**
 * Initialize Google Analytics 4
 * Only initializes if VITE_GA_MEASUREMENT_ID is configured
 */
export function initAnalytics(): void {
  if (!GA_MEASUREMENT_ID) {
    console.log('[Analytics] Measurement ID not configured, skipping initialization');
    return;
  }

  ReactGA.initialize(GA_MEASUREMENT_ID, {
    testMode: import.meta.env.DEV, // Don't send events in development
  });

  console.log(`[Analytics] Initialized (${GA_MEASUREMENT_ID})`);
}

/**
 * Track a page view
 * Call this when the route changes
 */
export function trackPageView(path: string, title?: string): void {
  if (!GA_MEASUREMENT_ID) return;

  ReactGA.send({
    hitType: 'pageview',
    page: path,
    title: title || document.title,
  });
}

/**
 * Track a custom event
 */
export function trackEvent(
  category: string,
  action: string,
  label?: string,
  value?: number
): void {
  if (!GA_MEASUREMENT_ID) return;

  ReactGA.event({
    category,
    action,
    label,
    value,
  });
}

// Pre-defined event trackers for common actions
export const Analytics = {
  /**
   * Track product search
   */
  searchProduct(query: string, resultsCount: number): void {
    trackEvent('Search', 'search_product', query, resultsCount);
  },

  /**
   * Track barcode scan
   */
  scanBarcode(barcode: string, found: boolean): void {
    trackEvent('Scan', 'scan_barcode', barcode, found ? 1 : 0);
  },

  /**
   * Track adding product to favorites
   */
  addToFavorites(_productId: string, productName: string): void {
    trackEvent('Favorites', 'add_to_favorites', productName);
  },

  /**
   * Track removing product from favorites
   */
  removeFromFavorites(_productId: string, productName: string): void {
    trackEvent('Favorites', 'remove_from_favorites', productName);
  },

  /**
   * Track price alert creation
   */
  createPriceAlert(productId: string, targetPrice: number): void {
    trackEvent('Alerts', 'create_price_alert', productId, targetPrice);
  },

  /**
   * Track shopping session start
   */
  startShoppingSession(sessionType: 'planning' | 'recording'): void {
    trackEvent('Shopping', 'start_session', sessionType);
  },

  /**
   * Track shopping session completion
   */
  completeShoppingSession(itemCount: number, totalAmount: number): void {
    trackEvent('Shopping', 'complete_session', `${itemCount} items`, totalAmount);
  },

  /**
   * Track adding item to shopping list
   */
  addToShoppingList(_productId: string, productName: string): void {
    trackEvent('Shopping', 'add_to_list', productName);
  },

  /**
   * Track contribution submission
   */
  submitContribution(type: 'barcode' | 'image' | 'price' | 'info'): void {
    trackEvent('Contributions', 'submit_contribution', type);
  },

  /**
   * Track promotion application
   */
  applyPromotion(promotionType: string, savings: number): void {
    trackEvent('Promotions', 'apply_promotion', promotionType, savings);
  },

  /**
   * Track user login
   */
  login(method: 'google' | 'email'): void {
    trackEvent('Auth', 'login', method);
  },

  /**
   * Track user signup
   */
  signup(method: 'google' | 'email'): void {
    trackEvent('Auth', 'signup', method);
  },

  /**
   * Track user logout
   */
  logout(): void {
    trackEvent('Auth', 'logout');
  },
};
