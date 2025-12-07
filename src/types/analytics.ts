/**
 * Admin Analytics Types
 * Type definitions for admin dashboard analytics and statistics
 */

/**
 * Contribution trend data point (daily)
 */
export interface ContributionTrendData {
  date: string; // ISO date string
  total: number;
  approved: number;
  rejected: number;
  pending: number;
}

/**
 * Contributions grouped by type
 */
export interface ContributionsByType {
  contribution_type: 'barcode' | 'image' | 'price' | 'info';
  total: number;
  approved: number;
  rejected: number;
  pending: number;
  approval_rate: number; // 0-100
}

/**
 * Review time statistics
 */
export interface ReviewTimeStats {
  avg_review_hours: number;
  median_review_hours: number;
  fastest_review_hours: number;
  slowest_review_hours: number;
  total_reviewed: number;
}

/**
 * Completeness statistics by category
 */
export interface CompletenessByCategory {
  category_id: string;
  category_name: string;
  avg_completeness: number; // 0-100
  total_products: number;
  incomplete_products: number;
}

/**
 * Daily activity comparison stats
 */
export interface DailyActivityStats {
  contributions_today: number;
  contributions_yesterday: number;
  reviews_today: number;
  reviews_yesterday: number;
  new_products_today: number;
  new_products_yesterday: number;
}

/**
 * Helper to calculate percentage change
 */
export const calculatePercentageChange = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
};

/**
 * Helper to format hours to human readable string
 */
export const formatReviewTime = (hours: number): string => {
  if (hours < 1) {
    const minutes = Math.round(hours * 60);
    return `${minutes}min`;
  }
  if (hours < 24) {
    return `${hours.toFixed(1)}h`;
  }
  const days = Math.floor(hours / 24);
  const remainingHours = Math.round(hours % 24);
  if (remainingHours === 0) {
    return `${days}d`;
  }
  return `${days}d ${remainingHours}h`;
};

/**
 * Helper to get contribution type label in Spanish
 */
export const getContributionTypeLabel = (
  type: 'barcode' | 'image' | 'price' | 'info'
): string => {
  const labels: Record<string, string> = {
    barcode: 'Código de barras',
    image: 'Imagen',
    price: 'Precio',
    info: 'Información',
  };
  return labels[type] || type;
};

/**
 * Helper to get color for approval rate
 */
export const getApprovalRateColor = (rate: number): string => {
  if (rate >= 80) return '#16A34A'; // green-600
  if (rate >= 60) return '#CA8A04'; // yellow-600
  if (rate >= 40) return '#EA580C'; // orange-600
  return '#DC2626'; // red-600
};

/**
 * Helper to format percentage change with sign
 */
export const formatPercentageChange = (change: number): string => {
  if (change === 0) return '0%';
  const sign = change > 0 ? '+' : '';
  return `${sign}${change}%`;
};

/**
 * Helper to get trend direction icon
 */
export const getTrendIcon = (change: number): '📈' | '📉' | '➡️' => {
  if (change > 0) return '📈';
  if (change < 0) return '📉';
  return '➡️';
};
