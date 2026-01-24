import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChevronLeft } from 'lucide-react-native';

interface StorageData {
  [key: string]: string | null;
}

interface WeekDebugInfo {
  currentWeekIndex: number;
  expandedWeeksArray: number[];
  weeklyStatsCount: number;
  dateNow: string;
  weeksInfo?: string[];
}

export default function DebugScreen() {
  const router = useRouter();
  const [storageData, setStorageData] = useState<StorageData>({});
  const [loading, setLoading] = useState(true);
  const [weekDebug, setWeekDebug] = useState<WeekDebugInfo | null>(null);

  useEffect(() => {
    loadAllData();
    calculateWeekDebug();
  }, []);

  const calculateWeekDebug = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstSunday = new Date(firstDay);
    firstSunday.setDate(firstSunday.getDate() - firstDay.getDay());

    let weekIdx = 0;
    let currentWeekStart = new Date(firstSunday);
    let foundWeekIndex = 0;
    const weeksInfo: string[] = [];

    weeksInfo.push(`NOW: ${now.toISOString()} (time: ${now.getTime()})`);
    weeksInfo.push('---');

    while (currentWeekStart <= lastDay) {
      const weekEnd = new Date(currentWeekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      const startStr = currentWeekStart.toISOString().split('T')[0];
      const endStr = weekEnd.toISOString().split('T')[0];
      const isCurrentWeek = now >= currentWeekStart && now <= weekEnd;
      
      weeksInfo.push(`Week ${weekIdx + 1} (idx ${weekIdx}): ${startStr} - ${endStr}${isCurrentWeek ? ' ⭐ CURRENT' : ''}`);
      weeksInfo.push(`  Start time: ${currentWeekStart.getTime()}, End time: ${weekEnd.getTime()}`);
      weeksInfo.push(`  Check: ${now.getTime()} >= ${currentWeekStart.getTime()} && ${now.getTime()} <= ${weekEnd.getTime()} = ${isCurrentWeek}`);

      if (isCurrentWeek) {
        foundWeekIndex = weekIdx;
      }

      currentWeekStart = new Date(weekEnd);
      currentWeekStart.setDate(currentWeekStart.getDate() + 1);
      weekIdx += 1;
    }

    setWeekDebug({
      currentWeekIndex: foundWeekIndex,
      expandedWeeksArray: [foundWeekIndex],
      weeklyStatsCount: weekIdx,
      dateNow: now.toISOString(),
      weeksInfo,
    } as any);
  };

  const loadAllData = async () => {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const allData: StorageData = {};

      for (const key of allKeys) {
        const value = await AsyncStorage.getItem(key);
        allData[key] = value;
      }

      setStorageData(allData);
    } catch (error) {
      console.error('Error loading storage data:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearAllData = async () => {
    try {
      await AsyncStorage.clear();
      setStorageData({});
      alert('All data cleared!');
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  };

  const generateMockData = async () => {
    try {
      setLoading(true);
      
      // Генерация данных за декабрь 2025 и январь 2026 (до 22 числа)
      const startDate = new Date('2025-12-01');
      const endDate = new Date('2026-01-22');
      
      const victories = [
        'bed',
        'water',
        'breath',
        'patient',
        'pet',
        'sky',
        'smile',
        'food',
      ];

      const morningRoutinesList = [
        'Warm lemon-honey water',
        'Energizing workout',
        'Great healthy breakfast',
      ];

      const eveningRoutinesList = [
        'Evening self-care',
        'Short plan for tomorrow',
        'Sleep before midnight',
      ];

      const tasks: any[] = [];
      let taskId = 1;

      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        
        // Случайный день: 70% complete, 20% partial, 10% snoozed
        const rand = Math.random();
        const isSnoozed = rand < 0.1;
        const isComplete = rand >= 0.1 && rand < 0.8;
        
        if (!isSnoozed) {
          // Progress данные (рутины)
          const morningTotal = 3;
          const eveningTotal = 3;
          const morningDone = isComplete ? morningTotal : Math.floor(Math.random() * morningTotal);
          const eveningDone = isComplete ? eveningTotal : Math.floor(Math.random() * eveningTotal);
          
          // Создаём детальные рутины с completed статусом
          const morningRoutines = morningRoutinesList.map((text, idx) => ({
            text,
            completed: idx < morningDone,
          }));
          
          const eveningRoutines = eveningRoutinesList.map((text, idx) => ({
            text,
            completed: idx < eveningDone,
          }));
          
          const progressData = {
            morningTotal,
            eveningTotal,
            morningDone,
            eveningDone,
            morningCompleted: morningDone === morningTotal,
            eveningCompleted: eveningDone === eveningTotal,
            snoozed: false,
            morningRoutines,
            eveningRoutines,
          };
          
          await AsyncStorage.setItem(`progress_${dateStr}`, JSON.stringify(progressData));
          
          // Victories (2-5 случайных побед)
          const victoryCount = 2 + Math.floor(Math.random() * 4);
          const dayVictories: string[] = [];
          for (let i = 0; i < victoryCount; i++) {
            const randomVictory = victories[Math.floor(Math.random() * victories.length)];
            if (!dayVictories.includes(randomVictory)) {
              dayVictories.push(randomVictory);
            }
          }
          await AsyncStorage.setItem(`victories_${dateStr}`, JSON.stringify(dayVictories));
          
          // Случайные задачи (30% дней)
          if (Math.random() < 0.3) {
            tasks.push({
              id: taskId++,
              text: `Task ${taskId} - ${dateStr}`,
              completed: true,
              createdAt: dateStr,
              completedAt: dateStr,
              dueDate: dateStr,
            });
          }
        } else {
          // Snoozed day
          const progressData = {
            morningTotal: 3,
            eveningTotal: 3,
            morningDone: 0,
            eveningDone: 0,
            morningCompleted: false,
            eveningCompleted: false,
            snoozed: true,
          };
          await AsyncStorage.setItem(`progress_${dateStr}`, JSON.stringify(progressData));
        }
      }
      
      // Сохранить задачи
      if (tasks.length > 0) {
        await AsyncStorage.setItem('oneTimeTasks', JSON.stringify(tasks));
      }
      
      // Сохранить рутины (дефолтные)
      const defaultRoutines = {
        morning: [
          { text: 'Warm lemon-honey water', done: false },
          { text: 'Energizing workout', done: false },
          { text: 'Great healthy breakfast', done: false },
        ],
        evening: [
          { text: 'Evening self-care', done: false },
          { text: 'Short plan for tomorrow', done: false },
          { text: 'Sleep before midnight', done: false },
        ],
      };
      await AsyncStorage.setItem('routines', JSON.stringify(defaultRoutines));
      
      // Пересчитать стрик на основе сгенерированных данных
      let currentStreak = 0;
      let longestStreak = 0;
      let lastActiveDate: string | null = null;
      
      // Считаем от самой старой даты к новой
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        const progressData = await AsyncStorage.getItem(`progress_${dateStr}`);
        
        let hasActivity = false;
        if (progressData) {
          const progress = JSON.parse(progressData);
          hasActivity = !progress.snoozed && (progress.morningDone > 0 || progress.eveningDone > 0);
        }
        
        // Проверяем victories
        if (!hasActivity) {
          const victoriesData = await AsyncStorage.getItem(`victories_${dateStr}`);
          if (victoriesData) {
            hasActivity = JSON.parse(victoriesData).length > 0;
          }
        }
        
        if (hasActivity) {
          if (lastActiveDate === null) {
            currentStreak = 1;
          } else {
            // Проверяем непрерывность
            const yesterday = new Date(d);
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];
            
            if (yesterdayStr === lastActiveDate) {
              currentStreak += 1;
            } else {
              currentStreak = 1;
            }
          }
          
          lastActiveDate = dateStr;
          longestStreak = Math.max(longestStreak, currentStreak);
        } else {
          // День без активности - сброс стрика
          currentStreak = 0;
        }
      }
      
      const streakData = {
        currentStreak,
        longestStreak,
        lastActiveDate,
        freezeDaysAvailable: 1,
        lastFreezeDate: null,
      };
      await AsyncStorage.setItem('streakData', JSON.stringify(streakData));
      
      await loadAllData();
      alert('Mock data generated! Dec 2025 + Jan 2026 (until today)');
    } catch (error) {
      console.error('Error generating mock data:', error);
      alert('Error generating data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Debug: LocalStorage</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={true}>
        {/* Week Debug Info */}
        {weekDebug && (
          <View style={[styles.dataItem, { borderLeftColor: '#10B981', marginBottom: 16 }]}>
            <Text style={[styles.keyText, { fontSize: 16, marginBottom: 8 }]}>📅 Week Stats Debug</Text>
            <Text style={styles.debugText}>Date Now: {weekDebug.dateNow}</Text>
            <Text style={styles.debugText}>Current Week Index: {weekDebug.currentWeekIndex}</Text>
            <Text style={styles.debugText}>Expanded Weeks Array: [{weekDebug.expandedWeeksArray.join(', ')}]</Text>
            <Text style={styles.debugText}>Total Weeks in Month: {weekDebug.weeklyStatsCount}</Text>
            {weekDebug.weeksInfo && (
              <View style={{ marginTop: 8 }}>
                <Text style={[styles.debugText, { fontWeight: '600' }]}>Weeks breakdown:</Text>
                {weekDebug.weeksInfo.map((info, idx) => (
                  <Text key={idx} style={[styles.debugText, { fontSize: 11, marginLeft: 8 }]}>{info}</Text>
                ))}
              </View>
            )}
          </View>
        )}

        {loading ? (
          <Text style={styles.loadingText}>Loading...</Text>
        ) : Object.keys(storageData).length === 0 ? (
          <Text style={styles.emptyText}>No data stored</Text>
        ) : (
          Object.entries(storageData).map(([key, value]) => (
            <View key={key} style={styles.dataItem}>
              <Text style={styles.keyText}>{key}:</Text>
              <Text style={styles.valueText} selectable>
                {value ? (value.length > 200 ? value.substring(0, 200) + '...' : value) : 'null'}
              </Text>
            </View>
          ))
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.reloadButton} onPress={loadAllData}>
          <Text style={styles.buttonText}>Refresh</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.generateButton} onPress={generateMockData}>
          <Text style={styles.buttonText}>Generate Mock Data</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.clearButton} onPress={clearAllData}>
          <Text style={styles.buttonText}>Clear All</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 16,
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  dataItem: {
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#EC4899',
  },
  keyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  valueText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
    backgroundColor: '#f9f9f9',
    padding: 8,
    borderRadius: 4,
  },
  loadingText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 32,
  },
  debugText: {
    fontSize: 13,
    color: '#333',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  footer: {
    flexDirection: 'row',
    gap: 8,
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  reloadButton: {
    flex: 1,
    backgroundColor: '#8B5CF6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  generateButton: {
    flex: 1,
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButton: {
    flex: 1,
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
