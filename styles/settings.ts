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
    paddingTop: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
  },
    section: {
      marginBottom: 30,
      paddingHorizontal: 20,
    },
    sectionTitle: {
      marginBottom: 10,
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
    },
    description: {
      marginTop: 4,
      
    },
  });