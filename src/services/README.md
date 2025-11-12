# Prexiopá API Services

Documentación completa de los servicios de API para Prexiopá.

## Estructura de Servicios

```
src/services/
├── api.ts                 # Configuración base de Axios con interceptores
├── authService.ts         # Autenticación y gestión de usuarios
├── productService.ts      # Productos y búsqueda
├── priceService.ts        # Precios, historial y comparaciones
├── storeService.ts        # Tiendas y ubicaciones
├── alertService.ts        # Alertas de precio
├── favoriteService.ts     # Productos favoritos
└── index.ts              # Barrel export de todos los servicios
```

## Configuración

### Variables de Entorno

Copia `.env.example` a `.env` y configura:

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_API_TIMEOUT=10000
VITE_ENABLE_MOCK_API=true
```

### Inicialización

Los servicios están listos para usar sin configuración adicional:

```typescript
import { productService, authService } from '@/services';

// O importar funciones individuales
import { login, getAllProducts } from '@/services';
```

## API Client (`api.ts`)

### Características

- **Interceptores de Request**: Agrega automáticamente el token de autenticación
- **Interceptores de Response**: Manejo centralizado de errores
- **Refresh Token Automático**: Renueva tokens expirados sin perder la request
- **Rate Limiting**: Manejo de límites de tasa del servidor
- **Logging**: Logs de desarrollo para debugging
- **Timeout**: Timeout configurable por request

### Uso del Cliente Base

```typescript
import apiClient from '@/services/api';

// Request simple
const response = await apiClient.get('/custom-endpoint');

// Request con configuración
const response = await apiClient.post('/endpoint', data, {
  timeout: 5000,
  headers: { 'X-Custom-Header': 'value' }
});
```

### Gestión de Tokens

```typescript
import { api } from '@/services';

// Establecer token manualmente
api.setAuthToken('your-token');

// Obtener token actual
const token = api.getAuthToken();

// Remover token
api.removeAuthToken();
```

## Auth Service (`authService.ts`)

Gestión de autenticación y sesiones de usuario.

### Login

```typescript
import { login } from '@/services';

try {
  const response = await login({
    email: 'usuario@ejemplo.com',
    password: 'password123',
    rememberMe: true
  });

  if (response.success) {
    const { user, accessToken, expiresIn } = response.data;
    // Tokens se guardan automáticamente
  }
} catch (error) {
  console.error('Error de login:', error);
}
```

### Registro

```typescript
import { register } from '@/services';

const response = await register({
  email: 'nuevo@ejemplo.com',
  password: 'password123',
  name: 'Juan Pérez',
  username: 'juanp',
  acceptTerms: true
});
```

### Usuario Actual

```typescript
import { getCurrentUser, updateProfile } from '@/services';

// Obtener usuario
const { data: user } = await getCurrentUser();

// Actualizar perfil
await updateProfile({
  name: 'Nuevo Nombre',
  avatar: 'https://...'
});
```

### Recuperación de Contraseña

```typescript
import { forgotPassword, resetPassword } from '@/services';

// Solicitar reset
await forgotPassword({ email: 'usuario@ejemplo.com' });

// Resetear con token
await resetPassword({
  token: 'reset-token',
  newPassword: 'nueva-password',
  confirmPassword: 'nueva-password'
});
```

## Product Service (`productService.ts`)

Gestión de productos y búsqueda.

### Obtener Productos

```typescript
import { getAllProducts, getProductById } from '@/services';

// Listar con paginación
const products = await getAllProducts({
  page: 1,
  limit: 20,
  category: 'alimentos',
  sort: 'name:asc'
});

// Producto específico
const { data: product } = await getProductById('product-id');
```

### Búsqueda

```typescript
import { searchProducts, getProductByBarcode } from '@/services';

// Búsqueda por texto
const results = await searchProducts({
  query: 'arroz',
  category: 'alimentos',
  page: 1,
  limit: 20
});

// Búsqueda por código de barras
const { data: product } = await getProductByBarcode('7501234567890');
```

### Productos Populares y Nuevos

```typescript
import { getMostPopular, getNewProducts } from '@/services';

// Top 10 más populares
const { data: popular } = await getMostPopular(10);

// Últimos 10 agregados
const { data: newItems } = await getNewProducts(10);
```

## Price Service (`priceService.ts`)

Gestión de precios, historial y comparaciones.

### Precios de Producto

```typescript
import { getProductPrices, getPriceComparison } from '@/services';

// Precios en todas las tiendas
const { data: prices } = await getProductPrices('product-id');

// Comparación de precios
const { data: comparison } = await getPriceComparison('product-id');
```

### Historial de Precios

```typescript
import { getPriceHistory } from '@/services';

const { data: history } = await getPriceHistory({
  productId: 'product-id',
  storeId: 'store-id', // opcional
  period: '30d' // '7d', '30d', '90d', '180d', '365d', 'all'
});

// history contiene:
// - prices: Array de puntos históricos
// - minPrice, maxPrice, averagePrice
// - currentPrice
```

### Mejores Ofertas

```typescript
import { getBestPrices, getTopDiscounts } from '@/services';

// Mejores precios del día
const { data: deals } = await getBestPrices(20);

// Mayores descuentos
const { data: discounts } = await getTopDiscounts(20);
```

## Store Service (`storeService.ts`)

Gestión de tiendas y ubicaciones.

### Obtener Tiendas

```typescript
import { getAllStores, getStoreById } from '@/services';

// Listar tiendas
const stores = await getAllStores({ page: 1, limit: 20 });

