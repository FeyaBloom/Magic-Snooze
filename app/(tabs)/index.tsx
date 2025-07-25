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
import { Plus, CreditCard as Edit3, Trash2, Coffee, Moon, Pause, Palette, Sparkles } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MagicalCheckbox, TinyVictoryTracker, SurprisePrompt, FloatingElement } from '@/components/MagicalFeatures';
import { ThemeProvider, useTheme } from '@/components/ThemeProvider';

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
    return `${year}-${month}-${day}`;
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
      const victories = await AsyncStorage.getItem(`victories_${getLocalDateString()}`);
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
      await AsyncStorage.setItem(`victories_${getLocalDateString()}`, JSON.stringify(newVictories));
      
      Alert.alert('🎉 Victory!', `You ${victory.toLowerCase()}! That's amazing!`, [
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
      
      await AsyncStorage.setItem(`progress_${today}`, JSON.stringify(progress));
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
    await AsyncStorage.setItem(`${routine}Routine`, JSON.stringify(updated));
    
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
    await AsyncStorage.setItem(`${currentRoutine}Routine`, JSON.stringify(updated));
    
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
            await AsyncStorage.setItem(`${routine}Routine`, JSON.stringify(updated));
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
      
      await AsyncStorage.setItem(`progress_${today}`, JSON.stringify(progress));
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
              <Edit3 size={16} color={colors.textSecondary} />
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
    gradient: {
      flex: 1,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 8,
      fontFamily: 'ComicNeue-Bold',
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      fontFamily: 'ComicNeue-Regular',
    },
    addTaskButton: {
      backgroundColor: colors.primary,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 20,
      marginBottom: 12,
    },
    addTaskText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 8,
      fontFamily: 'ComicNeue-Regular',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={colors.background}
        style={dynamicStyles.gradient}
      >
        <>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View>
          <View style={styles.header}>
            <FloatingElement duration={3000}>
              <Text style={dynamicStyles.title}>Good day, beautiful soul 🌸</Text>
            </FloatingElement>
            <FloatingElement duration={4000}>
              <Text style={dynamicStyles.subtitle}>
              {isSnoozed ? 'You\'re taking a gentle break today' : 'Take it one step at a time'}
              </Text>
            </FloatingElement>
          </View>

          {!isSnoozed && (
            <FloatingElement duration={5000}>
              <TouchableOpacity style={styles.snoozeButton} onPress={snoozeToday}>
                <Pause size={20} color="#8B5CF6" />
                <Text style={[styles.snoozeText, { fontFamily: 'ComicNeue-Regular' }]}>Snooze Today</Text>
              </TouchableOpacity>
            </FloatingElement>
          )}

          <View style={styles.magicalControls}>
            <FloatingElement duration={3500}>
              <TouchableOpacity style={dynamicStyles.addTaskButton} onPress={() => setShowTinyVictories(true)}>
                <Sparkles size={20} color="#FFFFFF" />
                <Text style={dynamicStyles.addTaskText}>Tiny Victories</Text>
              </TouchableOpacity>
            </FloatingElement>
            
            <View style={styles.themeControls}>
              <FloatingElement duration={4500}>
                <TouchableOpacity
                  style={[styles.themeButton, { backgroundColor: colors.surface }]}
                  onPress={() => setTheme(currentTheme === 'daydream' ? 'nightforest' : 'daydream')}
                >
                  <Text style={[styles.themeButtonText, { color: colors.text, fontFamily: 'ComicNeue-Regular' }]}>
                    {currentTheme === 'daydream' ? '🌙 Night Forest' : '☁️ Daydream'}
                  </Text>
                </TouchableOpacity>
              </FloatingElement>
              
              <FloatingElement duration={3800}>
                <TouchableOpacity
                  style={[styles.themeButton, { backgroundColor: colors.accent }]}
                  onPress={toggleMessyMode}
                >
                  <Palette size={16} color="#FFFFFF" />
                  <Text style={[styles.themeButtonText, { color: '#FFFFFF', marginLeft: 4, fontFamily: 'ComicNeue-Regular' }]}>
                    Messy Mode
                  </Text>
                </TouchableOpacity>
              </FloatingElement>
            </View>
          </View>

          {isSnoozed && (
            <FloatingElement duration={2500}>
              <TouchableOpacity style={styles.resumeButton} onPress={snoozeToday}>
                <Text style={[styles.resumeText, { fontFamily: 'ComicNeue-Regular' }]}>Resume Today</Text>
              </TouchableOpacity>
            </FloatingElement>
          )}

          <FloatingElement duration={6000}>
            <View style={styles.floatingDecoration}>
              <Text style={styles.floatingEmoji}>🍃</Text>
            </View>
          </FloatingElement>

          <FloatingElement duration={7000}>
            <View style={[styles.floatingDecoration, { top: 200, left: 20 }]}>
              <Text style={styles.floatingEmoji}>✨</Text>
            </View>
          </FloatingElement>

          <FloatingElement duration={5500}>
            <View style={[styles.floatingDecoration, { top: 300, right: 50 }]}>
              <Text style={styles.floatingEmoji}>🌸</Text>
            </View>
          </FloatingElement>
          <FloatingElement duration={4200}>
            {renderRoutineSection(
              'Morning Routine',
              morningRoutine,
              'morning',
              <Coffee size={20} color="#F59E0B" />
            )}
          </FloatingElement>

          <FloatingElement duration={3700}>
            {renderRoutineSection(
              'Evening Routine',
              eveningRoutine,
              'evening',
              <Moon size={20} color="#8B5CF6" />
            )}
          </FloatingElement>

          {todayProgress && (
            <FloatingElement duration={4800}>
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
            </FloatingElement>
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
    <ThemeProvider>
      <TodayTabContent />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  routineSection: {
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    padding: 20,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxCompleted: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  checkboxDisabled: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  snoozeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  magicalControls: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  themeControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  themeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  themeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  floatingDecoration: {
    position: 'absolute',
    top: 150,
    right: 40,
    zIndex: 1,
  },
  floatingEmoji: {
    fontSize: 28,
    opacity: 0.7,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 40,
    alignItems: 'center',
  },
  snoozeText: {
    fontSize: 16,
    color: '#8B5CF6',
    fontWeight: '600',
    marginLeft: 8,
  },
  resumeButton: {
    backgroundColor: '#8B5CF6',
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
  },
  resumeText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  routineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  routineTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routineTitleText: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
    fontFamily: 'ComicNeue-Bold',
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  addButton: {
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    marginLeft: 12,
  },
  stepTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  stepTextDisabled: {
    color: '#9CA3AF',
  },
  stepActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
  progressSection: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    padding: 20,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  progressStat: {
    alignItems: 'center',
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  progressLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  progressValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeVictoriesButton: {
    backgroundColor: '#EC4899',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    alignSelf: 'center',
    marginTop: 20,
  },
  closeVictoriesText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontFamily: 'ComicNeue-Regular',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
    color: '#374151',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#374151',
    marginBottom: 20,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  saveButton: {
    backgroundColor: '#8B5CF6',
    marginLeft: 8,
  },
});