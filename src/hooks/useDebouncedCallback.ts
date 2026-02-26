import { useRef, useCallback } from "react";

/**
 * Returns a debounced version of the callback.
 * Only calls the function after `delayMs` of inactivity.
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => void>(
  callback: T,
  delayMs: number
): T {
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  return useCallback(
    ((...args: unknown[]) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => callback(...args), delayMs);
    }) as T,
    [callback, delayMs]
  );
}
