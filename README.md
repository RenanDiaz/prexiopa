# 🛒 Prexiopá

> **Compara precios, ahorra dinero** - La app definitiva para comparar precios de productos en supermercados y tiendas de Panamá.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.1-61dafb)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7.1-646cff)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

---

## 📖 Descripción

**Prexiopá** es una aplicación web progresiva que permite a los usuarios en Panamá buscar, comparar y seguir precios de productos en diferentes supermercados y tiendas. Con una interfaz intuitiva y moderna, ayudamos a las familias panameñas a tomar decisiones informadas de compra y ahorrar dinero.

### 🚀 Estado del Proyecto

**Prexiopá está en fase funcional avanzada** con la mayoría de características core implementadas y funcionando:

#### 📊 Estadísticas del Proyecto
- **153** archivos TypeScript/TSX
- **36** componentes React
- **13** páginas completas
- **6** Zustand stores
- **8** servicios API de Supabase
- **5** custom hooks principales
- **10+** componentes comunes reutilizables

#### ✅ Funcionalidades Operativas
- ✅ **Autenticación Google OAuth** - Login/logout funcional
- ✅ **Búsqueda de productos** - Filtros por categoría, tienda y rango de precio
- ✅ **Escaneo de códigos de barras/QR** - Con cámara y detección en tiempo real
- ✅ **Comparación de precios** - Vista de precios por tienda con mejor precio destacado
- ✅ **Sistema de favoritos** - Sincronización local + Supabase
- ✅ **Alertas de precio** - Crear y gestionar alertas personalizadas
- ✅ **Listas de compras** - Sesiones activas e historial
- ✅ **Perfil de usuario** - Datos reales de Supabase con estadísticas
- ✅ **Diseño responsive** - Mobile-first, adaptativo
- ✅ **Base de datos Supabase** - Integración completa y funcional

#### 🚧 En Desarrollo
- 🚧 **Dark mode** - Sistema de tema preparado, falta toggle
- 🚧 **Auth email/password** - UI presente, backend no conectado
- 🚧 **Rutas protegidas** - Falta enforcement
- 🚧 **Testing** - Suite de tests pendiente

### ✨ Características Principales

- 🔍 **Búsqueda inteligente** de productos por nombre o código de barras
- 📊 **Comparación de precios** entre múltiples tiendas en tiempo real
- 📱 **Escaneo QR y códigos de barra** para búsqueda rápida con cámara
- 📈 **Historial de precios** con gráficos visuales interactivos
- ⭐ **Lista de favoritos** sincronizada en la nube
- 🔔 **Alertas de precio** personalizadas
- 🛒 **Listas de compras** con sesiones activas e historial
- 🌓 **Modo oscuro** para mejor experiencia (en desarrollo)
- 📲 **Diseño responsive** mobile-first

---

## 🚀 Tech Stack

### Frontend
- **React 19** - UI library
- **TypeScript 5.9** - Type safety
- **Vite 7** - Build tool y dev server
- **Styled Components** - CSS-in-JS styling
- **React Router** - Client-side routing
- **Zustand** - State management
- **Axios** - HTTP client

### Backend & Services
- **Supabase** - Authentication, database, real-time
- **PostgreSQL** - Database (via Supabase)

### Tools & Libraries
- **React Icons** - Icon library
- **@zxing/browser** - QR/Barcode scanning
- **ESLint** - Code linting
- **TypeScript ESLint** - TS-specific linting

---

## 📦 Instalación

### Prerequisitos

- Node.js 18+
- npm o yarn
- Cuenta de Supabase (para backend)

### Pasos

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/RenanDiaz/prexiopa.git
   cd prexiopa
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   ```

   Edita `.env` y agrega tus credenciales de Supabase:
   ```env
   VITE_SUPABASE_URL=tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-anon-key
   VITE_API_BASE_URL=http://localhost:3000/api
   ```

4. **Iniciar servidor de desarrollo**
   ```bash
   npm run dev
   ```

5. **Abrir en el navegador**

   Visita [http://localhost:5173](http://localhost:5173)

---

## 🎯 Comandos Disponibles

```bash
# Desarrollo
npm run dev          # Iniciar dev server con HMR

