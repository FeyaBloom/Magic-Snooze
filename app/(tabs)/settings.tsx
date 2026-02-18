import React, { useEffect } from 'react';
import { Text, TouchableOpacity, Linking, Switch, View, Alert, Share } from 'react-native';
import {
  Globe,
  Heart,
  Languages,
  Paintbrush,
  Bug,
  Lightbulb,
  Sunset,
  Hand,
  Bell,
  BellOff,
  Clock,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { ScreenLayout } from '@/components/ScreenLayout';
import { ContentContainer } from '@/components/ContentContainer';
import { useTheme } from '@/components/ThemeProvider';
import { useLanguage } from '@/components/LanguageProvider';
import ResetDataComponent from '@/components/ResetData';
import { useTranslation } from 'react-i18next';
import { useTextStyles } from '@/hooks/useTextStyles';
import { createSettingsStyles } from '@/styles/settings';
import { TOUCHABLE_CONFIG } from '@/styles/touchable';
import { useNotifications } from '@/hooks/useNotifications';
import * as Notifications from 'expo-notifications';

export default function SettingsScreen() {
  const router = useRouter();
  const { colors, toggleMessyMode, isMessyMode, operationMode, setOperationMode } = useTheme();
  const { language, showLanguageModal } = useLanguage();
  const { t } = useTranslation();
  const textStyles = useTextStyles();
  const styles = createSettingsStyles(colors);
  const notifications = useNotifications();

  // Автоматически выключаем общий тумблер, если оба подтумблера выключены
  useEffect(() => {
    if (notifications.isEnabled && !notifications.tasksEnabled && !notifications.routinesEnabled) {
      notifications.toggle(false);
    }
  }, [notifications.tasksEnabled, notifications.routinesEnabled]);

  // Автоматически включаем оба подтумблера при включении общего тумблера
  useEffect(() => {
    if (notifications.isEnabled && (!notifications.tasksEnabled || !notifications.routinesEnabled)) {
      if (!notifications.tasksEnabled) {
        notifications.toggleTasks(true);
      }
      if (!notifications.routinesEnabled) {
        notifications.toggleRoutines(true);
      }
    }
  }, [notifications.isEnabled]);

  const handleRequestPermission = async () => {
    const granted = await notifications.requestPermission();

    Alert.alert(
      '',
      granted
        ? t('notifications.settings.permissionGranted')
        : t('notifications.settings.permissionDeniedDesc')
    );
  };

  const sendTestNotification = async () => {
    if (!notifications.isSupported) {
      Alert.alert(
        '',
        t('notifications.settings.notSupported')
      );
      return;
    }

    if (!notifications.hasPermission) {
      Alert.alert(
        '',
        t('notifications.settings.permissionNeeded')
      );
      return;
    }

    if (!notifications.isEnabled) {
      Alert.alert(
        '',
        t('notifications.settings.requestPermission')
      );
      return;
    }

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: t('notifications.test.title'),
          body: t('notifications.test.body'),
        },
        trigger: null,
      });

      Alert.alert(
        '',
        t('notifications.settings.testSent')
      );
    } catch (error: any) {
      Alert.alert(
        '',
        t('notifications.test.failed', { message: error.message })
      );
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
            onPress={() => setOperationMode(operationMode === 'auto' ? 'manual' : 'auto')}
            activeOpacity={TOUCHABLE_CONFIG.activeOpacity}
          >
            <View style={styles.leftContent}>
              <Lightbulb color={colors.textSecondary} size={20} />
              <View style={styles.textContainer}>
                <Text style={[textStyles.body, { color: colors.text, fontWeight: '600' }]}>
                  {t('settings.themeMode')}
                </Text>
                <Text style={[textStyles.caption, { color: colors.textSecondary }]}>
                  {operationMode === 'auto'
                    ? t('settings.themeModeAuto')
                    : t('settings.themeModeManual')}
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
            activeOpacity={TOUCHABLE_CONFIG.activeOpacity}
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
            {t('notifications.settings.title')}
          </Text>

          {!notifications.isSupported ? (
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
                activeOpacity={TOUCHABLE_CONFIG.activeOpacity}
              >
                <Text style={[textStyles.body, { color: '#fff', fontWeight: '600' }]}>
                  {t('notifications.settings.requestPermission')}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
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
                  onValueChange={notifications.toggle}
                  trackColor={{ false: colors.textSecondary, true: colors.primary }}
                  thumbColor="#fff"
                />
              </View>

            {/* Task Reminders Info */}
              {notifications.isEnabled && (
                <>
                  {/* Task Notifications Toggle */}
                  <View style={[styles.row, { marginTop: 8 }]}>
                    <View style={styles.leftContent}>
                      <Clock color={colors.textSecondary} size={20} />
                      <View style={styles.textContainer}>
                        <Text style={[textStyles.body, { color: colors.text }]}>
                          {t('notifications.settings.taskReminders')}
                        </Text>
                        <Text style={[textStyles.caption, { color: colors.textSecondary, marginTop: 4 }]}>
                          {t('notifications.settings.taskRemindersDesc')}
                        </Text>
                        <Text style={[textStyles.caption, { color: colors.text, marginTop: 6 }]}>
                          • {t('notifications.settings.days3Before')} (07:00){'\n'}
                          • {t('notifications.settings.days1Before')} (19:00){'\n'}
                          • {t('notifications.settings.onDueDate')} (07:00)
                        </Text>
                      </View>
                    </View>
                    <Switch
                      value={notifications.tasksEnabled}
                      onValueChange={notifications.toggleTasks}
                      trackColor={{ false: colors.textSecondary, true: colors.primary }}
                      thumbColor="#fff"
                    />
                  </View>

                  {/* Routine Notifications Toggle */}
                  <View style={[styles.row, { marginTop: 8 }]}>
                    <View style={styles.leftContent}>
                      <Sunset color={colors.textSecondary} size={20} />
                      <View style={styles.textContainer}>
                        <Text style={[textStyles.body, { color: colors.text }]}>
                          {t('notifications.settings.routineReminders')}
                        </Text>
                        <Text style={[textStyles.caption, { color: colors.textSecondary, marginTop: 4 }]}>
                          {t('notifications.settings.routineRemindersDesc')}
                        </Text>                        
                      </View>
                    </View>
                    <Switch
                      value={notifications.routinesEnabled}
                      onValueChange={notifications.toggleRoutines}
                      trackColor={{ false: colors.textSecondary, true: colors.primary }}
                      thumbColor="#fff"
                    />
                  </View>
                </>
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
            activeOpacity={TOUCHABLE_CONFIG.activeOpacity}
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

<View style={styles.row}>
  <View style={styles.leftContent}>
    <Heart color={colors.textSecondary} size={20} />
    <View style={styles.textContainer}>
      <Text style={[textStyles.body, { color: colors.text }]}>
        {t('settings.supportApp.title')}
      </Text>
      <Text style={[textStyles.caption, { color: colors.textSecondary, marginTop: 4 }]}>
        {t('settings.supportApp.description')}
      </Text>

  <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
      {[
        { emoji: '⭐️', key: 'starGithub', url: 'https://github.com/FeyaBloom/Magic-Snooze' },
        { emoji: '📋', key: 'leaveReview', url: 'https://play.google.com/store/apps/details?id=YOUR_APP_ID' },
        { emoji: '🐛', key: 'reportBugs', url: 'https://github.com/FeyaBloom/Magic-Snooze/issues' },
        { emoji: '💬', key: 'spreadWord', share: true },
      ].map((btn, i) => (
        <TouchableOpacity
          key={i}
          style={[styles.infoBox, { flex: 1, minWidth: '47%', backgroundColor: colors.surface }]}
          onPress={() => btn.share ? Share.share({ message: t('settings.supportApp.shareMessage') }) : btn.url && Linking.openURL(btn.url)}
          activeOpacity={TOUCHABLE_CONFIG.activeOpacity}
        >
          <Text style={[textStyles.caption, { color: colors.text, textAlign: 'center' }]}>
            {btn.emoji} {t(`settings.supportApp.${btn.key}`)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
    </View>
    </View>
</View>

</View>
        {/* Debug Section 
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.row}
            onPress={() => router.push('/debug')}
            activeOpacity={TOUCHABLE_CONFIG.activeOpacity}
          >
            <View style={styles.leftContent}>
              <Bug color={colors.textSecondary} size={20} />
              <View style={styles.textContainer}>
                <Text style={[textStyles.body, { color: colors.text }]}>
                  {t('debug.title')}
                </Text>
                <Text style={[textStyles.caption, { color: colors.textSecondary }]}>
                  {t('debug.description')}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>*/}

      </ContentContainer>
    </ScreenLayout>
  );
}