import { StyleSheet } from 'react-native';

export const createSettingsStyles = (colors: any) =>
  StyleSheet.create({
    leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
    container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    zIndex: 0,
  },
  scrollView: {
    flex: 1,
    zIndex: 5,
  },
  header: {
    padding: 20,
    paddingTop: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    paddingTop: 20,
    fontWeight: '1000',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: 'CabinSketch-Bold',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    fontFamily: 'CabinSketch-Regular',
  },
    section: {
      marginBottom: 30,
      paddingHorizontal: 20,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.textSecondary,
      marginBottom: 10,
      fontFamily: 'CabinSketch-Regular',
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
      fontSize: 15,
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
