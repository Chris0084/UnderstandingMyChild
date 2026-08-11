import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Switch,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  getAnalytics,
  setAnalyticsCollectionEnabled,
} from '@react-native-firebase/analytics';
import ChildSettingsCard from '../components/ChildSettingsCard';

const MAX_CHILDREN = 3;
const DEFAULT_COLORS = ['#4A6159', '#2196F3', '#E91E63', '#9C27B0', '#FF9800'];

export default function SettingsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [isOptedIn, setIsOptedIn] = useState(false);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load preferences and children profiles on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const hasAnswered = await AsyncStorage.getItem('@analytics_consent');
        setIsOptedIn(hasAnswered === 'true');

        const savedChildren = await AsyncStorage.getItem('@app_children');
        if (savedChildren) {
          const parsed = JSON.parse(savedChildren);
          const active = parsed.filter(
            c => !c.archived && !c.isArchived && c.isActive !== false,
          );
          setChildren(active);
        }
      } catch (e) {
        console.error('Error loading settings:', e);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Update profile in storage
  const handleUpdateChild = async (childId, updatedChild) => {
    try {
      const updatedList = children.map(c =>
        c.id === childId ? updatedChild : c,
      );
      setChildren(updatedList);

      const rawStored = await AsyncStorage.getItem('@app_children');
      const parsedStored = rawStored ? JSON.parse(rawStored) : [];
      const merged = parsedStored.map(c =>
        c.id === childId ? updatedChild : c,
      );

      await AsyncStorage.setItem('@app_children', JSON.stringify(merged));
    } catch (e) {
      console.error('Error saving updated child data:', e);
    }
  };

  // Add new child profile
  const handleAddChild = async () => {
    if (children.length >= MAX_CHILDREN) return;

    try {
      const rawStored = await AsyncStorage.getItem('@app_children');
      const parsedStored = rawStored ? JSON.parse(rawStored) : [];

      const maxId = parsedStored.reduce((max, child) => {
        const cleanId = String(child.id).replace('child_', '');
        const num = parseInt(cleanId, 10);
        return !isNaN(num) && num > max ? num : max;
      }, 0);

      const nextId = (maxId + 1).toString();

      const newChild = {
        id: nextId,
        name: `Child ${parsedStored.length + 1}`,
        color: DEFAULT_COLORS[parsedStored.length % DEFAULT_COLORS.length],
        isActive: true,
      };

      const updatedList = [...children, newChild];
      setChildren(updatedList);

      const updatedStorage = [...parsedStored, newChild];
      await AsyncStorage.setItem(
        '@app_children',
        JSON.stringify(updatedStorage),
      );
    } catch (e) {
      console.error('Error adding new child:', e);
    }
  };

  // Show warning pop-up before deleting child profile
  const handlePromptDeleteChild = child => {
    Alert.alert(
      'Delete Profile & Data?',
      `Are you sure you want to delete ${child.name}? This will permanently remove this child's profile and all recorded log entries.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Permanently',
          style: 'destructive',
          onPress: () => handleConfirmDeleteChild(child.id),
        },
      ],
    );
  };

  // Execute deletion of child profile
  const handleConfirmDeleteChild = async childId => {
    try {
      const updatedList = children.filter(c => c.id !== childId);
      setChildren(updatedList);

      const rawStored = await AsyncStorage.getItem('@app_children');
      if (rawStored) {
        const parsedStored = JSON.parse(rawStored);
        const filteredStorage = parsedStored.filter(c => c.id !== childId);
        await AsyncStorage.setItem(
          '@app_children',
          JSON.stringify(filteredStorage),
        );
      }

      const currentSelectedId = await AsyncStorage.getItem(
        '@app_selected_child_id',
      );
      if (currentSelectedId === childId && updatedList.length > 0) {
        await AsyncStorage.setItem('@app_selected_child_id', updatedList[0].id);
      }

      const LOGS_STORAGE_KEY = '@app_logs';
      const rawLogs = await AsyncStorage.getItem(LOGS_STORAGE_KEY);

      if (rawLogs) {
        const parsedLogs = JSON.parse(rawLogs);
        const filteredLogs = parsedLogs.filter(log => log.childId !== childId);
        await AsyncStorage.setItem(
          LOGS_STORAGE_KEY,
          JSON.stringify(filteredLogs),
        );
      }

      const allKeys = await AsyncStorage.getAllKeys();
      const childKeys = allKeys.filter(
        key => key.includes(childId) && key !== '@app_children',
      );
      if (childKeys.length > 0) {
        await AsyncStorage.multiRemove(childKeys);
      }
    } catch (e) {
      console.error('Error deleting child profile and data:', e);
    }
  };

  // Privacy switch handler
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
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View
          style={[
            styles.container,
            { paddingTop: insets.top, paddingBottom: insets.bottom },
          ]}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled">
            {/* Header */}
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

            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
              Privacy Settings
            </Text>
            <View style={styles.settingRow}>
              <View style={styles.textContainer}>
                <Text style={styles.settingLabel}>
                  Share Anonymous Usage Data
                </Text>
                <Text style={styles.settingDescription}>
                  Help us improve your app experience with anonymous analytics.
                  Your journal entries, text logs, and personal inputs remain
                  100% private and invisible to developers.
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

            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
              Child Profiles
            </Text>

            {children.map((child, index) => (
              <ChildSettingsCard
                key={child.id}
                child={child}
                onSave={handleUpdateChild}
                onDelete={handlePromptDeleteChild}
                canDelete={index > 0}
              />
            ))}

            {children.length < MAX_CHILDREN && (
              <TouchableOpacity
                style={styles.addChildButton}
                onPress={handleAddChild}
                activeOpacity={0.7}>
                <Ionicons name="add-circle-outline" size={22} color="#4A6159" />
                <Text style={styles.addChildText}>Add Child Profile</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
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
    marginBottom: 16,
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
    width: 40,
  },
  scrollContent: {
    paddingBottom: 500, // High bottom padding ensures scroll space when keyboard opens
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
  addChildButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#4A6159',
    borderStyle: 'dashed',
    marginBottom: 8,
  },
  addChildText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#4A6159',
    marginLeft: 8,
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
