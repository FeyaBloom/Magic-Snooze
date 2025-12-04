import { StyleSheet } from 'react-native';

interface ThemeColors {
  primary: string;
  secondary: string;
  background: string[];
  surface: string;
  text: string;
  textSecondary: string;
  accent: string;
}

export const createNotesStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 12,
      marginBottom: 16,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
    },
    addNoteButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      paddingVertical: 14,
      borderRadius: 16,
      marginBottom: 24,
      alignSelf: 'center',
      paddingHorizontal: 20,
    },
    notesContainer: {
      gap: 12,
    },
    noteCard: {
      padding: 16,
      borderRadius: 16,
          shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
    opacity: 0.75
    },
    noteFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    editButton: {
      padding: 8,
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 60,
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
      maxHeight: '80%',
      borderRadius: 24,
      padding: 24,
    },
    titleInput: {
      borderWidth: 2,
      borderRadius: 12,
      padding: 12,
      marginBottom: 12,
      fontSize: 16,
    },
    contentInput: {
      borderWidth: 2,
      borderRadius: 12,
      padding: 12,
      minHeight: 150,
      textAlignVertical: 'top',
      marginBottom: 16,
      fontSize: 16,
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
      zIndex: 10,
    },
    viewModalContent: {
      width: '100%',
      maxWidth: 500,
      maxHeight: '90%',
      borderRadius: 24,
      padding: 24,
    },
    viewHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
      marginBottom: 8,
    },
    editIconButton: {
      padding: 4,
    },
    viewScroll: {
      flex: 1,
      marginBottom: 16,
    },
    closeButton: {
      paddingVertical: 12,
      borderRadius: 12,
      alignItems: 'center',
    },
  });