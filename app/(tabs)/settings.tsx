import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Linking, SafeAreaView } from 'react-native';
import { useTheme } from '@/components/ThemeProvider';
import { LinearGradient } from 'expo-linear-gradient';
import { createSettingsStyles } from '@/styles/settings';
import { Globe, Heart, Languages, LogIn, User as User2, Paintbrush } from 'lucide-react-native';
import { FloatingBackground } from "@/components/MagicalFeatures";
import { useTranslation } from 'react-i18next';
import i18n from '@/i18n';

export default function SettingsTab() {
  const { colors, currentTheme, setTheme, toggleMessyMode } = useTheme();
  const styles = createSettingsStyles(colors);
  const { t } = useTranslation();
const currentLanguageCode = i18n.language;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={colors.background}
        style={styles.gradient}
      >
        <FloatingBackground />
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>{t('settings.title')}</Text>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('settings.appPreferences')}</Text>
            
            <View style={styles.row}>
              <View>
                <Text style={styles.label}>{t('settings.messyMode.title')}</Text>
                <Text style={styles.description}>
                  {t('settings.messyMode.description')}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.themeButton}
                onPress={toggleMessyMode}
              >
                <Paintbrush color={colors.textSecondary} size={20} />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity  
               style={styles.themeButton}
                onPress={useTranslation}
              >
              <View>
                <Text style={styles.label}>{t('settings.language.title')}</Text>
                <Text style={styles.description}>
                  {t('settings.language.currently')}: {currentLanguageInfo.flag} {currentLanguageInfo.name}
                </Text>
              </View>
              <Languages color={colors.textSecondary} size={20} />
            </TouchableOpacity>
          
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('settings.account')}</Text>
            
            <TouchableOpacity style={styles.row}>
              <View>
                <Text style={styles.label}>{t('settings.connectGoogle.title')}</Text>
                <Text style={styles.description}>{t('settings.connectGoogle.description')}</Text>
              </View>
              <LogIn color={colors.textSecondary} size={20} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.row}>
              <View>
                <Text style={styles.label}>{t('settings.manageProfile.title')}</Text>
                <Text style={styles.description}>{t('settings.manageProfile.description')}</Text>
              </View>
              <User2 color={colors.textSecondary} size={20} />
            </TouchableOpacity>
          </View>
          

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.contactSupport')}</Text>

        <TouchableOpacity
          style={styles.row}
          onPress={() => Linking.openURL('https://portfolio-feya-bloom.webflow.io/')}
        >
          <View>
            <Text style={styles.label}>{t('settings.contactCreator.title')}</Text>
            <Text style={styles.description}>{t('settings.contactCreator.description')}</Text>
          </View>
          <Globe color={colors.textSecondary} size={20} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.row}
          onPress={() => Linking.openURL('https://www.buymeacoffee.com/feyabloom')}
        >
          <View>
            <Text style={styles.label}>{t('settings.supportApp.title')}</Text>
            <Text style={styles.description}>{t('settings.supportApp.description')}</Text>
          </View>
          <Heart color={colors.textSecondary} size={20} />
        </TouchableOpacity>
      </View>
      
      <LanguageModal
        visible={languageModalVisible}
        onClose={() => setLanguageModalVisible(false)}
      />
    </ScrollView>
</LinearGradient>
</SafeAreaView>
  );
}
