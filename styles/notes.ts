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
    tagsCloudSection: {
      marginBottom: 12,
    },
    tagsWrap: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    tagChip: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      opacity: 0.9,
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
      // @ts-ignore
      boxShadow: `0 3px 6px ${colors.secondary}33`,
      opacity: 0.75
    },
    noteFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    noteTagsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      marginTop: -2,
      marginBottom: 12,
    },
    noteTag: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 999,
      opacity: 0.8,
    },
    noteMediaPreviewRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      columnGap: 6,
      rowGap: 6,
      marginTop: 2,
      marginBottom: 10,
    },
    noteMediaThumb: {
      width: 52,
      height: 52,
      borderRadius: 10,
    },
    noteMediaMoreThumb: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    noteAudioSummaryRow: {
      marginBottom: 12,
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
    titleInput: {
      borderWidth: 2,
      borderRadius: 12,
      padding: 12,
      marginBottom: 12,
      fontSize: 16,
    },
    mediaSection: {
      marginBottom: 12,
      gap: 8,
    },
    mediaHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    modalMediaGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      columnGap: 8,
      rowGap: 8,
    },
    modalMediaItem: {
      position: 'relative',
    },
    modalMediaThumb: {
      width: 72,
      height: 72,
      borderRadius: 10,
    },
    removeMediaBtn: {
      position: 'absolute',
      top: 4,
      right: 4,
      borderRadius: 999,
      padding: 4,
      opacity: 0.95,
    },
    audioList: {
      gap: 8,
    },
    audioItem: {
      borderRadius: 10,
      padding: 8,
      gap: 8,
    },
    audioControlsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    audioPlayBtn: {
      borderRadius: 8,
      width: 30,
      height: 30,
      alignItems: 'center',
      justifyContent: 'center',
    },
    audioTitleInput: {
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 8,
      fontSize: 14,
    },
    audioProgressTrack: {
      height: 6,
      borderRadius: 999,
      overflow: 'hidden',
    },
    audioProgressFill: {
      height: '100%',
      borderRadius: 999,
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
    modalHeader: {
      marginBottom: 16,
      minHeight: 40,
      justifyContent: 'center',
      position: 'relative',
    },
    modalButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 12,
      alignItems: 'center',
    },
    deleteButton: {
      position: 'absolute',
      top: '50%',
      marginTop: -16,
      right: 0,
      padding: 8,
      zIndex: 10,
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
      flexGrow: 1,
      flexShrink: 1,
      marginBottom: 16,
    },
    viewScrollContent: {
      paddingBottom: 8,
      rowGap: 12,
    },
    viewMediaRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      columnGap: 8,
      rowGap: 8,
    },
    viewMediaThumb: {
      borderRadius: 10,
    },


    // 1. modalContent — убрать maxWidth, оставить width: '100%'
modalContent: {
  width: '100%',
  maxWidth: 600,
  maxHeight: '80%',
  borderRadius: 24,
  padding: 24,
},

// 2. viewModalContent — убрать maxWidth, оставить width: '100%'
viewModalContent: {
  width: '100%',
  maxWidth: 600,
  height: '60%',
  borderRadius: 24,
  padding: 24,
  flexDirection: 'column',
},

// 3. mediaAddButton — убрать alignItems center чтоб не растягивалась
mediaAddButton: {
  alignSelf: 'flex-start',
  borderRadius: 10,
  paddingVertical: 10,
  paddingHorizontal: 12,
},

// 4. closeButton — по ширине текста
closeButton: {
  alignSelf: 'center',
  paddingVertical: 12,
  paddingHorizontal: 24,
  borderRadius: 12,
},
  });