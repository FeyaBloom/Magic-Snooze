// 🔮 TodayTabContent.tsx (очищено от хаоса)
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
import { MagicalCheckbox, TinyVictoryTracker, SurprisePrompt } from '@/components/MagicalFeatures';
import { useTheme } from '@/components/ThemeProvider';
import { createTodayStyles } from '@/styles/today';


function TodayTabContent() {
  const { colors, currentTheme, setTheme, toggleMessyMode } = useTheme();

  const styles = createTodayStyles(colors);

  const [morningRoutine, setMorningRoutine] = useState([]);
  const [eveningRoutine, setEveningRoutine] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newStepText, setNewStepText] = useState('');
  const [currentRoutine, setCurrentRoutine] = useState('');
  const [editingStep, setEditingStep] = useState(null);
  const [showTinyVictories, setShowTinyVictories] = useState(false);
  const [showSurprisePrompt, setShowSurprisePrompt] = useState(false);
  const [celebratedVictories, setCelebratedVictories] = useState([]);
  const [todayProgress, setTodayProgress] = useState(null);
  const [isSnoozed, setIsSnoozed] = useState(false);

  const snoozeToday = () => {
    setIsSnoozed(!isSnoozed);
  };

  const loadData = async () => {
    try {
      const morningData = await AsyncStorage.getItem('morningRoutine');
      const eveningData = await AsyncStorage.getItem('eveningRoutine');
      const snoozeData = await AsyncStorage.getItem('isSnoozed');
      
      if (morningData) setMorningRoutine(JSON.parse(morningData));
      if (eveningData) setEveningRoutine(JSON.parse(eveningData));
      if (snoozeData) setIsSnoozed(JSON.parse(snoozeData));
    } catch (error) {
      console.error('Error loading data:', error);
    }
    if (!morningData) {
  const defaultMorning = [
    { id: '1', text: 'Gentle stretch or movement', completed: false },
    { id: '2', text: 'Mindful breathing (2 minutes)', completed: false },
    { id: '3', text: 'Set one gentle intention for today', completed: false },
  ];
  setMorningRoutine(defaultMorning);
  await AsyncStorage.setItem('morningRoutine', JSON.stringify(defaultMorning));
}

if (!eveningData) {
  const defaultEvening = [
    { id: '1', text: 'Reflect on one positive moment', completed: false },
    { id: '2', text: 'Gentle self-care activity', completed: false },
    { id: '3', text: 'Prepare for tomorrow with kindness', completed: false },
  ];
  setEveningRoutine(defaultEvening);
  await AsyncStorage.setItem('eveningRoutine', JSON.stringify(defaultEvening));
}

  };

  const saveData = async () => {
    try {
      await AsyncStorage.setItem('morningRoutine', JSON.stringify(morningRoutine));
      await AsyncStorage.setItem('eveningRoutine', JSON.stringify(eveningRoutine));
      await AsyncStorage.setItem('isSnoozed', JSON.stringify(isSnoozed));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const loadCelebratedVictories = async () => {
    try {
      const victories = await AsyncStorage.getItem('celebratedVictories');
      if (victories) setCelebratedVictories(JSON.parse(victories));
    } catch (error) {
      console.error('Error loading victories:', error);
    }
  };

  const celebrateVictory = async (victory) => {
    const newVictories = [...celebratedVictories, victory];
    setCelebratedVictories(newVictories);
    try {
      await AsyncStorage.setItem('celebratedVictories', JSON.stringify(newVictories));
    } catch (error) {
      console.error('Error saving victory:', error);
    }
  };

  const toggleStep = (stepId, routineType) => {
    if (routineType === 'morning') {
      setMorningRoutine(prev => prev.map(step => 
        step.id === stepId ? { ...step, completed: !step.completed } : step
      ));
    } else {
      setEveningRoutine(prev => prev.map(step => 
        step.id === stepId ? { ...step, completed: !step.completed } : step
      ));
    }
  };

  const deleteStep = (stepId, routineType) => {
    if (routineType === 'morning') {
      setMorningRoutine(prev => prev.filter(step => step.id !== stepId));
    } else {
      setEveningRoutine(prev => prev.filter(step => step.id !== stepId));
    }
  };

  const resetDailyCheckboxes = () => {
    setMorningRoutine(prev => prev.map(step => ({ ...step, completed: false })));
    setEveningRoutine(prev => prev.map(step => ({ ...step, completed: false })));
  };

  useEffect(() => {
    saveData();
  }, [morningRoutine, eveningRoutine, isSnoozed]);

  useEffect(() => {
    const morningDone = morningRoutine.filter(step => step.completed).length;
    const eveningDone = eveningRoutine.filter(step => step.completed).length;
    
    setTodayProgress({
      morningDone,
      morningTotal: morningRoutine.length,
      eveningDone,
      eveningTotal: eveningRoutine.length,
    });
  }, [morningRoutine, eveningRoutine]);

  useEffect(() => {
    loadData();
    loadCelebratedVictories();

    const promptInterval = setInterval(() => {
      if (Math.random() < 0.1) setShowSurprisePrompt(true);
    }, 5 * 60 * 1000);

    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const msUntilMidnight = tomorrow.getTime() - now.getTime();
    const midnightTimer = setTimeout(() => {
      resetDailyCheckboxes();
      const dailyInterval = setInterval(resetDailyCheckboxes, 24 * 60 * 60 * 1000);
      return () => clearInterval(dailyInterval);
    }, msUntilMidnight);

    return () => {
      clearTimeout(midnightTimer);
      clearInterval(promptInterval);
    };
  }, []);

  // ... вся логика сохранения/загрузки остается ...

  const renderRoutineSection = (title, routine, routineType, icon) => (
    <View style={[styles.routineSection, { backgroundColor: colors.surface }]}>
      <View style={styles.routineHeader}>
        <View style={styles.routineTitle}>
          {icon}
          <Text style={[styles.routineTitleText, { color: colors.text }]}>
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
            { color: colors.text },
            step.completed && styles.stepTextCompleted,
            isSnoozed && styles.stepTextDisabled,
          ]}>
            {step.text}
          </Text>
          <View style={styles.stepActions}>
            <TouchableOpacity onPress={() => {
              setCurrentRoutine(routineType);
              setEditingStep(step);
              setNewStepText(step.text);
              setShowEditModal(true);
            }}>
              <Edit size={16} color={colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteStep(step.id, routineType)}>
              <Trash2 size={16} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={colors.background} style={styles.gradient}>
        <ScrollView style={styles.scrollView}>
          <View style={styles.header}>
            <Text style={styles.title}>Good day, beautiful soul 🌸</Text>
            <Text style={styles.subtitle}>
              {isSnoozed ? 'You\'re taking a gentle break today' : 'Take it one step at a time'}
            </Text>
          </View>

          {!isSnoozed && (
            <TouchableOpacity style={styles.snoozeButton} onPress={snoozeToday}>
              <Pause size={20} color="#8B5CF6" />
              <Text style={styles.snoozeText}>Snooze Today</Text>
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
                <Text style={[styles.themeButtonText, { color: '#FFFFFF' }]}>Messy Mode</Text>
              </TouchableOpacity>
            </View>
          </View>

          {isSnoozed && (
            <TouchableOpacity style={styles.resumeButton} onPress={snoozeToday}>
              <Text style={styles.resumeText}>Resume Today</Text>
            </TouchableOpacity>
          )}

          {renderRoutineSection('Morning Routine', morningRoutine, 'morning', <Coffee size={20} color="#F59E0B" />)}
          {renderRoutineSection('Evening Routine', eveningRoutine, 'evening', <Moon size={20} color="#8B5CF6" />)}

          {todayProgress && (
  <View style={[styles.progressSection, { backgroundColor: colors.surface }]}>
    <Text style={[styles.progressTitle, { color: colors.text, fontFamily: 'ComicNeue-Bold' }]}>
      Today's Progress ✨
    </Text>
    <View style={styles.progressStats}>
      <View style={styles.progressStat}>
        <Text style={[styles.progressLabel, { color: colors.textSecondary, fontFamily: 'ComicNeue-Regular' }]}>
          Morning
        </Text>
        <Text style={[styles.progressValue, { color: colors.primary, fontFamily: 'ComicNeue-Bold' }]}>
          {todayProgress.morningDone}/{todayProgress.morningTotal}
        </Text>
      </View>
      <View style={styles.progressStat}>
        <Text style={[styles.progressLabel, { color: colors.textSecondary, fontFamily: 'ComicNeue-Regular' }]}>
          Evening
        </Text>
        <Text style={[styles.progressValue, { color: colors.primary, fontFamily: 'ComicNeue-Bold' }]}>
          {todayProgress.eveningDone}/{todayProgress.eveningTotal}
        </Text>
      </View>
    </View>
  </View>
)}
        </ScrollView>

        {showTinyVictories && (
          <Modal visible animationType="slide" transparent>
            <View style={styles.modalOverlay}>
              <TinyVictoryTracker onVictoryPress={celebrateVictory} />
              <TouchableOpacity onPress={() => setShowTinyVictories(false)}>
                <Text style={styles.closeVictoriesText}>Close</Text>
              </TouchableOpacity>
            </View>
          </Modal>
        )}

        {showSurprisePrompt && <SurprisePrompt onDismiss={() => setShowSurprisePrompt(false)} />}
      </LinearGradient>
    </SafeAreaView>
  );
}

export default function TodayTab() {
  return <TodayTabContent />;
}
