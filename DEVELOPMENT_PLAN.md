# Plan de Desarrollo - Prexiopá

> Web app para buscar, comparar y seguir precios de productos en tiendas de Panamá

---

## Checklist de Progreso General

```
Progreso Total: 15% ████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░

✅ Fase 0: Configuración Inicial (100%)
⏳ Fase 1: Fundación y Arquitectura (0%)
⏳ Fase 2: Esqueleto y Navegación (0%)
⏳ Fase 3: Features Core (0%)
⏳ Fase 4: Features Avanzados (0%)
⏳ Fase 5: Pulido y Optimización (0%)
```

---

## Estado Actual del Proyecto

**Ya Configurado:**
- ✅ Vite + React + TypeScript
- ✅ Supabase Client configurado
- ✅ Auth básico implementado (login/registro)
- ✅ Git inicializado
- ✅ ESLint configurado

**Estructura Actual:**
```
prexiopa/
├── src/
│   ├── App.tsx (demo de auth)
│   ├── App.css
│   ├── main.tsx
│   ├── index.css
│   ├── supabaseClient.ts
│   └── assets/
├── public/
├── .github/
└── package.json (solo React + Supabase)
```

---

## 📦 Dependencias a Instalar

### Instalación por Fase

**Fase 1 - Fundación:**
```bash
npm install react-router-dom styled-components
npm install -D @types/styled-components
npm install zustand react-icons
```

**Fase 2 - Esqueleto:**
```bash
npm install axios
npm install react-toastify
```

**Fase 3 - Features Core:**
```bash
npm install @tanstack/react-query
npm install recharts
npm install -D @types/recharts
```

**Fase 4 - Features Avanzados:**
```bash
npm install date-fns
npm install react-responsive
```

### Resumen de Dependencias

| Dependencia | Versión | Propósito |
|------------|---------|-----------|
| react-router-dom | ^6.x | Navegación y rutas |
| styled-components | ^6.x | Estilos componetizados |
| zustand | ^5.x | Estado global (alternativa a Redux) |
| react-icons | ^5.x | Iconos |
| axios | ^1.x | Llamadas HTTP |
| react-toastify | ^10.x | Notificaciones toast |
| @tanstack/react-query | ^5.x | Cache y manejo de datos |
| recharts | ^2.x | Gráficos de precios |
| date-fns | ^3.x | Manipulación de fechas |
| react-responsive | ^10.x | Media queries en componentes |

---

## 🗂️ Estructura de Carpetas Completa

