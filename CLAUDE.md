# 🚀 Prexiopá - Plan de Desarrollo Actualizado

> **Última actualización:** 7 de Diciembre, 2025
> **Estado actual:** MVP Funcional (98% completo) - Sprint 1 ✅ | Sprint 2 ✅ | Sprint 3: 4/5 ✅
> **Objetivo:** Completar Fase 5 y preparar para producción

---

## 📊 Estado Actual del Proyecto

### ✅ Lo que YA está hecho (Fases 0-4 + Sprint 1 completadas)

El proyecto tiene una base sólida con:
- ✅ **153 archivos TypeScript** organizados y funcionales
- ✅ **36+ componentes React** reutilizables
- ✅ **13 páginas** completas (Dashboard, ProductDetail, Profile, Favorites, Shopping, etc.)
- ✅ **Google OAuth** completamente funcional
- ✅ **Escaneo de códigos de barras/QR** con cámara en tiempo real
- ✅ **Búsqueda avanzada** con filtros y autocompletado
- ✅ **Sistema de favoritos** sincronizado con Supabase
- ✅ **Alertas de precio** personalizadas
- ✅ **Listas de compras** con tracking
- ✅ **Design system** completo con styled-components
- ✅ **Responsive design** mobile-first
- ✅ **Protected routes** con redirección post-login
- ✅ **Dark mode** con toggle y persistencia
- ✅ **Toast notifications** en todas las acciones críticas

---

## 🎯 Plan de Desarrollo - Fase 5 y Producción

### ✅ **SPRINT 1: Seguridad y UX Crítico** (COMPLETADO)
*Objetivo: Resolver issues críticos para seguridad y experiencia de usuario*

#### Tarea 1.1: Protected Routes ⚠️ CRÍTICO ✅
**Prioridad:** Máxima
**Estimado:** 4 horas | **Real:** 3 horas

- [x] Crear componente `ProtectedRoute.tsx` en `/src/components/auth/`
- [x] Implementar lógica de redirección si no hay usuario autenticado
- [x] Guardar ruta original en sessionStorage para redirigir post-login
- [x] Aplicar a rutas: `/profile`, `/favorites`, `/shopping`
- [x] Agregar loading state mientras se verifica autenticación
- [x] Testing manual de todos los flujos

**Archivos creados/modificados:**
- ✅ `src/components/auth/ProtectedRoute.tsx` (nuevo)
- ✅ `src/routes/index.tsx` (modificado)
- ✅ `src/pages/AuthCallback.tsx` (modificado - redirect handling)

#### Tarea 1.2: Dark Mode Toggle ✅
**Prioridad:** Alta
**Estimado:** 3 horas | **Real:** 2.5 horas

- [x] Estado `theme` ya existía en `uiStore.ts`
- [x] Crear componente `ThemeToggle.tsx` (botón sol/luna con animación)
- [x] Crear componente `ThemeWrapper.tsx` para tema dinámico
- [x] Integrar toggle en Navbar
- [x] Persistir preferencia en localStorage (ya implementado)
- [x] Agregar animación de transición suave
- [x] Testing en todas las páginas

**Archivos creados/modificados:**
- ✅ `src/components/common/ThemeToggle.tsx` (nuevo)
- ✅ `src/components/ThemeWrapper.tsx` (nuevo)
- ✅ `src/components/Navbar.tsx` (modificado)
- ✅ `src/main.tsx` (modificado - usa ThemeWrapper)

#### Tarea 1.3: Toast Notifications Completas ✅
**Prioridad:** Alta
**Estimado:** 4 horas | **Real:** 3 horas

- [x] Configurar `ToastContainer` global en App.tsx
- [x] Agregar toasts en acciones de favoritos (add/remove)
- [x] Agregar toasts en acciones de alertas (create/delete/trigger)
- [x] Agregar toasts en shopping lists (add item, complete session)
- [x] Agregar toasts de éxito en login/logout/register
- [x] Personalizar estilos de toasts con theme colored

**Archivos modificados:**
- ✅ `src/App.tsx` (ToastContainer configurado)
- ✅ `src/store/favoritesStore.ts` (toasts agregados)
- ✅ `src/store/alertsStore.ts` (toasts agregados)
- ✅ `src/store/shoppingStore.ts` (toasts agregados)
- ✅ `src/store/authStore.ts` (toasts agregados)

