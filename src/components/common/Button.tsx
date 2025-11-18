/**
 * Button Component
 *
 * A highly versatile button component with multiple variants, sizes, and states.
 * Fully accessible and optimized for rapid development.
 *
 * @example
 * ```tsx
 * // Primary CTA
 * <Button variant="primary" size="lg">Buscar Ofertas</Button>
 *
 * // With loading state
 * <Button variant="secondary" loading>Cargando...</Button>
 *
 * // With icon
 * <Button variant="outline" iconLeft={<SearchIcon />}>Buscar</Button>
 *
 * // Disabled state
 * <Button variant="primary" disabled>No disponible</Button>
 * ```
 */

import React from 'react';
import * as S from './Button.styles';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Visual style variant
   * - primary: Main CTAs, most important actions
   * - secondary: Supporting actions
   * - outline: Tertiary actions, cancellations
   * - ghost: Subtle actions, toolbar buttons
   * - danger: Destructive actions (delete, remove)
   */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';

  /**
   * Button size
   * - sm: 32px height, compact spaces
   * - md: 40px height, default size
   * - lg: 48px height, hero sections, mobile primary actions
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Shows loading spinner and disables interaction
   */
  loading?: boolean;

  /**
   * Makes button full width of container
   */
  fullWidth?: boolean;

  /**
   * Icon to display on the left side
   */
  iconLeft?: React.ReactNode;

  /**
   * Icon to display on the right side
   */
  iconRight?: React.ReactNode;

  /**
   * Disables the button
   */
  disabled?: boolean;

  /**
   * Button children (text or elements)
   */
  children?: React.ReactNode;

  /**
   * Click handler
   */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

/**
 * Button component with multiple variants and states
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      iconLeft,
      iconRight,
      disabled = false,
      children,
      onClick,
      type = 'button',
      ...rest
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (isDisabled) {
        event.preventDefault();
        return;
      }
      onClick?.(event);
    };

    return (
      <S.StyledButton
        ref={ref}
        variant={variant}
        size={size}
        fullWidth={fullWidth}
        disabled={isDisabled}
        loading={loading}
        onClick={handleClick}
        type={type}
        aria-busy={loading}
        aria-disabled={isDisabled}
        {...rest}
      >
        {loading && (
          <S.LoadingSpinner aria-label="Cargando" role="status">
            <S.Spinner />
          </S.LoadingSpinner>
        )}

        {!loading && iconLeft && (
          <S.IconWrapper position="left">
            {iconLeft}
          </S.IconWrapper>
        )}

        {children && (
          <S.ButtonText loading={loading}>
            {children}
          </S.ButtonText>
        )}

        {!loading && iconRight && (
          <S.IconWrapper position="right">
            {iconRight}
          </S.IconWrapper>
        )}
      </S.StyledButton>
    );
  }
);

Button.displayName = 'Button';

export default Button;
