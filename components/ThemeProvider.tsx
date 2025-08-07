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
    background: ['#064E3B', '#1F2937', '#374151', '#D8CFE8'], // 4 цвета
    surface: '#1F2937',
    text: '#FFFFFF',
    textSecondary: '#D1D5DB',
    accent: '#FBBF24',
  },
};

const tabGradients: Record<ThemeMode, Record<string, string[]>> = {
  daydream: {
    index: ['#FFE5E5', '#E5F3FF', '#F3E5FF'],
    tasks: ['#E5F3FF', '#F3E5FF', '#FFE5E5'],
    calendar: ['#F3E5FF', '#FFE5E5', '#E5F3FF'],
    notes: ['#E5F3FF', '#FFE5E5', '#F3E5FF'],
  },
  nightforest: {
    index: ['#D8CFE8', '#374151', '#064E3B'],
    tasks: ['#064E3B', '#D8CFE8', '#1F2937'],
    calendar: ['#374151', '#064E3B', '#D8CFE8'],
    notes: ['#1F2937', '#374151', '#D8CFE8'],
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
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
      if (savedMessyMode === 'true') setIsMessyMode(true);
    } catch (e) {
      console.error('theme load error', e);
    }
  };
 const setTheme = (theme: ThemeMode) => {
    setCurrentTheme(theme);
    AsyncStorage.setItem('theme', theme);
  };
  const setTheme = async (theme: ThemeMode) => {
    setCurrentTheme(theme);
    await AsyncStorage.setItem('selectedTheme', theme);
    if (isMessyMode) generateMessyColors(theme);
  };

  const toggleMessyMode = async () => {
    const newMode = !isMessyMode;
    setIsMessyMode(newMode);
    await AsyncStorage.setItem('messyMode', newMode.toString());
    if (newMode) generateMessyColors(currentTheme);
    else setMessyColors(null);
  };

  const shuffleArray = <T,>(arr: T[]): T[] => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  const generateMessyColors = (theme: ThemeMode) => {
    const base = themes[theme];
    const shuffledColors = shuffleArray([
      base.primary,
      base.secondary,
      base.accent,
      base.text,
      base.textSecondary,
    ]);
    const newMessyColors: ThemeColors = {
      primary: shuffledColors[0],
      secondary: shuffledColors[1],
      accent: shuffledColors[2],
      text: shuffledColors[3],
      textSecondary: shuffledColors[4],
      background: shuffleArray(base.background),
      surface: base.surface,
    };
    setMessyColors(newMessyColors);
  };

  const getColors = (): ThemeColors => {
    if (isMessyMode && messyColors) return messyColors;
    return themes[currentTheme];
  };

  const getTabGradient = (tabName: string): string[] => {
    return tabGradients[currentTheme][tabName] || getColors().background;
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
