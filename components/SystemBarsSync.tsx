import { useEffect } from 'react';
import { AppState } from 'react-native';
import { useTheme } from './ThemeProvider';
import { setNavigationBarIconsDark } from '@/utils/systemBars';

export function SystemBarsSync() {
  const { currentTheme } = useTheme();
  const shouldUseDarkIcons = currentTheme === 'daydream';

  useEffect(() => {
    setNavigationBarIconsDark(shouldUseDarkIcons);
  }, [shouldUseDarkIcons]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        setNavigationBarIconsDark(shouldUseDarkIcons);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [shouldUseDarkIcons]);

  return null;
}
