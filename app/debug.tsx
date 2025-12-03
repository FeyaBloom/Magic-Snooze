import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChevronLeft } from 'lucide-react-native';

interface StorageData {
  [key: string]: string | null;
}

export default function DebugScreen() {
  const router = useRouter();
  const [storageData, setStorageData] = useState<StorageData>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const allData: StorageData = {};

      for (const key of allKeys) {
        const value = await AsyncStorage.getItem(key);
        allData[key] = value;
      }

      setStorageData(allData);
      console.log('Debug Storage Data:', allData);
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Debug: LocalStorage</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={true}>
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
  footer: {
    flexDirection: 'row',
    gap: 12,
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
