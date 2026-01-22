import { useState, useCallback, useEffect } from 'react';
import { DeviceEventEmitter } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocalDateString } from '@/utils/dateUtils';

export interface DailyProgress {
  date: string;
  morningCompleted: boolean;
  eveningCompleted: boolean;
  morningTotal: number;
  eveningTotal: number;
  morningDone: number;
  eveningDone: number;
  snoozed: boolean;
  //🔥
  morningRoutines?: { text: string; completed: boolean }[];
  eveningRoutines?: { text: string; completed: boolean }[];
}

export function useDailyProgress() {
  const [progress, setProgress] = useState<DailyProgress | null>(null);

  // listen to data reset
  useEffect(() => {
    const handleDataReset = (data: { categories: string[], deletedKeys: string[], timestamp: number }) => {
      // check routines progress
      if (data.categories.includes('progress')) {
        // clean progress state
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
      
      // if no data then clean state
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

  // forced progress reset
  const refreshProgress = useCallback(async (date: Date = new Date()) => {
    return await loadProgress(date);
  }, [loadProgress]);

  return { 
    progress, 
    loadProgress, 
    saveProgress, 
    updateField, 
    refreshProgress, // forced refresh bitch
    getLocalDateString 
  };
}