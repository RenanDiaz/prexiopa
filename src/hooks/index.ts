/**
 * Custom Hooks for Prexiopá
 *
 * This module exports all custom hooks used throughout the application.
 * These hooks provide reusable logic for common patterns like debouncing,
 * local storage management, media queries, and UI interactions.
 */

export { useDebounce } from './useDebounce';
export { useLocalStorage } from './useLocalStorage';
export {
  useMediaQuery,
  useIsMobile,
  useIsTablet,
  useIsDesktop,
  BREAKPOINTS
} from './useMediaQuery';
export {
  useOnClickOutside,
  useOnClickOutsideMultiple
} from './useOnClickOutside';
export {
  useToggle,
  useToggleObject
} from './useToggle';
export {
  useScrollLock,
  useScrollLockManual
} from './useScrollLock';
