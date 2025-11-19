# Datos Mock de Prexiopá

Este directorio contiene datos mock realistas para el desarrollo y testing de Prexiopá.

## Archivos

### `mockStores.ts`
Contiene 10 tiendas reales de Panamá con:
- **Tiendas**: Super99, Rey, Romero, Machetazo, Riba Smith, Xtra, El Machetazo, Felipe Motta, PriceSmart, El Fuerte
- **Ubicaciones**: 2-3 sucursales por tienda con coordenadas GPS reales de Ciudad de Panamá
- **Servicios**: delivery, parking, pharmacy, bakery, etc.
- **Horarios**: horarios de operación por día

### `mockProducts.ts`
Contiene 50 productos variados en diferentes categorías:
- **Alimentos**: arroz, frijoles, lentejas, aceites, sal
- **Lácteos**: leche, queso, mantequilla
- **Panadería**: pan blanco, pan integral
- **Bebidas**: Coca-Cola, Pepsi, agua, jugos, cervezas panameñas (Atlas, Balboa)
- **Limpieza**: detergentes, cloro, lavavajillas, papel higiénico, toallas
- **Cuidado Personal**: shampoo, jabón, pasta dental, desodorante
- **Snacks**: papas, galletas, maní
- **Carnes**: pollo, carne molida, salchichas
- **Frutas y Verduras**: plátanos, tomates, lechuga
- **Hogar**: bombillas LED, pilas
- **Mascotas**: alimento para perros y gatos
- **Bebés**: pañales, fórmula infantil
- **Farmacia**: paracetamol, vitamina C
- **Electrónica**: cargadores, auriculares

Cada producto incluye:
- Información completa (nombre, marca, categoría, descripción)
- Código de barras (13 dígitos)
- Imágenes placeholder
- Unidades de medida
- Tags para búsqueda

### `mockPrices.ts`
Contiene precios actuales de los productos en diferentes tiendas:
- **Variación realista**: 5-30% de diferencia entre tiendas
- **Descuentos**: algunos productos tienen `discountPrice`
- **Disponibilidad**: todos marcados como disponibles
- **Fechas**: registrados al 2025-01-18
- **Fuentes**: web_scraping, manual, api

### `mockPriceHistory.ts`
Historial de precios de los últimos 30 días para 10 productos populares:
- **Productos**: arroz, leche, Coca-Cola, detergente, pan, aceite, papel higiénico, pollo, agua, queso
- **Variación temporal**: precios que suben y bajan de forma realista
- **Descuentos ocasionales**: 10% de probabilidad por día
- **Estadísticas**: min, max, average, current calculados automáticamente
- **Ideal para gráficos**: datos listos para visualizar con recharts

### `index.ts`
Barrel export y funciones helper:

#### Funciones de Productos
- `getProductById(id)` - Obtener producto por ID
- `getProductsByCategory(category)` - Filtrar por categoría
- `searchProducts(query)` - Buscar en nombre, marca, descripción, tags
- `getProductsOnSale()` - Productos con descuento activo
- `getTopDeals(limit)` - Mejores ofertas del momento
- `getPopularProducts(limit)` - Productos más populares

#### Funciones de Tiendas
- `getStoreById(id)` - Obtener tienda por ID
- `getAllStores()` - Todas las tiendas
- `getStoresByProvince(province)` - Filtrar por provincia

#### Funciones de Precios
- `getProductPrices(productId)` - Precios de un producto en todas las tiendas
- `getBestPrice(productId)` - Precio más bajo para un producto
- `getPriceComparison(productId)` - Comparación detallada entre tiendas
- `getPricesByStore(storeId)` - Todos los precios de una tienda
- `getAveragePrice(productId)` - Precio promedio de un producto

#### Funciones de Historial
- `getPriceHistory(productId, storeId)` - Historial de un producto en una tienda
- `getAllPriceHistories(productId)` - Todos los historiales de un producto
- `isLowestPriceEver(productId, storeId)` - Verificar si es el precio más bajo histórico
- `getPriceTrend(productId, storeId)` - Tendencia (rising, falling, stable)

#### Funciones de Estadísticas
- `getPlatformStats()` - Estadísticas generales
- `getCategoriesWithCount()` - Categorías con número de productos

## Uso

```typescript
import {
  // Datos
  mockProducts,
  mockStores,
  mockPrices,
  mockPriceHistory,

  // Funciones helper
  getProductById,
  searchProducts,
  getProductsOnSale,
  getBestPrice,
  getPriceComparison,
  getPriceHistory,
  getPriceTrend,
} from './data';

// Buscar productos
const results = searchProducts('arroz');

// Obtener productos en oferta
const onSale = getProductsOnSale();

// Comparar precios
const comparison = getPriceComparison('prod-001');

// Obtener historial
const history = getPriceHistory('prod-001', 'store-super99');

// Verificar tendencia
const trend = getPriceTrend('prod-001', 'store-super99'); // 'rising' | 'falling' | 'stable'
```

## Características de los Datos

### Realismo
- **Tiendas reales** de Panamá con ubicaciones reales
- **Productos comunes** en supermercados panameños
- **Precios en USD/PAB** con rangos realistas
- **Variación de precios** entre tiendas (más baratos en Machetazo, más caros en Riba Smith)
- **Marcas disponibles** en Panamá

### Consistencia
- **IDs únicos** en todos los registros
- **Referencias correctas** entre productos, tiendas y precios
- **Códigos de barra válidos** (13 dígitos)
- **Fechas realistas** (2025-01-18)
- **Unidades de medida** consistentes

### Completitud
- **50 productos** en 15 categorías
- **10 tiendas** con 2-3 ubicaciones cada una
- **300+ precios** actuales
- **30 historiales** de 30 días cada uno
- **Funciones helper** para acceso fácil

## Próximos Pasos

Estos datos están listos para ser usados en:
1. **Componentes UI** - CardProducto, CardTienda, etc.
2. **Páginas** - Dashboard, Producto, Tienda
3. **Gráficos** - Historial de precios con recharts
4. **Búsqueda** - Sistema de filtros y búsqueda
5. **Testing** - Unit tests y integration tests

Cuando esté listo el backend real, simplemente reemplaza las importaciones de `/data` por las llamadas a la API con axios.
