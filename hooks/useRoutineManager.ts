// hooks/useRoutineManager.ts
import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocalDateString } from './useDailyProgress';

type RoutineStep = { id: string; text: string; completed: boolean };

interface Options {
  dateString?: string; // for tests; обычно берём today
  onProgressChange?: () => void; // вызовем после snooze/unsnooze/save
  computeAndSave?: (
    dateString: string,
    morning: RoutineStep[],
    evening: RoutineStep[],
    snoozed?: boolean
  ) => Promise<any>;
}

const morningKey = 'morningRoutine';
const eveningKey = 'eveningRoutine';
const victoriesKeyFor = (ds: string) => `victories_${ds}`;

export function useRoutineManager(opts: Options = {}) {
  const dateString = opts.dateString || getLocalDateString();
  const { onProgressChange, computeAndSave } = opts;

  const [morningRoutine, setMorningRoutine] = useState<RoutineStep[]>([]);
  const [eveningRoutine, setEveningRoutine] = useState<RoutineStep[]>([]);
  const [isSnoozed, setIsSnoozed] = useState(false);
  const [celebratedVictories, setCelebratedVictories] = useState<string[]>([]);

  const loadRoutines = useCallback(async () => {
    try {
      const [mRaw, eRaw, progRaw, vRaw] = await Promise.all([
        AsyncStorage.getItem(morningKey),
        AsyncStorage.getItem(eveningKey),
        AsyncStorage.getItem(`progress_${dateString}`),
        AsyncStorage.getItem(victoriesKeyFor(dateString)),
      ]);

      if (mRaw) setMorningRoutine(JSON.parse(mRaw));
      else {
        const defaults = [
          { id: '1', text: 'Stretch', completed: false },
          { id: '2', text: 'Breathing', completed: false },
          { id: '3', text: 'Intention', completed: false },
        ];
        setMorningRoutine(defaults);
        await AsyncStorage.setItem(morningKey, JSON.stringify(defaults));
      }

      if (eRaw) setEveningRoutine(JSON.parse(eRaw));
      else {
        const defaults = [
          { id: '1', text: 'Reflect', completed: false },
          { id: '2', text: 'Self care', completed: false },
          { id: '3', text: 'Prepare', completed: false },
        ];
        setEveningRoutine(defaults);
        await AsyncStorage.setItem(eveningKey, JSON.stringify(defaults));
      }

      if (progRaw) {
        const p = JSON.parse(progRaw);
        setIsSnoozed(Boolean(p.snoozed));
      } else {
        setIsSnoozed(false);
      }

      if (vRaw) setCelebratedVictories(JSON.parse(vRaw));
      else setCelebratedVictories([]);
    } catch (err) {
      console.error('loadRoutines error', err);
    }
  }, [dateString]);

  useEffect(() => {
    loadRoutines();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persistRoutine = useCallback(async (key: string, data: RoutineStep[]) => {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  }, []);

  const toggleStep = useCallback(
    async (stepId: string, which: 'morning' | 'evening') => {
      // не даём менять при сне
      if (isSnoozed) return;

      const source = which === 'morning' ? morningRoutine : eveningRoutine;
      const updated = source.map(s => (s.id === stepId ? { ...s, completed: !s.completed } : s));

      if (which === 'morning') {
        setMorningRoutine(updated);
        await persistRoutine(morningKey, updated);
      } else {
        setEveningRoutine(updated);
        await persistRoutine(eveningKey, updated);
      }

      // пересчитать прогресс и сохранить если есть коллбек computeAndSave
      if (computeAndSave) {
        await computeAndSave(dateString, which === 'morning' ? updated : morningRoutine, which === 'evening' ? updated : eveningRoutine, isSnoozed);
      }

      if (onProgressChange) onProgressChange();
    },
    [isSnoozed, morningRoutine, eveningRoutine, computeAndSave, dateString, persistRoutine, onProgressChange]
  );

  const addStep = useCallback(async (which: 'morning' | 'evening', text: string) => {
    const newStep = { id: Date.now().toString(), text, completed: false };
    if (which === 'morning') {
      const updated = [...morningRoutine, newStep];
      setMorningRoutine(updated);
      await persistRoutine(morningKey, updated);
      if (computeAndSave) await computeAndSave(dateString, updated, eveningRoutine, isSnoozed);
    } else {
      const updated = [...eveningRoutine, newStep];
      setEveningRoutine(updated);
      await persistRoutine(eveningKey, updated);
      if (computeAndSave) await computeAndSave(dateString, morningRoutine, updated, isSnoozed);
    }
    if (onProgressChange) onProgressChange();
  }, [morningRoutine, eveningRoutine, computeAndSave, dateString, persistRoutine, isSnoozed, onProgressChange]);

  const editStep = useCallback(async (which: 'morning' | 'evening', id: string, text: string) => {
    if (which === 'morning') {
      const updated = morningRoutine.map(s => (s.id === id ? { ...s, text } : s));
      setMorningRoutine(updated);
      await persistRoutine(morningKey, updated);
      if (computeAndSave) await computeAndSave(dateString, updated, eveningRoutine, isSnoozed);
    } else {
      const updated = eveningRoutine.map(s => (s.id === id ? { ...s, text } : s));
      setEveningRoutine(updated);
      await persistRoutine(eveningKey, updated);
      if (computeAndSave) await computeAndSave(dateString, morningRoutine, updated, isSnoozed);
    }
    if (onProgressChange) onProgressChange();
  }, [morningRoutine, eveningRoutine, computeAndSave, dateString, persistRoutine, isSnoozed, onProgressChange]);

  const deleteStep = useCallback(async (which: 'morning' | 'evening', id: string) => {
    if (which === 'morning') {
      const updated = morningRoutine.filter(s => s.id !== id);
      setMorningRoutine(updated);
      await persistRoutine(morningKey, updated);
      if (computeAndSave) await computeAndSave(dateString, updated, eveningRoutine, isSnoozed);
    } else {
      const updated = eveningRoutine.filter(s => s.id !== id);
      setEveningRoutine(updated);
      await persistRoutine(eveningKey, updated);
      if (computeAndSave) await computeAndSave(dateString, morningRoutine, updated, isSnoozed);
    }
    if (onProgressChange) onProgressChange();
  }, [morningRoutine, eveningRoutine, computeAndSave, dateString, persistRoutine, isSnoozed, onProgressChange]);

  // Snooze: backup + set snoozed flag (НЕ стираем counts)
  const snoozeToday = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(`progress_${dateString}`);
      if (raw) {
        await AsyncStorage.setItem(`progress_backup_${dateString}`, raw);
        const p = JSON.parse(raw);
        p.snoozed = true;
        await AsyncStorage.setItem(`progress_${dateString}`, JSON.stringify(p));
      } else {
        // если прогресса не было — создадим минимальный объект
        const p = {
          date: dateString,
          morningCompleted: false,
          eveningCompleted: false,
          morningTotal: morningRoutine.length,
          eveningTotal: eveningRoutine.length,
          morningDone: 0,
          eveningDone: 0,
          snoozed: true,
        };
        await AsyncStorage.setItem(`progress_${dateString}`, JSON.stringify(p));
      }
      setIsSnoozed(true);
      if (onProgressChange) onProgressChange();
    } catch (err) {
      console.error('snoozeToday error', err);
    }
  }, [dateString, morningRoutine, eveningRoutine, onProgressChange]);

  // Unsnooze: try restore backup first, if нет — recompute from routines
  const unsnoozeToday = useCallback(async (computeFallback?: () => Promise<void>) => {
    try {
      const backup = await AsyncStorage.getItem(`progress_backup_${dateString}`);
      if (backup) {
        await AsyncStorage.setItem(`progress_${dateString}`, backup);
        await AsyncStorage.removeItem(`progress_backup_${dateString}`);
      } else {
        // recompute using provided computeAndSave (если есть), иначе просто уберем snoozed
        if (computeAndSave) {
          await computeAndSave(dateString, morningRoutine, eveningRoutine, false);
        } else {
          const raw = await AsyncStorage.getItem(`progress_${dateString}`);
          const p = raw ? JSON.parse(raw) : {
            date: dateString,
            morningCompleted: false,
            eveningCompleted: false,
            morningTotal: morningRoutine.length,
            eveningTotal: eveningRoutine.length,
            morningDone: 0,
            eveningDone: 0,
            snoozed: false,
          };
          p.snoozed = false;
          await AsyncStorage.setItem(`progress_${dateString}`, JSON.stringify(p));
        }
      }
      setIsSnoozed(false);
      if (onProgressChange) onProgressChange();
    } catch (err) {
      console.error('unsnoozeToday error', err);
    }
  }, [dateString, morningRoutine, eveningRoutine, computeAndSave, onProgressChange]);

  const celebrateVictory = useCallback(async (victory: string) => {
    try {
      const newVictories = [...celebratedVictories, victory];
      setCelebratedVictories(newVictories);
      await AsyncStorage.setItem(victoriesKeyFor(dateString), JSON.stringify(newVictories));
    } catch (err) {
      console.error('celebrateVictory error', err);
    }
  }, [celebratedVictories, dateString]);

  const resetDailyCheckboxes = useCallback(async () => {
    try {
      const rm = morningRoutine.map(s => ({ ...s, completed: false }));
      const re = eveningRoutine.map(s => ({ ...s, completed: false }));
      setMorningRoutine(rm);
      setEveningRoutine(re);
      setIsSnoozed(false);
      setCelebratedVictories([]);
      await AsyncStorage.setItem(morningKey, JSON.stringify(rm));
      await AsyncStorage.setItem(eveningKey, JSON.stringify(re));
      await AsyncStorage.removeItem(victoriesKeyFor(dateString));
      // пересчитать прогресс
      if (computeAndSave) {
        await computeAndSave(dateString, rm, re, false);
      } else {
        // fallback: save minimal progress
        const p = {
          date: dateString,
          morningCompleted: false,
          eveningCompleted: false,
          morningTotal: rm.length,
          eveningTotal: re.length,
          morningDone: 0,
          eveningDone: 0,
          snoozed: false,
        };
        await AsyncStorage.setItem(`progress_${dateString}`, JSON.stringify(p));
      }
      if (onProgressChange) onProgressChange();
    } catch (err) {
      console.error('resetDailyCheckboxes error', err);
    }
  }, [morningRoutine, eveningRoutine, computeAndSave, dateString, onProgressChange]);

  return {
    morningRoutine,
    eveningRoutine,
    isSnoozed,
    celebratedVictories,
    loadRoutines,
    toggleStep,
    addStep,
    editStep,
    deleteStep,
    snoozeToday,
    unsnoozeToday,
    resetDailyCheckboxes,
    celebrateVictory,
    setIsSnoozed, // осторожно: открываю для редких случаев
  };
}
