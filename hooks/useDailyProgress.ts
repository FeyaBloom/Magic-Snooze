import { useState, useCallback, useEffect } from 'react';
import { DeviceEventEmitter } from 'react-native';
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
  // 🔥 
  morningRoutines?: { text: string; completed: boolean }[];
  eveningRoutines?: { text: string; completed: boolean }[];
}

const getLocalDateString = (date: Date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export function useDailyProgress() {
  const [progress, setProgress] = useState<DailyProgress | null>(null);

  // 🚀 НОВЫЙ ЭФФЕКТ: Слушатель событий сброса данных
  useEffect(() => {
    const handleDataReset = (data: { categories: string[], deletedKeys: string[], timestamp: number }) => {
      console.log('useDailyProgress received data reset event:', data);
      
      // Проверяем, затронул ли сброс прогресс рутин
      if (data.categories.includes('progress')) {
        console.log('Resetting daily progress state...');
        // Очищаем состояние прогресса
        setProgress(null);
      }
    };

    const listener = DeviceEventEmitter.addListener('dataReset', handleDataReset);
    
    return () => {
      listener.remove();
    };
  }, []);

  const loadProgress = useCallback(async (date: Date = new Date()) => {
    const dateString = getLocalDateString(date);
    
    try {
      const stored = await AsyncStorage.getItem(`progress_${dateString}`);
      if (stored) {
        const parsed: DailyProgress = JSON.parse(stored);
        setProgress(parsed);
        return parsed;
      }
      
      // Если данных нет, сбрасываем состояние
      setProgress(null);
      return null;
    } catch (error) {
      console.error('Error loading daily progress:', error);
      setProgress(null);
      return null;
    }
  }, []);

  const saveProgress = useCallback(async (data: DailyProgress) => {
    try {
      setProgress(data);
      await AsyncStorage.setItem(`progress_${data.date}`, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving daily progress:', error);
    }
  }, []);

  const updateField = useCallback(async (field: keyof DailyProgress, value: any) => {
    if (!progress) return;
    
    try {
      const updated = { ...progress, [field]: value };
      await saveProgress(updated);
    } catch (error) {
      console.error('Error updating progress field:', error);
    }
  }, [progress, saveProgress]);

  // 🔄 НОВАЯ ФУНКЦИЯ: Принудительная перезагрузка прогресса
  const refreshProgress = useCallback(async (date: Date = new Date()) => {
    console.log('Refreshing daily progress...');
    return await loadProgress(date);
  }, [loadProgress]);

  return { 
    progress, 
    loadProgress, 
    saveProgress, 
    updateField, 
    refreshProgress, // 🔥 Новый метод для принудительного обновления
    getLocalDateString 
  };
}