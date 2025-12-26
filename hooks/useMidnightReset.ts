import { useEffect, useRef } from 'react';

export function useMidnightReset(onMidnight: () => void) {
  const lastDateRef = useRef(new Date().toDateString());

  useEffect(() => {
    const interval = setInterval(() => {
      const currentDate = new Date().toDateString();
      if (currentDate !== lastDateRef.current) {
        lastDateRef.current = currentDate;
        onMidnight();
      }
    }, 60000); // check every minute

    return () => clearInterval(interval);
  }, [onMidnight]);
}
 