```
prexiopa/
├── public/
│   ├── favicon.ico
│   └── logo.png
├── src/
│   ├── assets/
│   │   ├── images/
│   │   │   ├── logo.svg
│   │   │   ├── empty-state.svg
│   │   │   └── stores/
│   │   │       ├── super99.png
│   │   │       ├── riba-smith.png
│   │   │       └── el-machetazo.png
│   │   └── icons/
│   │       └── (react-icons principalmente)
│   │
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button/
│   │   │   │   ├── Button.tsx
│   │   │   │   └── Button.styles.ts
│   │   │   ├── Input/
│   │   │   │   ├── Input.tsx
│   │   │   │   └── Input.styles.ts
│   │   │   ├── Modal/
│   │   │   │   ├── Modal.tsx
│   │   │   │   └── Modal.styles.ts
│   │   │   ├── Loader/
│   │   │   │   ├── Loader.tsx
│   │   │   │   └── Loader.styles.ts
│   │   │   └── Badge/
│   │   │       ├── Badge.tsx
│   │   │       └── Badge.styles.ts
│   │   │
│   │   ├── layout/
│   │   │   ├── Navbar/
│   │   │   │   ├── Navbar.tsx
│   │   │   │   └── Navbar.styles.ts
│   │   │   ├── Footer/
│   │   │   │   ├── Footer.tsx
│   │   │   │   └── Footer.styles.ts
│   │   │   └── Sidebar/
│   │   │       ├── Sidebar.tsx
│   │   │       └── Sidebar.styles.ts
│   │   │
│   │   ├── product/
│   │   │   ├── ProductCard/
│   │   │   │   ├── ProductCard.tsx
│   │   │   │   └── ProductCard.styles.ts
│   │   │   ├── ProductList/
│   │   │   │   ├── ProductList.tsx
│   │   │   │   └── ProductList.styles.ts
│   │   │   ├── ProductDetail/
│   │   │   │   ├── ProductDetail.tsx
│   │   │   │   └── ProductDetail.styles.ts
│   │   │   ├── PriceComparison/
│   │   │   │   ├── PriceComparison.tsx
│   │   │   │   └── PriceComparison.styles.ts
│   │   │   └── PriceHistoryChart/
│   │   │       ├── PriceHistoryChart.tsx
│   │   │       └── PriceHistoryChart.styles.ts
│   │   │
│   │   ├── store/
│   │   │   ├── StoreCard/
│   │   │   │   ├── StoreCard.tsx
│   │   │   │   └── StoreCard.styles.ts
│   │   │   └── StoreList/
│   │   │       ├── StoreList.tsx
│   │   │       └── StoreList.styles.ts
│   │   │
│   │   ├── search/
│   │   │   ├── SearchBar/
│   │   │   │   ├── SearchBar.tsx
│   │   │   │   └── SearchBar.styles.ts
│   │   │   ├── SearchFilters/
│   │   │   │   ├── SearchFilters.tsx
│   │   │   │   └── SearchFilters.styles.ts
│   │   │   └── SearchAutocomplete/
│   │   │       ├── SearchAutocomplete.tsx
│   │   │       └── SearchAutocomplete.styles.ts
│   │   │
│   │   ├── favorites/
│   │   │   ├── FavoriteButton/
│   │   │   │   ├── FavoriteButton.tsx
│   │   │   │   └── FavoriteButton.styles.ts
│   │   │   └── FavoritesList/
│   │   │       ├── FavoritesList.tsx
│   │   │       └── FavoritesList.styles.ts
│   │   │
│   │   └── alerts/
│   │       ├── PriceAlert/
│   │       │   ├── PriceAlert.tsx
│   │       │   └── PriceAlert.styles.ts
│   │       └── AlertsList/
│   │           ├── AlertsList.tsx
│   │           └── AlertsList.styles.ts
│   │
│   ├── pages/
│   │   ├── Auth/
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   └── Auth.styles.ts
│   │   ├── Dashboard/
│   │   │   ├── Dashboard.tsx
│   │   │   └── Dashboard.styles.ts
│   │   ├── Product/
│   │   │   ├── ProductPage.tsx
│   │   │   └── ProductPage.styles.ts
│   │   ├── Store/
│   │   │   ├── StorePage.tsx
│   │   │   └── StorePage.styles.ts
│   │   ├── Profile/
│   │   │   ├── Profile.tsx
│   │   │   └── Profile.styles.ts
│   │   ├── Favorites/
│   │   │   ├── Favorites.tsx
│   │   │   └── Favorites.styles.ts
│   │   └── NotFound/
│   │       └── NotFound.tsx
│   │
│   ├── routes/
│   │   ├── AppRoutes.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── PublicRoute.tsx
│   │
│   ├── services/
│   │   ├── api/
│   │   │   ├── client.ts (axios config)
│   │   │   ├── products.ts
│   │   │   ├── stores.ts
│   │   │   ├── favorites.ts
│   │   │   ├── alerts.ts
│   │   │   └── auth.ts
│   │   └── supabase/
│   │       ├── supabaseClient.ts (ya existe)
│   │       ├── products.ts
│   │       ├── stores.ts
│   │       ├── favorites.ts
│   │       └── alerts.ts
│   │
│   ├── store/
│   │   ├── useAuthStore.ts
│   │   ├── useFavoritesStore.ts
│   │   ├── useSearchStore.ts
│   │   ├── useAlertsStore.ts
│   │   └── useUIStore.ts (theme, modals, etc)
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useProducts.ts
│   │   ├── useFavorites.ts
│   │   ├── useAlerts.ts
│   │   ├── useDebounce.ts
│   │   └── useMediaQuery.ts
│   │
│   ├── utils/
│   │   ├── constants.ts
│   │   ├── formatters.ts (precios, fechas)
│   │   ├── validators.ts
│   │   └── helpers.ts
│   │
│   ├── styles/
│   │   ├── GlobalStyles.ts
│   │   ├── theme.ts
│   │   ├── breakpoints.ts
│   │   └── animations.ts
│   │
│   ├── types/
│   │   ├── product.types.ts
│   │   ├── store.types.ts
│   │   ├── user.types.ts
│   │   └── api.types.ts
│   │
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
│
├── .env.example
├── .env
├── .gitignore
├── CLAUDE.md
├── DEVELOPMENT_PLAN.md (este archivo)
└── README.md
```

