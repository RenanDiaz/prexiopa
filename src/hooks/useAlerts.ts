/**
 * useAlerts Hook
 *
 * React Query hooks for price alerts management.
 * Provides queries and mutations for CRUD operations on alerts.
 */

import { useMutation, useQuery, useQueryClient, type UseQueryResult, type UseMutationResult } from '@tanstack/react-query';
import {
  getUserAlerts,
  getAlertById,
  getUserAlertsSummary,
  createAlert,
  updateAlert,
  deleteAlert,
  toggleAlertActive,
  hasAlertForProduct,
  getActiveAlertsCount,
  getTriggeredAlerts,
  type Alert,
  type AlertWithDetails,
  type AlertSummary,
  type CreateAlertInput,
  type UpdateAlertInput,
  type AlertFilters,
} from '../services/supabase/alerts';
import { toast } from 'react-toastify';

// ============================================
// QUERY KEYS
// ============================================

export const alertsKeys = {
  all: ['alerts'] as const,
  lists: () => [...alertsKeys.all, 'list'] as const,
  list: (filters?: AlertFilters) => [...alertsKeys.lists(), filters] as const,
  details: () => [...alertsKeys.all, 'detail'] as const,
  detail: (id: string) => [...alertsKeys.details(), id] as const,
  summary: () => [...alertsKeys.all, 'summary'] as const,
  count: () => [...alertsKeys.all, 'count'] as const,
  triggered: () => [...alertsKeys.all, 'triggered'] as const,
  has: (productId: string, storeId?: string | null) =>
    [...alertsKeys.all, 'has', productId, storeId] as const,
};

// ============================================
// QUERIES
// ============================================

/**
 * Query: Get all alerts for current user
 */
export const useAlertsQuery = (
  filters?: AlertFilters
): UseQueryResult<AlertWithDetails[], Error> => {
  return useQuery({
    queryKey: alertsKeys.list(filters),
    queryFn: () => getUserAlerts(filters),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

/**
 * Query: Get alert by ID
 */
export const useAlertQuery = (
  id: string
): UseQueryResult<AlertWithDetails | null, Error> => {
  return useQuery({
    queryKey: alertsKeys.detail(id),
    queryFn: () => getAlertById(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Query: Get alerts summary (with current prices)
 */
export const useAlertsSummaryQuery = (): UseQueryResult<AlertSummary[], Error> => {
  return useQuery({
    queryKey: alertsKeys.summary(),
    queryFn: getUserAlertsSummary,
    staleTime: 30 * 1000, // 30 seconds (prices can change)
    refetchInterval: 60 * 1000, // Refetch every minute
  });
};

/**
 * Query: Get count of active alerts
 */
export const useActiveAlertsCountQuery = (): UseQueryResult<number, Error> => {
  return useQuery({
    queryKey: alertsKeys.count(),
    queryFn: getActiveAlertsCount,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Query: Get alerts that should trigger
 */
export const useTriggeredAlertsQuery = (): UseQueryResult<AlertSummary[], Error> => {
  return useQuery({
    queryKey: alertsKeys.triggered(),
    queryFn: getTriggeredAlerts,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 2 * 60 * 1000, // Check every 2 minutes
  });
};

/**
 * Query: Check if user has alert for product
 */
export const useHasAlertQuery = (
  productId: string,
  storeId?: string | null
): UseQueryResult<boolean, Error> => {
  return useQuery({
    queryKey: alertsKeys.has(productId, storeId),
    queryFn: () => hasAlertForProduct(productId, storeId),
    enabled: !!productId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

// ============================================
// MUTATIONS
// ============================================

/**
 * Mutation: Create new alert
 */
export const useCreateAlertMutation = (): UseMutationResult<
  Alert,
  Error,
  CreateAlertInput
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAlert,
    onSuccess: (data) => {
      // Invalidate and refetch alerts
      queryClient.invalidateQueries({ queryKey: alertsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: alertsKeys.summary() });
      queryClient.invalidateQueries({ queryKey: alertsKeys.count() });
      queryClient.invalidateQueries({
        queryKey: alertsKeys.has(data.product_id, data.store_id),
      });

      toast.success('¡Alerta creada exitosamente!');
    },
    onError: (error) => {
      console.error('Error creating alert:', error);
      toast.error(error.message || 'Error al crear la alerta');
    },
  });
};

/**
 * Mutation: Update alert
 */
export const useUpdateAlertMutation = (): UseMutationResult<
  Alert,
  Error,
  { id: string; input: UpdateAlertInput }
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }) => updateAlert(id, input),
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: alertsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: alertsKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: alertsKeys.summary() });
      queryClient.invalidateQueries({ queryKey: alertsKeys.count() });

      toast.success('Alerta actualizada');
    },
    onError: (error) => {
      console.error('Error updating alert:', error);
      toast.error('Error al actualizar la alerta');
    },
  });
};

/**
 * Mutation: Delete alert
 */
export const useDeleteAlertMutation = (): UseMutationResult<void, Error, string> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAlert,
    onSuccess: (_, deletedId) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: alertsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: alertsKeys.summary() });
      queryClient.invalidateQueries({ queryKey: alertsKeys.count() });
      queryClient.invalidateQueries({ queryKey: alertsKeys.triggered() });

      // Remove from cache
      queryClient.removeQueries({ queryKey: alertsKeys.detail(deletedId) });

      toast.success('Alerta eliminada');
    },
    onError: (error) => {
      console.error('Error deleting alert:', error);
      toast.error('Error al eliminar la alerta');
    },
  });
};

