/**
 * Alert Service
 * Servicio para gestión de alertas de precio
 */

import apiClient from './api';
import type { ApiResponse, PaginatedResponse, QueryParams, MutationResponse } from '../types/api.types';
import type {
  PriceAlert,
  AlertSummary,
  AlertTrigger,
  AlertStatistics,
  CreateAlertInput,
  UpdateAlertInput,
  AlertFilters,
  AlertCheckResult,
} from '../types/alert.types';

/**
 * Parámetros para obtener alertas
 */
export interface GetAlertsParams extends QueryParams, AlertFilters {}

/**
 * Obtiene todas las alertas del usuario autenticado
 * @param params Parámetros de consulta y filtros
 * @returns Promise con respuesta paginada de alertas
 */
export const getUserAlerts = async (
  params?: GetAlertsParams
): Promise<PaginatedResponse<AlertSummary>> => {
  try {
    const response = await apiClient.get<PaginatedResponse<AlertSummary>>('/alerts', {
      params,
    });
    return response.data;
  } catch (error) {
    console.error('[alertService] Error al obtener alertas del usuario:', error);
    throw error;
  }
};

/**
 * Obtiene una alerta específica por ID
 * @param id ID de la alerta
 * @returns Promise con información completa de la alerta
 */
export const getAlertById = async (id: string): Promise<ApiResponse<PriceAlert>> => {
  try {
    const response = await apiClient.get<ApiResponse<PriceAlert>>(`/alerts/${id}`);
    return response.data;
  } catch (error) {
    console.error(`[alertService] Error al obtener alerta ${id}:`, error);
    throw error;
  }
};

/**
 * Crea una nueva alerta de precio
 * @param data Datos de la alerta a crear
 * @returns Promise con la alerta creada
 */
export const createAlert = async (
  data: CreateAlertInput
): Promise<MutationResponse<PriceAlert>> => {
  try {
    const response = await apiClient.post<MutationResponse<PriceAlert>>('/alerts', data);
    return response.data;
  } catch (error) {
    console.error('[alertService] Error al crear alerta:', error);
    throw error;
  }
};

/**
 * Actualiza una alerta existente
 * @param id ID de la alerta
 * @param data Datos a actualizar
 * @returns Promise con la alerta actualizada
 */
export const updateAlert = async (
  id: string,
  data: UpdateAlertInput
): Promise<MutationResponse<PriceAlert>> => {
  try {
    const response = await apiClient.patch<MutationResponse<PriceAlert>>(
      `/alerts/${id}`,
      data
    );
    return response.data;
  } catch (error) {
    console.error(`[alertService] Error al actualizar alerta ${id}:`, error);
    throw error;
  }
};

/**
 * Elimina una alerta
 * @param id ID de la alerta a eliminar
 * @returns Promise con resultado de la eliminación
 */
export const deleteAlert = async (id: string): Promise<MutationResponse<void>> => {
  try {
    const response = await apiClient.delete<MutationResponse<void>>(`/alerts/${id}`);
    return response.data;
  } catch (error) {
    console.error(`[alertService] Error al eliminar alerta ${id}:`, error);
    throw error;
  }
};

/**
 * Obtiene alertas de un producto específico
 * @param productId ID del producto
 * @returns Promise con array de alertas
 */
export const getAlertsByProduct = async (
  productId: string
): Promise<ApiResponse<AlertSummary[]>> => {
  try {
    const response = await apiClient.get<ApiResponse<AlertSummary[]>>(
      `/alerts/product/${productId}`
    );
    return response.data;
  } catch (error) {
    console.error(`[alertService] Error al obtener alertas del producto ${productId}:`, error);
    throw error;
  }
};

/**
 * Activa o pausa una alerta
 * @param id ID de la alerta
 * @param isActive Estado deseado (true = activa, false = pausada)
 * @returns Promise con la alerta actualizada
 */
export const toggleAlert = async (
  id: string,
  isActive: boolean
): Promise<MutationResponse<PriceAlert>> => {
  try {
    const response = await apiClient.patch<MutationResponse<PriceAlert>>(
      `/alerts/${id}/toggle`,
      { isActive }
    );
    return response.data;
  } catch (error) {
    console.error(`[alertService] Error al cambiar estado de alerta ${id}:`, error);
    throw error;
  }
};

/**
 * Obtiene el historial de activaciones de una alerta
 * @param alertId ID de la alerta
 * @param params Parámetros de consulta
 * @returns Promise con respuesta paginada de activaciones
 */
export const getAlertTriggers = async (
  alertId: string,
  params?: QueryParams
): Promise<PaginatedResponse<AlertTrigger>> => {
  try {
    const response = await apiClient.get<PaginatedResponse<AlertTrigger>>(
      `/alerts/${alertId}/triggers`,
      { params }
    );
    return response.data;
  } catch (error) {
    console.error(`[alertService] Error al obtener activaciones de alerta ${alertId}:`, error);
    throw error;
  }
};

