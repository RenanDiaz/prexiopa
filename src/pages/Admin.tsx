/**
 * Admin - Página del panel de administración
 * Vista principal para moderadores y administradores
 * Permite revisar y gestionar contribuciones de usuarios
 */

import { useEffect } from 'react';
import { useNavigate, Routes, Route } from 'react-router-dom';
import styled from 'styled-components';
import { useUserRole } from '@/hooks/useUserRole';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ContributionsQueue } from '@/components/admin/ContributionsQueue';
import { IncompleteProductsList } from '@/components/admin/IncompleteProductsList';

const AdminContainer = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background.default};
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const UnauthorizedContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: ${({ theme }) => theme.spacing[8]};
  text-align: center;
`;

const UnauthorizedIcon = styled.div`
  font-size: 80px;
  margin-bottom: ${({ theme }) => theme.spacing[4]};
  opacity: 0.5;
`;

const UnauthorizedTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing[2]};
`;

const UnauthorizedMessage = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing[6]};
`;

const Admin = () => {
  const navigate = useNavigate();
  const { isLoading, isModeratorOrAdmin } = useUserRole();

  // Redirect if not authorized
  useEffect(() => {
    if (!isLoading && !isModeratorOrAdmin) {
      // Optionally redirect to home after showing message
      const timer = setTimeout(() => {
        navigate('/');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isLoading, isModeratorOrAdmin, navigate]);

  // Loading state
  if (isLoading) {
    return (
      <AdminContainer>
        <LoadingContainer>Verificando permisos...</LoadingContainer>
      </AdminContainer>
    );
  }

  // Unauthorized state
  if (!isModeratorOrAdmin) {
    return (
      <AdminContainer>
        <UnauthorizedContainer>
          <UnauthorizedIcon>🔒</UnauthorizedIcon>
          <UnauthorizedTitle>Acceso No Autorizado</UnauthorizedTitle>
          <UnauthorizedMessage>
            No tienes permisos para acceder al panel de administración.
            Solo moderadores y administradores pueden acceder a esta sección.
          </UnauthorizedMessage>
          <UnauthorizedMessage>Redirigiendo al inicio...</UnauthorizedMessage>
        </UnauthorizedContainer>
      </AdminContainer>
    );
  }

  // Authorized - Show admin dashboard with routes
  return (
    <AdminContainer>
      <AdminLayout>
        <Routes>
          <Route index element={<ContributionsQueue />} />
          <Route path="incomplete" element={<IncompleteProductsList />} />
        </Routes>
      </AdminLayout>
    </AdminContainer>
  );
};

export default Admin;
