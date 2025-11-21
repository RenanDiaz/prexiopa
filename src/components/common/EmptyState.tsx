/**
 * EmptyState Component
 *
 * Componente para mostrar estados vacíos cuando no hay datos disponibles.
 * Útil para listas vacías, búsquedas sin resultados, favoritos vacíos, etc.
 *
 * @example
 * ```tsx
 * // Estado vacío simple
 * <EmptyState
 *   icon={FiSearch}
 *   title="No se encontraron resultados"
 *   message="Intenta con otros términos de búsqueda"
 * />
 *
 * // Con acción
 * <EmptyState
 *   icon={FiHeart}
 *   title="No tienes productos favoritos"
 *   message="Guarda productos para compararlos más tarde"
 *   actionLabel="Explorar Productos"
 *   onAction={() => navigate('/productos')}
 * />
 *
 * // Con ilustración
 * <EmptyState
 *   illustration="/images/empty-cart.svg"
 *   title="Tu carrito está vacío"
 *   message="Agrega productos para comenzar a comparar precios"
 *   actionLabel="Ver Ofertas"
 *   onAction={handleViewDeals}
 * />
 *
 * // Con texto secundario
 * <EmptyState
 *   icon={FiAlertCircle}
 *   title="No hay alertas activas"
 *   message="Crea alertas para recibir notificaciones cuando bajen los precios"
 *   actionLabel="Crear Alerta"
 *   onAction={handleCreateAlert}
 *   secondaryText="Las alertas te ayudan a ahorrar en tus productos favoritos"
 * />
 * ```
 */

import React from 'react';
import { type IconType } from 'react-icons';
import {
  EmptyContainer,
  IconWrapper,
  IllustrationWrapper,
  Title,
  Message,
  ActionButton,
  SecondaryText,
} from './EmptyState.styles';

export interface EmptyStateProps {
  /** Icono a mostrar (react-icons) */
  icon?: IconType;
  /** URL de imagen/ilustración alternativa al icono */
  illustration?: string;
  /** Título del estado vacío */
  title: string;
  /** Mensaje descriptivo */
  message: string;
  /** Texto del botón de acción (opcional) */
  actionLabel?: string;
  /** Callback cuando se hace click en el botón de acción */
  onAction?: () => void;
  /** Texto secundario adicional (opcional) */
  secondaryText?: string;
  /** Clase CSS adicional */
  className?: string;
  /** ID del elemento para testing */
  testId?: string;
}

/**
 * Componente EmptyState
 *
 * Muestra una interfaz amigable cuando no hay datos disponibles,
 * con opción de icono o ilustración, mensaje y acción opcional.
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  illustration,
  title,
  message,
  actionLabel,
  onAction,
  secondaryText,
  className,
  testId = 'empty-state',
}) => {
  return (
    <EmptyContainer className={className} data-testid={testId}>
      {illustration ? (
        <IllustrationWrapper>
          <img
            src={illustration}
            alt={title}
            loading="lazy"
          />
        </IllustrationWrapper>
      ) : Icon ? (
        <IconWrapper aria-hidden="true">
          <Icon />
        </IconWrapper>
      ) : null}

      <Title>{title}</Title>

      <Message>{message}</Message>

      {actionLabel && onAction && (
        <ActionButton
          onClick={onAction}
          type="button"
          aria-label={actionLabel}
        >
          <span>{actionLabel}</span>
        </ActionButton>
      )}

      {secondaryText && (
        <SecondaryText>{secondaryText}</SecondaryText>
      )}
    </EmptyContainer>
  );
};

export default EmptyState;
