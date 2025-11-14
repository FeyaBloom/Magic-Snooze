import React, { useState } from 'react';
import { Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Sparkles } from 'lucide-react-native';
import { ScreenLayout } from '@/components/ScreenLayout';
import { ContentContainer } from '@/components/ContentContainer';
import { useTextStyles } from '@/hooks/useTextStyles';
import { useTheme } from '@/components/ThemeProvider';
import { useTranslation } from 'react-i18next';
import { VictoriesModal } from '@/components/modals/VictoriesModal';
import { VictoryCelebration } from '@/components/ui/VictoryCelebration';
import { useVictories } from '@/hooks/useVictories';

export default function TodayScreen() {
  const textStyles = useTextStyles();
  const { colors, currentTheme, setTheme, isMessyMode } = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const { celebrateVictory } = useVictories();
  const [showTinyVictories, setShowTinyVictories] = useState(false);
 


  return (
    <ScreenLayout tabName="index">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 40, // отступ снизу для кнопок
        }}
      >
        <ContentContainer paddingHorizontal={20} paddingVertical={20}>
          {/* Приветствие */}
          <View style={{ marginBottom: isMessyMode ? 32 : 24 }}>
            <Text
              style={[
                textStyles.h1,
                { 
                  color: colors.text,
                  textAlign: 'center',
                  marginBottom: 8,
                }
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.7}
            >
              {t('today.title')}
            </Text>
            
            <Text
              style={[
                textStyles.body,
                { 
                  color: colors.textSecondary,
                  textAlign: 'center',
                  opacity: 0.9,
                }
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.7}
            >
              {t('today.subtitle')}
            </Text>
          </View>

          {/* Управляющие элементы */}
          <View style={{ 
            gap: isMessyMode ? 24 : 16,
            alignItems: 'center',
          }}>
            {/* Tiny Victories — главная кнопка */}
<TouchableOpacity
  style={{
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surface,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: colors.text,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  }}
  onPress={() => setShowTinyVictories(true)}
>
  <Sparkles size={20} color={colors.primary} />
  <Text style={[textStyles.button, { color: colors.text }]}>
    {t('today.tinyVictories')}
  </Text>
</TouchableOpacity>

            {/* Переключатели тем */}
            <View style={{ 
              flexDirection: 'row', 
              gap: 12,
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}>
              <TouchableOpacity
                style={{
                  backgroundColor: colors.surface,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderRadius: 12,
                }}
                onPress={() => setTheme(currentTheme === 'daydream' ? 'nightforest' : 'daydream')}
              >
                <Text style={[textStyles.caption, { color: colors.text }]}>
                  {currentTheme === 'daydream' 
                    ? t('today.nightForest') 
                    : t('today.dayDream')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  backgroundColor: colors.surface,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderRadius: 12,
                }}
                onPress={() => router.push('/settings')}
              >
                <Text style={[textStyles.caption, { color: colors.text }]}>
                  {t('navigation.settings')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>



          {/* Подсказка (только если messyMode включён) */}
          {isMessyMode && (
            <View style={{ 
              marginTop: 32,
              padding: 16,
              backgroundColor: colors.accent + '20', // 20 — прозрачность
              borderRadius: 12,
              alignItems: 'center',
            }}>
              <Text style={[textStyles.caption, { 
                color: colors.text, 
                textAlign: 'center',
                opacity: 0.9,
              }]}>
                {t('today.messyModeHint')}
              </Text>
            </View>
          )}
        </ContentContainer>
      </ScrollView>

      <VictoriesModal
  visible={showTinyVictories}
  onClose={() => setShowTinyVictories(false)}
  onVictoryPress={celebrateVictory}
/>
    </ScreenLayout>
  );
}