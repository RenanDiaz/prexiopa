/**
 * Sistema de Tema de Prexiopá
 * Tokens de diseño completos: colores, tipografía, espaciado, elevación, etc.
 */

// ============================================
// COLORES
// ============================================

export const lightTheme = {
  colors: {
    // Colores Primarios - Verde (Ahorro, Éxito)
    primary: {
      50: '#E8F5E9',
      100: '#C8E6C9',
      200: '#A5D6A7',
      300: '#81C784',
      400: '#66BB6A',
      500: '#00C853', // PRIMARY - CTAs principales, éxito
      600: '#00B248',
      700: '#009E3D',
      800: '#008A32',
      900: '#007627',
      contrast: '#FFFFFF',
    },

    // Colores Secundarios - Azul Turquesa (Confianza, Tecnología)
    secondary: {
      50: '#E0F7FA',
      100: '#B2EBF2',
      200: '#80DEEA',
      300: '#4DD0E1',
      400: '#26C6DA',
      500: '#00BCD4', // SECONDARY - Links, elementos informativos
      600: '#00ACC1',
      700: '#0097A7',
      800: '#00838F',
      900: '#006064',
      contrast: '#FFFFFF',
    },

    // Colores Neutrales - Grises (Fondos, Textos, Bordes)
    neutral: {
      0: '#FFFFFF',
      50: '#FAFAFA',
      100: '#F5F5F5',
      200: '#EEEEEE',
      300: '#E0E0E0',
      400: '#BDBDBD',
      500: '#9E9E9E',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121',
      1000: '#000000',
    },

    // Colores Semánticos - Estados de la aplicación
    semantic: {
      success: {
        light: '#81C784',
        main: '#4CAF50',
        dark: '#388E3C',
        contrast: '#FFFFFF',
      },
      error: {
        light: '#E57373',
        main: '#F44336',
        dark: '#D32F2F',
        contrast: '#FFFFFF',
      },
      warning: {
        light: '#FFB74D',
        main: '#FF9800',
        dark: '#F57C00',
        contrast: '#000000',
      },
      info: {
        light: '#64B5F6',
        main: '#2196F3',
        dark: '#1976D2',
        contrast: '#FFFFFF',
      },
    },

    // Colores Funcionales - Específicos de Prexiopá
    functional: {
      bestPrice: {
        light: '#C8E6C9',
        main: '#00C853',
        dark: '#00A043',
        text: '#FFFFFF',
      },
      highPrice: {
        light: '#FFCCBC',
        main: '#FF7043',
        dark: '#E64A19',
        text: '#FFFFFF',
      },
      discount: {
        light: '#FFF9C4',
        main: '#FBC02D',
        dark: '#F57F17',
        text: '#000000',
      },
      favorite: {
        light: '#F8BBD0',
        main: '#E91E63',
        dark: '#C2185B',
        text: '#FFFFFF',
      },
      alert: {
        light: '#BBDEFB',
        main: '#2196F3',
        dark: '#1565C0',
        text: '#FFFFFF',
      },
    },

    // Backgrounds - Fondos de la aplicación
    background: {
      default: '#FAFAFA',
      paper: '#FFFFFF',
      elevated: '#FFFFFF',
      secondary: '#F5F5F5',
      disabled: '#F5F5F5',
      overlay: 'rgba(0, 0, 0, 0.5)',
    },

    // Text - Colores de texto
    text: {
      primary: '#212121',
      secondary: '#616161',
      disabled: '#9E9E9E',
      hint: '#BDBDBD',
      inverse: '#FFFFFF',
    },

    // Borders - Bordes y dividers
    border: {
      light: '#EEEEEE',
      main: '#E0E0E0',
      strong: '#BDBDBD',
      focus: '#00BCD4',
    },
  },
};

// Dark Theme - Para Fase 5
export const darkTheme = {
  colors: {
    primary: {
      ...lightTheme.colors.primary,
      500: '#00E676', // Versión más brillante para dark bg
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

// ============================================
// TIPOGRAFÍA
// ============================================

export const typography = {
  // Familias de fuentes
  fontFamily: {
    primary: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', sans-serif",
    mono: "'Roboto Mono', 'Fira Code', 'Courier New', monospace",
    display: "'Poppins', sans-serif",
  },

  // Tamaños de fuente - Escala modular (1.200 ratio)
  fontSize: {
    xs: '0.75rem', // 12px
    sm: '0.875rem', // 14px
    base: '1rem', // 16px
    lg: '1.125rem', // 18px
    xl: '1.25rem', // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem', // 48px
    '6xl': '3.75rem', // 60px
  },

  // Line heights
  lineHeight: {
    tight: 1.2,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },

  // Pesos de fuente
  fontWeight: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },

  // Letter spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },

  // Estilos de texto predefinidos
  variants: {
    h1: {
      fontSize: '2.25rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.025em',
      '@media (min-width: 768px)': {
        fontSize: '3rem',
      },
    },
    h2: {
      fontSize: '1.875rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.025em',
      '@media (min-width: 768px)': {
        fontSize: '2.25rem',
      },
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.375,
      letterSpacing: 'normal',
      '@media (min-width: 768px)': {
        fontSize: '1.875rem',
      },
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.375,
      letterSpacing: 'normal',
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.5,
      letterSpacing: 'normal',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.5,
      letterSpacing: 'normal',
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: 'normal',
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: 'normal',
    },
    subtitle1: {
      fontSize: '1.125rem',
      fontWeight: 500,
      lineHeight: 1.5,
      letterSpacing: 'normal',
    },
    subtitle2: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.5,
      letterSpacing: 'normal',
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 600,
      lineHeight: 1,
      letterSpacing: '0.05em',
      textTransform: 'uppercase' as const,
    },
    buttonLarge: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1,
      letterSpacing: '0.05em',
      textTransform: 'uppercase' as const,
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: 'normal',
    },
    overline: {
      fontSize: '0.75rem',
      fontWeight: 600,
      lineHeight: 1.5,
      letterSpacing: '0.1em',
      textTransform: 'uppercase' as const,
    },
    price: {
      fontSize: '1.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.025em',
      fontFamily: "'Roboto Mono', monospace",
    },
    priceSmall: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.2,
      letterSpacing: '-0.025em',
      fontFamily: "'Roboto Mono', monospace",
    },
    discountBadge: {
      fontSize: '0.875rem',
      fontWeight: 700,
      lineHeight: 1,
      letterSpacing: '0.025em',
    },
  },
};

