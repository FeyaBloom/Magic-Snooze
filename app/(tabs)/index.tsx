import { Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Sparkles } from 'lucide-react-native';
import { ScreenBackground } from '@/components/ScreenBackground';
import { useTextStyles } from '@/hooks/useTextStyles';
import { useTheme } from '@/components/ThemeProvider';
import { createIndexStyles } from '@/styles/index';
import { useTranslation } from 'react-i18next';

export default function TodayScreen() {
  const textStyles = useTextStyles();
  const { colors, currentTheme, setTheme } = useTheme();
  const router = useRouter();  
  const styles = createIndexStyles(colors);
  const { t } = useTranslation();
  return (
    <ScreenBackground tabName="index">
       
            <View style={styles.content}>
              <Text 
                style={textStyles.h1} 
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.7}
              >
                {t('today.title')}
              </Text>
              <Text 
                style={textStyles.body}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.7}
              >
               {t('today.subtitle')}
              </Text>
            </View>

  <View style={styles.magicalControls}>
              <TouchableOpacity 
                style={styles.themeButton} 
                onPress={() => router.push('/settings')}
              >
                <Sparkles size={20} color="#FFFFFF" />
                <Text style={textStyles.caption}>{t('today.tinyVictories')}</Text>
              </TouchableOpacity>
            
              <View style={styles.themeControls}>
                <TouchableOpacity
                  style={styles.themeButton}
                  onPress={() => setTheme(currentTheme === 'daydream' ? 'nightforest' : 'daydream')}
                >
                  <Text 
                    style={textStyles.button}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.7}
                  >
                    {currentTheme === 'daydream' ? t('today.nightForest') : t('today.dayDream')}
                  </Text>
                </TouchableOpacity>
                          
                <TouchableOpacity  
                  style={styles.themeButton}       
                  onPress={() => router.push('/settings')}
                >
                  <Text 
                    style={textStyles.button}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.7}
                  >
                    {t('navigation.settings')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>





      
       











        {/* Контент по центру */}
        <View style={styles.content}>
          <Text style={textStyles.h1}>Заголовок</Text>
          <Text style={textStyles.body}>Обычный текст</Text>
        </View>
     
    </ScreenBackground>
  );
}

