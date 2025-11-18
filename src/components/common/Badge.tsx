/**
 * Badge Component
 *
 * A versatile badge component for displaying status, counts, or labels.
 * Perfect for notifications, product tags, and status indicators.
 *
 * @example
 * ```tsx
 * // Status badges
 * <Badge variant="success">Disponible</Badge>
 * <Badge variant="danger">Agotado</Badge>
 * <Badge variant="warning">Pocas unidades</Badge>
 *
 * // Notification count
 * <Badge variant="primary" size="sm">3</Badge>
 *
 * // Discount badge
 * <Badge variant="warning" size="lg">-25%</Badge>
 *
 * // With dot indicator
 * <Badge variant="info" dot>Nuevo</Badge>
 *
 * // Pill style
 * <Badge variant="secondary" pill>Supermercados</Badge>
 * ```
 */

import React from 'react';
import * as S from './Badge.styles';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /**
   * Visual style variant
   * - primary: Brand actions, main features
   * - secondary: Supporting information
   * - success: Positive states, availability
   * - warning: Alerts, discounts, attention needed
   * - danger: Errors, out of stock, critical states
   * - info: Informational, neutral messages
   */
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';

  /**
   * Badge size
   * - sm: Small badges for tight spaces (counts, indicators)
   * - md: Default size for most use cases
   * - lg: Large badges for emphasis (discounts, hero sections)
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Shows a dot indicator before the text
   */
  dot?: boolean;

  /**
   * Makes badge fully rounded (pill shape)
   */
  pill?: boolean;

  /**
   * Badge content
   */
  children?: React.ReactNode;
}

/**
 * Badge component for labels and status indicators
 */
export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      dot = false,
      pill = true,
      children,
      ...rest
    },
    ref
  ) => {
    return (
      <S.StyledBadge
        ref={ref}
        variant={variant}
        size={size}
        pill={pill}
        {...rest}
      >
        {dot && <S.DotIndicator variant={variant} />}
        {children}
      </S.StyledBadge>
    );
  }
);

Badge.displayName = 'Badge';

export default Badge;