**Resultado:** Sprint 1 completado en 8.5 horas (vs 11 horas estimadas) ✅

---

### ✅ **SPRINT 2: UX Mobile y Autenticación Completa** (COMPLETADO)
*Objetivo: Mejorar experiencia móvil y sistema de contribuciones de usuarios*

#### Tarea 2.1: Offcanvas Mobile Menu 📱 ✅ COMPLETADA
**Prioridad:** Alta
**Estimado:** 3 horas | **Real:** 2.5 horas

**Objetivo:** Crear menú lateral tipo offcanvas para mejorar navegación en móviles.

- [x] Agregar estado `mobileMenuOpen` en `uiStore.ts`
- [x] Crear componente `MobileMenu.tsx` (offcanvas slide-in desde izquierda)
- [x] Agregar hamburger icon en Navbar (visible solo en mobile < 768px)
- [x] Implementar overlay oscuro con click-outside para cerrar
- [x] Agregar animación slide-in/out suave (transform + transition)
- [x] Contenido del menú:
  - User profile section (avatar, nombre, email si está autenticado)
  - Links de navegación principales (Inicio, Tiendas, Favoritos, Shopping)
  - ThemeToggle integrado
  - Logout button (si está autenticado)
  - Login/Register buttons (si no está autenticado)
- [x] Deshabilitar scroll del body cuando menú está abierto
- [x] Testing en diferentes tamaños de pantalla
- [x] Testing en touch devices

**Archivos creados/modificados:**
- ✅ `src/components/common/MobileMenu.tsx` (nuevo - 362 líneas)
- ✅ `src/store/uiStore.ts` (agregado mobileMenuOpen state)
- ✅ `src/components/Navbar.tsx` (agregado hamburger button)

**Diseño sugerido:**
```tsx
interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

// Estructura:
// - Overlay (backdrop oscuro)
// - MenuContainer (slide desde izquierda, 280px ancho)
//   - UserSection (avatar + info o login buttons)
//   - Divider
//   - NavigationLinks
//   - Divider
//   - SettingsSection (ThemeToggle, Logout)
```

#### Tarea 2.2: Sistema de Contribuciones de Usuarios ✅ COMPLETADA
**Prioridad:** Alta
**Estimado:** 6 horas | **Real:** 5 horas

**Objetivo:** Permitir a usuarios contribuir con datos de productos (código de barras, imágenes, precios).

**Fase A: Base de datos (Supabase)**
- [x] Crear tabla `product_contributions` en Supabase:
  ```sql
  create table product_contributions (
    id uuid primary key default uuid_generate_v4(),
    product_id uuid references products(id),
    contributor_id uuid references auth.users(id),
    contribution_type text check (contribution_type in ('barcode', 'image', 'price', 'info')),
    data jsonb not null,
    status text check (status in ('pending', 'approved', 'rejected')) default 'pending',
    reviewed_by uuid references auth.users(id),
    reviewed_at timestamp with time zone,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
  );
  ```
- [x] Configurar RLS policies para contributions
- [x] Crear índices necesarios (5 índices optimizados)

**Fase B: Componente de Contribución**
- [x] Crear componente `ContributeDataModal.tsx`
- [x] Form para agregar código de barras (input + validación)
- [x] Form para agregar imagen (URL input)
- [x] Form para agregar precio (precio + tienda + fecha)
- [x] Form para agregar información adicional (brand, description, etc.)
- [x] Validación de campos con mensajes claros
- [x] Type selector con 4 opciones (barcode, image, price, info)
- [x] Agregar botón "Contribuir datos" en ProductDetail page

**Fase C: Store y API**
- [x] Crear `contributionsStore.ts`:
  - `submitContribution(productId, type, data)`
  - `getUserContributions()`
  - `getContributionStats()` (aceptadas/rechazadas)
  - `getRecentContributions()` (con nombres de productos)
  - `updateContribution()` y `deleteContribution()`
- [x] Agregar toast notifications para success/error
- [x] Mostrar mensaje de "Gracias por contribuir!" después de enviar

