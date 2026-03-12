import { getLocales } from 'expo-localization';

export const SUPPORTED_LANGUAGES = ['en', 'ca', 'es', 'ru'] as const;
export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: AppLanguage = 'ca';

export const normalizeLanguageCode = (value?: string | null): AppLanguage | null => {
  if (!value) return null;
  const normalized = value.toLowerCase().split(/[-_]/)[0] as AppLanguage;
  return SUPPORTED_LANGUAGES.includes(normalized) ? normalized : null;
};

export const detectDeviceLanguage = (): AppLanguage => {
  const primaryLocale = getLocales()[0];
  return (
    normalizeLanguageCode(primaryLocale?.languageCode) ??
    normalizeLanguageCode(primaryLocale?.languageTag) ??
    DEFAULT_LANGUAGE
  );
};

export const isSupportedLanguage = (value: string): value is AppLanguage => {
  return SUPPORTED_LANGUAGES.includes(value as AppLanguage);
};