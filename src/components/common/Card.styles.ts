/**
 * Card Styles
 * Styled-components for Card component using theme system
 */

import styled, { css } from 'styled-components';
import type { CardProps } from './Card';

const variantStyles = {
  default: css`
    background: ${({ theme }) => theme.colors.background.paper};
    border: 1px solid ${({ theme }) => theme.colors.border.light};
    box-shadow: none;
  `,
  elevated: css`
    background: ${({ theme }) => theme.colors.background.elevated};
    border: none;
    box-shadow: ${({ theme }) => theme.shadows.card};
  `,
  outlined: css`
    background: ${({ theme }) => theme.colors.background.paper};
    border: 2px solid ${({ theme }) => theme.colors.border.main};
    box-shadow: none;
  `,
};

const paddingStyles = {
  sm: css`
    padding: ${({ theme }) => theme.components.card.padding.small};
  `,
  md: css`
    padding: ${({ theme }) => theme.components.card.padding.medium};
  `,
  lg: css`
    padding: ${({ theme }) => theme.components.card.padding.large};
  `,
};

interface StyledCardProps {
  variant: NonNullable<CardProps['variant']>;
  clickable: boolean;
  padding: NonNullable<CardProps['padding']>;
}

export const StyledCard = styled.div<StyledCardProps>`
  display: flex;
  flex-direction: column;
  border-radius: ${({ theme }) => theme.borderRadius.card};
  overflow: hidden;
  transition: all ${({ theme }) => theme.spacing[0]} ease;

  ${({ variant }) => variantStyles[variant]}
  ${({ padding }) => paddingStyles[padding]}

  ${({ clickable, theme }) => clickable && css`
    cursor: pointer;
    user-select: none;

    &:hover {
      transform: translateY(-2px);
      box-shadow: ${theme.shadows.cardHover};
    }

    &:active {
      transform: translateY(0);
      box-shadow: ${theme.shadows.card};
    }

    &:focus-visible {
      outline: 2px solid ${theme.colors.border.focus};
      outline-offset: 2px;
    }
  `}

  /* Remove padding when using image */
  &:has(> div:first-child img) {
    padding: 0;
  }
`;

export const CardHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
  padding: ${({ theme }) => theme.components.card.padding.medium};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.light};

  /* If parent card has no padding, add it here */
  ${StyledCard}:has(&) {
    padding: 0;
  }
`;

export const CardBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[3]};
  padding: ${({ theme }) => theme.components.card.padding.medium};
  flex: 1;

  /* If parent card has no padding, add it here */
  ${StyledCard}:has(&) {
    padding: 0;
  }
`;

export const CardFooter = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  padding: ${({ theme }) => theme.components.card.padding.medium};
  border-top: 1px solid ${({ theme }) => theme.colors.border.light};

  /* If parent card has no padding, add it here */
  ${StyledCard}:has(&) {
    padding: 0;
  }
`;

export const CardImageWrapper = styled.div`
  position: relative;
  width: 100%;
  overflow: hidden;
`;

export const CardImage = styled.img`
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
  transition: transform 300ms ease;

  ${StyledCard}[clickable="true"]:hover & {
    transform: scale(1.05);
  }
`;