---

## 🎨 Guía de Estilos y Branding

### Paleta de Colores

```typescript
// src/styles/theme.ts
export const colors = {
  primary: {
    main: '#00C853',      // Verde principal
    light: '#5EFC82',
    dark: '#009624',
    contrast: '#FFFFFF',
  },
  secondary: {
    main: '#00BCD4',      // Azul turquesa
    light: '#62EFFF',
    dark: '#008BA3',
    contrast: '#000000',
  },
  neutral: {
    white: '#FFFFFF',
    lightest: '#F5F5F5',  // Gris claro
    light: '#E0E0E0',
    medium: '#9E9E9E',
    dark: '#424242',
    darkest: '#212121',
  },
  semantic: {
    success: '#4CAF50',
    error: '#F44336',
    warning: '#FF9800',
    info: '#2196F3',
  },
  background: {
    main: '#FFFFFF',
    secondary: '#F5F5F5',
    card: '#FFFFFF',
  }
}
```

### Tipografía

```typescript
export const typography = {
  fontFamily: {
    primary: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mono: "'Roboto Mono', monospace",
  },
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem',// 30px
    '4xl': '2.25rem', // 36px
  },
  fontWeight: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  }
}
```

### Breakpoints

```typescript
export const breakpoints = {
  xs: '320px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
}
```

### Espaciado

```typescript
export const spacing = {
  xs: '0.25rem',  // 4px
  sm: '0.5rem',   // 8px
  md: '1rem',     // 16px
  lg: '1.5rem',   // 24px
  xl: '2rem',     // 32px
  '2xl': '3rem',  // 48px
  '3xl': '4rem',  // 64px
}
```

---

## Fase 0: Configuración Inicial ✅

**Estado:** Completado (100%)
**Duración:** Ya realizado

### Objetivos
- [x] Proyecto Vite + React + TypeScript inicializado
- [x] Supabase configurado
- [x] Auth básico funcionando
- [x] Git configurado

---

## Fase 1: Fundación y Arquitectura

**Estado:** Pendiente
**Duración Estimada:** 4-6 horas
**Prioridad:** Alta

### Objetivos
Establecer la arquitectura base del proyecto: sistema de estilos, estado global, rutas y estructura de carpetas.

### Tareas

#### 1.1 Sistema de Estilos y Tema
- [ ] Instalar styled-components y tipos
  ```bash
  npm install styled-components
  npm install -D @types/styled-components
  ```
- [ ] Crear `src/styles/theme.ts` con colores, tipografía, espaciado
- [ ] Crear `src/styles/GlobalStyles.ts` con reset CSS y estilos globales
- [ ] Crear `src/styles/breakpoints.ts` para responsive
- [ ] Crear `src/styles/animations.ts` con transiciones comunes
- [ ] Añadir Google Fonts (Poppins) en `index.html`
- [ ] Aplicar ThemeProvider en `main.tsx`

#### 1.2 Estado Global (Zustand)
- [ ] Instalar zustand
  ```bash
  npm install zustand
  ```
- [ ] Crear `src/store/useAuthStore.ts`
  - Estado: user, isAuthenticated, isLoading
  - Acciones: login, logout, register, updateUser
- [ ] Crear `src/store/useFavoritesStore.ts`
  - Estado: favorites (array de product IDs)
  - Acciones: addFavorite, removeFavorite, loadFavorites
- [ ] Crear `src/store/useSearchStore.ts`
  - Estado: query, filters (category, store, priceRange), sortBy
  - Acciones: setQuery, setFilters, clearFilters, setSortBy
- [ ] Crear `src/store/useUIStore.ts`
  - Estado: sidebarOpen, modalOpen, theme (light/dark)
  - Acciones: toggleSidebar, openModal, closeModal, toggleTheme

