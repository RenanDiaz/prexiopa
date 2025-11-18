/**
 * ErrorMessage Component
 *
 * Componente para mostrar mensajes de error, warning o información inline.
 * Incluye soporte para títulos, acciones de reintentar y cerrar.
 *
 * @example
 * ```tsx
 * // Error simple
 * <ErrorMessage message="No se pudo cargar los productos" />
 *
 * // Error con título y acción de reintentar
 * <ErrorMessage
 *   variant="error"
 *   title="Error de conexión"
 *   message="No se pudo conectar al servidor. Por favor intenta de nuevo."
 *   onRetry={handleRetry}
 * />
 *
 * // Warning con dismiss
 * <ErrorMessage
 *   variant="warning"
 *   message="Tu sesión expirará en 5 minutos"
 *   onDismiss={handleDismiss}
 * />
 *
 * // Info
 * <ErrorMessage
 *   variant="info"
 *   title="Nueva función disponible"
 *   message="Ahora puedes guardar tus búsquedas favoritas"
 * />
 * ```
 */

import React from 'react';
import { FiAlertCircle, FiAlertTriangle, FiInfo, FiRefreshCw, FiX } from 'react-icons/fi';
import {
  ErrorContainer,
  IconWrapper,
  ContentWrapper,
  ErrorTitle,
  ErrorText,
  ActionsWrapper,
  ActionButton,
  DismissButton,
} from './ErrorMessage.styles';

export interface ErrorMessageProps {
  /** Mensaje de error a mostrar */
  message: string;
  /** Título opcional del error */
  title?: string;
  /** Variante visual del mensaje */
  variant?: 'error' | 'warning' | 'info';
  /** Callback para reintentar la acción que falló */
  onRetry?: () => void;
  /** Callback para cerrar/descartar el mensaje */
  onDismiss?: () => void;
  /** Texto del botón de reintentar */
  retryLabel?: string;
  /** Clase CSS adicional */
  className?: string;
  /** ID del elemento para testing */
  testId?: string;
}

/**
 * Componente ErrorMessage
 *
 * Muestra mensajes de error, warning o información con iconos,
 * títulos opcionales y acciones de reintentar o cerrar.
 */
export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  title,
  variant = 'error',
  onRetry,
  onDismiss,
  retryLabel = 'Reintentar',
  className,
  testId = 'error-message',
}) => {
  // Seleccionar el icono según la variante
  const IconComponent = {
    error: FiAlertCircle,
    warning: FiAlertTriangle,
    info: FiInfo,
  }[variant];

  // Determinar el rol ARIA según la variante
  const ariaRole = variant === 'error' ? 'alert' : variant === 'warning' ? 'alert' : 'status';

  return (
    <ErrorContainer
      $variant={variant}
      className={className}
      role={ariaRole}
      aria-live={variant === 'error' ? 'assertive' : 'polite'}
      data-testid={testId}
    >
      <IconWrapper $variant={variant} aria-hidden="true">
        <IconComponent />
      </IconWrapper>

      <ContentWrapper>
        {title && (
          <ErrorTitle $variant={variant}>
            {title}
          </ErrorTitle>
        )}

        <ErrorText $variant={variant}>
          {message}
        </ErrorText>

        {onRetry && (
          <ActionsWrapper>
            <ActionButton
              $variant="primary"
              onClick={onRetry}
              type="button"
              aria-label={retryLabel}
            >
              <FiRefreshCw />
              <span>{retryLabel}</span>
            </ActionButton>
          </ActionsWrapper>
        )}
      </ContentWrapper>

      {onDismiss && (
        <DismissButton
          onClick={onDismiss}
          type="button"
          aria-label="Cerrar mensaje"
        >
          <FiX />
        </DismissButton>
      )}
    </ErrorContainer>
  );
};

export default ErrorMessage;