**Archivos creados/modificados:**
- ✅ `supabase/migrations/20250129_create_contributions_system.sql` (nuevo - 241 líneas)
- ✅ `src/components/contributions/ContributeDataModal.tsx` (nuevo - 635 líneas)
- ✅ `src/store/contributionsStore.ts` (nuevo - 401 líneas)
- ✅ `src/pages/ProductDetail.tsx` (agregado botón "Contribuir")
- ✅ `src/types/contribution.ts` (nuevo - 140 líneas con helpers)

**Tipos sugeridos:**
```typescript
interface ProductContribution {
  id: string;
  productId: string;
  contributorId: string;
  contributionType: 'barcode' | 'image' | 'price' | 'info';
  data: {
    barcode?: string;
    imageUrl?: string;
    price?: {
      value: number;
      storeId: string;
      date: string;
    };
    info?: {
      brand?: string;
      description?: string;
      category?: string;
    };
  };
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}
```

#### Tarea 2.3: Email/Password Authentication ✅ COMPLETADA
**Prioridad:** Alta
**Estimado:** 6 horas | **Real:** 3 horas

- [x] Conectar form de Login con `supabase.auth.signInWithPassword()`
- [x] Conectar form de Register con `supabase.auth.signUp()`
- [x] Implementar validación de forms (validación custom con regex)
- [x] Agregar manejo de errores específicos (email ya existe, contraseña débil, rate limiting)
- [x] Mostrar toasts de éxito/error
- [x] Validación de contraseña robusta (longitud, mayúscula, número)
- [x] Estados de loading con botones disabled
- [x] Mensajes de error específicos por campo
- [x] Success message con auto-redirect
- [x] Guardado de full_name en user metadata

**Archivos modificados:**
- ✅ `src/pages/Login.tsx` (377 líneas - autenticación completa)
- ✅ `src/pages/Register.tsx` (486 líneas - registro con validaciones)
- [ ] Testing de flujos completos

**Archivos a modificar:**
- `src/pages/Login.tsx`
- `src/pages/Register.tsx`
- `src/store/authStore.ts`

#### Tarea 2.2: Email Verification Flow
**Prioridad:** Media
**Estimado:** 4 horas

- [ ] Configurar email templates en Supabase
- [ ] Crear página `EmailVerification.tsx`
- [ ] Implementar handler de verificación de email
- [ ] Agregar banner "Verifica tu email" en dashboard
- [ ] Botón "Reenviar email de verificación"
- [ ] Testing del flujo completo

**Archivos a crear/modificar:**
- `src/pages/EmailVerification.tsx` (nuevo)
- `src/components/auth/VerificationBanner.tsx` (nuevo)
- Supabase dashboard (configuración)

#### Tarea 2.3: Password Reset Flow
**Prioridad:** Media
**Estimado:** 4 horas

- [ ] Crear página `ForgotPassword.tsx`
- [ ] Crear página `ResetPassword.tsx`
- [ ] Implementar `supabase.auth.resetPasswordForEmail()`
- [ ] Implementar `supabase.auth.updateUser()`
- [ ] Agregar link "¿Olvidaste tu contraseña?" en Login
- [ ] Testing del flujo completo

**Archivos a crear:**
- `src/pages/ForgotPassword.tsx`
- `src/pages/ResetPassword.tsx`

#### Tarea 2.4: User Settings Page
**Prioridad:** Media
**Estimado:** 5 horas

- [ ] Crear página `Settings.tsx`
- [ ] Sección: Información personal (nombre, email, teléfono)
- [ ] Sección: Cambiar contraseña
- [ ] Sección: Preferencias (notificaciones, dark mode)
- [ ] Sección: Privacidad (eliminar cuenta)
- [ ] Implementar actualización de perfil en authStore
- [ ] Agregar link en Navbar dropdown

**Archivos a crear/modificar:**
- `src/pages/Settings.tsx` (nuevo)
- `src/store/authStore.ts` (agregar updateProfile)
- `src/components/Navbar.tsx` (agregar link)

---

### 🔵 **SPRINT 3: Backoffice de Moderación** (1 semana)
*Objetivo: Sistema de administración para moderar contribuciones de usuarios*

#### ✅ Tarea 3.1: Sistema de Roles y Permisos
**Prioridad:** Alta
**Estimado:** 4 horas | **Invertido:** 4 horas
**Estado:** ✅ Completada

