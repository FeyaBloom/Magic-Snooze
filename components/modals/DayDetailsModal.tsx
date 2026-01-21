import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { X, Coffee, Moon, CheckCircle, Circle, Calendar as CalendarIcon } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@/components/ThemeProvider';
import { useTranslation } from 'react-i18next';

interface Task {
  id: string;
  text: string;
  completed: boolean;
  dueDate?: string;
  createdAt: string;
  completedAt?: string;
}

interface DayDetailsModalProps {
  visible: boolean;
  date: Date | null;
  onClose: () => void;
}

const getLocalDateString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export function DayDetailsModal({ visible, date, onClose }: DayDetailsModalProps) {
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();

  const [progress, setProgress] = useState<any>(null);
  const [victories, setVictories] = useState<string[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (visible && date) {
      loadDayData();
    }
  }, [visible, date]);

  const loadDayData = async () => {
    if (!date) return;

    const dateString = getLocalDateString(date);

    try {
      // Load progress
      const progressData = await AsyncStorage.getItem(`progress_${dateString}`);
      if (progressData) {
        setProgress(JSON.parse(progressData));
      } else {
        setProgress(null);
      }

      // Load victories
      const victoriesData = await AsyncStorage.getItem(`victories_${dateString}`);
      if (victoriesData) {
        setVictories(JSON.parse(victoriesData));
      } else {
        setVictories([]);
      }

      // Load tasks for this day
      const tasksData = await AsyncStorage.getItem('oneTimeTasks');
      if (tasksData) {
        const allTasks: Task[] = JSON.parse(tasksData);
        const dayTasks = allTasks.filter(task => {
          // Include tasks with matching dueDate
          if (task.dueDate) {
            const taskDate = new Date(task.dueDate);
            if (getLocalDateString(taskDate) === dateString) return true;
          }
          // Include tasks completed on this day
          if (task.completed && task.completedAt === dateString) return true;
          return false;
        });
        setTasks(dayTasks);
      } else {
        setTasks([]);
      }
    } catch (error) {
      console.error('Error loading day data:', error);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(i18n.language, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (!date) return null;

  const hasData = progress || victories.length > 0 || tasks.length > 0;

  return (
    <Modal visible={visible} animationType="fade" transparent={true} statusBarTranslucent={true}>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.surface }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
              {formatDate(date)}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {!hasData && (
              <View style={styles.emptyState}>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  {t('calendar.legend.none')}
                </Text>
              </View>
            )}

            {/* Status Badge */}
            {progress && (
              <View style={[styles.statusBadge, { backgroundColor: colors.background[0] }]}>
                <Text style={[styles.statusText, { color: colors.text }]}>
                  {progress.snoozed
                    ? '💤 ' + t('calendar.legend.snoozed')
                    : progress.morningCompleted && progress.eveningCompleted
                    ? '🏆 ' + t('calendar.legend.complete')
                    : '🌟 ' + t('calendar.legend.partial')}
                </Text>
              </View>
            )}

            {/* Morning Routines */}
            {progress && progress.morningRoutines && progress.morningRoutines.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Coffee size={20} color="#F59E0B" />
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    {t('today.morningRoutine')} ({progress.morningDone}/{progress.morningTotal})
                  </Text>
                </View>
                {progress.morningRoutines.map((routine: any, index: number) => (
                  <View key={index} style={styles.listItem}>
                    {routine.completed ? (
                      <CheckCircle size={16} color={colors.primary} />
                    ) : (
                      <Circle size={16} color={colors.textSecondary} />
                    )}
                    <Text
                      style={[
                        styles.listItemText,
                        { color: colors.text },
                        routine.completed && styles.completedText,
                      ]}
                    >
                      {routine.text}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Evening Routines */}
            {progress && progress.eveningRoutines && progress.eveningRoutines.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Moon size={20} color="#8B5CF6" />
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    {t('today.eveningRoutine')} ({progress.eveningDone}/{progress.eveningTotal})
                  </Text>
                </View>
                {progress.eveningRoutines.map((routine: any, index: number) => (
                  <View key={index} style={styles.listItem}>
                    {routine.completed ? (
                      <CheckCircle size={16} color={colors.primary} />
                    ) : (
                      <Circle size={16} color={colors.textSecondary} />
                    )}
                    <Text
                      style={[
                        styles.listItemText,
                        { color: colors.text },
                        routine.completed && styles.completedText,
                      ]}
                    >
                      {routine.text}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Old format fallback (only numbers) */}
            {progress && !progress.morningRoutines && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  ☕ {t('today.morningRoutine')}: {progress.morningDone}/{progress.morningTotal}
                </Text>
                <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 8 }]}>
                  🌙 {t('today.eveningRoutine')}: {progress.eveningDone}/{progress.eveningTotal}
                </Text>
              </View>
            )}

            {/* Tasks */}
            {tasks.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <CalendarIcon size={20} color={colors.primary} />
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    {t('tasks.title')}
                  </Text>
                </View>
                {tasks.map((task) => (
                  <View key={task.id} style={styles.listItem}>
                    {task.completed ? (
                      <CheckCircle size={16} color={colors.primary} />
                    ) : (
                      <Circle size={16} color={colors.textSecondary} />
                    )}
                    <Text
                      style={[
                        styles.listItemText,
                        { color: colors.text },
                        task.completed && styles.completedText,
                      ]}
                    >
                      {task.text}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Victories */}
            {victories.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.victoryEmoji}>✨</Text>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    {t('today.tinyVictories')}
                  </Text>
                </View>
                {victories.map((victory, index) => (
                  <View key={index} style={styles.listItem}>
                    <Text style={styles.victoryBullet}>•</Text>
                    <Text style={[styles.listItemText, { color: colors.text }]}>
                      {victory}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 0,
  },
  container: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
    borderRadius: 24,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    paddingRight: 16,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 10,
    paddingLeft: 8,
  },
  listItemText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  victoryEmoji: {
    fontSize: 20,
  },
  victoryBullet: {
    fontSize: 20,
    lineHeight: 20,
    marginTop: -2,
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});