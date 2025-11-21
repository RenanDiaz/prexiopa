/**
 * StoreList Component Styles
 */

import styled from 'styled-components';

export const Container = styled.div`
  width: 100%;
`;

export const LoadingWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.xl} 0;
  gap: ${({ theme }) => theme.spacing.md};
`;

export const LoadingText = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

interface GridProps {
  $layout: 'grid' | 'list';
}

export const Grid = styled.div<GridProps>`
  display: grid;
  gap: ${({ theme }) => theme.spacing.md};

  ${({ $layout }) => {
    if ($layout === 'grid') {
      return `
        grid-template-columns: 1fr;

        @media (min-width: 640px) {
          grid-template-columns: repeat(2, 1fr);
        }

        @media (min-width: 1024px) {
          grid-template-columns: repeat(3, 1fr);
        }
      `;
    } else {
      return `
        grid-template-columns: 1fr;
      `;
    }
  }}
`;