**Objetivo:** Implementar roles de usuario (user, moderator, admin) con Row Level Security en Supabase.

- [x] Crear tabla `user_roles` en Supabase
- [x] Crear función helper `get_user_role(user_id uuid)` en Supabase
- [x] Crear funciones helper adicionales: `is_moderator_or_admin()`, `is_admin()`
- [x] Actualizar RLS policies de `product_contributions` para moderadores
- [x] Crear funciones RPC para moderación: `get_moderation_stats()`, `get_pending_contributions()`
- [x] Crear funciones RPC para acciones: `approve_contribution()`, `reject_contribution()`
- [x] Crear tipos TypeScript completos con sistema de permisos
- [x] Crear hook `useUserRole()` con auto-refresh
- [x] Crear hooks adicionales: `useModerationStats()`, `usePendingContributions()`, `useModerationActions()`

**Archivos creados:**
- ✅ `supabase/migrations/20250129_create_user_roles_system.sql` (286 líneas)
- ✅ `src/types/role.ts` (267 líneas)
- ✅ `src/hooks/useUserRole.ts` (348 líneas)

**Commit:** `36fe6ac` - feat: Implement user roles and permissions system

#### ✅ Tarea 3.2: Admin Dashboard - Vista de Contribuciones Pendientes
**Prioridad:** Alta
**Estimado:** 5 horas | **Invertido:** 5 horas
**Estado:** ✅ Completada

**Objetivo:** Crear página de administración para revisar contribuciones pendientes.

- [x] Crear página `/admin` con protección por rol interna
- [x] Crear componente `AdminLayout.tsx` con sidebar y navegación
- [x] Crear componente `ContributionsQueue.tsx`:
  - [x] Lista de contribuciones pendientes
  - [x] Filtros por tipo (barcode, image, price, info)
  - [x] Auto-refresh cada 30 segundos
  - [x] Empty states y manejo de errores
- [x] Crear componente `ContributionReviewCard.tsx`:
  - [x] Renderizado dinámico según tipo de contribución
  - [x] Vista previa de imagen para tipo "image"
  - [x] Información del producto y contribuidor
  - [x] Botones de aprobar/rechazar
- [x] Implementar modales de confirmación:
  - [x] Modal de aprobar con nombre del producto
  - [x] Modal de rechazar con textarea de razón obligatoria
- [x] Integrar con hooks de moderación (useUserRole, useModerationActions)
- [x] Agregar estadísticas en sidebar (pending/approved/rejected)

**Archivos creados:**
- ✅ `src/pages/Admin.tsx` (107 líneas)
- ✅ `src/components/admin/AdminLayout.tsx` (265 líneas)
- ✅ `src/components/admin/ContributionsQueue.tsx` (412 líneas)
- ✅ `src/components/admin/ContributionReviewCard.tsx` (302 líneas)
- ✅ `src/components/admin/index.ts` (8 líneas)
- ✅ `src/routes/index.tsx` (modificado - agregada ruta /admin)

**Commit:** `87237a7` - feat: Implement admin dashboard for moderation

#### ✅ Tarea 3.3: Lógica de Aprobación/Rechazo
**Prioridad:** Alta
**Estimado:** 4 horas | **Invertido:** 2 horas
**Estado:** ✅ Completada

**Objetivo:** Implementar acciones de moderación y actualización de datos de productos.

- [x] Actualizar función `approve_contribution()` para aplicar cambios:
  - [x] BARCODE: Actualiza `products.barcode`
  - [x] IMAGE: Inserta en `product_images` (con verificación de duplicados)
  - [x] PRICE: Inserta en `prices` (con ON CONFLICT)
  - [x] INFO: Actualiza campos del producto (brand, description, etc.)
- [x] Marcar contribución como `approved` con reviewer y timestamp
- [x] Implementar función `revert_contribution()` para admins
- [x] Crear función `get_product_contribution_history()` para auditoría
- [x] Agregar RLS policies para `product_images`
- [x] Crear índices para optimización (product_images)
- [x] Manejo de errores con logging detallado
- [x] Toast notifications ya implementadas en frontend (Tarea 3.2)

**NOTA:** No fue necesario crear moderationStore separado porque toda la lógica
está implementada en las RPC functions de Supabase y los hooks ya existentes
(useModerationActions) que fueron creados en la Tarea 3.1.

