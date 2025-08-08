import { useEffect } from 'react';
import { useRoutineManager } from './useRoutineManager';
import { useDailyProgress } from './useDailyProgress';
import { useVictories } from './useVictories';
import { useDailyReset } from './useDailyReset';

export const useTodayLogic = () => {
  const routineManager = useRoutineManager();
  const progressManager = useDailyProgress();
  const victoriesManager = useVictories();

  // Синхронизируем прогресс при изменении рутин
  useEffect(() => {
    if (routineManager.morningRoutine.length > 0 || routineManager.eveningRoutine.length > 0) {
      progressManager.saveProgress(routineManager.morningRoutine, routineManager.eveningRoutine);
    }
  }, [routineManager.morningRoutine, routineManager.eveningRoutine]);

  // Настраиваем автоматический сброс в полночь
  useDailyReset({
    onResetRoutines: routineManager.resetDailyRoutines,
    onResetProgress: progressManager.resetProgress,
    onResetVictories: victoriesManager.resetVictories,
    onReset: () => {
      // Дополнительная логика при сбросе
      console.log('🔄 Daily reset completed');
    },
  });

  // Обертка для toggleStep с автосохранением прогресса
  const toggleStep = async (stepId: string, routine: 'morning' | 'evening') => {
    const updatedRoutine = await routineManager.toggleStep(stepId, routine, progressManager.isSnoozed);
    if (updatedRoutine) {
      const otherRoutine = routine === 'morning' ? routineManager.eveningRoutine : routineManager.morningRoutine;
      progressManager.saveProgress(
        routine === 'morning' ? updatedRoutine : otherRoutine,
        routine === 'evening' ? updatedRoutine : otherRoutine
      );
    }
  };

  // Обертка для addStep с автосохранением прогресса
  const addStep = async (text: string, routine: 'morning' | 'evening') => {
    const updatedRoutine = await routineManager.addStep(text, routine);
    if (updatedRoutine) {
      const otherRoutine = routine === 'morning' ? routineManager.eveningRoutine : routineManager.morningRoutine;
      progressManager.saveProgress(
        routine === 'morning' ? updatedRoutine : otherRoutine,
        routine === 'evening' ? updatedRoutine : otherRoutine
      );
    }
    return updatedRoutine;
  };

  // Обертка для editStep с автосохранением прогресса
  const editStep = async (stepId: string, newText: string, routine: 'morning' | 'evening') => {
    const updatedRoutine = await routineManager.editStep(stepId, newText, routine);
    if (updatedRoutine) {
      const otherRoutine = routine === 'morning' ? routineManager.eveningRoutine : routineManager.morningRoutine;
      progressManager.saveProgress(
        routine === 'morning' ? updatedRoutine : otherRoutine,
        routine === 'evening' ? updatedRoutine : otherRoutine
      );
    }
    return updatedRoutine;
  };

  // Обертка для deleteStep с автосохранением прогресса
  const deleteStep = async (stepId: string, routine: 'morning' | 'evening') => {
    const updatedRoutine = await routineManager.deleteStep(stepId, routine);
    if (updatedRoutine) {
      const otherRoutine = routine === 'morning' ? routineManager.eveningRoutine : routineManager.morningRoutine;
      progressManager.saveProgress(
        routine === 'morning' ? updatedRoutine : otherRoutine,
        routine === 'evening' ? updatedRoutine : otherRoutine
      );
    }
    return updatedRoutine;
  };

  // Обертка для snoozeToday
  const snoozeToday = async () => {
    return await progressManager.snoozeToday(routineManager.morningRoutine, routineManager.eveningRoutine);
  };

  return {
    // Данные
    morningRoutine: routineManager.morningRoutine,
    eveningRoutine: routineManager.eveningRoutine,
    todayProgress: progressManager.todayProgress,
    isSnoozed: progressManager.isSnoozed,
    celebratedVictories: victoriesManager.celebratedVictories,

    // Методы для рутин
    toggleStep,
    addStep,
    editStep,
    deleteStep,

    // Методы для прогресса
    snoozeToday,

    // Методы для побед
    celebrateVictory: victoriesManager.celebrateVictory,
  };
};