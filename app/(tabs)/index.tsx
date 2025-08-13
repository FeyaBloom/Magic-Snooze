import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import i18n from '@/i18n';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, Pencil as Edit, Trash2, Coffee, Moon, Pause, Palette, Sparkles } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MagicalCheckbox, TinyVictoryTracker, SurprisePrompt, } from '@/components/MagicalFeatures';
import { useTheme } from '@/components/ThemeProvider';
import { createTodayStyles } from '@/styles/today';
import {FloatingBackground} from "@/components/MagicalFeatures";
import { ConfirmDialog } from "@/components/confirmDialog";
import { useRouter } from 'expo-router';
import { useRoute } from '@react-navigation/native';
import { TouchableWithoutFeedback } from 'react-native';


// Импортируем хуки
import { useDailyProgress } from '@/hooks/useDailyProgress';
import { useMidnightReset } from '@/hooks/useMidnightReset';
import { useRoutinesBlock } from '@/hooks/useRoutinesBlock';
import { useSurprisePrompts } from '@/hooks/useSurprisePrompts';
import { useVictories } from '@/hooks/useVictories';

const { t } = i18n;

interface RoutineStep {
  id: string;
  text: string;
  completed: boolean;
}

function TodayTabContent() {
  const currentLanguageCode = i18n.language;
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const route = useRoute();
  const { colors, getTabGradient, currentTheme, setTheme } = useTheme();
  const gradient = getTabGradient(route.name);
  const styles = createTodayStyles(colors);

  const router = useRouter();
  const [morningRoutine, setMorningRoutine] = useState<RoutineStep[]>([]);
  const [eveningRoutine, setEveningRoutine] = useState<RoutineStep[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTinyVictories, setShowTinyVictories] = useState(false);
  const [currentRoutine, setCurrentRoutine] = useState<'morning' | 'evening'>('morning');
  const [newStepText, setNewStepText] = useState('');
  const [editingStep, setEditingStep] = useState<RoutineStep | null>(null);
  const [isSnoozed, setIsSnoozed] = useState(false);
  // Добавьте это состояние в начало компонента, рядом с другими useState
const [expandedStepId, setExpandedStepId] = useState<string | null>(null);

// Добавьте эту функцию рядом с другими функциями
const toggleStepExpand = (stepId: string) => {
  setExpandedStepId(prev => (prev === stepId ? null : stepId));
};
  const [confirmDialog, setConfirmDialog] = useState({
    visible: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Используем хуки
  const { progress: todayProgress, loadProgress, saveProgress, getLocalDateString } = useDailyProgress();
  const { celebratedVictories, celebrateVictory } = useVictories();
  const { progress: routinesProgress, snoozeDay, unsnoozeDay } = useRoutinesBlock();
  const { 
    showSurprisePrompt, 
    dismissPrompt: dismissSurprisePrompt 
  } = useSurprisePrompts({
    probability: 0.1,
    intervalMinutes: 5,
    enabled: true
  });

 const today = getLocalDateString(new Date());
 
  // Функция сброса данных в полночь
  const resetDailyData = async () => {
    try {
      // Reset morning routine checkboxes
      const resetMorning = morningRoutine.map(step => ({ ...step, completed: false }));
      setMorningRoutine(resetMorning);
      await AsyncStorage.setItem('morningRoutine', JSON.stringify(resetMorning));
      
      // Reset evening routine checkboxes
      const resetEvening = eveningRoutine.map(step => ({ ...step, completed: false }));
      setEveningRoutine(resetEvening);
      await AsyncStorage.setItem('eveningRoutine', JSON.stringify(resetEvening));
      
      // Reset snooze state
      setIsSnoozed(false);
      
      // Load fresh data for the new day
      loadData();
    } catch (error) {
      console.error('Error resetting daily data:', error);
    }
  };

  // Используем хук для сброса в полночь
  useMidnightReset(resetDailyData);

  useEffect(() => {
    loadData();
    loadProgress();
  }, []);

  const loadData = async () => {
    try {
      const currentDate = getLocalDateString();
      
      const morningData = await AsyncStorage.getItem('morningRoutine');
      const eveningData = await AsyncStorage.getItem('eveningRoutine');
      const progressData = await AsyncStorage.getItem(`progress_${currentDate}`);
      
      if (morningData) {
        const parsedMorning = JSON.parse(morningData);
        // Check if we need to reset checkboxes for a new day
        const lastProgressDate = await AsyncStorage.getItem('lastProgressDate');
        if (lastProgressDate !== currentDate) {
          // New day - reset all checkboxes
          const resetMorning = parsedMorning.map((step: any) => ({ ...step, completed: false }));
          setMorningRoutine(resetMorning);
          await AsyncStorage.setItem('morningRoutine', JSON.stringify(resetMorning));
          await AsyncStorage.setItem('lastProgressDate', currentDate);
        } else {
          setMorningRoutine(parsedMorning);
        }
      } else {
        // Default morning routine
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
        // Check if we need to reset checkboxes for a new day
        const lastProgressDate = await AsyncStorage.getItem('lastProgressDate');
        if (lastProgressDate !== currentDate) {
          // New day - reset all checkboxes
          const resetEvening = parsedEvening.map((step: any) => ({ ...step, completed: false }));
          setEveningRoutine(resetEvening);
          await AsyncStorage.setItem('eveningRoutine', JSON.stringify(resetEvening));
        } else {
          setEveningRoutine(parsedEvening);
        }
      } else {
        // Default evening routine
        const defaultEvening = [
          { id: '1', text: t('today.defaultEvening.reflect'), completed: false },
          { id: '2', text: t('today.defaultEvening.selfCare'), completed: false },
          { id: '3', text: t('today.defaultEvening.prepare'), completed: false },
        ];
        setEveningRoutine(defaultEvening);
        await AsyncStorage.setItem('eveningRoutine', JSON.stringify(defaultEvening));
      }

      if (progressData) {
        const progress = JSON.parse(progressData);
        setIsSnoozed(progress.snoozed);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const saveProgressData = async (morning: RoutineStep[], evening: RoutineStep[]) => {
    try {
      const morningDone = morning.filter(step => step.completed).length;
      const eveningDone = evening.filter(step => step.completed).length;
      
      const progressData = {
        date: today,
        morningCompleted: morningDone === morning.length,
        eveningCompleted: eveningDone === evening.length,
        morningTotal: morning.length,
        eveningTotal: evening.length,
        morningDone,
        eveningDone,
        snoozed: isSnoozed,
      };
      
      await saveProgress(progressData);
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const toggleStep = async (stepId: string, routine: 'morning' | 'evening') => {
    if (isSnoozed) return;
    
    const updateRoutine = routine === 'morning' ? morningRoutine : eveningRoutine;
    const setRoutine = routine === 'morning' ? setMorningRoutine : setEveningRoutine;
    
    const updated = updateRoutine.map(step =>
      step.id === stepId ? { ...step, completed: !step.completed } : step
    );
    
    setRoutine(updated);
    await AsyncStorage.setItem(`${routine}Routine`, JSON.stringify(updated));
    
    const otherRoutine = routine === 'morning' ? eveningRoutine : morningRoutine;
    saveProgressData(
      routine === 'morning' ? updated : otherRoutine,
      routine === 'evening' ? updated : otherRoutine
    );
  };

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

    // Пересчитываем прогресс после добавления шага
    const otherRoutine = currentRoutine === 'morning' ? eveningRoutine : morningRoutine;
    saveProgressData(
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

        // Пересчитываем прогресс после удаления шага
        const otherRoutine = routine === 'morning' ? eveningRoutine : morningRoutine;
        saveProgressData(
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
      await snoozeDay();
    } else {
      await unsnoozeDay();
    }
  };

  const renderRoutineSection = (title: string, routine: RoutineStep[], routineType: 'morning' | 'evening', icon: React.ReactNode) => (
    <View style={[styles.routineSection, { backgroundColor: colors.surface }]}>
      <View style={styles.routineHeader}>
        <View style={styles.routineTitle}>
          {icon}
          <Text style={[styles.routineTitleText, { color: colors.text }]}>{title}</Text>
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
      
      {routine.map((step) => (
        <View key={step.id} style={styles.stepContainer}>
          <MagicalCheckbox
            completed={step.completed}
            onPress={() => toggleStep(step.id, routineType)}
            disabled={isSnoozed}
          />
         <TouchableWithoutFeedback onPress={() => toggleStepExpand(step.id)}>
          <View style={styles.stepContent}>
            <Text style={[
              styles.stepText,
              { color: colors.text, fontFamily: 'ComicNeue-Regular' },
              step.completed && styles.stepTextCompleted,
              isSnoozed && styles.stepTextDisabled,
            ]}
            numberOfLines={expandedStepId === step.id ? undefined : 3}
            ellipsizeMode="tail"
            >
              {step.text}
            </Text>
          </View>
        </TouchableWithoutFeedback>
          
          <View style={styles.stepActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                setCurrentRoutine(routineType);
                setEditingStep(step);
                setNewStepText(step.text);
                setShowEditModal(true);
              }}
              disabled={isSnoozed}
            >          
              <Edit 
                size={16} 
                color={isSnoozed ? colors.textSecondary + '50' : colors.textSecondary} 
              />
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={gradient}
        style={styles.gradient}
      >
        
          <FloatingBackground />
        <>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View>
         <View style={styles.header}>
              <Text style={styles.title}>{t('today.title')}</Text>
              <Text style={styles.subtitle}>
                {isSnoozed ? t('today.subtitleSnoozed') : t('today.subtitle')}
              </Text>
            </View>

          {!isSnoozed && (
           
              <TouchableOpacity style={styles.snoozeButton} onPress={snoozeToday}>
                <Pause size={20} color="#8B5CF6" />
                <Text style={[styles.snoozeText, { fontFamily: 'ComicNeue-Regular' }]}>{t('today.snoozeToday')}</Text>
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
                          
              <TouchableOpacity  style={styles.themeButton}       
                onPress={() => router.push('/settings')}
              >
                  <Text style={styles.themeButtonText}>
                    { t('navigation.settings')}
                  </Text>
                </TouchableOpacity>
               
             
            </View>
          </View>

          {isSnoozed && (
           
              <TouchableOpacity style={styles.resumeButton} onPress={snoozeToday}>
                <Text style={[styles.resumeText, { fontFamily: 'ComicNeue-Regular' }]}>{t('today.resumeToday')}</Text>
              </TouchableOpacity>
           
          )}

           
         
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
          

          {todayProgress && (
           
              <View style={[styles.progressSection, { backgroundColor: colors.surface }]}>
                <Text style={[styles.progressTitle, { color: colors.text }]}>
                  {t('today.todaysProgress')} <Sparkles size={20} color={colors.text} />
                </Text>
                <View style={styles.progressStats}>
                  <View style={styles.progressStat}>
                    <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
                      {t('today.morning')}
                    </Text>
                    <Text style={[styles.progressValue, { color: colors.primary }]}>
                      {todayProgress.morningDone}/{todayProgress.morningTotal}
                    </Text>
                  </View>
                  <View style={styles.progressStat}>
                    <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
                      {t('today.evening')}
                    </Text>
                    <Text style={[styles.progressValue, { color: colors.primary }]}>
                      {todayProgress.eveningDone}/{todayProgress.eveningTotal}
                    </Text>
                  </View>
                </View>
              </View>
          
          )}
          </View>
        </ScrollView>
        
        {showSurprisePrompt && <SurprisePrompt onDismiss={dismissSurprisePrompt} />}
        </>
      </LinearGradient>

      {/* Все модалки вынесены сюда, за пределы LinearGradient */}
      <Modal 
        visible={showTinyVictories} 
        animationType="slide" 
        transparent={true}
        statusBarTranslucent={true}
      >
        <View style={styles.modalOverlay}>
          <TinyVictoryTracker onVictoryPress={celebrateVictory} />
          <TouchableOpacity style={styles.closeVictoriesButton} onPress={() => setShowTinyVictories(false)}>
            <Text style={styles.closeVictoriesText}>{t('common.close')}</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <Modal 
        visible={showAddModal} 
        animationType="slide" 
        transparent={true}
        statusBarTranslucent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}> {t('today.addNewStep')}</Text>
            <TextInput
              style={[styles.textInput, { fontFamily: 'ComicNeue-Regular' }]}
              placeholder={t('today.enterGentleStep')}
              placeholderTextColor={colors.textSecondary}
              value={newStepText}
              onChangeText={setNewStepText}
              multiline
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowAddModal(false);
                  setNewStepText('');
                }}
              >
                <Text style={[styles.cancelButtonText, { fontFamily: 'ComicNeue-Regular' }]}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={addStep}
              >
                <Text style={[styles.saveButtonText, { fontFamily: 'ComicNeue-Regular' }]}>{t('common.add')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal 
        visible={showEditModal} 
        animationType="slide" 
        transparent={true}
        statusBarTranslucent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={() => {
                editingStep && currentRoutine && deleteStep(editingStep.id, currentRoutine);
              }}
            >
              <Trash2 size={20} color="#EF4444" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}> {t('today.editStep')}</Text>
            <TextInput
              style={[styles.textInput, { fontFamily: 'ComicNeue-Regular' }]}
              placeholder={t('today.enterGentleStep')}
              placeholderTextColor={colors.textSecondary}
              value={newStepText}
              onChangeText={setNewStepText}
              multiline
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowEditModal(false);
                  setNewStepText('');
                  setEditingStep(null);
                }}
              >
                <Text style={[styles.cancelButtonText, { fontFamily: 'ComicNeue-Regular' }]}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={editStep}
              >
                <Text style={[styles.saveButtonText, { fontFamily: 'ComicNeue-Regular' }]}>{t('common.save')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
    </SafeAreaView>
  );
}

export default function TodayTab() {
  return (
    <TodayTabContent />
  );
}