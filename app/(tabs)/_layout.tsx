import { Tabs } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import {
  Chrome as Home,
  SquareCheck as CheckSquare,
  Calendar,
  FileText,
} from 'lucide-react-native';
import { useTheme } from '@/components/ThemeProvider';
import { useTranslation } from 'react-i18next';
//import i18n from '@/i18n';

export default function TabLayout() {
  // ✅ 1. TODOS los hooks primero (en el mismo orden SIEMPRE)
  const { colors } = useTheme();
  const { t } = useTranslation();  
  const { i18n } = useTranslation();
  const [_, setRerender] = useState(0);

  // ✅ 2. useEffect SIEMPRE al final
  useEffect(() => {
    const handler = () => setRerender((prev) => prev + 1);
    i18n.on('languageChanged', handler);

    return () => {
      i18n.off('languageChanged', handler);
    };
  }, []); // ✅ Sin dependencias - se ejecuta una sola vez

  // ✅ 3. JSX Return
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarPosition: 'bottom',
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 0,
          borderBottomWidth: 0,
          elevation: 8,
          shadowColor: '#ccc',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          height: 75,
          paddingTop: 8,
          paddingHorizontal: 20,
          paddingBottom: Platform.OS === 'android' ? 20 : 0,
        },
        tabBarActiveTintColor: colors.secondary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          fontFamily: 'ComicNeue-Bold',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('navigation.today'),
          tabBarIcon: ({ size, color }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: t('navigation.tasks'),
          tabBarIcon: ({ size, color }) => (
            <CheckSquare size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: t('navigation.calendar'),
          tabBarIcon: ({ size, color }) => (
            <Calendar size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="notes"
        options={{
          title: t('navigation.notes'),
          tabBarIcon: ({ size, color }) => (
            <FileText size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          href: null,
          title: t('navigation.settings'),
        }}
      />
    </Tabs>
  );
}