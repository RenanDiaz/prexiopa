/**
 * Services Barrel Export
 * Punto de entrada centralizado para todos los servicios de la API
 */

// Core API client
export { default as apiClient, api } from './api';

// Authentication Service
export * from './authService';

// Product Service
export * from './productService';

// Price Service
export * from './priceService';

// Store Service
export * from './storeService';

// Alert Service
export * from './alertService';

// Favorite Service
export * from './favoriteService';

/**
 * Objeto con todos los servicios agrupados
 * Útil para dependency injection o testing
 */
import { authService } from './authService';
import { productService } from './productService';
import { priceService } from './priceService';
import { storeService } from './storeService';
import { alertService } from './alertService';
import { favoriteService } from './favoriteService';

export const services = {
  auth: authService,
  products: productService,
  prices: priceService,
  stores: storeService,
  alerts: alertService,
  favorites: favoriteService,
};

/**
 * Default export con todos los servicios
 */
export default services;
