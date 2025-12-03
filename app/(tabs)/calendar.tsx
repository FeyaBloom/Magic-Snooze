import { View, Text, ScrollView} from 'react-native';
import { useTheme } from '@/components/ThemeProvider';
import { ScreenLayout } from '@/components/ScreenLayout';
import { ContentContainer} from '@/components/ContentContainer';
import { useTextStyles } from '@/hooks/useTextStyles';
import { useTranslation } from 'react-i18next';


export default function CalendarScreen() {
  const textStyles = useTextStyles();
  const { colors, isMessyMode } = useTheme();
  const { t } = useTranslation();

  return (
    <ScreenLayout tabName="calendar">
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
              {t('calendar.title')}
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
              {t('calendar.subtitle')}
            </Text>
            </View>

        </ContentContainer>
      </ScrollView>
    </ScreenLayout>
  );
}

