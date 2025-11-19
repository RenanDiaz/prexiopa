import { useEffect, useCallback } from 'react';

/**
 * Custom hook to lock/unlock body scroll
 * Useful for modals, sidebars, and overlays
 *
 * @param {boolean} isLocked - Whether to lock the scroll (default: true)
 * @returns {{ lock: () => void, unlock: () => void }} Object with lock and unlock functions
 *
 * @example
 * ```tsx
 * const Modal = ({ isOpen, onClose }) => {
 *   // Automatically lock scroll when modal is open
 *   useScrollLock(isOpen);
 *
 *   if (!isOpen) return null;
 *
 *   return (
 *     <div className="modal">
 *       <div className="modal-content">
 *         <button onClick={onClose}>Close</button>
 *       </div>
 *     </div>
 *   );
 * };
 * ```
 *
 * @example
 * ```tsx
 * // Manual control
 * const Component = () => {
 *   const { lock, unlock } = useScrollLock(false);
 *
 *   return (
 *     <>
 *       <button onClick={lock}>Lock Scroll</button>
 *       <button onClick={unlock}>Unlock Scroll</button>
 *     </>
 *   );
 * };
 * ```
 */
export function useScrollLock(
  isLocked: boolean = true
): { lock: () => void; unlock: () => void } {
  /**
   * Lock the body scroll
   */
  const lock = useCallback(() => {
    // SSR safe check
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    const body = document.body;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    // Store original styles
    const originalOverflow = body.style.overflow;
    const originalPaddingRight = body.style.paddingRight;

    // Store in dataset for restoration
    body.dataset.scrollLock = 'true';
    body.dataset.originalOverflow = originalOverflow;
    body.dataset.originalPaddingRight = originalPaddingRight;

    // Apply scroll lock
    body.style.overflow = 'hidden';

    // Prevent layout shift by adding padding equal to scrollbar width
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }

    // Prevent touch scrolling on iOS
    const preventTouchMove = (e: TouchEvent) => {
      e.preventDefault();
    };

    document.addEventListener('touchmove', preventTouchMove, { passive: false });
    body.dataset.touchMoveListener = 'true';
  }, []);

  /**
   * Unlock the body scroll
   */
  const unlock = useCallback(() => {
    // SSR safe check
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    const body = document.body;

    // Only unlock if it was locked by this hook
    if (body.dataset.scrollLock !== 'true') {
      return;
    }

    // Restore original styles
    body.style.overflow = body.dataset.originalOverflow || '';
    body.style.paddingRight = body.dataset.originalPaddingRight || '';

    // Clean up dataset
    delete body.dataset.scrollLock;
    delete body.dataset.originalOverflow;
    delete body.dataset.originalPaddingRight;

    // Remove touch move listener
    if (body.dataset.touchMoveListener === 'true') {
      const preventTouchMove = (e: TouchEvent) => {
        e.preventDefault();
      };
      document.removeEventListener('touchmove', preventTouchMove);
      delete body.dataset.touchMoveListener;
    }
  }, []);

  useEffect(() => {
    if (isLocked) {
      lock();
    } else {
      unlock();
    }

    // Cleanup on unmount
    return () => {
      unlock();
    };
  }, [isLocked, lock, unlock]);

  return { lock, unlock };
}

/**
 * Hook variant that returns only the lock/unlock state without auto-applying
 * Useful when you want manual control without side effects
 */
export function useScrollLockManual(): {
  lock: () => void;
  unlock: () => void;
} {
  const lock = useCallback(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    const body = document.body;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    body.dataset.scrollLock = 'true';
    body.style.overflow = 'hidden';

    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }
  }, []);

  const unlock = useCallback(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    const body = document.body;

    if (body.dataset.scrollLock === 'true') {
      body.style.overflow = '';
      body.style.paddingRight = '';
      delete body.dataset.scrollLock;
    }
  }, []);

  return { lock, unlock };
}
