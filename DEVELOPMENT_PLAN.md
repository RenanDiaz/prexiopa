# Plan de Desarrollo - Prexiopá

> Web app para buscar, comparar y seguir precios de productos en tiendas de Panamá. Incluye escaneo de códigos QR y de barra para búsqueda rápida.

---

## Checklist de Progreso General

```
Progreso Total: 60% ███████████████████░░░░░░░░░░░░

✅ Fase 0: Configuración Inicial (100%)
✅ Fase 1: Fundación y Arquitectura (100%)
✅ Fase 2: Esqueleto y Navegación (90%)
⏳ Fase 3: Features Core (60%)
⏳ Fase 4: Features Avanzados (10%)
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
npm install @zxing/browser
npm install react-webcam
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
| @zxing/browser | ^0.1.x | Escaneo de QR y códigos de barra |
| react-webcam | ^7.x | Acceso a cámara del dispositivo |

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
│   │   │   │
│   │   │   └── BarcodeScanner/
│   │   │       ├── BarcodeScanner.tsx
│   │   │       └── BarcodeScanner.styles.ts
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

### Filosofía de Diseño

**Prexiopá** es una app de comparación de precios que debe inspirar **confianza, claridad y ahorro**. El diseño debe ser:

- **Escaneable**: Los usuarios deben identificar precios y ofertas rápidamente
- **Confiable**: Colores y tipografía que transmitan seriedad y profesionalismo
- **Accesible**: WCAG 2.1 AA compliance mínimo
- **Mobile-first**: La mayoría de usuarios buscarán precios desde sus celulares
- **Moderno**: Diseño contemporáneo sin ser excesivo o distraer del objetivo

---

### Paleta de Colores Completa

```typescript
// src/styles/theme.ts

export const lightTheme = {
  colors: {
    // Colores Primarios - Verde (Ahorro, Éxito)
    primary: {
      50: '#E8F5E9',    // Backgrounds sutiles, hovers ligeros
      100: '#C8E6C9',   // Badges de ahorro secundarios
      200: '#A5D6A7',   // Estados hover ligeros
      300: '#81C784',   // Elementos decorativos
      400: '#66BB6A',   // Botones secundarios
      500: '#00C853',   // PRIMARY - CTAs principales, éxito
      600: '#00B248',   // Hover de botones primarios
      700: '#009E3D',   // Active state de botones
      800: '#008A32',   // Text en fondos claros
      900: '#007627',   // Máximo contraste
      contrast: '#FFFFFF', // Texto sobre primary
    },

    // Colores Secundarios - Azul Turquesa (Confianza, Tecnología)
    secondary: {
      50: '#E0F7FA',
      100: '#B2EBF2',
      200: '#80DEEA',
      300: '#4DD0E1',
      400: '#26C6DA',
      500: '#00BCD4',   // SECONDARY - Links, elementos informativos
      600: '#00ACC1',
      700: '#0097A7',
      800: '#00838F',
      900: '#006064',
      contrast: '#FFFFFF',
    },

    // Colores Neutrales - Grises (Fondos, Textos, Bordes)
    neutral: {
      0: '#FFFFFF',
      50: '#FAFAFA',    // Background principal
      100: '#F5F5F5',   // Background secundario, cards
      200: '#EEEEEE',   // Borders sutiles
      300: '#E0E0E0',   // Borders, dividers
      400: '#BDBDBD',   // Icons disabled, placeholders
      500: '#9E9E9E',   // Text secondary
      600: '#757575',   // Text secondary más oscuro
      700: '#616161',   // Text primary light
      800: '#424242',   // Text primary
      900: '#212121',   // Headings, texto importante
      1000: '#000000',
    },

    // Colores Semánticos - Estados de la aplicación
    semantic: {
      // Success - Confirmaciones, precios bajos
      success: {
        light: '#81C784',
        main: '#4CAF50',
        dark: '#388E3C',
        contrast: '#FFFFFF',
      },
      // Error - Errores, validaciones fallidas
      error: {
        light: '#E57373',
        main: '#F44336',
        dark: '#D32F2F',
        contrast: '#FFFFFF',
      },
      // Warning - Alertas de precio, stock bajo
      warning: {
        light: '#FFB74D',
        main: '#FF9800',
        dark: '#F57C00',
        contrast: '#000000',
      },
      // Info - Información general, tooltips
      info: {
        light: '#64B5F6',
        main: '#2196F3',
        dark: '#1976D2',
        contrast: '#FFFFFF',
      },
    },

    // Colores Funcionales - Específicos de Prexiopá
    functional: {
      // Precio más bajo - Destacar mejor oferta
      bestPrice: {
        light: '#C8E6C9',
        main: '#00C853',
        dark: '#00A043',
        text: '#FFFFFF',
      },
      // Precio alto - Mostrar precios menos competitivos
      highPrice: {
        light: '#FFCCBC',
        main: '#FF7043',
        dark: '#E64A19',
        text: '#FFFFFF',
      },
      // Descuento - Badges de % de descuento
      discount: {
        light: '#FFF9C4',
        main: '#FBC02D',
        dark: '#F57F17',
        text: '#000000',
      },
      // Favorito - Corazón de favoritos
      favorite: {
        light: '#F8BBD0',
        main: '#E91E63',
        dark: '#C2185B',
        text: '#FFFFFF',
      },
      // Alerta activada
      alert: {
        light: '#BBDEFB',
        main: '#2196F3',
        dark: '#1565C0',
        text: '#FFFFFF',
      },
    },

    // Backgrounds - Fondos de la aplicación
    background: {
      default: '#FAFAFA',       // Background principal de la app
      paper: '#FFFFFF',         // Cards, modals, navbars
      elevated: '#FFFFFF',      // Componentes elevados (z-index alto)
      secondary: '#F5F5F5',     // Secciones alternadas
      disabled: '#F5F5F5',      // Componentes deshabilitados
      overlay: 'rgba(0, 0, 0, 0.5)', // Overlays de modals
    },

    // Text - Colores de texto
    text: {
      primary: '#212121',       // Títulos, texto importante
      secondary: '#616161',     // Texto secundario, descripciones
      disabled: '#9E9E9E',      // Texto deshabilitado
      hint: '#BDBDBD',          // Placeholders, hints
      inverse: '#FFFFFF',       // Texto sobre fondos oscuros
    },

    // Borders - Bordes y dividers
    border: {
      light: '#EEEEEE',         // Borders sutiles
      main: '#E0E0E0',          // Borders estándar
      strong: '#BDBDBD',        // Borders enfatizados
      focus: '#00BCD4',         // Borders en focus
    },
  },
};

