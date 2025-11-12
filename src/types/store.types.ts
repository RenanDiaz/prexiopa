/**
 * Store Types
 * Tipos relacionados con tiendas y supermercados en Panamá
 */

/**
 * Cadenas de supermercados y tiendas en Panamá
 */
export enum StoreChain {
  REY = 'rey',
  ROMERO = 'romero',
  SUPER99 = 'super99',
  MACHETAZO = 'machetazo',
  EL_MACHETAZO = 'el_machetazo',
  RIBA_SMITH = 'riba_smith',
  XTRA = 'xtra',
  FELIPE_MOTTA = 'felipe_motta',
  SUPER_KOSHER = 'super_kosher',
  COCHEZ = 'cochez',
  EL_FUERTE = 'el_fuerte',
  PRECIO_INTELIGENTE = 'precio_inteligente',
  MINI_SUPER = 'mini_super',
  OTROS = 'otros',
}

/**
 * Coordenadas geográficas
 */
export interface Coordinates {
  /** Latitud */
  latitude: number;
  /** Longitud */
  longitude: number;
}

/**
 * Horario de operación de una tienda
 */
export interface StoreHours {
  /** Día de la semana (0=Domingo, 6=Sábado) */
  dayOfWeek: number;
  /** Hora de apertura (formato 24h, ej: '08:00') */
  openTime: string;
  /** Hora de cierre (formato 24h, ej: '22:00') */
  closeTime: string;
  /** Indica si está cerrado ese día */
  isClosed: boolean;
}

/**
 * Ubicación física de una tienda
 */
export interface StoreLocation {
  /** ID único de la ubicación */
  id: string;
  /** ID de la tienda padre */
  storeId: string;
  /** Nombre de la sucursal (ej: 'Super99 Albrook') */
  branchName?: string;
  /** Dirección completa */
  address: string;
  /** Provincia */
  province: string;
  /** Distrito */
  district?: string;
  /** Corregimiento */
  corregimiento?: string;
  /** Coordenadas GPS */
  coordinates?: Coordinates;
  /** Horarios de operación */
  hours?: StoreHours[];
  /** Teléfono de la sucursal */
  phone?: string;
  /** Indica si está actualmente operativa */
  isActive: boolean;
  /** Servicios disponibles (ej: ['delivery', 'parking', 'pharmacy']) */
  services?: string[];
}

/**
 * Información completa de una tienda/supermercado
 */
export interface Store {
  /** ID único de la tienda */
  id: string;
  /** Nombre de la tienda */
  name: string;
  /** Descripción de la tienda */
  description?: string;
  /** URL del logo */
  logo?: string;
  /** Cadena a la que pertenece */
  chain: StoreChain;
  /** Ubicaciones/sucursales de la tienda */
  locations: StoreLocation[];
  /** Sitio web oficial */
  website?: string;
  /** Teléfono principal */
  phone?: string;
  /** Email de contacto */
  email?: string;
  /** Color de marca (hex) */
  brandColor?: string;
  /** Indica si tiene delivery */
  hasDelivery?: boolean;
  /** Indica si tiene app móvil */
  hasMobileApp?: boolean;
  /** Fecha de creación del registro */
  createdAt: Date;
  /** Fecha de última actualización */
  updatedAt: Date;
}

/**
 * Versión simplificada de tienda para listados
 */
export interface StoreSummary {
  id: string;
  name: string;
  logo?: string;
  chain: StoreChain;
  /** Número de ubicaciones */
  locationCount?: number;
}

/**
 * Parámetros para crear una nueva tienda
 */
export type CreateStoreInput = Omit<Store, 'id' | 'createdAt' | 'updatedAt' | 'locations'>;

/**
 * Parámetros para actualizar una tienda
 */
export type UpdateStoreInput = Partial<Omit<Store, 'id' | 'createdAt' | 'updatedAt' | 'locations'>>;

/**
 * Parámetros para crear una ubicación
 */
export type CreateStoreLocationInput = Omit<StoreLocation, 'id'>;

/**
 * Parámetros para actualizar una ubicación
 */
export type UpdateStoreLocationInput = Partial<Omit<StoreLocation, 'id' | 'storeId'>>;
