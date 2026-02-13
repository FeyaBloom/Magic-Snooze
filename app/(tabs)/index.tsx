import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  DeviceEventEmitter,
  TouchableWithoutFeedback,
  KeyboardAvoidingView, 
  Platform,
  Keyboard,
  Animated,
  FlatList
} from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, Edit, Trash2, Coffee, Moon, Pause, Sparkles, Trophy } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocalDateString } from '@/utils/dateUtils';

// Components
import { ScreenLayout } from '@/components/ScreenLayout';
import { ContentContainer } from '@/components/ContentContainer';
import { MagicalCheckbox } from '@/components/MagicalCheckbox';
import { VictoriesModal } from '@/components/modals/VictoriesModal';
import { ConfirmDialog } from '@/components/modals/ConfirmDialog';

// Hooks
import { useTextStyles } from '@/hooks/useTextStyles';
import { useTheme } from '@/components/ThemeProvider';
import { useTranslation } from 'react-i18next';
import { useDailyProgress } from '@/hooks/useDailyProgress';
import { useMidnightReset, type MidnightResetConfig } from '@/hooks/useMidnightReset';
import { useRoutinesBlock } from '@/hooks/useRoutinesBlock';
import { useVictories } from '@/hooks/useVictories';
import { useStreak } from '@/hooks/useStreak';

// Styles
import { createTodayStyles } from '@/styles/index';
import { TOUCHABLE_CONFIG } from '@/styles/touchable';

interface RoutineStep {
  id: string;
  text: string;
  completed: boolean;
}