// Dark Theme - Para Fase 5
export const darkTheme = {
  colors: {
    primary: {
      ...lightTheme.colors.primary,
      // Ajustar contraste para dark mode
      500: '#00E676',   // Versión más brillante para dark bg
    },

    secondary: {
      ...lightTheme.colors.secondary,
      500: '#18FFFF',
    },

    neutral: {
      0: '#000000',
      50: '#0A0A0A',
      100: '#121212',
      200: '#1E1E1E',
      300: '#2C2C2C',
      400: '#3A3A3A',
      500: '#5C5C5C',
      600: '#7E7E7E',
      700: '#A0A0A0',
      800: '#C2C2C2',
      900: '#E4E4E4',
      1000: '#FFFFFF',
    },

    semantic: {
      success: {
        light: '#66BB6A',
        main: '#4CAF50',
        dark: '#2E7D32',
        contrast: '#FFFFFF',
      },
      error: {
        light: '#EF5350',
        main: '#F44336',
        dark: '#C62828',
        contrast: '#FFFFFF',
      },
      warning: {
        light: '#FFA726',
        main: '#FF9800',
        dark: '#E65100',
        contrast: '#000000',
      },
      info: {
        light: '#42A5F5',
        main: '#2196F3',
        dark: '#1565C0',
        contrast: '#FFFFFF',
      },
    },

    functional: lightTheme.colors.functional,

    background: {
      default: '#0A0A0A',
      paper: '#121212',
      elevated: '#1E1E1E',
      secondary: '#1A1A1A',
      disabled: '#2C2C2C',
      overlay: 'rgba(0, 0, 0, 0.75)',
    },

    text: {
      primary: '#FFFFFF',
      secondary: '#B0B0B0',
      disabled: '#666666',
      hint: '#5C5C5C',
      inverse: '#000000',
    },

    border: {
      light: '#2C2C2C',
      main: '#3A3A3A',
      strong: '#5C5C5C',
      focus: '#18FFFF',
    },
  },
};
```

---

### Tipografía Profesional

```typescript
// src/styles/theme.ts

export const typography = {
  // Familias de fuentes
  fontFamily: {
    primary: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', sans-serif",
    mono: "'Roboto Mono', 'Fira Code', 'Courier New', monospace",
    display: "'Poppins', sans-serif", // Para headings grandes
  },

  // Tamaños de fuente - Escala modular (1.200 ratio)
  fontSize: {
    // Mobile-first sizes
    xs: '0.75rem',      // 12px - Captions, badges pequeños
    sm: '0.875rem',     // 14px - Secondary text, labels
    base: '1rem',       // 16px - Body text (default)
    lg: '1.125rem',     // 18px - Emphasized body text
    xl: '1.25rem',      // 20px - Small headings, card titles
    '2xl': '1.5rem',    // 24px - H3, section titles
    '3xl': '1.875rem',  // 30px - H2, page subtitles
    '4xl': '2.25rem',   // 36px - H1, page titles
    '5xl': '3rem',      // 48px - Hero headlines
    '6xl': '3.75rem',   // 60px - Display text (rarely used)
  },

  // Line heights - Para legibilidad óptima
  lineHeight: {
    tight: 1.2,     // Headings, títulos grandes
    snug: 1.375,    // Subheadings
    normal: 1.5,    // Body text (óptimo para lectura)
    relaxed: 1.625, // Textos largos
    loose: 2,       // Texto muy espaciado (poco uso)
  },

  // Pesos de fuente
  fontWeight: {
    light: 300,     // Texto decorativo, poco uso
    regular: 400,   // Body text default
    medium: 500,    // Emphasized text, labels
    semibold: 600,  // Subheadings, botones
    bold: 700,      // Headings principales
    extrabold: 800, // Display text, muy poco uso
  },

  // Letter spacing - Para mejorar legibilidad
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },

  // Estilos de texto predefinidos - COPY-PASTE READY
  variants: {
    // Headings
    h1: {
      fontSize: '2.25rem',      // 36px mobile
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.025em',
      '@media (min-width: 768px)': {
        fontSize: '3rem',       // 48px desktop
      },
    },
    h2: {
      fontSize: '1.875rem',     // 30px mobile
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.025em',
      '@media (min-width: 768px)': {
        fontSize: '2.25rem',    // 36px desktop
      },
    },
    h3: {
      fontSize: '1.5rem',       // 24px mobile
      fontWeight: 600,
      lineHeight: 1.375,
      letterSpacing: 'normal',
      '@media (min-width: 768px)': {
        fontSize: '1.875rem',   // 30px desktop
      },
    },
    h4: {
      fontSize: '1.25rem',      // 20px
      fontWeight: 600,
      lineHeight: 1.375,
      letterSpacing: 'normal',
    },
    h5: {
      fontSize: '1.125rem',     // 18px
      fontWeight: 600,
      lineHeight: 1.5,
      letterSpacing: 'normal',
    },
    h6: {
      fontSize: '1rem',         // 16px
      fontWeight: 600,
      lineHeight: 1.5,
      letterSpacing: 'normal',
    },

    // Body text
    body1: {
      fontSize: '1rem',         // 16px - Default body
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: 'normal',
    },
    body2: {
      fontSize: '0.875rem',     // 14px - Secondary body
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: 'normal',
    },

    // Specialized text
    subtitle1: {
      fontSize: '1.125rem',     // 18px
      fontWeight: 500,
      lineHeight: 1.5,
      letterSpacing: 'normal',
    },
    subtitle2: {
      fontSize: '1rem',         // 16px
      fontWeight: 500,
      lineHeight: 1.5,
      letterSpacing: 'normal',
    },

    // UI elements
    button: {
      fontSize: '0.875rem',     // 14px
      fontWeight: 600,
      lineHeight: 1,
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
    },
    buttonLarge: {
      fontSize: '1rem',         // 16px
      fontWeight: 600,
      lineHeight: 1,
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
    },
    caption: {
      fontSize: '0.75rem',      // 12px
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: 'normal',
    },
    overline: {
      fontSize: '0.75rem',      // 12px
      fontWeight: 600,
      lineHeight: 1.5,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
    },

    // Prexiopá specific
    price: {
      fontSize: '1.5rem',       // 24px
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.025em',
      fontFamily: "'Roboto Mono', monospace", // Monospace para alineación de precios
    },
    priceSmall: {
      fontSize: '1.125rem',     // 18px
      fontWeight: 600,
      lineHeight: 1.2,
      letterSpacing: '-0.025em',
      fontFamily: "'Roboto Mono', monospace",
    },
    discountBadge: {
      fontSize: '0.875rem',     // 14px
      fontWeight: 700,
      lineHeight: 1,
      letterSpacing: '0.025em',
    },
  },
};
```

---

### Sistema de Espaciado (8px Grid)

```typescript
// src/styles/theme.ts