#### 1.3 Tipos de TypeScript
- [ ] Crear `src/types/product.types.ts`
  ```typescript
  export interface Product {
    id: string;
    name: string;
    description: string;
    image: string;
    category: string;
    brand?: string;
    created_at: string;
    updated_at: string;
  }
  
  export interface Price {
    id: string;
    product_id: string;
    store_id: string;
    price: number;
    currency: 'USD' | 'PAB';
    date: string;
    in_stock: boolean;
  }
  
  export interface ProductWithPrices extends Product {
    prices: Price[];
    lowest_price?: number;
    highest_price?: number;
  }
  ```
- [ ] Crear `src/types/store.types.ts`
  ```typescript
  export interface Store {
    id: string;
    name: string;
    logo: string;
    website?: string;
    locations?: string[];
  }
  ```
- [ ] Crear `src/types/user.types.ts`
- [ ] Crear `src/types/api.types.ts` para respuestas de API

#### 1.4 Estructura de Carpetas
- [ ] Crear todas las carpetas según estructura definida
- [ ] Crear archivos `.gitkeep` en carpetas vacías
- [ ] Actualizar `.gitignore` si es necesario

#### 1.5 Configuración de React Router
- [ ] Instalar react-router-dom
  ```bash
  npm install react-router-dom
  ```
- [ ] Crear `src/routes/AppRoutes.tsx` con BrowserRouter y rutas básicas
- [ ] Crear `src/routes/ProtectedRoute.tsx` (wrapper para rutas autenticadas)
- [ ] Crear `src/routes/PublicRoute.tsx` (wrapper para login/registro)

### Criterios de Completado
- [ ] Tema aplicado globalmente con ThemeProvider
- [ ] Stores de Zustand funcionando con persist
- [ ] Tipos definidos y exportados correctamente
- [ ] Navegación básica funcionando con React Router
- [ ] Todas las carpetas creadas según estructura

### Tecnologías
- styled-components, zustand, react-router-dom, TypeScript

---

## Fase 2: Esqueleto y Navegación

**Estado:** Pendiente
**Duración Estimada:** 6-8 horas
**Prioridad:** Alta
**Dependencias:** Fase 1

### Objetivos
Crear el layout principal, navegación y páginas esqueleto sin funcionalidad completa.

### Tareas

#### 2.1 Layout Components
- [ ] Crear `Navbar` component
  - Logo
  - Barra de búsqueda (placeholder)
  - Links: Dashboard, Tiendas, Favoritos
  - Avatar/menú de usuario
  - Responsive (hamburger menu en mobile)
- [ ] Crear `Footer` component
  - Links útiles
  - Copyright
  - Redes sociales (icons)
- [ ] Crear `Sidebar` component (opcional, para filtros)
  - Categorías
  - Rangos de precio
  - Tiendas
  - Botón "Aplicar Filtros"

#### 2.2 Common Components
- [ ] Crear `Button` component
  - Variantes: primary, secondary, outlined, text
  - Tamaños: small, medium, large
  - Estados: default, hover, active, disabled
- [ ] Crear `Input` component
  - Variantes: text, email, password, number
  - Con/sin icon
  - Estados de validación
- [ ] Crear `Modal` component
  - Backdrop
  - Animación de entrada/salida
  - Botón de cerrar
- [ ] Crear `Loader` component
  - Spinner animado con colores del tema
- [ ] Crear `Badge` component
  - Para mostrar descuentos, ofertas, etc.

#### 2.3 Páginas Esqueleto
- [ ] Refactorizar `Login.tsx` y `Register.tsx`
  - Usar componentes Button e Input
  - Aplicar estilos del tema
  - Integrar con useAuthStore
- [ ] Crear `Dashboard.tsx`
  - Hero section
  - Sección "Top Ofertas" (placeholder cards)
  - Sección "Productos Populares" (placeholder cards)
  - Sección "Tiendas" (placeholder cards)
- [ ] Crear `ProductPage.tsx`
  - Layout: imagen + info + comparación de precios
  - Placeholder para gráfico de historial
  - Botón de favoritos
- [ ] Crear `StorePage.tsx`
  - Info de tienda
  - Lista de productos (placeholder)
- [ ] Crear `Profile.tsx`
  - Información del usuario
  - Configuración de alertas
  - Favoritos
- [ ] Crear `Favorites.tsx`
  - Grid de productos favoritos
- [ ] Crear `NotFound.tsx`
  - Página 404 con diseño bonito