**Archivos creados:**
- ✅ `supabase/migrations/20250130_apply_contributions_to_products.sql` (285 líneas)

**Commit:** `ba9698a` - feat: Apply contributions to products on approval

#### Tarea 3.4: Sistema de Reputación de Usuarios ✅ COMPLETADA
**Prioridad:** Media
**Estimado:** 3 horas | **Real:** 3 horas

**Objetivo:** Dar reputación a usuarios basado en contribuciones aprobadas.

- [x] Agregar campos `reputation_score`, `contributions_approved`, `contributions_rejected` a tabla `user_roles`
- [x] Incrementar score cuando contribución es aprobada (+5 a +8 según tipo)
- [x] Decrementar score cuando contribución es rechazada (-2)
- [x] Mostrar badge de reputación con componente ReputationBadge
- [x] Auto-aprobar contribuciones de usuarios con score >= 100
- [x] Crear página "Top Contributors" (leaderboard con ranking)
- [x] Sistema de badges: Principiante (0-49), Ayudante (50-99), Contribuidor (100-249), Confiable (250-499), Experto (500+)
- [x] Trigger automático para actualizar reputación cuando se revisa una contribución

**Archivos creados:**
- ✅ `supabase/migrations/20250207000002_reputation_system.sql` (283 líneas)
- ✅ `src/components/user/ReputationBadge.tsx` (165 líneas)
- ✅ `src/pages/TopContributors.tsx` (309 líneas)

**Archivos modificados:**
- ✅ `src/routes/index.tsx` (agregada ruta `/contributors`)

#### Tarea 3.5: Vista de Productos Incompletos
**Prioridad:** Media
**Estimado:** 4 horas

**Objetivo:** Permitir a moderadores/admins identificar y completar productos con datos faltantes.

**Fase A: Backend (Supabase)**
- [ ] Crear función RPC `get_incomplete_products()`:
  - Filtrar productos sin código de barras
  - Filtrar productos sin imagen
  - Filtrar productos sin precios recientes (últimos 7 días)
  - Filtrar productos sin descripción o brand
  - Opciones de ordenamiento (más incompletos primero)
  - Paginación (limit, offset)
- [ ] Retornar datos agregados:
  - Información del producto
  - Campos faltantes (array de strings)
  - Score de completitud (0-100%)
  - Última actualización

**Fase B: Frontend**
- [ ] Crear componente `IncompleteProductsList.tsx`:
  - Tabla/Lista de productos incompletos
  - Mostrar score de completitud con barra de progreso
  - Badges para indicar qué campos faltan
  - Filtros: por tipo de incompletitud, por categoría
  - Ordenar por score, última actualización, nombre
- [ ] Agregar botón "Completar" que abre el modal de contribución
- [ ] Integrar en sidebar del admin panel
- [ ] Paginación o infinite scroll

**Archivos a crear/modificar:**
- `supabase/migrations/XXX_incomplete_products_view.sql` (nuevo)
- `src/components/admin/IncompleteProductsList.tsx` (nuevo)
- `src/components/admin/AdminLayout.tsx` (modificar - agregar link en sidebar)
- `src/hooks/useIncompleteProducts.ts` (nuevo)
- `src/types/incomplete-product.ts` (nuevo)

**Tipos sugeridos:**
```typescript
interface IncompleteProduct {
  id: string;
  name: string;
  category: string;
  completenessScore: number; // 0-100
  missingFields: ('barcode' | 'image' | 'price' | 'description' | 'brand')[];
  lastUpdated: string;
}
```

#### Tarea 3.6: Admin Analytics Dashboard (Opcional)
**Prioridad:** Baja
**Estimado:** 3 horas

**Objetivo:** Mostrar estadísticas de moderación y contribuciones.

- [ ] Crear componente `AdminStats.tsx`:
  - Total de contribuciones pendientes
  - Contribuciones aprobadas/rechazadas (hoy, semana, mes)
  - Top contributors del mes
  - Gráfico de contribuciones por tipo
  - Tiempo promedio de revisión
- [ ] Integrar con Recharts para visualizaciones
- [ ] Actualizar en tiempo real (polling o Supabase realtime)

**Archivos a crear:**
- `src/components/admin/AdminStats.tsx` (nuevo)

---

