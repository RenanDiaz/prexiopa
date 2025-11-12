/**
 * Sistema de Breakpoints de Prexiopá
 * Mobile-first responsive design
 */

// ============================================
// BREAKPOINTS VALUES
// ============================================

export const breakpointValues = {
  xs: 0, // Móvil pequeño
  sm: 640, // Móvil grande
  md: 768, // Tablet
  lg: 1024, // Desktop pequeño
  xl: 1280, // Desktop
  '2xl': 1536, // Desktop grande
} as const;

export type Breakpoint = keyof typeof breakpointValues;

// ============================================
// MEDIA QUERY GENERATORS
// ============================================

/**
 * Genera media query para tamaños mayores o iguales al breakpoint
 * Mobile-first approach
 */
export const up = (breakpoint: Breakpoint): string => {
  return `@media (min-width: ${breakpointValues[breakpoint]}px)`;
};

/**
 * Genera media query para tamaños menores al breakpoint
 */
export const down = (breakpoint: Breakpoint): string => {
  const value = breakpointValues[breakpoint];
  return `@media (max-width: ${value - 1}px)`;
};

/**
 * Genera media query para un rango entre dos breakpoints
 */
export const between = (min: Breakpoint, max: Breakpoint): string => {
  const minValue = breakpointValues[min];
  const maxValue = breakpointValues[max];
  return `@media (min-width: ${minValue}px) and (max-width: ${maxValue - 1}px)`;
};

/**
 * Genera media query para un breakpoint específico (solo ese rango)
 */
export const only = (breakpoint: Breakpoint): string => {
  const keys = Object.keys(breakpointValues) as Breakpoint[];
  const currentIndex = keys.indexOf(breakpoint);

  if (currentIndex === keys.length - 1) {
    // Si es el último breakpoint, usar solo min-width
    return up(breakpoint);
  }

  const nextBreakpoint = keys[currentIndex + 1];
  return between(breakpoint, nextBreakpoint);
};

// ============================================
// HELPERS ESPECÍFICOS
// ============================================

/**
 * Media query para dispositivos móviles (< 768px)
 */
export const mobile = '@media (max-width: 767px)';

/**
 * Media query para tablets (768px - 1023px)
 */
export const tablet = '@media (min-width: 768px) and (max-width: 1023px)';

/**
 * Media query para desktop (>= 1024px)
 */
export const desktop = '@media (min-width: 1024px)';

/**
 * Media query para dispositivos pequeños (< 640px)
 */
export const mobileSmall = '@media (max-width: 639px)';

/**
 * Media query para dispositivos con touch
 */
export const touch = '@media (hover: none) and (pointer: coarse)';

/**
 * Media query para dispositivos con hover preciso (mouse)
 */
export const hover = '@media (hover: hover) and (pointer: fine)';

/**
 * Media query para dispositivos en orientación portrait
 */
export const portrait = '@media (orientation: portrait)';

/**
 * Media query para dispositivos en orientación landscape
 */
export const landscape = '@media (orientation: landscape)';

/**
 * Media query para high-DPI displays (Retina, etc)
 */
export const retina = '@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)';

// ============================================
// CONTAINER CONFIGURATION
// ============================================

export const container = {
  maxWidth: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  padding: {
    mobile: '1rem', // 16px
    tablet: '1.5rem', // 24px
    desktop: '2rem', // 32px
  },
} as const;

// ============================================
// RESPONSIVE UTILITIES
// ============================================

/**
 * Genera estilos responsive para padding horizontal del container
 */
export const containerPadding = (): string => {
  return `
    padding-left: ${container.padding.mobile};
    padding-right: ${container.padding.mobile};

    ${up('md')} {
      padding-left: ${container.padding.tablet};
      padding-right: ${container.padding.tablet};
    }

    ${up('lg')} {
      padding-left: ${container.padding.desktop};
      padding-right: ${container.padding.desktop};
    }
  `;
};

/**
 * Genera estilos responsive para max-width del container
 */
export const containerMaxWidth = (): string => {
  return `
    width: 100%;
    margin-left: auto;
    margin-right: auto;

    ${up('sm')} {
      max-width: ${container.maxWidth.sm};
    }

    ${up('md')} {
      max-width: ${container.maxWidth.md};
    }

    ${up('lg')} {
      max-width: ${container.maxWidth.lg};
    }

    ${up('xl')} {
      max-width: ${container.maxWidth.xl};
    }

    ${up('2xl')} {
      max-width: ${container.maxWidth['2xl']};
    }
  `;
};

/**
 * Genera estilos completos de container responsive
 */
export const responsiveContainer = (): string => {
  return `
    ${containerMaxWidth()}
    ${containerPadding()}
  `;
};

// ============================================
// GRID UTILITIES
// ============================================

/**
 * Helper para crear grid responsive
 */
export const responsiveGrid = (config: {
  mobile?: number;
  tablet?: number;
  desktop?: number;
  gap?: string;
}): string => {
  const { mobile = 1, tablet = 2, desktop = 3, gap = '1rem' } = config;

  return `
    display: grid;
    grid-template-columns: repeat(${mobile}, 1fr);
    gap: ${gap};

    ${up('md')} {
      grid-template-columns: repeat(${tablet}, 1fr);
    }

    ${up('lg')} {
      grid-template-columns: repeat(${desktop}, 1fr);
    }
  `;
};

/**
 * Helper para ocultar elementos en ciertos breakpoints
 */
export const hideOn = (breakpoint: Breakpoint): string => {
  return `
    ${up(breakpoint)} {
      display: none;
    }
  `;
};

/**
 * Helper para mostrar elementos solo en ciertos breakpoints
 */
export const showOn = (breakpoint: Breakpoint): string => {
  return `
    display: none;

    ${up(breakpoint)} {
      display: block;
    }
  `;
};

// ============================================
// TYPOGRAPHY RESPONSIVE UTILITIES
// ============================================

/**
 * Helper para texto responsive (fluid typography)
 */
export const fluidType = (
  minSize: number,
  maxSize: number,
  minBreakpoint: Breakpoint = 'sm',
  maxBreakpoint: Breakpoint = 'xl'
): string => {
  const minVw = breakpointValues[minBreakpoint];
  const maxVw = breakpointValues[maxBreakpoint];

  return `
    font-size: ${minSize}rem;

    @media (min-width: ${minVw}px) {
      font-size: calc(${minSize}rem + (${maxSize} - ${minSize}) * ((100vw - ${minVw}px) / (${maxVw} - ${minVw})));
    }

    @media (min-width: ${maxVw}px) {
      font-size: ${maxSize}rem;
    }
  `;
};

// ============================================
// EXPORT
// ============================================

export const breakpoints = {
  values: breakpointValues,
  up,
  down,
  between,
  only,
  mobile,
  tablet,
  desktop,
  mobileSmall,
  touch,
  hover,
  portrait,
  landscape,
  retina,
};

export default {
  breakpoints,
  container,
  containerPadding,
  containerMaxWidth,
  responsiveContainer,
  responsiveGrid,
  hideOn,
  showOn,
  fluidType,
};