#### 2.4 Navegación
- [ ] Configurar todas las rutas en `AppRoutes.tsx`
  ```typescript
  - / -> Dashboard (protected)
  - /login -> Login (public)
  - /register -> Register (public)
  - /product/:id -> ProductPage (protected)
  - /store/:id -> StorePage (protected)
  - /profile -> Profile (protected)
  - /favorites -> Favorites (protected)
  - /* -> NotFound
  ```
- [ ] Implementar lógica de ProtectedRoute
  - Redirigir a /login si no autenticado
- [ ] Implementar lógica de PublicRoute
  - Redirigir a / si ya autenticado
- [ ] Añadir loading state durante verificación de auth

#### 2.5 Notificaciones Toast
- [ ] Instalar react-toastify
  ```bash
  npm install react-toastify
  ```
- [ ] Configurar ToastContainer en `App.tsx`
- [ ] Personalizar estilos según tema
- [ ] Crear helper `src/utils/toast.ts` para notificaciones comunes

### Criterios de Completado
- [ ] Navegación completa funciona correctamente
- [ ] Layout (Navbar + Footer) visible en todas las páginas
- [ ] Componentes comunes reutilizables y documentados
- [ ] Páginas esqueleto accesibles y con diseño básico
- [ ] Rutas protegidas funcionan correctamente
- [ ] Sistema de notificaciones toast funcional

### Tecnologías
- react-router-dom, styled-components, react-toastify, react-icons

---

## Fase 3: Features Core

**Estado:** Pendiente
**Duración Estimada:** 10-12 horas
**Prioridad:** Alta
**Dependencias:** Fase 2

### Objetivos
Implementar las funcionalidades principales: búsqueda de productos, comparación de precios, favoritos y sistema de datos.

### Tareas

#### 3.1 Configuración de Servicios
- [ ] Instalar axios
  ```bash
  npm install axios
  ```
- [ ] Crear `src/services/api/client.ts`
  - Instancia de axios con baseURL
  - Interceptores para auth token
  - Manejo de errores global
- [ ] Crear servicios Supabase:
  - `src/services/supabase/products.ts`
    - getProducts(query, filters)
    - getProductById(id)
    - getProductPrices(productId)
  - `src/services/supabase/stores.ts`
    - getStores()
    - getStoreById(id)
  - `src/services/supabase/favorites.ts`
    - getFavorites(userId)
    - addFavorite(userId, productId)
    - removeFavorite(userId, productId)

#### 3.2 React Query Setup
- [ ] Instalar @tanstack/react-query
  ```bash
  npm install @tanstack/react-query
  ```
- [ ] Configurar QueryClient en `main.tsx`
- [ ] Crear hooks personalizados:
  - `src/hooks/useProducts.ts`
    - useProductsQuery(filters)
    - useProductQuery(id)
    - useProductPricesQuery(productId)
  - `src/hooks/useFavorites.ts`
    - useFavoritesQuery()
    - useAddFavoriteMutation()
    - useRemoveFavoriteMutation()

#### 3.3 Componentes de Producto
- [ ] Crear `ProductCard` component
  - Imagen del producto
  - Nombre y descripción corta
  - Precio más bajo encontrado
  - Badge de descuento si aplica
  - Botón de favorito (corazón)
  - Click para ir a detalle
- [ ] Crear `ProductList` component
  - Grid responsive de ProductCards
  - Loader mientras carga
  - Estado vacío si no hay resultados
- [ ] Crear `ProductDetail` component
  - Imagen grande
  - Descripción completa
  - Categoría y marca
  - Botón de favorito
- [ ] Crear `PriceComparison` component
  - Tabla/cards con precios por tienda
  - Indicador de mejor precio
  - Links a tiendas
  - Estado de disponibilidad

#### 3.4 Búsqueda y Filtros
- [ ] Crear `SearchBar` component
  - Input con icono de búsqueda
  - Debounce en el input
  - Integrar con useSearchStore
- [ ] Crear `SearchFilters` component
  - Filtro por categoría (dropdown/chips)
  - Filtro por tienda (checkboxes)
  - Filtro por rango de precio (slider)
  - Botón "Limpiar filtros"
  - Integrar con useSearchStore
- [ ] Implementar lógica de búsqueda en Dashboard
  - Conectar SearchBar con useProducts
  - Mostrar resultados filtrados
  - Loading states

