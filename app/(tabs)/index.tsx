// screens/today/TodayTab.tsx
import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, SafeAreaView, TouchableOpacity, TextInput, Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, Pause, Sparkles, Coffee, Moon, Edit as EditIcon, Trash2 } from 'lucide-react-native';
import { useTheme } from '@/components/ThemeProvider';
import { createTodayStyles } from '@/styles/today';
import i18n from '@/i18n';
import { useDailyProgress } from '@/hooks/useDailyProgress';
import { useRoutineManager } from '@/hooks/useRoutineManager';
import { useDailyReset } from '@/hooks/useDailyReset';
import { MagicalCheckbox, TinyVictoryTracker, SurprisePrompt } from '@/components/MagicalFeatures';

const { t } = i18n;

export default function TodayTab() {
  const { colors, getTabGradient, currentTheme, setTheme } = useTheme();
  const gradient = getTabGradient('index'); // or route.name
  const styles = createTodayStyles(colors);

  const { progress, loadProgress, computeAndSaveFromRoutines, getLocalDateString } = useDailyProgress();
  const routineManager = useRoutineManager({
    onProgressChange: () => loadProgress(),
    computeAndSave: computeAndSaveFromRoutines,
  });

  // midnight reset -> вызывает resetDailyCheckboxes внутри routineManager
  useDailyReset(() => {
    routineManager.resetDailyCheckboxes();
    loadProgress();
  });

  // загрузим прогресс и рутины при монтировании
  useEffect(() => {
    (async () => {
      await loadProgress();
      await routineManager.loadRoutines();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // UI state для модалок
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentRoutineType, setCurrentRoutineType] = useState<'morning' | 'evening'>('morning');
  const [newStepText, setNewStepText] = useState('');
  const [showTinyVictories, setShowTinyVictories] = useState(false);
  const [showSurprisePrompt, setShowSurprisePrompt] = useState(false);

  const today = getLocalDateString();

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={gradient} style={styles.gradient}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>{t('today.title')}</Text>
            <Text style={styles.subtitle}>
              {routineManager.isSnoozed ? t('today.subtitleSnoozed') : t('today.subtitle')}
            </Text>
          </View>

          {!routineManager.isSnoozed ? (
            <TouchableOpacity style={styles.snoozeButton} onPress={routineManager.snoozeToday}>
              <Pause size={20} color="#8B5CF6" />
              <Text style={styles.snoozeText}>{t('today.snoozeToday')}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.resumeButton} onPress={() => routineManager.unsnoozeToday()}>
              <Text style={styles.resumeText}>{t('today.resumeToday')}</Text>
            </TouchableOpacity>
          )}

          <View style={styles.magicalControls}>
            <TouchableOpacity style={styles.addTaskButton} onPress={() => setShowTinyVictories(true)}>
              <Sparkles size={20} color="#FFFFFF" />
              <Text style={styles.addTaskText}>{t('today.tinyVictories')}</Text>
            </TouchableOpacity>

            <View style={styles.themeControls}>
              <TouchableOpacity
                style={styles.themeButton}
                onPress={() => setTheme(currentTheme === 'daydream' ? 'nightforest' : 'daydream')}
              >
                <Text style={styles.themeButtonText}>
                  {currentTheme === 'daydream' ? t('today.nightForest') : t('today.dayDream')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Morning */}
          <View style={[styles.routineSection, { backgroundColor: colors.surface }]}>
            <View style={styles.routineHeader}>
              <View style={styles.routineTitle}>
                <Coffee size={20} color="#F59E0B" />
                <Text style={[styles.routineTitleText, { color: colors.text }]}>{t('today.morningRoutine')}</Text>
              </View>
              <TouchableOpacity onPress={() => { setCurrentRoutineType('morning'); setShowAddModal(true); }}>
                <Plus size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>

            {routineManager.morningRoutine.map(step => (
              <View key={step.id} style={styles.stepContainer}>
                <MagicalCheckbox completed={step.completed} onPress={() => routineManager.toggleStep(step.id, 'morning')} disabled={routineManager.isSnoozed} />
                <Text style={[styles.stepText, step.completed && styles.stepTextCompleted, routineManager.isSnoozed && styles.stepTextDisabled]}>{step.text}</Text>
                <View style={styles.stepActions}>
                  <TouchableOpacity onPress={() => {/* open edit UI */}}>
                    <EditIcon size={16} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>

          {/* Evening */}
          <View style={[styles.routineSection, { backgroundColor: colors.surface }]}>
            <View style={styles.routineHeader}>
              <View style={styles.routineTitle}>
                <Moon size={20} color="#8B5CF6" />
                <Text style={[styles.routineTitleText, { color: colors.text }]}>{t('today.eveningRoutine')}</Text>
              </View>
              <TouchableOpacity onPress={() => { setCurrentRoutineType('evening'); setShowAddModal(true); }}>
                <Plus size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>

            {routineManager.eveningRoutine.map(step => (
              <View key={step.id} style={styles.stepContainer}>
                <MagicalCheckbox completed={step.completed} onPress={() => routineManager.toggleStep(step.id, 'evening')} disabled={routineManager.isSnoozed} />
                <Text style={[styles.stepText, step.completed && styles.stepTextCompleted, routineManager.isSnoozed && styles.stepTextDisabled]}>{step.text}</Text>
                <View style={styles.stepActions}>
                  <TouchableOpacity onPress={() => {/* open edit UI */}}>
                    <EditIcon size={16} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>

          {/* Progress preview */}
          {progress && (
            <View style={[styles.progressSection, { backgroundColor: colors.surface }]}>
              <Text style={[styles.progressTitle, { color: colors.text }]}>{t('today.todaysProgress')}</Text>
              <View style={styles.progressStats}>
                <View style={styles.progressStat}>
                  <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>{t('today.morning')}</Text>
                  <Text style={[styles.progressValue, { color: colors.primary }]}>{progress.morningDone}/{progress.morningTotal}</Text>
                </View>
                <View style={styles.progressStat}>
                  <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>{t('today.evening')}</Text>
                  <Text style={[styles.progressValue, { color: colors.primary }]}>{progress.eveningDone}/{progress.eveningTotal}</Text>
                </View>
              </View>
            </View>
          )}

        </ScrollView>
      </LinearGradient>

      {/* Add step modal simplified */}
      <Modal visible={showAddModal} animationType="slide" transparent statusBarTranslucent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('common.add')}</Text>
            <TextInput value={newStepText} onChangeText={setNewStepText} style={styles.textInput} placeholder={t('today.enterGentleStep')} />
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => { setShowAddModal(false); setNewStepText(''); }}>
                <Text>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={async () => {
                await routineManager.addStep(currentRoutineType, newStepText.trim());
                setShowAddModal(false);
                setNewStepText('');
              }}>
                <Text>{t('common.add')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Tiny Victories */}
      <Modal visible={showTinyVictories} animationType="slide" transparent statusBarTranslucent>
        <View style={styles.modalOverlay}>
          <TinyVictoryTracker onVictoryPress={(v) => routineManager.celebrateVictory(v)} />
          <TouchableOpacity onPress={() => setShowTinyVictories(false)} style={styles.closeVictoriesButton}>
            <Text style={styles.closeVictoriesText}>{t('common.close')}</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {showSurprisePrompt && <SurprisePrompt onDismiss={() => setShowSurprisePrompt(false)} />}
    </SafeAreaView>
  );
}
