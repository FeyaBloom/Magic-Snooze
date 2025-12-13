import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react';
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Image,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { showToast } from '@/utils/toast';

export type ThemeMode = 'daydream' | 'nightforest';
export type ThemeOperationMode = 'auto' | 'manual';

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

// --- AsyncStorage keys
const STORAGE_KEYS = {
  selectedTheme: 'selectedTheme',
  operationMode: 'themeOperationMode',
  messyMode: 'messyMode',
  messyColors: 'messyColors',
};

// -------------------------------
// Theme time logic (local only!)
// -------------------------------
const DAY_START_HOUR = 7;  // 07:00 → daydream
const NIGHT_START_HOUR = 19; // 19:00 → nightforest

function getCurrentThemeByTime(): ThemeMode {
  const hour = new Date().getHours();
  return hour >= DAY_START_HOUR && hour < NIGHT_START_HOUR ? 'daydream' : 'nightforest';
}

// -----------------------------------------------------
// Context & Provider
// -----------------------------------------------------
interface ThemeContextType {
  currentTheme: ThemeMode;
  operationMode: ThemeOperationMode;
  colors: ThemeColors;
  setThemeManual: (theme: ThemeMode) => Promise<void>;
  setOperationMode: (mode: ThemeOperationMode) => Promise<void>;
  toggleMessyMode: () => Promise<void>;
  isMessyMode: boolean;
  getTabGradient: (tabName: string) => readonly [string, string, ...string[]];
  effectiveThemeName: ThemeMode;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [operationMode, setOperationModeState] = useState<ThemeOperationMode>('manual');
  const [selectedThemeManual, setSelectedThemeManual] = useState<ThemeMode>('daydream');
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>('daydream');
  const [isMessyMode, setIsMessyMode] = useState(false);
  const [messyColors, setMessyColors] = useState<ThemeColors | null>(null);
  const { t } = useTranslation();

  const [isLoading, setIsLoading] = useState(true);

