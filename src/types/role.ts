/**
 * Types para Sistema de Roles y Permisos
 * Define los tipos de roles de usuario y sus permisos asociados
 */

// =====================================================
// TIPOS DE ROLES
// =====================================================

/**
 * Roles disponibles en el sistema
 * - user: Usuario normal (default)
 * - moderator: Moderador que puede revisar contribuciones
 * - admin: Administrador con acceso completo
 */
export type UserRole = 'user' | 'moderator' | 'admin';

/**
 * Estructura del registro de rol de usuario
 */
export interface UserRoleRecord {
  id: string;
  userId: string;
  role: UserRole;
  assignedBy?: string | null;
  assignedAt: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * DTO para asignar un rol a un usuario
 */
export interface AssignRoleDTO {
  userId: string;
  role: UserRole;
}

// =====================================================
// PERMISOS POR ROL
// =====================================================

/**
 * Permisos específicos que puede tener un rol
 */
export interface RolePermissions {
  // Contribuciones
  canViewOwnContributions: boolean;
  canViewAllContributions: boolean;
  canSubmitContributions: boolean;
  canApproveContributions: boolean;
  canRejectContributions: boolean;
  canDeleteOwnContributions: boolean;
  canDeleteAnyContribution: boolean;

  // Usuarios
  canViewOwnProfile: boolean;
  canViewAllUsers: boolean;
  canAssignRoles: boolean;

  // Productos
  canViewProducts: boolean;
  canEditProducts: boolean;
  canDeleteProducts: boolean;

  // Dashboard
  canAccessModerationDashboard: boolean;
  canAccessAdminDashboard: boolean;
  canViewModerationStats: boolean;
}

/**
 * Mapa de permisos por rol
 */
export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  user: {
    canViewOwnContributions: true,
    canViewAllContributions: false,
    canSubmitContributions: true,
    canApproveContributions: false,
    canRejectContributions: false,
    canDeleteOwnContributions: true,
    canDeleteAnyContribution: false,
    canViewOwnProfile: true,
    canViewAllUsers: false,
    canAssignRoles: false,
    canViewProducts: true,
    canEditProducts: false,
    canDeleteProducts: false,
    canAccessModerationDashboard: false,
    canAccessAdminDashboard: false,
    canViewModerationStats: false,
  },
  moderator: {
    canViewOwnContributions: true,
    canViewAllContributions: true,
    canSubmitContributions: true,
    canApproveContributions: true,
    canRejectContributions: true,
    canDeleteOwnContributions: true,
    canDeleteAnyContribution: false,
    canViewOwnProfile: true,
    canViewAllUsers: true,
    canAssignRoles: false,
    canViewProducts: true,
    canEditProducts: true,
    canDeleteProducts: false,
    canAccessModerationDashboard: true,
    canAccessAdminDashboard: false,
    canViewModerationStats: true,
  },
  admin: {
    canViewOwnContributions: true,
    canViewAllContributions: true,
    canSubmitContributions: true,
    canApproveContributions: true,
    canRejectContributions: true,
    canDeleteOwnContributions: true,
    canDeleteAnyContribution: true,
    canViewOwnProfile: true,
    canViewAllUsers: true,
    canAssignRoles: true,
    canViewProducts: true,
    canEditProducts: true,
    canDeleteProducts: true,
    canAccessModerationDashboard: true,
    canAccessAdminDashboard: true,
    canViewModerationStats: true,
  },
};

// =====================================================
// HELPERS PARA VERIFICAR PERMISOS
// =====================================================

/**
 * Verifica si un rol tiene un permiso específico
 */
export const hasPermission = (role: UserRole, permission: keyof RolePermissions): boolean => {
  return ROLE_PERMISSIONS[role][permission];
};

/**
 * Verifica si un rol es moderador o admin
 */
export const isModeratorOrAdmin = (role: UserRole): boolean => {
  return role === 'moderator' || role === 'admin';
};

/**
 * Verifica si un rol es admin
 */
export const isAdmin = (role: UserRole): boolean => {
  return role === 'admin';
};

/**
 * Obtiene todas las rutas permitidas para un rol
 */
export const getAllowedRoutes = (role: UserRole): string[] => {
  const baseRoutes = ['/', '/products', '/profile'];

  if (isModeratorOrAdmin(role)) {
    baseRoutes.push('/moderation');
  }

  if (isAdmin(role)) {
    baseRoutes.push('/admin');
  }

  return baseRoutes;
};

// =====================================================
// ESTADÍSTICAS DE MODERACIÓN
// =====================================================

/**
 * Estadísticas generales de moderación
 * Retornadas por la función RPC get_moderation_stats()
 */
export interface ModerationStats {
  totalUsers: number;
  totalModerators: number;
  totalAdmins: number;
  pendingContributions: number;
  approvedContributions: number;
  rejectedContributions: number;
}

// =====================================================
// CONTRIBUCIONES PENDIENTES (para moderación)
// =====================================================

/**
 * Contribución pendiente de revisión
 * Retornada por la función RPC get_pending_contributions()
 */
export interface PendingContributionForReview {
  id: string;
  productId: string;
  productName: string;
  contributorId: string;
  contributorName: string;
  contributionType: 'barcode' | 'image' | 'price' | 'info';
  data: any;
  createdAt: string;
}

/**
 * DTO para aprobar una contribución
 */
export interface ApproveContributionDTO {
  contributionId: string;
}

/**
 * DTO para rechazar una contribución
 */
export interface RejectContributionDTO {
  contributionId: string;
  reason: string;
}

// =====================================================
// LABELS Y UI
// =====================================================

/**
 * Labels en español para roles
 */
export const ROLE_LABELS: Record<UserRole, string> = {
  user: 'Usuario',
  moderator: 'Moderador',
  admin: 'Administrador',
};

/**
 * Descripciones de roles
 */
export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  user: 'Usuario normal con permisos básicos',
  moderator: 'Moderador con capacidad de revisar contribuciones',
  admin: 'Administrador con acceso completo al sistema',
};

/**
 * Colores para badges de roles
 */
export const ROLE_COLORS: Record<UserRole, { bg: string; text: string }> = {
  user: {
    bg: '#E3F2FD',
    text: '#1565C0',
  },
  moderator: {
    bg: '#F3E5F5',
    text: '#6A1B9A',
  },
  admin: {
    bg: '#FFEBEE',
    text: '#C62828',
  },
};
