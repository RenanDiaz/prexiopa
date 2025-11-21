/**
 * ErrorBoundary Component
 *
 * React Error Boundary para capturar errores en el árbol de componentes
 * y mostrar una UI de fallback amigable en lugar de una pantalla blanca.
 *
 * @example
 * ```tsx
 * // Envolver componentes propensos a errores
 * <ErrorBoundary>
 *   <ProductList />
 * </ErrorBoundary>
 *
 * // Con UI de fallback custom
 * <ErrorBoundary
 *   fallback={<CustomErrorUI />}
 *   onError={(error, errorInfo) => {
 *     logErrorToService(error, errorInfo);
 *   }}
 * >
 *   <ComplexFeature />
 * </ErrorBoundary>
 *
 * // Con callback para logging
 * <ErrorBoundary
 *   onError={(error) => {
 *     analytics.track('error', { error: error.message });
 *   }}
 * >
 *   <App />
 * </ErrorBoundary>
 * ```
 */

import { Component, type ErrorInfo, type ReactNode } from 'react';
import styled from 'styled-components';
import { FiAlertTriangle, FiRefreshCw, FiMail } from 'react-icons/fi';

// ============================================
// STYLED COMPONENTS
// ============================================

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: ${({ theme }) => theme.spacing[8]};
  background-color: ${({ theme }) => theme.colors.background.default};
  text-align: center;

  @media (max-width: 640px) {
    padding: ${({ theme }) => theme.spacing[6]};
    min-height: 300px;
  }
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  margin-bottom: ${({ theme }) => theme.spacing[6]};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  background-color: ${({ theme }) => theme.colors.semantic.error.light}33;
  color: ${({ theme }) => theme.colors.semantic.error.main};
  animation: pulse 2s ease-in-out infinite;

  svg {
    width: 40px;
    height: 40px;
  }

  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.05);
      opacity: 0.8;
    }
  }

  @media (max-width: 640px) {
    width: 64px;
    height: 64px;
    margin-bottom: ${({ theme }) => theme.spacing[4]};

    svg {
      width: 32px;
      height: 32px;
    }
  }
`;

const Title = styled.h1`
  margin: 0 0 ${({ theme }) => theme.spacing[3]} 0;
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize['3xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  line-height: ${({ theme }) => theme.typography.lineHeight.tight};
  color: ${({ theme }) => theme.colors.text.primary};

  @media (max-width: 640px) {
    font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  }
`;

const Message = styled.p`
  margin: 0 0 ${({ theme }) => theme.spacing[6]} 0;
  max-width: 500px;
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.regular};
  line-height: ${({ theme }) => theme.typography.lineHeight.relaxed};
  color: ${({ theme }) => theme.colors.text.secondary};

  @media (max-width: 640px) {
    font-size: ${({ theme }) => theme.typography.fontSize.base};
    margin-bottom: ${({ theme }) => theme.spacing[4]};
  }
`;

const ActionsWrapper = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[3]};
  flex-wrap: wrap;
  justify-content: center;

  @media (max-width: 640px) {
    flex-direction: column;
    width: 100%;
    max-width: 300px;
  }
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing[2]};
  padding: ${({ theme }) => `${theme.spacing[3]} ${theme.spacing[6]}`};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.base};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  line-height: 1;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: ${({ theme, $variant }) =>
    $variant === 'primary' ? theme.colors.primary[500] : theme.colors.neutral[200]};
  color: ${({ theme, $variant }) =>
    $variant === 'primary' ? theme.colors.primary.contrast : theme.colors.text.primary};
  box-shadow: ${({ theme }) => theme.shadows.sm};

  &:hover:not(:disabled) {
    background-color: ${({ theme, $variant }) =>
      $variant === 'primary' ? theme.colors.primary[600] : theme.colors.neutral[300]};
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.md};
  }

  &:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: ${({ theme }) => theme.shadows.sm};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.border.focus};
    outline-offset: 2px;
  }

  svg {
    width: 18px;
    height: 18px;
  }

  @media (max-width: 640px) {
    width: 100%;
    padding: ${({ theme }) => `${theme.spacing[3]} ${theme.spacing[4]}`};
  }
`;

const DetailsWrapper = styled.details`
  margin-top: ${({ theme }) => theme.spacing[8]};
  max-width: 700px;
  width: 100%;
  text-align: left;
`;

