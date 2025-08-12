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

const getLocalDateString = (date: Date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export function useDailyProgress() {
  const [progress, setProgress] = useState<DailyProgress | null>(null);

  const loadProgress = useCallback(async (date: Date = new Date()) => {
    const dateString = getLocalDateString(date);
    const stored = await AsyncStorage.getItem(`progress_${dateString}`);
    if (stored) {
      const parsed: DailyProgress = JSON.parse(stored);
      setProgress(parsed);
      return parsed;
    }
    return null;
  }, []);

  const saveProgress = useCallback(async (data: DailyProgress) => {
    setProgress(data);
    await AsyncStorage.setItem(`progress_${data.date}`, JSON.stringify(data));
  }, []);

  const updateField = useCallback(async (field: keyof DailyProgress, value: any) => {
    if (!progress) return;
    const updated = { ...progress, [field]: value };
    await saveProgress(updated);
  }, [progress, saveProgress]);

  return { progress, loadProgress, saveProgress, updateField, getLocalDateString };
}
