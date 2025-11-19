import { useState, useCallback } from 'react';

/**
 * Custom hook for toggling boolean values with utility functions
 *
 * @param {boolean} initialValue - The initial boolean value (default: false)
 * @returns {[boolean, () => void, () => void, () => void]}
 *   Tuple with [value, toggle, setTrue, setFalse]
 *
 * @example
 * ```tsx
 * const Modal = () => {
 *   const [isOpen, toggle, open, close] = useToggle(false);
 *
 *   return (
 *     <>
 *       <button onClick={open}>Open Modal</button>
 *       {isOpen && (
 *         <div>
 *           <h2>Modal Content</h2>
 *           <button onClick={close}>Close</button>
 *           <button onClick={toggle}>Toggle</button>
 *         </div>
 *       )}
 *     </>
 *   );
 * };
 * ```
 */
export function useToggle(
  initialValue: boolean = false
): [boolean, () => void, () => void, () => void] {
  const [value, setValue] = useState<boolean>(initialValue);

  /**
   * Toggle the current value
   */
  const toggle = useCallback(() => {
    setValue((prev) => !prev);
  }, []);

  /**
   * Set value to true
   */
  const setTrue = useCallback(() => {
    setValue(true);
  }, []);

  /**
   * Set value to false
   */
  const setFalse = useCallback(() => {
    setValue(false);
  }, []);

  return [value, toggle, setTrue, setFalse];
}

/**
 * Alternative version that returns an object instead of tuple
 * Some developers prefer this API for better readability
 *
 * @example
 * ```tsx
 * const Sidebar = () => {
 *   const sidebar = useToggleObject(false);
 *
 *   return (
 *     <>
 *       <button onClick={sidebar.toggle}>Toggle Sidebar</button>
 *       <aside className={sidebar.value ? 'open' : 'closed'}>
 *         <button onClick={sidebar.setFalse}>Close</button>
 *       </aside>
 *     </>
 *   );
 * };
 * ```
 */
export function useToggleObject(initialValue: boolean = false) {
  const [value, toggle, setTrue, setFalse] = useToggle(initialValue);

  return {
    value,
    toggle,
    setTrue,
    setFalse,
    on: setTrue,
    off: setFalse,
  };
}
