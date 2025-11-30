import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { supabase } from '../supabaseClient';
import type {
  ProductContribution,
  CreateContributionDTO,
  UpdateContributionDTO,
  UserContributionStats,
  RecentContribution,
  ContributionType,
  ContributionStatus,
} from '@/types/contribution';
import { showSuccessNotification, showErrorNotification } from '@/store/uiStore';

// Estado del store
interface ContributionsState {
  contributions: ProductContribution[];
  recentContributions: RecentContribution[];
  stats: UserContributionStats | null;
  isLoading: boolean;
  error: string | null;
}

interface ContributionsActions {
  submitContribution: (dto: CreateContributionDTO) => Promise<ProductContribution | null>;
  getUserContributions: (userId?: string) => Promise<void>;
  getContributionStats: (userId?: string) => Promise<void>;
  getRecentContributions: (userId?: string, limit?: number) => Promise<void>;
  updateContribution: (id: string, dto: UpdateContributionDTO) => Promise<boolean>;
  deleteContribution: (id: string) => Promise<boolean>;
  clearError: () => void;
}

type ContributionsStore = ContributionsState & ContributionsActions;

/**
 * Store de Contribuciones con Zustand + Immer
 * Maneja todas las operaciones relacionadas con contribuciones de usuarios:
 * - Crear nuevas contribuciones
 * - Obtener contribuciones del usuario
 * - Ver estadísticas de contribuciones
 * - Actualizar/eliminar contribuciones pendientes
 */