#### 3.5 Sistema de Favoritos
- [ ] Crear `FavoriteButton` component
  - Icono de corazón (vacío/lleno)
  - Animación al hacer click
  - Integrar con useFavoritesStore
  - Mutation para agregar/quitar
- [ ] Crear `FavoritesList` component
  - Grid de ProductCards favoritos
  - Mensaje si no hay favoritos
  - Integrar con useFavoritesQuery
- [ ] Implementar página Favorites
  - Usar FavoritesList
  - Botón para limpiar todos

#### 3.6 Datos Mock / Supabase
- [ ] Crear tablas en Supabase:
  - `products` (id, name, description, image, category, brand)
  - `stores` (id, name, logo, website)
  - `prices` (id, product_id, store_id, price, date, in_stock)
  - `favorites` (id, user_id, product_id)
- [ ] Insertar datos de prueba (10-20 productos, 5 tiendas)
- [ ] Configurar RLS (Row Level Security) en Supabase

### Criterios de Completado
- [ ] Búsqueda de productos funciona correctamente
- [ ] Filtros aplican y muestran resultados correctos
- [ ] Comparación de precios visible en página de producto
- [ ] Sistema de favoritos funciona (agregar, quitar, listar)
- [ ] Datos de Supabase se muestran correctamente
- [ ] Loading y error states implementados

### Tecnologías
- axios, @tanstack/react-query, Supabase, zustand

---

## Fase 4: Features Avanzados

**Estado:** Pendiente
**Duración Estimada:** 8-10 horas
**Prioridad:** Media
**Dependencias:** Fase 3

### Objetivos
Implementar gráficos de historial de precios, alertas, autocompletado y mejoras UX.

### Tareas

#### 4.1 Gráficos de Precios
- [ ] Instalar recharts
  ```bash
  npm install recharts
  npm install -D @types/recharts
  ```
- [ ] Crear `PriceHistoryChart` component
  - LineChart con precio por fecha
  - Múltiples líneas para diferentes tiendas
  - Tooltip con info detallada
  - Responsive
  - Colores según tema
- [ ] Añadir datos de historial a tabla `prices` (registros con diferentes fechas)
- [ ] Integrar gráfico en ProductPage

#### 4.2 Sistema de Alertas
- [ ] Crear tabla `alerts` en Supabase
  - id, user_id, product_id, target_price, active, created_at
- [ ] Crear servicio `src/services/supabase/alerts.ts`
  - getAlerts(userId)
  - createAlert(userId, productId, targetPrice)
  - deleteAlert(id)
  - updateAlert(id, data)
- [ ] Crear `PriceAlert` component (modal/form)
  - Input para precio objetivo
  - Dropdown para seleccionar tienda (o todas)
  - Botón "Crear Alerta"
- [ ] Crear `AlertsList` component
  - Lista de alertas activas
  - Botón para editar/eliminar
  - Estado: activa, pausada, cumplida
- [ ] Integrar en Profile page

#### 4.3 Autocompletado de Búsqueda
- [ ] Crear `SearchAutocomplete` component
  - Dropdown con sugerencias
  - Highlight del texto buscado
  - Navegación con teclado (flechas, enter)
  - Click en sugerencia redirige a producto
- [ ] Implementar lógica de autocompletado
  - Query a Supabase con ILIKE
  - Debounce de 300ms
  - Máximo 10 resultados
- [ ] Integrar en SearchBar

#### 4.4 Ordenamiento de Productos
- [ ] Añadir dropdown "Ordenar por" en Dashboard
  - Precio: menor a mayor
  - Precio: mayor a menor
  - Nombre: A-Z
  - Más populares (por cantidad de búsquedas)
- [ ] Implementar lógica en useSearchStore
- [ ] Aplicar ordenamiento en query de productos

#### 4.5 Mejoras de UX
- [ ] Instalar librerías auxiliares
  ```bash
  npm install date-fns
  npm install react-responsive
  ```
- [ ] Añadir animaciones con framer-motion (opcional)
- [ ] Crear `useMediaQuery` hook personalizado
- [ ] Implementar skeleton loaders
  - Para ProductCard
  - Para ProductList
  - Para PriceComparison
