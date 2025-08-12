// hooks/useDailyProgress.ts
import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface DailyProgress {
  date: string;
  morningCompleted: boolean;
  eveningCompleted: boolean;
  morningTotal: number;
  eveningTotal: number;
  morningDone: number;
  eveningDone: number;
  snoozed: boolean;
}

const dateToKey = (dateString: string) => `progress_${dateString}`;
const backupKey = (dateString: string) => `progress_backup_${dateString}`;

export const getLocalDateString = (date: Date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export function useDailyProgress() {
  const [progress, setProgress] = useState<DailyProgress | null>(null);

  const loadProgress = useCallback(async (date: Date = new Date()) => {
    const ds = getLocalDateString(date);
    try {
      const raw = await AsyncStorage.getItem(dateToKey(ds));
      if (raw) {
        const p = JSON.parse(raw) as DailyProgress;
        setProgress(p);
        return p;
      } else {
        setProgress(null);
        return null;
      }
    } catch (err) {
      console.error('loadProgress error', err);
      return null;
    }
  }, []);

  const saveProgress = useCallback(async (p: DailyProgress) => {
    try {
      await AsyncStorage.setItem(dateToKey(p.date), JSON.stringify(p));
      setProgress(p);
    } catch (err) {
      console.error('saveProgress error', err);
    }
  }, []);

  // Вычислить прогресс по текущим рутинам и сохранить
  const computeAndSaveFromRoutines = useCallback(
    async (
      dateString: string,
      morningRoutine: { id: string; completed: boolean }[],
      eveningRoutine: { id: string; completed: boolean }[],
      snoozed = false
    ) => {
      const morningDone = morningRoutine.filter(s => s.completed).length;
      const eveningDone = eveningRoutine.filter(s => s.completed).length;
      const p: DailyProgress = {
        date: dateString,
        morningCompleted: morningRoutine.length > 0 ? morningDone === morningRoutine.length : false,
        eveningCompleted: eveningRoutine.length > 0 ? eveningDone === eveningRoutine.length : false,
        morningTotal: morningRoutine.length,
        eveningTotal: eveningRoutine.length,
        morningDone,
        eveningDone,
        snoozed,
      };
      await saveProgress(p);
      return p;
    },
    [saveProgress]
  );

  // резервное копирование прогресса
  const backupProgress = useCallback(async (dateString: string) => {
    try {
      const raw = await AsyncStorage.getItem(dateToKey(dateString));
      if (raw) {
        await AsyncStorage.setItem(backupKey(dateString), raw);
      }
    } catch (err) {
      console.error('backupProgress error', err);
    }
  }, []);

  const restoreBackup = useCallback(async (dateString: string) => {
    try {
      const b = await AsyncStorage.getItem(backupKey(dateString));
      if (b) {
        await AsyncStorage.setItem(dateToKey(dateString), b);
        await AsyncStorage.removeItem(backupKey(dateString));
        const parsed = JSON.parse(b) as DailyProgress;
        setProgress(parsed);
        return parsed;
      }
      return null;
    } catch (err) {
      console.error('restoreBackup error', err);
      return null;
    }
  }, []);

  return {
    progress,
    loadProgress,
    saveProgress,
    computeAndSaveFromRoutines,
    backupProgress,
    restoreBackup,
    getLocalDateString,
  };
}
