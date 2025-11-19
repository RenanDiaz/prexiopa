/**
 * Authentication Service
 * Servicio para gestión de autenticación y sesiones de usuario
 */

import apiClient, { api } from './api';
import { supabase } from '../supabaseClient';
import type { ApiResponse, MutationResponse } from '../types/api.types';
import type {
  User,
  LoginCredentials,
  RegisterInput,
  AuthResponse,
  ChangePasswordInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  UpdateUserProfileInput,
  UpdateUserPreferencesInput,
} from '../types/user.types';

/**
 * Inicia sesión con email y contraseña
 * @param credentials Credenciales de login
 * @returns Promise con respuesta de autenticación
 */
export const login = async (credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> => {
  try {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      '/auth/login',
      credentials
    );

    // Guardar tokens en localStorage
    if (response.data.success && response.data.data) {
      api.setAuthToken(response.data.data.accessToken);
      if (response.data.data.refreshToken) {
        api.setRefreshToken(response.data.data.refreshToken);
      }
    }

    return response.data;
  } catch (error) {
    console.error('[authService] Error al iniciar sesión:', error);
    throw error;
  }
};

/**
 * Registra un nuevo usuario
 * @param data Datos de registro
 * @returns Promise con respuesta de autenticación
 */
export const register = async (data: RegisterInput): Promise<ApiResponse<AuthResponse>> => {
  try {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data);

    // Guardar tokens en localStorage
    if (response.data.success && response.data.data) {
      api.setAuthToken(response.data.data.accessToken);
      if (response.data.data.refreshToken) {
        api.setRefreshToken(response.data.data.refreshToken);
      }
    }

    return response.data;
  } catch (error) {
    console.error('[authService] Error al registrar usuario:', error);
    throw error;
  }
};

/**
 * Cierra la sesión del usuario
 * @returns Promise con resultado de la operación
 */
export const logout = async (): Promise<ApiResponse<void>> => {
  try {
    const response = await apiClient.post<ApiResponse<void>>('/auth/logout');

    // Limpiar tokens del localStorage
    api.removeAuthToken();
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');

    return response.data;
  } catch (error) {
    console.error('[authService] Error al cerrar sesión:', error);
    // Limpiar tokens incluso si falla el request
    api.removeAuthToken();
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    throw error;
  }
};

/**
 * Refresca el token de autenticación
 * @param refreshToken Token de refresco
 * @returns Promise con nuevo token de acceso
 */
export const refreshToken = async (
  refreshToken: string
): Promise<ApiResponse<AuthResponse>> => {
  try {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/refresh', {
      refreshToken,
    });

    // Actualizar tokens
    if (response.data.success && response.data.data) {
      api.setAuthToken(response.data.data.accessToken);
      if (response.data.data.refreshToken) {
        api.setRefreshToken(response.data.data.refreshToken);
      }
    }

    return response.data;
  } catch (error) {
    console.error('[authService] Error al refrescar token:', error);
    throw error;
  }
};

/**
 * Obtiene la información del usuario autenticado
 * @returns Promise con datos del usuario
 */
export const getCurrentUser = async (): Promise<ApiResponse<User>> => {
  try {
    const response = await apiClient.get<ApiResponse<User>>('/auth/me');
    return response.data;
  } catch (error) {
    console.error('[authService] Error al obtener usuario actual:', error);
    throw error;
  }
};

/**
 * Actualiza el perfil del usuario
 * @param data Datos a actualizar
 * @returns Promise con usuario actualizado
 */
export const updateProfile = async (
  data: UpdateUserProfileInput
): Promise<MutationResponse<User>> => {
  try {
    const response = await apiClient.patch<MutationResponse<User>>('/auth/profile', data);
    return response.data;
  } catch (error) {
    console.error('[authService] Error al actualizar perfil:', error);
    throw error;
  }
};

/**
 * Actualiza las preferencias del usuario
 * @param preferences Preferencias a actualizar
 * @returns Promise con usuario actualizado
 */
export const updatePreferences = async (
  preferences: UpdateUserPreferencesInput
): Promise<MutationResponse<User>> => {
  try {
    const response = await apiClient.patch<MutationResponse<User>>(
      '/auth/preferences',
      preferences
    );
    return response.data;
  } catch (error) {
    console.error('[authService] Error al actualizar preferencias:', error);
    throw error;
  }
};

/**
 * Cambia la contraseña del usuario
 * @param data Datos de cambio de contraseña
 * @returns Promise con resultado de la operación
 */