// ============================================
// ESPACIADO (8px Grid)
// ============================================

export const spacing = {
  0: '0',
  0.5: '0.125rem', // 2px
  1: '0.25rem', // 4px
  2: '0.5rem', // 8px
  3: '0.75rem', // 12px
  4: '1rem', // 16px
  5: '1.25rem', // 20px
  6: '1.5rem', // 24px
  8: '2rem', // 32px
  10: '2.5rem', // 40px
  12: '3rem', // 48px
  16: '4rem', // 64px
  20: '5rem', // 80px
  24: '6rem', // 96px
  32: '8rem', // 128px

  // Semantic spacing
  component: {
    paddingXs: '0.5rem', // 8px
    paddingSm: '0.75rem', // 12px
    paddingMd: '1rem', // 16px
    paddingLg: '1.5rem', // 24px
    paddingXl: '2rem', // 32px
  },

  layout: {
    gapXs: '0.5rem', // 8px
    gapSm: '1rem', // 16px
    gapMd: '1.5rem', // 24px
    gapLg: '2rem', // 32px
    gapXl: '3rem', // 48px
  },

  section: {
    paddingYSm: '2rem', // 32px
    paddingYMd: '3rem', // 48px
    paddingYLg: '4rem', // 64px
    paddingYXl: '6rem', // 96px
  },
};

// ============================================
// ELEVACIÓN (SOMBRAS)
// ============================================

export const shadows = {
  none: 'none',

  // Elevaciones sutiles
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',

  // Sombras de colores
  primary: '0 4px 12px 0 rgba(0, 200, 83, 0.25)',
  secondary: '0 4px 12px 0 rgba(0, 188, 212, 0.25)',
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

// ============================================
// BORDER RADIUS
// ============================================

export const borderRadius = {
  none: '0',
  xs: '0.125rem', // 2px
  sm: '0.25rem', // 4px
  base: '0.5rem', // 8px
  md: '0.75rem', // 12px
  lg: '1rem', // 16px
  xl: '1.25rem', // 20px
  '2xl': '1.5rem', // 24px
  full: '9999px',

  // Componentes específicos
  button: '0.5rem', // 8px
  card: '1rem', // 16px
  input: '0.5rem', // 8px
  modal: '1rem', // 16px
  badge: '9999px',
  chip: '9999px',
};

// ============================================
// Z-INDEX
// ============================================

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

// ============================================
// COMPONENT TOKENS
// ============================================

export const components = {
  button: {
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
  },

  input: {
    height: {
      small: '36px',
      medium: '44px',
      large: '52px',
    },
    padding: '12px 16px',
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

// ============================================
// TIPOS TYPESCRIPT
// ============================================

export type Theme = typeof lightTheme & {
  typography: typeof typography;
  spacing: typeof spacing;
  shadows: typeof shadows;
  borderRadius: typeof borderRadius;
  zIndex: typeof zIndex;
  components: typeof components;
};

// ============================================
// TEMA COMPLETO (LIGHT)
// ============================================

export const theme: Theme = {
  ...lightTheme,
  typography,
  spacing,
  shadows,
  borderRadius,
  zIndex,
  components,
};

// ============================================
// TEMA COMPLETO (DARK)
// ============================================

export const darkThemeComplete: Theme = {
  ...darkTheme,
  typography,
  spacing,
  shadows,
  borderRadius,
  zIndex,
  components,
};

// ============================================
// HELPERS
// ============================================

/**
 * Helper para acceder a colores de forma segura
 */
export const getColor = (path: string, theme: Theme): string => {
  const keys = path.split('.');
  let value: any = theme.colors;

  for (const key of keys) {
    value = value?.[key];
  }

  return value || '#000000';
};

/**
 * Helper para acceder a spacing de forma segura
 */
export const getSpacing = (multiplier: number, _theme: Theme): string => {
  const baseUnit = 4; // 4px
  return `${baseUnit * multiplier}px`;
};

export default theme;
