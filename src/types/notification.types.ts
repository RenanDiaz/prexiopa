/**
 * Notification Types
 * Tipos relacionados con notificaciones del sistema
 */

/**
 * Tipos de notificación
 */
export enum NotificationType {
  /** Alerta de precio activada */
  PRICE_ALERT = 'price_alert',
  /** Caída de precio */
  PRICE_DROP = 'price_drop',
  /** Nuevo producto agregado */
  NEW_PRODUCT = 'new_product',
  /** Oferta especial */
  SPECIAL_OFFER = 'special_offer',
  /** Producto favorito actualizado */
  FAVORITE_UPDATED = 'favorite_updated',
  /** Notificación del sistema */
  SYSTEM = 'system',
  /** Actualización de cuenta */
  ACCOUNT = 'account',
  /** Nuevo comentario o review */
  COMMENT = 'comment',
  /** Resumen semanal */
  WEEKLY_DIGEST = 'weekly_digest',
}

/**
 * Prioridad de la notificación
 */
export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

/**
 * Acción asociada a una notificación
 */
export interface NotificationAction {
  /** Etiqueta del botón de acción */
  label: string;
  /** URL de destino */
  url: string;
  /** Indica si abre en nueva pestaña */
  openInNewTab?: boolean;
  /** Indica si es la acción primaria */
  isPrimary?: boolean;
}

/**
 * Datos específicos según el tipo de notificación
 */
export interface NotificationData {
  /** ID del producto relacionado */
  productId?: string;
  /** Nombre del producto */
  productName?: string;
  /** Imagen del producto */
  productImage?: string;
  /** ID de la tienda relacionada */
  storeId?: string;
  /** Nombre de la tienda */
  storeName?: string;
  /** Precio actual */
  currentPrice?: number;
  /** Precio anterior */
  previousPrice?: number;
  /** Porcentaje de descuento */
  discountPercentage?: number;
  /** ID de alerta relacionada */
  alertId?: string;
  /** URL de destino */
  targetUrl?: string;
  /** Datos adicionales en JSON */
  metadata?: Record<string, any>;
}

/**
 * Notificación del sistema
 */
export interface Notification {
  /** ID único de la notificación */
  id: string;
  /** ID del usuario destinatario */
  userId: string;
  /** Tipo de notificación */
  type: NotificationType;
  /** Prioridad */
  priority: NotificationPriority;
  /** Título de la notificación */
  title: string;
  /** Mensaje/cuerpo de la notificación */
  message: string;
  /** Datos adicionales de la notificación */
  data?: NotificationData;
  /** Acciones disponibles */
  actions?: NotificationAction[];
  /** Indica si fue leída */
  read: boolean;
  /** Indica si fue archivada */
  archived: boolean;
  /** Fecha de lectura */
  readAt?: Date;
  /** Fecha de creación */
  createdAt: Date;
  /** Fecha de expiración (opcional) */
  expiresAt?: Date;
  /** Icono personalizado */
  icon?: string;
  /** Color de acento (hex) */
  accentColor?: string;
}

/**
 * Preferencias de canal de notificación
 */
export interface NotificationChannelPreferences {
  /** Email habilitado */
  email: boolean;
  /** Push habilitado */
  push: boolean;
  /** SMS habilitado */
  sms: boolean;
  /** In-app habilitado */
  inApp: boolean;
}

/**
 * Configuración de notificaciones por tipo
 */
export interface NotificationTypeSettings {
  /** Tipo de notificación */
  type: NotificationType;
  /** Habilitado globalmente */
  enabled: boolean;
  /** Preferencias por canal */
  channels: NotificationChannelPreferences;
}

/**
 * Configuración completa de notificaciones del usuario
 */
export interface NotificationSettings {
  /** ID del usuario */
  userId: string;
  /** Notificaciones habilitadas globalmente */
  enabled: boolean;
  /** Configuración por tipo de notificación */
  typeSettings: NotificationTypeSettings[];
  /** No molestar (horario) */
  doNotDisturb?: {
    enabled: boolean;
    startTime: string; // formato HH:mm
    endTime: string;
  };
  /** Frecuencia de resumen (si aplica) */
  digestFrequency?: 'daily' | 'weekly' | 'never';
  /** Día preferido para resumen semanal (0=Domingo) */
  digestDayOfWeek?: number;
  /** Última actualización */
  updatedAt: Date;
}

/**
 * Notificación agrupada
 */
export interface NotificationGroup {
  /** Tipo de notificación */
  type: NotificationType;
  /** Cantidad de notificaciones en el grupo */
  count: number;
  /** Última notificación del grupo */
  latest: Notification;
  /** Todas las notificaciones del grupo */
  notifications: Notification[];
  /** Indica si todas fueron leídas */
  allRead: boolean;
}

/**
 * Estadísticas de notificaciones
 */
export interface NotificationStatistics {
  /** ID del usuario */
  userId: string;
  /** Total de notificaciones */
  total: number;
  /** Notificaciones no leídas */
  unread: number;
  /** Notificaciones por tipo */
  byType: Record<NotificationType, number>;
  /** Notificaciones de hoy */
  today: number;
  /** Notificaciones de esta semana */
  thisWeek: number;
}

/**
 * Parámetros para crear notificación
 */
export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  priority?: NotificationPriority;
  title: string;
  message: string;
  data?: NotificationData;
  actions?: NotificationAction[];
  expiresAt?: Date;
  icon?: string;
  accentColor?: string;
}

/**
 * Parámetros para enviar notificación push
 */
export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  data?: Record<string, any>;
  tag?: string;
  requireInteraction?: boolean;
}

/**
 * Filtros para consultar notificaciones
 */
export interface NotificationFilters {
  /** Filtrar por tipos */
  types?: NotificationType[];
  /** Solo no leídas */
  unreadOnly?: boolean;
  /** Solo no archivadas */
  notArchived?: boolean;
  /** Desde fecha */
  since?: Date;
  /** Hasta fecha */
  until?: Date;
  /** Prioridad mínima */
  minPriority?: NotificationPriority;
}

/**
 * Resultado de marcar como leído
 */
export interface MarkAsReadResult {
  /** IDs marcados */
  notificationIds: string[];
  /** Cantidad actualizada */
  count: number;
  /** Nuevas notificaciones no leídas */
  remainingUnread: number;
}