/**
 * Marca una activación como vista
 * @param triggerId ID de la activación
 * @returns Promise con resultado de la operación
 */
export const markTriggerAsViewed = async (
  triggerId: string
): Promise<MutationResponse<AlertTrigger>> => {
  try {
    const response = await apiClient.patch<MutationResponse<AlertTrigger>>(
      `/alerts/triggers/${triggerId}/viewed`
    );
    return response.data;
  } catch (error) {
    console.error(`[alertService] Error al marcar activación ${triggerId} como vista:`, error);
    throw error;
  }
};

/**
 * Obtiene estadísticas de alertas del usuario
 * @returns Promise con estadísticas
 */
export const getAlertStatistics = async (): Promise<ApiResponse<AlertStatistics>> => {
  try {
    const response = await apiClient.get<ApiResponse<AlertStatistics>>('/alerts/stats');
    return response.data;
  } catch (error) {
    console.error('[alertService] Error al obtener estadísticas de alertas:', error);
    throw error;
  }
};

/**
 * Verifica manualmente si se debe activar una alerta
 * @param alertId ID de la alerta a verificar
 * @returns Promise con resultado de la verificación
 */
export const checkAlert = async (alertId: string): Promise<ApiResponse<AlertCheckResult>> => {
  try {
    const response = await apiClient.post<ApiResponse<AlertCheckResult>>(
      `/alerts/${alertId}/check`
    );
    return response.data;
  } catch (error) {
    console.error(`[alertService] Error al verificar alerta ${alertId}:`, error);
    throw error;
  }
};

/**
 * Obtiene alertas activadas recientemente (últimas 24h)
 * @param limit Número de alertas a retornar (default: 10)
 * @returns Promise con array de activaciones recientes
 */
export const getRecentTriggers = async (
  limit: number = 10
): Promise<ApiResponse<AlertTrigger[]>> => {
  try {
    const response = await apiClient.get<ApiResponse<AlertTrigger[]>>('/alerts/triggers/recent', {
      params: { limit },
    });
    return response.data;
  } catch (error) {
    console.error('[alertService] Error al obtener activaciones recientes:', error);
    throw error;
  }
};

/**
 * Crea múltiples alertas en batch
 * @param alerts Array de alertas a crear
 * @returns Promise con las alertas creadas
 */
export const createBatchAlerts = async (
  alerts: CreateAlertInput[]
): Promise<MutationResponse<PriceAlert[]>> => {
  try {
    const response = await apiClient.post<MutationResponse<PriceAlert[]>>(
      '/alerts/batch',
      { alerts }
    );
    return response.data;
  } catch (error) {
    console.error('[alertService] Error al crear alertas en batch:', error);
    throw error;
  }
};

/**
 * Elimina todas las alertas de un producto
 * @param productId ID del producto
 * @returns Promise con resultado de la operación
 */
export const deleteProductAlerts = async (
  productId: string
): Promise<MutationResponse<void>> => {
  try {
    const response = await apiClient.delete<MutationResponse<void>>(
      `/alerts/product/${productId}`
    );
    return response.data;
  } catch (error) {
    console.error(`[alertService] Error al eliminar alertas del producto ${productId}:`, error);
    throw error;
  }
};

/**
 * Obtiene el número de alertas activas del usuario
 * @returns Promise con el conteo de alertas
 */
export const getActiveAlertCount = async (): Promise<ApiResponse<{ count: number }>> => {
  try {
    const response = await apiClient.get<ApiResponse<{ count: number }>>('/alerts/count');
    return response.data;
  } catch (error) {
    console.error('[alertService] Error al obtener conteo de alertas:', error);
    throw error;
  }
};

/**
 * Duplica una alerta existente
 * @param alertId ID de la alerta a duplicar
 * @param modifications Modificaciones opcionales para la nueva alerta
 * @returns Promise con la nueva alerta creada
 */
export const duplicateAlert = async (
  alertId: string,
  modifications?: Partial<CreateAlertInput>
): Promise<MutationResponse<PriceAlert>> => {
  try {
    const response = await apiClient.post<MutationResponse<PriceAlert>>(
      `/alerts/${alertId}/duplicate`,
      modifications
    );
    return response.data;
  } catch (error) {
    console.error(`[alertService] Error al duplicar alerta ${alertId}:`, error);
    throw error;
  }
};

/**
 * Servicio de alertas exportado
 */
export const alertService = {
  getUserAlerts,
  getAlertById,
  createAlert,
  updateAlert,
  deleteAlert,
  getAlertsByProduct,
  toggleAlert,
  getAlertTriggers,
  markTriggerAsViewed,
  getAlertStatistics,
  checkAlert,
  getRecentTriggers,
  createBatchAlerts,
  deleteProductAlerts,
  getActiveAlertCount,
  duplicateAlert,
};

export default alertService;
