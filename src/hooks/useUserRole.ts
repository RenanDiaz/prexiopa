/**
 * useUserRole - Hook para obtener el rol del usuario actual
 * Proporciona el rol, permisos y métodos para verificar permisos
 */

import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import type {
  UserRole,
  UserRoleRecord,
  RolePermissions,
  ModerationStats,
  PendingContributionForReview,
  ApproveContributionDTO,
  RejectContributionDTO,
} from '@/types/role';
import {
  ROLE_PERMISSIONS,
  hasPermission as checkPermission,
  isModeratorOrAdmin as checkIsModeratorOrAdmin,
  isAdmin as checkIsAdmin,
} from '@/types/role';
import { useAuthStore } from '@/store/authStore';

/**
 * Estado del hook useUserRole
 */
interface UseUserRoleReturn {
  // Estado
  role: UserRole;
  roleRecord: UserRoleRecord | null;
  isLoading: boolean;
  error: string | null;

  // Permisos
  permissions: RolePermissions;
  hasPermission: (permission: keyof RolePermissions) => boolean;
  isModeratorOrAdmin: boolean;
  isAdmin: boolean;

  // Métodos
  refreshRole: () => Promise<void>;
}

/**
 * Hook principal para obtener el rol del usuario actual
 */
export const useUserRole = (): UseUserRoleReturn => {
  const { user } = useAuthStore();
  const [role, setRole] = useState<UserRole>('user');
  const [roleRecord, setRoleRecord] = useState<UserRoleRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Cargar el rol del usuario desde Supabase
   */
  const loadUserRole = async () => {
    if (!user) {
      setRole('user');
      setRoleRecord(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Consultar el rol del usuario
      const { data, error: queryError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (queryError) {
        // Si no existe registro, el usuario es 'user' por defecto
        if (queryError.code === 'PGRST116') {
          setRole('user');
          setRoleRecord(null);
        } else {
          throw queryError;
        }
      } else if (data) {
        // Transformar a nuestro tipo
        const record: UserRoleRecord = {
          id: data.id,
          userId: data.user_id,
          role: data.role as UserRole,
          assignedBy: data.assigned_by,
          assignedAt: data.assigned_at,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };

        setRole(record.role);
        setRoleRecord(record);
      }
    } catch (err) {
      console.error('Error al cargar rol de usuario:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar rol');
      setRole('user'); // Fallback a usuario normal
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Efecto para cargar el rol cuando cambia el usuario
   */
  useEffect(() => {
    loadUserRole();
  }, [user?.id]);

  /**
   * Obtener permisos del rol actual
   */
  const permissions = ROLE_PERMISSIONS[role];

  /**
   * Verificar si tiene un permiso específico
   */
  const hasPermissionFn = (permission: keyof RolePermissions): boolean => {
    return checkPermission(role, permission);
  };

  return {
    role,
    roleRecord,
    isLoading,
    error,
    permissions,
    hasPermission: hasPermissionFn,
    isModeratorOrAdmin: checkIsModeratorOrAdmin(role),
    isAdmin: checkIsAdmin(role),
    refreshRole: loadUserRole,
  };
};

// =====================================================
// HOOKS ESPECÍFICOS PARA FUNCIONES DE MODERACIÓN
// =====================================================

/**
 * Hook para obtener estadísticas de moderación
 * Solo funciona para moderadores y admins
 */
export const useModerationStats = () => {
  const { role } = useUserRole();
  const [stats, setStats] = useState<ModerationStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStats = async () => {
    if (!checkIsModeratorOrAdmin(role)) {
      setError('No tienes permisos para ver estas estadísticas');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: rpcError } = await supabase
        .rpc('get_moderation_stats')
        .single();

      if (rpcError) throw rpcError;

      const moderationStats: ModerationStats = {
        totalUsers: Number((data as any).total_users),
        totalModerators: Number((data as any).total_moderators),
        totalAdmins: Number((data as any).total_admins),
        pendingContributions: Number((data as any).pending_contributions),
        approvedContributions: Number((data as any).approved_contributions),
        rejectedContributions: Number((data as any).rejected_contributions),
      };

      setStats(moderationStats);
    } catch (err) {
      console.error('Error al cargar estadísticas de moderación:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar estadísticas');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (checkIsModeratorOrAdmin(role)) {
      loadStats();
    }
  }, [role]);

  return {
    stats,
    isLoading,
    error,
    refresh: loadStats,
  };
};

/**
 * Hook para obtener contribuciones pendientes de revisión
 * Solo funciona para moderadores y admins
 */
export const usePendingContributions = (limit: number = 50) => {
  const { role } = useUserRole();
  const [contributions, setContributions] = useState<PendingContributionForReview[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadContributions = async () => {
    if (!checkIsModeratorOrAdmin(role)) {
      setError('No tienes permisos para ver contribuciones pendientes');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: rpcError } = await supabase.rpc('get_pending_contributions', {
        limit_count: limit,
      });

      if (rpcError) throw rpcError;

      const pendingContributions: PendingContributionForReview[] = (data || []).map(
        (item: {
          id: string;
          product_id: string;
          product_name: string;
          contributor_id: string;
          contributor_name: string;
          contribution_type: string;
          data: any;
          created_at: string;
        }) => ({
          id: item.id,
          productId: item.product_id,
          productName: item.product_name,
          contributorId: item.contributor_id,
          contributorName: item.contributor_name,
          contributionType: item.contribution_type as 'barcode' | 'image' | 'price' | 'info',
          data: item.data,
          createdAt: item.created_at,
        })
      );

      setContributions(pendingContributions);
    } catch (err) {
      console.error('Error al cargar contribuciones pendientes:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar contribuciones');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (checkIsModeratorOrAdmin(role)) {
      loadContributions();
    }
  }, [role, limit]);

  return {
    contributions,
    isLoading,
    error,
    refresh: loadContributions,
  };
};

/**
 * Hook para acciones de moderación (aprobar/rechazar)
 */
export const useModerationActions = () => {
  const { isModeratorOrAdmin } = useUserRole();
  const { user } = useAuthStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Aprobar una contribución
   */
  const approveContribution = async (dto: ApproveContributionDTO): Promise<boolean> => {
    if (!isModeratorOrAdmin || !user) {
      setError('No tienes permisos para aprobar contribuciones');
      return false;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const { data, error: rpcError } = await supabase.rpc('approve_contribution', {
        contribution_id: dto.contributionId,
        reviewer_id: user.id,
      });

      if (rpcError) throw rpcError;

      return data === true;
    } catch (err) {
      console.error('Error al aprobar contribución:', err);
      setError(err instanceof Error ? err.message : 'Error al aprobar contribución');
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Rechazar una contribución
   */
  const rejectContribution = async (dto: RejectContributionDTO): Promise<boolean> => {
    if (!isModeratorOrAdmin || !user) {
      setError('No tienes permisos para rechazar contribuciones');
      return false;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const { data, error: rpcError } = await supabase.rpc('reject_contribution', {
        contribution_id: dto.contributionId,
        reviewer_id: user.id,
        reason: dto.reason,
      });

      if (rpcError) throw rpcError;

      return data === true;
    } catch (err) {
      console.error('Error al rechazar contribución:', err);
      setError(err instanceof Error ? err.message : 'Error al rechazar contribución');
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    approveContribution,
    rejectContribution,
    isProcessing,
    error,
  };
};
