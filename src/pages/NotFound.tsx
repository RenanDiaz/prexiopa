/**
 * NotFound - Página 404
 * Se muestra cuando el usuario intenta acceder a una ruta que no existe
 */

import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { SearchX } from 'lucide-react';

const NotFoundContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing[8]};
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.primary[500]} 0%,
    ${({ theme }) => theme.colors.secondary[500]} 100%
  );
`;

const Content = styled.div`
  text-align: center;
  max-width: 600px;
`;

const ErrorCode = styled.h1`
  font-size: 180px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.extrabold};
  color: white;
  line-height: 1;
  margin-bottom: ${({ theme }) => theme.spacing[4]};
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);

  @media (max-width: 640px) {
    font-size: 120px;
  }
`;

const ErrorTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize['3xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: white;
  margin-bottom: ${({ theme }) => theme.spacing[4]};

  @media (max-width: 640px) {
    font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  }
`;

const ErrorDescription = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  color: rgba(255, 255, 255, 0.9);
  line-height: ${({ theme }) => theme.typography.lineHeight.relaxed};
  margin-bottom: ${({ theme }) => theme.spacing[8]};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[4]};
  justify-content: center;
  flex-wrap: wrap;
`;

const Button = styled(Link)<{ $variant?: 'primary' | 'secondary' }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: ${({ theme }) => theme.components.button.size.large.height};
  padding: ${({ theme }) => theme.components.button.size.large.padding};
  background: ${({ $variant }) =>
    $variant === 'secondary' ? 'rgba(255, 255, 255, 0.2)' : 'white'};
  color: ${({ theme, $variant }) =>
    $variant === 'secondary' ? 'white' : theme.colors.primary[500]};
  border: ${({ $variant }) =>
    $variant === 'secondary' ? '2px solid white' : 'none'};
  border-radius: ${({ theme }) => theme.borderRadius.button};
  font-size: ${({ theme }) => theme.components.button.size.large.fontSize};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: ${({ $variant }) =>
    $variant === 'secondary' ? 'blur(10px)' : 'none'};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
    background: ${({ $variant }) =>
      $variant === 'secondary' ? 'rgba(255, 255, 255, 0.3)' : 'white'};
  }

  &:active {
    transform: translateY(0);
  }
`;

const Icon = styled.div`
  font-size: 100px;
  margin-bottom: ${({ theme }) => theme.spacing[6]};
  opacity: 0.9;
  filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.2));
`;

const NotFound = () => {
  return (
    <NotFoundContainer>
      <Content>
        <Icon><SearchX size={80} strokeWidth={1.5} /></Icon>
        <ErrorCode>404</ErrorCode>
        <ErrorTitle>Página no encontrada</ErrorTitle>
        <ErrorDescription>
          Lo sentimos, la página que estás buscando no existe o ha sido movida.
          Verifica la URL o regresa a la página principal para continuar
          comparando precios.
        </ErrorDescription>
        <ActionButtons>
          <Button to="/" $variant="primary">
            Ir al Inicio
          </Button>
          <Button to="/search" $variant="secondary">
            Buscar Productos
          </Button>
        </ActionButtons>
      </Content>
    </NotFoundContainer>
  );
};

export default NotFound;
