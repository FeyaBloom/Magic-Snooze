import { useCallback, useEffect, useRef, useState } from 'react';
import { DeviceEventEmitter } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import type { DailyProgress } from '@/hooks/useDailyProgress';

export type RoutineType = 'morning' | 'evening';

export interface RoutineStep {
  id: string;
  text: string;
  completed: boolean;
  translationKey?: string;
}

const DEFAULT_ROUTINE_KEYS = {
  morning: {
    '1': 'today.defaultMorning.stretch',
    '2': 'today.defaultMorning.breathing',
    '3': 'today.defaultMorning.intention',
  },
  evening: {
    '1': 'today.defaultEvening.reflect',
    '2': 'today.defaultEvening.selfCare',
    '3': 'today.defaultEvening.prepare',
  },
} as const;

interface UseRoutineManagerParams {
  t: (key: string) => string;
  getLocalDateString: () => string;
  saveProgress: (data: DailyProgress) => Promise<void>;
  updateStreak: (hasActivity: boolean) => Promise<void>;
  blockDay?: () => Promise<void>;
  unblockDay?: () => Promise<void>;
}

export function useRoutineManager({
  t,
  getLocalDateString,
  saveProgress,
  updateStreak,
  blockDay,
  unblockDay,
}: UseRoutineManagerParams) {
  const [morningRoutine, setMorningRoutine] = useState<RoutineStep[]>([]);
  const [eveningRoutine, setEveningRoutine] = useState<RoutineStep[]>([]);
  const [isSnoozed, setIsSnoozed] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const streakUpdateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveProgressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingProgress = useRef<{ morning: RoutineStep[]; evening: RoutineStep[] } | null>(null);

  const normalizeRoutine = useCallback((routine: RoutineStep[], routineType: RoutineType) => {
    const keys = DEFAULT_ROUTINE_KEYS[routineType] as Record<string, string>;
    return routine.map((step) => {
      if (step.translationKey) return step;
      const translationKey = keys[step.id];
      return translationKey ? { ...step, translationKey } : step;
    });
  }, []);

  const resolveStepText = useCallback((step: RoutineStep) => {
    return step.translationKey ? t(step.translationKey) : step.text;
  }, [t]);

  const scheduleStreakUpdate = useCallback((hasActivity: boolean) => {
    if (streakUpdateTimer.current) {
      clearTimeout(streakUpdateTimer.current);
    }

    streakUpdateTimer.current = setTimeout(() => {
      void updateStreak(hasActivity);
    }, 300);
  }, [updateStreak]);

  const saveProgressData = useCallback(async (morning: RoutineStep[], evening: RoutineStep[]) => {
    try {
      const morningDone = morning.filter((step) => step.completed).length;
      const eveningDone = evening.filter((step) => step.completed).length;
      const today = getLocalDateString();

      const progressData: DailyProgress = {
        date: today,
        morningCompleted: morningDone === morning.length,
        eveningCompleted: eveningDone === evening.length,
        morningTotal: morning.length,
        eveningTotal: evening.length,
        morningDone,
        eveningDone,
        snoozed: isSnoozed,
        morningRoutines: morning.map((step) => ({ text: resolveStepText(step), completed: step.completed })),
        eveningRoutines: evening.map((step) => ({ text: resolveStepText(step), completed: step.completed })),
      };

      await saveProgress(progressData);
      scheduleStreakUpdate(true);
      DeviceEventEmitter.emit('progressChanged', { timestamp: Date.now() });
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  }, [getLocalDateString, isSnoozed, resolveStepText, saveProgress, scheduleStreakUpdate]);

  const scheduleSaveProgress = useCallback((morning: RoutineStep[], evening: RoutineStep[]) => {
    pendingProgress.current = { morning, evening };

    if (saveProgressTimer.current) {
      clearTimeout(saveProgressTimer.current);
    }

    saveProgressTimer.current = setTimeout(() => {
      const payload = pendingProgress.current;
      if (!payload) return;
      void saveProgressData(payload.morning, payload.evening);
    }, 120);
  }, [saveProgressData]);

  const buildDefaultRoutine = useCallback((routineType: RoutineType): RoutineStep[] => {
    const keys = DEFAULT_ROUTINE_KEYS[routineType];
    return [
      { id: '1', text: '', completed: false, translationKey: keys['1'] },
      { id: '2', text: '', completed: false, translationKey: keys['2'] },
      { id: '3', text: '', completed: false, translationKey: keys['3'] },
    ];
  }, []);

  const loadDefaultRoutines = useCallback(async () => {
    try {
      const defaultMorning = buildDefaultRoutine('morning');
      const defaultEvening = buildDefaultRoutine('evening');

      setMorningRoutine(defaultMorning);
      setEveningRoutine(defaultEvening);

      await Promise.all([
        AsyncStorage.setItem('morningRoutine', JSON.stringify(defaultMorning)),
        AsyncStorage.setItem('eveningRoutine', JSON.stringify(defaultEvening)),
      ]);
    } catch (error) {
      console.error('Error loading default routines:', error);
    }
  }, [buildDefaultRoutine]);

  const resetRoutineCheckboxes = useCallback(async () => {
    try {
      const [morningData, eveningData] = await Promise.all([
        AsyncStorage.getItem('morningRoutine'),
        AsyncStorage.getItem('eveningRoutine'),
      ]);

      if (morningData) {
        const currentMorning = JSON.parse(morningData);
        const resetMorning = currentMorning.map((step: RoutineStep) => ({ ...step, completed: false }));
        setMorningRoutine(resetMorning);
        await AsyncStorage.setItem('morningRoutine', JSON.stringify(resetMorning));
      }

      if (eveningData) {
        const currentEvening = JSON.parse(eveningData);
        const resetEvening = currentEvening.map((step: RoutineStep) => ({ ...step, completed: false }));
        setEveningRoutine(resetEvening);
        await AsyncStorage.setItem('eveningRoutine', JSON.stringify(resetEvening));
      }
    } catch (error) {
      console.error('Error resetting routine checkboxes:', error);
    }
  }, []);

  const loadData = useCallback(async () => {
    try {
      const currentDate = getLocalDateString();

      const [morningData, eveningData, progressData, lastProgressDate] = await Promise.all([
        AsyncStorage.getItem('morningRoutine'),
        AsyncStorage.getItem('eveningRoutine'),
        AsyncStorage.getItem(`progress_${currentDate}`),
        AsyncStorage.getItem('lastProgressDate'),
      ]);

      const needsReset = lastProgressDate !== currentDate;

      if (morningData) {
        const parsedMorning = JSON.parse(morningData);
        const normalizedMorning = normalizeRoutine(parsedMorning, 'morning');

        if (needsReset) {
          const resetMorning = normalizedMorning.map((step: RoutineStep) => ({ ...step, completed: false }));
          await AsyncStorage.setItem('morningRoutine', JSON.stringify(resetMorning));
          setMorningRoutine(resetMorning);
        } else {
          setMorningRoutine(normalizedMorning);
          if (JSON.stringify(normalizedMorning) !== JSON.stringify(parsedMorning)) {
            await AsyncStorage.setItem('morningRoutine', JSON.stringify(normalizedMorning));
          }
        }
      } else {
        const defaultMorning = buildDefaultRoutine('morning');
        setMorningRoutine(defaultMorning);
        await AsyncStorage.setItem('morningRoutine', JSON.stringify(defaultMorning));
      }

      if (eveningData) {
        const parsedEvening = JSON.parse(eveningData);
        const normalizedEvening = normalizeRoutine(parsedEvening, 'evening');

        if (needsReset) {
          const resetEvening = normalizedEvening.map((step: RoutineStep) => ({ ...step, completed: false }));
          await AsyncStorage.setItem('eveningRoutine', JSON.stringify(resetEvening));
          setEveningRoutine(resetEvening);
        } else {
          setEveningRoutine(normalizedEvening);
          if (JSON.stringify(normalizedEvening) !== JSON.stringify(parsedEvening)) {
            await AsyncStorage.setItem('eveningRoutine', JSON.stringify(normalizedEvening));
          }
        }
      } else {
        const defaultEvening = buildDefaultRoutine('evening');
        setEveningRoutine(defaultEvening);
        await AsyncStorage.setItem('eveningRoutine', JSON.stringify(defaultEvening));
      }

      if (needsReset) {
        await AsyncStorage.setItem('lastProgressDate', currentDate);
      }

      if (progressData) {
        const progress = JSON.parse(progressData);
        setIsSnoozed(progress.snoozed || false);
      }

      setIsLoaded(true);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }, [buildDefaultRoutine, getLocalDateString, normalizeRoutine]);

  const toggleStep = useCallback(async (stepId: string, routineType: RoutineType) => {
    if (isSnoozed) return;

    const currentRoutine = routineType === 'morning' ? morningRoutine : eveningRoutine;
    const setRoutine = routineType === 'morning' ? setMorningRoutine : setEveningRoutine;

    const updated = currentRoutine.map((step) =>
      step.id === stepId ? { ...step, completed: !step.completed } : step
    );

    setRoutine(updated);
    await AsyncStorage.setItem(`${routineType}Routine`, JSON.stringify(updated));

    const otherRoutine = routineType === 'morning' ? eveningRoutine : morningRoutine;
    scheduleSaveProgress(
      routineType === 'morning' ? updated : otherRoutine,
      routineType === 'evening' ? updated : otherRoutine
    );
  }, [eveningRoutine, isSnoozed, morningRoutine, scheduleSaveProgress]);

  const addStep = useCallback(async (routineType: RoutineType, text: string) => {
    if (!text.trim()) return false;

    const newStep: RoutineStep = {
      id: Date.now().toString(),
      text: text.trim(),
      completed: false,
    };

    const routine = routineType === 'morning' ? morningRoutine : eveningRoutine;
    const setRoutine = routineType === 'morning' ? setMorningRoutine : setEveningRoutine;
    const updated = [...routine, newStep];

    setRoutine(updated);
    await AsyncStorage.setItem(`${routineType}Routine`, JSON.stringify(updated));

    const otherRoutine = routineType === 'morning' ? eveningRoutine : morningRoutine;
    scheduleSaveProgress(
      routineType === 'morning' ? updated : otherRoutine,
      routineType === 'evening' ? updated : otherRoutine
    );

    return true;
  }, [eveningRoutine, morningRoutine, scheduleSaveProgress]);

  const editStep = useCallback(async (routineType: RoutineType, stepId: string, text: string) => {
    if (!text.trim()) return false;

    const routine = routineType === 'morning' ? morningRoutine : eveningRoutine;
    const setRoutine = routineType === 'morning' ? setMorningRoutine : setEveningRoutine;

    const updated = routine.map((step) =>
      step.id === stepId ? { ...step, text: text.trim(), translationKey: undefined } : step
    );

    setRoutine(updated);
    await AsyncStorage.setItem(`${routineType}Routine`, JSON.stringify(updated));
    return true;
  }, [eveningRoutine, morningRoutine]);

  const deleteStep = useCallback(async (stepId: string, routineType: RoutineType) => {
    const currentRoutine = routineType === 'morning' ? morningRoutine : eveningRoutine;
    const setRoutine = routineType === 'morning' ? setMorningRoutine : setEveningRoutine;

    const updated = currentRoutine.filter((step) => step.id !== stepId);
    setRoutine(updated);
    await AsyncStorage.setItem(`${routineType}Routine`, JSON.stringify(updated));

    const otherRoutine = routineType === 'morning' ? eveningRoutine : morningRoutine;
    scheduleSaveProgress(
      routineType === 'morning' ? updated : otherRoutine,
      routineType === 'evening' ? updated : otherRoutine
    );
  }, [eveningRoutine, morningRoutine, scheduleSaveProgress]);

  const snoozeToday = useCallback(async () => {
    const newSnoozed = !isSnoozed;
    setIsSnoozed(newSnoozed);

    if (newSnoozed) {
      await blockDay?.();
      scheduleStreakUpdate(false);
    } else {
      await unblockDay?.();
    }
  }, [blockDay, isSnoozed, scheduleStreakUpdate, unblockDay]);

  const onResetMorningRoutine = useCallback(async (resetMorning: RoutineStep[]) => {
    setMorningRoutine(resetMorning);
    await AsyncStorage.setItem('morningRoutine', JSON.stringify(resetMorning));
  }, []);

  const onResetEveningRoutine = useCallback(async (resetEvening: RoutineStep[]) => {
    setEveningRoutine(resetEvening);
    await AsyncStorage.setItem('eveningRoutine', JSON.stringify(resetEvening));
  }, []);

  const resetSnooze = useCallback(() => {
    setIsSnoozed(false);
  }, []);

  useEffect(() => {
    return () => {
      const pending = pendingProgress.current;
      if (pending) {
        void saveProgressData(pending.morning, pending.evening);
      }

      if (streakUpdateTimer.current) {
        clearTimeout(streakUpdateTimer.current);
      }

      if (saveProgressTimer.current) {
        clearTimeout(saveProgressTimer.current);
      }
    };
  }, [saveProgressData]);

  return {
    morningRoutine,
    eveningRoutine,
    isSnoozed,
    isLoaded,
    loadData,
    loadDefaultRoutines,
    resetRoutineCheckboxes,
    resolveStepText,
    toggleStep,
    addStep,
    editStep,
    deleteStep,
    snoozeToday,
    onResetMorningRoutine,
    onResetEveningRoutine,
    resetSnooze,
    setIsSnoozed,
    scheduleStreakUpdate,
  };
}