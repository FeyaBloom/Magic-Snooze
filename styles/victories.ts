// styles/victories.ts
import { StyleSheet } from 'react-native';

export const createVictoryStyles = (colors: any) => StyleSheet.create({
  // Стили модалки
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
    backgroundColor: colors.primary,
    borderRadius: 12,
  },
  closeVictoriesText: {
    color: '#FFFFFF',
    fontSize: 16,
  },

  // Стили трекера
  tinyVictoryContainer: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    margin: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    maxWidth: 350,
  },
  tinyVictoryTitle: {
    fontSize: 20,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 4,
  
  },
  tinyVictorySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  
  },
  victoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  victoryButton: {
    //width: '100%',
    backgroundColor: colors.secondary + '50',
    borderRadius: 12,
    padding: 12,
    margin: 8,
    alignItems: 'center',
  },
  victoryEmoji: { fontSize: 20, marginBottom: 4 },
  victoryText: {
    fontSize: 12,
    color: colors.text,
    textAlign: 'center',
    
  },
});