const { withAndroidManifest } = require('@expo/config-plugins');

const MAIN_ACTIVITY = '.MainActivity';
const MLKIT_ACTIVITY = 'com.google.mlkit.vision.codescanner.internal.GmsBarcodeScanningDelegateActivity';

function ensureToolsNamespace(manifest) {
  if (!manifest.$) {
    manifest.$ = {};
  }
  if (!manifest.$['xmlns:tools']) {
    manifest.$['xmlns:tools'] = 'http://schemas.android.com/tools';
  }
}

function removeOrientation(activity) {
  if (activity?.$?.['android:screenOrientation']) {
    delete activity.$['android:screenOrientation'];
  }
}

module.exports = function withLargeScreenOrientationCompliance(config) {
  return withAndroidManifest(config, (cfg) => {
    const manifest = cfg.modResults.manifest;
    const app = manifest.application?.[0];

    if (!app) {
      return cfg;
    }

    ensureToolsNamespace(manifest);

    const activities = Array.isArray(app.activity) ? app.activity : [];

    for (const activity of activities) {
      const name = activity?.$?.['android:name'];
      if (name === MAIN_ACTIVITY) {
        removeOrientation(activity);
      }
    }

    const hasMlKitOverride = activities.some(
      (activity) => activity?.$?.['android:name'] === MLKIT_ACTIVITY
    );

    if (!hasMlKitOverride) {
      activities.push({
        $: {
          'android:name': MLKIT_ACTIVITY,
          'tools:node': 'merge',
          'tools:remove': 'android:screenOrientation',
        },
      });
    } else {
      for (const activity of activities) {
        if (activity?.$?.['android:name'] === MLKIT_ACTIVITY) {
          delete activity.$['android:screenOrientation'];
          activity.$['tools:node'] = 'merge';
          activity.$['tools:remove'] = 'android:screenOrientation';
        }
      }
    }

    app.activity = activities;
    return cfg;
  });
};
