/**
 * Central export file for all TypeScript types in Prexiopá
 *
 * This barrel file exports all types, interfaces, and enums from the application.
 * Import types using: import { Product, Store, User } from '@/types'
 */

// Product Types
export type {
  Product,
  ProductImage,
  ProductSummary,
  ProductWithPrice,
  CreateProductInput,
  UpdateProductInput,
} from './product.types';

export { ProductCategory } from './product.types';

// Store Types
export type {
  Store,
  StoreLocation,
  StoreHours,
  Coordinates,
  StoreSummary,
  CreateStoreInput,
  UpdateStoreInput,
  CreateStoreLocationInput,
  UpdateStoreLocationInput,
} from './store.types';

export { StoreChain } from './store.types';

// Price Types
export type {
  Price,
  PriceHistory,
  PriceHistoryPoint,
  PriceComparison,
  StorePriceComparison,
  PriceStatistics,
  CreatePriceInput,
  PriceHistoryQuery,
} from './price.types';

export { Currency, PriceUnit, HistoryPeriod } from './price.types';

// User Types
export type {
  User,
  UserProfile,
  UserPreferences,
  UserLocation,
  NotificationPreferences,
  LoginCredentials,
  RegisterInput,
  AuthResponse,
  AuthState,
  UpdateUserProfileInput,
  UpdateUserPreferencesInput,
  ChangePasswordInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from './user.types';

export { UserRole } from './user.types';

// Alert Types
export type {
  PriceAlert,
  AlertTrigger,
  AlertCondition,
  AlertStatistics,
  AlertSummary,
  CreateAlertInput,
  UpdateAlertInput,
  AlertFilters,
  AlertCheckResult,
} from './alert.types';

export { AlertType, AlertFrequency } from './alert.types';

// Search Types
export type {
  SearchQuery,
  SearchFilters,
  SearchResult,
  SearchResultItem,
  SearchResultWithFacets,
  SearchFacets,
  AutocompleteSuggestion,
  SearchHistory,
  SavedSearch,
  PriceRange,
  PaginationParams,
  QuickSearchParams,
} from './search.types';

export { SortOption } from './search.types';

// Notification Types
export type {
  Notification,
  NotificationData,
  NotificationAction,
  NotificationSettings,
  NotificationTypeSettings,
  NotificationChannelPreferences,
  NotificationGroup,
  NotificationStatistics,
  CreateNotificationInput,
  PushNotificationPayload,
  NotificationFilters,
  MarkAsReadResult,
} from './notification.types';

export { NotificationType, NotificationPriority } from './notification.types';

// API Types
export type {
  ApiResponse,
  ApiError,
  ApiErrorDetails,
  PaginatedResponse,
  PaginationMeta,
  QueryParams,
  ApiHeaders,
  ApiRequestConfig,
  RateLimitInfo,
  ApiResponseWithRateLimit,
  WebhookPayload,
  HealthCheckResponse,
  BatchRequest,
  BatchResponse,
  MutationResponse,
  FieldValidation,
  ValidationResponse,
} from './api.types';

export { ApiErrorCode } from './api.types';

// Re-export PaginationParams from search for convenience
// Note: This is aliased to avoid conflicts with the one in api.types
export type { PaginationParams as SearchPaginationParams } from './search.types';
