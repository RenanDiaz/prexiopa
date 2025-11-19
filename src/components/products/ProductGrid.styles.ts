/**
 * ProductGrid Styled Components
 *
 * Responsive grid layout with mobile-first approach.
 * Uses CSS Grid for flexible, performance-optimized layouts.
 */

import styled from 'styled-components';

/**
 * Main Grid Container
 *
 * Responsive breakpoints:
 * - Mobile (<640px): 1 column
 * - Tablet (640px-1024px): 2 columns
 * - Desktop (1024px-1440px): 3 columns
 * - Large Desktop (>1440px): 4 columns
 */
export const GridContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${props => props.theme.spacing.layout.gapMd};
  width: 100%;

  /* Tablet - 2 columns */
  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
    gap: ${props => props.theme.spacing.layout.gapMd};
  }

  /* Desktop - 3 columns */
  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
    gap: ${props => props.theme.spacing.layout.gapLg};
  }

  /* Large Desktop - 4 columns */
  @media (min-width: 1440px) {
    grid-template-columns: repeat(4, 1fr);
    gap: ${props => props.theme.spacing.layout.gapLg};
  }

  /* Ensure cards maintain aspect ratio */
  > * {
    min-width: 0; /* Prevent grid blowout */
  }
`;

/**
 * Empty State Container
 *
 * Centered container for empty states.
 * Takes full width and centers content vertically.
 */
export const EmptyContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 400px;
  padding: ${props => props.theme.spacing[8]} ${props => props.theme.spacing[4]};

  @media (min-width: 768px) {
    min-height: 500px;
    padding: ${props => props.theme.spacing[12]} ${props => props.theme.spacing[6]};
  }
`;

/**
 * Loading State Container
 *
 * Similar to GridContainer but optimized for skeleton states
 */
export const LoadingContainer = styled(GridContainer)`
  /* Inherit all grid properties */
`;
