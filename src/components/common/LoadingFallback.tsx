/**
 * LoadingFallback - Componente de carga para transiciones de rutas
 * Muestra un spinner mientras se cargan las páginas con lazy loading
 */

import { Suspense } from 'react';
import styled from 'styled-components';

const LoadingContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.background.default};
`;

const LoadingSpinner = styled.div`
  width: 60px;
  height: 60px;
  border: 4px solid ${({ theme }) => theme.colors.neutral[200]};
  border-top-color: ${({ theme }) => theme.colors.primary[500]};
  border-radius: 50%;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const LoadingText = styled.p`
  position: absolute;
  margin-top: 100px;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

/**
 * Componente de loading que se muestra durante la carga de páginas
 */
export const LoadingFallback = () => (
  <LoadingContainer>
    <div style={{ position: 'relative' }}>
      <LoadingSpinner />
      <LoadingText>Cargando...</LoadingText>
    </div>
  </LoadingContainer>
);

/**
 * Wrapper para Suspense que muestra un loading mientras carga la página
 */
export const SuspenseWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<LoadingFallback />}>{children}</Suspense>
);
