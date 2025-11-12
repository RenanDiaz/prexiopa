/**
 * Product Types
 * Tipos relacionados con productos en la plataforma Prexiopá
 */

/**
 * Categorías de productos disponibles en Prexiopá
 */
export enum ProductCategory {
  ALIMENTOS = 'alimentos',
  BEBIDAS = 'bebidas',
  LIMPIEZA = 'limpieza',
  CUIDADO_PERSONAL = 'cuidado_personal',
  HOGAR = 'hogar',
  MASCOTAS = 'mascotas',
  BEBES = 'bebes',
  ELECTRONICA = 'electronica',
  FARMACIA = 'farmacia',
  CONGELADOS = 'congelados',
  PANADERIA = 'panaderia',
  CARNES = 'carnes',
  FRUTAS_VERDURAS = 'frutas_verduras',
  LACTEOS = 'lacteos',
  SNACKS = 'snacks',
  OTROS = 'otros',
}

/**
 * Imagen de producto con metadata
 */
export interface ProductImage {
  /** URL de la imagen */
  url: string;
  /** Texto alternativo para accesibilidad */
  alt: string;
  /** Indica si es la imagen principal del producto */
  isPrimary: boolean;
  /** Ancho de la imagen en píxeles (opcional) */
  width?: number;
  /** Alto de la imagen en píxeles (opcional) */
  height?: number;
}

/**
 * Información completa de un producto
 */
export interface Product {
  /** ID único del producto */
  id: string;
  /** Nombre del producto */
  name: string;
  /** Descripción detallada del producto */
  description?: string;
  /** Marca del producto */
  brand: string;
  /** Categoría del producto */
  category: ProductCategory;
  /** Código de barras (UPC/EAN) */
  barcode?: string;
  /** Imágenes del producto */
  images: ProductImage[];
  /** Unidad de medida (ej: 'kg', 'lb', 'oz', 'ml', 'unidad') */
  unit?: string;
  /** Cantidad por unidad (ej: 500 para '500ml') */
  unitQuantity?: number;
  /** Tags para búsqueda y filtrado */
  tags?: string[];
  /** Fecha de creación del registro */
  createdAt: Date;
  /** Fecha de última actualización */
  updatedAt: Date;
}

/**
 * Versión simplificada de producto para listados
 */
export interface ProductSummary {
  id: string;
  name: string;
  brand: string;
  category: ProductCategory;
  image?: string;
  /** Precio más bajo actual */
  lowestPrice?: number;
  /** Precio promedio actual */
  averagePrice?: number;
}

/**
 * Producto con información de precio agregada
 */
export interface ProductWithPrice extends Product {
  /** Precio actual más bajo */
  currentPrice?: number;
  /** Tienda con el precio más bajo */
  bestStore?: string;
  /** Indica si hay descuento activo */
  hasDiscount?: boolean;
  /** Porcentaje de descuento */
  discountPercentage?: number;
}

/**
 * Parámetros para crear un nuevo producto
 */
export type CreateProductInput = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Parámetros para actualizar un producto
 */
export type UpdateProductInput = Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>;
