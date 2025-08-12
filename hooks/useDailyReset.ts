// hooks/useDailyReset.ts
import { useEffect, useRef } from 'react';

export function useDailyReset(onMidnight: () => void) {
  const lastDateRef = useRef(new Date().toDateString());

  useEffect(() => {
    const check = () => {
      const nowDate = new Date().toDateString();
      if (nowDate !== lastDateRef.current) {
        lastDateRef.current = nowDate;
        try { onMidnight(); } catch (e) { console.error('onMidnight error', e); }
      }
    };

    const msToNextMinute = (60 - new Date().getSeconds()) * 1000;
    // start at next minute, then every minute
    const startTimer = setTimeout(() => {
      check();
      const interval = setInterval(check, 60 * 1000);
      (startTimer as any).cleanup = () => clearInterval(interval);
    }, msToNextMinute);

    return () => {
      clearTimeout(startTimer);
      if ((startTimer as any).cleanup) (startTimer as any).cleanup();
    };
  }, [onMidnight]);
}
