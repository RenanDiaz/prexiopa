/**
 * Barrel Export - Sistema de Estilos de Prexiopá
 * Exporta todos los módulos del sistema de diseño
 */

// Theme
export * from './theme';
export { default as theme } from './theme';

// Animations
export * from './animations';
export { default as animations } from './animations';

// Breakpoints
export * from './breakpoints';
export { default as breakpointsUtils } from './breakpoints';

// Accessibility
export * from './accessibility';
export { default as accessibility } from './accessibility';

// Global Styles
export { GlobalStyles } from './GlobalStyles';

// Re-export types
export type { Theme } from './theme';
export type { Breakpoint } from './breakpoints';
