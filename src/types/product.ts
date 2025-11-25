/**
 * Product Types
 * Tipos e interfaces para productos, precios y tiendas
 */

export interface Store {
  id: string;
  name: string;
  logo: string;
  website?: string;
}

export interface Price {
  id: string;
  product_id: string;
  store_id: string;
  price: number;
  date: string;
  in_stock: boolean;
  stores?: Store;
  // Phase 5.2 - Enhanced Price Tracking
  quantity?: number;
  discount?: number;
  total_price?: number;
  is_promotion?: boolean;
  notes?: string;
  reported_by?: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  image: string;
  category: string;
  brand?: string;
  barcode?: string;
  created_at?: string;
  updated_at?: string;
  prices?: Price[];
}

export interface ProductWithLowestPrice extends Product {
  lowest_price?: number;
  store_with_lowest_price?: Store;
}
