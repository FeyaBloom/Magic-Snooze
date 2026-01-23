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
import { getLocalDateString, formatDate } from '@/utils/dateUtils';

// Маппинг старых переведенных текстов на ID для обратной совместимости
const LEGACY_VICTORY_MAPPING: Record<string, string> = {
  // Русский (старые)
  'Встал с кровати': 'bed',
  'Пил воду': 'water',
  'Упражнение на дыхание': 'breath',
  'Был терпелив': 'patient',
  'Погладил животное': 'pet',
  'Смотрел на небо': 'sky',
  'Улыбнулся': 'smile',
  'Поел здоровое': 'food',
  // Русский (новые)
  'Выспался': 'bed',
  'Выпил воды': 'water',
  'Подышал глубоко': 'breath',
  'Поел вовремя': 'patient',
  'Вышел на улицу': 'pet',
  'Пообщался': 'sky',
  'Порадовал себя': 'smile',
  'Сделал перерыв': 'food',
  // English (старые)
  'Got out of bed': 'bed',
  'Drank water': 'water',
  'Took a deep breath': 'breath',
  'Was patient': 'patient',
  'Pet an animal': 'pet',
  'Looked at the sky': 'sky',
  'Smiled at something': 'smile',
  'Ate something': 'food',
  // English (новые)
  'Slept well': 'bed',
  'Breathed deeply': 'breath',
  'Ate on time': 'patient',
  'Went outside': 'pet',
  'Had a talk': 'sky',
  'Treated myself': 'smile',
  'Took a break': 'food',
  // Español
  'Me levanté de la cama': 'bed',
  'Bebí agua': 'water',
  'Respiré profundamente': 'breath',
  'Fui paciente': 'patient',
  'Acaricié un animal': 'pet',
  'Miré el cielo': 'sky',
  'Sonreí por algo': 'smile',
  'Comí algo': 'food',
  'Dormí bien': 'bed',
  'Respiré hondo': 'breath',
  'Comí a tiempo': 'patient',
  'Salí afuera': 'pet',
  'Charlé': 'sky',
  'Me mimé': 'smile',
  'Tomé un descanso': 'food',
  // Català
  'He sortit del llit': 'bed',
  'He begut aigua': 'water',
  'He respirat profundament': 'breath',
  'He tingut paciència': 'patient',
  'He acariciat un animal': 'pet',
  'He mirat el cel': 'sky',
  'He somrigut per alguna cosa': 'smile',
  'He menjat alguna cosa': 'food',
  'Vaig dormir bé': 'bed',
  'Vaig beure aigua': 'water',
  'Vaig respirar profund': 'breath',
  'Vaig menjar a temps': 'patient',
  'Vaig sortir a fora': 'pet',
  'Vaig xarrar': 'sky',
  'Em vaig mimar': 'smile',
  'Vaig fer una pausa': 'food',
};

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
        const rawVictories: string[] = JSON.parse(victoriesData);
        // Преобразовать старые тексты в ID
        const victoryIds = rawVictories.map(v => LEGACY_VICTORY_MAPPING[v] || v);
        setVictories(victoryIds);
      } else {
        setVictories([]);
      }

      // Load tasks for this day
      const tasksData = await AsyncStorage.getItem('oneTimeTasks');
      if (tasksData) {
        const allTasks: Task[] = JSON.parse(tasksData);
        const dayTasks = allTasks.filter(task => {
          // Show tasks with matching dueDate (regardless of completion)
          if (task.dueDate && getLocalDateString(new Date(task.dueDate)) === dateString) return true;
          // Or tasks completed on this day (if no dueDate or not matching)
          if (!task.dueDate && task.completed && task.completedAt === dateString) return true;
          // Also show if completed on this day but has different dueDate
          if (task.completed && task.completedAt === dateString && task.dueDate && getLocalDateString(new Date(task.dueDate)) !== dateString) return true;
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
            {progress && progress.morningRoutines && progress.morningRoutines.filter((r: any) => r.completed).length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Coffee size={20} color="#F59E0B" />
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    {t('today.morningRoutine')}
                  </Text>
                </View>
                {progress.morningRoutines.filter((r: any) => r.completed).map((routine: any, index: number) => (
                  <View key={index} style={styles.listItem}>
                    <CheckCircle size={16} color={colors.primary} />
                    <Text style={[styles.listItemText, { color: colors.text }]}>
                      {routine.text}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Evening Routines */}
            {progress && progress.eveningRoutines && progress.eveningRoutines.filter((r: any) => r.completed).length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Moon size={20} color="#8B5CF6" />
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    {t('today.eveningRoutine')}
                  </Text>
                </View>
                {progress.eveningRoutines.filter((r: any) => r.completed).map((routine: any, index: number) => (
                  <View key={index} style={styles.listItem}>
                    <CheckCircle size={16} color={colors.primary} />
                    <Text style={[styles.listItemText, { color: colors.text }]}>
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
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {task.completed ? (
                          <CheckCircle size={16} color={colors.primary} />
                        ) : (
                          <Circle size={16} color={colors.textSecondary} />
                        )}
                        <Text
                          style={[
                            styles.listItemText,
                            { color: colors.text, marginLeft: 8 },
                            task.completed && styles.completedText,
                          ]}
                        >
                          {task.text}
                        </Text>
                      </View>
                      {/* Show dates info if available */}
                      {task.dueDate && (
                        <View style={{ marginTop: 4, marginLeft: 24 }}>
                          {task.completedAt && task.dueDate !== task.completedAt && (
                            <Text style={[styles.taskDateInfo, { color: colors.secondary }]}>
                              {t('tasks.planned')}: {new Date(task.dueDate).toLocaleDateString()} | {t('tasks.completed')}: {new Date(task.completedAt).toLocaleDateString()}
                            </Text>
                          )}
                          {(!task.completedAt || task.dueDate === task.completedAt) && (
                            <Text style={[styles.taskDateInfo, { color: colors.secondary }]}>
                              {task.completed ? t('tasks.completed') : t('tasks.planned')}: {new Date(task.dueDate).toLocaleDateString()}
                            </Text>
                          )}
                        </View>
                      )}
                    </View>
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
                {victories.map((victoryId, index) => (
                  <View key={index} style={styles.listItem}>
                    <Text style={styles.victoryBullet}>•</Text>
                    <Text style={[styles.listItemText, { color: colors.text }]}>
                      {t(`today.${victoryId}`)}
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
  taskDateInfo: {
    fontSize: 12,
    fontStyle: 'italic',
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