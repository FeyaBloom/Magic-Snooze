import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { useTheme } from '@/components/ThemeProvider';
import { ScreenBackground } from '@/components/ScreenBackground';

export default function CalendarScreen() {
  const { colors } = useTheme();

  return (
    <ScreenBackground tabName="calendar">
      <ScrollView
        style={screenStyles.scrollView}
        contentContainerStyle={screenStyles.contentContainer}
        scrollEnabled={true}
        showsVerticalScrollIndicator={false}
      >
        <View style={screenStyles.contentWrapper}>
          <Text style={[styles.text, { color: colors.text }]}>
            📅 Calendar
          </Text>
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  text: { fontSize: 24, fontWeight: 'bold' },
});

const screenStyles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: 'transparent',
    zIndex: 2,
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentWrapper: {
    maxWidth: Platform.OS === 'web' ? 600 : undefined,
    width: '100%',
    alignSelf: 'center',
  },
});