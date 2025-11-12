/**
 * Sistema de Accesibilidad de Prexiopá
 * WCAG 2.1 AA Compliance
 */

// ============================================
// TOUCH TARGETS
// ============================================

/**
 * Tamaños mínimos de toque según guías de accesibilidad
 * iOS HIG: 44x44px
 * Android Material: 48x48px
 * Usamos 44px como compromiso
 */
export const touchTarget = {
  minHeight: '44px',
  minWidth: '44px',
  // Padding recomendado si el elemento visual es más pequeño
  padding: '12px',
} as const;

/**
 * Estilos para touch targets accesibles
 */
export const accessibleTouchTarget = `
  min-width: ${touchTarget.minWidth};
  min-height: ${touchTarget.minHeight};
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

// ============================================
// FOCUS STYLES
// ============================================

/**
 * Anillo de foco visible (WCAG 2.4.7)
 */
export const focusRing = {
  outline: '2px solid',
  outlineColor: '#00BCD4', // Secondary color (turquesa)
  outlineOffset: '2px',
  borderRadius: '4px',
} as const;

/**
 * Estilos de foco para elementos interactivos
 */
export const focusVisible = `
  &:focus {
    outline: none;
  }

  &:focus-visible {
    outline: ${focusRing.outline};
    outline-color: ${focusRing.outlineColor};
    outline-offset: ${focusRing.outlineOffset};
    border-radius: ${focusRing.borderRadius};
  }
`;

/**
 * Focus ring con color personalizado
 */
export const customFocusRing = (color: string) => `
  &:focus {
    outline: none;
  }

  &:focus-visible {
    outline: ${focusRing.outline};
    outline-color: ${color};
    outline-offset: ${focusRing.outlineOffset};
    border-radius: ${focusRing.borderRadius};
  }
`;

/**
 * Focus interno (para inputs y similar)
 */
export const focusInset = `
  &:focus {
    outline: none;
  }

  &:focus-visible {
    outline: ${focusRing.outline};
    outline-color: ${focusRing.outlineColor};
    outline-offset: -2px;
  }
`;

// ============================================
// SCREEN READER ONLY
// ============================================

/**
 * Ocultar visualmente pero mantener accesible para lectores de pantalla
 * (WCAG 2.4.1 - Bypass Blocks)
 */
export const visuallyHidden = {
  position: 'absolute' as const,
  width: '1px',
  height: '1px',
  padding: '0',
  margin: '-1px',
  overflow: 'hidden' as const,
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap' as const,
  borderWidth: '0',
};

/**
 * CSS string para sr-only
 */
export const srOnly = `
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
`;

/**
 * Revertir sr-only (útil para hacer visible en focus)
 */
export const srOnlyFocusable = `
  ${srOnly}

  &:focus {
    position: static;
    width: auto;
    height: auto;
    padding: inherit;
    margin: inherit;
    overflow: visible;
    clip: auto;
    white-space: normal;
  }
`;

// ============================================
// SKIP LINKS
// ============================================

/**
 * Skip link para navegación por teclado (WCAG 2.4.1)
 */
export const skipLink = {
  position: 'absolute' as const,
  top: '-40px',
  left: '0',
  background: '#000',
  color: '#fff',
  padding: '8px',
  textDecoration: 'none' as const,
  zIndex: 100,
  borderRadius: '0 0 4px 0',
  transition: 'top 0.2s ease',
} as const;

/**
 * CSS string para skip link
 */
export const skipLinkStyles = `
  position: absolute;
  top: -40px;
  left: 0;
  background: #000;
  color: #fff;
  padding: 8px 16px;
  text-decoration: none;
  z-index: 100;
  border-radius: 0 0 4px 0;
  transition: top 0.2s ease;
  font-weight: 600;

  &:focus {
    top: 0;
    outline: 2px solid #00BCD4;
    outline-offset: 2px;
  }
