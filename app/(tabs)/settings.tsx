import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Linking, Switch } from 'react-native';
import { Globe, Heart, Languages, Paintbrush } from 'lucide-react-native';
import { ScreenBackground } from '@/components/ScreenBackground';
import { useTheme } from '@/components/ThemeProvider';
import { useLanguage } from '@/components/LanguageProvider';
import { useTranslation } from 'react-i18next';
import { useTextStyles } from '@/hooks/useTextStyles';
import { createSettingsStyles } from '@/styles/settings';

export default function SettingsScreen() {
  const { colors, toggleMessyMode, isMessyMode } = useTheme();
  const { language, showLanguageModal } = useLanguage();
  const { t } = useTranslation();
  const textStyles = useTextStyles();
  const styles = createSettingsStyles(colors);

  return (
    <ScreenBackground tabName="settings">
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={[textStyles.h1, styles.title]}>{t('settings.title')}</Text>

        {/* App Preferences */}
        <View style={styles.section}>
          <Text style={[textStyles.h2, styles.sectionTitle]}>{t('settings.appPreferences')}</Text>

          {/* Messy Mode */}
          <View style={styles.row}>
            <View style={styles.leftContent}>
              <Paintbrush color={colors.textSecondary} size={20} />
              <View style={styles.textContainer}>
                <Text style={textStyles.body}>{t('settings.messyMode.title')}</Text>
                <Text style={textStyles.caption}>{t('settings.messyMode.description')}</Text>
              </View>
            </View>
            <Switch
              value={isMessyMode}
              onValueChange={toggleMessyMode}
              trackColor={{ false: colors.textSecondary, true: colors.primary }}
              thumbColor={isMessyMode ? colors.accent : colors.surface}
            />
          </View>

          {/* Language */}
          <TouchableOpacity style={styles.row} onPress={showLanguageModal}>
            <View style={styles.leftContent}>
              <Languages color={colors.textSecondary} size={20} />
              <View style={styles.textContainer}>
                <Text style={textStyles.body}>{t('settings.language.title')}</Text>
                <Text style={textStyles.caption}>
                  {t('settings.language.currently')}: {language.toUpperCase()}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Contact & Support */}
        <View style={styles.section}>
          <Text style={[textStyles.h2, styles.sectionTitle]}>{t('settings.contactSupport')}</Text>

          <TouchableOpacity
            style={styles.row}
            onPress={() => Linking.openURL('https://portfolio-feya-bloom.webflow.io/')}
          >
            <View style={styles.leftContent}>
              <Globe color={colors.textSecondary} size={20} />
              <View style={styles.textContainer}>
                <Text style={textStyles.body}>{t('settings.contactCreator.title')}</Text>
                <Text style={textStyles.caption}>{t('settings.contactCreator.description')}</Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.row}
            onPress={() => Linking.openURL('https://www.buymeacoffee.com/feyabloom')}
          >
            <View style={styles.leftContent}>
              <Heart color={colors.textSecondary} size={20} />
              <View style={styles.textContainer}>
                <Text style={textStyles.body}>{t('settings.supportApp.title')}</Text>
                <Text style={textStyles.caption}>{t('settings.supportApp.description')}</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}