export const useContributionsStore = create<ContributionsStore>()(
  immer((set, get) => ({
    // Estado inicial
    contributions: [],
    recentContributions: [],
    stats: null,
    isLoading: false,
    error: null,

    /**
     * Enviar una nueva contribución
     * @param dto - Datos de la contribución (productId, tipo, data)
     * @returns La contribución creada o null si hay error
     */
    submitContribution: async (dto: CreateContributionDTO) => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        // Obtener el usuario actual
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          throw new Error('Usuario no autenticado');
        }

        // Verificar si el usuario es moderador o admin
        const { data: roleData } = await supabase.rpc('get_user_role', {
          user_id: user.id,
        });

        const isModOrAdmin = roleData === 'moderator' || roleData === 'admin';

        // Insertar la contribución
        const { data, error } = await supabase
          .from('product_contributions')
          .insert({
            product_id: dto.productId,
            contributor_id: user.id,
            contribution_type: dto.contributionType,
            data: dto.data,
            status: 'pending',
          })
          .select()
          .single();

        if (error) throw error;

        // Si es moderador/admin, auto-aprobar la contribución inmediatamente
        if (isModOrAdmin) {
          const { error: approveError } = await supabase.rpc('approve_contribution', {
            contribution_id: data.id,
            reviewer_id: user.id,
          });

          if (approveError) {
            console.error('Error auto-aprobando contribución:', approveError);
            // No lanzar error, la contribución quedará pendiente
          } else {
            // Actualizar el status en el objeto local
            data.status = 'approved';
            data.reviewed_by = user.id;
            data.reviewed_at = new Date().toISOString();
          }
        }

        // Transformar a nuestro tipo
        const contribution: ProductContribution = {
          id: data.id,
          productId: data.product_id,
          contributorId: data.contributor_id,
          contributionType: data.contribution_type as ContributionType,
          data: data.data,
          status: data.status,
          reviewedBy: data.reviewed_by,
          reviewedAt: data.reviewed_at,
          rejectionReason: data.rejection_reason,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };

        // Agregar al estado
        set((state) => {
          state.contributions.unshift(contribution);
          state.isLoading = false;
        });

        // Actualizar estadísticas
        get().getContributionStats();

        // Mensaje diferente si es auto-aprobada
        if (isModOrAdmin && data.status === 'approved') {
          showSuccessNotification(
            'Tu contribución ha sido aplicada automáticamente',
            '¡Contribución aprobada!'
          );
        } else {
          showSuccessNotification(
            'Tu contribución ha sido enviada y está pendiente de revisión',
            '¡Contribución enviada!'
          );
        }

        return contribution;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Error al enviar contribución';

        set((state) => {
          state.error = errorMessage;
          state.isLoading = false;
        });

        showErrorNotification(errorMessage, 'Error al enviar contribución');
        return null;
      }
    },

    /**
     * Obtener todas las contribuciones del usuario
     * @param userId - ID del usuario (opcional, usa el usuario actual si no se proporciona)
     */
    getUserContributions: async (userId?: string) => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        // Obtener el usuario actual si no se proporciona un ID
        let targetUserId = userId;
        if (!targetUserId) {
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (!user) throw new Error('Usuario no autenticado');
          targetUserId = user.id;
        }

        // Consultar contribuciones
        const { data, error } = await supabase
          .from('product_contributions')
          .select('*')
          .eq('contributor_id', targetUserId)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Transformar a nuestro tipo
        const contributions: ProductContribution[] = (data || []).map(
          (item: {
            id: string;
            product_id: string;
            contributor_id: string;
            contribution_type: string;
            data: any;
            status: string;
            reviewed_by: string | null;
            reviewed_at: string | null;
            rejection_reason: string | null;
            created_at: string;
            updated_at: string;
          }) => ({
            id: item.id,
            productId: item.product_id,
            contributorId: item.contributor_id,
            contributionType: item.contribution_type as ContributionType,
            data: item.data,
            status: item.status as ContributionStatus,
            reviewedBy: item.reviewed_by,
            reviewedAt: item.reviewed_at,
            rejectionReason: item.rejection_reason,
            createdAt: item.created_at,
            updatedAt: item.updated_at,
          })
        );

        set((state) => {
          state.contributions = contributions;
          state.isLoading = false;
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Error al cargar contribuciones';

        set((state) => {
          state.error = errorMessage;
          state.isLoading = false;
        });

        showErrorNotification(errorMessage, 'Error al cargar contribuciones');
      }
    },

    /**
     * Obtener estadísticas de contribuciones del usuario
     * @param userId - ID del usuario (opcional)
     */
    getContributionStats: async (userId?: string) => {
      try {
        // Obtener el usuario actual si no se proporciona un ID
        let targetUserId = userId;
        if (!targetUserId) {
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (!user) throw new Error('Usuario no autenticado');
          targetUserId = user.id;
        }

        // Llamar a la función RPC
        const { data, error } = await supabase
          .rpc('get_user_contribution_stats', { user_id: targetUserId })
          .single();

        if (error) throw error;

        const stats: UserContributionStats = {
          totalContributions: Number((data as any).total_contributions),
          pendingContributions: Number((data as any).pending_contributions),
          approvedContributions: Number((data as any).approved_contributions),
          rejectedContributions: Number((data as any).rejected_contributions),
          approvalRate: Number((data as any).approval_rate),
        };

        set((state) => {
          state.stats = stats;
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Error al cargar estadísticas';

        set((state) => {
          state.error = errorMessage;
        });

        console.error('Error al cargar estadísticas:', errorMessage);
      }
    },

    /**
     * Obtener contribuciones recientes del usuario
     * @param userId - ID del usuario (opcional)
     * @param limit - Número de contribuciones a obtener (default: 10)
     */
    getRecentContributions: async (userId?: string, limit: number = 10) => {
      try {
        // Obtener el usuario actual si no se proporciona un ID
        let targetUserId = userId;
        if (!targetUserId) {
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (!user) throw new Error('Usuario no autenticado');
          targetUserId = user.id;
        }

        // Llamar a la función RPC
        const { data, error } = await supabase.rpc('get_user_recent_contributions', {
          user_id: targetUserId,
          limit_count: limit,
        });

        if (error) throw error;

        const recentContributions: RecentContribution[] = (data || []).map(
          (item: {
            id: string;
            product_id: string;
            product_name: string;
            contribution_type: string;
            status: string;
            created_at: string;
            reviewed_at: string | null;
          }) => ({
            id: item.id,
            productId: item.product_id,
            productName: item.product_name,
            contributionType: item.contribution_type as ContributionType,
            status: item.status,
            createdAt: item.created_at,
            reviewedAt: item.reviewed_at,
          })
        );

        set((state) => {
          state.recentContributions = recentContributions;
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Error al cargar contribuciones recientes';

        set((state) => {
          state.error = errorMessage;
        });

        console.error('Error al cargar contribuciones recientes:', errorMessage);
      }
    },

    /**
     * Actualizar una contribución pendiente
     * @param id - ID de la contribución
     * @param dto - Nuevos datos
     * @returns true si se actualizó correctamente
     */
    updateContribution: async (id: string, dto: UpdateContributionDTO) => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        // Solo se puede actualizar si está pendiente
        const { data, error } = await supabase
          .from('product_contributions')
          .update({
            data: dto.data,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id)
          .eq('status', 'pending')
          .select()
          .single();

        if (error) throw error;

        // Actualizar en el estado local
        set((state) => {
          const index = state.contributions.findIndex((c) => c.id === id);
          if (index !== -1) {
            state.contributions[index].data = data.data;
            state.contributions[index].updatedAt = data.updated_at;
          }
          state.isLoading = false;
        });

        showSuccessNotification('Contribución actualizada correctamente');
        return true;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Error al actualizar contribución';

        set((state) => {
          state.error = errorMessage;
          state.isLoading = false;
        });

        showErrorNotification(errorMessage, 'Error al actualizar');
        return false;
      }
    },

    /**
     * Eliminar una contribución pendiente
     * @param id - ID de la contribución
     * @returns true si se eliminó correctamente
     */
    deleteContribution: async (id: string) => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        // Solo se puede eliminar si está pendiente (RLS policy)
        const { error } = await supabase
          .from('product_contributions')
          .delete()
          .eq('id', id)
          .eq('status', 'pending');

        if (error) throw error;

        // Eliminar del estado local
        set((state) => {
          state.contributions = state.contributions.filter((c) => c.id !== id);
          state.isLoading = false;
        });

        // Actualizar estadísticas
        get().getContributionStats();

        showSuccessNotification('Contribución eliminada correctamente');
        return true;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Error al eliminar contribución';

        set((state) => {
          state.error = errorMessage;
          state.isLoading = false;
        });

        showErrorNotification(errorMessage, 'Error al eliminar');
        return false;
      }
    },

    /**
     * Limpiar errores
     */
    clearError: () => {
      set((state) => {
        state.error = null;
      });
    },
  }))
);
