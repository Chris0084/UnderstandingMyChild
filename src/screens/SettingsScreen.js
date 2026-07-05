import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Switch,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons'; // structural match with HomeScreen
import {
  getAnalytics,
  setAnalyticsCollectionEnabled,
} from '@react-native-firebase/analytics';

export default function SettingsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [isOptedIn, setIsOptedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load current preference on mount
  useEffect(() => {
    const loadPrivacySetting = async () => {
      try {
        const hasAnswered = await AsyncStorage.getItem('@analytics_consent');
        setIsOptedIn(hasAnswered === 'true');
      } catch (e) {
        console.error('Error loading settings:', e);
      } finally {
        setLoading(false);
      }
    };

    loadPrivacySetting();
  }, []);

  // Handle privacy toggle changes
  const handleToggleSwitch = async newValue => {
    try {
      setIsOptedIn(newValue);
      const analyticsInstance = getAnalytics();
      await setAnalyticsCollectionEnabled(analyticsInstance, newValue);
      await AsyncStorage.setItem(
        '@analytics_consent',
        newValue ? 'true' : 'false',
      );
    } catch (e) {
      console.error('Error saving preference:', e);
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator size="small" color="#4A6159" />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}>
      {/* --- HEADER WITH BACK BUTTON --- */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.placeholderBlock} />
      </View>

      {/* --- SETTINGS CONTENT --- */}
      <Text style={styles.sectionTitle}>Privacy Settings</Text>

      <View style={styles.settingRow}>
        <View style={styles.textContainer}>
          <Text style={styles.settingLabel}>Share Anonymous Usage Data</Text>
          <Text style={styles.settingDescription}>
            Help us improve your app experience with anonymous analytics. Your
            journal entries, text logs, and personal inputs remain 100% private
            and invisible to developers.
          </Text>
        </View>

        <Switch
          trackColor={{ false: '#D1D1D6', true: '#A2B5AF' }}
          thumbColor={isOptedIn ? '#4A6159' : '#F4F4F4'}
          ios_backgroundColor="#D1D1D6"
          onValueChange={handleToggleSwitch}
          value={isOptedIn}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
    borderBottomWidth: 1,
    borderColor: '#EFEFEF',
    backgroundColor: '#FFFFFF',
    marginBottom: 25,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
    letterSpacing: -0.3,
  },
  placeholderBlock: {
    width: 40, // Keeps the title perfectly centered
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  textContainer: {
    flex: 1,
    paddingRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 6,
  },
  settingDescription: {
    fontSize: 13,
    color: '#666666',
    lineHeight: 19,
  },
});
