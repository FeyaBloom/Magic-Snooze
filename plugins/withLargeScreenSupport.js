/**
 * Large-screen support plugin.
 *
 * Ensures the app complies with Google's large-screen and foldable-device
 * requirements by:
 *   1. Removing any `android:screenOrientation` lock from the main Activity so
 *      the system can rotate freely on tablets, foldables and ChromeOS.
 *   2. Explicitly setting `android:resizableActivity="true"` so the app can
 *      run in multi-window mode on large-screen devices.
 *
 * References:
 *   https://developer.android.com/guide/topics/large-screens/large-screen-cookbook
 *   https://developer.android.com/guide/topics/large-screens/multi-window-support
 */

const { withAndroidManifest } = require('@expo/config-plugins');

const withLargeScreenSupport = (config) => {
  return withAndroidManifest(config, (cfg) => {
    const manifest = cfg.modResults.manifest;
    const app = manifest.application?.[0];
    if (!app || !Array.isArray(app.activity)) {
      return cfg;
    }

    app.activity = app.activity.map((activity) => {
      const attrs = activity.$ || {};

      // Remove orientation lock — lets the system handle rotation on any
      // screen size.  Expo sets this from app.json "orientation": "portrait".
      delete attrs['android:screenOrientation'];

      // Mark the app as resizable so it can participate in multi-window on
      // tablets, foldables and ChromeOS.
      attrs['android:resizableActivity'] = 'true';

      activity.$ = attrs;
      return activity;
    });

    return cfg;
  });
};

module.exports = withLargeScreenSupport;
