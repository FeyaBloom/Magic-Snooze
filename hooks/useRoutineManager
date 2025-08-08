import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '@/i18n';

const { t } = i18n;

interface RoutineStep {
  id: string;
  text: string;
  completed: boolean;
}

export const useRoutineManager = () => {
  const [morningRoutine, setMorningRoutine] = useState<RoutineStep[]>([]);
  const [eveningRoutine, setEveningRoutine] = useState<RoutineStep[]>([]);

  const getLocalDateString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getDefaultRoutines = () => {
    const defaultMorning = [
      { id: '1', text: t('today.defaultMorning.stretch'), completed: false },
      { id: '2', text: t('today.defaultMorning.breathing'), completed: false },
      { id: '3', text: t('today.defaultMorning.intention'), completed: false },
    ];

    const defaultEvening = [
      { id: '1', text: t('today.defaultEvening.reflect'), completed: false },
      { id: '2', text: t('today.defaultEvening.selfCare'), completed: false },
      { id: '3', text: t('today.defaultEvening.prepare'), completed: false },
    ];

    return { defaultMorning, defaultEvening };
  };

  const loadRoutines = async () => {
    try {
      const currentDate = getLocalDateString();
      const morningData = await AsyncStorage.getItem('morningRoutine');
      const eveningData = await AsyncStorage.getItem('eveningRoutine');
      const lastProgressDate = await AsyncStorage.getItem('lastProgressDate');

      const { defaultMorning, defaultEvening } = getDefaultRoutines();

      // Обработка утренней рутины
      if (morningData) {
        const parsedMorning = JSON.parse(morningData);
        if (lastProgressDate !== currentDate) {
          // Новый день - сбрасываем чекбоксы
          const resetMorning = parsedMorning.map((step: any) => ({ ...step, completed: false }));
          setMorningRoutine(resetMorning);
          await AsyncStorage.setItem('morningRoutine', JSON.stringify(resetMorning));
        } else {
          setMorningRoutine(parsedMorning);
        }
      } else {
        setMorningRoutine(defaultMorning);
        await AsyncStorage.setItem('morningRoutine', JSON.stringify(defaultMorning));
      }

      // Обработка вечерней рутины
      if (eveningData) {
        const parsedEvening = JSON.parse(eveningData);
        if (lastProgressDate !== currentDate) {
          // Новый день - сбрасываем чекбоксы
          const resetEvening = parsedEvening.map((step: any) => ({ ...step, completed: false }));
          setEveningRoutine(resetEvening);
          await AsyncStorage.setItem('eveningRoutine', JSON.stringify(resetEvening));
        } else {
          setEveningRoutine(parsedEvening);
        }
      } else {
        setEveningRoutine(defaultEvening);
        await AsyncStorage.setItem('eveningRoutine', JSON.stringify(defaultEvening));
      }

      // Обновляем дату последнего прогресса
      if (lastProgressDate !== currentDate) {
        await AsyncStorage.setItem('lastProgressDate', currentDate);
      }
    } catch (error) {
      console.error('Error loading routines:', error);
    }
  };

  const toggleStep = async (stepId: string, routine: 'morning' | 'evening', isSnoozed: boolean = false) => {
    if (isSnoozed) return;
    
    const updateRoutine = routine === 'morning' ? morningRoutine : eveningRoutine;
    const setRoutine = routine === 'morning' ? setMorningRoutine : setEveningRoutine;
    
    const updated = updateRoutine.map(step =>
      step.id === stepId ? { ...step, completed: !step.completed } : step
    );
    
    setRoutine(updated);
    await AsyncStorage.setItem(`${routine}Routine`, JSON.stringify(updated));
    
    return updated;
  };

  const addStep = async (text: string, routine: 'morning' | 'evening') => {
    if (!text.trim()) return false;

    const newStep: RoutineStep = {
      id: Date.now().toString(),
      text: text.trim(),
      completed: false,
    };

    const currentRoutine = routine === 'morning' ? morningRoutine : eveningRoutine;
    const setRoutine = routine === 'morning' ? setMorningRoutine : setEveningRoutine;

    const updated = [...currentRoutine, newStep];
    setRoutine(updated);
    await AsyncStorage.setItem(`${routine}Routine`, JSON.stringify(updated));

    return updated;
  };

  const editStep = async (stepId: string, newText: string, routine: 'morning' | 'evening') => {
    if (!newText.trim()) return false;
    
    const currentRoutine = routine === 'morning' ? morningRoutine : eveningRoutine;
    const setRoutine = routine === 'morning' ? setMorningRoutine : setEveningRoutine;
    
    const updated = currentRoutine.map(step =>
      step.id === stepId ? { ...step, text: newText.trim() } : step
    );
    
    setRoutine(updated);
    await AsyncStorage.setItem(`${routine}Routine`, JSON.stringify(updated));
    
    return updated;
  };

  const deleteStep = async (stepId: string, routine: 'morning' | 'evening') => {
    const currentRoutine = routine === 'morning' ? morningRoutine : eveningRoutine;
    const setRoutine = routine === 'morning' ? setMorningRoutine : setEveningRoutine;

    const updated = currentRoutine.filter(step => step.id !== stepId);
    setRoutine(updated);
    await AsyncStorage.setItem(`${routine}Routine`, JSON.stringify(updated));

    return updated;
  };

  const resetDailyRoutines = async () => {
    try {
      const resetMorning = morningRoutine.map(step => ({ ...step, completed: false }));
      const resetEvening = eveningRoutine.map(step => ({ ...step, completed: false }));
      
      setMorningRoutine(resetMorning);
      setEveningRoutine(resetEvening);
      
      await AsyncStorage.setItem('morningRoutine', JSON.stringify(resetMorning));
      await AsyncStorage.setItem('eveningRoutine', JSON.stringify(resetEvening));
      
      return { morning: resetMorning, evening: resetEvening };
    } catch (error) {
      console.error('Error resetting daily routines:', error);
      return null;
    }
  };

  useEffect(() => {
    loadRoutines();
  }, []);

  return {
    morningRoutine,
    eveningRoutine,
    toggleStep,
    addStep,
    editStep,
    deleteStep,
    resetDailyRoutines,
    loadRoutines,
  };
};