export const changePassword = async (
  data: ChangePasswordInput
): Promise<MutationResponse<void>> => {
  try {
    const response = await apiClient.post<MutationResponse<void>>(
      '/auth/change-password',
      data
    );
    return response.data;
  } catch (error) {
    console.error('[authService] Error al cambiar contraseña:', error);
    throw error;
  }
};

/**
 * Solicita reseteo de contraseña (envía email)
 * @param data Email del usuario
 * @returns Promise con resultado de la operación
 */
export const forgotPassword = async (
  data: ForgotPasswordInput
): Promise<ApiResponse<{ message: string }>> => {
  try {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(
      '/auth/forgot-password',
      data
    );
    return response.data;
  } catch (error) {
    console.error('[authService] Error al solicitar reseteo de contraseña:', error);
    throw error;
  }
};

/**
 * Resetea la contraseña con el token recibido por email
 * @param data Token y nueva contraseña
 * @returns Promise con resultado de la operación
 */
export const resetPassword = async (
  data: ResetPasswordInput
): Promise<ApiResponse<{ message: string }>> => {
  try {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(
      '/auth/reset-password',
      data
    );
    return response.data;
  } catch (error) {
    console.error('[authService] Error al resetear contraseña:', error);
    throw error;
  }
};

/**
 * Verifica el email del usuario
 * @param token Token de verificación
 * @returns Promise con resultado de la operación
 */
export const verifyEmail = async (
  token: string
): Promise<ApiResponse<{ message: string }>> => {
  try {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(
      '/auth/verify-email',
      { token }
    );
    return response.data;
  } catch (error) {
    console.error('[authService] Error al verificar email:', error);
    throw error;
  }
};

/**
 * Re-envía el email de verificación
 * @returns Promise con resultado de la operación
 */
export const resendVerificationEmail = async (): Promise<
  ApiResponse<{ message: string }>
> => {
  try {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(
      '/auth/resend-verification'
    );
    return response.data;
  } catch (error) {
    console.error('[authService] Error al reenviar email de verificación:', error);
    throw error;
  }
};

/**
 * Verifica si un email ya está registrado
 * @param email Email a verificar
 * @returns Promise con disponibilidad del email
 */
export const checkEmailAvailability = async (
  email: string
): Promise<ApiResponse<{ available: boolean }>> => {
  try {
    const response = await apiClient.post<ApiResponse<{ available: boolean }>>(
      '/auth/check-email',
      { email }
    );
    return response.data;
  } catch (error) {
    console.error('[authService] Error al verificar disponibilidad de email:', error);
    throw error;
  }
};

/**
 * Verifica si un username ya está en uso
 * @param username Username a verificar
 * @returns Promise con disponibilidad del username
 */
export const checkUsernameAvailability = async (
  username: string
): Promise<ApiResponse<{ available: boolean }>> => {
  try {
    const response = await apiClient.post<ApiResponse<{ available: boolean }>>(
      '/auth/check-username',
      { username }
    );
    return response.data;
  } catch (error) {
    console.error('[authService] Error al verificar disponibilidad de username:', error);
    throw error;
  }
};

/**
 * Elimina la cuenta del usuario
 * @param password Contraseña actual para confirmar
 * @returns Promise con resultado de la operación
 */
export const deleteAccount = async (
  password: string
): Promise<MutationResponse<void>> => {
  try {
    const response = await apiClient.delete<MutationResponse<void>>('/auth/account', {
      data: { password },
    });

    // Limpiar tokens del localStorage
    api.removeAuthToken();
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');

    return response.data;
  } catch (error) {
    console.error('[authService] Error al eliminar cuenta:', error);
    throw error;
  }
};

/**
 * Obtiene las sesiones activas del usuario
 * @returns Promise con array de sesiones
 */
export const getActiveSessions = async (): Promise<
  ApiResponse<
    Array<{
      id: string;
      device: string;
      browser: string;
      location?: string;
      lastActive: Date;
      current: boolean;
    }>
  >
> => {
  try {
    const response = await apiClient.get<
      ApiResponse<
        Array<{
          id: string;
          device: string;
          browser: string;
          location?: string;
          lastActive: Date;
          current: boolean;
        }>
      >
    >('/auth/sessions');
    return response.data;
  } catch (error) {
    console.error('[authService] Error al obtener sesiones activas:', error);
    throw error;
  }
};

