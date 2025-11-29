/**
 * ThemeWrapper - Wrapper para aplicar tema dinámico
 * Lee el tema del uiStore y aplica el tema correspondiente (light/dark)
 */

import { ThemeProvider } from 'styled-components';
import { useUIStore } from '../store/uiStore';
import { theme, darkThemeComplete } from '../styles/theme';
import { GlobalStyles } from '../styles/GlobalStyles';

interface ThemeWrapperProps {
  children: React.ReactNode;
}

/**
 * ThemeWrapper Component
 *
 * Wrapper que aplica el tema dinámicamente basado en la preferencia del usuario.
 * Lee el tema del uiStore (light/dark) y aplica el theme object correspondiente.
 */
export const ThemeWrapper = ({ children }: ThemeWrapperProps) => {
  const currentTheme = useUIStore((state) => state.theme);
  const selectedTheme = currentTheme === 'dark' ? darkThemeComplete : theme;

  return (
    <ThemeProvider theme={selectedTheme}>
      <GlobalStyles theme={selectedTheme} />
      {children}
    </ThemeProvider>
  );
};
