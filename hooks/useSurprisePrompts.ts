import { useState, useEffect } from 'react';

interface SurprisePromptsConfig {
  probability?: number; 
  intervalMinutes?: number; 
  enabled?: boolean;
}

export const useSurprisePrompts = (config: SurprisePromptsConfig = {}) => {
  const {
    probability = 0.1, 
    intervalMinutes = 5, 
    enabled = true,
  } = config;

  const [showSurprisePrompt, setShowSurprisePrompt] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    
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