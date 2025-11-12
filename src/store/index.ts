/**
 * Barrel export de todos los stores de Prexiopá
 *
 * Este archivo centraliza las exportaciones de todos los stores
 * para facilitar las importaciones en los componentes
 */

// Auth Store
export { useAuthStore } from './authStore';
export type { User } from '@supabase/supabase-js';

// Favorites Store
export { useFavoritesStore } from './favoritesStore';

// Search Store
export { useSearchStore } from './searchStore';
export type {
  Product,
  ProductPrice,
  SearchFilters,
  SearchHistoryItem
} from './searchStore';

// Alerts Store
export { useAlertsStore } from './alertsStore';
export type { PriceAlert } from './alertsStore';

// UI Store
export {
  useUIStore,
  showSuccessNotification,
  showErrorNotification,
  showWarningNotification,
  showInfoNotification,
} from './uiStore';
export type {
  Notification,
  NotificationType,
  Theme
} from './uiStore';

// Import hooks for use in utility functions
import { useAuthStore } from './authStore';
import { useFavoritesStore } from './favoritesStore';
import { useSearchStore } from './searchStore';
import { useAlertsStore } from './alertsStore';
import { useUIStore } from './uiStore';

/**
 * Hook para resetear todos los stores
 * Útil para logout o limpiar estado completo
 */
export const useResetStores = () => {
  // Llamar hooks dentro del hook custom
  const authStore = useAuthStore();
  const favoritesStore = useFavoritesStore();
  const searchStore = useSearchStore();
  const alertsStore = useAlertsStore();
  const uiStore = useUIStore();

  return async () => {
    await authStore.logout();
    favoritesStore.clearFavorites();
    searchStore.clearResults();
    searchStore.clearHistory();
    alertsStore.clearAlerts();
    uiStore.clearNotifications();
  };
};

/**
 * Hook para inicializar stores cuando el usuario hace login
 */
export const useInitializeUserStores = () => {
  // Llamar hooks dentro del hook custom
  const favoritesStore = useFavoritesStore();
  const alertsStore = useAlertsStore();

  return async () => {
    await Promise.all([
      favoritesStore.loadFavorites(),
      alertsStore.loadAlerts(),
    ]);
  };
};
