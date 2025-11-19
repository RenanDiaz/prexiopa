/**
 * Data Module - Barrel Export & Helper Functions
 * Exporta todos los datos mock y provee funciones auxiliares para acceder a ellos
 */

import type { Product, ProductCategory, ProductWithPrice } from '../types/product.types';
import type { Store } from '../types/store.types';
import type { Price, PriceHistory, StorePriceComparison } from '../types/price.types';

// Exports de datos
export { mockProducts } from './mockProducts';
export { mockStores, mockStoreLocations } from './mockStores';
export { mockPrices } from './mockPrices';
export { mockPriceHistory } from './mockPriceHistory';

// Importar los datos para usar en las funciones helper
import { mockProducts } from './mockProducts';
import { mockStores } from './mockStores';
import { mockPrices } from './mockPrices';
import { mockPriceHistory } from './mockPriceHistory';
import { ProductCategory as ProductCategoryEnum } from '../types/product.types';

// ============================================================================
// HELPER FUNCTIONS - PRODUCTS
// ============================================================================

/**
 * Obtener producto por ID
 */
export function getProductById(id: string): Product | undefined {
  return mockProducts.find((product) => product.id === id);
}

/**
 * Obtener productos por categoría
 */
export function getProductsByCategory(category: ProductCategory): Product[] {
  return mockProducts.filter((product) => product.category === category);
}

/**
 * Buscar productos por texto (nombre, marca, descripción, tags)
 */
export function searchProducts(query: string): Product[] {
  const searchTerm = query.toLowerCase().trim();

  if (!searchTerm) {
    return mockProducts;
  }

  return mockProducts.filter((product) => {
    const matchName = product.name.toLowerCase().includes(searchTerm);
    const matchBrand = product.brand.toLowerCase().includes(searchTerm);
    const matchDescription = product.description?.toLowerCase().includes(searchTerm);
    const matchTags = product.tags?.some((tag) => tag.toLowerCase().includes(searchTerm));

    return matchName || matchBrand || matchDescription || matchTags;
  });
}

/**
 * Obtener productos con descuento activo
 */
export function getProductsOnSale(): ProductWithPrice[] {
  const productsWithDiscounts: ProductWithPrice[] = [];

  // Encontrar todos los precios con descuento
  const discountedPrices = mockPrices.filter((price) => price.discountPrice && price.isAvailable);

  // Agrupar por producto y obtener el mejor precio con descuento
  const productPriceMap = new Map<string, Price>();

  discountedPrices.forEach((price) => {
    const existing = productPriceMap.get(price.productId);
    const currentPrice = price.discountPrice || price.price;
    const existingPrice = existing
      ? existing.discountPrice || existing.price
      : Number.POSITIVE_INFINITY;

    if (currentPrice < existingPrice) {
      productPriceMap.set(price.productId, price);
    }
  });

  // Crear productos con información de precio
  productPriceMap.forEach((price, productId) => {
    const product = getProductById(productId);
    if (product) {
      const store = getStoreById(price.storeId);
      const discountPercentage = price.discountPrice
        ? Math.round(((price.price - price.discountPrice) / price.price) * 100)
        : 0;

      productsWithDiscounts.push({
        ...product,
        currentPrice: price.discountPrice || price.price,
        bestStore: store?.name,
        hasDiscount: true,
        discountPercentage,
      });
    }
  });

  return productsWithDiscounts.sort((a, b) => {
    const discountA = a.discountPercentage || 0;
    const discountB = b.discountPercentage || 0;
    return discountB - discountA;
  });
}

/**
 * Obtener productos con los precios más bajos del momento
 */
