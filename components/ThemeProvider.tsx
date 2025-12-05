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
    notes: ['#eee1fa', '#ffe5e5', '#e5f9e3'],  },
  nightforest: {
    index: ['#3f385c', '#064e3b', '#1F2937'],
    tasks: ['#064e3b', '#1f2937', '#0c0055'],
    calendar: ['#1f2937', '#0c0055', '#3f385c'],
    notes: ['#0c0055', '#3f385c', '#064e3b'],
  },
};

// --- AsyncStorage keys
const STORAGE_KEYS = {
  selectedTheme: 'selectedTheme', // ThemeMode
  operationMode: 'themeOperationMode', // 'auto' | 'manual'
  messyMode: 'messyMode', // 'true' | 'false'
  messyColors: 'messyColors', // JSON ThemeColors
  sunTimes: 'sunTimes', // JSON { sunrise, sunset, lat, lng, fetchedAt }
};

// Default coords fallback (Barcelona)
const DEFAULT_COORDS = { lat: 41.3851, lng: 2.1734 };

// SunTimes cache TTL (ms) - 24 hours
const SUN_CACHE_TTL = 24 * 60 * 60 * 1000;

interface SunTimes {
  sunrise: string; // ISO
  sunset: string; // ISO
  lat: number;
  lng: number;
  fetchedAt: number;
}

interface ThemeContextType {
  currentTheme: ThemeMode; // actual theme in use (daydream/nightforest)
  operationMode: ThemeOperationMode; // 'auto' | 'manual'
  colors: ThemeColors;
  setThemeManual: (theme: ThemeMode) => Promise<void>;
  setOperationMode: (mode: ThemeOperationMode) => Promise<void>;
  toggleMessyMode: () => Promise<void>;
  isMessyMode: boolean;
  getTabGradient: (tabName: string) => readonly [string, string, ...string[]];
  effectiveThemeName: ThemeMode; // same as currentTheme, provided for clarity
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  // persistent states
  const [operationMode, setOperationModeState] = useState<ThemeOperationMode>('manual');
  const [selectedThemeManual, setSelectedThemeManual] = useState<ThemeMode>('daydream'); // user's manual pick
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>('daydream'); // actual effective theme
  const [isMessyMode, setIsMessyMode] = useState(false);
  const [messyColors, setMessyColors] = useState<ThemeColors | null>(null);
  const { t } = useTranslation();

  // loading state to show dynamic splash until everything ready
  const [isLoading, setIsLoading] = useState(true);

  // local cache of sunTimes
  const [sunTimes, setSunTimes] = useState<SunTimes | null>(null);

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

  // -------------------- sunrise/sunset fetching & caching --------------------
  // -> get coords from IP API, then fetch sunrise/sunset
  async function fetchCoordsFromIP(): Promise<{ lat: number; lng: number } | null> {
    try {
      // ipapi.co provides lat/lon in JSON
      const res = await fetch('https://ipapi.co/json/');
      if (!res.ok) return null;
      const json = await res.json();
      const lat = Number(json.latitude ?? json.lat);
      const lng = Number(json.longitude ?? json.lon ?? json.longitude);
      if (!lat || !lng) return null;
      return { lat, lng };
    } catch (e) {
      return null;
    }
  }

  async function fetchSunTimes(lat: number, lng: number): Promise<SunTimes | null> {
    try {
      // sunrise-sunset.org returns ISO times in UTC when formatted=0
      const url = `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&formatted=0`;
      const res = await fetch(url);
      if (!res.ok) return null;
      const json = await res.json();
      if (json.status !== 'OK') return null;
      const sun: SunTimes = {
        sunrise: json.results.sunrise,
        sunset: json.results.sunset,
        lat,
        lng,
        fetchedAt: Date.now(),
      };
      return sun;
    } catch (e) {
      return null;
    }
  }

