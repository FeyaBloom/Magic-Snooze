import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DeviceEventEmitter } from 'react-native';

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
    secondary: '#10B981',
    primary: '#6366F1',
    background: ['#064E3B', '#1F2937', '#374151'],
    surface: '#1F2937',
    text: '#FFFFFF',
    textSecondary: '#D1D5DB',
    accent: '#FBBF24',
  },
};

const tabGradients: Record<ThemeMode, Record<string, string[]>> = {
  daydream: {
    index: ['#ffe5e5', '#e5f9e3', '#cfdeff'],
    tasks: ['#e5f9e3', '#cfdeff', '#eee1fa'],
    calendar: ['#cfdeff', '#eee1fa', '#ffe5e5'],
    notes: ['#eee1fa', '#ffe5e5', '#e5f9e3'],
  },
  nightforest: {
    index: ['#3f385c', '#064e3b', '#1F2937'],
    tasks: ['#064e3b', '#1f2937', '#0c0055'],
    calendar: ['#1f2937', '#0c0055', '#3f385c'],
    notes: ['#0c0055', '#3f385c', '#064e3b'],
  },
};

interface ThemeContextType {
  currentTheme: ThemeMode;
  colors: ThemeColors;
  setTheme: (theme: ThemeMode) => void;
  toggleMessyMode: () => void;
  isMessyMode: boolean;
  getTabGradient: (tabName: string) => readonly [string, string, ...string[]];
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
  // ✅ 1. TODOS los useState primero
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>('daydream');
  const [isMessyMode, setIsMessyMode] = useState(false);
  const [messyColors, setMessyColors] = useState<ThemeColors | null>(null);

  // ✅ 2. Funciones auxiliares (no son hooks)
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

  const getColors = (): ThemeColors => {
    if (isMessyMode && messyColors) {
      return messyColors;
    }
    return themes[currentTheme];
  };

  const getTabGradient = (tabName: string): readonly [string, string, ...string[]] => {
    const themeGradients = tabGradients[currentTheme];
    const gradient = themeGradients[tabName] || themes[currentTheme].background;
    
    if (gradient.length < 2) {
      const fallback = themes[currentTheme].background;
      return [fallback[0], fallback[1], ...fallback.slice(2)] as readonly [string, string, ...string[]];
    }
    
    return [gradient[0], gradient[1], ...gradient.slice(2)] as readonly [string, string, ...string[]];
  };

  // ✅ 3. TODOS los useEffect AL FINAL y en el mismo orden SIEMPRE
  // 🔥 CRÍTICO: Combinar ambos efectos en UNO SOLO
  useEffect(() => {
    // Carga inicial del tema
    loadTheme();

    // Listener para eventos de reset
    const handleDataReset = (data: { categories: string[], deletedKeys: string[], timestamp: number }) => {
      console.log('ThemeProvider received data reset event:', data);
      
      if (data.categories.includes('settings')) {
        console.log('Resetting theme settings to defaults...');
        setCurrentTheme('daydream');
        setIsMessyMode(false);
        setMessyColors(null);
      }
    };

    const listener = DeviceEventEmitter.addListener('dataReset', handleDataReset);
    
    // Cleanup
    return () => {
      listener.remove();
    };
  }, []); // ✅ Sin dependencias - se ejecuta solo una vez

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