// styles/magic.ts
import { StyleSheet } from 'react-native';

export const createMagicStyles = (colors: any) => StyleSheet.create({
  // ... остальные стили (checkbox, floatingBackground и т.д.) оставь как есть

  tinyVictoryContainer: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    marginVertical: 16,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  tinyVictoryTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 6,
    fontFamily: 'CabinSketch-Regular',
  },
  tinyVictorySubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 18,
    fontFamily: 'CabinSketch-Regular',
  },
  victoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10, // ← RN 0.71+ или используй marginBottom в кнопке
  },
  victoryButton: {
    width: '48%',
    backgroundColor: colors.secondary + '20', // 20 = 12% opacity
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.secondary + '00',
  },
  victoryEmoji: {
    fontSize: 24,
    marginBottom: 6,
  },
  victoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    fontFamily: 'ComicNeue-Regular',
    lineHeight: 18,
  },

  // ... остальные стили (promptOverlay и т.д.) оставь
});
