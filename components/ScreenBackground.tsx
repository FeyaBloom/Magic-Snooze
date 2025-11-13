import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from './ThemeProvider';
import { StyleSheet } from 'react-native';
import { ReactNode } from 'react';
import { ContentContainer } from './ContentContainer';

interface Props {
  tabName: string;
    children: ReactNode;
    }

    export function ScreenBackground({ tabName, children }: Props) {
      const { getTabGradient } = useTheme();
        const gradient = getTabGradient(tabName);

          return (
              <LinearGradient colors={gradient} style={styles.container}>
                    <ContentContainer>
                            {children}
                    </ContentContainer>
              </LinearGradient>
          );
        }
        const styles = StyleSheet.create({
              container: { flex: 1 },
        });