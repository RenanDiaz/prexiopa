import { useEffect } from 'react';
import type { RefObject } from 'react';

/**
 * Custom hook to detect clicks outside a referenced element
 *
 * @param {RefObject<HTMLElement>} ref - React ref of the element to detect outside clicks
 * @param {(event: MouseEvent | TouchEvent) => void} handler - Callback function to execute on outside click
 *
 * @example
 * ```tsx
 * const DropdownMenu = () => {
 *   const [isOpen, setIsOpen] = useState(false);
 *   const dropdownRef = useRef<HTMLDivElement>(null);
 *
 *   useOnClickOutside(dropdownRef, () => {
 *     setIsOpen(false);
 *   });
 *
 *   return (
 *     <div ref={dropdownRef}>
 *       <button onClick={() => setIsOpen(!isOpen)}>Toggle</button>
 *       {isOpen && <div>Dropdown content</div>}
 *     </div>
 *   );
 * };
 * ```
 */
export function useOnClickOutside<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>,
  handler: (event: MouseEvent | TouchEvent) => void
): void {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      const element = ref.current;

      // Do nothing if clicking ref's element or descendent elements
      if (!element || element.contains(event.target as Node)) {
        return;
      }

      // Call handler only if clicked outside
      handler(event);
    };

    // Add event listeners for both mouse and touch events
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    // Cleanup function to remove event listeners
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]); // Re-run if ref or handler changes
}

/**
 * Alternative hook that accepts multiple refs
 * Useful when you need to exclude multiple elements from triggering the outside click
 *
 * @example
 * ```tsx
 * const Modal = () => {
 *   const modalRef = useRef<HTMLDivElement>(null);
 *   const triggerRef = useRef<HTMLButtonElement>(null);
 *
 *   useOnClickOutsideMultiple([modalRef, triggerRef], () => {
 *     closeModal();
 *   });
 *
 *   return (
 *     <>
 *       <button ref={triggerRef}>Open Modal</button>
 *       <div ref={modalRef}>Modal content</div>
 *     </>
 *   );
 * };
 * ```
 */
export function useOnClickOutsideMultiple<T extends HTMLElement = HTMLElement>(
  refs: RefObject<T>[],
  handler: (event: MouseEvent | TouchEvent) => void
): void {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      // Check if the click is inside any of the refs
      const isInsideAnyRef = refs.some((ref) => {
        const element = ref.current;
        return element && element.contains(event.target as Node);
      });

      // If click is outside all refs, call the handler
      if (!isInsideAnyRef) {
        handler(event);
      }
    };

    // Add event listeners
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    // Cleanup
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [refs, handler]);
}