export const spacing = {
  // Base unit: 4px
  0: '0',
  0.5: '0.125rem',    // 2px - Micro espacios
  1: '0.25rem',       // 4px - xs - Padding mínimo, gaps pequeños
  2: '0.5rem',        // 8px - sm - Padding interno de componentes
  3: '0.75rem',       // 12px - Espacios intermedios
  4: '1rem',          // 16px - md - Padding estándar
  5: '1.25rem',       // 20px - Espacios moderados
  6: '1.5rem',        // 24px - lg - Gaps entre secciones pequeñas
  8: '2rem',          // 32px - xl - Padding de cards, espacios grandes
  10: '2.5rem',       // 40px - Espacios amplios
  12: '3rem',         // 48px - 2xl - Separación de secciones
  16: '4rem',         // 64px - 3xl - Espacios hero, separaciones mayores
  20: '5rem',         // 80px - Espacios muy grandes
  24: '6rem',         // 96px - 4xl - Máximo espaciado
  32: '8rem',         // 128px - Casos excepcionales

  // Semantic spacing - Para consistencia
  component: {
    paddingXs: '0.5rem',    // 8px
    paddingSm: '0.75rem',   // 12px
    paddingMd: '1rem',      // 16px
    paddingLg: '1.5rem',    // 24px
    paddingXl: '2rem',      // 32px
  },

  layout: {
    gapXs: '0.5rem',        // 8px - Entre items muy cercanos
    gapSm: '1rem',          // 16px - Gap estándar de grids
    gapMd: '1.5rem',        // 24px - Gap entre cards
    gapLg: '2rem',          // 32px - Gap entre secciones
    gapXl: '3rem',          // 48px - Gap de layout principal
  },

  section: {
    paddingYSm: '2rem',     // 32px - Padding vertical pequeño
    paddingYMd: '3rem',     // 48px - Padding vertical estándar
    paddingYLg: '4rem',     // 64px - Padding vertical grande
    paddingYXl: '6rem',     // 96px - Padding vertical hero
  },
};
```

---

### Breakpoints (Mobile-First)

```typescript
// src/styles/breakpoints.ts

export const breakpoints = {
  // Valores base
  values: {
    xs: 0,        // Móvil pequeño
    sm: 640,      // Móvil grande
    md: 768,      // Tablet
    lg: 1024,     // Desktop pequeño
    xl: 1280,     // Desktop
    '2xl': 1536,  // Desktop grande
  },

  // Media queries listas para usar
  up: (breakpoint: keyof typeof breakpoints.values) =>
    `@media (min-width: ${breakpoints.values[breakpoint]}px)`,

  down: (breakpoint: keyof typeof breakpoints.values) =>
    `@media (max-width: ${breakpoints.values[breakpoint] - 1}px)`,

  between: (min: keyof typeof breakpoints.values, max: keyof typeof breakpoints.values) =>
    `@media (min-width: ${breakpoints.values[min]}px) and (max-width: ${breakpoints.values[max] - 1}px)`,

  // Helpers específicos - COPY-PASTE READY
  mobile: '@media (max-width: 767px)',
  tablet: '@media (min-width: 768px) and (max-width: 1023px)',
  desktop: '@media (min-width: 1024px)',

  // Touch devices
  touch: '@media (hover: none) and (pointer: coarse)',
  hover: '@media (hover: hover) and (pointer: fine)',
};

// Configuración de contenedores
export const container = {
  maxWidth: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  padding: {
    mobile: '1rem',     // 16px
    tablet: '1.5rem',   // 24px
    desktop: '2rem',    // 32px
  },
};
```

---

### Sistema de Elevación (Sombras)

```typescript
// src/styles/theme.ts

export const shadows = {
  none: 'none',

  // Elevaciones sutiles
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',

  // Sombras de colores para elementos especiales
  primary: '0 4px 12px 0 rgba(0, 200, 83, 0.25)',      // Verde
  secondary: '0 4px 12px 0 rgba(0, 188, 212, 0.25)',   // Azul turquesa
  error: '0 4px 12px 0 rgba(244, 67, 54, 0.25)',
  success: '0 4px 12px 0 rgba(76, 175, 80, 0.25)',

  // Sombras internas
  inset: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  insetLg: 'inset 0 4px 8px 0 rgba(0, 0, 0, 0.1)',

  // Uso específico por componente
  card: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  cardHover: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  modal: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  dropdown: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  navbar: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
};
```

---

### Border Radius

```typescript
// src/styles/theme.ts

