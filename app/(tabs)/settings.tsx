import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Linking, Switch, SafeAreaView } from 'react-native';
import { useTheme } from '@/components/ThemeProvider';
import { LinearGradient } from 'expo-linear-gradient';
import { createSettingsStyles } from '@/styles/settings';
import { Globe, Heart, Languages, LogIn, User2, Paintbrush } from 'lucide-react-native';
import {FloatingBackground} from "@/components/MagicalFeatures";

export default function SettingsTab() {
 // const { colors, themeName, toggleTheme } = useTheme();
 
const { colors, currentTheme, setTheme, toggleMessyMode } = useTheme();
   const styles = createSettingsStyles(colors);
  return (

    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={colors.background}
        style={styles.gradient}>

          <FloatingBackground />

    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Settings & About ⚙️</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Preferences</Text>

        <View style={styles.row}>
          <View>
            <Text style={styles.label}>Messy mode</Text>
            <Text style={styles.description}>
              Shuffle colors of the current theme
            </Text>
          </View>
          <TouchableOpacity
                  style={styles.themeButton}
                  onPress={toggleMessyMode}
                >
                  <Paintbrush color={colors.textSecondary} size={20}/>
                </TouchableOpacity>
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
          onPress={() => Linking.openURL('https://portfolio-feya-bloom.webflow.io/')}
        >
          <View>
            <Text style={styles.label}>Contact the Creator</Text>
            <Text style={styles.description}>Text me</Text>
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
</LinearGradient>
</SafeAreaView>
  );
}
