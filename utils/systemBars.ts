import { NativeModules, Platform } from 'react-native';

type DynamicSystemBarsModule = {
  setNavigationBarIconsDark: (darkIcons: boolean) => void;
};

const dynamicSystemBars =
  NativeModules.DynamicSystemBars as DynamicSystemBarsModule | undefined;

export function setNavigationBarIconsDark(darkIcons: boolean) {
  if (Platform.OS !== 'android') {
    return;
  }

  if (!dynamicSystemBars?.setNavigationBarIconsDark) {
    return;
  }

  dynamicSystemBars.setNavigationBarIconsDark(darkIcons);
}
