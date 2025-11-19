/**
 * SearchBar Styled Components
 * Theme-integrated styles for the search bar component
 */

import styled from 'styled-components';

export const SearchBarContainer = styled.div`
  width: 100%;
  max-width: 100%;

  @media (min-width: 768px) {
    max-width: 600px;
  }

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
`;

export const SearchInputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  background-color: ${({ theme }) => theme.colors.background.paper};
  border: 1px solid ${({ theme }) => theme.colors.border.main};
  border-radius: ${({ theme }) => theme.borderRadius.input};
  transition: all 0.2s ease-in-out;

  &:focus-within {
    border-color: ${({ theme }) => theme.colors.border.focus};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.secondary[100]};
  }

  &:hover:not(:focus-within) {
    border-color: ${({ theme }) => theme.colors.border.strong};
  }
`;

export const SearchIcon = styled.div`
  position: absolute;
  left: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 20px;
  pointer-events: none;
  z-index: 1;

  svg {
    width: 20px;
    height: 20px;
  }
`;

export const SearchInput = styled.input`
  flex: 1;
  width: 100%;
  height: ${({ theme }) => theme.components.input.height.medium};
  padding: 0 ${({ theme }) => theme.spacing[4]};
  padding-left: 44px; /* Space for search icon */
  padding-right: 88px; /* Space for clear + scan buttons */
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.regular};
  color: ${({ theme }) => theme.colors.text.primary};
  background: transparent;
  border: none;
  outline: none;
  transition: all 0.2s ease-in-out;

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.hint};
  }

  &:disabled {
    color: ${({ theme }) => theme.colors.text.disabled};
    background-color: ${({ theme }) => theme.colors.background.disabled};
    cursor: not-allowed;
  }

  /* Mobile optimization */
  @media (max-width: 767px) {
    font-size: 16px; /* Prevents zoom on iOS */
    height: ${({ theme }) => theme.components.input.height.large};
  }
`;

export const ClearButton = styled.button`
  position: absolute;
  right: 52px; /* Space for scan button */
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  color: ${({ theme }) => theme.colors.text.secondary};
  background: transparent;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  svg {
    width: 18px;
    height: 18px;
  }

  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
    background-color: ${({ theme }) => theme.colors.neutral[100]};
  }

  &:active {
    transform: scale(0.95);
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.border.focus};
    outline-offset: 2px;
  }
`;

export const ScanButton = styled.button`
  position: absolute;
  right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  color: ${({ theme }) => theme.colors.secondary[500]};
  background-color: ${({ theme }) => theme.colors.secondary[50]};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  svg {
    width: 20px;
    height: 20px;
  }

  &:hover:not(:disabled) {
    color: ${({ theme }) => theme.colors.secondary[600]};
    background-color: ${({ theme }) => theme.colors.secondary[100]};
    transform: translateY(-1px);
  }

  &:active:not(:disabled) {
    transform: translateY(0) scale(0.95);
  }

  &:disabled {
    color: ${({ theme }) => theme.colors.text.disabled};
    background-color: ${({ theme }) => theme.colors.neutral[100]};
    cursor: not-allowed;
    opacity: 0.6;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.border.focus};
    outline-offset: 2px;
  }
`;