// Tienda específica
const { data: store } = await getStoreById('store-id');
```

### Tiendas Cercanas

```typescript
import { getNearbyStores } from '@/services';

const { data: nearby } = await getNearbyStores({
  latitude: 9.0192,
  longitude: -79.5343,
  radius: 5, // kilómetros
  limit: 10
});
```

### Productos de Tienda

```typescript
import { getStoreProducts, getStoreDeals } from '@/services';

// Todos los productos
const products = await getStoreProducts('store-id', {
  category: 'alimentos',
  page: 1,
  limit: 20
});

// Solo ofertas
const deals = await getStoreDeals('store-id');
```

## Alert Service (`alertService.ts`)

Gestión de alertas de precio.

### Crear Alerta

```typescript
import { createAlert } from '@/services';

const { data: alert } = await createAlert({
  productId: 'product-id',
  condition: {
    type: 'price_drop',
    targetPrice: 5.99,
    storeIds: ['store-1', 'store-2'] // opcional
  },
  frequency: 'immediate',
  expiresAt: new Date('2024-12-31')
});
```

### Gestionar Alertas

```typescript
import {
  getUserAlerts,
  updateAlert,
  toggleAlert,
  deleteAlert
} from '@/services';

// Listar alertas
const alerts = await getUserAlerts({ isActive: true });

// Actualizar
await updateAlert('alert-id', {
  condition: { targetPrice: 4.99 }
});

// Pausar/activar
await toggleAlert('alert-id', false);

// Eliminar
await deleteAlert('alert-id');
```

### Historial de Activaciones

```typescript
import { getAlertTriggers, markTriggerAsViewed } from '@/services';

// Ver activaciones
const triggers = await getAlertTriggers('alert-id');

// Marcar como vista
await markTriggerAsViewed('trigger-id');
```

## Favorite Service (`favoriteService.ts`)

Gestión de productos favoritos.

### Agregar/Remover Favoritos

```typescript
import { addFavorite, removeFavorite, toggleFavorite } from '@/services';

// Agregar
await addFavorite('product-id');

// Remover
await removeFavorite('product-id');

// Toggle (agregar si no existe, remover si existe)
const { data } = await toggleFavorite('product-id');
console.log(data.isFavorite); // nuevo estado
```

### Listar Favoritos

```typescript
import { getUserFavorites, getFavoritesOnSale } from '@/services';

// Todos los favoritos
const favorites = await getUserFavorites({
  page: 1,
  limit: 20,
  sortBy: 'addedAt'
});

// Solo favoritos en oferta
const onSale = await getFavoritesOnSale();
```

### Sincronización

```typescript
import { syncFavorites, getFavoriteIds } from '@/services';

// Obtener solo IDs (rápido)
const { data: ids } = await getFavoriteIds();

// Sincronizar con favoritos locales
const { data: result } = await syncFavorites(['id1', 'id2', 'id3']);
// result contiene: synced, failed, removed, total
```

### Operaciones en Batch

```typescript
import { addBatchFavorites, removeBatchFavorites } from '@/services';

// Agregar múltiples
await addBatchFavorites(['id1', 'id2', 'id3']);

// Remover múltiples
await removeBatchFavorites(['id1', 'id2']);
```

## Manejo de Errores

Todos los servicios lanzan errores con la estructura `ApiError`:

```typescript
import { ApiErrorCode } from '@/types/api.types';

try {
  await someService();
} catch (error: any) {
  // Error tiene la estructura ApiError
  console.error('Error code:', error.code);
  console.error('Message:', error.message);
  console.error('Details:', error.details);

  // Manejar errores específicos
  if (error.code === ApiErrorCode.UNAUTHORIZED) {
    // Redirigir a login
  } else if (error.code === ApiErrorCode.VALIDATION_ERROR) {
    // Mostrar errores de validación
  }
}
```

## Respuestas de API

### ApiResponse

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
  meta?: Record<string, any>;
}
```

### PaginatedResponse

```typescript
interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}
```

### MutationResponse

```typescript
interface MutationResponse<T> extends ApiResponse<T> {
  id?: string;
  created?: boolean;
  updated?: boolean;
  deleted?: boolean;
}
```

## Testing

### Ejemplo de Test con Mock

```typescript
import { vi } from 'vitest';
import { productService } from '@/services';

// Mock del servicio
vi.mock('@/services', () => ({
  productService: {
    getAllProducts: vi.fn().mockResolvedValue({
      success: true,
      data: [/* mock data */],
      pagination: {
        page: 1,
        pageSize: 20,
        total: 100,
        totalPages: 5,
        hasPreviousPage: false,
        hasNextPage: true
      }
    })
  }
}));

// Test
it('should fetch products', async () => {
  const result = await productService.getAllProducts();
  expect(result.success).toBe(true);
  expect(result.data).toHaveLength(3);
});
```

## Best Practices

1. **Siempre manejar errores**: Usa try-catch en todas las llamadas
2. **Mostrar feedback**: Usa toast/notificaciones para operaciones exitosas y fallidas
3. **Loading states**: Implementa estados de carga en tu UI
4. **Cache inteligente**: Usa React Query o SWR para cache automático
5. **Retry logic**: Implementa reintentos para requests fallidos
6. **Optimistic updates**: Actualiza la UI antes de que responda el servidor
7. **TypeScript**: Aprovecha los tipos para autocompletado y validación

## Próximos Pasos

- Implementar servicio de notificaciones
- Agregar servicio de reportes y analytics
- Crear hooks personalizados para cada servicio
- Implementar cache con React Query
- Agregar tests unitarios y de integración
