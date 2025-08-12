import { useEffect } from 'react';

interface ResetCallbacks {
  onReset?: () => void;
  onResetRoutines?: () => void;
  onResetProgress?: () => void;
  onResetVictories?: () => void;
}

export const useDailyReset = (callbacks: ResetCallbacks = {}) => {
  const { onReset, onResetRoutines, onResetProgress, onResetVictories } = callbacks;

  const performDailyReset = () => {
    console.log('🌅 Performing daily reset at midnight');
    
    // Вызываем все callback'и для сброса
    onResetRoutines?.();
    onResetProgress?.();
    onResetVictories?.();
    onReset?.(); // Общий callback
  };

  const setupMidnightReset = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const msUntilMidnight = tomorrow.getTime() - now.getTime();
    
    console.log(`⏰ Setting up midnight reset in ${Math.round(msUntilMidnight / 1000 / 60)} minutes`);
    
    // Таймер до первой полуночи
    const midnightTimer = setTimeout(() => {
      performDailyReset();
      
      // Устанавливаем повторяющийся интервал каждые 24 часа
      const dailyInterval = setInterval(() => {
        performDailyReset();
      }, 24 * 60 * 60 * 1000); // 24 часа
      
      // Возвращаем функцию очистки для интервала
      return () => clearInterval(dailyInterval);
    }, msUntilMidnight);
    
    // Возвращаем функцию очистки для таймера
    return () => clearTimeout(midnightTimer);
  };

  useEffect(() => {
    const cleanup = setupMidnightReset();
    
    return cleanup;
  }, []);

  return {
    performDailyReset,
  };
};