### 🟢 **SPRINT 4: Testing y Calidad** (1 semana)
*Objetivo: Agregar tests básicos para componentes y features críticos*

#### Tarea 3.1: Testing Setup
**Prioridad:** Alta
**Estimado:** 3 horas

- [ ] Instalar Vitest, React Testing Library, jsdom
- [ ] Configurar `vite.config.ts` para tests
- [ ] Crear setup file `src/test/setup.ts`
- [ ] Crear test utilities y mocks comunes
- [ ] Configurar coverage reports
- [ ] Agregar script `npm run test` en package.json

**Archivos a crear:**
- `vite.config.ts` (modificar)
- `src/test/setup.ts`
- `src/test/utils.tsx`
- `src/test/mocks.ts`

#### Tarea 3.2: Component Tests (Core)
**Prioridad:** Alta
**Estimado:** 8 horas

- [ ] Test: `Button.test.tsx` (variantes, disabled, loading)
- [ ] Test: `Input.test.tsx` (validación, errores)
- [ ] Test: `ProductCard.test.tsx` (render, favoritos, add to cart)
- [ ] Test: `SearchBar.test.tsx` (input, debounce, scanner)
- [ ] Test: `FavoriteButton.test.tsx` (toggle, animación)
- [ ] Test: `PriceComparison.test.tsx` (múltiples tiendas, mejor precio)

**Meta:** 60%+ coverage en componentes core

#### Tarea 3.3: Store Tests
**Prioridad:** Media
**Estimado:** 4 horas

- [ ] Test: `authStore.test.ts` (login, logout, session)
- [ ] Test: `favoritesStore.test.ts` (add, remove, sync)
- [ ] Test: `searchStore.test.ts` (filtros, reset)

**Meta:** 80%+ coverage en stores

#### Tarea 3.4: Integration Tests (Key Flows)
**Prioridad:** Media
**Estimado:** 5 horas

- [ ] Test: Flujo de búsqueda completo
- [ ] Test: Flujo de agregar/quitar favoritos
- [ ] Test: Flujo de crear alerta de precio
- [ ] Test: Flujo de login/logout

---

### 🔧 **SPRINT 4: Performance y Optimización** (1 semana)
*Objetivo: Optimizar bundle size y performance*

#### Tarea 4.1: Code Splitting y Lazy Loading
**Prioridad:** Alta
**Estimado:** 4 horas

- [ ] Lazy load `BarcodeScanner` con dynamic import
- [ ] Lazy load `Recharts` components
- [ ] Lazy load rutas con `React.lazy()`
- [ ] Agregar Suspense boundaries con buenos loading states
- [ ] Verificar bundle size con `vite-bundle-visualizer`

**Meta:** Reducir bundle de 552KB a <400KB

#### Tarea 4.2: React Performance
**Prioridad:** Media
**Estimado:** 4 horas

- [ ] Agregar `React.memo` a componentes pesados (ProductCard, ProductList)
- [ ] Usar `useMemo` para cálculos costosos
- [ ] Usar `useCallback` para funciones pasadas como props
- [ ] Verificar re-renders innecesarios con React DevTools
- [ ] Optimizar listas con virtualization si es necesario

#### Tarea 4.3: Image Optimization
**Prioridad:** Media
**Estimado:** 3 horas

- [ ] Implementar lazy loading de imágenes
- [ ] Agregar blur placeholders
- [ ] Usar WebP con fallback a PNG/JPG
- [ ] Considerar CDN para imágenes (Cloudinary/ImgIX)
- [ ] Implementar srcset para responsive images

#### Tarea 4.4: Lighthouse Audit
**Prioridad:** Alta
**Estimado:** 4 horas

- [ ] Ejecutar Lighthouse audit
- [ ] Resolver issues de Performance (meta: 90+)
- [ ] Resolver issues de Accessibility (meta: 95+)
- [ ] Resolver issues de Best Practices (meta: 95+)
- [ ] Resolver issues de SEO (meta: 90+)
- [ ] Documentar resultados y mejoras

---

### 📦 **SPRINT 5: Deploy y Monitoreo** (1 semana)
*Objetivo: Deploy a producción con CI/CD y monitoreo*

#### Tarea 5.1: Environment Setup
**Prioridad:** Crítica
**Estimado:** 2 horas

