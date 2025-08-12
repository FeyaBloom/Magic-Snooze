import { useCallback } from 'react';

export function useRoutineManager({ progress, setProgress }) {
  const snoozeDay = useCallback(() => {
    if (!progress) return;
    setProgress({
      ...progress,
      snoozed: true
    });
  }, [progress, setProgress]);

  const unsnoozeDay = useCallback(() => {
    if (!progress) return;
    setProgress({
      ...progress,
      snoozed: false
    });
  }, [progress, setProgress]);

  return { snoozeDay, unsnoozeDay };
}
