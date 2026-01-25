import { useEffect, useRef, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface MidnightResetConfig {
  onResetMorningRoutine: (routine: any[]) => Promise<void>;
  onResetEveningRoutine: (routine: any[]) => Promise<void>;
  onResetVictories: () => Promise<void>;
  onResetSnooze: () => void;
}

export function useMidnightReset(config: MidnightResetConfig) {
  const lastDateRef = useRef(new Date().toDateString());

  const performMidnightReset = useCallback(async () => {
    try {
      // Reset morning routine
      const morningData = await AsyncStorage.getItem('morningRoutine');
      if (morningData) {
        const morning = JSON.parse(morningData);
        const resetMorning = morning.map((step: any) => ({ ...step, completed: false }));
        await config.onResetMorningRoutine(resetMorning);
      }

      // Reset evening routine
      const eveningData = await AsyncStorage.getItem('eveningRoutine');
      if (eveningData) {
        const evening = JSON.parse(eveningData);
        const resetEvening = evening.map((step: any) => ({ ...step, completed: false }));
        await config.onResetEveningRoutine(resetEvening);
      }

      // Reset victories
      await config.onResetVictories();

      // Reset snooze status
      config.onResetSnooze();
    } catch (error) {
      console.error('[Midnight Reset] Error during reset:', error);
    }
  }, [config]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;

    const scheduleNextReset = () => {
      const now = new Date();
      const nextMidnight = new Date(now);
      nextMidnight.setHours(24, 0, 0, 0);
      const msUntilMidnight = nextMidnight.getTime() - now.getTime();

      timeoutId = setTimeout(async () => {
        const currentDate = new Date().toDateString();
        if (currentDate !== lastDateRef.current) {
          lastDateRef.current = currentDate;
          await performMidnightReset();
        }
        scheduleNextReset();
      }, msUntilMidnight);
    };

    scheduleNextReset();

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [performMidnightReset]);
}
 