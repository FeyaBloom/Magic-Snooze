// components/modals/VictoriesModal.tsx
import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { TinyVictoryTracker } from '@/components/TinyVictoryTracker';
import { createVictoryStyles } from '@/styles/victories';

interface Props {
  visible: boolean;
  onClose: () => void;
  onVictoryPress: (text: string) => Promise<string[]> | void;
}

export const VictoriesModal = ({ visible, onClose, onVictoryPress }: Props) => {
  const styles = createVictoryStyles({}); // временно — без темы

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      statusBarTranslucent={true}
    >
      <View style={styles.modalOverlay}>
        <TinyVictoryTracker onVictoryPress={onVictoryPress} />
        <TouchableOpacity
          style={styles.closeVictoriesButton}
          onPress={onClose}
        >
          <Text style={styles.closeVictoriesText}>Close</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};