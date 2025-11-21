/**
 * Shopping Lists Hooks - React Query
 * Hooks para manejo de listas de compras y sesiones
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as shoppingService from '@/services/supabase/shopping';
import type {
  CreateSessionData,
  AddItemData,
  UpdateItemData,
  SessionStatus,
} from '@/services/supabase/shopping';
import { useAuthStore } from '@/store/authStore';
import {
  showSuccessNotification,
  showErrorNotification,
} from '@/store/uiStore';

// Query Keys
export const shoppingKeys = {
  all: ['shopping'] as const,
  sessions: () => [...shoppingKeys.all, 'sessions'] as const,
  session: (id: string) => [...shoppingKeys.all, 'session', id] as const,
  activeSession: () => [...shoppingKeys.all, 'active-session'] as const,
  items: (sessionId: string) => [...shoppingKeys.all, 'items', sessionId] as const,
};

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Hook para obtener todas las sesiones del usuario
 */
export const useShoppingSessionsQuery = (
  status?: SessionStatus,
  options?: { enabled?: boolean }
) => {
  const user = useAuthStore((state) => state.user);

  return useQuery({
    queryKey: [...shoppingKeys.sessions(), status],
    queryFn: () => shoppingService.getShoppingSessions(status),
    enabled: !!user && (options?.enabled ?? true),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};

/**
 * Hook para obtener sesión activa del usuario
 */
export const useActiveSessionQuery = (options?: { enabled?: boolean }) => {
  const user = useAuthStore((state) => state.user);

  return useQuery({
    queryKey: shoppingKeys.activeSession(),
    queryFn: shoppingService.getActiveSession,
    enabled: !!user && (options?.enabled ?? true),
    staleTime: 1000 * 60, // 1 minuto
  });
};

/**
 * Hook para obtener una sesión específica por ID
 */
export const useShoppingSessionQuery = (
  sessionId: string,
  options?: { enabled?: boolean }
) => {
  const user = useAuthStore((state) => state.user);

  return useQuery({
    queryKey: shoppingKeys.session(sessionId),
    queryFn: () => shoppingService.getShoppingSession(sessionId),
    enabled: !!user && !!sessionId && (options?.enabled ?? true),
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
};

/**
 * Hook para obtener items de una sesión
 */
export const useShoppingItemsQuery = (
  sessionId: string,
  options?: { enabled?: boolean }
) => {
  const user = useAuthStore((state) => state.user);

  return useQuery({
    queryKey: shoppingKeys.items(sessionId),
    queryFn: () => shoppingService.getShoppingItems(sessionId),
    enabled: !!user && !!sessionId && (options?.enabled ?? true),
    staleTime: 1000 * 30, // 30 segundos
  });
};

// ============================================================================
// Mutation Hooks - Sessions
// ============================================================================

/**
 * Hook para crear una nueva sesión de compras
 */
export const useCreateSessionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSessionData) =>
      shoppingService.createShoppingSession(data),
    onSuccess: (newSession) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: shoppingKeys.sessions() });
      queryClient.invalidateQueries({ queryKey: shoppingKeys.activeSession() });

      // Actualizar cache de sesión individual
      queryClient.setQueryData(
        shoppingKeys.session(newSession.id),
        newSession
      );

      showSuccessNotification(
        `Sesión de compras iniciada${newSession.store_name ? ` en ${newSession.store_name}` : ''}`
      );
    },
    onError: (error: Error) => {
      console.error('Error al crear sesión:', error);
      showErrorNotification('No se pudo iniciar la sesión de compras');
    },
  });
};

/**
 * Hook para completar una sesión de compras
 */
export const useCompleteSessionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) =>
      shoppingService.completeShoppingSession(sessionId),
    onSuccess: (updatedSession) => {
      // Invalidar queries
      queryClient.invalidateQueries({ queryKey: shoppingKeys.sessions() });
      queryClient.invalidateQueries({ queryKey: shoppingKeys.activeSession() });
      queryClient.setQueryData(
        shoppingKeys.session(updatedSession.id),
        updatedSession
      );

      showSuccessNotification('¡Compra completada exitosamente!');
    },
    onError: (error: Error) => {
      console.error('Error al completar sesión:', error);
      showErrorNotification('No se pudo completar la sesión');
    },
  });
};

/**
 * Hook para cancelar una sesión de compras
 */
export const useCancelSessionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) =>
      shoppingService.cancelShoppingSession(sessionId),
    onSuccess: (updatedSession) => {
      // Invalidar queries
      queryClient.invalidateQueries({ queryKey: shoppingKeys.sessions() });
      queryClient.invalidateQueries({ queryKey: shoppingKeys.activeSession() });
      queryClient.setQueryData(
        shoppingKeys.session(updatedSession.id),
        updatedSession
      );

      showSuccessNotification('Sesión cancelada');
    },
    onError: (error: Error) => {
      console.error('Error al cancelar sesión:', error);
      showErrorNotification('No se pudo cancelar la sesión');
    },
  });
};

/**
 * Hook para eliminar una sesión de compras
 */
