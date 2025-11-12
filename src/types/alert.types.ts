/**
 * Alert Types
 * Tipos relacionados con alertas de precio
 */

/**
 * Tipo de alerta de precio
 */
export enum AlertType {
  /** Alerta cuando el precio baja de un valor objetivo */
  PRICE_DROP = 'price_drop',
  /** Alerta cuando el precio sube de un valor objetivo */
  PRICE_INCREASE = 'price_increase',
  /** Alerta cuando hay descuento */
  DISCOUNT = 'discount',
  /** Alerta cuando el producto está disponible */
  AVAILABILITY = 'availability',
  /** Alerta cuando el precio cambia en cualquier dirección */
  PRICE_CHANGE = 'price_change',
}

/**
 * Condición de activación de alerta
 */
export interface AlertCondition {
  /** Tipo de condición */
  type: AlertType;
  /** Precio objetivo (para PRICE_DROP o PRICE_INCREASE) */
  targetPrice?: number;
  /** Porcentaje de descuento mínimo (para DISCOUNT) */
  discountPercentage?: number;
  /** IDs de tiendas específicas (opcional) */
  storeIds?: string[];
}

/**
 * Frecuencia de verificación de alerta
 */
export enum AlertFrequency {
  /** Verificar inmediatamente cuando hay cambio */
  IMMEDIATE = 'immediate',
  /** Verificar una vez al día */
  DAILY = 'daily',
  /** Verificar una vez a la semana */
  WEEKLY = 'weekly',
}

/**
 * Alerta de precio de un usuario
 */
export interface PriceAlert {
  /** ID único de la alerta */
  id: string;
  /** ID del usuario */
  userId: string;
  /** ID del producto */
  productId: string;
  /** Nombre del producto (desnormalizado para consultas rápidas) */
  productName?: string;
  /** Imagen del producto (desnormalizado) */
  productImage?: string;
  /** Condiciones de activación */
  condition: AlertCondition;
  /** Precio objetivo (legacy, usar condition.targetPrice) */
  targetPrice?: number;
  /** Indica si la alerta está activa */
  isActive: boolean;
  /** Indica si ya fue notificada */
  notified: boolean;
  /** Frecuencia de verificación */
  frequency: AlertFrequency;
  /** Fecha de creación de la alerta */
  createdAt: Date;
  /** Fecha de última activación */
  lastTriggered?: Date;
  /** Fecha de expiración (opcional) */
  expiresAt?: Date;
  /** Notas del usuario */
  notes?: string;
}

/**
 * Activación de una alerta
 */
export interface AlertTrigger {
  /** ID único de la activación */
  id: string;
  /** ID de la alerta */
  alertId: string;
  /** ID del producto */
  productId: string;
  /** ID de la tienda donde se activó */
  storeId: string;
  /** Nombre de la tienda */
  storeName?: string;
  /** Precio que activó la alerta */
  price: number;
  /** Precio anterior */
  previousPrice?: number;
  /** Precio con descuento (si aplica) */
  discountPrice?: number;
  /** Porcentaje de descuento */
  discountPercentage?: number;
  /** Fecha y hora de activación */
  triggeredAt: Date;
  /** Indica si el usuario fue notificado */
  notificationSent: boolean;
  /** Canales de notificación usados */
  notificationChannels?: ('email' | 'push' | 'sms')[];
  /** Indica si el usuario vio la notificación */
  viewed: boolean;
}

/**
 * Estadísticas de alertas de un usuario
 */
export interface AlertStatistics {
  /** ID del usuario */
  userId: string;
  /** Total de alertas activas */
  activeAlerts: number;
  /** Total de alertas pausadas */
  pausedAlerts: number;
  /** Total de alertas activadas (histórico) */
  totalTriggered: number;
  /** Alertas activadas este mes */
  triggeredThisMonth: number;
  /** Promedio de ahorro por alerta activada */
  averageSavings?: number;
  /** Ahorro total estimado */
  totalEstimatedSavings?: number;
}

/**
 * Resumen de alerta para listados
 */
export interface AlertSummary {
  id: string;
  productId: string;
  productName: string;
  productImage?: string;
  targetPrice?: number;
  currentLowestPrice?: number;
  isActive: boolean;
  lastTriggered?: Date;
  createdAt: Date;
}

/**
 * Parámetros para crear una alerta
 */
export interface CreateAlertInput {
  productId: string;
  condition: AlertCondition;
  frequency?: AlertFrequency;
  expiresAt?: Date;
  notes?: string;
}

/**
 * Parámetros para actualizar una alerta
 */
export interface UpdateAlertInput {
  condition?: AlertCondition;
  isActive?: boolean;
  frequency?: AlertFrequency;
  expiresAt?: Date;
  notes?: string;
}

/**
 * Filtros para buscar alertas
 */
export interface AlertFilters {
  /** Filtrar por estado activo */
  isActive?: boolean;
  /** Filtrar por productos específicos */
  productIds?: string[];
  /** Filtrar por tipo de alerta */
  type?: AlertType;
  /** Incluir solo alertas no notificadas */
  notNotified?: boolean;
  /** Incluir solo alertas recién activadas */
  recentlyTriggered?: boolean;
}

/**
 * Resultado de verificación de alertas
 */
export interface AlertCheckResult {
  /** ID de la alerta verificada */
  alertId: string;
  /** Indica si se activó */
  triggered: boolean;
  /** Razón por la que se activó o no */
  reason?: string;
  /** Triggers generados */
  triggers?: AlertTrigger[];
  /** Fecha de verificación */
  checkedAt: Date;
}
