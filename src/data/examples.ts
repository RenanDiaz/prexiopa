/**
 * Ejemplos de uso de los datos mock
 * Este archivo muestra cómo usar las funciones helper para acceder a los datos
 */

import {
  // Funciones helper
  searchProducts,
  getProductsByCategory,
  getProductsOnSale,
  getTopDeals,
  getAllStores,
  getPriceComparison,
  getProductPrices,
  getPriceHistory,
  getPriceTrend,
  isLowestPriceEver,
  getPlatformStats,
  getPopularProducts,
  getCategoriesWithCount,
} from './index';

import { ProductCategory } from '../types/product.types';

// ============================================================================
// EJEMPLO 1: Buscar productos
// ============================================================================

// Buscar productos por texto
const searchResults = searchProducts('arroz');
console.log('Buscar "arroz":', searchResults);

// Buscar por marca
const reyProducts = searchProducts('Gallo');
console.log('Productos marca Gallo:', reyProducts);

// ============================================================================
// EJEMPLO 2: Obtener productos por categoría
// ============================================================================

const beverages = getProductsByCategory(ProductCategory.BEBIDAS);
console.log('Bebidas disponibles:', beverages.length);

const cleaningProducts = getProductsByCategory(ProductCategory.LIMPIEZA);
console.log('Productos de limpieza:', cleaningProducts.length);

// ============================================================================
// EJEMPLO 3: Obtener ofertas (productos con descuento)
// ============================================================================

const productsOnSale = getProductsOnSale();
console.log('Productos con descuento:', productsOnSale.length);

// Mostrar los 5 principales descuentos
productsOnSale.slice(0, 5).forEach((product) => {
  console.log(`${product.name} - ${product.discountPercentage}% descuento en ${product.bestStore}`);
});

// ============================================================================
// EJEMPLO 4: Top deals - Precios más bajos del momento
// ============================================================================

const bestDeals = getTopDeals(5);
console.log('Mejores ofertas:', bestDeals);

// ============================================================================
// EJEMPLO 5: Comparar precios de un producto en diferentes tiendas
// ============================================================================

const productId = 'prod-001'; // Arroz Gallo
const comparison = getPriceComparison(productId);
console.log('Comparación de precios para Arroz Gallo:');
comparison.forEach((store) => {
  console.log(`${store.storeName}: $${store.price}`);
});

// ============================================================================
// EJEMPLO 6: Obtener todas las tiendas
// ============================================================================

const allStores = getAllStores();
console.log('Total de tiendas:', allStores.length);

// Listar primeras 3 tiendas
allStores.slice(0, 3).forEach((store) => {
  console.log(`- ${store.name} (${store.chain})`);
});

// ============================================================================
// EJEMPLO 7: Precios de un producto en diferentes tiendas
// ============================================================================

const prices = getProductPrices('prod-013'); // Coca-Cola
console.log('Precios de Coca-Cola en diferentes tiendas:', prices.length);

// ============================================================================
// EJEMPLO 8: Historial de precios
// ============================================================================

const history = getPriceHistory('prod-007', 'store-super99');
if (history) {
  console.log('Historial de precios - Leche en Super99:');
  console.log('Precio actual:', history.currentPrice);
  console.log('Precio mínimo:', history.minPrice);
  console.log('Precio máximo:', history.maxPrice);
  console.log('Promedio:', history.averagePrice);
}

// ============================================================================
// EJEMPLO 9: Tendencia de precio
// ============================================================================

const trend = getPriceTrend('prod-001', 'store-super99');
console.log('Tendencia de precio (Arroz en Super99):', trend);

// ============================================================================
// EJEMPLO 10: Verificar si es el precio más bajo del historial
// ============================================================================

const isLowest = isLowestPriceEver('prod-007', 'store-rey');
console.log('Es el precio más bajo en el historial:', isLowest);

// ============================================================================
// EJEMPLO 11: Obtener estadísticas generales
// ============================================================================

const stats = getPlatformStats();
console.log('Estadísticas de la plataforma:');
console.log('Total productos:', stats.totalProducts);
console.log('Total tiendas:', stats.totalStores);
console.log('Total precios registrados:', stats.totalPrices);
console.log('Productos en oferta:', stats.productsOnSale);
console.log('Ahorro promedio:', stats.averageSavings + '%');

// ============================================================================
// EJEMPLO 12: Productos más populares
// ============================================================================

const popularProducts = getPopularProducts(5);
console.log('Productos más populares:', popularProducts.map((p) => p.name));

// ============================================================================
// EJEMPLO 13: Categorías con count
// ============================================================================

const categoriesCount = getCategoriesWithCount();
console.log('Categorías ordenadas por cantidad:');
categoriesCount.slice(0, 5).forEach((cat) => {
  console.log(`${cat.category}: ${cat.count} productos`);
});
