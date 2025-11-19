/**
 * Navbar - Barra de navegación principal
 * Componente de navegación global de Prexiopá con enlaces principales
 */

import styled from 'styled-components';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

const Nav = styled.nav`
  position: sticky;
  top: 0;
  z-index: ${({ theme }) => theme.zIndex.sticky};
  background: ${({ theme }) => theme.colors.background.paper};
  box-shadow: ${({ theme }) => theme.shadows.navbar};
  height: ${({ theme }) => theme.components.navbar.height.mobile};

  @media (min-width: 768px) {
    height: ${({ theme }) => theme.components.navbar.height.desktop};
  }
`;

const NavContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing[4]};
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[6]};
`;

const LogoSection = styled(Link)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  text-decoration: none;
  flex-shrink: 0;
`;

const LogoIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.primary[500]},
    ${({ theme }) => theme.colors.secondary[500]}
  );
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${({ theme }) => theme.typography.fontSize.xl};

  @media (min-width: 768px) {
    width: 40px;
    height: 40px;
    font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  }
`;

const LogoText = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.extrabold};
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.primary[500]},
    ${({ theme }) => theme.colors.secondary[500]}
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: none;

  @media (min-width: 640px) {
    display: block;
  }
`;

const NavLinks = styled.div`
  display: none;
  gap: ${({ theme }) => theme.spacing[1]};

  @media (min-width: 768px) {
    display: flex;
  }
`;

const NavLink = styled(Link)<{ $isActive?: boolean }>`
  padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[4]};
  color: ${({ theme, $isActive }) =>
    $isActive ? theme.colors.primary[500] : theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme, $isActive }) =>
    $isActive
      ? theme.typography.fontWeight.semibold
      : theme.typography.fontWeight.medium};
  text-decoration: none;
  border-radius: ${({ theme }) => theme.borderRadius.button};
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    color: ${({ theme }) => theme.colors.primary[500]};
    background: ${({ theme }) => theme.colors.primary[50]};
  }

  ${({ $isActive, theme }) =>
    $isActive &&
    `
    background: ${theme.colors.primary[50]};

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 60%;
      height: 2px;
      background: ${theme.colors.primary[500]};
      border-radius: 2px;
    }
  `}
`;

const NavActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  flex-shrink: 0;
`;

const IconButton = styled(Link)`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.borderRadius.button};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  text-decoration: none;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.neutral[100]};
    color: ${({ theme }) => theme.colors.primary[500]};
  }
`;

const LoginButton = styled(Link)`
  padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[4]};
  background: ${({ theme }) => theme.colors.primary[500]};
  color: ${({ theme }) => theme.colors.primary.contrast};
  border-radius: ${({ theme }) => theme.borderRadius.button};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  text-decoration: none;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    background: ${({ theme }) => theme.colors.primary[600]};
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.primary};
  }

  &:active {
    transform: translateY(0);
  }
`;

const MobileMenu = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[2]};

  @media (min-width: 768px) {
    display: none;
  }
`;

const UserMenu = styled(Link)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  padding: ${({ theme }) => theme.spacing[1]} ${({ theme }) => theme.spacing[2]};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  text-decoration: none;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.neutral[100]};
  }
`;

const UserAvatar = styled.img`
  width: 32px;
  height: 32px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  object-fit: cover;
  border: 2px solid ${({ theme }) => theme.colors.primary[500]};
`;

const UserName = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  display: none;

  @media (min-width: 640px) {
    display: block;
  }
`;

const Navbar = () => {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <Nav>
      <NavContainer>
        <LogoSection to="/">
          <LogoIcon>🛒</LogoIcon>
          <LogoText>Prexiopá</LogoText>
        </LogoSection>

        <NavLinks>
          <NavLink to="/" $isActive={isActive('/')}>
            Inicio
          </NavLink>
          <NavLink to="/search" $isActive={isActive('/search')}>
            Buscar
          </NavLink>
          <NavLink to="/favorites" $isActive={isActive('/favorites')}>
            Favoritos
          </NavLink>
          <NavLink to="/profile" $isActive={isActive('/profile')}>
            Perfil
          </NavLink>
        </NavLinks>

        <NavActions>
          <MobileMenu>
            <IconButton to="/search" title="Buscar">
              🔍
            </IconButton>
            <IconButton to="/favorites" title="Favoritos">
              ❤️
            </IconButton>
          </MobileMenu>
          {user ? (
            <UserMenu to="/profile" title={`Perfil de ${user.user_metadata?.full_name || user.email}`}>
              <UserAvatar
                src={
                  user.user_metadata?.avatar_url ||
                  user.user_metadata?.picture ||
                  'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.user_metadata?.full_name || user.email || 'User')
                }
                alt={user.user_metadata?.full_name || user.email || 'User'}
              />
              <UserName>{user.user_metadata?.full_name || user.email}</UserName>
            </UserMenu>
          ) : (
            <LoginButton to="/login">Iniciar Sesión</LoginButton>
          )}
        </NavActions>
      </NavContainer>
    </Nav>
  );
};

export default Navbar;
