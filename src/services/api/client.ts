/**
 * API Client
 * Configuración de axios con interceptores y manejo de errores
 */

import axios, { type AxiosError, type AxiosInstance, type AxiosRequestConfig } from 'axios';

// Base URL de la API (puede ser configurada por entorno)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

/**
 * Instancia de axios configurada
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 segundos
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Interceptor de request para agregar token de autenticación
 */
apiClient.interceptors.request.use(
  (config) => {
    // Obtener token de localStorage
    const token = localStorage.getItem('access_token');

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    console.error('[API Client] Request error:', error);
    return Promise.reject(error);
  }
);

/**
 * Interceptor de response para manejar errores globalmente
 */
apiClient.interceptors.response.use(
  (response) => {
    // Retornar la data directamente
    return response;
  },
  async (error: AxiosError) => {
    console.error('[API Client] Response error:', error);

    // Manejo de errores específicos
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Token inválido o expirado
          console.error('[API Client] Unauthorized - Token inválido o expirado');

          // Intentar refrescar el token
          const refreshToken = localStorage.getItem('refresh_token');
          if (refreshToken) {
            try {
              // Aquí iría la lógica de refresh token
              // Por ahora, simplemente limpiamos tokens y redirigimos
              localStorage.removeItem('access_token');
              localStorage.removeItem('refresh_token');

              // Redirigir a login si no estamos ya ahí
              if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
              }
            } catch (refreshError) {
              console.error('[API Client] Error refreshing token:', refreshError);
            }
          } else {
            // No hay refresh token, redirigir a login
            localStorage.removeItem('access_token');
            if (!window.location.pathname.includes('/login')) {
              window.location.href = '/login';
            }
          }
          break;

        case 403:
          console.error('[API Client] Forbidden - Sin permisos para acceder a este recurso');
          break;

        case 404:
          console.error('[API Client] Not Found - Recurso no encontrado');
          break;

        case 422:
          console.error('[API Client] Validation Error:', data);
          break;

        case 500:
          console.error('[API Client] Server Error - Error interno del servidor');
          break;

        default:
          console.error(`[API Client] HTTP Error ${status}:`, data);
      }
    } else if (error.request) {
      // La petición fue hecha pero no hubo respuesta
      console.error('[API Client] No response received:', error.request);
    } else {
      // Algo pasó en la configuración de la petición
      console.error('[API Client] Error setting up request:', error.message);
    }

    return Promise.reject(error);
  }
);

/**
 * Helper para configurar el token de autenticación
 */
export const setAuthToken = (token: string | null): void => {
  if (token) {
    localStorage.setItem('access_token', token);
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('access_token');
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

/**
 * Helper para configurar el refresh token
 */
export const setRefreshToken = (token: string | null): void => {
  if (token) {
    localStorage.setItem('refresh_token', token);
  } else {
    localStorage.removeItem('refresh_token');
  }
};

/**
 * Helper para limpiar tokens
 */
export const clearAuthTokens = (): void => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  delete apiClient.defaults.headers.common['Authorization'];
};

/**
 * Métodos de conveniencia para hacer peticiones
 */
export const api = {
  get: <T = any>(url: string, config?: AxiosRequestConfig) =>
    apiClient.get<T>(url, config),

  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiClient.post<T>(url, data, config),

  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiClient.put<T>(url, data, config),

  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiClient.patch<T>(url, data, config),

  delete: <T = any>(url: string, config?: AxiosRequestConfig) =>
    apiClient.delete<T>(url, config),

  // Helpers para tokens
  setAuthToken,
  setRefreshToken,
  clearAuthTokens,
};

export default api;
