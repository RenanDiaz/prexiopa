/**
 * Products Components Barrel Export
 *
 * Centralized export for all product-related components.
 * Import components using: import { ProductCard, ProductGrid } from '@/components/products'
 */

// Product Card (Phase 3 - with favorites integration)
export { ProductCard, ProductCardSkeleton } from './ProductCard';
export type { ProductCardProps, ProductCardSkeletonProps } from './ProductCard';

// Product List (Phase 3 - responsive grid with states)
export { ProductList } from './ProductList';
export type { ProductListProps } from './ProductList';

// Price Comparison (Phase 3)
export { PriceComparison } from './PriceComparison';
export type { PriceComparisonProps } from './PriceComparison';

// Price History Chart (Phase 3 - Recharts integration)
export { PriceHistoryChart } from './PriceHistoryChart';
export type { PriceHistoryChartProps } from './PriceHistoryChart';

// Re-export common types for convenience
export type { Product, ProductWithLowestPrice, Price, Store } from '@/types/product';
