/**
 * Contribution Types
 * Tipos para el sistema de contribuciones de usuarios
 */

// Tipos de contribución disponibles
export type ContributionType = 'barcode' | 'image' | 'price' | 'info';

// Estados de una contribución
export type ContributionStatus = 'pending' | 'approved' | 'rejected';

// Datos específicos por tipo de contribución
export interface BarcodeContributionData {
  barcode: string;
}

export interface ImageContributionData {
  imageUrl: string;
}

export interface PriceContributionData {
  value: number;
  storeId: string;
  date: string; // ISO date string
}

export interface InfoContributionData {
  brand?: string;
  description?: string;
  category?: string;
  manufacturer?: string;
  weight?: string;
  volume?: string;
}

// Union type para los datos de contribución
export type ContributionData =
  | { type: 'barcode'; data: BarcodeContributionData }
  | { type: 'image'; data: ImageContributionData }
  | { type: 'price'; data: PriceContributionData }
  | { type: 'info'; data: InfoContributionData };

// Interface principal de una contribución
export interface ProductContribution {
  id: string;
  productId: string;
  contributorId: string;
  contributionType: ContributionType;
  data: BarcodeContributionData | ImageContributionData | PriceContributionData | InfoContributionData;
  status: ContributionStatus;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  rejectionReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

// DTO para crear una nueva contribución
export interface CreateContributionDTO {
  productId: string;
  contributionType: ContributionType;
  data: BarcodeContributionData | ImageContributionData | PriceContributionData | InfoContributionData;
}

// DTO para actualizar una contribución (solo para pendientes)
export interface UpdateContributionDTO {
  data?: BarcodeContributionData | ImageContributionData | PriceContributionData | InfoContributionData;
}

// Estadísticas de contribuciones de un usuario
export interface UserContributionStats {
  totalContributions: number;
  pendingContributions: number;
  approvedContributions: number;
  rejectedContributions: number;
  approvalRate: number; // Porcentaje 0-100
}

// Contribución reciente con info del producto
export interface RecentContribution {
  id: string;
  productId: string;
  productName: string;
  contributionType: ContributionType;
  status: ContributionStatus;
  createdAt: string;
  reviewedAt?: string | null;
}

// Helpers para validación
export const isValidBarcode = (barcode: string): boolean => {
  // Validar que sea un código de barras válido (EAN-13, UPC, etc.)
  const barcodeRegex = /^\d{8,14}$/;
  return barcodeRegex.test(barcode);
};

export const isValidImageUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

export const isValidPrice = (price: number): boolean => {
  return typeof price === 'number' && price > 0 && price < 1000000;
};

// Helper para obtener el label de un tipo de contribución
export const getContributionTypeLabel = (type: ContributionType): string => {
  const labels: Record<ContributionType, string> = {
    barcode: 'Código de Barras',
    image: 'Imagen',
    price: 'Precio',
    info: 'Información',
  };
  return labels[type];
};

// Helper para obtener el label de un estado
export const getContributionStatusLabel = (status: ContributionStatus): string => {
  const labels: Record<ContributionStatus, string> = {
    pending: 'Pendiente',
    approved: 'Aprobada',
    rejected: 'Rechazada',
  };
  return labels[status];
};

// Helper para obtener el color de un estado
export const getContributionStatusColor = (status: ContributionStatus): string => {
  const colors: Record<ContributionStatus, string> = {
    pending: '#FF9800', // warning
    approved: '#4CAF50', // success
    rejected: '#F44336', // error
  };
  return colors[status];
};