export const borderRadius = {
  none: '0',
  xs: '0.125rem',     // 2px - Bordes muy sutiles
  sm: '0.25rem',      // 4px - Inputs pequeños
  base: '0.5rem',     // 8px - Botones, inputs estándar
  md: '0.75rem',      // 12px - Cards medianas
  lg: '1rem',         // 16px - Cards grandes
  xl: '1.25rem',      // 20px - Elementos destacados
  '2xl': '1.5rem',    // 24px - Cards hero
  full: '9999px',     // Pills, avatares

  // Componentes específicos
  button: '0.5rem',   // 8px
  card: '1rem',       // 16px
  input: '0.5rem',    // 8px
  modal: '1rem',      // 16px
  badge: '9999px',    // Full
  chip: '9999px',     // Full
};
```

---

### Animaciones y Transiciones

```typescript
// src/styles/animations.ts

export const transitions = {
  // Duraciones
  duration: {
    fastest: '75ms',
    faster: '100ms',
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    slower: '400ms',
    slowest: '500ms',
  },

  // Easing functions
  easing: {
    // Material Design standard
    standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    // Entrada (elementos apareciendo)
    decelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
    // Salida (elementos desapareciendo)
    accelerate: 'cubic-bezier(0.4, 0.0, 1, 1)',
    // Movimiento enfatizado
    sharp: 'cubic-bezier(0.4, 0.0, 0.6, 1)',
    // Bouncy
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },

  // Transiciones predefinidas
  all: 'all 200ms cubic-bezier(0.4, 0.0, 0.2, 1)',
  color: 'color 200ms cubic-bezier(0.4, 0.0, 0.2, 1)',
  background: 'background-color 200ms cubic-bezier(0.4, 0.0, 0.2, 1)',
  border: 'border-color 200ms cubic-bezier(0.4, 0.0, 0.2, 1)',
  transform: 'transform 200ms cubic-bezier(0.4, 0.0, 0.2, 1)',
  opacity: 'opacity 200ms cubic-bezier(0.4, 0.0, 0.2, 1)',
  shadow: 'box-shadow 200ms cubic-bezier(0.4, 0.0, 0.2, 1)',

  // Combos comunes
  fadeIn: 'opacity 300ms cubic-bezier(0.0, 0.0, 0.2, 1)',
  fadeOut: 'opacity 200ms cubic-bezier(0.4, 0.0, 1, 1)',
  slideUp: 'transform 300ms cubic-bezier(0.0, 0.0, 0.2, 1), opacity 300ms cubic-bezier(0.0, 0.0, 0.2, 1)',
  scaleIn: 'transform 200ms cubic-bezier(0.68, -0.55, 0.265, 1.55), opacity 200ms cubic-bezier(0.4, 0.0, 0.2, 1)',
};

// Keyframe animations
export const keyframes = {
  // Fade animations
  fadeIn: `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `,
  fadeOut: `
    @keyframes fadeOut {
      from { opacity: 1; }
      to { opacity: 0; }
    }
  `,

  // Slide animations
  slideInUp: `
    @keyframes slideInUp {
      from {
        transform: translateY(20px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
  `,
  slideInDown: `
    @keyframes slideInDown {
      from {
        transform: translateY(-20px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
  `,

  // Scale animations
  scaleIn: `
    @keyframes scaleIn {
      from {
        transform: scale(0.9);
        opacity: 0;
      }
      to {
        transform: scale(1);
        opacity: 1;
      }
    }
  `,

  // Bounce animations
  bounce: `
    @keyframes bounce {
      0%, 100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-10px);
      }
    }
  `,

  // Pulse animation
  pulse: `
    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }
  `,

  // Shimmer (skeleton loader)
  shimmer: `
    @keyframes shimmer {
      0% {
        background-position: -1000px 0;
      }
      100% {
        background-position: 1000px 0;
      }
    }
  `,

  // Spin (loaders)
  spin: `
    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }
  `,

  // Prexiopá specific - Price drop notification
  priceDropPulse: `
    @keyframes priceDropPulse {
      0%, 100% {
        transform: scale(1);
        box-shadow: 0 0 0 0 rgba(0, 200, 83, 0.7);
      }
      50% {
        transform: scale(1.05);
        box-shadow: 0 0 0 10px rgba(0, 200, 83, 0);
      }
    }
  `,

  // Favorite heart animation
  heartBeat: `
    @keyframes heartBeat {
      0%, 100% {
        transform: scale(1);
      }
      25% {
        transform: scale(1.3);
      }
      50% {
        transform: scale(1.1);
      }
      75% {
        transform: scale(1.2);
      }
    }
  `,
};
```

---

### Z-Index System

```typescript
// src/styles/theme.ts

export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  notification: 1080,
  max: 9999,
};
```

---

### Componentes Visuales - Design Tokens

```typescript
// src/styles/components.ts

export const components = {
  button: {
    // Tamaños
    size: {
      small: {
        height: '32px',
        padding: '0 12px',
        fontSize: '0.875rem',
      },
      medium: {
        height: '40px',
        padding: '0 16px',
        fontSize: '0.875rem',
      },
      large: {
        height: '48px',
        padding: '0 24px',
        fontSize: '1rem',
      },
    },
    // Variantes ya definidas en tu sistema
  },

  input: {
    height: {
      small: '36px',
      medium: '44px',
      large: '52px',
    },
    padding: '0 12px',
    fontSize: '1rem',
  },

  card: {
    padding: {
      small: '12px',
      medium: '16px',
      large: '24px',
    },
    minHeight: '120px',
  },

  navbar: {
    height: {
      mobile: '56px',
      desktop: '64px',
    },
    zIndex: 1030,
  },

  footer: {
    minHeight: '200px',
    padding: '48px 0',
  },

  // Prexiopá specific components
  productCard: {
    width: {
      mobile: '100%',
      tablet: 'calc(50% - 8px)',
      desktop: 'calc(33.333% - 10.667px)',
    },
    aspectRatio: '3 / 4',
    padding: '16px',
    borderRadius: '16px',
  },

  priceTag: {
    height: '32px',
    padding: '0 12px',
    borderRadius: '9999px',
    fontSize: '0.875rem',
    fontWeight: 700,
  },

  badge: {
    height: '20px',
    padding: '0 8px',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: 600,
  },
};
```

---

### Accesibilidad (WCAG 2.1 AA)

```typescript
// src/styles/accessibility.ts

