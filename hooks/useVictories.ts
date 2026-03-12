import { useState, useEffect, useRef, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocalDateString } from '@/utils/dateUtils';

export const useVictories = () => {
  const [celebratedVictories, setCelebratedVictories] = useState<string[]>([]);
  const queueRef = useRef(Promise.resolve());

  const getTodayKey = () => `victories_${getLocalDateString()}`;

  const runInQueue = async <T>(operation: () => Promise<T>): Promise<T> => {
    const previous = queueRef.current;
    let release: () => void = () => {};

    queueRef.current = new Promise<void>((resolve) => {
      release = resolve;
    });

    await previous;

    try {
      return await operation();
    } finally {
      release();
    }
  };

  const loadCelebratedVictories = useCallback(async () => {
    try {
      const victories = await AsyncStorage.getItem(getTodayKey());
      if (victories) {
        setCelebratedVictories(JSON.parse(victories));
      } else {
        setCelebratedVictories([]);
      }
    } catch (error) {
      console.error('Error loading victories:', error);
    }
  }, []);

  const celebrateVictory = useCallback(async (victory: string) => {
    return runInQueue(async () => {
      try {
        const key = getTodayKey();
        const rawVictories = await AsyncStorage.getItem(key);
        const currentVictories: string[] = rawVictories ? JSON.parse(rawVictories) : [];

        // "Slept well" can only be celebrated once per day.
        if (victory === 'bed' && currentVictories.includes('bed')) {
          setCelebratedVictories(currentVictories);
          return currentVictories;
        }

        const newVictories = [...currentVictories, victory];
        setCelebratedVictories(newVictories);
        await AsyncStorage.setItem(key, JSON.stringify(newVictories));

        return newVictories;
      } catch (error) {
        console.error('Error saving victory:', error);
        return celebratedVictories;
      }
    });
  }, [celebratedVictories]);

  const resetVictories = useCallback(async () => {
    try {
      setCelebratedVictories([]);
      await AsyncStorage.removeItem(getTodayKey());
    } catch (error) {
      console.error('Error resetting victories:', error);
    }
  }, []);

  useEffect(() => {
    loadCelebratedVictories();
  }, [loadCelebratedVictories]);

  return {
    celebratedVictories,
    celebrateVictory,
    resetVictories,
    loadCelebratedVictories,
  };
};