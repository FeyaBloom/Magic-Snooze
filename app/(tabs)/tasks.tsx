import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Plus, Edit, Trash2, Calendar, CalendarCheck, CheckCheck, ChartNoAxesCombined  } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Components
import { ScreenLayout } from '@/components/ScreenLayout';
import { ContentContainer } from '@/components/ContentContainer';
import { MagicalCheckbox } from '@/components/MagicalCheckbox';
import { ConfirmDialog } from '@/components/modals/ConfirmDialog';
import CustomCalendar from '@/components/CustomCalendar';

// Hooks
import { useTextStyles } from '@/hooks/useTextStyles';
import { useTheme } from '@/components/ThemeProvider';
import { useTranslation } from 'react-i18next';

// Styles
import { createTasksStyles } from '@/styles/tasks';

interface Task {
  id: string;
  text: string;
  completed: boolean;
  dueDate?: string;
  createdAt: string;
  completedAt?: string;
}

export default function TasksScreen() {
  const { t, i18n } = useTranslation();
  const textStyles = useTextStyles();
  const { colors, isMessyMode } = useTheme();
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showEditCalendar, setShowEditCalendar] = useState(false);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState({
    visible: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const styles = createTasksStyles(colors);

  const toggleExpand = (taskId: string) => {
    setExpandedTaskId(prev => (prev === taskId ? null : taskId));
  };

  const loadTasks = async () => {
    try {
      const tasksData = await AsyncStorage.getItem('oneTimeTasks');
      if (tasksData) {
        setTasks(JSON.parse(tasksData));
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const saveTasks = async (updatedTasks: Task[]) => {
    try {
      await AsyncStorage.setItem('oneTimeTasks', JSON.stringify(updatedTasks));
      setTasks(updatedTasks);
    } catch (error) {
      console.error('Error saving tasks:', error);
    }
  };

  const addTask = async () => {
    if (!newTaskText.trim()) return;

    const newTask: Task = {
      id: Date.now().toString(),
      text: newTaskText.trim(),
      completed: false,
      dueDate: newTaskDueDate || undefined,
      createdAt: new Date().toISOString(),
    };

    const updatedTasks = [...tasks, newTask];
    await saveTasks(updatedTasks);

    setNewTaskText('');
    setNewTaskDueDate('');
    setShowAddModal(false);
    setShowCalendar(false);
  };

  const editTask = async () => {
    if (!editingTask || !newTaskText.trim()) return;

    const updatedTasks = tasks.map(task =>
      task.id === editingTask.id
        ? { ...task, text: newTaskText.trim(), dueDate: newTaskDueDate || undefined }
        : task
    );

    await saveTasks(updatedTasks);

    setNewTaskText('');
    setNewTaskDueDate('');
    setEditingTask(null);
    setShowEditModal(false);
    setShowEditCalendar(false);
  };

  const getLocalDateString = (date: Date = new Date()) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const toggleTask = async (taskId: string) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        const isNowCompleted = !task.completed;
        return {
          ...task,
          completed: isNowCompleted,
          completedAt: isNowCompleted ? getLocalDateString() : undefined,
        };
      }
      return task;
    });
    await saveTasks(updatedTasks);
  };

  const deleteTask = (taskId: string) => {
    setConfirmDialog({
      visible: true,
      title: t('tasks.deleteTitle'),
      message: t('tasks.deleteMessage'),
      onConfirm: async () => {
        const updatedTasks = tasks.filter(task => task.id !== taskId);
        await saveTasks(updatedTasks);
        setShowEditModal(false);
        setEditingTask(null);
        setShowEditCalendar(false);
      },
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(i18n.language, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isOverdue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    return due < today;
  };

  const isDueToday = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    return due.getTime() === today.getTime();
  };

  const completedTasks = tasks.filter(task => task.completed);
  const activeTasks = tasks.filter(task => !task.completed);

  useEffect(() => {
    loadTasks();
  }, []);

  return (
    <ScreenLayout tabName="tasks">
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
              {t('tasks.title')}
            </Text>
            <Text
              style={[textStyles.body, { color: colors.textSecondary, textAlign: 'center', opacity: 0.9 }]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.7}
            >
              {t('tasks.subtitle')}
            </Text>
          </View>

          {/* Add Task Button */}
          <TouchableOpacity
            style={[styles.addTaskButton, { backgroundColor: colors.primary }]}
            onPress={() => setShowAddModal(true)}
          >
            <Plus size={24} color="#FFFFFF" />
            <Text style={[textStyles.button, { color: '#FFFFFF' }]}>
              {t('tasks.addNew')}
            </Text>
          </TouchableOpacity>

          {/* Active Tasks */}
          {activeTasks.length > 0 && (
            <View style={styles.taskSection}>
              <Text style={[textStyles.h2, { color: colors.text, marginBottom: 16 }]}>
                {t('tasks.active')}
                <ChartNoAxesCombined size={20} color={colors.secondary} />
              </Text>
              {activeTasks.map(task => (
                <View key={task.id} style={[styles.taskContainer, { backgroundColor: colors.surface }]}>
                  <MagicalCheckbox
                    completed={task.completed}
                    onPress={() => toggleTask(task.id)}
                  />

                  <TouchableWithoutFeedback onPress={() => toggleExpand(task.id)}>
                    <View style={styles.taskContent}>
                      <Text
                        style={[
                          textStyles.body,
                          { color: colors.text },
                          task.completed && styles.taskTextCompleted
                        ]}
                        numberOfLines={expandedTaskId === task.id ? undefined : 3}
                        ellipsizeMode="tail"
                      >
                        {task.text}
                      </Text>
                      {task.dueDate && (
                        <View style={styles.dueDateContainer}>
                          <Calendar size={12} color={colors.textSecondary} />
                          <Text
                            style={[
                              textStyles.caption,
                              { color: colors.textSecondary },
                              !task.completed && isOverdue(task.dueDate) && styles.overdue,
                              !task.completed && isDueToday(task.dueDate) && styles.dueToday
                            ]}
                          >
                            {formatDate(task.dueDate)}
                          </Text>
                        </View>
                      )}
                    </View>
                  </TouchableWithoutFeedback>

                  <TouchableOpacity
                    onPress={() => {
                      setEditingTask(task);
                      setNewTaskText(task.text);
                      setNewTaskDueDate(task.dueDate || '');
                      setShowEditModal(true);
                    }}
                    style={styles.actionButton}
                  >
                    <Edit size={16} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Completed Tasks */}
          {completedTasks.length > 0 && (
            <View style={styles.taskSection}>
              <Text style={[textStyles.h2, { color: colors.text, marginBottom: 16 }]}>
                {t('tasks.completed')} 
                <CheckCheck size={20} color={colors.accent} />
              </Text>

              {completedTasks.map(task => (
                <View key={task.id} style={[styles.taskContainer, { backgroundColor: colors.surface, opacity: 0.7 }]}>
                  <MagicalCheckbox
                    completed={task.completed}
                    onPress={() => toggleTask(task.id)}
                  />

                  <TouchableWithoutFeedback onPress={() => toggleExpand(task.id)}>
                    <View style={styles.taskContent}>
                      <Text
                        style={[textStyles.body, { color: colors.text }, styles.taskTextCompleted]}
                        numberOfLines={expandedTaskId === task.id ? undefined : 3}
                        ellipsizeMode="tail"
                      >
                        {task.text}
                      </Text>
                      {task.dueDate && (
                        <View style={styles.dueDateContainer}>
                          <Calendar size={12} color={colors.textSecondary} />
                          <Text style={[textStyles.caption, { color: colors.textSecondary, opacity: 0.6 }]}>
                            {formatDate(task.dueDate)}
                          </Text>
                        </View>
                      )}
                    </View>
                  </TouchableWithoutFeedback>

                  <TouchableOpacity onPress={() => deleteTask(task.id)} style={styles.actionButton}>
                    <Trash2 size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Empty State */}
          {tasks.length === 0 && (
            <View style={styles.emptyState}>
              <CalendarCheck size={48} color={colors.textSecondary} />
              <Text style={[textStyles.h2, { color: colors.text, marginTop: 16, textAlign: 'center' }]}>
                {t('tasks.emptyTitle')}
              </Text>
              <Text style={[textStyles.body, { color: colors.textSecondary, marginTop: 8, textAlign: 'center' }]}>
                {t('tasks.emptySubtitle')}
              </Text>
            </View>
          )}
        </ContentContainer>
      </ScrollView>

      {/* Add Modal */}
      <Modal visible={showAddModal} animationType="fade" transparent={true} statusBarTranslucent={true}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <ScrollView showsVerticalScrollIndicator={false}  keyboardShouldPersistTaps="handled">
            <Text style={[textStyles.h2, { color: colors.text, marginBottom: 16 }]}>
              {t('tasks.addTitle')}
            </Text>
            <TextInput
              style={[styles.textInput, { color: colors.text, borderColor: colors.primary }]}
              placeholder={t('tasks.inputPlaceholder')}
              placeholderTextColor={colors.textSecondary}
              value={newTaskText}
              onChangeText={setNewTaskText}
              multiline
              autoFocus
            />
            <TouchableOpacity onPress={() => setShowCalendar(v => !v)}>
              <Text style={[textStyles.caption, { color: colors.secondary, marginBottom: 30 }]}>
                {newTaskDueDate ? `📅 ${formatDate(newTaskDueDate)}` : t('tasks.dueDateOptional')}
              </Text>
            </TouchableOpacity>

            {showCalendar && (
              <View style={{ marginBottom: 16 }}>
                <CustomCalendar
                  selectedDate={newTaskDueDate ? new Date(newTaskDueDate) : undefined}
                  onDateSelect={(date) => {
                    setNewTaskDueDate(date.toISOString());
                    setShowCalendar(false);
                  }}
                  containerWidth={380}
                  maxWidth={350}
                />
              </View>
            )}
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary + 50}]}
                onPress={() => {
                  setShowAddModal(false);
                  setNewTaskText('');
                  setNewTaskDueDate('');
                  setShowCalendar(false);
                }}
              >
                <Text style={[textStyles.button, { color: colors.text }]}>
                  {t('common.cancel')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.secondary }]}
                onPress={addTask}
              >
                <Text style={[textStyles.button, { color: '#FFFFFF' }]}>
                  {t('common.add')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Edit Modal */}
      <Modal visible={showEditModal} animationType="fade" transparent={true} statusBarTranslucent={true}>
        <KeyboardAvoidingView     behavior={Platform.OS === 'ios' ? 'padding' : undefined}        style={styles.modalOverlay}          >       
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <ScrollView showsVerticalScrollIndicator={false}  keyboardShouldPersistTaps="handled">
            <TouchableOpacity
              style={[styles.deleteButton, { marginBottom: 26}]}
              onPress={() => editingTask && deleteTask(editingTask.id)}
            >
              <Trash2 size={20} color="#EF4444" />
            </TouchableOpacity>

            <Text style={[textStyles.h2, { color: colors.text, marginBottom: 16 }]}>
              {t('tasks.editTitle')}
            </Text>
            <TextInput
              style={[styles.textInput, { color: colors.text, borderColor: colors.primary }]}
              placeholder={t('tasks.inputPlaceholder')}
              placeholderTextColor={colors.textSecondary}
              value={newTaskText}
              onChangeText={setNewTaskText}
              multiline
              autoFocus
            />
            <TouchableOpacity onPress={() => setShowEditCalendar(v => !v)}>
              <Text style={[textStyles.caption, { color: colors.secondary, marginBottom: 30 }]}>
                {newTaskDueDate ? `📅 ${formatDate(newTaskDueDate)}` : t('tasks.dueDateOptional')}
              </Text>
            </TouchableOpacity>

            {showEditCalendar && (
              <View style={{ marginBottom: 16 }}>
                <CustomCalendar
                  selectedDate={newTaskDueDate ? new Date(newTaskDueDate) : undefined}
                  onDateSelect={(date) => {
                    setNewTaskDueDate(date.toISOString());
                    setShowEditCalendar(false);
                  }}
                  minDate={new Date()}
                  containerWidth={380}
                  maxWidth={350}
                />
              </View>
            )}
             </ScrollView>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary + 50}]}
                onPress={() => {
                  setShowEditModal(false);
                  setNewTaskText('');
                  setNewTaskDueDate('');
                  setEditingTask(null);
                  setShowEditCalendar(false);
                }}
              >
                <Text style={[textStyles.button, { color: colors.text }]}>
                  {t('common.cancel')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.secondary }]}
                onPress={editTask}
              >
                <Text style={[textStyles.button, { color: '#FFFFFF' }]}>
                  {t('common.save')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
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