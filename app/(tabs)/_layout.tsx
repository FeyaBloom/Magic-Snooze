import { Tabs } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { Home, CheckSquare, Calendar, FileText } from 'lucide-react-native';
import { useTheme } from '@/components/ThemeProvider';
import { useTranslation } from 'react-i18next';

export default function TabLayout() {
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();
  const [_, setRerender] = useState(0);

  useEffect(() => {
    const handler = () => setRerender((prev) => prev + 1);
    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, []);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        lazy: true,
        detachInactiveScreens: true,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 0,
          // @ts-ignore
          boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.1)',
          height: 70,
          paddingTop: 5,
          paddingHorizontal: 20,
          paddingBottom: Platform.OS === 'android' ? 15 : 25,
        },
        tabBarActiveTintColor: colors.secondary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 1,
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
          tabBarIcon: ({ size, color }) => <CheckSquare size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: t('navigation.calendar'),
          tabBarIcon: ({ size, color }) => <Calendar size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="notes"
        options={{
          title: t('navigation.notes'),
          tabBarIcon: ({ size, color }) => <FileText size={size} color={color} />,
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