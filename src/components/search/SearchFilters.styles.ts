/**
 * SearchFilters Styled Components
 * Theme-integrated styles for the filters component
 */

import styled from 'styled-components';

export const FiltersContainer = styled.div`
  width: 100%;
  background-color: ${({ theme }) => theme.colors.background.paper};
  border: 1px solid ${({ theme }) => theme.colors.border.light};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;

  /* Screen reader only class */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }

  /* Mobile-only utility */
  .mobile-only {
    display: flex;

    @media (min-width: 768px) {
      display: none;
    }
  }
`;

export const FiltersHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
  padding: ${({ theme }) => theme.spacing[4]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.light};
  background-color: ${({ theme }) => theme.colors.neutral[50]};
`;

export const FiltersTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  margin: 0;
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.primary};

  svg {
    width: 20px;
    height: 20px;
    color: ${({ theme }) => theme.colors.primary[500]};
  }
`;

export const FilterBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 ${({ theme }) => theme.spacing[1]};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.primary.contrast};
  background-color: ${({ theme }) => theme.colors.primary[500]};
  border-radius: ${({ theme }) => theme.borderRadius.full};
`;

export const CollapseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  margin-left: auto;
  padding: 0;
  color: ${({ theme }) => theme.colors.text.secondary};
  background: transparent;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  svg {
    width: 20px;
    height: 20px;
  }

  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
    background-color: ${({ theme }) => theme.colors.neutral[100]};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.border.focus};
    outline-offset: 2px;
  }
`;

export const ClearFiltersButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
  padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[3]};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.semantic.error.main};
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.semantic.error.light};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  svg {
    width: 16px;
    height: 16px;
  }

  &:hover {
    color: ${({ theme }) => theme.colors.semantic.error.dark};
    background-color: ${({ theme }) => theme.colors.semantic.error.light}22;
    border-color: ${({ theme }) => theme.colors.semantic.error.main};
  }

  &:active {
    transform: scale(0.98);
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.border.focus};
    outline-offset: 2px;
  }

  @media (max-width: 767px) {
    padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[2]};
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
  }
`;

export const FiltersContent = styled.div<{ $isCollapsed: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[5]};
  padding: ${({ theme }) => theme.spacing[5]};
  transition: max-height 0.3s ease-in-out, opacity 0.3s ease-in-out;

  /* Mobile collapse animation */
  @media (max-width: 767px) {
    max-height: ${({ $isCollapsed }) => ($isCollapsed ? '0' : '1000px')};
    opacity: ${({ $isCollapsed }) => ($isCollapsed ? '0' : '1')};
    padding: ${({ $isCollapsed, theme }) =>
      $isCollapsed ? '0' : theme.spacing[5]};
    overflow: hidden;
  }
`;

export const FilterSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[3]};
`;

export const FilterLabel = styled.label`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const CategorySelect = styled.select`
  width: 100%;
  height: ${({ theme }) => theme.components.input.height.medium};
  padding: ${({ theme }) => theme.spacing[3]};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  color: ${({ theme }) => theme.colors.text.primary};
  background-color: ${({ theme }) => theme.colors.background.paper};
  border: 1px solid ${({ theme }) => theme.colors.border.main};
  border-radius: ${({ theme }) => theme.borderRadius.input};
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    border-color: ${({ theme }) => theme.colors.border.strong};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.border.focus};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.secondary[100]};
  }

  /* Remove default arrow in IE */
  &::-ms-expand {
    display: none;
  }
`;

export const StoresCheckboxList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
  max-height: 300px;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing[2]};
  border: 1px solid ${({ theme }) => theme.colors.border.light};
  border-radius: ${({ theme }) => theme.borderRadius.sm};

  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.neutral[100]};
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.neutral[300]};
    border-radius: 4px;

    &:hover {
      background: ${({ theme }) => theme.colors.neutral[400]};
    }
  }
