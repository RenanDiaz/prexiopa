/**
 * User Types
 * Tipos relacionados con usuarios y preferencias
 */

import type { StoreChain } from './store.types';
import type { ProductCategory } from './product.types';

/**
 * Rol del usuario en la plataforma
 */
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
}

/**
 * Preferencias de notificación del usuario
 */
export interface NotificationPreferences {
  /** Notificaciones por email */
  email: boolean;
  /** Notificaciones push */
  push: boolean;
  /** Notificaciones de alertas de precio */
  priceAlerts: boolean;
  /** Notificaciones de nuevos productos */
  newProducts: boolean;
  /** Notificaciones de ofertas especiales */
  specialOffers: boolean;
  /** Resumen semanal de precios */
  weeklyDigest: boolean;
}

/**
 * Ubicación predeterminada del usuario
 */
export interface UserLocation {
  /** Provincia */
  province: string;
  /** Distrito */
  district?: string;
  /** Coordenadas aproximadas */
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

/**
 * Preferencias del usuario
 */
export interface UserPreferences {
  /** Tiendas favoritas (IDs de tiendas o chains) */
  favoriteStores: string[];
  /** Cadenas de supermercados preferidas */
  preferredChains?: StoreChain[];
  /** Categorías de interés */
  interestedCategories?: ProductCategory[];
  /** Notificaciones habilitadas */
  notificationsEnabled: boolean;
  /** Preferencias detalladas de notificaciones */
  notifications: NotificationPreferences;
  /** Umbral de precio para alertas (porcentaje de descuento mínimo) */
  priceAlertThreshold: number;
  /** Ubicación predeterminada */
  defaultLocation?: UserLocation;
  /** Moneda preferida para visualización */
  preferredCurrency?: 'USD' | 'PAB';
  /** Modo oscuro */
  darkMode?: boolean;
  /** Idioma preferido */
  language?: 'es' | 'en';
}

/**
 * Información completa del usuario
 */
export interface User {
  /** ID único del usuario */
  id: string;
  /** Email del usuario */
  email: string;
  /** Nombre completo */
  name: string;
  /** Nombre de usuario (opcional) */
  username?: string;
  /** URL del avatar */
  avatar?: string;
  /** Teléfono (opcional) */
  phone?: string;
  /** Rol del usuario */
  role: UserRole;
  /** Preferencias del usuario */
  preferences: UserPreferences;
  /** Indica si el email está verificado */
  emailVerified: boolean;
  /** Fecha de último acceso */
  lastLoginAt?: Date;
  /** Fecha de creación de la cuenta */
  createdAt: Date;
  /** Fecha de última actualización */
  updatedAt: Date;
}

/**
 * Perfil público del usuario
 */
export interface UserProfile {
  id: string;
  name: string;
  username?: string;
  avatar?: string;
  /** Número de productos favoritos */
  favoriteCount?: number;
  /** Número de alertas activas */
  alertCount?: number;
  /** Miembro desde */
  memberSince: Date;
}

/**
 * Credenciales para login
 */
export interface LoginCredentials {
  email: string;
  password: string;
  /** Recordar sesión */
  rememberMe?: boolean;
}

/**
 * Datos para registro de usuario
 */
export interface RegisterInput {
  email: string;
  password: string;
  name: string;
  username?: string;
  /** Aceptación de términos y condiciones */
  acceptTerms: boolean;
}

/**
 * Respuesta de autenticación
 */
export interface AuthResponse {
  /** Usuario autenticado */
  user: User;
  /** Token de acceso JWT */
  accessToken: string;
  /** Token de refresco */
  refreshToken?: string;
  /** Tiempo de expiración del token (en segundos) */
  expiresIn: number;
}

/**
 * Parámetros para actualizar perfil
 */
export type UpdateUserProfileInput = Partial<Pick<User, 'name' | 'username' | 'avatar' | 'phone'>>;

/**
 * Parámetros para actualizar preferencias
 */
export type UpdateUserPreferencesInput = Partial<UserPreferences>;

/**
 * Parámetros para cambiar contraseña
 */
export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Parámetros para recuperar contraseña
 */
export interface ForgotPasswordInput {
  email: string;
}

/**
 * Parámetros para resetear contraseña
 */
export interface ResetPasswordInput {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Estado de autenticación
 */
export interface AuthState {
  /** Usuario actual */
  user: User | null;
  /** Token de acceso */
  token: string | null;
  /** Indica si está autenticado */
  isAuthenticated: boolean;
  /** Indica si está cargando */
  isLoading: boolean;
  /** Error de autenticación */
  error: string | null;
}
