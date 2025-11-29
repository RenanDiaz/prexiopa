import styled from 'styled-components';
import { HiMoon, HiSun } from 'react-icons/hi';
import { useUIStore } from '../../store/uiStore';

const ToggleButton = styled.button`
  position: relative;
  width: 56px;
  height: 32px;
  background: ${({ theme }) => theme.colors.neutral[200]};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  cursor: pointer;
  transition: all 0.3s ease-in-out;
  display: flex;
  align-items: center;
  padding: 0 4px;
  overflow: hidden;

  &:hover {
    background: ${({ theme }) => theme.colors.neutral[300]};
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary[100]};
  }

  &:active {
    transform: scale(0.95);
  }
`;

const IconWrapper = styled.div<{ $isActive: boolean }>`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  transition: all 0.3s ease-in-out;
  transform: translateX(${({ $isActive }) => ($isActive ? '24px' : '0')});

  svg {
    width: 16px;
    height: 16px;
    color: ${({ $isActive, theme }) =>
      $isActive ? theme.colors.primary[500] : theme.colors.semantic.warning.main};
    transition: color 0.2s ease;
  }
`;

const IconPlaceholder = styled.div<{ $visible: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: ${({ $visible }) => ($visible ? 0.5 : 0)};
  transition: opacity 0.2s ease;

  svg {
    width: 14px;
    height: 14px;
    color: ${({ theme }) => theme.colors.neutral[500]};
  }
`;

const PlaceholderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0 4px;
`;

/**
 * ThemeToggle Component
 *
 * Toggle button para cambiar entre modo claro y oscuro.
 * Utiliza el uiStore para manejar el estado del tema.
 *
 * @example
 * <ThemeToggle />
 */
export const ThemeToggle = () => {
  const { theme, toggleTheme } = useUIStore();
  const isDark = theme === 'dark';

  return (
    <ToggleButton
      onClick={toggleTheme}
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      title={isDark ? 'Modo claro' : 'Modo oscuro'}
      type="button"
    >
      <PlaceholderContainer>
        <IconPlaceholder $visible={!isDark}>
          <HiSun />
        </IconPlaceholder>
        <IconPlaceholder $visible={isDark}>
          <HiMoon />
        </IconPlaceholder>
      </PlaceholderContainer>
      <IconWrapper $isActive={isDark}>
        {isDark ? <HiMoon /> : <HiSun />}
      </IconWrapper>
    </ToggleButton>
  );
};