export function getTopDeals(limit: number = 10): ProductWithPrice[] {
  const productDeals: Map<string, ProductWithPrice> = new Map();

  mockProducts.forEach((product) => {
    const bestPrice = getBestPrice(product.id);
    if (bestPrice) {
      const store = getStoreById(bestPrice.storeId);
      const currentPrice = bestPrice.discountPrice || bestPrice.price;

      const productWithPrice: ProductWithPrice = {
        ...product,
        currentPrice,
        bestStore: store?.name,
        hasDiscount: !!bestPrice.discountPrice,
        discountPercentage: bestPrice.discountPrice
          ? Math.round(((bestPrice.price - bestPrice.discountPrice) / bestPrice.price) * 100)
          : 0,
      };

      productDeals.set(product.id, productWithPrice);
    }
  });

  // Ordenar por precio más bajo y limitar resultados
  return Array.from(productDeals.values())
    .sort((a, b) => (a.currentPrice || 0) - (b.currentPrice || 0))
    .slice(0, limit);
}

// ============================================================================
// HELPER FUNCTIONS - STORES
// ============================================================================

/**
 * Obtener tienda por ID
 */
export function getStoreById(id: string): Store | undefined {
  return mockStores.find((store) => store.id === id);
}

/**
 * Obtener todas las tiendas
 */
export function getAllStores(): Store[] {
  return mockStores;
}

/**
 * Obtener tiendas por provincia
 */
export function getStoresByProvince(province: string): Store[] {
  return mockStores.filter((store) =>
    store.locations.some(
      (location) => location.province.toLowerCase() === province.toLowerCase() && location.isActive
    )
  );
}

// ============================================================================
// HELPER FUNCTIONS - PRICES
// ============================================================================

/**
 * Obtener precios de un producto en todas las tiendas
 */
export function getProductPrices(productId: string): Price[] {
  return mockPrices.filter((price) => price.productId === productId && price.isAvailable);
}

/**
 * Obtener el mejor precio (más bajo) para un producto
 */
export function getBestPrice(productId: string): Price | undefined {
  const prices = getProductPrices(productId);

  if (prices.length === 0) {
    return undefined;
  }

  return prices.reduce((best, current) => {
    const currentPrice = current.discountPrice || current.price;
    const bestPrice = best.discountPrice || best.price;
    return currentPrice < bestPrice ? current : best;
  });
}

/**
 * Obtener comparación de precios de un producto entre tiendas
 */
export function getPriceComparison(productId: string): StorePriceComparison[] {
  const prices = getProductPrices(productId);
  const comparisons: StorePriceComparison[] = [];

  // Encontrar el precio más bajo
  const lowestPriceValue = Math.min(
    ...prices.map((p) => p.discountPrice || p.price)
  );

  prices.forEach((price) => {
    const store = getStoreById(price.storeId);
    if (store) {
      const finalPrice = price.discountPrice || price.price;
      const discountPercentage = price.discountPrice
        ? Math.round(((price.price - price.discountPrice) / price.price) * 100)
        : 0;

      const differenceFromLowest = finalPrice - lowestPriceValue;
      const percentageDifferenceFromLowest =
        lowestPriceValue > 0
          ? Math.round((differenceFromLowest / lowestPriceValue) * 100)
          : 0;

      comparisons.push({
        storeId: store.id,
        storeName: store.name,
        storeLogo: store.logo,
        price: price.price,
        discountPrice: price.discountPrice,
        discountPercentage: discountPercentage > 0 ? discountPercentage : undefined,
        isAvailable: price.isAvailable,
        lastUpdated: price.recordedAt,
        differenceFromLowest,
        percentageDifferenceFromLowest,
        availableLocations: store.locations
          .filter((loc) => loc.isActive)
          .map((loc) => loc.branchName || loc.address),
      });
    }
  });

  // Ordenar por precio (más bajo primero)
  return comparisons.sort((a, b) => {
    const priceA = a.discountPrice || a.price;
    const priceB = b.discountPrice || b.price;
    return priceA - priceB;
  });
}

/**
 * Obtener precios de productos en una tienda específica
 */
export function getPricesByStore(storeId: string): Price[] {
  return mockPrices.filter((price) => price.storeId === storeId && price.isAvailable);
}

/**
 * Obtener precio promedio de un producto
 */