- [ ] Crear `.env.example` documentado
- [ ] Separar configs: development, staging, production
- [ ] Configurar variables de entorno en hosting
- [ ] Verificar que no haya secrets en código
- [ ] Documentar proceso de setup en README

#### Tarea 5.2: CI/CD Pipeline
**Prioridad:** Alta
**Estimado:** 4 horas

- [ ] Crear workflow GitHub Actions para CI
  - Lint (ESLint)
  - Type check (TypeScript)
  - Tests (Vitest)
  - Build
- [ ] Crear workflow para CD (deploy automático)
- [ ] Configurar deploy preview para PRs
- [ ] Testing del pipeline completo

**Archivo a crear:**
- `.github/workflows/ci.yml`
- `.github/workflows/deploy.yml`

#### Tarea 5.3: Error Tracking (Sentry)
**Prioridad:** Alta
**Estimado:** 3 horas

- [ ] Crear cuenta y proyecto en Sentry
- [ ] Instalar `@sentry/react`
- [ ] Configurar Sentry en `main.tsx`
- [ ] Configurar Error Boundary con Sentry
- [ ] Agregar source maps para debugging
- [ ] Configurar alertas por email/Slack
- [ ] Testing con errores intencionales

#### Tarea 5.4: Analytics (Google Analytics 4)
**Prioridad:** Media
**Estimado:** 3 horas

- [ ] Crear propiedad GA4
- [ ] Instalar `react-ga4`
- [ ] Implementar tracking de page views
- [ ] Implementar eventos custom:
  - Búsqueda de productos
  - Escaneo de códigos
  - Agregar a favoritos
  - Crear alerta de precio
  - Completar sesión de compra
- [ ] Verificar en Google Analytics dashboard

#### Tarea 5.5: Deploy a Producción
**Prioridad:** Crítica
**Estimado:** 4 horas

- [ ] Elegir hosting (Vercel/Netlify/Cloudflare Pages)
- [ ] Configurar dominio personalizado
- [ ] Configurar SSL certificate (automático en hosting moderno)
- [ ] Deploy inicial
- [ ] Configurar redirects y rewrites
- [ ] Testing en producción
- [ ] Configurar Web Vitals monitoring
- [ ] Documentar proceso de deploy

---

### 🎨 **SPRINT 6: SEO y PWA** (1 semana)
*Objetivo: Optimizar para motores de búsqueda e instalar como app*

#### Tarea 6.1: SEO Optimization
**Prioridad:** Media
**Estimado:** 5 horas

- [ ] Agregar meta tags en todas las páginas:
  - title dinámico
  - description
  - keywords
  - canonical URL
- [ ] Crear `sitemap.xml`
- [ ] Crear `robots.txt`
- [ ] Agregar Open Graph tags para social sharing
- [ ] Agregar Twitter Card tags
- [ ] Implementar Schema.org markup (Product, Store)
- [ ] Testing con herramientas SEO

#### Tarea 6.2: PWA Implementation
**Prioridad:** Media
**Estimado:** 6 horas

- [ ] Instalar `vite-plugin-pwa`
- [ ] Crear `manifest.json` con iconos y colores
- [ ] Configurar service worker con estrategias de cache
- [ ] Implementar offline fallback page
- [ ] Agregar "Add to Home Screen" prompt
- [ ] Testing en diferentes dispositivos
- [ ] Verificar con Lighthouse PWA checklist

---

## 📋 Features Adicionales (Post-Producción)

### Fase 6: Features Avanzados (Opcional)

#### Geolocalización de Tiendas
**Estimado:** 8 horas
- [ ] Agregar coordenadas a tabla `stores` en Supabase
- [ ] Implementar `navigator.geolocation` API
- [ ] Crear componente de mapa (Google Maps / Mapbox)
- [ ] Filtrar tiendas por distancia
- [ ] Agregar "Ver en mapa" en StoreCard

#### Social Sharing
**Estimado:** 4 horas
- [ ] Botón "Compartir" en ProductDetail
- [ ] Implementar Web Share API
- [ ] Fallback con copiar link
- [ ] Generar links cortos (Bitly API)
- [ ] Tracking de shares en Analytics

