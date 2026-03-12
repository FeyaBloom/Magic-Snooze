/**
 * Android 15 BOOT_COMPLETED compliance plugin.
 *
 * Removes BOOT_COMPLETED-related broadcast handling from the final Android
 * manifest to prevent boot-time execution paths that could trigger restricted
 * foreground service starts (e.g. microphone/mediaPlayback).
 */

const { withAndroidManifest } = require('@expo/config-plugins');

const RECEIVE_BOOT_COMPLETED = 'android.permission.RECEIVE_BOOT_COMPLETED';
const BOOT_ACTIONS = new Set([
  'android.intent.action.BOOT_COMPLETED',
  'android.intent.action.REBOOT',
  'android.intent.action.QUICKBOOT_POWERON',
  'com.htc.intent.action.QUICKBOOT_POWERON',
]);

const NOTIFICATIONS_RECEIVER_CLASS = 'expo.modules.notifications.service.NotificationsService';

const removeBootPermission = (manifest) => {
  const permissions = manifest['uses-permission'];
  if (!Array.isArray(permissions)) {
    return;
  }

  manifest['uses-permission'] = permissions.filter(
    (entry) => entry?.$?.['android:name'] !== RECEIVE_BOOT_COMPLETED
  );
};

const stripBootActionsFromReceiver = (receiver) => {
  const intentFilters = receiver['intent-filter'];
  if (!Array.isArray(intentFilters)) {
    return;
  }

  const updated = intentFilters
    .map((filter) => {
      const actions = Array.isArray(filter.action)
        ? filter.action.filter((action) => !BOOT_ACTIONS.has(action?.$?.['android:name']))
        : filter.action;

      return {
        ...filter,
        action: actions,
      };
    })
    .filter((filter) => {
      if (Array.isArray(filter.action)) {
        return filter.action.length > 0;
      }
      return true;
    });

  if (updated.length > 0) {
    receiver['intent-filter'] = updated;
  } else {
    delete receiver['intent-filter'];
  }
};

const withAndroid15BootCompliance = (config) => {
  return withAndroidManifest(config, (cfg) => {
    const manifest = cfg.modResults.manifest;
    const app = manifest.application?.[0];

    if (!manifest.$) {
      manifest.$ = {};
    }
    if (!manifest.$['xmlns:tools']) {
      manifest.$['xmlns:tools'] = 'http://schemas.android.com/tools';
    }

    removeBootPermission(manifest);

    // Remove the BOOT_COMPLETED permission contributed by library manifests.
    const permissions = Array.isArray(manifest['uses-permission'])
      ? manifest['uses-permission']
      : [];
    const hasRemoveDirective = permissions.some(
      (entry) =>
        entry?.$?.['android:name'] === RECEIVE_BOOT_COMPLETED &&
        entry?.$?.['tools:node'] === 'remove'
    );
    if (!hasRemoveDirective) {
      permissions.push({
        $: {
          'android:name': RECEIVE_BOOT_COMPLETED,
          'tools:node': 'remove',
        },
      });
    }
    manifest['uses-permission'] = permissions;

    if (!app || !Array.isArray(app.receiver)) {
      if (app) {
        app.receiver = [];
      } else {
        return cfg;
      }
    }

    app.receiver = app.receiver
      .filter((receiver) => {
        const name = receiver?.$?.['android:name'] || '';
        // Remove our old custom boot receiver and any pre-existing override so
        // we can inject a single deterministic declaration below.
        return !name.includes('BootBroadcastReceiver') && name !== NOTIFICATIONS_RECEIVER_CLASS;
      })
      .map((receiver) => {
        stripBootActionsFromReceiver(receiver);
        return receiver;
      });

    // Replace expo-notifications receiver declaration without BOOT actions.
    app.receiver.push({
      $: {
        'android:name': NOTIFICATIONS_RECEIVER_CLASS,
        'android:enabled': 'true',
        'android:exported': 'false',
        'tools:node': 'replace',
      },
      'intent-filter': [
        {
          $: {
            'android:priority': '-1',
          },
          action: [
            { $: { 'android:name': 'expo.modules.notifications.NOTIFICATION_EVENT' } },
            { $: { 'android:name': 'android.intent.action.MY_PACKAGE_REPLACED' } },
          ],
        },
      ],
    });

    return cfg;
  });
};

module.exports = withAndroid15BootCompliance;
