/**
 * API Types
 * Tipos relacionados con respuestas de API y manejo de errores
 */

/**
 * Códigos de error estándar de la API
 */
export enum ApiErrorCode {
  // Errores de autenticación (401)
  UNAUTHORIZED = 'UNAUTHORIZED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',

  // Errores de autorización (403)
  FORBIDDEN = 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',

  // Errores de validación (400)
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT = 'INVALID_FORMAT',

  // Errores de recursos (404)
  NOT_FOUND = 'NOT_FOUND',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',

  // Errores de conflicto (409)
  CONFLICT = 'CONFLICT',
  DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',
  RESOURCE_ALREADY_EXISTS = 'RESOURCE_ALREADY_EXISTS',

  // Errores de rate limiting (429)
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',

  // Errores del servidor (500+)
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',

  // Errores de red
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',

  // Errores específicos del negocio
  PRODUCT_NOT_AVAILABLE = 'PRODUCT_NOT_AVAILABLE',
  STORE_NOT_AVAILABLE = 'STORE_NOT_AVAILABLE',
  ALERT_LIMIT_REACHED = 'ALERT_LIMIT_REACHED',
  FAVORITE_LIMIT_REACHED = 'FAVORITE_LIMIT_REACHED',
}

/**
 * Detalles adicionales del error
 */
export interface ApiErrorDetails {
  /** Campo que causó el error (para errores de validación) */
  field?: string;
  /** Valor proporcionado */
  value?: any;
  /** Restricción que falló */
  constraint?: string;
  /** Información adicional */
  [key: string]: any;
}

/**
 * Error de la API
 */
export interface ApiError {
  /** Código de error */
  code: ApiErrorCode | string;
  /** Mensaje de error legible */
  message: string;
  /** Detalles adicionales del error */
  details?: ApiErrorDetails | ApiErrorDetails[];
  /** Stack trace (solo en desarrollo) */
  stack?: string;
  /** Timestamp del error */
  timestamp?: Date;
  /** Request ID para debugging */
  requestId?: string;
}

/**
 * Respuesta genérica de la API
 */
export interface ApiResponse<T = any> {
  /** Indica si la operación fue exitosa */
  success: boolean;
  /** Datos de la respuesta */
  data?: T;
  /** Error si la operación falló */
  error?: ApiError;
  /** Mensaje adicional */
  message?: string;
  /** Metadata adicional */
  meta?: Record<string, any>;
}

/**
 * Parámetros de paginación
 */
export interface PaginationParams {
  /** Número de página (1-indexed) */
  page: number;
  /** Cantidad de items por página */
  pageSize: number;
  /** Total de items disponibles */
  total?: number;
  /** Total de páginas */
  totalPages?: number;
}

/**
 * Metadata de paginación en respuestas
 */
export interface PaginationMeta extends PaginationParams {
  /** Indica si hay página anterior */
  hasPreviousPage: boolean;
  /** Indica si hay página siguiente */
  hasNextPage: boolean;
  /** Número de página anterior */
  previousPage?: number;
  /** Número de página siguiente */
  nextPage?: number;
}

/**
 * Respuesta paginada de la API
 */
export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  /** Información de paginación */
  pagination: PaginationMeta;
}

/**
 * Parámetros comunes de consulta
 */
export interface QueryParams {
  /** Búsqueda de texto */
  search?: string;
  /** Ordenamiento (ej: 'name:asc', 'price:desc') */
  sort?: string;
  /** Página */
  page?: number;
  /** Tamaño de página */
  limit?: number;
  /** Filtros adicionales */
  [key: string]: any;
}

/**
 * Headers HTTP comunes
 */
export interface ApiHeaders {
  /** Token de autorización */
  Authorization?: string;
  /** Tipo de contenido */
  'Content-Type'?: string;
  /** Identificador de cliente */
  'X-Client-ID'?: string;
  /** Versión de API */
  'X-API-Version'?: string;
  /** Request ID */
  'X-Request-ID'?: string;
  /** Headers adicionales */
  [key: string]: string | undefined;
}

/**
 * Configuración de request
 */
export interface ApiRequestConfig {
  /** URL del endpoint */
  url: string;
  /** Método HTTP */
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  /** Headers */
  headers?: ApiHeaders;
  /** Query parameters */
  params?: QueryParams;
  /** Body del request */
  data?: any;
  /** Timeout en milisegundos */
  timeout?: number;
  /** Indica si requiere autenticación */
  requiresAuth?: boolean;
}

/**
 * Información de rate limiting
 */
export interface RateLimitInfo {
  /** Límite de requests */
  limit: number;
  /** Requests restantes */
  remaining: number;
  /** Timestamp de reset */
  reset: Date;
  /** Tiempo hasta reset en segundos */
  retryAfter?: number;
}

/**
 * Respuesta con información de rate limiting
 */
export interface ApiResponseWithRateLimit<T = any> extends ApiResponse<T> {
  /** Información de rate limiting */
  rateLimit?: RateLimitInfo;
}

/**
 * Webhook payload
 */
export interface WebhookPayload<T = any> {
  /** ID del evento */
  id: string;
  /** Tipo de evento */
  event: string;
  /** Timestamp del evento */
  timestamp: Date;
  /** Datos del evento */
  data: T;
  /** Firma para verificación */
  signature?: string;
}

/**
 * Health check response
 */
export interface HealthCheckResponse {
  /** Estado del servicio */
  status: 'healthy' | 'degraded' | 'unhealthy';
  /** Timestamp del check */
  timestamp: Date;
  /** Versión de la API */
  version: string;
  /** Uptime en segundos */
  uptime?: number;
  /** Estado de servicios dependientes */
  dependencies?: {
    database?: 'up' | 'down';
    cache?: 'up' | 'down';
    [key: string]: string | undefined;
  };
}

/**
 * Batch request
 */
export interface BatchRequest {
  /** Array de requests */
  requests: Array<{
    id: string;
    method: string;
    url: string;
    body?: any;
  }>;
}

/**
 * Batch response
 */
export interface BatchResponse {
  /** Array de respuestas */
  responses: Array<{
    id: string;
    status: number;
    data?: any;
    error?: ApiError;
  }>;
}

/**
 * Utility type para respuestas de operaciones de escritura
 */
export interface MutationResponse<T = any> extends ApiResponse<T> {
  /** ID del recurso creado/actualizado */
  id?: string;
  /** Indica si fue una creación */
  created?: boolean;
  /** Indica si fue una actualización */
  updated?: boolean;
  /** Indica si fue una eliminación */
  deleted?: boolean;
}

/**
 * Utility type para validación de campos
 */
export interface FieldValidation {
  field: string;
  valid: boolean;
  error?: string;
}

/**
 * Respuesta de validación
 */
export interface ValidationResponse {
  valid: boolean;
  fields: FieldValidation[];
}
