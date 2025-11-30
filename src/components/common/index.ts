/**
 * Common Components Barrel Export
 *
 * Centralized export for all common UI components.
 * This allows for clean imports throughout the application.
 *
 * @example
 * ```tsx
 * import { Button, Input, Card, Badge, Modal } from '@/components/common';
 * ```
 */

export { Button } from './Button';
export type { ButtonProps } from './Button';

export { Input } from './Input';
export type { InputProps } from './Input';

export { PriceInput } from './PriceInput';
export type { PriceInputProps } from './PriceInput';

export { BarcodeInput } from './BarcodeInput';
export type { BarcodeInputProps } from './BarcodeInput';

export { Card } from './Card';
export type { CardProps } from './Card';

export { Badge } from './Badge';
export type { BadgeProps } from './Badge';

export { Modal } from './Modal';
export type { ModalProps } from './Modal';

// Loading Components
export { LoadingSpinner } from './LoadingSpinner';
export type { LoadingSpinnerProps, SpinnerSize, SpinnerColor } from './LoadingSpinner';

export { LoadingState } from './LoadingState';
export type { LoadingStateProps } from './LoadingState';

export { Skeleton } from './Skeleton';
export type { SkeletonProps, SkeletonVariant } from './Skeleton';

// Error Handling Components
export { ErrorMessage } from './ErrorMessage';
export type { ErrorMessageProps } from './ErrorMessage';

export { ErrorBoundary } from './ErrorBoundary';
export type { ErrorBoundaryProps } from './ErrorBoundary';

export { EmptyState } from './EmptyState';
export type { EmptyStateProps } from './EmptyState';
