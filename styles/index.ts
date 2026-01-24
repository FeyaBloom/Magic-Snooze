import { StyleSheet, Dimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

export const createTodayStyles = (colors: any) => StyleSheet.create({

  container: {
    flex: 1,
  },
  
  settingsButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
   themeControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  magicalControls: {
    marginBottom: 20,
  },
  themeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: 12,
    backgroundColor: colors.surface,
    height: 48,
    marginHorizontal: 20,
    // @ts-ignore
    boxShadow: '0 2px 4px rgba(204, 204, 204, 0.5)',
  },
  routineSection: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    backgroundColor: colors.surface,
    // @ts-ignore
    boxShadow: `0 3px 6px ${colors.secondary}33`,
    opacity: 0.75
  },
  routineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  routineTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: colors.primary + '30',
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  stepTextCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  stepTextDisabled: {
    opacity: 0.4,
  },
  actionButton: {
    padding: 8,
  },
  snoozeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    justifyContent: 'center',
    marginHorizontal: 60,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 30,
    marginBottom: 40,
    backgroundColor: colors.primary,
    color: '#ffffff',
    // @ts-ignore
    boxShadow: `0 4px 12px ${colors.primary}66`,
  },
  snoozeButtonPressed: {
    // @ts-ignore
    boxShadow: `0 6px 30px ${colors.primary}cc`,
  },
  resumeButton: {
    marginHorizontal: 60,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 40,
    backgroundColor: colors.secondary,
    // @ts-ignore
    boxShadow: `0 4px 12px ${colors.secondary}66`,
  },
  resumeButtonPressed: {
    // @ts-ignore
    boxShadow: `0 6px 30px ${colors.secondary}cc`,
  },
  progressSection: {
    padding: 16,
    borderRadius: 16,
    marginTop: 8,
    backgroundColor: colors.surface,
    // @ts-ignore
    boxShadow: `0 2px 4px ${colors.secondary}66`,
    opacity: 0.75
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  progressStat: {
    alignItems: 'center',
    gap: 4,
  },
  modalOverlay: {
    flex: 1,
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 0,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    padding: 24,
    borderRadius: 20,
    backgroundColor: colors.surface,
  },
  textInput: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 12,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 16,
    color: colors.text,
    backgroundColor: colors.background,
    borderColor: colors.primary,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  deleteButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
  }
});