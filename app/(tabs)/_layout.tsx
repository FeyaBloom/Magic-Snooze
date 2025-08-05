import { Tabs } from 'expo-router';
import {
  Chrome as Home,
  SquareCheck as CheckSquare,
  Calendar,
  FileText,
  Cog,
} from 'lucide-react-native';
import { useTheme } from '@/components/ThemeProvider';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import i18n from '@/i18n';

export default function TabLayout() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [_, setRerender] = useState(0);

  // 👇 Это магия, чтобы Tabs обновились при смене языка
 useEffect(() => {
  const handler = () => setRerender((prev) => prev + 1);
  i18n.on('languageChanged', handler);

  return () => {
    i18n.off('languageChanged', handler); // <-- вот это настоящая отписка
  };
}, []);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarPosition: 'top',
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 0,
          borderBottomWidth: 0,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          height: 75,
          paddingTop: 16,
          paddingBottom: 6,
        },
        tabBarActiveTintColor: colors.secondary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
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
    </Tabs>
  );
}
