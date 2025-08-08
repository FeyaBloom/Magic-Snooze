import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'daydream' | 'nightforest';

interface ThemeColors {
  primary: string;
  secondary: string;
  background: string[]; // будет меняться по вкладке
  surface: string;
  text: string;
  textSecondary: string;
  accent: string;
}

const themes: Record<ThemeMode, ThemeColors> = {
  daydream: {
    primary: '#EC4899',
    secondary: '#8B5CF6',
    background: ['#FFE5E5', '#E5F3FF', '#F3E5FF'], // fallback
    surface: '#FFFFFF',
    text: '#6d6d6d',
    textSecondary: '#6B7280',
    accent: '#F59E0B',
  },
  nightforest: {
    primary: '#10B981',
    secondary: '#6366F1',
    background: ['#064E3B', '#1F2937', '#374151'], // fallback
    surface: '#1F2937',
    text: '#FFFFFF',
    textSecondary: '#D1D5DB',
    accent: '#FBBF24',
  },
};

// градиенты по вкладкам
const tabGradients: Record<ThemeMode, Record<string, string[]>> = {
  daydream: {
    index: ['#ffe5e5', '#eee1fa', '#cfdeff'],
    tasks: ['#e5f9e3', '#FFE5E5', '#eee1fa'],
    calendar: ['#cfdeff', '#e5f9e3', '#Ffe5e5'],
    notes: ['#eee1fa', '#cfdeff', '#e5f9e3'],
  },
  nightforest: {
    index: ['#2F4858', '#3F826D', '#BFD7EA'],
    tasks: ['#3F826D', '#5B7065', '#DABFFF'],
    calendar: ['#5B7065', '#BFD7EA', '#FFB6B9'],
    notes: ['#BFD7EA', '#FFB6B9', '#2F4858'],
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

      if (isMessyMode) {
        generateMessyColors(theme);
      }
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const toggleMessyMode = async () => {
    try {
      const newMode = !isMessyMode;
      setIsMessyMode(newMode);
      await AsyncStorage.setItem('messyMode', newMode.toString());

      if (newMode) {
        generateMessyColors(currentTheme);
      } else {
        setMessyColors(null);
      }
    } catch (error) {
      console.error('Error toggling messy mode:', error);
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
    const original = themes[theme];
    const pool = [
      original.primary,
      original.secondary,
      original.accent,
      original.text,
      original.textSecondary,
    ];
    const shuffledColors = shuffleArray(pool);
    const shuffledBackground = shuffleArray(tabGradients[theme].index);

    const messy: ThemeColors = {
      primary: shuffledColors[0],
      secondary: shuffledColors[1],
      accent: shuffledColors[2],
      text: shuffledColors[3],
      textSecondary: shuffledColors[4],
      background: shuffledBackground,
      surface: original.surface,
    };

    setMessyColors(messy);
  };

  const getColors = (): ThemeColors => {
    if (isMessyMode && messyColors) {
      return messyColors;
    }
    return themes[currentTheme];
  };

  const getTabGradient = (tabName: string): string[] => {
    const themeGradients = tabGradients[currentTheme];
    return themeGradients[tabName] || themes[currentTheme].background;
  };

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        colors: getColors(),
        setTheme,
        toggleMessyMode,
        isMessyMode,
        getTabGradient,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
