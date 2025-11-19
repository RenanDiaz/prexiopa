import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for managing localStorage with type safety and synchronization
 *
 * @template T - The type of the stored value
 * @param {string} key - The localStorage key
 * @param {T} initialValue - The initial value if key doesn't exist
 * @returns {[T, (value: T | ((val: T) => T)) => void, () => void]}
 *   Tuple with [storedValue, setValue, removeValue]
 *
 * @example
 * ```tsx
 * const [user, setUser, removeUser] = useLocalStorage<User>('user', null);
 *
 * // Set value
 * setUser({ id: 1, name: 'John' });
 *
 * // Update with function
 * setUser(prev => ({ ...prev, name: 'Jane' }));
 *
 * // Remove value
 * removeUser();
 * ```
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(() => {
    // SSR safe check
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  /**
   * Return a wrapped version of useState's setter function that
   * persists the new value to localStorage
   */
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        // Allow value to be a function so we have same API as useState
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;

        // Save state
        setStoredValue(valueToStore);

        // SSR safe check
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));

          // Dispatch custom event to sync across tabs/windows
          window.dispatchEvent(
            new CustomEvent('local-storage', {
              detail: { key, value: valueToStore },
            })
          );
        }
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  /**
   * Remove the value from localStorage
   */
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);

      // SSR safe check
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);

        // Dispatch custom event to sync across tabs/windows
        window.dispatchEvent(
          new CustomEvent('local-storage', {
            detail: { key, value: undefined },
          })
        );
      }
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  /**
   * Listen for changes to localStorage from other tabs/windows
   */
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleStorageChange = (e: StorageEvent | CustomEvent) => {
      if (e instanceof StorageEvent) {
        // Native storage event from other tabs
        if (e.key === key && e.newValue) {
          try {
            setStoredValue(JSON.parse(e.newValue) as T);
          } catch (error) {
            console.error(`Error parsing localStorage value for key "${key}":`, error);
          }
        }
      } else {
        // Custom event from same tab
        const detail = (e as CustomEvent).detail;
        if (detail.key === key) {
          setStoredValue(detail.value ?? initialValue);
        }
      }
    };

    // Listen for storage events from other tabs
    window.addEventListener('storage', handleStorageChange as EventListener);

    // Listen for custom events from same tab
    window.addEventListener('local-storage', handleStorageChange as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange as EventListener);
      window.removeEventListener('local-storage', handleStorageChange as EventListener);
    };
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}