export const accessibility = {
  // Tamaños mínimos de toque (touch targets)
  touchTarget: {
    minHeight: '44px',    // iOS Human Interface Guidelines
    minWidth: '44px',
    // Android Material Design recomienda 48px, pero 44px es buen compromiso
  },

  // Contraste de colores
  contrast: {
    // WCAG AA requiere:
    // - 4.5:1 para texto normal
    // - 3:1 para texto grande (18px+ o 14px+ bold)
    // - 3:1 para componentes UI y gráficos

    // Nuestros colores cumplen:
    textOnWhite: {
      primary: '#212121',     // 16.1:1 ✓
      secondary: '#616161',   // 7.0:1 ✓
      disabled: '#9E9E9E',    // 2.8:1 (solo para disabled, aceptable)
    },
    textOnPrimary: {
      text: '#FFFFFF',        // 3.9:1 con #00C853 (aceptable para grande)
    },
  },

  // Focus visible
  focusRing: {
    outline: '2px solid',
    outlineColor: '#00BCD4',  // Secondary color
    outlineOffset: '2px',
    borderRadius: '4px',
  },

  // Skip links (para navegación por teclado)
  skipLink: {
    position: 'absolute',
    top: '-40px',
    left: '0',
    background: '#000',
    color: '#fff',
    padding: '8px',
    textDecoration: 'none',
    zIndex: 100,
    // Aparece al hacer focus
    '&:focus': {
      top: '0',
    },
  },

  // Screen reader only (sr-only)
  visuallyHidden: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: '0',
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    borderWidth: '0',
  },
};

// ARIA Labels recomendados
export const ariaLabels = {
  navbar: 'Navegación principal',
  searchBar: 'Buscar productos',
  filterSidebar: 'Filtros de búsqueda',
  productCard: 'Tarjeta de producto',
  priceComparison: 'Comparación de precios',
  favoriteButton: 'Agregar a favoritos',
  alertButton: 'Crear alerta de precio',
  // etc.
};
```

---

### Uso del Sistema de Diseño

#### Ejemplo: Button Component

```typescript
// src/components/common/Button/Button.styles.ts
import styled, { css } from 'styled-components';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outlined' | 'text';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
}

export const StyledButton = styled.button<ButtonProps>`
  /* Reset */
  border: none;
  cursor: pointer;
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  border-radius: ${({ theme }) => theme.borderRadius.button};
  transition: ${({ theme }) => theme.transitions.all};

  /* Sizes */
  ${({ size = 'medium', theme }) => css`
    height: ${theme.components.button.size[size].height};
    padding: ${theme.components.button.size[size].padding};
    font-size: ${theme.components.button.size[size].fontSize};
  `}

  /* Full width */
  ${({ fullWidth }) => fullWidth && css`
    width: 100%;
  `}

  /* Variants */
  ${({ variant = 'primary', theme }) => {
    switch (variant) {
      case 'primary':
        return css`
          background-color: ${theme.colors.primary[500]};
          color: ${theme.colors.primary.contrast};

          &:hover:not(:disabled) {
            background-color: ${theme.colors.primary[600]};
            box-shadow: ${theme.shadows.primary};
          }

          &:active:not(:disabled) {
            background-color: ${theme.colors.primary[700]};
          }
        `;

      case 'secondary':
        return css`
          background-color: ${theme.colors.secondary[500]};
          color: ${theme.colors.secondary.contrast};

          &:hover:not(:disabled) {
            background-color: ${theme.colors.secondary[600]};
            box-shadow: ${theme.shadows.secondary};
          }
        `;

      case 'outlined':
        return css`
          background-color: transparent;
          color: ${theme.colors.primary[500]};
          border: 2px solid ${theme.colors.primary[500]};

          &:hover:not(:disabled) {
            background-color: ${theme.colors.primary[50]};
          }
        `;

      case 'text':
        return css`
          background-color: transparent;
          color: ${theme.colors.primary[500]};

          &:hover:not(:disabled) {
            background-color: ${theme.colors.primary[50]};
          }
        `;
    }
  }}

  /* Disabled state */
  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
    background-color: ${({ theme }) => theme.colors.neutral[300]};
    color: ${({ theme }) => theme.colors.text.disabled};
  }

  /* Focus state (accessibility) */
  &:focus-visible {
    outline: ${({ theme }) => theme.accessibility.focusRing.outline};
    outline-color: ${({ theme }) => theme.accessibility.focusRing.outlineColor};
    outline-offset: ${({ theme }) => theme.accessibility.focusRing.outlineOffset};
  }
`;
```

#### Ejemplo: ProductCard Component

```typescript
// src/components/product/ProductCard/ProductCard.styles.ts
import styled from 'styled-components';

export const Card = styled.article`
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.card};
  padding: ${({ theme }) => theme.components.productCard.padding};
  box-shadow: ${({ theme }) => theme.shadows.card};
  transition: ${({ theme }) => theme.transitions.shadow};
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[3]};

  &:hover {
    box-shadow: ${({ theme }) => theme.shadows.cardHover};
    transform: translateY(-2px);
  }

  &:focus-within {
    outline: ${({ theme }) => theme.accessibility.focusRing.outline};
    outline-color: ${({ theme }) => theme.accessibility.focusRing.outlineColor};
  }
`;

export const ImageContainer = styled.div`
  aspect-ratio: 1;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  overflow: hidden;
  background: ${({ theme }) => theme.colors.neutral[100]};
`;

export const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

export const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
`;

export const Title = styled.h3`
  ${({ theme }) => theme.typography.variants.h5};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;

  /* Truncate after 2 lines */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

export const Description = styled.p`
  ${({ theme }) => theme.typography.variants.body2};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0;

  /* Truncate after 3 lines */
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

export const PriceContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
`;

export const Price = styled.span`
  ${({ theme }) => theme.typography.variants.price};
  color: ${({ theme }) => theme.colors.functional.bestPrice.main};
`;