- [ ] Añadir estados vacíos con ilustraciones
  - No hay productos
  - No hay favoritos
  - No hay alertas
- [ ] Mejorar accesibilidad
  - ARIA labels
  - Navegación por teclado
  - Contraste de colores

#### 4.6 Página de Tienda Completa
- [ ] Crear `StoreCard` component
  - Logo de tienda
  - Nombre
  - Cantidad de productos
  - Link a página de tienda
- [ ] Crear `StoreList` component
  - Grid de StoreCards
- [ ] Completar StorePage
  - Header con info de tienda
  - Lista de productos de esa tienda
  - Filtros aplicables

### Criterios de Completado
- [ ] Gráfico de historial de precios funcional y responsive
- [ ] Sistema de alertas de precios implementado
- [ ] Autocompletado de búsqueda funciona correctamente
- [ ] Ordenamiento de productos funcional
- [ ] Skeleton loaders y estados vacíos implementados
- [ ] Página de tienda completa y funcional

### Tecnologías
- recharts, date-fns, react-responsive, Supabase

---

## Fase 5: Pulido y Optimización

**Estado:** Pendiente
**Duración Estimada:** 6-8 horas
**Prioridad:** Baja
**Dependencias:** Fase 4

### Objetivos
Optimizar rendimiento, añadir dark mode, mejorar SEO y preparar para producción.

### Tareas

#### 5.1 Dark Mode
- [ ] Añadir tema oscuro en `src/styles/theme.ts`
  ```typescript
  export const darkTheme = {
    colors: {
      primary: { main: '#00C853', ... },
      background: {
        main: '#121212',
        secondary: '#1E1E1E',
        card: '#2C2C2C',
      },
      text: {
        primary: '#FFFFFF',
        secondary: '#B0B0B0',
      }
    }
  }
  ```
- [ ] Implementar toggle de tema en useUIStore
- [ ] Añadir botón de toggle en Navbar
- [ ] Guardar preferencia en localStorage
- [ ] Aplicar tema según preferencia del sistema (prefers-color-scheme)

#### 5.2 Optimización de Rendimiento
- [ ] Implementar React.lazy() para code-splitting
  - Lazy load de páginas
  - Lazy load de componentes pesados (charts)
- [ ] Añadir React.memo() en componentes que no cambian frecuentemente
- [ ] Optimizar imágenes
  - Usar formatos modernos (WebP)
  - Lazy loading de imágenes
  - Placeholder blur mientras carga
- [ ] Configurar caché de React Query
  - staleTime, cacheTime
  - Prefetch de datos comunes
- [ ] Analizar bundle size con vite-plugin-visualizer

#### 5.3 SEO y Meta Tags
- [ ] Instalar react-helmet-async
  ```bash
  npm install react-helmet-async
  ```
- [ ] Añadir meta tags en cada página
  - title, description, keywords
  - Open Graph tags
  - Twitter Card tags
- [ ] Crear sitemap.xml
- [ ] Crear robots.txt
- [ ] Añadir favicon y app icons

#### 5.4 Testing (Opcional)
- [ ] Instalar Vitest y Testing Library
  ```bash
  npm install -D vitest @testing-library/react @testing-library/jest-dom
  ```
- [ ] Escribir tests para componentes críticos
  - Button, Input, Modal
  - ProductCard
  - SearchBar
- [ ] Escribir tests para stores
  - useAuthStore
  - useFavoritesStore

#### 5.5 Documentación
- [ ] Actualizar README.md
  - Descripción del proyecto
  - Screenshots
  - Instrucciones de instalación
  - Variables de entorno
  - Scripts disponibles
- [ ] Documentar componentes principales
  - Props y tipos
  - Ejemplos de uso
- [ ] Crear CONTRIBUTING.md (si proyecto open source)

#### 5.6 Preparación para Producción
- [ ] Revisar y limpiar console.logs
- [ ] Configurar variables de entorno para producción
- [ ] Crear `.env.example` con todas las variables necesarias
- [ ] Configurar analytics (Google Analytics, Plausible, etc)
- [ ] Configurar error tracking (Sentry)
- [ ] Crear script de deployment

### Criterios de Completado
- [ ] Dark mode funcional y persistente
- [ ] Tiempos de carga optimizados (<3s First Contentful Paint)
- [ ] Meta tags configurados en todas las páginas
- [ ] Tests básicos pasando
- [ ] Documentación completa y actualizada
- [ ] Listo para deploy en producción