`;

// ============================================
// COLOR CONTRAST
// ============================================

/**
 * Contraste de colores que cumplen WCAG AA
 * Ratio mínimo: 4.5:1 para texto normal, 3:1 para texto grande
 */
export const contrast = {
  // Texto sobre fondo blanco
  textOnWhite: {
    primary: '#212121', // 16.1:1 ✓
    secondary: '#616161', // 7.0:1 ✓
    disabled: '#9E9E9E', // 2.8:1 (solo para disabled)
  },
  // Texto sobre fondo primary verde
  textOnPrimary: {
    text: '#FFFFFF', // ~3.9:1 (aceptable para texto grande/bold)
  },
  // Texto sobre fondo secondary turquesa
  textOnSecondary: {
    text: '#FFFFFF', // ~3.7:1 (aceptable para texto grande/bold)
  },
  // Texto sobre fondos oscuros
  textOnDark: {
    primary: '#FFFFFF',
    secondary: '#E0E0E0',
  },
} as const;

// ============================================
// REDUCED MOTION
// ============================================

/**
 * Respeta preferencia de usuario para animaciones reducidas
 * (WCAG 2.3.3 - Animation from Interactions)
 */
export const reducedMotion = `
  @media (prefers-reduced-motion: reduce) {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
`;

/**
 * Helper para deshabilitar animaciones si el usuario lo prefiere
 */
export const respectReducedMotion = (animation: string) => `
  animation: ${animation};

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

// ============================================
// ARIA LABELS
// ============================================

/**
 * Labels ARIA recomendados para componentes de Prexiopá
 */
export const ariaLabels = {
  // Navegación
  navbar: 'Navegación principal',
  footer: 'Pie de página',
  sidebar: 'Barra lateral',
  breadcrumb: 'Ruta de navegación',

  // Búsqueda
  searchBar: 'Buscar productos',
  searchInput: 'Campo de búsqueda',
  searchButton: 'Buscar',
  searchResults: 'Resultados de búsqueda',
  filterSidebar: 'Filtros de búsqueda',
  clearFilters: 'Limpiar filtros',

  // Productos
  productCard: 'Tarjeta de producto',
  productList: 'Lista de productos',
  productDetail: 'Detalles del producto',
  priceComparison: 'Comparación de precios',
  priceHistory: 'Historial de precios',

  // Interacciones
  favoriteButton: 'Agregar a favoritos',
  favoriteButtonActive: 'Quitar de favoritos',
  alertButton: 'Crear alerta de precio',
  shareButton: 'Compartir producto',
  closeButton: 'Cerrar',
  menuButton: 'Menú',
  backButton: 'Volver',

  // Formularios
  loginForm: 'Formulario de inicio de sesión',
  registerForm: 'Formulario de registro',
  emailInput: 'Correo electrónico',
  passwordInput: 'Contraseña',
  submitButton: 'Enviar',

  // Estados
  loading: 'Cargando...',
  error: 'Error',
  success: 'Éxito',
  noResults: 'No se encontraron resultados',
} as const;

// ============================================
// LANDMARKS
// ============================================

/**
 * Roles ARIA para landmarks (WCAG 2.4.1)
 */
export const landmarks = {
  banner: 'banner', // Header principal
  navigation: 'navigation', // Navegación
  main: 'main', // Contenido principal
  complementary: 'complementary', // Sidebar
  contentinfo: 'contentinfo', // Footer
  search: 'search', // Formulario de búsqueda
  form: 'form', // Formularios
  region: 'region', // Secciones importantes
} as const;

// ============================================
// KEYBOARD NAVIGATION
// ============================================

/**
 * Key codes para navegación por teclado
 */
export const keyCodes = {
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  TAB: 'Tab',
  HOME: 'Home',
  END: 'End',
  PAGE_UP: 'PageUp',
  PAGE_DOWN: 'PageDown',
} as const;

/**
 * Helper para manejar navegación con teclado
 */
export const handleKeyboardNavigation = (
  event: KeyboardEvent,
  handlers: Partial<Record<keyof typeof keyCodes, () => void>>
) => {
  const handler = handlers[event.key as keyof typeof keyCodes];
  if (handler) {
    event.preventDefault();
    handler();
  }
};

// ============================================
// SEMANTIC HTML HELPERS
// ============================================

/**
 * Guía de uso de HTML semántico
 */
export const semanticGuide = {
  // Usar estos elementos para mejor accesibilidad
  structure: {
    header: 'Para encabezados de página o sección',
    nav: 'Para navegación principal',
    main: 'Para contenido principal (uno por página)',
    article: 'Para contenido independiente (productos, posts)',
    section: 'Para secciones temáticas',
    aside: 'Para contenido relacionado (sidebar)',
    footer: 'Para pie de página',
  },
  text: {
    h1: 'Un solo h1 por página (título principal)',
    h2: 'Títulos de sección',
    h3: 'Sub-títulos',
    p: 'Párrafos de texto',
    strong: 'Texto importante',
    em: 'Énfasis en texto',
  },
  interactive: {
    button: 'Para acciones (submit, click, toggle)',
    a: 'Para navegación (links)',
    form: 'Para formularios',
    label: 'Siempre con inputs',
  },
} as const;

// ============================================
// ACCESSIBILITY CHECKLIST
// ============================================

/**
 * Checklist de accesibilidad para componentes
 */
export const a11yChecklist = {
  general: [
    'Contraste de colores cumple WCAG AA (4.5:1)',
    'Touch targets mínimo 44x44px',
    'Focus visible en todos los elementos interactivos',
    'Navegación por teclado funcional',
    'HTML semántico utilizado',
    'Landmarks ARIA correctos',
  ],
  forms: [
    'Labels asociados a todos los inputs',
    'Mensajes de error descriptivos',
    'Instrucciones claras',
    'Validación accesible',
    'Focus en primer error',
  ],
  images: [
    'Alt text descriptivo',
    'Decorativas con alt=""',
    'Imágenes complejas con descripción extendida',
  ],
  navigation: [
    'Skip links presentes',
    'Breadcrumbs con aria-label',
    'Current page indicada',
    'Menú navegable por teclado',
  ],
  dynamic: [
    'ARIA live regions para cambios',
    'Loading states anunciados',
    'Errores anunciados',
    'Modals con focus trap',
  ],
} as const;

// ============================================
// EXPORT
// ============================================

export default {
  touchTarget,
  accessibleTouchTarget,
  focusRing,
  focusVisible,
  customFocusRing,
  focusInset,
  visuallyHidden,
  srOnly,
  srOnlyFocusable,
  skipLink,
  skipLinkStyles,
  contrast,
  reducedMotion,
  respectReducedMotion,
  ariaLabels,
  landmarks,
  keyCodes,
  handleKeyboardNavigation,
  semanticGuide,
  a11yChecklist,
};
