/**
 * Products Components Barrel Export
 *
 * Centralized export for all product-related components.
 * Import components using: import { ProductCard, ProductGrid } from '@/components/products'
 */

// Product Card
export { ProductCard, ProductCardSkeleton } from './ProductCard';
export type { ProductCardProps } from './ProductCard';

// Product Grid
export { ProductGrid } from './ProductGrid';
export type { ProductGridProps } from './ProductGrid';

// Re-export common types for convenience
export type { Product, ProductWithPrice, ProductSummary } from '@/types/product.types';
export type { StorePriceComparison } from '@/types/price.types';
