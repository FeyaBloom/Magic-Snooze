import React, { useState, useEffect, useCallback, useRef, useMemo, memo } from 'react';
import {
  View,
  Text,
  ScrollView,
  AppState,
  TouchableOpacity,
  TouchableWithoutFeedback,
  DeviceEventEmitter,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, Edit, Coffee, Moon, Pause, Sparkles, Trophy } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LottieView from 'lottie-react-native';
import ConfettiJSON from '@/assets/animations/confetti.json';

// Components
import { ScreenLayout } from '@/components/ScreenLayout';
import { ContentContainer } from '@/components/ContentContainer';
import { MagicalCheckbox } from '@/components/MagicalCheckbox';
import { VictoriesModal } from '@/components/modals/VictoriesModal';
import { ConfirmDialog } from '@/components/modals/ConfirmDialog';
import { RoutineFormModal } from '@/components/modals/RoutineFormModal';

// Hooks
import { useTextStyles } from '@/hooks/useTextStyles';
import { useTheme } from '@/components/ThemeProvider';
import { useTranslation } from 'react-i18next';
import { useDailyProgress } from '@/hooks/useDailyProgress';
import { useMidnightReset, type MidnightResetConfig } from '@/hooks/useMidnightReset';
import { useRoutinesBlock } from '@/hooks/useRoutinesBlock';
import { useRoutineManager, type RoutineStep, type RoutineType } from '@/hooks/useRoutineManager';
import { useVictories } from '@/hooks/useVictories';
import { useStreak } from '@/hooks/useStreak';

// Styles
import { createTodayStyles } from '@/styles/index';
import { TOUCHABLE_CONFIG } from '@/styles/touchable';

const RoutineStepRow = memo(function RoutineStepRow({
  step,
  displayText,
  isSnoozed,
  isExpanded,
  onToggle,
  onToggleExpand,
  onEdit,
  colors,
  textStyles,
  styles,
}: {
  step: RoutineStep;
  displayText: string;
  isSnoozed: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onToggleExpand: () => void;
  onEdit: () => void;
  colors: any;
  textStyles: any;
  styles: any;
}) {
  return (
    <View style={styles.stepContainer}>
      <MagicalCheckbox
        completed={step.completed}
        onPress={onToggle}
        disabled={isSnoozed}
      />
      <TouchableWithoutFeedback onPress={onToggleExpand}>
        <Text
          style={[
            textStyles.body,
            { color: colors.text, flex: 1 },
            step.completed && styles.stepTextCompleted,
            isSnoozed && styles.stepTextDisabled,
          ]}
          numberOfLines={isExpanded ? undefined : 3}
          ellipsizeMode="tail"
        >
          {displayText}
        </Text>
      </TouchableWithoutFeedback>

      <TouchableOpacity
        style={styles.actionButton}
        onPress={onEdit}
        disabled={isSnoozed}
      >
        <Edit
          size={16}
          color={isSnoozed ? colors.textSecondary + '50' : colors.textSecondary}
        />
      </TouchableOpacity>
    </View>
  );
});