const RoutineStepRow = memo(function RoutineStepRow({
  step,
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
          {step.text}
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
  const { t, i18n } = useTranslation();
  const textStyles = useTextStyles();
  const { colors, currentTheme, setThemeManual, isMessyMode } = useTheme();
  
  const { progress: todayProgress, loadProgress, saveProgress, getLocalDateString } = useDailyProgress();
  const { celebrateVictory, resetVictories } = useVictories();
  const { snoozeDay: blockDay, unsnoozeDay: unblockDay } = useRoutinesBlock();
  const { updateStreak } = useStreak();
  const streakUpdateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveProgressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingProgress = useRef<{ morning: RoutineStep[]; evening: RoutineStep[] } | null>(null);

  // State
  const [morningRoutine, setMorningRoutine] = useState<RoutineStep[]>([]);
  const [eveningRoutine, setEveningRoutine] = useState<RoutineStep[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTinyVictories, setShowTinyVictories] = useState(false);
  const [currentRoutine, setCurrentRoutine] = useState<'morning' | 'evening'>('morning');
  const [newStepText, setNewStepText] = useState('');
  const [editingStep, setEditingStep] = useState<RoutineStep | null>(null);
  const [isSnoozed, setIsSnoozed] = useState(false);
  const [expandedStepId, setExpandedStepId] = useState<string | null>(null);
  const [isSnoozePressed, setIsSnoozePressed] = useState(false);
  
  const [confirmDialog, setConfirmDialog] = useState({
    visible: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const styles = createTodayStyles(colors);

  // Functions
  const toggleStepExpand = useCallback((stepId: string) => {
    setExpandedStepId(prev => (prev === stepId ? null : stepId));
  }, []);

  const scheduleStreakUpdate = (hasActivity: boolean) => {
    if (streakUpdateTimer.current) {
      clearTimeout(streakUpdateTimer.current);
    }
    streakUpdateTimer.current = setTimeout(() => {
      updateStreak(hasActivity);
    }, 300);
  };

  const scheduleSaveProgress = (morning: RoutineStep[], evening: RoutineStep[]) => {
    pendingProgress.current = { morning, evening };
    if (saveProgressTimer.current) {
      clearTimeout(saveProgressTimer.current);
    }
    saveProgressTimer.current = setTimeout(() => {
      const payload = pendingProgress.current;
      if (!payload) return;
      saveProgressData(payload.morning, payload.evening);
    }, 120);
  };

  const loadDefaultRoutines = async () => {
    try {
      const defaultMorning = [
        { id: '1', text: t('today.defaultMorning.stretch'), completed: false },
        { id: '2', text: t('today.defaultMorning.breathing'), completed: false },
        { id: '3', text: t('today.defaultMorning.intention'), completed: false },
      ];

      const defaultEvening = [
        { id: '1', text: t('today.defaultEvening.reflect'), completed: false },
        { id: '2', text: t('today.defaultEvening.selfCare'), completed: false },
        { id: '3', text: t('today.defaultEvening.prepare'), completed: false },
      ];

      setMorningRoutine(defaultMorning);
      setEveningRoutine(defaultEvening);

      await AsyncStorage.setItem('morningRoutine', JSON.stringify(defaultMorning));
      await AsyncStorage.setItem('eveningRoutine', JSON.stringify(defaultEvening));
    } catch (error) {
      console.error('Error loading default routines:', error);
    }
  };

  const resetRoutineCheckboxes = async () => {
    try {
      const morningData = await AsyncStorage.getItem('morningRoutine');
      const eveningData = await AsyncStorage.getItem('eveningRoutine');

      if (morningData) {
        const currentMorning = JSON.parse(morningData);
        const resetMorning = currentMorning.map((step: RoutineStep) => ({ ...step, completed: false }));
        setMorningRoutine(resetMorning);
        await AsyncStorage.setItem('morningRoutine', JSON.stringify(resetMorning));
      }

      if (eveningData) {
        const currentEvening = JSON.parse(eveningData);
        const resetEvening = currentEvening.map((step: RoutineStep) => ({ ...step, completed: false }));
        setEveningRoutine(resetEvening);
        await AsyncStorage.setItem('eveningRoutine', JSON.stringify(resetEvening));
      }
    } catch (error) {
      console.error('Error resetting routine checkboxes:', error);
    }
  };

  // Midnight reset configuration
  const midnightResetConfig: MidnightResetConfig = {
    onResetMorningRoutine: async (resetMorning) => {
      setMorningRoutine(resetMorning);
      await AsyncStorage.setItem('morningRoutine', JSON.stringify(resetMorning));
    },
    onResetEveningRoutine: async (resetEvening) => {
      setEveningRoutine(resetEvening);
      await AsyncStorage.setItem('eveningRoutine', JSON.stringify(resetEvening));
    },
    onResetVictories: resetVictories,
    onResetSnooze: () => setIsSnoozed(false),
  };

  // Register midnight reset
  useMidnightReset(midnightResetConfig);

  const loadData = async () => {
    try {
      const currentDate = getLocalDateString();

      const morningData = await AsyncStorage.getItem('morningRoutine');
      const eveningData = await AsyncStorage.getItem('eveningRoutine');
      const progressData = await AsyncStorage.getItem(`progress_${currentDate}`);
      const lastProgressDate = await AsyncStorage.getItem('lastProgressDate');
      const needsReset = lastProgressDate !== currentDate;

      if (morningData) {
        const parsedMorning = JSON.parse(morningData);
        if (needsReset) {
          const resetMorning = parsedMorning.map((step: RoutineStep) => ({ ...step, completed: false }));
          await AsyncStorage.setItem('morningRoutine', JSON.stringify(resetMorning));
          setMorningRoutine(resetMorning);
        } else {
          setMorningRoutine(parsedMorning);
        }
      } else {
        const defaultMorning = [
          { id: '1', text: t('today.defaultMorning.stretch'), completed: false },
          { id: '2', text: t('today.defaultMorning.breathing'), completed: false },
          { id: '3', text: t('today.defaultMorning.intention'), completed: false },
        ];
        setMorningRoutine(defaultMorning);
        await AsyncStorage.setItem('morningRoutine', JSON.stringify(defaultMorning));
      }

      if (eveningData) {
        const parsedEvening = JSON.parse(eveningData);
        if (needsReset) {
          const resetEvening = parsedEvening.map((step: RoutineStep) => ({ ...step, completed: false }));
          await AsyncStorage.setItem('eveningRoutine', JSON.stringify(resetEvening));
          setEveningRoutine(resetEvening);
        } else {
          setEveningRoutine(parsedEvening);
        }
      } else {
        const defaultEvening = [
          { id: '1', text: t('today.defaultEvening.reflect'), completed: false },
          { id: '2', text: t('today.defaultEvening.selfCare'), completed: false },
          { id: '3', text: t('today.defaultEvening.prepare'), completed: false },
        ];
        setEveningRoutine(defaultEvening);
        await AsyncStorage.setItem('eveningRoutine', JSON.stringify(defaultEvening));
      }

      // Сохраняем дату только после обработки обеих рутин
      if (needsReset) {
        await AsyncStorage.setItem('lastProgressDate', currentDate);
      }

      if (progressData) {
        const progress = JSON.parse(progressData);
        setIsSnoozed(progress.snoozed || false);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

const saveProgressData = async (morning: RoutineStep[], evening: RoutineStep[]) => {
  try {
    const morningDone = morning.filter(step => step.completed).length;
    const eveningDone = evening.filter(step => step.completed).length;
    const today = getLocalDateString();

    const progressData = {
      date: today,
      morningCompleted: morningDone === morning.length,
      eveningCompleted: eveningDone === evening.length,
      morningTotal: morning.length,
      eveningTotal: evening.length,
      morningDone,
      eveningDone,
      snoozed: isSnoozed,
      // save routine's texts
      morningRoutines: morning.map(s => ({ text: s.text, completed: s.completed })),
      eveningRoutines: evening.map(s => ({ text: s.text, completed: s.completed })),
    };

    await saveProgress(progressData);

    // Update streak based on whether day has any activity
    // Pass true - updateStreak will check all sources (routines, tasks, victories)
    scheduleStreakUpdate(true);

    // Notify calendar to refresh stats
    DeviceEventEmitter.emit('progressChanged', { timestamp: Date.now() });
  } catch (error) {
    console.error('Error saving progress:', error);
  }
};


  const toggleStep = useCallback(async (stepId: string, routine: 'morning' | 'evening') => {
    if (isSnoozed) return;

    const updateRoutine = routine === 'morning' ? morningRoutine : eveningRoutine;
    const setRoutine = routine === 'morning' ? setMorningRoutine : setEveningRoutine;

    const updated = updateRoutine.map(step =>
      step.id === stepId ? { ...step, completed: !step.completed } : step
    );

    setRoutine(updated);
    await AsyncStorage.setItem(`${routine}Routine`, JSON.stringify(updated));

    const otherRoutine = routine === 'morning' ? eveningRoutine : morningRoutine;
    scheduleSaveProgress(
      routine === 'morning' ? updated : otherRoutine,
      routine === 'evening' ? updated : otherRoutine
    );
  }, [isSnoozed, morningRoutine, eveningRoutine, scheduleSaveProgress]);

  const addStep = async () => {
    if (!newStepText.trim()) return;

    const newStep: RoutineStep = {
      id: Date.now().toString(),
      text: newStepText.trim(),
      completed: false,
    };

    const routine = currentRoutine === 'morning' ? morningRoutine : eveningRoutine;
    const setRoutine = currentRoutine === 'morning' ? setMorningRoutine : setEveningRoutine;

    const updated = [...routine, newStep];
    setRoutine(updated);
    await AsyncStorage.setItem(`${currentRoutine}Routine`, JSON.stringify(updated));

    const otherRoutine = currentRoutine === 'morning' ? eveningRoutine : morningRoutine;
    scheduleSaveProgress(
      currentRoutine === 'morning' ? updated : otherRoutine,
      currentRoutine === 'evening' ? updated : otherRoutine
    );

    setNewStepText('');
    setShowAddModal(false);
  };

  const editStep = async () => {
    if (!editingStep || !newStepText.trim()) return;

    const routine = currentRoutine === 'morning' ? morningRoutine : eveningRoutine;
    const setRoutine = currentRoutine === 'morning' ? setMorningRoutine : setEveningRoutine;

    const updated = routine.map(step =>
      step.id === editingStep.id ? { ...step, text: newStepText.trim() } : step
    );

    setRoutine(updated);
    await AsyncStorage.setItem(`${currentRoutine}Routine`, JSON.stringify(updated));

    setNewStepText('');
    setEditingStep(null);
    setShowEditModal(false);
  };

  const deleteStep = (stepId: string, routine: 'morning' | 'evening') => {
    setConfirmDialog({
      visible: true,
      title: t('today.deleteStep'),
      message: t('today.deleteStepConfirm'),
      onConfirm: async () => {
        const updateRoutine = routine === 'morning' ? morningRoutine : eveningRoutine;
        const setRoutine = routine === 'morning' ? setMorningRoutine : setEveningRoutine;

        const updated = updateRoutine.filter(step => step.id !== stepId);
        setRoutine(updated);
        await AsyncStorage.setItem(`${routine}Routine`, JSON.stringify(updated));

        const otherRoutine = routine === 'morning' ? eveningRoutine : morningRoutine;
        scheduleSaveProgress(
          routine === 'morning' ? updated : otherRoutine,
          routine === 'evening' ? updated : otherRoutine
        );

        setShowEditModal(false);
        setEditingStep(null);
      },
    });
  };

  const snoozeToday = async () => {
    const newSnoozed = !isSnoozed;
    setIsSnoozed(newSnoozed);

    if (newSnoozed) {
      await blockDay?.();
      scheduleStreakUpdate(false);
    } else {
      await unblockDay?.();
    }
  };

  // Effects
  useEffect(() => {
    loadData();
    loadProgress();
    scheduleStreakUpdate(false);
  }, []);

  useEffect(() => {
    return () => {
      const pending = pendingProgress.current;
      if (pending) {
        // Принудительно сохранить последнюю отложенную запись
        saveProgressData(pending.morning, pending.evening);
      }
      if (streakUpdateTimer.current) {
        clearTimeout(streakUpdateTimer.current);
      }
      if (saveProgressTimer.current) {
        clearTimeout(saveProgressTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleDataReset = (data: { categories: string[], deletedKeys: string[], timestamp: number }) => {
      if (data.categories.includes('routines')) {
        loadDefaultRoutines();
      }

      if (data.categories.includes('progress')) {
        setIsSnoozed(false);
        resetRoutineCheckboxes();
      }
    };

    const listener = DeviceEventEmitter.addListener('dataReset', handleDataReset);
    return () => listener.remove();
  }, []);


  useEffect(() => {
  const updateDefaultRoutines = async () => {
    try {
      const morningData = await AsyncStorage.getItem('morningRoutine');
      const eveningData = await AsyncStorage.getItem('eveningRoutine');

      // If routines are default (by ID)
      if (morningData) {
        const morning = JSON.parse(morningData);
        const isDefault = morning.every((s: RoutineStep) => 
          ['1', '2', '3'].includes(s.id)
        );
        
        if (isDefault) {
          const updatedMorning = morning.map((step: RoutineStep) => {
            let newText = '';
            if (step.id === '1') newText = t('today.defaultMorning.stretch');
            else if (step.id === '2') newText = t('today.defaultMorning.breathing');
            else if (step.id === '3') newText = t('today.defaultMorning.intention');
            return { ...step, text: newText };
          });
          setMorningRoutine(updatedMorning);
          await AsyncStorage.setItem('morningRoutine', JSON.stringify(updatedMorning));
        }
      }

      if (eveningData) {
        const evening = JSON.parse(eveningData);
        const isDefault = evening.every((s: RoutineStep) => 
          ['1', '2', '3'].includes(s.id)
        );
        
        if (isDefault) {
          const updatedEvening = evening.map((step: RoutineStep) => {
            let newText = '';
            if (step.id === '1') newText = t('today.defaultEvening.reflect');
            else if (step.id === '2') newText = t('today.defaultEvening.selfCare');
            else if (step.id === '3') newText = t('today.defaultEvening.prepare');
            return { ...step, text: newText };
          });
          setEveningRoutine(updatedEvening);
          await AsyncStorage.setItem('eveningRoutine', JSON.stringify(updatedEvening));
        }
      }
    } catch (error) {
      console.error('Error updating routines language:', error);
    }
  };

  updateDefaultRoutines();
}, [i18n.language]); 


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

      <FlatList
        data={routine}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        removeClippedSubviews
        renderItem={({ item }) => (
          <RoutineStepRow
            step={item}
            isSnoozed={isSnoozed}
            isExpanded={expandedStepId === item.id}
            onToggle={() => toggleStep(item.id, routineType)}
            onToggleExpand={() => toggleStepExpand(item.id)}
            onEdit={() => {
              setCurrentRoutine(routineType);
              setEditingStep(item);
              setNewStepText(item.text);
              setShowEditModal(true);
            }}
            colors={colors}
            textStyles={textStyles}
            styles={styles}
          />
        )}
      />
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
              onPress={() => setShowTinyVictories(true)}
              activeOpacity={TOUCHABLE_CONFIG.activeOpacity}
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
              >
                <Text style={[textStyles.caption, { color: colors.text }]}>
                  {currentTheme === 'daydream' ? t('today.nightForest') : t('today.dayDream')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ backgroundColor: colors.surface, paddingHorizontal: 25, paddingVertical: 12, borderRadius: 12 }}
                onPress={() => router.push('/settings')}
                activeOpacity={TOUCHABLE_CONFIG.activeOpacity}
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
            >
              <Pause size={20}/>
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
            <Moon size={20} color="#8B5CF6" />
          )}

        </ContentContainer>
      </ScrollView>

      {/* Modals */}
      <VictoriesModal
        visible={showTinyVictories}
        onClose={() => setShowTinyVictories(false)}
        onVictoryPress={celebrateVictory}
      />

      <Modal 
      visible={showAddModal} 
      animationType="fade" 
      transparent={true} 
      statusBarTranslucent={true}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView 
            behavior="padding"
            keyboardVerticalOffset={0}
            style={styles.modalOverlay}
        >      
          <View style={styles.modalContent}>
            <Text style={[textStyles.h2, { color: colors.text, marginBottom: 16 }]}>
              {t('today.addNewStep')}
            </Text>
            <TextInput
              style={[styles.textInput, {maxHeight: 150}]}
              placeholder={t('today.enterGentleStep')}
              placeholderTextColor={colors.textSecondary}
              value={newStepText}
              onChangeText={setNewStepText}
              multiline
              autoFocus
              scrollEnabled={ true }
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, {backgroundColor: colors.primary + 50}]}
                onPress={() => {
                  setShowAddModal(false);
                  setNewStepText('');
                }}                activeOpacity={TOUCHABLE_CONFIG.activeOpacity}              >
                <Text style={[textStyles.button, { color: colors.text }]}>
                  {t('common.cancel')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.secondary }]}
                onPress={addStep}
                activeOpacity={TOUCHABLE_CONFIG.activeOpacity}
              >
                <Text style={[textStyles.button, { color: '#FFFFFF' }]}>
                  {t('common.add')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal 
      visible={showEditModal} 
      animationType="fade" 
      transparent={true} 
      statusBarTranslucent={true}
      >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView 
            behavior="padding"
            keyboardVerticalOffset={0}
            style={styles.modalOverlay}
      >
           <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => {
                editingStep && currentRoutine && deleteStep(editingStep.id, currentRoutine);
              }}
            >
              <Trash2 size={20} color="#EF4444" />
            </TouchableOpacity>
            <Text style={[textStyles.h2, { color: colors.text, marginBottom: 16 }]}>
              {t('today.editStep')}
            </Text>
            <TextInput
              style={[styles.textInput, {maxHeight: 150}]}
              placeholder={t('today.enterGentleStep')}
              placeholderTextColor={colors.textSecondary}
              value={newStepText}
              onChangeText={setNewStepText}
              multiline
              autoFocus
              scrollEnabled={ true }
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, {backgroundColor: colors.primary + 50}]}
                onPress={() => {
                  setShowEditModal(false);
                  setNewStepText('');
                  setEditingStep(null);
                }}
              >
                <Text style={[textStyles.button, { color: colors.text }]}>
                  {t('common.cancel')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.secondary }]}
                onPress={editStep}
              >
                <Text style={[textStyles.button, { color: '#FFFFFF' }]}>
                  {t('common.save')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>

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