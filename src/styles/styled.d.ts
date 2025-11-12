/**
 * Type definitions for styled-components
 * Extiende DefaultTheme para incluir el tipo de nuestro theme personalizado
 */

import 'styled-components';
import type { Theme } from './theme';

declare module 'styled-components' {
  export interface DefaultTheme extends Theme {}
}
