import LottieView from 'lottie-react-native'; 
import FloatingCloudJSON from '@/assets/animations/floating-cloud.json'; 
import GentleStarsJSON from '@/assets/animations/gentle-stars.json'; 

import { StyleSheet } from 'react-native';

export const createMagicStyles = (colors: any) => StyleSheet.create({
  checkboxContainer: { position: 'relative', width: 32, height: 32 },
 
  floatingBackgroundStyle: {
  zIndex: -1,
  },
  magicalCheckbox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.textSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surfaceTransparent,
  },
  magicalCheckboxCompleted: {
    backgroundColor: colors.primaryTransparent,
    borderColor: colors.accent,
  },
  magicalCheckboxDisabled: {
    backgroundColor: colors.disabled,
    borderColor: colors.textSecondary + `50`,
  },
  sparkle: { position: 'absolute', zIndex: 10 },

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
  },
  tinyVictoryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 4,
    fontFamily: 'ComicNeue-Bold',
  },
  tinyVictorySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'ComicNeue-Regular',
  },
  victoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  victoryButton: {
    width: '48%',
    backgroundColor: colors.secondary + `50`,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
  },
  victoryEmoji: { fontSize: 20, marginBottom: 4 },
  victoryText: {
    fontSize: 12,
    color: colors.text,
    textAlign: 'center',
    fontFamily: 'ComicNeue-Regular',
  },

  promptOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  promptContainer: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    margin: 20,
    alignItems: 'center',
    maxWidth: 300,
  },
  promptText: {
    fontSize: 18,
    color: colors.text,
    textAlign: 'center',
    marginVertical: 16,
    fontFamily: 'ComicNeue-Regular',
    lineHeight: 24,
  },
  promptButtons: { flexDirection: 'row', gap: 12 },
  promptButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surfaceMuted,
  },
  promptButtonPrimary: { backgroundColor: colors.accent },
  promptButtonText: {
    color: colors.textSecondary,
    fontFamily: 'ComicNeue-Regular',
  },
  promptButtonTextPrimary: {
    color: colors.textPrimary,
    fontFamily: 'ComicNeue-Regular',
  },
});
