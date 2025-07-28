import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'daydream' | 'nightforest' | 'messy';

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
    text: '#374151'+'50',
    textSecondary: '#6B7280',
    accent: '#F59E0B',
  },
  nightforest: {
    primary: '#10B981',
    secondary: '#6366F1',
    background: ['#064E3B', '#1F2937', '#374151'],
    surface: '#1F2937',
    text: '#F9FAFB',
    textSecondary: '#D1D5DB',
    accent: '#FBBF24',
  },
  messy: {
    primary: '#EF4444',
    secondary: '#8B5CF6',
    background: ['#FEF3C7', '#DBEAFE', '#FCE7F3'],
    surface: '#FFFFFF',
    text: '#1F2937',
    textSecondary: '#4B5563',
    accent: '#10B981',
  },
};

interface ThemeContextType {
  currentTheme: ThemeMode;
  colors: ThemeColors;
  setTheme: (theme: ThemeMode) => void;
  toggleMessyMode: () => void;
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
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const toggleMessyMode = async () => {
    try {
      const newMessyMode = !isMessyMode;
      setIsMessyMode(newMessyMode);
      await AsyncStorage.setItem('messyMode', newMessyMode.toString());
      
      if (newMessyMode) {
        // Randomly shuffle colors when entering messy mode
        const messyColors = { ...themes.messy };
        const colorKeys = ['primary', 'secondary', 'accent'] as const;
        const randomColors = ['#EF4444', '#8B5CF6', '#10B981', '#F59E0B', '#EC4899', '#6366F1'];
        
        colorKeys.forEach(key => {
          messyColors[key] = randomColors[Math.floor(Math.random() * randomColors.length)];
        });
        
        themes.messy = messyColors;
      }
    } catch (error) {
      console.error('Error toggling messy mode:', error);
    }
  };

  const getColors = (): ThemeColors => {
    if (isMessyMode) {
      return themes.messy;
    }
    return themes[currentTheme];
  };

  return (
    <ThemeContext.Provider
      value={{
        currentTheme: isMessyMode ? 'messy' : currentTheme,
        colors: getColors(),
        setTheme,
        toggleMessyMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};