  // -------------------- utilities --------------------
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
    ].filter(Boolean);
    const shuffledColors = shuffleArray(pool);
    const baseGradient = tabGradients[theme].index || original.background;
    const shuffledBackground = shuffleArray(baseGradient);

    const messy: ThemeColors = {
      primary: shuffledColors[0] ?? original.primary,
      secondary: shuffledColors[1] ?? original.secondary,
      accent: shuffledColors[2] ?? original.accent,
      text: shuffledColors[3] ?? original.text,
      textSecondary: shuffledColors[4] ?? original.textSecondary,
      background: shuffledBackground.length ? shuffledBackground : original.background,
      surface: original.surface,
    };

    setMessyColors(messy);
    AsyncStorage.setItem(STORAGE_KEYS.messyColors, JSON.stringify(messy)).catch(() => {});
  };

  // -------------------- persistence: load saved settings --------------------
  async function loadAllSettings() {
    try {
      const [
        rawSelected,
        rawOpMode,
        rawMessy,
        rawMessyColors,
      ] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.selectedTheme),
        AsyncStorage.getItem(STORAGE_KEYS.operationMode),
        AsyncStorage.getItem(STORAGE_KEYS.messyMode),
        AsyncStorage.getItem(STORAGE_KEYS.messyColors),
      ]);

      const opMode = rawOpMode === 'auto' || rawOpMode === 'manual' ? (rawOpMode as ThemeOperationMode) : 'manual';
      const selectedTheme = (rawSelected === 'daydream' || rawSelected === 'nightforest')
        ? (rawSelected as ThemeMode)
        : 'daydream';
      const messy = rawMessy === 'true';

      setOperationModeState(opMode);
      setSelectedThemeManual(selectedTheme);
      setIsMessyMode(messy);

      if (rawMessyColors) {
        try {
          const parsed = JSON.parse(rawMessyColors);
          setMessyColors(parsed);
        } catch {}
      }

      // Apply effective theme
      if (opMode === 'auto') {
        setCurrentTheme(getCurrentThemeByTime());
      } else {
        setCurrentTheme(selectedTheme);
      }
    } catch (error) {
      console.error('Error loading theme settings', error);
      setCurrentTheme('daydream');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadAllSettings();
  }, []);

  // -------------------- auto mode: update theme on time change --------------------
  useEffect(() => {
    if (operationMode !== 'auto') return;

    // Слушаем изменения времени с интервалом ~1 минута (не часто, но хватит для переключения в 07:00/19:00)
    // Используем setInterval с небольшим джиттером (до ±5 сек), чтобы снизить нагрузку
    const intervalId = setInterval(() => {
      const nextTheme = getCurrentThemeByTime();
      if (nextTheme !== currentTheme) {
        setCurrentTheme(nextTheme);
      }
    }, 60 * 1000 + Math.random() * 10_000); // ~1m ±5s

    // Также проверим сразу после монтирования (на случай, если запуск в промежутке)
    const immediateTheme = getCurrentThemeByTime();
    if (immediateTheme !== currentTheme) {
      setCurrentTheme(immediateTheme);
    }

    return () => clearInterval(intervalId);
  }, [operationMode, currentTheme]);

  // -------------------- public setters --------------------
  const setThemeManual = async (theme: ThemeMode) => {
    try {
      if (operationMode === 'auto') {
        await AsyncStorage.setItem(STORAGE_KEYS.operationMode, 'manual');
        setOperationModeState('manual');
        showToast('info', t('toast.autoModeDisabled'), t('toast.autoModeDisabledMessage'));
      }

      setSelectedThemeManual(theme);
      await AsyncStorage.setItem(STORAGE_KEYS.selectedTheme, theme);

      if (isMessyMode) generateMessyColors(theme);
      setCurrentTheme(theme);
    } catch (e) {
      console.error('Error setting manual theme', e);
    }
  };

  const setOperationMode = async (mode: ThemeOperationMode) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.operationMode, mode);
      setOperationModeState(mode);

      if (mode === 'auto') {
        const nowTheme = getCurrentThemeByTime();
        setCurrentTheme(nowTheme);
      } else {
        const raw = await AsyncStorage.getItem(STORAGE_KEYS.selectedTheme);
        const pick = (raw as ThemeMode) || selectedThemeManual || 'daydream';
        setCurrentTheme(pick);
      }
    } catch (e) {
      console.error('Error setting operation mode', e);
    }
  };

  const toggleMessyMode = async () => {
    try {
      const next = !isMessyMode;
      setIsMessyMode(next);
      await AsyncStorage.setItem(STORAGE_KEYS.messyMode, next.toString());
      if (next) {
        generateMessyColors(currentTheme);
      } else {
        setMessyColors(null);
        await AsyncStorage.removeItem(STORAGE_KEYS.messyColors);
      }
    } catch (e) {
      console.error('Error toggling messy', e);
    }
  };

  // -------------------- computed values --------------------
  const colors = useMemo<ThemeColors>(() => {
    return isMessyMode && messyColors ? messyColors : themes[currentTheme];
  }, [isMessyMode, messyColors, currentTheme]);

  const getTabGradient = useMemo(() => {
    return (tabName: string): readonly [string, string, ...string[]] => {
      const themeGradients = tabGradients[currentTheme] ?? {};
      const gradient = themeGradients[tabName] ?? themes[currentTheme].background;
      const safe = gradient.length >= 2 ? gradient : [...themes[currentTheme].background];
      return [safe[0], safe[1], ...safe.slice(2)] as readonly [string, string, ...string[]];
    };
  }, [currentTheme]);

  // -------------------- Render splash --------------------
  if (isLoading) {
    const splashTheme = operationMode === 'auto' ? getCurrentThemeByTime() : selectedThemeManual;
    const splashBg = splashTheme === 'nightforest' ? '#064E3B' : '#FFE5E5';
    const splashIcon = splashTheme === 'nightforest'
      ? require('@/assets/icon-dark.png')
      : require('@/assets/icon.png');

    return (
      <View style={[styles.splashContainer, { backgroundColor: splashBg }]}>
        <Image source={splashIcon} style={styles.splashIcon} resizeMode="contain" />
        <ActivityIndicator size="large" color={themes[splashTheme].primary} style={styles.splashLoader} />
      </View>
    );
  }

  const value: ThemeContextType = {
    currentTheme,
    operationMode,
    colors,
    setThemeManual,
    setOperationMode,
    toggleMessyMode,
    isMessyMode,
    getTabGradient,
    effectiveThemeName: currentTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// -------------- styles & hook --------------
const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashIcon: {
    width: 120,
    height: 120,
    marginBottom: 32,
  },
  splashLoader: {
    marginTop: 16,
  },
});

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}