/**
 * Modal Component
 *
 * A fully accessible modal dialog with backdrop, animations, and focus management.
 * Handles escape key, backdrop click, and maintains focus within the modal.
 *
 * @example
 * ```tsx
 * // Basic modal
 * <Modal open={isOpen} onClose={handleClose}>
 *   <Modal.Header>
 *     <h2>Confirmar acción</h2>
 *   </Modal.Header>
 *   <Modal.Body>
 *     <p>¿Estás seguro de que deseas continuar?</p>
 *   </Modal.Body>
 *   <Modal.Footer>
 *     <Button variant="outline" onClick={handleClose}>Cancelar</Button>
 *     <Button variant="primary" onClick={handleConfirm}>Confirmar</Button>
 *   </Modal.Footer>
 * </Modal>
 *
 * // Different sizes
 * <Modal open={isOpen} onClose={handleClose} size="lg">
 *   <Modal.Body>Large modal content</Modal.Body>
 * </Modal>
 *
 * // Prevent closing on backdrop click
 * <Modal open={isOpen} onClose={handleClose} closeOnBackdrop={false}>
 *   <Modal.Body>Important content</Modal.Body>
 * </Modal>
 * ```
 */

import React, { useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import * as S from './Modal.styles';

export interface ModalProps {
  /**
   * Controls modal visibility
   */
  open: boolean;

  /**
   * Callback when modal should close
   */
  onClose: () => void;

  /**
   * Modal size
   * - sm: 400px max width
   * - md: 600px max width
   * - lg: 800px max width
   * - full: Full screen modal
   */
  size?: 'sm' | 'md' | 'lg' | 'full';

  /**
   * Close modal when clicking backdrop
   */
  closeOnBackdrop?: boolean;

  /**
   * Close modal when pressing ESC key
   */
  closeOnEsc?: boolean;

  /**
   * Show close button in top right
   */
  showCloseButton?: boolean;

  /**
   * Modal content
   */
  children?: React.ReactNode;

  /**
   * Additional className for modal content
   */
  className?: string;
}

/**
 * Modal Root Component
 */
const ModalRoot: React.FC<ModalProps> = ({
  open,
  onClose,
  size = 'md',
  closeOnBackdrop = true,
  closeOnEsc = true,
  showCloseButton = true,
  children,
  className,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const isInitialMount = useRef(true);

  // Handle ESC key press
  const handleEscKey = useCallback(
    (event: KeyboardEvent) => {
      if (closeOnEsc && event.key === 'Escape') {
        onClose();
      }
    },
    [closeOnEsc, onClose]
  );

  // Handle backdrop click
  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnBackdrop && event.target === event.currentTarget) {
      onClose();
    }
  };

  // Manage focus and body scroll
  useEffect(() => {
    if (open) {
      // Only store active element and focus modal on initial mount
      if (isInitialMount.current) {
        previousActiveElement.current = document.activeElement as HTMLElement;
        // Focus modal container, not individual inputs
        setTimeout(() => {
          modalRef.current?.focus();
        }, 0);
        isInitialMount.current = false;
      }

      // Prevent body scroll
      document.body.style.overflow = 'hidden';

      // Add ESC listener
      document.addEventListener('keydown', handleEscKey);

      return () => {
        // Restore body scroll
        document.body.style.overflow = '';

        // Remove ESC listener
        document.removeEventListener('keydown', handleEscKey);

        // Restore focus on close
        if (!open) {
          previousActiveElement.current?.focus();
        }
      };
    } else {
      // Reset on close
      isInitialMount.current = true;
    }
  }, [open, handleEscKey]);

  if (!open) return null;

  const modalContent = (
    <S.ModalOverlay onClick={handleBackdropClick} role="presentation">
      <S.ModalWrapper
        ref={modalRef}
        size={size}
        className={className}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
      >
        {showCloseButton && (
          <S.CloseButton
            onClick={onClose}
            aria-label="Cerrar modal"
            type="button"
          >
            <S.CloseIcon>×</S.CloseIcon>
          </S.CloseButton>
        )}
        {children}
      </S.ModalWrapper>
    </S.ModalOverlay>
  );

  return createPortal(modalContent, document.body);
};

/**
 * Modal Header Component
 */
interface ModalHeaderProps {
  children?: React.ReactNode;
  className?: string;
}

const ModalHeader: React.FC<ModalHeaderProps> = React.memo(({ children, className }) => (
  <S.ModalHeader className={className}>{children}</S.ModalHeader>
));
ModalHeader.displayName = 'ModalHeader';

/**
 * Modal Body Component
 */
interface ModalBodyProps {
  children?: React.ReactNode;
  className?: string;
}

const ModalBody: React.FC<ModalBodyProps> = React.memo(({ children, className }) => (
  <S.ModalBody className={className}>{children}</S.ModalBody>
));
ModalBody.displayName = 'ModalBody';

/**
 * Modal Footer Component
 */
interface ModalFooterProps {
  children?: React.ReactNode;
  className?: string;
}

const ModalFooter: React.FC<ModalFooterProps> = React.memo(({ children, className }) => (
  <S.ModalFooter className={className}>{children}</S.ModalFooter>
));
ModalFooter.displayName = 'ModalFooter';

/**
 * Composite Modal Component with sub-components
 */
export const Modal = Object.assign(ModalRoot, {
  Header: ModalHeader,
  Body: ModalBody,
  Footer: ModalFooter,
});

export default Modal;
