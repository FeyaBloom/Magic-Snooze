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
import { theme } from "@/components/ThemeProvider";
import { MagicalCheckbox, FloatingBackground } from "@/components/MagicalFeatures";
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, Pencil as Edit, Trash2, Calendar, CircleCheck as CheckCircle2, Sparkles } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@/components/ThemeProvider';
import { createTasksStyles } from '@/styles/tasks';
import CustomCalendar from '@/components/customCalendar';

interface Task {
  id: string;
  text: string;
  completed: boolean;
  dueDate?: string;
  createdAt: string;
}

export default function TasksTab() {
  const { colors } = useTheme();
  const styles = createTasksStyles(colors);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [showCalendar, setShowCalendar] = useState(false);
  const [showEditCalendar, setShowEditCalendar] = useState(false);

  useEffect(() => {
    loadTasks();
  }, []);

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

  const toggleTask = async (taskId: string) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    await saveTasks(updatedTasks);
  };

  const deleteTask = async (taskId: string) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updatedTasks = tasks.filter(task => task.id !== taskId);
            await saveTasks(updatedTasks);
            setShowEditModal(false);
            setEditingTask(null);
            setShowEditCalendar(false);
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
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

  return (
    <SafeAreaView style={[styles.container, {position: 'relative'}]}>
      <LinearGradient colors={colors.background}  
        style={styles.gradient}      
      >
        <FloatingBackground />
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Your Tasks 🎯</Text>
            <Text style={styles.subtitle}>One step at a time, you've got this!</Text>
          </View>

          <TouchableOpacity style={styles.addTaskButton} onPress={() => setShowAddModal(true)}>
            <Plus size={24} color="#FFFFFF" />
            <Text style={styles.addTaskText}>Add New Task</Text>
          </TouchableOpacity>

          {activeTasks.length > 0 && (
            <View style={styles.taskSection}>
              <Text style={styles.sectionTitle}>Active Tasks</Text>
              {activeTasks.map(task => (
                <View key={task.id} style={styles.taskContainer}>
                  <MagicalCheckbox
                    completed={task.completed}
                    onPress={() => toggleTask(task.id)}
                  />
                  <View style={styles.taskContent}>
                    <Text style={[styles.taskText, task.completed && styles.taskTextCompleted]}>
                      {task.text}
                    </Text>
                    {task.dueDate && (
                      <View style={styles.dueDateContainer}>
                        <Calendar size={12} color="#6B7280" />
                        <Text style={[
                          styles.listDateText,
                          task.dueDate && !task.completed && isOverdue(task.dueDate) && styles.overdue,
                          task.dueDate && !task.completed && isDueToday(task.dueDate) && styles.dueToday,
                        ]}>
                          {formatDate(task.dueDate)}
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.taskActions}>
                    <TouchableOpacity
                      style={styles.deleteButtonInline}
                      onPress={() => {
                        setEditingTask(task);
                        setNewTaskText(task.text);
                        setNewTaskDueDate(task.dueDate || '');
                        setShowEditModal(true);
                      }}
                    >
                      <Edit size={16} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          {completedTasks.length > 0 && (
            <View style={styles.taskSection}>
              <Text style={styles.sectionTitle}>Completed Tasks <Sparkles size={20} color={colors.text} /></Text>
              {completedTasks.map(task => (
                <View key={task.id} style={[styles.taskContainer, styles.completedTaskContainer]}>
                  <MagicalCheckbox
                    completed={task.completed}
                    onPress={() => toggleTask(task.id)}
                  />
                  <View style={styles.taskContent}>
                    <Text style={[styles.taskText, styles.taskTextCompleted]}>
                      {task.text}
                    </Text>
                    {task.dueDate && (
                      <View style={styles.dueDateContainer}>
                        <Calendar size={12} color="#9CA3AF" />
                        <Text style={[styles.listDateText, styles.completedDueDate]}>
                          {formatDate(task.dueDate)}
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.taskActions}>
                    <TouchableOpacity
                      style={styles.deleteButtonInline}
                      onPress={() => deleteTask(task.id)}
                    >
                      <Trash2 size={16} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          {tasks.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No tasks yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Add your first task to get started on your journey
              </Text>
            </View>
          )}
        </ScrollView>
      </LinearGradient>

      {/* Все модалки вынесены сюда, за пределы LinearGradient */}
      <Modal 
        visible={showAddModal} 
        animationType="slide" 
        transparent={true}
        statusBarTranslucent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Task</Text>
            <TextInput
              style={styles.textInput}
              placeholder="What would you like to accomplish?"
              placeholderTextColor={colors.textSecondary}
              value={newTaskText}
              onChangeText={setNewTaskText}
              multiline
              autoFocus
            />
            <TouchableOpacity onPress={() => setShowCalendar(v => !v)} style={styles.datePickerButton}>
              <Text style={styles.dueDateText}>
                {newTaskDueDate ? formatDate(newTaskDueDate) : 'Due date (optional)'}
              </Text>
            </TouchableOpacity>
            {showCalendar && (
              <CustomCalendar              
         selectedDate={newTaskDueDate ? new Date(newTaskDueDate) : undefined}
  onDateSelect={(date) => {
    setNewTaskDueDate(date.toISOString());
    setShowCalendar(false);
  }}
              />
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowAddModal(false);
                  setNewTaskText('');
                  setNewTaskDueDate('');
                  setShowCalendar(false);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={addTask}
              >
                <Text style={styles.saveButtonText}>Add Task</Text>
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
                if (editingTask) {
                  deleteTask(editingTask.id);
                }
              }}
            >
              <Trash2 size={16} color="#EF4444" />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Edit Task</Text>
            <TextInput
              style={styles.textInput}
              placeholder="What would you like to accomplish?"
              placeholderTextColor={colors.textSecondary}
              value={newTaskText}
              onChangeText={setNewTaskText}
              multiline
              autoFocus
            />
            <TouchableOpacity
              onPress={() => setShowEditCalendar(v => !v)}
              style={styles.datePickerButton}
            >
              <Text style={styles.dueDateText}>
                {newTaskDueDate ? formatDate(newTaskDueDate) : 'Due date (optional)'}
              </Text>
            </TouchableOpacity>
            {showEditCalendar && (
              <CustomCalendar               
         selectedDate={newTaskDueDate ? new Date(newTaskDueDate) : undefined}
  onDateSelect={(date) => {
    setNewTaskDueDate(date.toISOString());
    setShowCalendar(false);
  }}
  minDate={new Date()}
        />
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowEditModal(false);
                  setNewTaskText('');
                  setNewTaskDueDate('');
                  setEditingTask(null);
                  setShowEditCalendar(false);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={editTask}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}