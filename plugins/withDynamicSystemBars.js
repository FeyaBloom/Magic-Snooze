const fs = require('fs');
const path = require('path');
const { withDangerousMod, withMainApplication } = require('@expo/config-plugins');

const MODULE_NAME = 'DynamicSystemBars';

function createModuleSource(packageName) {
  return `package ${packageName}.systembars

import androidx.core.view.WindowInsetsControllerCompat
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class ${MODULE_NAME}Module(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
  override fun getName(): String = "${MODULE_NAME}"

  @ReactMethod
  fun setNavigationBarIconsDark(darkIcons: Boolean) {
    val activity = reactApplicationContext.getCurrentActivity() ?: return

    activity.runOnUiThread {
      val window = activity.window ?: return@runOnUiThread
      val controller = WindowInsetsControllerCompat(window, window.decorView)
      controller.isAppearanceLightNavigationBars = darkIcons
    }
  }
}
`;
}

function createPackageSource(packageName) {
  return `package ${packageName}.systembars

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class ${MODULE_NAME}Package : ReactPackage {
  override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
    return listOf(${MODULE_NAME}Module(reactContext))
  }

  override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
    return emptyList()
  }
}
`;
}

function withDynamicSystemBarsSources(config) {
  return withDangerousMod(config, [
    'android',
    async (cfg) => {
      const packageName = cfg.android?.package;
      if (!packageName) {
        return cfg;
      }

      const projectRoot = cfg.modRequest.platformProjectRoot;
      const kotlinDir = path.join(
        projectRoot,
        'app',
        'src',
        'main',
        'java',
        ...packageName.split('.'),
        'systembars'
      );

      fs.mkdirSync(kotlinDir, { recursive: true });

      fs.writeFileSync(
        path.join(kotlinDir, `${MODULE_NAME}Module.kt`),
        createModuleSource(packageName),
        'utf8'
      );

      fs.writeFileSync(
        path.join(kotlinDir, `${MODULE_NAME}Package.kt`),
        createPackageSource(packageName),
        'utf8'
      );

      return cfg;
    },
  ]);
}

function withDynamicSystemBarsMainApplication(config) {
  return withMainApplication(config, (cfg) => {
    if (cfg.modResults.language !== 'kt') {
      return cfg;
    }

    const packageName = cfg.android?.package;
    if (!packageName) {
      return cfg;
    }

    let contents = cfg.modResults.contents;
    const importLine = `import ${packageName}.systembars.${MODULE_NAME}Package`;

    if (!contents.includes(importLine)) {
      contents = contents.replace('class MainApplication', `${importLine}\n\nclass MainApplication`);
    }

    if (!contents.includes(`packages.add(${MODULE_NAME}Package())`)) {
      if (contents.includes('return packages')) {
        contents = contents.replace(
          'return packages',
          `packages.add(${MODULE_NAME}Package())\n      return packages`
        );
      }
    }

    cfg.modResults.contents = contents;
    return cfg;
  });
}

module.exports = function withDynamicSystemBars(config) {
  config = withDynamicSystemBarsSources(config);
  config = withDynamicSystemBarsMainApplication(config);
  return config;
};