/**
 * Revoca una sesión específica
 * @param sessionId ID de la sesión a revocar
 * @returns Promise con resultado de la operación
 */
export const revokeSession = async (
  sessionId: string
): Promise<MutationResponse<void>> => {
  try {
    const response = await apiClient.delete<MutationResponse<void>>(
      `/auth/sessions/${sessionId}`
    );
    return response.data;
  } catch (error) {
    console.error('[authService] Error al revocar sesión:', error);
    throw error;
  }
};

/**
 * Revoca todas las sesiones excepto la actual
 * @returns Promise con resultado de la operación
 */
export const revokeAllOtherSessions = async (): Promise<
  MutationResponse<{ revoked: number }>
> => {
  try {
    const response = await apiClient.delete<MutationResponse<{ revoked: number }>>(
      '/auth/sessions/others'
    );
    return response.data;
  } catch (error) {
    console.error('[authService] Error al revocar otras sesiones:', error);
    throw error;
  }
};

/**
 * Inicia sesión con Google OAuth
 * @returns Promise con resultado de la operación
 */
export const loginWithGoogle = async (): Promise<{
  error: Error | null;
  url?: string;
}> => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      console.error('[authService] Error al iniciar sesión con Google:', error);
      return { error };
    }

    return { error: null, url: data.url };
  } catch (error) {
    console.error('[authService] Error inesperado al iniciar sesión con Google:', error);
    return { error: error as Error };
  }
};

/**
 * Maneja el callback de OAuth después de la autenticación
 * @returns Promise con datos del usuario autenticado
 */
export const handleOAuthCallback = async (): Promise<{
  user: User | null;
  error: Error | null;
}> => {
  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error('[authService] Error al obtener sesión de OAuth:', error);
      return { user: null, error };
    }

    if (!data.session) {
      return { user: null, error: new Error('No session found') };
    }

    // Convertir los datos de Supabase a nuestro formato de User
    const user: User = {
      id: data.session.user.id,
      email: data.session.user.email || '',
      name: data.session.user.user_metadata.full_name || data.session.user.user_metadata.name,
      avatar: data.session.user.user_metadata.avatar_url || data.session.user.user_metadata.picture,
      createdAt: new Date(data.session.user.created_at),
      updatedAt: new Date(data.session.user.updated_at || data.session.user.created_at),
      emailVerified: !!data.session.user.email_confirmed_at,
      role: 'user' as any,
      preferences: {
        favoriteStores: [],
        notificationsEnabled: true,
        notifications: {
          email: true,
          push: true,
          priceAlerts: true,
          newProducts: true,
          specialOffers: true,
          weeklyDigest: false,
        },
        priceAlertThreshold: 10,
        language: 'es',
        preferredCurrency: 'USD',
        darkMode: false,
      },
    };

    // Guardar tokens
    if (data.session.access_token) {
      api.setAuthToken(data.session.access_token);
    }
    if (data.session.refresh_token) {
      api.setRefreshToken(data.session.refresh_token);
    }

    return { user, error: null };
  } catch (error) {
    console.error('[authService] Error inesperado al procesar callback de OAuth:', error);
    return { user: null, error: error as Error };
  }
};

/**
 * Cierra sesión de Supabase
 * @returns Promise con resultado de la operación
 */
export const logoutFromSupabase = async (): Promise<{ error: Error | null }> => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('[authService] Error al cerrar sesión de Supabase:', error);
      return { error };
    }

    // Limpiar tokens del localStorage
    api.removeAuthToken();
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');

    return { error: null };
  } catch (error) {
    console.error('[authService] Error inesperado al cerrar sesión de Supabase:', error);
    return { error: error as Error };
  }
};

/**
 * Servicio de autenticación exportado
 */
export const authService = {
  // Autenticación tradicional
  login,
  register,
  logout,
  refreshToken,
  getCurrentUser,

  // OAuth con Google
  loginWithGoogle,
  handleOAuthCallback,
  logoutFromSupabase,

  // Perfil y preferencias
  updateProfile,
  updatePreferences,

  // Contraseñas
  changePassword,
  forgotPassword,
  resetPassword,

  // Verificación
  verifyEmail,
  resendVerificationEmail,

  // Validación
  checkEmailAvailability,
  checkUsernameAvailability,

  // Cuenta
  deleteAccount,

  // Sesiones
  getActiveSessions,
  revokeSession,
  revokeAllOtherSessions,
};

export default authService;
