import { StyleSheet } from 'react-native';

export const createSettingsStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 20,
      fontFamily: 'CabinSketch-Bold',
    },
    section: {
      marginBottom: 30,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.textSecondary,
      marginBottom: 10,
      fontFamily: 'ComicNeue-Bold',
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.surface,
      padding: 16,
      borderRadius: 12,
      marginBottom: 10,
    },
    label: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.text,
      fontFamily: 'ComicNeue-Regular',
    },
    description: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 4,
      fontFamily: 'ComicNeue-Regular',
    },
  });
