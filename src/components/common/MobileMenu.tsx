/**
 * MobileMenu Component
 *
 * Menú lateral offcanvas para navegación móvil.
 * Se desliza desde la izquierda con un overlay oscuro.
 * Incluye sección de usuario, navegación y configuración.
 */

import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import {
  HiHome,
  HiShoppingBag,
  HiHeart,
  HiShoppingCart,
  HiX,
  HiLogin,
  HiUserAdd,
  HiLogout,
  HiUser,
} from 'react-icons/hi';
import { useAuthStore } from '@/store/authStore';
import { ThemeToggle } from './ThemeToggle';

// Overlay oscuro detrás del menú
const Overlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: ${({ theme }) => theme.zIndex.modalBackdrop};
  opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
  visibility: ${({ $isOpen }) => ($isOpen ? 'visible' : 'hidden')};
  transition: opacity 0.3s ease-in-out, visibility 0.3s ease-in-out;
  backdrop-filter: blur(2px);
`;

// Contenedor del menú
const MenuContainer = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 280px;
  max-width: 85vw;
  background: ${({ theme }) => theme.colors.background.paper};
  z-index: ${({ theme }) => theme.zIndex.modal};
  transform: translateX(${({ $isOpen }) => ($isOpen ? '0' : '-100%')});
  transition: transform 0.3s ease-in-out;
  box-shadow: ${({ theme }) => theme.shadows.xl};
  display: flex;
  flex-direction: column;
  overflow-y: auto;
`;

// Header del menú con botón de cerrar
const MenuHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing[4]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.light};
`;

const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  border-radius: ${({ theme }) => theme.borderRadius.base};
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.neutral[100]};
    color: ${({ theme }) => theme.colors.text.primary};
  }

  svg {
    width: 24px;
    height: 24px;
  }
`;

const Logo = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.primary[500]};
  margin: 0;
`;

// Sección de usuario
const UserSection = styled.div`
  padding: ${({ theme }) => theme.spacing[4]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.light};
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
  margin-bottom: ${({ theme }) => theme.spacing[3]};
`;

const UserAvatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  background: ${({ theme }) => theme.colors.primary[100]};
  color: ${({ theme }) => theme.colors.primary[600]};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
`;

const UserDetails = styled.div`
  flex: 1;
  min-width: 0;
`;

const UserName = styled.div`
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const UserEmail = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

// Navegación
const Navigation = styled.nav`
  flex: 1;
  padding: ${({ theme }) => theme.spacing[2]} 0;
`;

const NavItem = styled(Link)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
  padding: ${({ theme }) => `${theme.spacing[3]} ${theme.spacing[4]}`};
  color: ${({ theme }) => theme.colors.text.primary};
  text-decoration: none;
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.neutral[100]};
    color: ${({ theme }) => theme.colors.primary[500]};
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

// Sección de configuración
const SettingsSection = styled.div`
  padding: ${({ theme }) => theme.spacing[4]};
  border-top: 1px solid ${({ theme }) => theme.colors.border.light};
`;

const SettingsItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing[2]} 0;
`;

const SettingsLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  width: 100%;
  padding: ${({ theme }) => theme.spacing[3]};
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  cursor: pointer;
  border-radius: ${({ theme }) => theme.borderRadius.base};
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.neutral[100]};
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const Divider = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.colors.border.light};
  margin: ${({ theme }) => theme.spacing[2]} 0;
`;

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  // Cerrar el menú cuando se presiona Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleNavigation = (path: string) => {
    onClose();
    navigate(path);
  };

  const handleLogout = async () => {
    try {
      await logout();
      onClose();
      navigate('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  // Obtener iniciales del usuario
  const getUserInitials = () => {
    if (!user?.email) return '?';
    return user.email.charAt(0).toUpperCase();
  };

  return (
    <>
      <Overlay $isOpen={isOpen} onClick={onClose} />
      <MenuContainer $isOpen={isOpen}>
        <MenuHeader>
          <Logo>Prexiopá</Logo>
          <CloseButton onClick={onClose} aria-label="Cerrar menú">
            <HiX />
          </CloseButton>
        </MenuHeader>

        {user ? (
          // Usuario autenticado
          <>
            <UserSection>
              <UserInfo>
                <UserAvatar>{getUserInitials()}</UserAvatar>
                <UserDetails>
                  <UserName>Mi cuenta</UserName>
                  <UserEmail>{user.email}</UserEmail>
                </UserDetails>
              </UserInfo>
              <ActionButton onClick={() => handleNavigation('/profile')}>
                <HiUser />
                Ver perfil
              </ActionButton>
            </UserSection>

            <Navigation>
              <NavItem to="/" onClick={onClose}>
                <HiHome />
                Inicio
              </NavItem>
              <NavItem to="/stores" onClick={onClose}>
                <HiShoppingBag />
                Tiendas
              </NavItem>
              <NavItem to="/favorites" onClick={onClose}>
                <HiHeart />
                Favoritos
              </NavItem>
              <NavItem to="/shopping" onClick={onClose}>
                <HiShoppingCart />
                Lista de Compras
              </NavItem>
            </Navigation>

            <SettingsSection>
              <SettingsItem>
                <SettingsLabel>Tema</SettingsLabel>
                <ThemeToggle />
              </SettingsItem>
              <Divider />
              <ActionButton onClick={handleLogout}>
                <HiLogout />
                Cerrar sesión
              </ActionButton>
            </SettingsSection>
          </>
        ) : (
          // Usuario no autenticado
          <>
            <UserSection>
              <ActionButton onClick={() => handleNavigation('/login')}>
                <HiLogin />
                Iniciar Sesión
              </ActionButton>
              <ActionButton onClick={() => handleNavigation('/register')}>
                <HiUserAdd />
                Registrarse
              </ActionButton>
            </UserSection>

            <Navigation>
              <NavItem to="/" onClick={onClose}>
                <HiHome />
                Inicio
              </NavItem>
              <NavItem to="/stores" onClick={onClose}>
                <HiShoppingBag />
                Tiendas
              </NavItem>
            </Navigation>

            <SettingsSection>
              <SettingsItem>
                <SettingsLabel>Tema</SettingsLabel>
                <ThemeToggle />
              </SettingsItem>
            </SettingsSection>
          </>
        )}
      </MenuContainer>
    </>
  );
};
