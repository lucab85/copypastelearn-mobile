import { useCallback, useRef } from "react";

/**
 * Throttle a callback to fire at most once every `delayMs`.
 * Unlike debounce, fires immediately and then waits.
 */
export function useThrottledCallback<T extends (...args: any[]) => void>(
  callback: T,
  delayMs: number
): T {
  const lastCallRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  return useCallback(
    (...args: any[]) => {
      const now = Date.now();
      const remaining = delayMs - (now - lastCallRef.current);

      if (remaining <= 0) {
        lastCallRef.current = now;
        callback(...args);
      } else if (!timerRef.current) {
        timerRef.current = setTimeout(() => {
          lastCallRef.current = Date.now();
          timerRef.current = undefined;
          callback(...args);
        }, remaining);
      }
    },
    [callback, delayMs]
  ) as T;
}
