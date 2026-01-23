import React, { useState, useEffect } from 'react';
import { Text, TouchableOpacity, ScrollView, Linking, Switch, View, Alert } from 'react-native';
import { Globe, Heart, Languages, Paintbrush, Bug, Lightbulb, Sunset, Hand, Bell, BellOff, Clock } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { ScreenLayout } from '@/components/ScreenLayout';
import { ContentContainer } from '@/components/ContentContainer';
import { useTheme } from '@/components/ThemeProvider';
import { useLanguage } from '@/components/LanguageProvider';
import ResetDataComponent from '@/components/ResetData';
import { useTranslation } from 'react-i18next';
import { useTextStyles } from '@/hooks/useTextStyles';
import { createSettingsStyles } from '@/styles/settings';
import { useNotifications } from '@/hooks/useNotifications';
import * as Notifications from 'expo-notifications';
import { getAllNotificationTimes, formatTime } from '@/utils/notificationTimes';

export default function SettingsScreen() {
  const router = useRouter();
  const { colors, toggleMessyMode, isMessyMode } = useTheme();
  const { language, showLanguageModal } = useLanguage();
  const { t } = useTranslation();
  const textStyles = useTextStyles();
  const styles = createSettingsStyles(colors);
  const { operationMode, setOperationMode } = useTheme();
  
  // Notifications hook
  const notifications = useNotifications();

  // Состояние для времени уведомлений
  const [notificationTimes, setNotificationTimes] = useState({ 
    morning: { hour: 7, minute: 0 }, 
    evening: { hour: 19, minute: 0 } 
  });

  // Загружаем времена уведомлений при монтировании
  useEffect(() => {
    const loadTimes = async () => {
      const times = await getAllNotificationTimes();
      setNotificationTimes(times);
    };
    loadTimes();
  }, []);

  // Обработчик запроса разрешений
  const handleRequestPermission = async () => {
    const granted = await notifications.requestPermission();
    if (granted) {
      Alert.alert(
        '🌸',
        t('notifications.settings.testSent'),
        [{ text: 'OK' }]
      );
    }
  };

  // Тестовое уведомление
  const sendTestNotification = async () => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: t('notifications.settings.testSent'),
          body: 'This is a gentle test reminder 🌸',
        },
        trigger: { seconds: 2 },
      });
    } catch (error) {
      console.error('Error sending test notification:', error);
    }
  };
  
  return (
    <ScreenLayout tabName="settings">
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

            {/* Theme Mode */}
            <TouchableOpacity
              style={styles.row}
              onPress={() => setOperationMode(operationMode === 'auto' ? 'manual' : 'auto')}>
                  <View style={styles.leftContent}>
                       <Lightbulb color={colors.textSecondary} size={20} />
                       <View style={styles.textContainer}>
                             <Text style={[textStyles.body, { color: colors.text, fontWeight: '600' }]}>
                               {t('settings.themeMode')}
                             </Text>
                             <Text style={[textStyles.caption, { color: colors.textSecondary }]}>
                               {operationMode === 'auto' ? t('settings.themeModeAuto')  : t('settings.themeModeManual')}
                             </Text>
                       </View>
                  </View>
            </TouchableOpacity>

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
          </View>

          {/* Language */}
          <View style={styles.section}>
            <Text style={[textStyles.h2, styles.sectionTitle, { color: colors.text }]}>
              {t('settings.language.title')}
            </Text>
            
            <TouchableOpacity
              style={styles.row}
              onPress={showLanguageModal}
              activeOpacity={0.8}
            >
              <View style={styles.leftContent}>
                <Languages color={colors.textSecondary} size={20} />
                <View style={styles.textContainer}>
                  <Text style={[textStyles.body, { color: colors.text }]}>
                    {t('settings.language.selectLanguage')}
                  </Text>
                  <Text style={[textStyles.caption, { color: colors.textSecondary }]}>
                    {t('settings.language.currently')}: {language.toUpperCase()}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* Notifications Section */}
          <View style={styles.section}>
            <Text style={[textStyles.h2, styles.sectionTitle, { color: colors.text }]}>
              🔔 {t('notifications.settings.title')}
            </Text>
            <Text style={[textStyles.caption, styles.sectionSubtitle, { color: colors.textSecondary }]}>
              {t('notifications.settings.subtitle')}
            </Text>

            {!notifications.isSupported ? (
              // Уведомления не поддерживаются
              <View style={styles.row}>
                <View style={styles.leftContent}>
                  <BellOff color={colors.textSecondary} size={20} />
                  <View style={styles.textContainer}>
                    <Text style={[textStyles.caption, { color: colors.textSecondary, fontStyle: 'italic' }]}>
                      {t('notifications.settings.notSupported')}
                    </Text>
                  </View>
                </View>
              </View>
            ) : !notifications.hasPermission ? (
              // Нужно разрешение
              <View>
                <View style={styles.row}>
                  <View style={styles.leftContent}>
                    <Bell color={colors.textSecondary} size={20} />
                    <View style={styles.textContainer}>
                      <Text style={[textStyles.body, { color: colors.text }]}>
                        {t('notifications.settings.permissionNeeded')}
                      </Text>
                      <Text style={[textStyles.caption, { color: colors.textSecondary }]}>
                        {t('notifications.settings.permissionDesc')}
                      </Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: colors.primary }]}
                  onPress={handleRequestPermission}
                  activeOpacity={0.8}
                >
                  <Text style={[textStyles.body, { color: '#fff', fontWeight: '600' }]}>
                    {t('notifications.settings.requestPermission')}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              // Разрешение есть - показываем настройки
              <View>
                {/* Master Toggle */}
                <View style={styles.row}>
                  <View style={styles.leftContent}>
                    <Bell color={colors.textSecondary} size={20} />
                    <View style={styles.textContainer}>
                      <Text style={[textStyles.body, { color: colors.text }]}>
                        {t('notifications.settings.masterToggle')}
                      </Text>
                      <Text style={[textStyles.caption, { color: colors.textSecondary }]}>
                        {t('notifications.settings.masterToggleDesc')}
                      </Text>
                    </View>
                  </View>
                  <Switch
                    value={notifications.isEnabled}
                    onValueChange={notifications.toggleNotifications}
                    trackColor={{ false: colors.surfaceVariant, true: colors.primary }}
                    thumbColor="#fff"
                  />
                </View>

                {/* Task Notifications */}
                {notifications.isEnabled && (
                  <View style={[styles.row, { paddingLeft: 40 }]}>
                    <View style={styles.leftContent}>
                      <View style={styles.textContainer}>
                        <Text style={[textStyles.body, { color: colors.text }]}>
                          {t('notifications.settings.taskReminders')}
                        </Text>
                        <Text style={[textStyles.caption, { color: colors.textSecondary }]}>
                          {t('notifications.settings.taskRemindersDesc')}
                        </Text>
                      </View>
                    </View>
                    <Switch
                      value={notifications.taskNotificationsEnabled}
                      onValueChange={notifications.toggleTaskNotifications}
                      trackColor={{ false: colors.surfaceVariant, true: colors.primary }}
                      thumbColor="#fff"
                    />
                  </View>
                )}

                {/* Reminder Days Info */}
                {notifications.isEnabled && notifications.taskNotificationsEnabled && (
                  <View style={[styles.infoBox, { backgroundColor: colors.surfaceVariant }]}>
                    <Text style={[textStyles.caption, { color: colors.textSecondary }]}>
                      {t('notifications.settings.reminderDays')}
                    </Text>
                    <Text style={[textStyles.caption, { color: colors.text, marginTop: 4 }]}>
                      • {t('notifications.settings.days3Before')} ({formatTime(notificationTimes.morning)}) {'\n'}
                      • {t('notifications.settings.days1Before')} ({formatTime(notificationTimes.evening)}) {'\n'}
                      • {t('notifications.settings.onDueDate')} ({formatTime(notificationTimes.morning)})
                    </Text>
                  </View>
                )}

                {/* Notification Times Info */}
                {notifications.isEnabled && (
                  <View style={[styles.row, { backgroundColor: colors.surfaceVariant, opacity: 0.9 }]}>
                    <View style={styles.leftContent}>
                      <Clock color={colors.textSecondary} size={20} />
                      <View style={styles.textContainer}>
                        <Text style={[textStyles.body, { color: colors.text }]}>
                          {t('notifications.settings.notificationTimes')}
                        </Text>
                        <Text style={[textStyles.caption, { color: colors.textSecondary, marginTop: 4 }]}>
                          {t('notifications.settings.notificationTimesDesc')}
                        </Text>
                        <Text style={[textStyles.caption, { color: colors.text, marginTop: 6 }]}>
                          ☀️ {t('notifications.settings.morningTime')}: {formatTime(notificationTimes.morning)}{'\n'}
                          🌙 {t('notifications.settings.eveningTime')}: {formatTime(notificationTimes.evening)}
                        </Text>
                        <Text style={[textStyles.caption, { color: colors.textSecondary, marginTop: 4, fontStyle: 'italic' }]}>
                          {t('notifications.settings.defaultTimes')}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}

                {/* Coming Soon sections */}
                {notifications.isEnabled && (
                  <View>
                    <View style={[styles.row, { opacity: 0.5 }]}>
                      <View style={styles.leftContent}>
                        <Sunset color={colors.textSecondary} size={20} />
                        <View style={styles.textContainer}>
                          <Text style={[textStyles.body, { color: colors.text }]}>
                            {t('notifications.settings.routineReminders')} <Text style={[textStyles.caption]}>({t('notifications.settings.comingSoon')})</Text>
                          </Text>
                          <Text style={[textStyles.caption, { color: colors.textSecondary }]}>
                            {t('notifications.settings.routineRemindersDesc')}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View style={[styles.row, { opacity: 0.5 }]}>
                      <View style={styles.leftContent}>
                        <Hand color={colors.textSecondary} size={20} />
                        <View style={styles.textContainer}>
                          <Text style={[textStyles.body, { color: colors.text }]}>
                            {t('notifications.settings.surprisePrompts')} <Text style={[textStyles.caption]}>({t('notifications.settings.comingSoon')})</Text>
                          </Text>
                          <Text style={[textStyles.caption, { color: colors.textSecondary }]}>
                            {t('notifications.settings.surprisePromptsDesc')}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                )}

                {/* Test Notification Button */}
                {notifications.isEnabled && (
                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: colors.surfaceVariant, marginTop: 12 }]}
                    onPress={sendTestNotification}
                    activeOpacity={0.8}
                  >
                    <Text style={[textStyles.body, { color: colors.text }]}>
                      {t('notifications.settings.testNotification')}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>

          {/* Data Management */}
          <View style={styles.section}>
            <ResetDataComponent />
          </View>

          {/* Contact & Support */}
          <View style={styles.section}>
            <Text style={[textStyles.h2, styles.sectionTitle, { color: colors.text }]}>
              {t('settings.contactSupport')}
            </Text>

            <TouchableOpacity
              style={styles.row}
              onPress={() => Linking.openURL('https://feya-bloom-studio.lovable.app/')}
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
              onPress={() => Linking.openURL('https://github.com/FeyaBloom/Magic-Snooze')}
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

          {/* Debug Section */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.row}
              onPress={() => router.push('/debug')}
              activeOpacity={0.8}
            >
              <View style={styles.leftContent}>
                <Bug color={colors.textSecondary} size={20} />
                <View style={styles.textContainer}>
                  <Text style={[textStyles.body, { color: colors.text }]}>
                    Debug: View Storage
                  </Text>
                  <Text style={[textStyles.caption, { color: colors.textSecondary }]}>
                    View all stored data & generate mock data
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
      </ContentContainer>
    </ScreenLayout>
  );
}