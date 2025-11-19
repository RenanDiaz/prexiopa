/**
 * FavoritesList Styled Components
 * Theme-integrated styles for the favorites list
 */

import styled from 'styled-components';

export const FavoritesContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[6]};
`;

export const FavoritesHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[4]};
  padding-bottom: ${({ theme }) => theme.spacing[4]};
  border-bottom: 2px solid ${({ theme }) => theme.colors.border.light};

  @media (max-width: 767px) {
    flex-direction: column;
    align-items: flex-start;
    gap: ${({ theme }) => theme.spacing[3]};
  }
`;

export const FavoritesTitle = styled.h2`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
  margin: 0;
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text.primary};

  svg {
    width: 28px;
    height: 28px;
    color: ${({ theme }) => theme.colors.functional.favorite.main};
  }

  @media (max-width: 767px) {
    font-size: ${({ theme }) => theme.typography.fontSize.xl};

    svg {
      width: 24px;
      height: 24px;
    }
  }
`;

export const FavoritesCount = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  padding: 0 ${({ theme }) => theme.spacing[2]};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.functional.favorite.text};
  background-color: ${({ theme }) => theme.colors.functional.favorite.main};
  border-radius: ${({ theme }) => theme.borderRadius.full};
`;

export const ClearAllButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  height: 44px;
  padding: 0 ${({ theme }) => theme.spacing[5]};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.semantic.error.main};
  background-color: ${({ theme }) => theme.colors.background.paper};
  border: 2px solid ${({ theme }) => theme.colors.semantic.error.main};
  border-radius: ${({ theme }) => theme.borderRadius.button};
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  white-space: nowrap;

  svg {
    width: 18px;
    height: 18px;
  }

  &:hover:not(:disabled) {
    color: ${({ theme }) => theme.colors.semantic.error.contrast};
    background-color: ${({ theme }) => theme.colors.semantic.error.main};
    transform: translateY(-1px);
    box-shadow: ${({ theme }) => theme.shadows.md};
  }

  &:active:not(:disabled) {
    transform: translateY(0) scale(0.98);
  }

  &:disabled {
    color: ${({ theme }) => theme.colors.text.disabled};
    background-color: ${({ theme }) => theme.colors.background.disabled};
    border-color: ${({ theme }) => theme.colors.border.light};
    cursor: not-allowed;
    opacity: 0.6;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.border.focus};
    outline-offset: 2px;
  }

  @media (max-width: 767px) {
    width: 100%;
    justify-content: center;
    height: 48px;
    padding: 0 ${({ theme }) => theme.spacing[4]};
  }
`;

export const FavoritesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: ${({ theme }) => theme.spacing.layout.gapMd};
  width: 100%;

  /* Tablet: 2 columns */
  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }

  /* Desktop: 3 columns */
  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }

  /* Large desktop: 4 columns */
  @media (min-width: 1280px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

/* Empty State Styles */
export const EmptyStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing[5]};
  padding: ${({ theme }) => theme.spacing[12]} ${({ theme }) => theme.spacing[6]};
  text-align: center;
  min-height: 400px;

  @media (max-width: 767px) {
    padding: ${({ theme }) => theme.spacing[8]} ${({ theme }) => theme.spacing[4]};
    min-height: 300px;
  }
`;

export const EmptyStateIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 120px;
  color: ${({ theme }) => theme.colors.functional.favorite.main};
  background-color: ${({ theme }) => theme.colors.functional.favorite.light}33;
  border-radius: 50%;

  svg {
    width: 60px;
    height: 60px;
  }

  @media (max-width: 767px) {
    width: 80px;
    height: 80px;

    svg {
      width: 40px;
      height: 40px;
    }
  }
`;

export const EmptyStateTitle = styled.h3`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text.primary};

  @media (max-width: 767px) {
    font-size: ${({ theme }) => theme.typography.fontSize.xl};
  }
`;

export const EmptyStateMessage = styled.p`
  max-width: 500px;
  margin: 0;
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.regular};
  line-height: ${({ theme }) => theme.typography.lineHeight.relaxed};
  color: ${({ theme }) => theme.colors.text.secondary};

  @media (max-width: 767px) {
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
  }
`;

/* Error State Styles */
export const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing[8]} ${({ theme }) => theme.spacing[4]};
  text-align: center;
  min-height: 300px;
`;

export const ErrorMessage = styled.p`
  margin: 0;
  padding: ${({ theme }) => theme.spacing[4]} ${({ theme }) => theme.spacing[6]};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.semantic.error.main};
  background-color: ${({ theme }) => theme.colors.semantic.error.light}22;
  border: 1px solid ${({ theme }) => theme.colors.semantic.error.light};
  border-radius: ${({ theme }) => theme.borderRadius.md};

  @media (max-width: 767px) {
    padding: ${({ theme }) => theme.spacing[3]} ${({ theme }) => theme.spacing[4]};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
  }
`;