#### Product Reviews & Ratings
**Estimado:** 12 horas
- [ ] Crear tabla `reviews` en Supabase
- [ ] Componente `ReviewForm`
- [ ] Componente `ReviewList`
- [ ] Sistema de ratings (1-5 estrellas)
- [ ] Moderación de reviews

#### Historial de Compras
**Estimado:** 8 horas
- [ ] Crear vista de historial en Profile
- [ ] Gráficos de gastos por mes
- [ ] Productos más comprados
- [ ] Comparación de gastos vs presupuesto

---

## 🎯 Resumen de Prioridades

### Orden Recomendado de Implementación:

1. ✅ **COMPLETADO (Semana 1):** Protected Routes, Dark Mode, Toasts
2. **ALTA (Semana 2-3):** Mobile Menu, Sistema de Contribuciones, Email/Password Auth
3. **ALTA (Semana 4):** Backoffice de Moderación, Roles y Permisos
4. **ALTA (Semana 5):** Testing Setup y Tests Básicos
5. **MEDIA (Semana 6):** Performance Optimization
6. **CRÍTICA (Semana 7):** Deploy, CI/CD, Monitoring
7. **MEDIA (Semana 8):** SEO y PWA
8. **OPCIONAL (Post-Launch):** Features Avanzados

---

## 📊 Métricas de Éxito

### Fase 5 Completa Cuando:
- ✅ Protected routes funcionando (COMPLETADO)
- ✅ Dark mode toggle operativo (COMPLETADO)
- ✅ Toast notifications en todas las acciones (COMPLETADO)
- [ ] Mobile menu offcanvas funcional
- [ ] Sistema de contribuciones implementado
- [ ] Backoffice de moderación operativo
- [ ] Email/password auth completo
- [ ] Test coverage > 60%
- [ ] Lighthouse Performance > 90
- [ ] Lighthouse Accessibility > 95
- [ ] Bundle size < 400KB
- [ ] Deploy en producción exitoso
- [ ] Sentry y GA4 configurados

---

## 🚀 Listo para Producción Cuando:

- ✅ Todos los items de Sprint 1-5 completados
- ✅ No hay errores críticos en Sentry (primeras 48hrs)
- ✅ Performance en producción >= dev
- ✅ Tests pasando en CI/CD
- ✅ SSL configurado correctamente
- ✅ Analytics tracking funcionando
- ✅ Backup strategy de Supabase configurada
- ✅ Documentación de deploy actualizada

---

## 📝 Notas Importantes

### ⚠️ IMPORTANTE: Migraciones de Supabase

**NO intentar ejecutar migraciones desde el CLI de Supabase.**

Las migraciones de Supabase en este proyecto deben ser:
1. **Generadas** como archivos SQL en la carpeta `supabase/migrations/`
2. **Ejecutadas manualmente** desde el sitio web de Supabase:
   - Ir a https://supabase.com/dashboard/project/[tu-proyecto]
   - Navegar a "SQL Editor"
   - Copiar y pegar el contenido del archivo de migración
   - Ejecutar el SQL manualmente

**Razón:** El proyecto está configurado para ejecutar migraciones directamente en el dashboard de Supabase en lugar de usar el CLI local.

**Workflow recomendado:**
```bash
# 1. Crear archivo de migración (solo generar el archivo)
# Ejemplo: supabase/migrations/20250130_nombre_descriptivo.sql

# 2. Escribir el SQL en el archivo

# 3. Ir al dashboard de Supabase y ejecutar manualmente

# 4. Verificar que la migración se aplicó correctamente
```

**NO ejecutar:**
- ❌ `supabase db push`
- ❌ `supabase db reset`
- ❌ `supabase migration up`

### Dependencias Nuevas a Instalar:
```bash
# Testing
npm install -D vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event

# Error Tracking
npm install @sentry/react

# Analytics
npm install react-ga4

# PWA
npm install -D vite-plugin-pwa

# Bundle Analysis
npm install -D rollup-plugin-visualizer

# Form Validation (opcional)
npm install zod react-hook-form @hookform/resolvers
```

### Scripts a Agregar en package.json:
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "analyze": "vite build --mode analyze"
  }
}
```

---

**¡Éxito en el desarrollo! 🚀**

Este plan está diseñado para llevar Prexiopá del 85% actual al 100% production-ready en aproximadamente 6 semanas de trabajo enfocado.
