import { View, StyleSheet, Platform } from 'react-native';
import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  }

  export function ContentContainer({ children }: Props) {
    return (
        <View style={styles.container}>
              {children}
                  </View>
                    );
                    }

                    const styles = StyleSheet.create({
                      container: {
                          flex: 1,
                              width: '100%',
                                  maxWidth: Platform.OS === 'web' ? 600 : undefined,
                                      alignSelf: 'center',
                                        },
                                        });