const DetailsSummary = styled.summary`
  padding: ${({ theme }) => theme.spacing[3]};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  border-radius: ${({ theme }) => theme.borderRadius.base};
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.neutral[100]};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.border.focus};
    outline-offset: 2px;
  }
`;

const DetailsContent = styled.pre`
  margin: ${({ theme }) => theme.spacing[3]} 0 0 0;
  padding: ${({ theme }) => theme.spacing[4]};
  background-color: ${({ theme }) => theme.colors.neutral[100]};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  border: 1px solid ${({ theme }) => theme.colors.border.light};
  font-family: ${({ theme }) => theme.typography.fontFamily.mono};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  line-height: ${({ theme }) => theme.typography.lineHeight.relaxed};
  color: ${({ theme }) => theme.colors.text.secondary};
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-word;
`;

// ============================================
// TYPES
// ============================================

export interface ErrorBoundaryProps {
  /** Componentes hijos a renderizar */
  children: ReactNode;
  /** UI de fallback custom (opcional) */
  fallback?: ReactNode;
  /** Callback cuando ocurre un error */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Mostrar detalles técnicos del error */
  showDetails?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

// ============================================
// COMPONENT
// ============================================

/**
 * ErrorBoundary Component
 *
 * Captura errores de JavaScript en cualquier parte del árbol de componentes hijo,
 * registra esos errores y muestra una interfaz de usuario de respaldo.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Actualizar el estado para que el siguiente render muestre la UI de fallback
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Registrar el error en el estado
    this.setState({
      error,
      errorInfo,
    });

    // Llamar al callback de error si existe
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log del error para debugging (puedes integrar con servicios de logging)
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = (): void => {
    // Recargar la página
    window.location.reload();
  };

  handleReset = (): void => {
    // Resetear el estado del error
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReportError = (): void => {
    const { error, errorInfo } = this.state;

    // Preparar el cuerpo del email con información del error
    const subject = encodeURIComponent('Reporte de Error - Prexiopá');
    const body = encodeURIComponent(
      `Descripción del problema:\n[Por favor describe qué estabas haciendo cuando ocurrió el error]\n\n` +
      `Detalles técnicos:\n` +
      `Error: ${error?.message || 'Unknown'}\n` +
      `Stack: ${error?.stack || 'No stack available'}\n` +
      `Component Stack: ${errorInfo?.componentStack || 'No component stack available'}`
    );

    // Abrir el cliente de email
    window.location.href = `mailto:soporte@prexiopa.com?subject=${subject}&body=${body}`;
  };

  render(): ReactNode {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback, showDetails = process.env.NODE_ENV === 'development' } = this.props;

    if (hasError) {
      // Si hay un fallback custom, usarlo
      if (fallback) {
        return fallback;
      }

      // UI de fallback por defecto
      return (
        <ErrorContainer role="alert">
          <IconWrapper>
            <FiAlertTriangle />
          </IconWrapper>

          <Title>¡Algo salió mal!</Title>

          <Message>
            Lo sentimos, ocurrió un error inesperado. Por favor recarga la página o intenta más tarde.
          </Message>

          <ActionsWrapper>
            <ActionButton
              $variant="primary"
              onClick={this.handleReload}
              type="button"
              aria-label="Recargar página"
            >
              <FiRefreshCw />
              <span>Recargar Página</span>
            </ActionButton>

            <ActionButton
              $variant="secondary"
              onClick={this.handleReportError}
              type="button"
              aria-label="Reportar problema"
            >
              <FiMail />
              <span>Reportar Problema</span>
            </ActionButton>
          </ActionsWrapper>

          {showDetails && error && (
            <DetailsWrapper>
              <DetailsSummary>Detalles técnicos (desarrollo)</DetailsSummary>
              <DetailsContent>
                <strong>Error:</strong> {error.toString()}
                {'\n\n'}
                <strong>Stack Trace:</strong>
                {'\n'}
                {error.stack}
                {errorInfo && (
                  <>
                    {'\n\n'}
                    <strong>Component Stack:</strong>
                    {'\n'}
                    {errorInfo.componentStack}
                  </>
                )}
              </DetailsContent>
            </DetailsWrapper>
          )}
        </ErrorContainer>
      );
    }

    return children;
  }
}

export default ErrorBoundary;
