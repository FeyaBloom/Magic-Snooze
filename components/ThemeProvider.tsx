import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'daydream' | 'nightforest';

interface ThemeColors {
  primary: string;
  secondary: string;
  background: string[];
  surface: string;
  text: string;
  textSecondary: string;
  accent: string;
}

const themes: Record<ThemeMode, ThemeColors> = {
  daydream: {
    primary: '#EC4899',
    secondary: '#8B5CF6',
    background: ['#FFE5E5', '#E5F3FF', '#F3E5FF'],
    surface: '#FFFFFF',
    text: '#6d6d6d',
    textSecondary: '#6B7280',
    accent: '#F59E0B',
  },
  nightforest: {
    primary: '#10B981',
    secondary: '#6366F1',
    background: ['#064E3B', '#1F2937', '#374151'],
    surface: '#1F2937',
    text: '#Ffffff',
    textSecondary: '#D1D5DB',
    accent: '#FBBF24',
  },
};

interface ThemeContextType {
  currentTheme: ThemeMode;
  colors: ThemeColors;
  setTheme: (theme: ThemeMode) => void;
  toggleMessyMode: () => void;
  isMessyMode: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>('daydream');
  const [isMessyMode, setIsMessyMode] = useState(false);
  const [messyColors, setMessyColors] = useState<ThemeColors | null>(null);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('selectedTheme');
      const savedMessyMode = await AsyncStorage.getItem('messyMode');
      
      if (savedTheme && (savedTheme as ThemeMode) in themes) {
        setCurrentTheme(savedTheme as ThemeMode);
      }
      
      if (savedMessyMode === 'true') {
        setIsMessyMode(true);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const setTheme = async (theme: ThemeMode) => {
    try {
      setCurrentTheme(theme);
      await AsyncStorage.setItem('selectedTheme', theme);
      
      // Если messy mode активен, пересоздать messy цвета для новой темы
      if (isMessyMode) {
        generateMessyColors(theme);
      }
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const generateMessyColors = (theme: ThemeMode) => {
    const originalTheme = themes[theme];
    
    // Собираем все цвета текущей темы для перемешивания
    const colorPool = [
      originalTheme.primary,
      originalTheme.secondary,
      originalTheme.accent,
      originalTheme.text,
      originalTheme.textSecondary,
    ];
    
    // Перемешиваем цвета
    const shuffledColors = shuffleArray(colorPool);
    
    // Также перемешиваем градиент фона
    const shuffledBackground = shuffleArray(originalTheme.background);
    
    // Создаем новую тему с перемешанными цветами
    const newMessyColors: ThemeColors = {
      primary: shuffledColors[0],
      secondary: shuffledColors[1],
      accent: shuffledColors[2],
      text: shuffledColors[3],
      textSecondary: shuffledColors[4],
      background: shuffledBackground,
      surface: originalTheme.surface, // Поверхность оставляем как есть
    };
    
    setMessyColors(newMessyColors);
  };

  const toggleMessyMode = async () => {
    try {
      const newMessyMode = !isMessyMode;
      setIsMessyMode(newMessyMode);
      await AsyncStorage.setItem('messyMode', newMessyMode.toString());
      
      if (newMessyMode) {
        // Генерируем messy цвета для текущей темы
        generateMessyColors(currentTheme);
      } else {
        // Выключаем messy mode - очищаем messy цвета
        setMessyColors(null);
      }
    } catch (error) {
      console.error('Error toggling messy mode:', error);
    }
  };

  const getColors = (): ThemeColors => {
    if (isMessyMode && messyColors) {
      return messyColors;
    }
    return themes[currentTheme];
  };

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        colors: getColors(),
        setTheme,
        toggleMessyMode,
        isMessyMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};