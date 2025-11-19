/**
 * ProductList Styles
 * Styled components for ProductList component
 */

import styled from 'styled-components';

/**
 * Container for the product list
 * Handles spacing and alignment for loading/empty states
 */
export const ListContainer = styled.div`
  width: 100%;
  min-height: 400px;
`;

/**
 * Responsive product grid
 * Adapts columns based on screen size
 *
 * Breakpoints:
 * - Mobile: 1 column
 * - Tablet: 2 columns
 * - Desktop: 3 columns
 * - Large Desktop: 4 columns
 */
export const ProductGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.layout.gapMd};
  width: 100%;

  /* Mobile: 1 column */
  grid-template-columns: 1fr;

  /* Tablet: 2 columns */
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: ${({ theme }) => theme.spacing.layout.gapSm};
  }

  /* Desktop: 3 columns */
  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
    gap: ${({ theme }) => theme.spacing.layout.gapMd};
  }

  /* Large Desktop: 4 columns */
  @media (min-width: 1440px) {
    grid-template-columns: repeat(4, 1fr);
    gap: ${({ theme }) => theme.spacing.layout.gapLg};
  }
`;
