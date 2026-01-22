import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocalDateString } from '@/utils/dateUtils';

export const useVictories = () => {
  const [celebratedVictories, setCelebratedVictories] = useState<string[]>([]);

  const loadCelebratedVictories = async () => {
    try {
      const victories = await AsyncStorage.getItem(`victories_${getLocalDateString()}`);
      if (victories) {
        setCelebratedVictories(JSON.parse(victories));
      } else {
        setCelebratedVictories([]);
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
      
      return newVictories;
    } catch (error) {
      console.error('Error saving victory:', error);
      return celebratedVictories;
    }
  };

  const resetVictories = async () => {
    try {
      setCelebratedVictories([]);
      await AsyncStorage.removeItem(`victories_${getLocalDateString()}`);
    } catch (error) {
      console.error('Error resetting victories:', error);
    }
  };

  useEffect(() => {
    loadCelebratedVictories();
  }, []);

  return {
    celebratedVictories,
    celebrateVictory,
    resetVictories,
    loadCelebratedVictories,
  };
};