### Tecnologías
- react-helmet-async, vitest, testing-library, analytics tools

---

## 📝 Notas y Consideraciones Técnicas

### Backend: Supabase vs API Mock

**Opción 1: Supabase (Recomendado)**
- Ya está configurado
- Auth incluido
- Realtime opcional
- Tablas a crear:
  ```sql
  -- products
  CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    image TEXT,
    category TEXT,
    brand TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );

  -- stores
  CREATE TABLE stores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    logo TEXT,
    website TEXT,
    created_at TIMESTAMP DEFAULT NOW()
  );

  -- prices
  CREATE TABLE prices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    price DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    date TIMESTAMP DEFAULT NOW(),
    in_stock BOOLEAN DEFAULT true
  );

  -- favorites
  CREATE TABLE favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, product_id)
  );

  -- alerts
  CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    target_price DECIMAL(10,2) NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
  );
  ```

**Opción 2: API Mock con MSW**
- Para desarrollo sin backend
- Útil para demos
- Migración posterior a Supabase

### Estado Global: Zustand vs Redux Toolkit

**Zustand (Recomendado para este proyecto)**
- Más simple y ligero
- Menos boilerplate
- Perfecto para proyectos medianos
- Fácil integración con persist

**Redux Toolkit**
- Más verboso
- Mejor para proyectos grandes
- DevTools más robustas

### Estrategia de Caché

```typescript
// Configuración recomendada de React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      cacheTime: 1000 * 60 * 10, // 10 minutos
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
```

### Manejo de Errores

```typescript
// src/utils/errorHandler.ts
export const handleError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message || error.message;
    toast.error(message);
    return;
  }
  
  if (error instanceof Error) {
    toast.error(error.message);
    return;
  }
  
  toast.error('Ocurrió un error inesperado');
};
```

### Convenciones de Código

- **Nombres de componentes:** PascalCase (Button.tsx)
- **Nombres de archivos de estilos:** ComponentName.styles.ts
- **Nombres de hooks:** useNombreDelHook
- **Nombres de stores:** useNombreStore
- **Nombres de tipos:** TipoInterface (PascalCase)
- **Constantes:** UPPER_SNAKE_CASE
- **Funciones utilitarias:** camelCase

### Performance Tips

1. **Memoización:**
   ```typescript
   const MemoizedComponent = React.memo(ProductCard);
   ```

2. **useCallback para funciones:**
   ```typescript
   const handleClick = useCallback(() => {
     // lógica
   }, [dependencies]);
   ```

3. **useMemo para cálculos costosos:**
   ```typescript
   const sortedProducts = useMemo(() => 
     products.sort((a, b) => a.price - b.price),
     [products]
   );
   ```

### Accesibilidad

- Usar etiquetas semánticas (nav, main, section, article)
- Añadir aria-label en iconos sin texto
- Asegurar contraste de colores (WCAG AA)
- Navegación por teclado en todos los componentes interactivos
- Focus visible en elementos interactivos

---

## 🎯 Próximos Pasos Inmediatos

1. **Ejecutar Fase 1** (Fundación y Arquitectura)
   - Instalar dependencias base
   - Crear sistema de estilos
   - Configurar estado global
   - Definir tipos

2. **Setup de ambiente de desarrollo**
   - Configurar ESLint con reglas específicas
   - Configurar Prettier
   - Añadir pre-commit hooks con husky (opcional)

3. **Crear branch de desarrollo**
   ```bash
   git checkout -b develop
   ```

---

## ✅ Checklist de Inicio Rápido

Antes de empezar con Fase 1:

- [ ] Leer este documento completo
- [ ] Verificar que Node.js >= 18 esté instalado
- [ ] Verificar que npm funcione correctamente
- [ ] Tener credenciales de Supabase listas
- [ ] Crear branch de desarrollo
- [ ] Instalar extensiones recomendadas en VS Code:
  - ESLint
  - Prettier
  - styled-components
  - TypeScript Importer

---

**Última actualización:** 2025-11-11
**Versión del plan:** 1.0
**Estado general:** En planificación

---

¿Listo para comenzar? Empieza con la **Fase 1: Fundación y Arquitectura**
