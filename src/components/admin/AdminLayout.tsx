/**
 * AdminLayout - Layout del panel de administración
 * Incluye sidebar con navegación y área de contenido principal
 */

import type { ReactNode } from 'react';
import styled from 'styled-components';
import { Link, useLocation } from 'react-router-dom';
import { FiList, FiBarChart2, FiUsers, FiSettings } from 'react-icons/fi';
import { useUserRole, useModerationStats } from '@/hooks/useUserRole';
import { ROLE_LABELS } from '@/types/role';

interface AdminLayoutProps {
  children: ReactNode;
}

const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background.default};
`;

const Sidebar = styled.aside`
  width: 280px;
  background: ${({ theme }) => theme.colors.background.paper};
  border-right: 1px solid ${({ theme }) => theme.colors.border.light};
  padding: ${({ theme }) => theme.spacing[6]};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[6]};

  @media (max-width: 768px) {
    display: none;
  }
`;

const SidebarHeader = styled.div`
  padding-bottom: ${({ theme }) => theme.spacing[4]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.light};
`;

const SidebarTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing[2]};
`;

const RoleBadge = styled.span<{ $role: string }>`
  display: inline-flex;
  align-items: center;
  padding: ${({ theme }) => theme.spacing[1]} ${({ theme }) => theme.spacing[3]};
  background: ${({ $role }) => {
    if ($role === 'admin') return '#FFEBEE';
    if ($role === 'moderator') return '#F3E5F5';
    return '#E3F2FD';
  }};
  color: ${({ $role }) => {
    if ($role === 'admin') return '#C62828';
    if ($role === 'moderator') return '#6A1B9A';
    return '#1565C0';
  }};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
`;

const Nav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const NavLink = styled(Link)<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
  padding: ${({ theme }) => theme.spacing[3]} ${({ theme }) => theme.spacing[4]};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme, $active }) =>
    $active ? theme.colors.primary[700] : theme.colors.text.secondary};
  background: ${({ theme, $active }) =>
    $active ? theme.colors.primary[50] : 'transparent'};
  text-decoration: none;
  transition: all 0.2s ease;

  svg {
    font-size: 20px;
  }

  &:hover {
    background: ${({ theme }) => theme.colors.primary[50]};
    color: ${({ theme }) => theme.colors.primary[700]};
  }
`;

const StatsSection = styled.div`
  margin-top: auto;
  padding: ${({ theme }) => theme.spacing[4]};
  background: ${({ theme }) => theme.colors.background.default};
  border-radius: ${({ theme }) => theme.borderRadius.base};
`;

const StatsTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing[3]};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const StatItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing[2]} 0;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const StatLabel = styled.span``;

const StatValue = styled.span<{ $highlight?: boolean }>`
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme, $highlight }) =>
    $highlight ? theme.colors.secondary[600] : theme.colors.text.primary};
`;

const MainContent = styled.main`
  flex: 1;
  padding: ${({ theme }) => theme.spacing[6]};
  overflow-y: auto;

  @media (max-width: 768px) {
    padding: ${({ theme }) => theme.spacing[4]};
  }
`;

const ContentHeader = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[6]};
`;

const PageTitle = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSize['3xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing[2]};
`;

const PageDescription = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();
  const { role } = useUserRole();
  const { stats } = useModerationStats();

  const navItems = [
    {
      path: '/admin',
      label: 'Contribuciones',
      icon: FiList,
      exact: true,
    },
    {
      path: '/admin/stats',
      label: 'Estadísticas',
      icon: FiBarChart2,
      exact: false,
    },
    ...(role === 'admin'
      ? [
          {
            path: '/admin/users',
            label: 'Usuarios',
            icon: FiUsers,
            exact: false,
          },
          {
            path: '/admin/settings',
            label: 'Configuración',
            icon: FiSettings,
            exact: false,
          },
        ]
      : []),
  ];

  return (
    <LayoutContainer>
      <Sidebar>
        <SidebarHeader>
          <SidebarTitle>Panel de Admin</SidebarTitle>
          <RoleBadge $role={role}>{ROLE_LABELS[role]}</RoleBadge>
        </SidebarHeader>

        <Nav>
          {navItems.map((item) => {
            const isActive = item.exact
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);

            return (
              <NavLink key={item.path} to={item.path} $active={isActive}>
                <item.icon />
                {item.label}
              </NavLink>
            );
          })}
        </Nav>

        {stats && (
          <StatsSection>
            <StatsTitle>Resumen</StatsTitle>
            <StatItem>
              <StatLabel>Pendientes</StatLabel>
              <StatValue $highlight={stats.pendingContributions > 0}>
                {stats.pendingContributions}
              </StatValue>
            </StatItem>
            <StatItem>
              <StatLabel>Aprobadas</StatLabel>
              <StatValue>{stats.approvedContributions}</StatValue>
            </StatItem>
            <StatItem>
              <StatLabel>Rechazadas</StatLabel>
              <StatValue>{stats.rejectedContributions}</StatValue>
            </StatItem>
          </StatsSection>
        )}
      </Sidebar>

      <MainContent>
        <ContentHeader>
          <PageTitle>Gestión de Contribuciones</PageTitle>
          <PageDescription>
            Revisa y modera las contribuciones de usuarios pendientes de aprobación
          </PageDescription>
        </ContentHeader>
        {children}
      </MainContent>
    </LayoutContainer>
  );
};