export const useDeleteSessionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) =>
      shoppingService.deleteShoppingSession(sessionId),
    onSuccess: (_, sessionId) => {
      // Invalidar queries
      queryClient.invalidateQueries({ queryKey: shoppingKeys.sessions() });
      queryClient.invalidateQueries({ queryKey: shoppingKeys.activeSession() });

      // Remover de cache
      queryClient.removeQueries({ queryKey: shoppingKeys.session(sessionId) });
      queryClient.removeQueries({ queryKey: shoppingKeys.items(sessionId) });

      showSuccessNotification('Sesión eliminada');
    },
    onError: (error: Error) => {
      console.error('Error al eliminar sesión:', error);
      showErrorNotification('No se pudo eliminar la sesión');
    },
  });
};

// ============================================================================
// Mutation Hooks - Items
// ============================================================================

/**
 * Hook para agregar un item a la sesión
 */
export const useAddItemMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddItemData) => shoppingService.addShoppingItem(data),
    onSuccess: (newItem) => {
      // Invalidar queries de items y sesión
      queryClient.invalidateQueries({
        queryKey: shoppingKeys.items(newItem.session_id),
      });
      queryClient.invalidateQueries({
        queryKey: shoppingKeys.session(newItem.session_id),
      });
      queryClient.invalidateQueries({ queryKey: shoppingKeys.activeSession() });

      showSuccessNotification(`${newItem.product_name} agregado a la lista`);
    },
    onError: (error: Error) => {
      console.error('Error al agregar item:', error);
      showErrorNotification('No se pudo agregar el producto');
    },
  });
};

/**
 * Hook para actualizar un item
 */
export const useUpdateItemMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, data }: { itemId: string; data: UpdateItemData }) =>
      shoppingService.updateShoppingItem(itemId, data),
    onSuccess: (updatedItem) => {
      // Invalidar queries
      queryClient.invalidateQueries({
        queryKey: shoppingKeys.items(updatedItem.session_id),
      });
      queryClient.invalidateQueries({
        queryKey: shoppingKeys.session(updatedItem.session_id),
      });
      queryClient.invalidateQueries({ queryKey: shoppingKeys.activeSession() });

      showSuccessNotification('Producto actualizado');
    },
    onError: (error: Error) => {
      console.error('Error al actualizar item:', error);
      showErrorNotification('No se pudo actualizar el producto');
    },
  });
};

/**
 * Hook para eliminar un item
 */
export const useDeleteItemMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      itemId,
    }: {
      itemId: string;
      sessionId: string;
    }) => shoppingService.deleteShoppingItem(itemId),
    onSuccess: (_, { sessionId }) => {
      // Invalidar queries
      queryClient.invalidateQueries({ queryKey: shoppingKeys.items(sessionId) });
      queryClient.invalidateQueries({ queryKey: shoppingKeys.session(sessionId) });
      queryClient.invalidateQueries({ queryKey: shoppingKeys.activeSession() });

      showSuccessNotification('Producto eliminado');
    },
    onError: (error: Error) => {
      console.error('Error al eliminar item:', error);
      showErrorNotification('No se pudo eliminar el producto');
    },
  });
};

/**
 * Hook para marcar/desmarcar un item como comprado
 */
export const useToggleItemPurchasedMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      itemId,
      purchased,
    }: {
      itemId: string;
      purchased: boolean;
      sessionId: string;
    }) => shoppingService.updateShoppingItem(itemId, { purchased }),
    onSuccess: (_, { sessionId }) => {
      // Invalidar queries
      queryClient.invalidateQueries({ queryKey: shoppingKeys.items(sessionId) });
      queryClient.invalidateQueries({ queryKey: shoppingKeys.session(sessionId) });
      queryClient.invalidateQueries({ queryKey: shoppingKeys.activeSession() });
    },
    onError: (error: Error) => {
      console.error('Error al actualizar item:', error);
      showErrorNotification('No se pudo actualizar el estado');
    },
  });
};

/**
 * Hook para incrementar cantidad de un item
 */
export const useIncrementItemQuantityMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      itemId,
      currentQuantity,
    }: {
      itemId: string;
      sessionId: string;
      currentQuantity: number;
    }) => {
      const newQuantity = currentQuantity + 1;
      return shoppingService.updateShoppingItem(itemId, {
        quantity: newQuantity,
      });
    },
    onSuccess: (_, { sessionId }) => {
      queryClient.invalidateQueries({ queryKey: shoppingKeys.items(sessionId) });
      queryClient.invalidateQueries({ queryKey: shoppingKeys.session(sessionId) });
      queryClient.invalidateQueries({ queryKey: shoppingKeys.activeSession() });
    },
    onError: (error: Error) => {
      console.error('Error al incrementar cantidad:', error);
      showErrorNotification('No se pudo actualizar la cantidad');
    },
  });
};

/**
 * Hook para decrementar cantidad de un item
 */
export const useDecrementItemQuantityMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      itemId,
      currentQuantity,
    }: {
      itemId: string;
      sessionId: string;
      currentQuantity: number;
    }) => {
      const newQuantity = Math.max(1, currentQuantity - 1);
      return shoppingService.updateShoppingItem(itemId, {
        quantity: newQuantity,
      });
    },
    onSuccess: (_, { sessionId }) => {
      queryClient.invalidateQueries({ queryKey: shoppingKeys.items(sessionId) });
      queryClient.invalidateQueries({ queryKey: shoppingKeys.session(sessionId) });
      queryClient.invalidateQueries({ queryKey: shoppingKeys.activeSession() });
    },
    onError: (error: Error) => {
      console.error('Error al decrementar cantidad:', error);
      showErrorNotification('No se pudo actualizar la cantidad');
    },
  });
};