  async function getCachedOrFetchSunTimes(): Promise<SunTimes> {
    // Try to read from AsyncStorage
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.sunTimes);
      if (raw) {
        const parsed: SunTimes = JSON.parse(raw);
        if (parsed && parsed.fetchedAt && Date.now() - parsed.fetchedAt < SUN_CACHE_TTL) {
          setSunTimes(parsed);
          return parsed;
        }
      }
    } catch (e) {
      // ignore and fetch
    }

    // Not cached or expired - fetch coords -> sun times
    const coords = (await fetchCoordsFromIP()) ?? DEFAULT_COORDS;
    const fetched = (await fetchSunTimes(coords.lat, coords.lng)) ?? {
      // fallback: create approximate times using local timezone (sunrise 7:00, sunset 19:00)
      sunrise: new Date(new Date().setHours(7, 0, 0, 0)).toISOString(),
      sunset: new Date(new Date().setHours(19, 0, 0, 0)).toISOString(),
      lat: coords.lat,
      lng: coords.lng,
      fetchedAt: Date.now(),
    };

    try {
      await AsyncStorage.setItem(STORAGE_KEYS.sunTimes, JSON.stringify(fetched));
    } catch (e) {
      // ignore
    }
    setSunTimes(fetched);
    return fetched;
  }

  // -------------------- compute effective theme --------------------
  function isNightFromSunTimes(sun: SunTimes | null): boolean {
    if (!sun) return false;
    try {
      const now = new Date();
      const sunrise = new Date(sun.sunrise); // ISO UTC -> Date
      const sunset = new Date(sun.sunset);
      // night if now >= sunset OR now < sunrise (across midnight)
      if (now >= sunset || now < sunrise) return true;
      return false;
    } catch (e) {
      return false;
    }
  }

  async function computeAndApplyAutoTheme() {
    const sun = await getCachedOrFetchSunTimes();
    const night = isNightFromSunTimes(sun);
    const shouldBe: ThemeMode = night ? 'nightforest' : 'daydream';
    setCurrentTheme(shouldBe);
  }

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

      if (rawOpMode === 'auto' || rawOpMode === 'manual') {
        setOperationModeState(rawOpMode as ThemeOperationMode);
      } else {
        setOperationModeState('manual');
      }

      if (rawSelected === 'daydream' || rawSelected === 'nightforest') {
        setSelectedThemeManual(rawSelected as ThemeMode);
      } else {
        setSelectedThemeManual('daydream');
      }

      if (rawMessy === 'true') {
        setIsMessyMode(true);
      } else {
        setIsMessyMode(false);
      }

      if (rawMessyColors) {
        try {
          const parsed: ThemeColors = JSON.parse(rawMessyColors);
          setMessyColors(parsed);
        } catch (e) {
          // ignore
        }
      }

      // apply effective theme
      if (rawOpMode === 'auto') {
        // compute based on sun times
        await computeAndApplyAutoTheme();
      } else {
        // manual — use saved selected
        setCurrentTheme((rawSelected as ThemeMode) ?? 'daydream');
      }
    } catch (error) {
      console.error('Error loading theme settings', error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadAllSettings();
    // also refresh sunTimes in background (not blocking splash if already loaded)
    // but done inside computeAndApplyAutoTheme when needed
  }, []);

  // -------------------- public setters --------------------
  // When user manually selects a theme -> switch to manual (if currently auto), notify user
  const setThemeManual = async (theme: ThemeMode) => {
    try {
      // if currently auto, turn off and notify
      const prevOp = operationMode;
      if (prevOp === 'auto') {
        // make manual
        await AsyncStorage.setItem(STORAGE_KEYS.operationMode, 'manual');
        setOperationModeState('manual');
        // notify user
        showToast('info', 'Авто-режим отключён', t('autoModeDisabledMessage'));
      }

      // set manual selection
      setSelectedThemeManual(theme);
      await AsyncStorage.setItem(STORAGE_KEYS.selectedTheme, theme);

      // regenerate messy colors for new theme if messy mode active
      if (isMessyMode) {
        generateMessyColors(theme);
      }

      // apply effective
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
        // compute effective theme now
        setIsLoading(true);
        await computeAndApplyAutoTheme();
        setIsLoading(false);
      } else {
        // manual -> apply saved manual theme
        const raw = await AsyncStorage.getItem(STORAGE_KEYS.selectedTheme);
        const pick: ThemeMode = (raw as ThemeMode) || selectedThemeManual || 'daydream';
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
        // generate messy based on effective theme
        generateMessyColors(currentTheme);
      } else {
        setMessyColors(null);
        await AsyncStorage.removeItem(STORAGE_KEYS.messyColors);
      }
    } catch (e) {
      console.error('Error toggling messy', e);
    }
  };

  // public computed colors (useMemo for perf)
  const colors = useMemo<ThemeColors>(() => {
    if (isMessyMode && messyColors) {
      return messyColors;
    }
    return themes[currentTheme];
  }, [isMessyMode, messyColors, currentTheme]);

  // getTabGradient function (read-only tuple)
  const getTabGradient = useMemo(() => {
    return (tabName: string): readonly [string, string, ...string[]] => {
      const themeGradients = tabGradients[currentTheme] ?? {};
      const gradient = themeGradients[tabName] ?? themes[currentTheme].background;
      // ensure at least two entries
      const safe = gradient.length >= 2 ? gradient : [...themes[currentTheme].background];
      return [safe[0], safe[1], ...safe.slice(2)] as readonly [string, string, ...string[]];
    };
  }, [currentTheme]);

  // Watch operationMode changes: if auto then refresh sunTimes daily (side-effect)
  useEffect(() => {
    let mounted = true;
    if (operationMode === 'auto') {
      // compute immediately
      (async () => {
        setIsLoading(true);
        try {
          await computeAndApplyAutoTheme();
        } catch (e) {
          // ignore
        } finally {
          if (mounted) setIsLoading(false);
        }
      })();
    }
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [operationMode]);

  // -------------------- Render splash while loading --------------------
  if (isLoading) {
    // choose a theme to display splash for:
    // if operationMode === 'manual' -> show selected manual theme
    // if auto -> use last known sunTimes or fallback to selectedThemeManual
    const displayTheme =
      operationMode === 'auto'
        ? isNightFromSunTimes(sunTimes) ? 'nightforest' : 'daydream'
        : selectedThemeManual;

    const splashBg = displayTheme === 'nightforest' ? '#064E3B' : '#FFE5E5';
    const splashIcon = displayTheme === 'nightforest'
      ? require('@/assets/icon-dark.png') // create/replace accordingly
      : require('@/assets/icon.png');

    return (
      <View style={[styles.splashContainer, { backgroundColor: splashBg }]}>
        <Image
          source={splashIcon}
          style={styles.splashIcon}
          resizeMode="contain"
        />
        <ActivityIndicator
          size="large"
          color={themes[displayTheme].primary}
          style={styles.splashLoader}
        />
      </View>
    );
  }

  // -------------------- Provider value --------------------
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