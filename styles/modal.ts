// styles/modal.ts
import { StyleSheet } from 'react-native';

export const createModalStyles = (_: any) => StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  closeVictoriesButton: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#EC4899',
    borderRadius: 12,
  },
  closeVictoriesText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
});