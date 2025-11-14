import React from 'react';
import { Text, TouchableOpacity, ScrollView, Linking, Switch, View } from 'react-native';
import { Globe, Heart, Languages, Paintbrush } from 'lucide-react-native';
import { ScreenLayout } from '@/components/ScreenLayout';
import { ContentContainer } from '@/components/ContentContainer';
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
    <ScreenLayout tabName="settings">
      <ScrollView
        style={styles.scrollView} // ← твой стиль scrollView (padding: 20)
        showsVerticalScrollIndicator={false}
      >
        <ContentContainer>
          {/* Title */}
          <Text style={[textStyles.h1, styles.title, { color: colors.text }]}>
            {t('settings.title')}
          </Text>

          {/* App Preferences */}
          <View style={styles.section}>
            <Text style={[textStyles.h2, styles.sectionTitle, { color: colors.text }]}>
              {t('settings.appPreferences')}
            </Text>

            {/* Messy Mode */}
            <View style={styles.row}>
              <View style={styles.leftContent}>
                <Paintbrush color={colors.textSecondary} size={20} />
                <View style={styles.textContainer}>
                  <Text style={[textStyles.body, { color: colors.text }]}>
                    {t('settings.messyMode.title')}
                  </Text>
                  <Text style={[textStyles.caption, { color: colors.textSecondary }]}>
                    {t('settings.messyMode.description')}
                  </Text>
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
            <TouchableOpacity
              style={styles.row}
              onPress={showLanguageModal}
              activeOpacity={0.8}
            >
              <View style={styles.leftContent}>
                <Languages color={colors.textSecondary} size={20} />
                <View style={styles.textContainer}>
                  <Text style={[textStyles.body, { color: colors.text }]}>
                    {t('settings.language.title')}
                  </Text>
                  <Text style={[textStyles.caption, { color: colors.textSecondary }]}>
                    {t('settings.language.currently')}: {language.toUpperCase()}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* Contact & Support */}
          <View style={styles.section}>
            <Text style={[textStyles.h2, styles.sectionTitle, { color: colors.text }]}>
              {t('settings.contactSupport')}
            </Text>

            <TouchableOpacity
              style={styles.row}
              onPress={() => Linking.openURL('https://portfolio-feya-bloom.webflow.io/')}
              activeOpacity={0.8}
            >
              <View style={styles.leftContent}>
                <Globe color={colors.textSecondary} size={20} />
                <View style={styles.textContainer}>
                  <Text style={[textStyles.body, { color: colors.text }]}>
                    {t('settings.contactCreator.title')}
                  </Text>
                  <Text style={[textStyles.caption, { color: colors.textSecondary }]}>
                    {t('settings.contactCreator.description')}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.row}
              onPress={() => Linking.openURL('https://www.buymeacoffee.com/feyabloom')}
              activeOpacity={0.8}
            >
              <View style={styles.leftContent}>
                <Heart color={colors.textSecondary} size={20} />
                <View style={styles.textContainer}>
                  <Text style={[textStyles.body, { color: colors.text }]}>
                    {t('settings.supportApp.title')}
                  </Text>
                  <Text style={[textStyles.caption, { color: colors.textSecondary }]}>
                    {t('settings.supportApp.description')}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <Text
            style={[
              textStyles.caption,
              {
                color: colors.textSecondary,
                textAlign: 'center',
                marginTop: 20,
                opacity: 0.7,
              },
            ]}
          >
            {t('settings.version', { version: '1.0.0' })}
          </Text>
        </ContentContainer>
      </ScrollView>
    </ScreenLayout>
  );
}