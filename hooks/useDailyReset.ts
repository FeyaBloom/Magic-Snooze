import { useEffect, useRef } from 'react';

export function useDailyReset(onReset: () => void) {
  const timerRef = useRef(null);

  useEffect(() => {
    const now = new Date();
    const msUntilMidnight =
      new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() - now.getTime();

    timerRef.current = setTimeout(() => {
      onReset();
    }, msUntilMidnight);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [onReset]);
}
