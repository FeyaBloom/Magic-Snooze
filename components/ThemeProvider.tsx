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
  tabGradients?: Record<'today' | 'tasks' | 'calendar' | 'notes', string[]>;
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
    tabGradients: {
      tasks: ['#FFD4E5', '#E5D5F7', '#C1E4F7'],
      today: ['#D7F4D1', '#FFD4E5', '#E5D5F7'],
      calendar: ['#C1E4F7', '#D7F4D1', '#FFD4E5'],
      notes: ['#E5D5F7', '#C1E4F7', '#D7F4D1'],
    },
  },
  nightforest: {
    primary: '#10B981',
    secondary: '#6366F1',
    background: ['#0F2E1E', '#2C2C2E', '#1A2636', '#6F6B7A'],
    surface: '#1F2937',
    text: '#FFFFFF',
    textSecondary: '#D1D5DB',
    accent: '#FBBF24',
    tabGradients: {
      today: ['#6F6B7A', '#1A2636', '#2C2C2E'],
      tasks: ['#0F2E1E', '#6F6B7A', '#1A2636'],
      calendar: ['#2C2C2E', '#0F2E1E', '#6F6B7A'],
      notes: ['#1A2636', '#2C2C2E', '#0F2E1E'],
    },
  },
};

interface ThemeContextType {
  currentTheme: ThemeMode;
  colors: ThemeColors;
  setTheme: (theme: ThemeMode) => void;
  toggleMessyMode: () => void;
  isMessyMode: boolean;
  getTabGradient: (tabName: string) => string[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = (): ThemeContextType => {
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
    const loadSettings = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('selectedTheme');
        const savedMessy = await AsyncStorage.getItem('messyMode');

        if (savedTheme && savedTheme in themes) {
          setCurrentTheme(savedTheme as ThemeMode);
        }

        if (savedMessy === 'true') {
          setIsMessyMode(true);
        }
      } catch (e) {
        console.error('Failed to load theme settings:', e);
      }
    };

    loadSettings();
  }, []);

  const setTheme = async (theme: ThemeMode) => {
    try {
      setCurrentTheme(theme);
      await AsyncStorage.setItem('selectedTheme', theme);

      if (isMessyMode) {
        generateMessyColors(theme);
      }
    } catch (e) {
      console.error('Error setting theme:', e);
    }
  };

  const toggleMessyMode = async () => {
    try {
      const newMode = !isMessyMode;
      setIsMessyMode(newMode);
      await AsyncStorage.setItem('messyMode', String(newMode));

      if (newMode) {
        generateMessyColors(currentTheme);
      } else {
        setMessyColors(null);
      }
    } catch (e) {
      console.error('Error toggling messy mode:', e);
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
    const base = themes[theme];
    const pool = [
      base.primary,
      base.secondary,
      base.accent,
      base.text,
      base.textSecondary,
    ];

    const messyTheme: ThemeColors = {
      primary: pool[0],
      secondary: pool[1],
      accent: pool[2],
      text: pool[3],
      textSecondary: pool[4],
      background: shuffleArray(base.background),
      surface: base.surface,
    };

    setMessyColors(messyTheme);
  };

  const getColors = (): ThemeColors => {
    return isMessyMode && messyColors ? messyColors : themes[currentTheme];
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