/**
 * Mutation: Toggle alert active status
 */
export const useToggleAlertActiveMutation = (): UseMutationResult<
  Alert,
  Error,
  string
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleAlertActive,
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: alertsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: alertsKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: alertsKeys.summary() });
      queryClient.invalidateQueries({ queryKey: alertsKeys.count() });

      const status = data.active ? 'activada' : 'desactivada';
      toast.success(`Alerta ${status}`);
    },
    onError: (error) => {
      console.error('Error toggling alert:', error);
      toast.error('Error al cambiar estado de la alerta');
    },
  });
};

// ============================================
// COMPOUND HOOKS
// ============================================

/**
 * Hook that combines alert queries and mutations for a product
 */
export const useProductAlerts = (productId: string, storeId?: string | null) => {
  const { data: hasAlert, isLoading: checkingAlert } = useHasAlertQuery(
    productId,
    storeId
  );
  const createMutation = useCreateAlertMutation();
  const deleteMutation = useDeleteAlertMutation();

  const createAlert = async (targetPrice: number) => {
    return createMutation.mutateAsync({
      product_id: productId,
      store_id: storeId,
      target_price: targetPrice,
    });
  };

  return {
    hasAlert: hasAlert || false,
    checkingAlert,
    createAlert,
    isCreating: createMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

/**
 * Hook for managing alerts list with common operations
 */
export const useAlertsManager = (filters?: AlertFilters) => {
  const { data: alerts = [], isLoading, error, refetch } = useAlertsQuery(filters);
  const deleteMutation = useDeleteAlertMutation();
  const toggleMutation = useToggleAlertActiveMutation();
  const updateMutation = useUpdateAlertMutation();

  const deleteAlert = async (id: string) => {
    return deleteMutation.mutateAsync(id);
  };

  const toggleAlert = async (id: string) => {
    return toggleMutation.mutateAsync(id);
  };

  const updateAlert = async (id: string, input: UpdateAlertInput) => {
    return updateMutation.mutateAsync({ id, input });
  };

  return {
    alerts,
    isLoading,
    error,
    refetch,
    deleteAlert,
    toggleAlert,
    updateAlert,
    isDeleting: deleteMutation.isPending,
    isToggling: toggleMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
};
