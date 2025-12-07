/**
 * Types for Incomplete Products Feature
 */

/**
 * Possible missing fields in a product
 */
export type MissingField = 'barcode' | 'image' | 'brand' | 'description' | 'category' | 'price';

/**
 * Incomplete Product with completeness information
 */
export interface IncompleteProduct {
  id: string;
  name: string;
  category: string | null;
  category_id: string | null;
  barcode: string | null;
  image_url: string | null;
  brand: string | null;
  description: string | null;
  completeness_score: number; // 0-100
  missing_fields: MissingField[];
  last_updated: string;
  has_recent_price: boolean;
  contribution_count: number;
}

/**
 * Completeness Statistics
 */
export interface CompletenessStats {
  total_products: number;
  complete_products: number;
  incomplete_products: number;
  missing_barcode: number;
  missing_image: number;
  missing_brand: number;
  missing_description: number;
  missing_category: number;
  missing_recent_price: number;
  avg_completeness: number; // Average completeness percentage
}

/**
 * Filters for incomplete products query
 */
export interface IncompleteProductsFilters {
  minCompleteness?: number;
  maxCompleteness?: number;
  categoryId?: string;
  limit?: number;
  offset?: number;
}

/**
 * Helper function to get human-readable field name
 */
export const getFieldLabel = (field: MissingField): string => {
  const labels: Record<MissingField, string> = {
    barcode: 'Código de barras',
    image: 'Imagen',
    brand: 'Marca',
    description: 'Descripción',
    category: 'Categoría',
    price: 'Precio reciente',
  };
  return labels[field];
};

/**
 * Helper function to get completeness level
 */
export const getCompletenessLevel = (
  score: number
): 'critical' | 'low' | 'medium' | 'high' => {
  if (score < 30) return 'critical';
  if (score < 50) return 'low';
  if (score < 80) return 'medium';
  return 'high';
};

/**
 * Helper function to get color for completeness score
 */
export const getCompletenessColor = (
  score: number
): { main: string; light: string; dark: string } => {
  if (score < 30) {
    return {
      main: '#DC2626', // red-600
      light: '#FEE2E2', // red-100
      dark: '#991B1B', // red-800
    };
  }
  if (score < 50) {
    return {
      main: '#EA580C', // orange-600
      light: '#FFEDD5', // orange-100
      dark: '#9A3412', // orange-800
    };
  }
  if (score < 80) {
    return {
      main: '#CA8A04', // yellow-600
      light: '#FEF9C3', // yellow-100
      dark: '#854D0E', // yellow-800
    };
  }
  return {
    main: '#16A34A', // green-600
    light: '#DCFCE7', // green-100
    dark: '#166534', // green-800
  };
};

/**
 * Helper function to get priority icon for missing field
 */
export const getFieldPriority = (field: MissingField): number => {
  const priorities: Record<MissingField, number> = {
    barcode: 5, // Highest priority
    image: 4,
    price: 3,
    brand: 2,
    category: 2,
    description: 1, // Lowest priority
  };
  return priorities[field];
};

/**
 * Sort missing fields by priority
 */
export const sortMissingFieldsByPriority = (fields: MissingField[]): MissingField[] => {
  return [...fields].sort((a, b) => getFieldPriority(b) - getFieldPriority(a));
};
