/**
 * Badge Styles
 * Styled-components for Badge component using theme system
 */

import styled, { css } from 'styled-components';
import type { BadgeProps } from './Badge';

const sizeStyles = {
  sm: css`
    height: ${({ theme }) => theme.components.badge.height};
    padding: ${({ theme }) => theme.components.badge.padding};
    font-size: ${({ theme }) => theme.components.badge.fontSize};
    font-weight: ${({ theme }) => theme.components.badge.fontWeight};
  `,
  md: css`
    height: 24px;
    padding: 0 10px;
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  `,
  lg: css`
    height: 32px;
    padding: 0 14px;
    font-size: ${({ theme }) => theme.typography.fontSize.base};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  `,
};

const variantStyles = {
  primary: css`
    background: ${({ theme }) => theme.colors.primary[500]};
    color: ${({ theme }) => theme.colors.primary.contrast};
  `,
  secondary: css`
    background: ${({ theme }) => theme.colors.secondary[500]};
    color: ${({ theme }) => theme.colors.secondary.contrast};
  `,
  success: css`
    background: ${({ theme }) => theme.colors.semantic.success.main};
    color: ${({ theme }) => theme.colors.semantic.success.contrast};
  `,
  warning: css`
    background: ${({ theme }) => theme.colors.semantic.warning.main};
    color: ${({ theme }) => theme.colors.semantic.warning.contrast};
  `,
  danger: css`
    background: ${({ theme }) => theme.colors.semantic.error.main};
    color: ${({ theme }) => theme.colors.semantic.error.contrast};
  `,
  info: css`
    background: ${({ theme }) => theme.colors.semantic.info.main};
    color: ${({ theme }) => theme.colors.semantic.info.contrast};
  `,
};

interface StyledBadgeProps {
  variant: NonNullable<BadgeProps['variant']>;
  size: NonNullable<BadgeProps['size']>;
  pill: boolean;
}

export const StyledBadge = styled.span<StyledBadgeProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing[1]};
  white-space: nowrap;
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  line-height: 1;
  vertical-align: middle;
  border-radius: ${({ pill, theme }) =>
    pill ? theme.borderRadius.badge : theme.borderRadius.sm};
  transition: all 200ms ease;

  ${({ size }) => sizeStyles[size]}
  ${({ variant }) => variantStyles[variant]}
`;

const dotVariantStyles = {
  primary: css`
    background: ${({ theme }) => theme.colors.primary[500]};
  `,
  secondary: css`
    background: ${({ theme }) => theme.colors.secondary[500]};
  `,
  success: css`
    background: ${({ theme }) => theme.colors.semantic.success.main};
  `,
  warning: css`
    background: ${({ theme }) => theme.colors.semantic.warning.main};
  `,
  danger: css`
    background: ${({ theme }) => theme.colors.semantic.error.main};
  `,
  info: css`
    background: ${({ theme }) => theme.colors.semantic.info.main};
  `,
};

export const DotIndicator = styled.span<{ variant: NonNullable<BadgeProps['variant']> }>`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  ${({ variant }) => dotVariantStyles[variant]}
`;
