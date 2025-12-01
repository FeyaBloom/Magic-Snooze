import { useCallback } from 'react';
import { useDailyProgress } from './useDailyProgress';

export function useRoutinesBlock() {
  const { progress, saveProgress, loadProgress, getLocalDateString } = useDailyProgress();

  const snoozeDay = useCallback(async () => {
    const today = new Date();
    const dateString = getLocalDateString(today);
 
    const existing = await loadProgress(today) || {
      date: dateString,
      morningCompleted: false,
      eveningCompleted: false,
      morningTotal: 0,
      eveningTotal: 0,
      morningDone: 0,
      eveningDone: 0,
      snoozed: false
    };

    existing.snoozed = true;
    await saveProgress(existing);
  }, [loadProgress, saveProgress, getLocalDateString]);

  const unsnoozeDay = useCallback(async () => {
    const today = new Date();
    const progressData = await loadProgress(today);
    if (!progressData) return;

    // ❗ Фикс бага: просто снимаем флаг, остальное сохраняем
    progressData.snoozed = false;
    await saveProgress(progressData);
  }, [loadProgress, saveProgress]);

  return { progress, snoozeDay, unsnoozeDay };
}
