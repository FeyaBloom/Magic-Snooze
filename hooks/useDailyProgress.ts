import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useDailyProgress(dateString: string) {
  const [progress, setProgress] = useState(null);

  const loadProgress = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(`progress_${dateString}`);
      if (stored) {
        setProgress(JSON.parse(stored));
      } else {
        setProgress(null);
      }
    } catch (e) {
      console.error('Error loading progress:', e);
    }
  }, [dateString]);

  const saveProgress = useCallback(async (newProgress) => {
    try {
      setProgress(newProgress);
      await AsyncStorage.setItem(`progress_${dateString}`, JSON.stringify(newProgress));
    } catch (e) {
      console.error('Error saving progress:', e);
    }
  }, [dateString]);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  return { progress, setProgress: saveProgress, reloadProgress: loadProgress };
}
