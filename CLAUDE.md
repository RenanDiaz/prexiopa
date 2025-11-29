# 🚀 Prexiopá - Plan de Desarrollo Actualizado

> **Última actualización:** 29 de Noviembre, 2025
> **Estado actual:** MVP Funcional (85% completo)
> **Objetivo:** Completar Fase 5 y preparar para producción

---

## 📊 Estado Actual del Proyecto

### ✅ Lo que YA está hecho (Fases 0-4 completadas)

El proyecto tiene una base sólida con:
- ✅ **153 archivos TypeScript** organizados y funcionales
- ✅ **36 componentes React** reutilizables
- ✅ **13 páginas** completas (Dashboard, ProductDetail, Profile, Favorites, Shopping, etc.)
- ✅ **Google OAuth** completamente funcional
- ✅ **Escaneo de códigos de barras/QR** con cámara en tiempo real
- ✅ **Búsqueda avanzada** con filtros y autocompletado
- ✅ **Sistema de favoritos** sincronizado con Supabase
- ✅ **Alertas de precio** personalizadas
- ✅ **Listas de compras** con tracking
- ✅ **Design system** completo con styled-components
- ✅ **Responsive design** mobile-first

---

## 🎯 Plan de Desarrollo - Fase 5 y Producción

### 🔴 **SPRINT 1: Seguridad y UX Crítico** (1 semana)
*Objetivo: Resolver issues críticos para seguridad y experiencia de usuario*

#### Tarea 1.1: Protected Routes ⚠️ CRÍTICO
**Prioridad:** Máxima
**Estimado:** 4 horas

- [ ] Crear componente `ProtectedRoute.tsx` en `/src/components/auth/`
- [ ] Implementar lógica de redirección si no hay usuario autenticado
- [ ] Guardar ruta original en localStorage para redirigir post-login
- [ ] Aplicar a rutas: `/profile`, `/favorites`, `/shopping`
- [ ] Agregar loading state mientras se verifica autenticación
- [ ] Testing manual de todos los flujos

**Archivos a crear/modificar:**
- `src/components/auth/ProtectedRoute.tsx` (nuevo)
- `src/routes/index.tsx` (modificar)

#### Tarea 1.2: Dark Mode Toggle
**Prioridad:** Alta
**Estimado:** 3 horas

- [ ] Agregar `darkMode` state en `uiStore.ts`
- [ ] Crear componente `ThemeToggle.tsx` (botón sol/luna)
- [ ] Integrar toggle en Navbar
- [ ] Persistir preferencia en localStorage
- [ ] Agregar animación de transición suave
- [ ] Testing en todas las páginas

**Archivos a crear/modificar:**
- `src/components/common/ThemeToggle.tsx` (nuevo)
- `src/store/uiStore.ts` (modificar)
- `src/components/Navbar.tsx` (modificar)
- `src/App.tsx` (aplicar tema dinámico)

#### Tarea 1.3: Toast Notifications Completas
**Prioridad:** Alta
**Estimado:** 4 horas

- [ ] Configurar `ToastContainer` global en App.tsx
- [ ] Agregar toasts en acciones de favoritos (add/remove)
- [ ] Agregar toasts en acciones de alertas (create/delete/trigger)
- [ ] Agregar toasts en shopping lists (add item, complete session)
- [ ] Agregar toasts en errores de API
- [ ] Agregar toasts de éxito en login/logout
- [ ] Personalizar estilos de toasts con theme

**Archivos a modificar:**
- `src/App.tsx`
- `src/store/favoritesStore.ts`
- `src/store/alertsStore.ts`
- `src/store/shoppingStore.ts`
- `src/store/authStore.ts`
- `src/hooks/useProducts.ts` (errores)

---

### 🟡 **SPRINT 2: Autenticación Completa** (1 semana)
*Objetivo: Completar sistema de autenticación con email/password*

#### Tarea 2.1: Email/Password Authentication
**Prioridad:** Alta
**Estimado:** 6 horas

- [ ] Conectar form de Login con `supabase.auth.signInWithPassword()`
- [ ] Conectar form de Register con `supabase.auth.signUp()`
- [ ] Implementar validación de forms (Zod o React Hook Form)
- [ ] Agregar manejo de errores específicos (email ya existe, contraseña débil)
- [ ] Mostrar toasts de éxito/error
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

### 🟢 **SPRINT 3: Testing y Calidad** (1 semana)
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

1. **CRÍTICO (Semana 1):** Protected Routes, Dark Mode, Toasts
2. **ALTA (Semana 2):** Email/Password Auth, Settings Page
3. **ALTA (Semana 3):** Testing Setup y Tests Básicos
4. **MEDIA (Semana 4):** Performance Optimization
5. **CRÍTICA (Semana 5):** Deploy, CI/CD, Monitoring
6. **MEDIA (Semana 6):** SEO y PWA
7. **OPCIONAL (Post-Launch):** Features Avanzados

---

## 📊 Métricas de Éxito

### Fase 5 Completa Cuando:
- ✅ Protected routes funcionando
- ✅ Email/password auth completo
- ✅ Dark mode toggle operativo
- ✅ Toast notifications en todas las acciones
- ✅ Test coverage > 60%
- ✅ Lighthouse Performance > 90
- ✅ Lighthouse Accessibility > 95
- ✅ Bundle size < 400KB
- ✅ Deploy en producción exitoso
- ✅ Sentry y GA4 configurados

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
