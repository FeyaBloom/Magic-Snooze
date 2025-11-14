// components/ScreenLayout.tsx
import { View, StyleSheet, ScrollView } from 'react-native';
import { ScreenBackground } from './ScreenBackground';
import { ReactNode } from 'react';

export function ScreenLayout({
  tabName,
  children,
  scroll = true,
}: {
  tabName: string;
  children: ReactNode;
  scroll?: boolean;
}) {
  return (
    <View style={styles.screen}>
      <ScreenBackground tabName={tabName} />
      {scroll ? (
        <ScrollView style={styles.scrollView}>{children}</ScrollView>
      ) : (
        <View style={styles.fixedContent}>{children}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, position: 'relative' },
  scrollView: { flex: 1 },
  fixedContent: { flex: 1 },
});