`;

export const StoreCheckboxItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  padding: ${({ theme }) => theme.spacing[2]};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  transition: background-color 0.2s ease-in-out;

  &:hover {
    background-color: ${({ theme }) => theme.colors.neutral[50]};
  }
`;

export const StoreCheckbox = styled.input`
  width: 18px;
  height: 18px;
  margin: 0;
  cursor: pointer;
  accent-color: ${({ theme }) => theme.colors.primary[500]};

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.border.focus};
    outline-offset: 2px;
  }
`;

export const StoreLabel = styled.label`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.regular};
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  user-select: none;
`;

export const StoreLogo = styled.img`
  width: 24px;
  height: 24px;
  object-fit: contain;
  border-radius: ${({ theme }) => theme.borderRadius.xs};
`;

export const PriceRangeSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[4]};
`;

export const PriceRangeInputs = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};

  > span {
    color: ${({ theme }) => theme.colors.text.secondary};
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  }
`;

export const PriceInput = styled.input`
  width: 100%;
  max-width: 120px;
  height: 40px;
  padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[3]};
  font-family: ${({ theme }) => theme.typography.fontFamily.mono};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.primary};
  background-color: ${({ theme }) => theme.colors.background.paper};
  border: 1px solid ${({ theme }) => theme.colors.border.main};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  transition: all 0.2s ease-in-out;

  &:hover {
    border-color: ${({ theme }) => theme.colors.border.strong};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.border.focus};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.secondary[100]};
  }

  /* Remove spinner arrows */
  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  &[type='number'] {
    -moz-appearance: textfield;
  }
`;

export const PriceRangeSlider = styled.div`
  position: relative;
  height: 40px;
  padding: 0 ${({ theme }) => theme.spacing[2]};
`;

export const PriceSlider = styled.input<{ $isMin: boolean }>`
  position: absolute;
  width: calc(100% - ${({ theme }) => theme.spacing[4]});
  height: 8px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  appearance: none;
  background: transparent;
  outline: none;

  /* Track */
  &::-webkit-slider-track {
    width: 100%;
    height: 8px;
    background: ${({ theme, $isMin }) =>
      $isMin
        ? `linear-gradient(to right, ${theme.colors.neutral[200]} 0%, ${theme.colors.primary[500]} 100%)`
        : theme.colors.neutral[200]};
    border-radius: 4px;
  }

  &::-moz-range-track {
    width: 100%;
    height: 8px;
    background: ${({ theme }) => theme.colors.neutral[200]};
    border-radius: 4px;
  }

  /* Thumb */
  &::-webkit-slider-thumb {
    appearance: none;
    width: 20px;
    height: 20px;
    background: ${({ theme }) => theme.colors.primary[500]};
    border: 3px solid ${({ theme }) => theme.colors.background.paper};
    border-radius: 50%;
    cursor: pointer;
    pointer-events: all;
    box-shadow: ${({ theme }) => theme.shadows.md};
    transition: all 0.2s ease-in-out;

    &:hover {
      background: ${({ theme }) => theme.colors.primary[600]};
      transform: scale(1.1);
    }

    &:active {
      transform: scale(1.2);
    }
  }

  &::-moz-range-thumb {
    width: 20px;
    height: 20px;
    background: ${({ theme }) => theme.colors.primary[500]};
    border: 3px solid ${({ theme }) => theme.colors.background.paper};
    border-radius: 50%;
    cursor: pointer;
    pointer-events: all;
    box-shadow: ${({ theme }) => theme.shadows.md};
    transition: all 0.2s ease-in-out;

    &:hover {
      background: ${({ theme }) => theme.colors.primary[600]};
      transform: scale(1.1);
    }

    &:active {
      transform: scale(1.2);
    }
  }

  &:focus-visible {
    &::-webkit-slider-thumb {
      outline: 2px solid ${({ theme }) => theme.colors.border.focus};
      outline-offset: 2px;
    }

    &::-moz-range-thumb {
      outline: 2px solid ${({ theme }) => theme.colors.border.focus};
      outline-offset: 2px;
    }
  }
`;