export const DiscountBadge = styled.span`
  ${({ theme }) => theme.typography.variants.discountBadge};
  background: ${({ theme }) => theme.colors.functional.discount.main};
  color: ${({ theme }) => theme.colors.functional.discount.text};
  padding: ${({ theme }) => theme.spacing[1]} ${({ theme }) => theme.spacing[2]};
  border-radius: ${({ theme }) => theme.borderRadius.badge};
  animation: ${({ theme }) => theme.keyframes.priceDropPulse} 2s ease-in-out infinite;
`;
```

---

### Google Fonts Setup

```html
<!-- public/index.html -->
<head>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=Roboto+Mono:wght@400;600;700&display=swap" rel="stylesheet">
</head>
```

---

### Checklist de Implementación de Estilos

- [ ] Importar Google Fonts (Poppins + Roboto Mono)
- [ ] Crear `src/styles/theme.ts` con todos los tokens de diseño
- [ ] Crear `src/styles/animations.ts` con keyframes y transiciones
- [ ] Crear `src/styles/breakpoints.ts` con media queries
- [ ] Crear `src/styles/accessibility.ts` con helpers de accesibilidad
- [ ] Crear `src/styles/GlobalStyles.ts` con reset CSS
- [ ] Configurar ThemeProvider en `main.tsx`
- [ ] Implementar dark mode toggle (Fase 5)
- [ ] Validar contraste de colores con herramientas WCAG
- [ ] Probar navegación por teclado en todos los componentes
- [ ] Validar touch targets en dispositivos móviles

---

### Recursos y Herramientas Recomendadas

**Contraste de Colores:**
- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
- Coolors Contrast Checker: https://coolors.co/contrast-checker

**Paletas de Colores:**
- Realtime Colors: https://realtimecolors.com/
- Coolors: https://coolors.co/

**Tipografía:**
- Type Scale: https://typescale.com/
- Modular Scale: https://www.modularscale.com/

**Iconos:**
- React Icons: https://react-icons.github.io/react-icons/
- Heroicons: https://heroicons.com/

**Inspiración de UI:**
- Dribbble: https://dribbble.com/tags/price-comparison
- Mobbin: https://mobbin.com/ (apps móviles)

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

**Estado:** Completado
**Duración Estimada:** 4-6 horas
**Prioridad:** Alta

### Objetivos
Establecer la arquitectura base del proyecto: sistema de estilos, estado global, rutas y estructura de carpetas.

### Tareas

#### 1.1 Sistema de Estilos y Tema
- ✅ Instalar styled-components y tipos
  ```bash
  npm install styled-components
  npm install -D @types/styled-components
  ```
- ✅ Crear `src/styles/theme.ts` con colores, tipografía, espaciado (usar guía completa arriba)
- ✅ Crear `src/styles/GlobalStyles.ts` con reset CSS y estilos globales
- ✅ Crear `src/styles/breakpoints.ts` para responsive
- ✅ Crear `src/styles/animations.ts` con transiciones comunes
- ✅ Crear `src/styles/accessibility.ts` con helpers WCAG
- ✅ Añadir Google Fonts (Poppins + Roboto Mono) en `index.html`
- ✅ Aplicar ThemeProvider en `main.tsx`

#### 1.2 Estado Global (Zustand)
- ✅ Instalar zustand
  ```bash
  npm install zustand
  ```
- ✅ Crear `src/store/useAuthStore.ts`
  - Estado: user, isAuthenticated, isLoading
  - Acciones: login, logout, register, updateUser
- ✅ Crear `src/store/useFavoritesStore.ts`
  - Estado: favorites (array de product IDs)
  - Acciones: addFavorite, removeFavorite, loadFavorites
- ✅ Crear `src/store/useSearchStore.ts`
  - Estado: query, filters (category, store, priceRange), sortBy
  - Acciones: setQuery, setFilters, clearFilters, setSortBy
- ✅ Crear `src/store/useUIStore.ts`
  - Estado: sidebarOpen, modalOpen, theme (light/dark)
  - Acciones: toggleSidebar, openModal, closeModal, toggleTheme

#### 1.3 Tipos de TypeScript
- ✅ Crear `src/types/product.types.ts`
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
- ✅ Crear `src/types/store.types.ts`
  ```typescript
  export interface Store {
    id: string;
    name: string;
    logo: string;
    website?: string;
    locations?: string[];
  }
  ```
- ✅ Crear `src/types/user.types.ts`
- ✅ Crear `src/types/api.types.ts` para respuestas de API

#### 1.4 Estructura de Carpetas
- ✅ Crear todas las carpetas según estructura definida
- ✅ Crear archivos `.gitkeep` en carpetas vacías
- ✅ Actualizar `.gitignore` si es necesario

#### 1.5 Configuración de React Router
- ✅ Instalar react-router-dom
  ```bash
  npm install react-router-dom
  ```
- ✅ Crear `src/routes/AppRoutes.tsx` con BrowserRouter y rutas básicas
- ✅ Crear `src/routes/ProtectedRoute.tsx` (wrapper para rutas autenticadas)
- ✅ Crear `src/routes/PublicRoute.tsx` (wrapper para login/registro)

### Criterios de Completado
- ✅ Tema aplicado globalmente con ThemeProvider
- ✅ Stores de Zustand funcionando con persist
- ✅ Tipos definidos y exportados correctamente
- ✅ Navegación básica funcionando con React Router
- ✅ Todas las carpetas creadas según estructura

### Tecnologías
- styled-components, zustand, react-router-dom, TypeScript

---

## Fase 2: Esqueleto y Navegación

**Estado:** Casi Completado (90%)
**Duración Estimada:** 6-8 horas
**Prioridad:** Alta
**Dependencias:** Fase 1

### Objetivos
Crear el layout principal, navegación y páginas esqueleto sin funcionalidad completa.

### Tareas

#### 2.1 Layout Components
- ✅ Crear `Navbar` component
  - Logo
  - Barra de búsqueda (placeholder)
  - Links: Dashboard, Tiendas, Favoritos
  - Avatar/menú de usuario
  - Responsive (hamburger menu en mobile)
- ✅ Crear `Footer` component
  - Links útiles
  - Copyright
  - Redes sociales (icons)
- ✅ Crear `Sidebar` component (opcional, para filtros)
  - Categorías
  - Rangos de precio
  - Tiendas
  - Botón "Aplicar Filtros"

#### 2.2 Common Components
- ✅ Crear `Button` component
  - Variantes: primary, secondary, outlined, text
  - Tamaños: small, medium, large
  - Estados: default, hover, active, disabled
- ✅ Crear `Input` component
  - Variantes: text, email, password, number
  - Con/sin icon
  - Estados de validación
- ✅ Crear `Modal` component
  - Backdrop
  - Animación de entrada/salida
  - Botón de cerrar
- ✅ Crear `Loader` component
  - Spinner animado con colores del tema
- ✅ Crear `Badge` component
  - Para mostrar descuentos, ofertas, etc.

#### 2.3 Páginas Esqueleto
- ✅ Refactorizar `Login.tsx` y `Register.tsx`
  - Usar componentes Button e Input
  - Aplicar estilos del tema
  - Integrar con useAuthStore
- ✅ Crear `Dashboard.tsx`
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
- ✅ Configurar todas las rutas en `AppRoutes.tsx`
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
- ✅ Implementar lógica de ProtectedRoute
  - Redirigir a /login si no autenticado
- ✅ Implementar lógica de PublicRoute
  - Redirigir a / si ya autenticado
- ✅ Añadir loading state durante verificación de auth

#### 2.5 Notificaciones Toast
- ✅ Instalar react-toastify
  ```bash
  npm install react-toastify
  ```
- ✅ Configurar ToastContainer en `App.tsx`
- ✅ Personalizar estilos según tema
- ✅ Crear helper `src/utils/toast.ts` para notificaciones comunes

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

**Estado:** Completado (100%)
**Duración Estimada:** 10-12 horas
**Prioridad:** Alta
**Dependencias:** Fase 2

### Objetivos
Implementar las funcionalidades principales: búsqueda de productos (incluyendo escaneo de códigos QR y de barra), comparación de precios, favoritos y sistema de datos.

### Tareas

#### 3.1 Configuración de Servicios
- ✅ Instalar axios
  ```bash
  npm install axios
  ```
- ✅ Crear `src/services/api/client.ts`
  - Instancia de axios con baseURL
  - Interceptores para auth token
  - Manejo de errores global
- ✅ Crear servicios Supabase:
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
- ✅ Instalar @tanstack/react-query
  ```bash
  npm install @tanstack/react-query
  ```
- ✅ Configurar QueryClient en `main.tsx`
- ✅ Crear hooks personalizados:
  - `src/hooks/useProducts.ts`
    - useProductsQuery(filters)
    - useProductQuery(id)
    - useProductPricesQuery(productId)
  - `src/hooks/useFavorites.ts`
    - useFavoritesQuery()
    - useAddFavoriteMutation()
    - useRemoveFavoriteMutation()

#### 3.3 Componentes de Producto
- ✅ Crear `ProductCard` component
  - Imagen del producto
  - Nombre y descripción corta
  - Precio más bajo encontrado
  - Badge de descuento si aplica
  - Botón de favorito (corazón)
  - Click para ir a detalle
- ✅ Crear `ProductList` component
  - Grid responsive de ProductCards
  - Loader mientras carga
  - Estado vacío si no hay resultados
- ✅ Crear `ProductDetail` component
  - Imagen grande
  - Descripción completa
  - Categoría y marca
  - Botón de favorito
- ✅ Crear `PriceComparison` component
  - Tabla/cards con precios por tienda
  - Indicador de mejor precio
  - Links a tiendas
  - Estado de disponibilidad

#### 3.4 Búsqueda y Filtros
- ✅ Crear `SearchBar` component
  - Input con icono de búsqueda
  - Debounce en el input
  - Integrar con useSearchStore
- ✅ Crear `SearchFilters` component
  - Filtro por categoría (dropdown/chips)
  - Filtro por tienda (checkboxes)
  - Filtro por rango de precio (slider)
  - Botón "Limpiar filtros"
  - Integrar con useSearchStore
- ✅ Implementar lógica de búsqueda en Dashboard
  - Conectar SearchBar con useProducts
  - Mostrar resultados filtrados
- ✅ Crear `BarcodeScanner` component
  - Acceso a cámara del dispositivo
  - Escaneo de códigos QR y de barra (EAN-13, UPC-A, Code-128, etc.)
  - UI de feedback durante escaneo (overlay, guías visuales)
  - Manejo de permisos de cámara
  - Toggle para cambiar entre cámara frontal/trasera
  - Botón para cerrar scanner
  - Validación de códigos escaneados
  - Integración con búsqueda de productos
  - Estados de error (código no encontrado, sin permisos, cámara no disponible)
  - Animación de éxito cuando detecta un código
- ✅ Integrar BarcodeScanner en SearchBar
  - Botón/icono de scanner junto al input de búsqueda
  - Modal o fullscreen overlay para el scanner
  - Cerrar automáticamente al escanear código válido
  - Buscar producto por código escaneado
- ✅ Crear servicio para búsqueda por código de barra
  - Función en products.ts: getProductByBarcode(code)
  - Manejo de múltiples formatos de códigos
  - Fallback si código no existe en BD

  - Loading states

#### 3.5 Sistema de Favoritos
- ✅ Crear `FavoriteButton` component
  - Icono de corazón (vacío/lleno)
  - Animación al hacer click
  - Integrar con useFavoritesStore
  - Mutation para agregar/quitar
- ✅ Crear `FavoritesList` component
  - Grid de ProductCards favoritos
  - Mensaje si no hay favoritos
  - Integrar con useFavoritesQuery
- ✅ Implementar página Favorites
  - Usar FavoritesList
  - Botón para limpiar todos

#### 3.6 Datos Mock / Supabase
- ✅ Crear tablas en Supabase:
  - `products` (id, name, description, image, category, brand)
  - `stores` (id, name, logo, website)
  - `prices` (id, product_id, store_id, price, date, in_stock)
  - `favorites` (id, user_id, product_id)
- [ ] Insertar datos de prueba (10-20 productos, 5 tiendas)
- ✅ Configurar RLS (Row Level Security) en Supabase

### Criterios de Completado
- ✅ Búsqueda de productos funciona correctamente
- ✅ Filtros aplican y muestran resultados correctos
- ✅ Comparación de precios visible en página de producto
- ✅ Sistema de favoritos funciona (agregar, quitar, listar)
- ✅ Datos de Supabase se muestran correctamente
- ✅ Loading y error states implementados

### Tecnologías
- axios, @tanstack/react-query, Supabase, zustand

---

**Estado:** En progreso (10%)
**Duración Estimada:** 8-10 horas
**Prioridad:** Media
**Dependencias:** Fase 3

### Objetivos
Implementar gráficos de historial de precios, alertas, autocompletado y mejoras UX.

### Tareas

#### 4.1 Gráficos de Precios
- ✅ Instalar recharts
  ```bash
  npm install recharts
  npm install -D @types/recharts
