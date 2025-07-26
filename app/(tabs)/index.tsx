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
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, Pencil as Edit, Trash2, Coffee, Moon, Pause, Palette, Sparkles } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MagicalCheckbox, TinyVictoryTracker, SurprisePrompt, } from '@/components/MagicalFeatures';
import { useTheme } from '@/components/ThemeProvider';
import { createTodayStyles } from '@/styles/today';

interface RoutineStep {
  id: string;
  text: string;
  completed: boolean;
}

interface DailyProgress {
  date: string;
  morningCompleted: boolean;
  eveningCompleted: boolean;
  morningTotal: number;
  eveningTotal: number;
  morningDone: number;
  eveningDone: number;
  snoozed: boolean;
}

function TodayTabContent() {
  const { colors, currentTheme, setTheme, toggleMessyMode } = useTheme();
  const styles = createTodayStyles(colors);
  const [morningRoutine, setMorningRoutine] = useState<RoutineStep[]>([]);
  const [eveningRoutine, setEveningRoutine] = useState<RoutineStep[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTinyVictories, setShowTinyVictories] = useState(false);
  const [showSurprisePrompt, setShowSurprisePrompt] = useState(false);
  const [currentRoutine, setCurrentRoutine] = useState<'morning' | 'evening'>('morning');
  const [newStepText, setNewStepText] = useState('');
  const [editingStep, setEditingStep] = useState<RoutineStep | null>(null);
  const [todayProgress, setTodayProgress] = useState<DailyProgress | null>(null);
  const [isSnoozed, setIsSnoozed] = useState(false);
  const [celebratedVictories, setCelebratedVictories] = useState<string[]>([]);

  const getLocalDateString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return ${year}-${month}-${day};
  };

  const today = getLocalDateString();

  useEffect(() => {
    loadData();
    loadCelebratedVictories();
    
    // Random surprise prompts (10% chance every 5 minutes)
    const promptInterval = setInterval(() => {
      if (Math.random() < 0.1) {
        setShowSurprisePrompt(true);
      }
    }, 5 * 60 * 1000);
    
    // Set up midnight reset timer
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const msUntilMidnight = tomorrow.getTime() - now.getTime();
    
    const midnightTimer = setTimeout(() => {
      // Reset all checkboxes at midnight
      resetDailyCheckboxes();
      
      // Set up recurring daily reset
      const dailyInterval = setInterval(() => {
        resetDailyCheckboxes();
      }, 24 * 60 * 60 * 1000); // 24 hours
      
      return () => clearInterval(dailyInterval);
    }, msUntilMidnight);
    
    return () => {
      clearTimeout(midnightTimer);
      clearInterval(promptInterval);
    };
  }, []);

  const loadCelebratedVictories = async () => {
    try {
      const victories = await AsyncStorage.getItem(victories_${getLocalDateString()});
      if (victories) {
        setCelebratedVictories(JSON.parse(victories));
      }
    } catch (error) {
      console.error('Error loading victories:', error);
    }
  };

  const celebrateVictory = async (victory: string) => {
    try {
      const newVictories = [...celebratedVictories, victory];
      setCelebratedVictories(newVictories);
      await AsyncStorage.setItem(victories_${getLocalDateString()}, JSON.stringify(newVictories));
      
      Alert.alert('🎉 Victory!', You ${victory.toLowerCase()}! That's amazing!, [
        { text: 'Yay!', style: 'default' }
      ]);
    } catch (error) {
      console.error('Error saving victory:', error);
    }
  };
  const resetDailyCheckboxes = async () => {
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
      
      // Reset celebrated victories
      setCelebratedVictories([]);
      
      // Load fresh data for the new day
      loadData();
    } catch (error) {
      console.error('Error resetting daily checkboxes:', error);
    }
  };

  const loadData = async () => {
    try {
      const currentDate = getLocalDateString();
      
      const morningData = await AsyncStorage.getItem('morningRoutine');
      const eveningData = await AsyncStorage.getItem('eveningRoutine');
      const progressData = await AsyncStorage.getItem(progress_${currentDate});
      
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
          { id: '1', text: 'Gentle stretch or movement', completed: false },
          { id: '2', text: 'Mindful breathing (2 minutes)', completed: false },
          { id: '3', text: 'Set one gentle intention for today', completed: false },
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
          { id: '1', text: 'Reflect on one positive moment', completed: false },
          { id: '2', text: 'Gentle self-care activity', completed: false },
          { id: '3', text: 'Prepare for tomorrow with kindness', completed: false },
        ];
        setEveningRoutine(defaultEvening);
        await AsyncStorage.setItem('eveningRoutine', JSON.stringify(defaultEvening));
      }

      if (progressData) {
        const progress = JSON.parse(progressData);
        setTodayProgress(progress);
        setIsSnoozed(progress.snoozed);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const saveProgress = async (morning: RoutineStep[], evening: RoutineStep[]) => {
    try {
      const morningDone = morning.filter(step => step.completed).length;
      const eveningDone = evening.filter(step => step.completed).length;
      
      const progress: DailyProgress = {
        date: today,
        morningCompleted: morningDone === morning.length,
        eveningCompleted: eveningDone === evening.length,
        morningTotal: morning.length,
        eveningTotal: evening.length,
        morningDone,
        eveningDone,
        snoozed: isSnoozed,
      };
      
      await AsyncStorage.setItem(progress_${today}, JSON.stringify(progress));
      setTodayProgress(progress);
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
    await AsyncStorage.setItem(${routine}Routine, JSON.stringify(updated));
    
    const otherRoutine = routine === 'morning' ? eveningRoutine : morningRoutine;
    saveProgress(
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
    await AsyncStorage.setItem(${currentRoutine}Routine, JSON.stringify(updated));
    
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
    await AsyncStorage.setItem(${currentRoutine}Routine, JSON.stringify(updated));
    
    setNewStepText('');
    setEditingStep(null);
    setShowEditModal(false);
  };

  const deleteStep = async (stepId: string, routine: 'morning' | 'evening') => {
    Alert.alert(
      'Delete Step',
      'Are you sure you want to delete this step?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updateRoutine = routine === 'morning' ? morningRoutine : eveningRoutine;
            const setRoutine = routine === 'morning' ? setMorningRoutine : setEveningRoutine;
            
            const updated = updateRoutine.filter(step => step.id !== stepId);
            setRoutine(updated);
            await AsyncStorage.setItem(${routine}Routine, JSON.stringify(updated));
          },
        },
      ]
    );
  };

  const snoozeToday = async () => {
    const newSnoozed = !isSnoozed;
    setIsSnoozed(newSnoozed);
    
    try {
      const progress: DailyProgress = {
        date: today,
        morningCompleted: false,
        eveningCompleted: false,
        morningTotal: morningRoutine.length,
        eveningTotal: eveningRoutine.length,
        morningDone: 0,
        eveningDone: 0,
        snoozed: newSnoozed,
      };
      
      await AsyncStorage.setItem(progress_${today}, JSON.stringify(progress));
      setTodayProgress(progress);
    } catch (error) {
      console.error('Error snoozing day:', error);
    }
  };

  const renderRoutineSection = (title: string, routine: RoutineStep[], routineType: 'morning' | 'evening', icon: React.ReactNode) => (
    <View style={[styles.routineSection, { backgroundColor: colors.surface }]}>
      <View style={styles.routineHeader}>
        <View style={styles.routineTitle}>
          {icon}
          <Text style={[styles.routineTitleText, { color: colors.text, fontFamily: 'ComicNeue-Bold' }]}>{title}</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            setCurrentRoutine(routineType);
            setShowAddModal(true);
          }}
        >
          <Plus size={20} color="#8B5CF6" />
        </TouchableOpacity>
      </View>
      
      {routine.map((step) => (
        <View key={step.id} style={styles.stepContainer}>
          <MagicalCheckbox
            completed={step.completed}
            onPress={() => toggleStep(step.id, routineType)}
            disabled={isSnoozed}
          />
          <Text style={[
            styles.stepText,
            { color: colors.text, fontFamily: 'ComicNeue-Regular' },
            step.completed && styles.stepTextCompleted,
            isSnoozed && styles.stepTextDisabled,
          ]}>
            {step.text}
          </Text>
          <View style={styles.stepActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                setCurrentRoutine(routineType);
                setEditingStep(step);
                setNewStepText(step.text);
                setShowEditModal(true);
              }}
            >
             
              <Edit size={16} color={colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => deleteStep(step.id, routineType)}
            >
              <Trash2 size={16} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );

  const dynamicStyles = StyleSheet.create({
    // Removed - now using styles from createTodayStyles
  });

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={colors.background}
        style={dynamicStyles.gradient}
        style={styles.gradient}
      >
        <>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View>
          <View style={styles.header}>       
              <Text style={styles.title}>Good day, beautiful soul 🌸</Text>          
              <Text style={styles.subtitle}>
              {isSnoozed ? 'You\'re taking a gentle break today' : 'Take it one step at a time'}
              </Text>
          </View>

          {!isSnoozed && (
           
              <TouchableOpacity style={styles.snoozeButton} onPress={snoozeToday}>
                <Pause size={20} color="#8B5CF6" />
                <Text style={[styles.snoozeText, { fontFamily: 'ComicNeue-Regular' }]}>Snooze Today</Text>
              </TouchableOpacity>
           
          )}

          <View style={styles.magicalControls}>
           
              <TouchableOpacity style={styles.addTaskButton} onPress={() => setShowTinyVictories(true)}>
                <Sparkles size={20} color="#FFFFFF" />
                <Text style={styles.addTaskText}>Tiny Victories</Text>
              </TouchableOpacity>
           
            
            <View style={styles.themeControls}>
             
                <TouchableOpacity
                  style={styles.themeButton}
                  onPress={() => setTheme(currentTheme === 'daydream' ? 'nightforest' : 'daydream')}
                >
                  <Text style={styles.themeButtonText}>
                    {currentTheme === 'daydream' ? '🌙 Night Forest' : '☁️ Daydream'}
                  </Text>
                </TouchableOpacity>
                          
             
                <TouchableOpacity
                  style={[styles.themeButton, { backgroundColor: colors.accent }]}
                  onPress={toggleMessyMode}
                >
                  <Palette size={16} color="#FFFFFF" />
                  <Text style={[styles.themeButtonText, { color: '#FFFFFF', marginLeft: 4 }]}>
                    Messy Mode
                  </Text>
                </TouchableOpacity>
             
            </View>
          </View>

          {isSnoozed && (
           
              <TouchableOpacity style={styles.resumeButton} onPress={snoozeToday}>
                <Text style={[styles.resumeText, { fontFamily: 'ComicNeue-Regular' }]}>Resume Today</Text>
              </TouchableOpacity>
           
          )}

           
         
            {renderRoutineSection(
              'Morning Routine',
              morningRoutine,
              'morning',
              <Coffee size={20} color="#F59E0B" />
            )}
         
            {renderRoutineSection(
              'Evening Routine',
              eveningRoutine,
              'evening',
              <Moon size={20} color="#8B5CF6" />
            )}
          

          {todayProgress && (
           
              <View style={[styles.progressSection, { backgroundColor: colors.surface }]}>
                <Text style={[styles.progressTitle, { color: colors.text, fontFamily: 'ComicNeue-Bold' }]}>Today's Progress ✨</Text>
                <View style={styles.progressStats}>
                  <View style={styles.progressStat}>
                    <Text style={[styles.progressLabel, { color: colors.textSecondary, fontFamily: 'ComicNeue-Regular' }]}>Morning</Text>
                    <Text style={[styles.progressValue, { color: colors.primary, fontFamily: 'ComicNeue-Bold' }]}>
                      {todayProgress.morningDone}/{todayProgress.morningTotal}
                    </Text>
                  </View>
                  <View style={styles.progressStat}>
                    <Text style={[styles.progressLabel, { color: colors.textSecondary, fontFamily: 'ComicNeue-Regular' }]}>Evening</Text>
                    <Text style={[styles.progressValue, { color: colors.primary, fontFamily: 'ComicNeue-Bold' }]}>
                      {todayProgress.eveningDone}/{todayProgress.eveningTotal}
                    </Text>
                  </View>
                </View>
              </View>
          
          )}
          </View>
        </ScrollView>
        
        {showTinyVictories && (
          <Modal visible={showTinyVictories} animationType="slide" transparent>
            <View style={styles.modalOverlay}>
              <TinyVictoryTracker onVictoryPress={celebrateVictory} />
              <TouchableOpacity style={styles.closeVictoriesButton} onPress={() => setShowTinyVictories(false)}>
                <Text style={styles.closeVictoriesText}>Close</Text>
              </TouchableOpacity>
            </View>
          </Modal>
        )}
        
        {showSurprisePrompt && <SurprisePrompt onDismiss={() => setShowSurprisePrompt(false)} />}

        <Modal visible={showAddModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={[styles.modalTitle, { fontFamily: 'ComicNeue-Bold' }]}>Add New Step</Text>
              <TextInput
                style={[styles.textInput, { fontFamily: 'ComicNeue-Regular' }]}
                placeholder="Enter a gentle step..."
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
                  <Text style={[styles.cancelButtonText, { fontFamily: 'ComicNeue-Regular' }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={addStep}
                >
                  <Text style={[styles.saveButtonText, { fontFamily: 'ComicNeue-Regular' }]}>Add Step</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <Modal visible={showEditModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={[styles.modalTitle, { fontFamily: 'ComicNeue-Bold' }]}>Edit Step</Text>
              <TextInput
                style={[styles.textInput, { fontFamily: 'ComicNeue-Regular' }]}
                placeholder="Enter a gentle step..."
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
                  <Text style={[styles.cancelButtonText, { fontFamily: 'ComicNeue-Regular' }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={editStep}
                >
                  <Text style={[styles.saveButtonText, { fontFamily: 'ComicNeue-Regular' }]}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
        </>
      </LinearGradient>
    </SafeAreaView>
  );
}

export default function TodayTab() {
  return (
    <TodayTabContent />
  );
}