export function getAveragePrice(productId: string): number | undefined {
  const prices = getProductPrices(productId);

  if (prices.length === 0) {
    return undefined;
  }

  const total = prices.reduce((sum, price) => {
    const finalPrice = price.discountPrice || price.price;
    return sum + finalPrice;
  }, 0);

  return Math.round((total / prices.length) * 100) / 100;
}

// ============================================================================
// HELPER FUNCTIONS - PRICE HISTORY
// ============================================================================

/**
 * Obtener historial de precios de un producto en una tienda
 */
export function getPriceHistory(productId: string, storeId: string): PriceHistory | undefined {
  return mockPriceHistory.find(
    (history) => history.productId === productId && history.storeId === storeId
  );
}

/**
 * Obtener todos los historiales de un producto (todas las tiendas)
 */
export function getAllPriceHistories(productId: string): PriceHistory[] {
  return mockPriceHistory.filter((history) => history.productId === productId);
}

/**
 * Verificar si el precio actual es el más bajo en el historial
 */
export function isLowestPriceEver(productId: string, storeId: string): boolean {
  const history = getPriceHistory(productId, storeId);
  if (!history) {
    return false;
  }

  return history.currentPrice === history.minPrice;
}

/**
 * Obtener tendencia de precio (subiendo, bajando, estable)
 */
export function getPriceTrend(
  productId: string,
  storeId: string
): 'rising' | 'falling' | 'stable' | undefined {
  const history = getPriceHistory(productId, storeId);
  if (!history || history.prices.length < 7) {
    return undefined;
  }

  // Comparar últimos 7 días con los 7 días anteriores
  const recentPrices = history.prices.slice(-7);
  const previousPrices = history.prices.slice(-14, -7);

  const recentAverage =
    recentPrices.reduce((sum, p) => sum + (p.discountPrice || p.price), 0) / recentPrices.length;
  const previousAverage =
    previousPrices.reduce((sum, p) => sum + (p.discountPrice || p.price), 0) /
    previousPrices.length;

  const difference = recentAverage - previousAverage;
  const threshold = previousAverage * 0.03; // 3% threshold

  if (difference > threshold) {
    return 'rising';
  } else if (difference < -threshold) {
    return 'falling';
  } else {
    return 'stable';
  }
}

// ============================================================================
// HELPER FUNCTIONS - STATISTICS
// ============================================================================

/**
 * Obtener estadísticas generales de la plataforma
 */
export function getPlatformStats() {
  return {
    totalProducts: mockProducts.length,
    totalStores: mockStores.length,
    totalPrices: mockPrices.length,
    productsOnSale: getProductsOnSale().length,
    categories: Object.keys(ProductCategoryEnum).length,
    averageSavings: calculateAverageSavings(),
  };
}

/**
 * Calcular ahorro promedio disponible
 */
function calculateAverageSavings(): number {
  const productsWithSavings = getProductsOnSale();

  if (productsWithSavings.length === 0) {
    return 0;
  }

  const totalSavings = productsWithSavings.reduce((sum, product) => {
    return sum + (product.discountPercentage || 0);
  }, 0);

  return Math.round(totalSavings / productsWithSavings.length);
}

/**
 * Obtener productos más populares (por número de precios registrados)
 */
export function getPopularProducts(limit: number = 10): Product[] {
  const productPriceCounts = new Map<string, number>();

  mockPrices.forEach((price) => {
    const count = productPriceCounts.get(price.productId) || 0;
    productPriceCounts.set(price.productId, count + 1);
  });

  const sortedProducts = Array.from(productPriceCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([productId]) => getProductById(productId))
    .filter((product): product is Product => product !== undefined);

  return sortedProducts;
}

/**
 * Obtener categorías con número de productos
 */
export function getCategoriesWithCount(): Array<{ category: ProductCategory; count: number }> {
  const categoryCounts = new Map<ProductCategory, number>();

  mockProducts.forEach((product) => {
    const count = categoryCounts.get(product.category) || 0;
    categoryCounts.set(product.category, count + 1);
  });

  return Array.from(categoryCounts.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);
}
