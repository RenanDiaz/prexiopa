/**
 * API Service Configuration
 * Configuración base de Axios con interceptores para autenticación y manejo de errores
 */

import axios, { AxiosError } from 'axios';
import type { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import type { ApiResponse, ApiError } from '../types/api.types';
import { ApiErrorCode } from '../types/api.types';

/**
 * URL base de la API
 * En producción, esto vendrá de variables de entorno
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

/**
 * Timeout por defecto para requests (10 segundos)
 */
const DEFAULT_TIMEOUT = 10000;

/**
 * Instancia de Axios configurada
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: DEFAULT_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'X-Client-ID': 'prexiopa-web',
    'X-API-Version': 'v1',
  },
});

/**
 * Obtiene el token de autenticación del localStorage
 */
const getAuthToken = (): string | null => {
  try {
    return localStorage.getItem('auth_token');
  } catch (error) {
    console.error('Error al obtener token:', error);
    return null;
  }
};

/**
 * Guarda el token de autenticación en localStorage
 */
const setAuthToken = (token: string): void => {
  try {
    localStorage.setItem('auth_token', token);
  } catch (error) {
    console.error('Error al guardar token:', error);
  }
};

/**
 * Elimina el token de autenticación del localStorage
 */
const removeAuthToken = (): void => {
  try {
    localStorage.removeItem('auth_token');
  } catch (error) {
    console.error('Error al eliminar token:', error);
  }
};

/**
 * Obtiene el refresh token del localStorage
 */
const getRefreshToken = (): string | null => {
  try {
    return localStorage.getItem('refresh_token');
  } catch (error) {
    console.error('Error al obtener refresh token:', error);
    return null;
  }
};

/**
 * Guarda el refresh token en localStorage
 */
const setRefreshToken = (token: string): void => {
  try {
    localStorage.setItem('refresh_token', token);
  } catch (error) {
    console.error('Error al guardar refresh token:', error);
  }
};

/**
 * Variable para controlar si ya se está refrescando el token
 */
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

/**
 * Procesa la cola de requests fallidos después de refrescar el token
 */
const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Intenta refrescar el token de autenticación
 */
const refreshAuthToken = async (): Promise<string> => {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  try {
    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
      refreshToken,
    });

    const { accessToken, refreshToken: newRefreshToken } = response.data.data;

    setAuthToken(accessToken);
    if (newRefreshToken) {
      setRefreshToken(newRefreshToken);
    }

    return accessToken;
  } catch (error) {
    // Si falla el refresh, limpiar tokens y redirigir a login
    removeAuthToken();
    localStorage.removeItem('refresh_token');
    throw error;
  }
};

/**
 * Request Interceptor
 * Agrega el token de autenticación a todas las requests
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Agregar token de autenticación si existe
    const token = getAuthToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Agregar request ID único para tracking
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    if (config.headers) {
      config.headers['X-Request-ID'] = requestId;
    }

    // Log de request en desarrollo
    if (import.meta.env.DEV) {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
        params: config.params,
        data: config.data,
      });
    }

    return config;
  },
  (error: AxiosError) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Maneja errores y refresh token automático
 */
apiClient.interceptors.response.use(
  (response) => {
    // Log de response en desarrollo
    if (import.meta.env.DEV) {
      console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data,
      });
    }

    return response;
  },
  async (error: AxiosError<ApiResponse>) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // Log de error en desarrollo
    if (import.meta.env.DEV) {
      console.error('[API Response Error]', {
        url: error.config?.url,
        status: error.response?.status,
        data: error.response?.data,
      });
    }

    // Si el error es 401 y no es un request de login/refresh
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      if (isRefreshing) {
        // Si ya se está refrescando, agregar a la cola
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshAuthToken();
        processQueue(null, newToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }

        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as Error, null);

        // Redirigir a login
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Transformar error de Axios a ApiError
    const apiError = transformAxiosError(error);
    return Promise.reject(apiError);
  }
);

/**
 * Transforma un error de Axios a ApiError
 */
const transformAxiosError = (error: AxiosError<ApiResponse>): ApiError => {
  // Si la respuesta tiene estructura de ApiError
  if (error.response?.data?.error) {
    return error.response.data.error;
  }

  // Crear ApiError basado en el tipo de error
  const apiError: ApiError = {
    code: ApiErrorCode.INTERNAL_SERVER_ERROR,
    message: 'Error desconocido',
    timestamp: new Date(),
  };

  if (error.response) {
    // Error de respuesta del servidor
    apiError.code = getErrorCodeFromStatus(error.response.status);
    apiError.message = error.response.data?.message || error.message;
  } else if (error.request) {
    // Error de red (no se recibió respuesta)
    apiError.code = ApiErrorCode.NETWORK_ERROR;
    apiError.message = 'Error de red. Verifica tu conexión a internet.';
  } else {
    // Error al configurar el request
    apiError.message = error.message;
  }

  if (error.code === 'ECONNABORTED') {
    apiError.code = ApiErrorCode.TIMEOUT;
    apiError.message = 'La solicitud tardó demasiado. Intenta de nuevo.';
  }

  return apiError;
};

/**
 * Obtiene el código de error basado en el status HTTP
 */
const getErrorCodeFromStatus = (status: number): ApiErrorCode => {
  switch (status) {
    case 400:
      return ApiErrorCode.VALIDATION_ERROR;
    case 401:
      return ApiErrorCode.UNAUTHORIZED;
    case 403:
      return ApiErrorCode.FORBIDDEN;
    case 404:
      return ApiErrorCode.NOT_FOUND;
    case 409:
      return ApiErrorCode.CONFLICT;
    case 429:
      return ApiErrorCode.RATE_LIMIT_EXCEEDED;
    case 500:
      return ApiErrorCode.INTERNAL_SERVER_ERROR;
    case 503:
      return ApiErrorCode.SERVICE_UNAVAILABLE;
    default:
      return ApiErrorCode.INTERNAL_SERVER_ERROR;
  }
};

/**
 * Configuración de API exportada
 */
export const api = {
  client: apiClient,
  setAuthToken,
  getAuthToken,
  removeAuthToken,
  setRefreshToken,
  getRefreshToken,
};

export default apiClient;
