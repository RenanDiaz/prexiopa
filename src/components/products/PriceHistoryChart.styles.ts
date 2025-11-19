/**
 * PriceHistoryChart Styles
 * Styled components for PriceHistoryChart component
 */

import styled, { keyframes } from 'styled-components';

/**
 * Skeleton loading animation
 */
const shimmer = keyframes`
  0% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.5;
  }
`;

/**
 * Main container for the chart
 */
export const ChartContainer = styled.div`
  width: 100%;
  padding: ${({ theme }) => theme.spacing[6]};
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.card};
  box-shadow: ${({ theme }) => theme.shadows.card};
  overflow: hidden;

  @media (max-width: 640px) {
    padding: ${({ theme }) => theme.spacing[4]};
  }
`;

/**
 * Header section with title and date range selector
 */
export const ChartHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[4]};
  margin-bottom: ${({ theme }) => theme.spacing[6]};

  @media (min-width: 768px) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
`;

/**
 * Chart title
 */
export const ChartTitle = styled.h3`
  ${({ theme }) => theme.typography.variants.h4};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;

  @media (max-width: 640px) {
    font-size: ${({ theme }) => theme.typography.fontSize.xl};
  }
`;

/**
 * Date range selector container
 */
export const DateRangeSelector = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[2]};
  background: ${({ theme }) => theme.colors.background.default};
  padding: ${({ theme }) => theme.spacing[1]};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  border: 1px solid ${({ theme }) => theme.colors.border.light};

  @media (max-width: 640px) {
    width: 100%;
  }
`;

/**
 * Date range button
 */
export const DateRangeButton = styled.button<{ $active?: boolean }>`
  flex: 1;
  padding: ${({ theme }) => `${theme.spacing[2]} ${theme.spacing[3]}`};
  background: ${({ theme, $active }) =>
    $active ? theme.colors.primary[500] : 'transparent'};
  color: ${({ theme, $active }) =>
    $active ? theme.colors.primary.contrast : theme.colors.text.secondary};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme, $active }) =>
    $active ? theme.typography.fontWeight.semibold : theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  min-width: 48px;

  &:hover:not(:disabled) {
    background: ${({ theme, $active }) =>
      $active ? theme.colors.primary[600] : theme.colors.neutral[100]};
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.border.focus};
    outline-offset: 2px;
  }

  @media (max-width: 640px) {
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
    padding: ${({ theme }) => `${theme.spacing[2]} ${theme.spacing[2]}`};
  }
`;

/**
 * Chart wrapper with responsive height
 */
export const ChartWrapper = styled.div<{ height: number }>`
  width: 100%;
  height: ${({ height }) => height}px;
  position: relative;

  /* Responsive height adjustments */
  @media (max-width: 640px) {
    height: ${({ height }) => Math.max(300, height * 0.75)}px;
  }

  /* Ensure chart text is readable */
  .recharts-text {
    font-family: ${({ theme }) => theme.typography.fontFamily.primary};
    fill: ${({ theme }) => theme.colors.text.secondary};
  }

  .recharts-cartesian-axis-tick-value {
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
  }

  /* Style the lines */
  .recharts-line {
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
  }

  /* Style the dots */
  .recharts-dot {
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.15));
  }
`;

/**
 * Loading skeleton container
 */
export const ChartLoadingSkeleton = styled.div<{ height: number }>`
  width: 100%;
  height: ${({ height }) => height}px;
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  gap: ${({ theme }) => theme.spacing[2]};
  padding: ${({ theme }) => theme.spacing[4]} 0;
  background: ${({ theme }) => theme.colors.background.default};
  border-radius: ${({ theme }) => theme.borderRadius.base};

  @media (max-width: 640px) {
    height: ${({ height }) => Math.max(300, height * 0.75)}px;
  }
`;

/**
 * Skeleton bar with animation
 */
export const SkeletonBar = styled.div`
  flex: 1;
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.colors.neutral[200]} 0%,
    ${({ theme }) => theme.colors.neutral[300]} 50%,
    ${({ theme }) => theme.colors.neutral[200]} 100%
  );
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  animation: ${shimmer} 1.5s ease-in-out infinite;
  min-width: 20px;
`;

/**
 * Custom tooltip container
 */
export const TooltipContainer = styled.div`
  background: ${({ theme }) => theme.colors.background.paper};
  border: 1px solid ${({ theme }) => theme.colors.border.light};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  padding: ${({ theme }) => theme.spacing[3]};
  box-shadow: ${({ theme }) => theme.shadows.dropdown};
  min-width: 160px;
`;

/**
 * Tooltip label (date)
 */
export const TooltipLabel = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing[2]};
  padding-bottom: ${({ theme }) => theme.spacing[2]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.light};
`;

/**
 * Tooltip item (store + price)
 */
export const TooltipItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[3]};
  padding: ${({ theme }) => theme.spacing[1]} 0;

  &:not(:last-child) {
    margin-bottom: ${({ theme }) => theme.spacing[1]};
  }
`;

/**
 * Tooltip store name
 */
export const TooltipStoreName = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
`;

/**
 * Tooltip price
 */
export const TooltipPrice = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: ${({ theme }) => theme.typography.fontFamily.mono};
`;

/**
 * Custom legend container
 */
export const LegendContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing[3]};
  justify-content: center;
  padding-top: ${({ theme }) => theme.spacing[4]};
  margin-top: ${({ theme }) => theme.spacing[4]};
  border-top: 1px solid ${({ theme }) => theme.colors.border.light};

  @media (max-width: 640px) {
    gap: ${({ theme }) => theme.spacing[2]};
    padding-top: ${({ theme }) => theme.spacing[3]};
    margin-top: ${({ theme }) => theme.spacing[3]};
  }
`;

/**
 * Legend item
 */
export const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
`;

/**
 * Legend color indicator
 */
export const LegendColor = styled.div`
  width: 16px;
  height: 16px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  flex-shrink: 0;
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

/**
 * Legend label
 */
export const LegendLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.secondary};

  @media (max-width: 640px) {
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
  }
`;