# Build
npm run build        # Compilar para producción
npm run preview      # Preview del build de producción

# Linting
npm run lint         # Ejecutar ESLint

# Type checking
npx tsc --noEmit     # Verificar tipos sin compilar
```

---

## 📁 Estructura del Proyecto

```
prexiopa/
├── src/
│   ├── assets/           # Imágenes, iconos, assets estáticos
│   │   ├── images/
│   │   └── icons/
│   ├── components/       # Componentes React reutilizables
│   │   ├── common/       # Botones, Inputs, Cards
│   │   ├── layout/       # Layout, Navbar, Footer
│   │   ├── products/     # Componentes de productos
│   │   ├── stores/       # Componentes de tiendas
│   │   ├── favorites/    # Componentes de favoritos
│   │   ├── alerts/       # Componentes de alertas
│   │   └── search/       # Búsqueda y filtros
│   ├── pages/            # Páginas principales
│   │   ├── Dashboard.tsx
│   │   ├── ProductDetail.tsx
│   │   ├── StorePage.tsx
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── Profile.tsx
│   │   ├── Favorites.tsx
│   │   ├── SearchResults.tsx
│   │   └── NotFound.tsx
│   ├── routes/           # Configuración de React Router
│   ├── services/         # API services con axios
│   │   ├── api.ts
│   │   ├── authService.ts
│   │   ├── productService.ts
│   │   ├── priceService.ts
│   │   ├── storeService.ts
│   │   ├── alertService.ts
│   │   └── favoriteService.ts
│   ├── store/            # Zustand stores (estado global)
│   │   ├── authStore.ts
│   │   ├── favoritesStore.ts
│   │   ├── searchStore.ts
│   │   ├── alertsStore.ts
│   │   └── uiStore.ts
│   ├── styles/           # Sistema de diseño
│   │   ├── theme.ts          # Colores, tipografía, tokens
│   │   ├── GlobalStyles.ts   # Estilos globales
│   │   ├── animations.ts     # Animaciones y transiciones
│   │   ├── breakpoints.ts    # Media queries
│   │   └── accessibility.ts  # Helpers de accesibilidad
│   ├── types/            # TypeScript types e interfaces
│   │   ├── product.types.ts
│   │   ├── store.types.ts
│   │   ├── price.types.ts
│   │   ├── user.types.ts
│   │   ├── alert.types.ts
│   │   ├── search.types.ts
│   │   ├── notification.types.ts
│   │   └── api.types.ts
│   ├── utils/            # Funciones auxiliares
│   ├── hooks/            # Custom React hooks
│   ├── App.tsx           # Componente raíz
│   └── main.tsx          # Entry point
├── public/               # Assets públicos
├── DEVELOPMENT_PLAN.md   # Plan de desarrollo detallado
├── ROUTES.md            # Documentación de rutas
├── CLAUDE.md            # Especificaciones del proyecto
└── README.md            # Este archivo
```

---

## 🎨 Sistema de Diseño

Prexiopá cuenta con un sistema de diseño completo y profesional:

### Paleta de Colores
- **Primario**: Verde (#00C853) - Confianza y ahorro
- **Secundario**: Azul turquesa (#00BCD4) - Claridad y modernidad
- **Funcionales**: bestPrice, highPrice, discount, favorite
- **100+ tokens** de color con variantes

### Tipografía
- **UI**: Poppins (sans-serif)
- **Precios**: Roboto Mono (monospace)
- **Escala modular**: 12 estilos predefinidos

### Accesibilidad
- ✅ WCAG 2.1 AA compliant
- ✅ Touch targets 44x44px mínimo
- ✅ Contraste de color validado
- ✅ Navegación por teclado
- ✅ Screen reader friendly

Ver [DEVELOPMENT_PLAN.md](DEVELOPMENT_PLAN.md) para detalles completos del sistema de diseño.

---

## 🗺️ Roadmap

### ✅ Fase 0: Configuración Inicial (Completada)
- [x] Setup de React + Vite + TypeScript
- [x] Configuración de Supabase
- [x] Configuración de dependencias principales

### ✅ Fase 1: Fundación y Arquitectura (Completada)
- [x] Sistema de diseño completo con styled-components
- [x] TypeScript types e interfaces
- [x] Estado global (Zustand) - 6 stores implementados
- [x] Servicios API con Supabase
- [x] React Query hooks para data fetching
- [x] Routing con React Router v7
- [x] Todas las páginas base implementadas

### ✅ Fase 2: Esqueleto y Navegación (Completada)
- [x] Componentes comunes completos (Button, Input, Card, Modal, Badge, etc.)
- [x] Layout completo (Navbar responsive, Footer)
- [x] Sistema de notificaciones (react-toastify)
- [x] Loading states (Spinner, Skeleton)
- [x] Error boundaries

### ✅ Fase 3: Features Core (Completada)
- [x] Dashboard funcional con productos reales
- [x] Búsqueda y filtros avanzados (categoría, tienda, precio)
- [x] Escaneo de códigos QR/barras con cámara
- [x] Comparación de precios entre tiendas
- [x] Lista de favoritos con sincronización
- [x] Autenticación con Google OAuth
- [x] Perfil de usuario con datos reales

### ✅ Fase 4: Features Avanzados (Completada)
- [x] Gráficos de historial de precios (Recharts)
- [x] Sistema de alertas de precio funcional
- [x] Autocompletado en búsqueda
- [x] Listas de compras (Shopping Lists)
- [x] ProductCard con favoritos integrados
- [x] Componentes de productos y tiendas

### 🚧 Fase 5: Pulido y Optimización (En Progreso)
- [x] Responsive design mobile-first
- [x] Design system completo
- [ ] Dark mode toggle (tema preparado)
- [ ] Email/Password authentication
- [ ] Protected routes enforcement
- [ ] Performance optimization
- [ ] SEO optimization
- [ ] PWA implementation
- [ ] Testing (unit + integration)
- [ ] Geolocalización de tiendas
- [ ] Compartir productos

Ver [DEVELOPMENT_PLAN.md](DEVELOPMENT_PLAN.md) para el roadmap completo.

---

## 🤝 Contribución

¡Las contribuciones son bienvenidas! Si quieres contribuir:

1. Fork el proyecto
2. Crea tu feature branch (`git checkout -b feat/amazing-feature`)
3. Commit tus cambios usando conventional commits (`git commit -m 'feat: add amazing feature'`)
4. Push al branch (`git push origin feat/amazing-feature`)
5. Abre un Pull Request

### Conventional Commits

Usamos conventional commits para mantener un historial limpio:

- `feat:` - Nueva funcionalidad
- `fix:` - Corrección de bugs
- `docs:` - Cambios en documentación
- `style:` - Cambios de formato (no afectan código)
- `refactor:` - Refactorización de código
- `test:` - Agregar o modificar tests
- `chore:` - Cambios en build o herramientas

---

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

---

## 👨‍💻 Autor

**Renan Diaz**
- GitHub: [@RenanDiaz](https://github.com/RenanDiaz)

---

## 🙏 Agradecimientos

- Comunidad de React y TypeScript
- Equipo de Vite
- Supabase team
- Todos los contribuidores

---

## 📞 Soporte

¿Encontraste un bug o tienes una sugerencia?

- Abre un [issue](https://github.com/RenanDiaz/prexiopa/issues)
- Contacta al equipo de desarrollo

---

<div align="center">
  <strong>Hecho con ❤️ en Panamá 🇵🇦</strong>
  <br>
  <sub>Ayudando a las familias panameñas a ahorrar dinero</sub>
</div>
