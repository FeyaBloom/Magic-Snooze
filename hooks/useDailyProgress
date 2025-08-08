import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface RoutineStep {
  id: string;
  text: string;
  completed: boolean;
}

interface DailyProgress {
  date: string;
  morningCompleted: boolean;
  eveningCompleted: boolean;
  morningTotal: number;
  eveningTotal: number;
  morningDone: number;
  eveningDone: number;
  snoozed: boolean;
}

export const useDailyProgress = () => {
  const [todayProgress, setTodayProgress] = useState<DailyProgress | null>(null);
  const [isSnoozed, setIsSnoozed] = useState(false);

  const getLocalDateString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const today = getLocalDateString();

  const loadProgress = async () => {
    try {
      const progressData = await AsyncStorage.getItem(`progress_${today}`);
      if (progressData) {
        const progress = JSON.parse(progressData);
        setTodayProgress(progress);
        setIsSnoozed(progress.snoozed);
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  const saveProgress = async (morning: RoutineStep[], evening: RoutineStep[]) => {
    try {
      const morningDone = morning.filter(step => step.completed).length;
      const eveningDone = evening.filter(step => step.completed).length;
      
      const progress: DailyProgress = {
        date: today,
        morningCompleted: morningDone === morning.length,
        eveningCompleted: eveningDone === evening.length,
        morningTotal: morning.length,
        eveningTotal: evening.length,
        morningDone,
        eveningDone,
        snoozed: isSnoozed,
      };
      
      await AsyncStorage.setItem(`progress_${today}`, JSON.stringify(progress));
      setTodayProgress(progress);
      
      return progress;
    } catch (error) {
      console.error('Error saving progress:', error);
      return null;
    }
  };

  const snoozeToday = async (morning: RoutineStep[], evening: RoutineStep[]) => {
    const newSnoozed = !isSnoozed;
    setIsSnoozed(newSnoozed);
    
    try {
      const progress: DailyProgress = {
        date: today,
        morningCompleted: false,
        eveningCompleted: false,
        morningTotal: morning.length,
        eveningTotal: evening.length,
        morningDone: 0,
        eveningDone: 0,
        snoozed: newSnoozed,
      };
      
      await AsyncStorage.setItem(`progress_${today}`, JSON.stringify(progress));
      setTodayProgress(progress);
      
      return newSnoozed;
    } catch (error) {
      console.error('Error snoozing day:', error);
      return isSnoozed;
    }
  };

  const resetProgress = () => {
    setTodayProgress(null);
    setIsSnoozed(false);
  };

  useEffect(() => {
    loadProgress();
  }, [today]);

  return {
    todayProgress,
    isSnoozed,
    saveProgress,
    snoozeToday,
    resetProgress,
    loadProgress,
  };
};