export default function TodayScreen() {
  // Hooks
  const router = useRouter();
  const { t } = useTranslation();
  const textStyles = useTextStyles();
  const { colors, currentTheme, setThemeManual, isMessyMode } = useTheme();
  
  const { loadProgress, saveProgress, getLocalDateString } = useDailyProgress();
  const { celebratedVictories, celebrateVictory, resetVictories, loadCelebratedVictories } = useVictories();
  const { snoozeDay: blockDay, unsnoozeDay: unblockDay } = useRoutinesBlock();
  const { updateStreak } = useStreak();
  const routineConfettiTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const confettiInitializedRef = useRef(false);
  const previousAllCompletedRef = useRef(false);
  const previousMorningCompletedRef = useRef(false);
  const previousEveningCompletedRef = useRef(false);

  // State
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTinyVictories, setShowTinyVictories] = useState(false);
  const [currentRoutine, setCurrentRoutine] = useState<RoutineType>('morning');
  const [newStepText, setNewStepText] = useState('');
  const [editingStep, setEditingStep] = useState<RoutineStep | null>(null);
  const [expandedStepId, setExpandedStepId] = useState<string | null>(null);
  const [isSnoozePressed, setIsSnoozePressed] = useState(false);
  const [showRoutineConfetti, setShowRoutineConfetti] = useState(false);
  
  const [confirmDialog, setConfirmDialog] = useState({
    visible: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const styles = createTodayStyles(colors);

  const {
    morningRoutine,
    eveningRoutine,
    isSnoozed,
    isLoaded,
    loadData,
    loadDefaultRoutines,
    resetRoutineCheckboxes,
    resolveStepText,
    toggleStep,
    addStep,
    editStep,
    deleteStep,
    snoozeToday,
    onResetMorningRoutine,
    onResetEveningRoutine,
    resetSnooze,
    scheduleStreakUpdate,
  } = useRoutineManager({
    t,
    getLocalDateString,
    saveProgress,
    updateStreak,
    blockDay,
    unblockDay,
  });

  // Functions
  const toggleStepExpand = useCallback((stepId: string) => {
    setExpandedStepId(prev => (prev === stepId ? null : stepId));
  }, []);

  const handleAddStep = useCallback(async () => {
    const added = await addStep(currentRoutine, newStepText);
    if (!added) return;

    setNewStepText('');
    setShowAddModal(false);
  }, [addStep, currentRoutine, newStepText]);

  const handleEditStep = useCallback(async () => {
    if (!editingStep) return;

    const updated = await editStep(currentRoutine, editingStep.id, newStepText);
    if (!updated) return;

    setNewStepText('');
    setEditingStep(null);
    setShowEditModal(false);
  }, [currentRoutine, editStep, editingStep, newStepText]);

  const handleDeleteStep = useCallback((stepId: string, routineType: RoutineType) => {
    setConfirmDialog({
      visible: true,
      title: t('today.deleteStep'),
      message: t('today.deleteStepConfirm'),
      onConfirm: async () => {
        await deleteStep(stepId, routineType);
        setShowEditModal(false);
        setEditingStep(null);
      },
    });
  }, [deleteStep, t]);

  // Midnight reset configuration
  const midnightResetConfig: MidnightResetConfig = {
    onResetMorningRoutine,
    onResetEveningRoutine,
    onResetVictories: resetVictories,
    onResetSnooze: resetSnooze,
  };

  // Register midnight reset
  useMidnightReset(midnightResetConfig);

  // Effects
  useEffect(() => {
    void loadData();
    void loadProgress();
    scheduleStreakUpdate(false);
  }, [loadData, loadProgress]);

  useEffect(() => {
    const appStateSubscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        // Force full data reload including date validation to catch day changes
        // when app was backgrounded but not closed
        void (async () => {
          const currentDate = getLocalDateString();
          const lastProgressDate = await AsyncStorage.getItem('lastProgressDate');
          const needsReset = lastProgressDate !== currentDate;
          
          // If day changed, definitely reset checkboxes
          if (needsReset) {
            await resetRoutineCheckboxes();
            await AsyncStorage.setItem('lastProgressDate', currentDate);
            confettiInitializedRef.current = false; // Reset confetti flag for new day
          }
          
          await loadData();
          await loadProgress();
        })();
      }
    });

    return () => {
      appStateSubscription.remove();
    };
  }, [loadData, loadProgress, getLocalDateString, resetRoutineCheckboxes]);

  useEffect(() => {
    return () => {
      if (routineConfettiTimer.current) {
        clearTimeout(routineConfettiTimer.current);
      }
    };
  }, []);

  const allRoutinesCompleted = useMemo(() => {
    const allSteps = [...morningRoutine, ...eveningRoutine];
    if (allSteps.length === 0) return false;
    return allSteps.every((step) => step.completed);
  }, [morningRoutine, eveningRoutine]);

  const allMorningCompleted = useMemo(() => {
    if (morningRoutine.length === 0) return false;
    return morningRoutine.every((step) => step.completed);
  }, [morningRoutine]);

  const allEveningCompleted = useMemo(() => {
    if (eveningRoutine.length === 0) return false;
    return eveningRoutine.every((step) => step.completed);
  }, [eveningRoutine]);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (!confettiInitializedRef.current) {
      // First time after data loads - initialize refs with actual state
      previousAllCompletedRef.current = allRoutinesCompleted;
      previousMorningCompletedRef.current = allMorningCompleted;
      previousEveningCompletedRef.current = allEveningCompleted;
      confettiInitializedRef.current = true;
      return;
    }

    // Now compare and fire confetti only on transitions (false → true)
    const shouldFireConfetti = (
      (!previousAllCompletedRef.current && allRoutinesCompleted) ||
      (!previousMorningCompletedRef.current && allMorningCompleted) ||
      (!previousEveningCompletedRef.current && allEveningCompleted)
    ) && !isSnoozed;

    if (shouldFireConfetti) {
      setShowRoutineConfetti(true);
      if (routineConfettiTimer.current) {
        clearTimeout(routineConfettiTimer.current);
      }
      routineConfettiTimer.current = setTimeout(() => {
        setShowRoutineConfetti(false);
      }, 1800);
    }

    previousAllCompletedRef.current = allRoutinesCompleted;
    previousMorningCompletedRef.current = allMorningCompleted;
    previousEveningCompletedRef.current = allEveningCompleted;
  }, [allRoutinesCompleted, allMorningCompleted, allEveningCompleted, isSnoozed, isLoaded]);

  useEffect(() => {
    const handleDataReset = (data: { categories: string[], deletedKeys: string[], timestamp: number }) => {
      if (data.categories.includes('routines')) {
        loadDefaultRoutines();
      }

      if (data.categories.includes('progress')) {
        resetSnooze();
        void resetRoutineCheckboxes();
      }
    };

    const listener = DeviceEventEmitter.addListener('dataReset', handleDataReset);
    return () => listener.remove();
  }, [loadDefaultRoutines, resetRoutineCheckboxes, resetSnooze]);

  // Reset confetti flag when midnight reset happens (routines go back to incomplete)
  useEffect(() => {
    if (!allMorningCompleted && previousMorningCompletedRef.current) {
      // Morning routine was reset (e.g., at midnight)
      confettiInitializedRef.current = false;
    }
    if (!allEveningCompleted && previousEveningCompletedRef.current) {
      // Evening routine was reset (e.g., at midnight)
      confettiInitializedRef.current = false;
    }
  }, [allMorningCompleted, allEveningCompleted]);

  // Render routine section
  const renderRoutineSection = (
    title: string,
    routine: RoutineStep[],
    routineType: 'morning' | 'evening',
    icon: React.ReactNode
  ) => (
    <View style={styles.routineSection}>
      <View style={styles.routineHeader}>
        <View style={styles.routineTitle}>
          {icon}
          <Text
            style={[textStyles.h2, { color: colors.text }]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
          >
            {title}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            setCurrentRoutine(routineType);
            setShowAddModal(true);
          }}
        >
          <Plus size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View>
        {routine.map((item) => (
          <RoutineStepRow
            key={item.id}
            step={item}
            displayText={resolveStepText(item)}
            isSnoozed={isSnoozed}
            isExpanded={expandedStepId === item.id}
            onToggle={() => toggleStep(item.id, routineType)}
            onToggleExpand={() => toggleStepExpand(item.id)}
            onEdit={() => {
              setCurrentRoutine(routineType);
              setEditingStep(item);
              setNewStepText(resolveStepText(item));
              setShowEditModal(true);
            }}
            colors={colors}
            textStyles={textStyles}
            styles={styles}
          />
        ))}
      </View>
    </View>
  );

  return (
    <ScreenLayout tabName="index" scroll={false}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <ContentContainer paddingHorizontal={20} paddingVertical={20}>
          {/* Header */}
          <View style={{ marginBottom: isMessyMode ? 32 : 24 }}>
            <Text
              style={[textStyles.h1, { color: colors.text, textAlign: 'center', marginBottom: 8 }]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.7}
            >
              {t('today.title')}
            </Text>

            <Text
              style={[textStyles.body, { color: colors.textSecondary, textAlign: 'center', opacity: 0.9 }]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.7}
            >
              {isSnoozed ? t('today.subtitleSnoozed') : t('today.subtitle')}
            </Text>

            <View
              style={{
                marginTop: 12,
                paddingVertical: 10,
                paddingHorizontal: 12,
                borderRadius: 12,
                backgroundColor: colors.surface,
                // @ts-ignore
                //boxShadow: `0 2px 6px ${colors.secondary}22`,
                opacity: 0.7,
              }}
            >
              <Text
                style={[textStyles.caption, { color: colors.textSecondary, textAlign: 'center' }]}
              >
                {t('today.gentleFallback')}
              </Text>
            </View>
          </View>


          {/* Controls */}
          <View style={{ marginBottom: isMessyMode ? 32 : 24 }}>
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignSelf: 'center',
                justifyContent: 'center',         
                backgroundColor: colors.surface,                
                marginBottom: 20,
                paddingVertical: 14,
                paddingHorizontal: 40,
                borderRadius: 16,
              }}
              onPress={async () => {
                await loadCelebratedVictories();
                setShowTinyVictories(true);
              }}
              activeOpacity={TOUCHABLE_CONFIG.activeOpacity}
              accessibilityRole="button"
              accessibilityLabel={t('today.tinyVictories')}
            >
              <Sparkles size={20} color={colors.primary} />
              <Text style={[textStyles.button, { color: colors.text }]}>
                {t('today.tinyVictories')}
              </Text>
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              <TouchableOpacity
                style={{ backgroundColor: colors.surface, paddingHorizontal: 25, paddingVertical: 12, borderRadius: 12 }}
                onPress={() => setThemeManual(currentTheme === 'daydream' ? 'nightforest' : 'daydream')}
                activeOpacity={TOUCHABLE_CONFIG.activeOpacity}
                accessibilityRole="button"
                accessibilityLabel={currentTheme === 'daydream' ? t('today.nightForest') : t('today.dayDream')}
              >
                <Text style={[textStyles.caption, { color: colors.text }]}>
                  {currentTheme === 'daydream' ? t('today.nightForest') : t('today.dayDream')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ backgroundColor: colors.surface, paddingHorizontal: 25, paddingVertical: 12, borderRadius: 12 }}
                onPress={() => router.push('/settings')}
                activeOpacity={TOUCHABLE_CONFIG.activeOpacity}
                accessibilityRole="button"
                accessibilityLabel={t('navigation.settings')}
              >
                <Text style={[textStyles.caption, { color: colors.text }]}>
                  {t('navigation.settings')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Snooze button */}
          {!isSnoozed && (
            <TouchableOpacity 
              onPress={snoozeToday} 
              style={[styles.snoozeButton, isSnoozePressed && styles.snoozeButtonPressed]}
              activeOpacity={1}
              onPressIn={() => setIsSnoozePressed(true)}
              onPressOut={() => setIsSnoozePressed(false)}
              accessibilityRole="button"
              accessibilityLabel={t('today.snoozeToday')}
            >
              <Pause size={20} color={colors.surface}/>
              <Text style={textStyles.button}>
                {t('today.snoozeToday')}
              </Text>
            </TouchableOpacity>
          )}

                    {/* Resume button if snoozed */}
          {isSnoozed && (
            <TouchableOpacity 
              onPress={snoozeToday} 
              style={[styles.resumeButton, isSnoozePressed && styles.resumeButtonPressed]}
              activeOpacity={1}
              onPressIn={() => setIsSnoozePressed(true)}
              onPressOut={() => setIsSnoozePressed(false)}
              accessibilityRole="button"
              accessibilityLabel={t('today.resumeToday')}
            >
              <Text style={textStyles.button}>
                {t('today.resumeToday')}
              </Text>
            </TouchableOpacity>
          )}

          {/* Routines */}
          {renderRoutineSection(
            t('today.morningRoutine'),
            morningRoutine,
            'morning',
            <Coffee size={20} color="#F59E0B" />
          )}

          {renderRoutineSection(
            t('today.eveningRoutine'),
            eveningRoutine,
            'evening',
            <Moon size={20} color="#6366f1" />
          )}

        </ContentContainer>
      </ScrollView>

      {showRoutineConfetti && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <LottieView
            source={ConfettiJSON}
            autoPlay
            loop={false}
            speed={1.15}
            style={{ width: 420, height: 420 }}
          />
        </View>
      )}

      {/* Modals */}
      <VictoriesModal
        visible={showTinyVictories}
        onClose={() => setShowTinyVictories(false)}
        celebratedVictories={celebratedVictories}
        onVictoryPress={celebrateVictory}
      />

      <RoutineFormModal
        visible={showAddModal}
        title={t('today.addNewStep')}
        value={newStepText}
        placeholder={t('today.enterGentleStep')}
        saveLabel={t('common.add')}
        cancelLabel={t('common.cancel')}
        colors={colors}
        textStyles={textStyles}
        styles={styles}
        onChangeText={setNewStepText}
        onClose={() => {
          setShowAddModal(false);
          setNewStepText('');
        }}
        onSave={handleAddStep}
      />

      <RoutineFormModal
        visible={showEditModal}
        title={t('today.editStep')}
        value={newStepText}
        placeholder={t('today.enterGentleStep')}
        saveLabel={t('common.save')}
        cancelLabel={t('common.cancel')}
        colors={colors}
        textStyles={textStyles}
        styles={styles}
        onChangeText={setNewStepText}
        onClose={() => {
          setShowEditModal(false);
          setNewStepText('');
          setEditingStep(null);
        }}
        onSave={handleEditStep}
        onDelete={() => {
          if (editingStep && currentRoutine) {
            handleDeleteStep(editingStep.id, currentRoutine);
          }
        }}
      />

      <ConfirmDialog
        visible={confirmDialog.visible}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={() => {
          confirmDialog.onConfirm();
          setConfirmDialog(d => ({ ...d, visible: false }));
        }}
        onCancel={() => setConfirmDialog(d => ({ ...d, visible: false }))}
      />
    </ScreenLayout>
  );
}