npm install @zxing/browser
npm install react-webcam
  ```
- ✅ Crear `PriceHistoryChart` component
  - LineChart con precio por fecha
  - Múltiples líneas para diferentes tiendas
  - Tooltip con info detallada
  - Responsive
  - Colores según tema
- [ ] Añadir datos de historial a tabla `prices` (registros con diferentes fechas)
- ✅ Integrar gráfico en ProductPage

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
- ✅ Crear `SearchAutocomplete` component
  - Dropdown con sugerencias
  - Highlight del texto buscado
  - Navegación con teclado (flechas, enter)
  - Click en sugerencia redirige a producto
- ✅ Implementar lógica de autocompletado
  - Query a Supabase con ILIKE
  - Debounce de 300ms
  - Máximo 10 resultados
- ✅ Integrar en `SearchBar`

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

#### 4.6 Registro de Compras y Precios 🛒 **[FEATURE CORE]**
**Motivación:** Permitir a los usuarios contribuir precios mientras compran, creando una base de datos colaborativa.

- [ ] Crear tabla `shopping_sessions` en Supabase
  - id, user_id, store_id, date, total, status (in_progress, completed), created_at
- [ ] Crear tabla `shopping_items` en Supabase
  - id, session_id, product_id, price, quantity, unit, created_at
- [ ] Crear `ShoppingSession` component
  - Header con tienda seleccionada y total acumulado
  - Botón para cambiar tienda
  - Estado: "En progreso" / "Completada"
- [ ] Crear `AddProductToCart` component
  - Búsqueda/escaneo de producto
  - Input de precio
  - Input de cantidad y unidad
  - Botón "Agregar al carrito"
- [ ] Crear `ShoppingCartItem` component
  - Producto con precio ingresado
  - Botón para editar/eliminar
  - Indicador de diferencia de precio vs último registrado
- [ ] Crear `ReceiptScanner` component (opcional)
  - Upload de foto de factura
  - OCR para extraer productos y precios automáticamente
  - Revisión manual antes de guardar
- [ ] Crear `ShoppingHistory` component
  - Lista de compras pasadas
  - Ver detalle de cada compra
  - Comparar precios entre compras
- [ ] Implementar flujos:
  - **Mientras compro**: Agregar productos uno por uno en tiempo real
  - **Después de comprar**: Subir factura o ingresar productos manualmente
- [ ] Integrar en página `/shopping` o `/my-shopping`
- [ ] Actualizar tabla `prices` con datos de shopping_items al completar sesión

**Beneficios:**
- Crowdsourcing de precios en tiempo real
- Usuarios ven cuánto les va a costar la compra
- Gamificación: puntos por contribuir precios

#### 4.7 Calculadora de Precio por Unidad 📊 **[FEATURE CORE]**
**Motivación:** Comparar presentaciones diferentes del mismo producto (ej: cereal 490g vs 370g).

- [ ] Crear `UnitPriceCalculator` component
  - Grid responsive para múltiples entradas
  - Cada fila tiene: Nombre/Label, Precio, Cantidad, Unidad
  - Campos calculados: Precio por unidad, Unidades por dólar
  - Botón "Agregar otro" para comparar más
  - Botón "Limpiar todo"
- [ ] Crear `UnitPriceRow` component
  - 3 inputs: precio, cantidad, precio por unidad
  - Lógica: completar 2 de 3 campos, calcular el tercero
  - Dropdown para unidad: g, kg, ml, L, lb, oz
  - Indicador visual del mejor precio (verde)
  - Indicador del peor precio (rojo/amarillo)
- [ ] Crear `UnitComparison` component
  - Tabla comparativa visual
  - Barra de progreso para precio por unidad
  - Porcentaje de diferencia vs el más barato
  - Ordenar por mejor precio
- [ ] Implementar lógica de conversión de unidades
  - g ↔ kg, ml ↔ L, lb ↔ oz
  - Normalización a unidad estándar
- [ ] Crear página `/calculator` o integrar en ProductDetail
- [ ] Guardar comparaciones en localStorage
  - Historial de comparaciones recientes
  - Botón "Guardar comparación"
- [ ] (Opcional) Integrar con productos reales
  - Autocompletar con presentaciones existentes del producto
  - Mostrar datos históricos

**Ejemplos de uso:**
```
Cereal Brand X:
  1. $5.20 / 490g = $10.61/kg → $0.094 por gramo
  2. $4.50 / 370g = $12.16/kg → $0.082 por gramo ✅ Mejor

Resultado: La presentación de $4.50 es 12% más económica por gramo
```

#### 4.8 Página de Tienda Completa
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
- [ ] Aplicar `darkTheme` ya definido en guía de estilos
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
   - Crear sistema de estilos completo (usar guía actualizada)
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
**Versión del plan:** 2.0
**Estado general:** En planificación

---

¿Listo para comenzar? Empieza con la **Fase 1: Fundación y Arquitectura**
