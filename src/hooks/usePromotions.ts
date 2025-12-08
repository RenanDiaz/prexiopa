/**
 * usePromotions Hooks
 *
 * React Query hooks for promotions and discounts.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as promotionsService from '@/services/supabase/promotions';
import type {
  CreatePromotionInput,
  VerifyPromotionInput,
  ProductPromotion,
  PromotionWithProducts,
} from '@/types/promotion';
import { useAuthStore } from '@/store/authStore';
import { showSuccessNotification, showErrorNotification } from '@/store/uiStore';

// Query Keys
export const promotionKeys = {
  all: ['promotions'] as const,
  product: (productId: string, storeId?: string) =>
    [...promotionKeys.all, 'product', productId, storeId] as const,
  store: (storeId: string) => [...promotionKeys.all, 'store', storeId] as const,
  single: (id: string) => [...promotionKeys.all, 'single', id] as const,
  pending: () => [...promotionKeys.all, 'pending'] as const,
  user: (userId: string) => [...promotionKeys.all, 'user', userId] as const,
  stats: () => [...promotionKeys.all, 'stats'] as const,
  verification: (promotionId: string, userId: string) =>
    [...promotionKeys.all, 'verification', promotionId, userId] as const,
};

// =====================================================
// QUERY HOOKS
// =====================================================

/**
 * Hook to get promotions for a product
 */
export function useProductPromotions(
  productId: string,
  storeId?: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: promotionKeys.product(productId, storeId),
    queryFn: () => promotionsService.getProductPromotions(productId, storeId),
    enabled: !!productId && (options?.enabled ?? true),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to get a single promotion with its products
 */
export function usePromotion(promotionId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: promotionKeys.single(promotionId),
    queryFn: () => promotionsService.getPromotion(promotionId),
    enabled: !!promotionId && (options?.enabled ?? true),
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook to get promotions for a store
 */
export function useStorePromotions(storeId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: promotionKeys.store(storeId),
    queryFn: () => promotionsService.getStorePromotions(storeId),
    enabled: !!storeId && (options?.enabled ?? true),
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook to get pending promotions for moderation
 */
export function usePendingPromotions(options?: { enabled?: boolean }) {
  const user = useAuthStore((state) => state.user);

  return useQuery({
    queryKey: promotionKeys.pending(),
    queryFn: () => promotionsService.getPendingPromotions(),
    enabled: !!user && (options?.enabled ?? true),
    staleTime: 1000 * 30, // 30 seconds for moderation queue
    refetchInterval: 1000 * 60, // Refetch every minute
  });
}

/**
 * Hook to get user's contributed promotions
 */
export function useUserPromotions(options?: { enabled?: boolean }) {
  const user = useAuthStore((state) => state.user);

  return useQuery({
    queryKey: promotionKeys.user(user?.id || ''),
    queryFn: () => promotionsService.getUserPromotions(user!.id),
    enabled: !!user && (options?.enabled ?? true),
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * Hook to get promotion statistics
 */
export function usePromotionStats(options?: { enabled?: boolean }) {
  const user = useAuthStore((state) => state.user);

  return useQuery({
    queryKey: promotionKeys.stats(),
    queryFn: () => promotionsService.getPromotionStats(),
    enabled: !!user && (options?.enabled ?? true),
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook to check if user has verified a promotion
 */
export function useHasUserVerified(promotionId: string, options?: { enabled?: boolean }) {
  const user = useAuthStore((state) => state.user);

  return useQuery({
    queryKey: promotionKeys.verification(promotionId, user?.id || ''),
    queryFn: () => promotionsService.hasUserVerified(promotionId, user!.id),
    enabled: !!user && !!promotionId && (options?.enabled ?? true),
    staleTime: 1000 * 60 * 10,
  });
}

// =====================================================
// MUTATION HOOKS
// =====================================================

/**
 * Hook to create a new promotion
 */
export function useCreatePromotion() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: (input: CreatePromotionInput) =>
      promotionsService.createPromotion(input),
    onSuccess: (newPromotion) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: promotionKeys.all });

      if (user) {
        queryClient.invalidateQueries({ queryKey: promotionKeys.user(user.id) });
      }

      showSuccessNotification('¡Promoción agregada! Gracias por contribuir.');
    },
    onError: (error: Error) => {
      console.error('Error creating promotion:', error);
      showErrorNotification('No se pudo agregar la promoción');
    },
  });
}

/**
 * Hook to verify a promotion
 */
export function useVerifyPromotion() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: (input: VerifyPromotionInput) =>
      promotionsService.verifyPromotion(input),
    onSuccess: (_, variables) => {
      // Invalidate queries
      queryClient.invalidateQueries({
        queryKey: promotionKeys.single(variables.promotion_id),
      });

      if (user) {
        queryClient.invalidateQueries({
          queryKey: promotionKeys.verification(variables.promotion_id, user.id),
        });
      }

      showSuccessNotification(
        variables.confirmed
          ? '¡Gracias por confirmar la promoción!'
          : 'Gracias por tu reporte'
      );
    },
    onError: (error: Error) => {
      console.error('Error verifying promotion:', error);
      showErrorNotification('No se pudo verificar la promoción');
    },
  });
}

/**
 * Hook to approve a promotion (moderator)
 */
export function useApprovePromotion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (promotionId: string) =>
      promotionsService.approvePromotion(promotionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: promotionKeys.all });
      showSuccessNotification('Promoción aprobada');
    },
    onError: (error: Error) => {
      console.error('Error approving promotion:', error);
      showErrorNotification('No se pudo aprobar la promoción');
    },
  });
}

/**
 * Hook to reject a promotion (moderator)
 */
export function useRejectPromotion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ promotionId, reason }: { promotionId: string; reason: string }) =>
      promotionsService.rejectPromotion(promotionId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: promotionKeys.all });
      showSuccessNotification('Promoción rechazada');
    },
    onError: (error: Error) => {
      console.error('Error rejecting promotion:', error);
      showErrorNotification('No se pudo rechazar la promoción');
    },
  });
}

/**
 * Hook to update a promotion
 */
export function useUpdatePromotion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      promotionId,
      updates,
    }: {
      promotionId: string;
      updates: Partial<CreatePromotionInput>;
    }) => promotionsService.updatePromotion(promotionId, updates),
    onSuccess: (updatedPromotion) => {
      queryClient.invalidateQueries({
        queryKey: promotionKeys.single(updatedPromotion.id),
      });
      queryClient.invalidateQueries({ queryKey: promotionKeys.all });
      showSuccessNotification('Promoción actualizada');
    },
    onError: (error: Error) => {
      console.error('Error updating promotion:', error);
      showErrorNotification('No se pudo actualizar la promoción');
    },
  });
}

/**
 * Hook to delete a promotion
 */
export function useDeletePromotion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (promotionId: string) =>
      promotionsService.deletePromotion(promotionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: promotionKeys.all });
      showSuccessNotification('Promoción eliminada');
    },
    onError: (error: Error) => {
      console.error('Error deleting promotion:', error);
      showErrorNotification('No se pudo eliminar la promoción');
    },
  });
}
