import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Linking, Switch } from 'react-native';
import { useTheme } from '@/components/ThemeProvider';
import { createSettingsStyles } from '@/styles/settings';
import { Globe, Heart, Languages, LogIn, User2 } from 'lucide-react-native';

export default function SettingsTab() {
  const { colors, themeName, toggleTheme } = useTheme();
  const styles = createSettingsStyles(colors);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Settings & About ⚙️</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Preferences</Text>

        <View style={styles.row}>
          <View>
            <Text style={styles.label}>Dark Theme</Text>
            <Text style={styles.description}>
              Switch between light and dark mode
            </Text>
          </View>
          <Switch
            value={themeName === 'dark'}
            onValueChange={toggleTheme}
          />
        </View>

        <TouchableOpacity style={styles.row}>
          <View>
            <Text style={styles.label}>Language</Text>
            <Text style={styles.description}>Currently: English</Text>
          </View>
          <Languages color={colors.textSecondary} size={20} />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>

        <TouchableOpacity style={styles.row}>
          <View>
            <Text style={styles.label}>Connect Google Account</Text>
            <Text style={styles.description}>Sync progress and tasks</Text>
          </View>
          <LogIn color={colors.textSecondary} size={20} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.row}>
          <View>
            <Text style={styles.label}>Manage Profile</Text>
            <Text style={styles.description}>View or edit user details</Text>
          </View>
          <User2 color={colors.textSecondary} size={20} />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact & Support</Text>

        <TouchableOpacity
          style={styles.row}
          onPress={() => Linking.openURL('https://t.me/feya_bloom')}
        >
          <View>
            <Text style={styles.label}>Contact the Creator</Text>
            <Text style={styles.description}>t.me/feya_bloom</Text>
          </View>
          <Globe color={colors.textSecondary} size={20} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.row}
          onPress={() => Linking.openURL('https://www.buymeacoffee.com/feyabloom')}
        >
          <View>
            <Text style={styles.label}>Support this app</Text>
            <Text style={styles.description}>Send a magical donation 💰</Text>
          </View>
          <Heart color={colors.textSecondary} size={20} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
