/**
 * Expo config plugin: adds a supplementary BOOT_COMPLETED BroadcastReceiver.
 *
 * expo-notifications ships its own NotificationsService receiver for BOOT_COMPLETED,
 * but this explicit receiver provides a clear, auditable entry point and delegates
 * directly to ExpoSchedulingDelegate.setupScheduledNotifications(), which uses
 * AlarmManager internally — no restricted foreground service is started, making
 * this fully compliant with Android 15's BOOT_COMPLETED restrictions.
 */

const { withAndroidManifest, withDangerousMod } = require('@expo/config-plugins');
const path = require('path');
const fs = require('fs');

const RECEIVER_CLASS = 'BootBroadcastReceiver';
const APP_PACKAGE = 'com.feya_bloom.magic_snooze';

// ---------------------------------------------------------------------------
// Kotlin source written into the Android project during prebuild / EAS build.
// ---------------------------------------------------------------------------
const buildKotlinSource = (pkg) => `package ${pkg}

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import expo.modules.notifications.service.NotificationsService
import expo.modules.notifications.service.delegates.ExpoSchedulingDelegate
import kotlin.concurrent.thread

/**
 * Supplementary BOOT_COMPLETED receiver.
 *
 * Reschedules all pending expo-notifications alarms via AlarmManager after a
 * device reboot without starting any foreground service — Android 15 compliant.
 */
class ${RECEIVER_CLASS} : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent?) {
        val action = intent?.action ?: return
        if (action !in NotificationsService.SETUP_ACTIONS) return

        // goAsync() keeps the receiver alive while rescheduling happens on a
        // background thread (same pattern as expo-notifications' own receiver).
        val pendingResult = goAsync()
        thread {
            try {
                ExpoSchedulingDelegate(context).setupScheduledNotifications()
            } catch (_: Throwable) {
                // expo-notifications internal API changed — the JS-layer AppState
                // listener will reschedule alarms the next time the app opens.
            } finally {
                pendingResult.finish()
            }
        }
    }
}
`;

// ---------------------------------------------------------------------------
// Plugin
// ---------------------------------------------------------------------------
const withBootReceiver = (config) => {
  // 1. Inject receiver declaration into AndroidManifest.xml
  config = withAndroidManifest(config, (cfg) => {
    const application = cfg.modResults.manifest.application?.[0];
    if (!application) return cfg;

    if (!Array.isArray(application.receiver)) {
      application.receiver = [];
    }

    const alreadyAdded = application.receiver.some((r) =>
      r.$?.['android:name']?.includes(RECEIVER_CLASS)
    );

    if (!alreadyAdded) {
      application.receiver.push({
        $: {
          'android:name': `.${RECEIVER_CLASS}`,
          'android:enabled': 'true',
          'android:exported': 'true',
          'android:directBootAware': 'false',
        },
        'intent-filter': [
          {
            action: [
              { $: { 'android:name': 'android.intent.action.BOOT_COMPLETED' } },
              { $: { 'android:name': 'android.intent.action.QUICKBOOT_POWERON' } },
              { $: { 'android:name': 'com.htc.intent.action.QUICKBOOT_POWERON' } },
            ],
          },
        ],
      });
    }

    return cfg;
  });

  // 2. Write BootBroadcastReceiver.kt into the Android source tree
  config = withDangerousMod(config, [
    'android',
    (cfg) => {
      const packagePath = APP_PACKAGE.replace(/\./g, '/');
      const filePath = path.join(
        cfg.modRequest.platformProjectRoot,
        'app',
        'src',
        'main',
        'java',
        packagePath,
        `${RECEIVER_CLASS}.kt`
      );

      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(filePath, buildKotlinSource(APP_PACKAGE));
      return cfg;
    },
  ]);

  return config;
};

module.exports = withBootReceiver;
