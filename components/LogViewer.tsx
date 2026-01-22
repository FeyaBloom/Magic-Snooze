import React, { useState, useEffect } from 'react';
import { Modal, View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { X } from 'lucide-react-native';
import { useTheme } from '@/components/ThemeProvider';
import { useTextStyles } from '@/hooks/useTextStyles';

interface LogEntry {
  timestamp: string;
  message: string;
  type: 'log' | 'error' | 'warn';
}

class LogCollector {
  private static instance: LogCollector;
  private logs: LogEntry[] = [];
  private maxLogs = 100;

  private constructor() {
    this.setupInterception();
  }

  static getInstance() {
    if (!LogCollector.instance) {
      LogCollector.instance = new LogCollector();
    }
    return LogCollector.instance;
  }

  private setupInterception() {
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    console.log = (...args: any[]) => {
      originalLog(...args);
      this.addLog(args.join(' '), 'log');
    };

    console.error = (...args: any[]) => {
      originalError(...args);
      this.addLog(args.join(' '), 'error');
    };

    console.warn = (...args: any[]) => {
      originalWarn(...args);
      this.addLog(args.join(' '), 'warn');
    };
  }

  private addLog(message: string, type: 'log' | 'error' | 'warn') {
    const timestamp = new Date().toLocaleTimeString();
    this.logs.push({ timestamp, message, type });

    // Keep only last N logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }

  getLogs(): LogEntry[] {
    return this.logs;
  }

  clearLogs() {
    this.logs = [];
  }
}

interface LogViewerProps {
  visible: boolean;
  onClose: () => void;
}

export function LogViewer({ visible, onClose }: LogViewerProps) {
  const { colors } = useTheme();
  const textStyles = useTextStyles();
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    if (visible) {
      setLogs(LogCollector.getInstance().getLogs());
    }
  }, [visible]);

  const handleClear = () => {
    LogCollector.getInstance().clearLogs();
    setLogs([]);
  };

  const handleRefresh = () => {
    setLogs(LogCollector.getInstance().getLogs());
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'error':
        return '#EF4444';
      case 'warn':
        return '#F59E0B';
      default:
        return colors.textSecondary;
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} statusBarTranslucent>
      <View style={[styles.container, { backgroundColor: colors.surface }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <Text style={[textStyles.h2, { color: colors.text }]}>📋 Логи</Text>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={handleRefresh}
          >
            <Text style={[textStyles.button, { color: '#FFF' }]}>🔄 Обновить</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.secondary }]}
            onPress={handleClear}
          >
            <Text style={[textStyles.button, { color: '#FFF' }]}>🗑️ Очистить</Text>
          </TouchableOpacity>
        </View>

        {/* Logs */}
        <ScrollView
          style={styles.logsContainer}
          contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 20 }}
        >
          {logs.length === 0 ? (
            <Text style={[textStyles.body, { color: colors.textSecondary, textAlign: 'center', marginTop: 20 }]}>
              Логи пусты
            </Text>
          ) : (
            logs.map((log, idx) => (
              <View key={idx} style={styles.logEntry}>
                <Text style={[textStyles.caption, { color: colors.textSecondary }]}>
                  {log.timestamp}
                </Text>
                <Text
                  style={[
                    textStyles.caption,
                    {
                      color: getTypeColor(log.type),
                      marginTop: 4,
                      fontWeight: log.type === 'error' ? '600' : '400',
                    },
                  ]}
                >
                  {log.message}
                </Text>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  logsContainer: {
    flex: 1,
    paddingTop: 12,
  },
  logEntry: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
});

// Initialize log collector on app startup
LogCollector.getInstance();
