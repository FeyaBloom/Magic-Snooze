import { StyleSheet } from 'react-native';

export const createSettingsStyles = (colors: any) => StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  title: {
    marginBottom: 30,
    marginTop: 20,
    textAlign: 'center'
  },
  section: {
    marginBottom: 30,   

  },
  sectionTitle: {
    marginBottom: 15,
    opacity: 0.8,
  },
  sectionSubtitle: {
    marginBottom: 12,
    opacity: 0.7,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    // @ts-ignore
    boxShadow: `0 2px 4px ${colors.secondary}66`,
    opacity: 0.75
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  textContainer: {
    marginLeft: 12,
    flex: 1,
  },
  button: {
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  infoBox: {
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 8,
  },
  
  // Modal styles
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
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    width: 320,
    maxHeight: 500,
    // @ts-ignore
    boxShadow: '0 10px 10px rgba(0, 0, 0, 0.25)',
  },
  modalTitle: {
    marginBottom: 20,
    textAlign: 'center',
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: colors.background[0] || colors.surface,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  languageOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  languageFlag: {
    fontSize: 28,
    marginRight: 12,
  },
  closeButton: {
    marginTop: 20,
    padding: 16,
    backgroundColor: colors.primary,
    borderRadius: 12,
    alignItems: 'center',
  },
});