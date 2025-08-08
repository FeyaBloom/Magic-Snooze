import { useState, useEffect } from 'react';

interface SurprisePromptsConfig {
  probability?: number; // Вероятность появления (0-1)
  intervalMinutes?: number; // Интервал проверки в минутах
  enabled?: boolean;
}

export const useSurprisePrompts = (config: SurprisePromptsConfig = {}) => {
  const {
    probability = 0.1, // 10% шанс
    intervalMinutes = 5, // каждые 5 минут
    enabled = true,
  } = config;

  const [showSurprisePrompt, setShowSurprisePrompt] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    // Интервал для случайных подсказок
    const promptInterval = setInterval(() => {
      if (Math.random() < probability && !showSurprisePrompt) {
        console.log('🎉 Showing surprise prompt!');
        setShowSurprisePrompt(true);
      }
    }, intervalMinutes * 60 * 1000);

    return () => clearInterval(promptInterval);
  }, [probability, intervalMinutes, enabled, showSurprisePrompt]);

  const dismissPrompt = () => {
    setShowSurprisePrompt(false);
  };

  const showPromptManually = () => {
    setShowSurprisePrompt(true);
  };

  return {
    showSurprisePrompt,
    setShowSurprisePrompt,
    dismissPrompt,
    showPromptManually,
  };
};