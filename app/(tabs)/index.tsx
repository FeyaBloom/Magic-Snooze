import React, { useCallback, useMemo } from 'react';
import { View, Text, ScrollView, SafeAreaView, Button } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/components/ThemeProvider';
import { FloatingBackground } from '@/components/MagicalFeatures';
import { createTodayStyles } from '@/styles/today';
import i18n from '@/i18n';
import { useDailyProgress } from '@/hooks/useDailyProgress';
import { useRoutineManager } from '@/hooks/useRoutineManager';
import { useDailyReset } from '@/hooks/useDailyReset';

const { t } = i18n;

const getLocalDateString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function TodayScreen() {
  const { colors, getTabGradient } = useTheme();
  const styles = createTodayStyles(colors);
  const todayString = useMemo(() => getLocalDateString(new Date()), []);

  // Daily Progress
  const { progress, setProgress, reloadProgress } = useDailyProgress(todayString);

  // Routine actions
  const { snoozeDay, unsnoozeDay } = useRoutineManager({ progress, setProgress });

  // Reset at midnight
  useDailyReset(() => {
    reloadProgress();
  });

  const toggleSnooze = useCallback(() => {
    if (progress?.snoozed) {
      unsnoozeDay();
    } else {
      snoozeDay();
    }
  }, [progress, snoozeDay, unsnoozeDay]);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={getTabGradient('Today')} style={styles.gradient}>
        <FloatingBackground />

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>{t('today.title')}</Text>
            <Text style={styles.subtitle}>{t('today.subtitle')}</Text>
          </View>

          <View style={styles.content}>
            {progress ? (
              <>
                <Text style={styles.progressText}>
                  {t('today.tasksCompleted')}: {progress.morningDone + progress.eveningDone} /{' '}
                  {progress.morningTotal + progress.eveningTotal}
                </Text>
                <Text style={styles.statusText}>
                  {progress.snoozed ? t('today.statusSnoozed') : t('today.statusActive')}
                </Text>
              </>
            ) : (
              <Text style={styles.noDataText}>{t('today.noData')}</Text>
            )}
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title={progress?.snoozed ? t('today.unsnooze') : t('today.snooze')}
              onPress={toggleSnooze}
            />
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}
