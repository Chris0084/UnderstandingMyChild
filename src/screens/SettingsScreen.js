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

// Firebase Imports
import firestore from '@react-native-firebase/firestore';
import {
  getAnalytics,
  setAnalyticsCollectionEnabled,
} from '@react-native-firebase/analytics';
import { getAuth, onAuthStateChanged } from '@react-native-firebase/auth';

// Services
import {
  createHousehold,
  joinHouseholdWithCode,
  migrateLocalDataToCloud,
  pullCloudDataToLocal,
  saveOrUpdateChild,
} from '../services/firestoreService';
import { signInUser, signOutUser, registerUser } from '../services/authService';

// Custom Components
import HouseholdInviteModal from '../components/HouseholdInviteModal';
import AccountSyncSection from '../components/AccountSyncSection';
import ChildSettingsCard from '../components/ChildSettingsCard';

const MAX_CHILDREN = 3;
const DEFAULT_COLORS = ['#4A6159', '#2196F3', '#E91E63', '#9C27B0', '#FF9800'];

export default function SettingsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [isOptedIn, setIsOptedIn] = useState(false);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isInviteModalVisible, setIsInviteModalVisible] = useState(false);
  const [inviteModalTab, setInviteModalTab] = useState('share'); // 'share' | 'join'
  const [currentUser, setCurrentUser] = useState(null);
  const [householdId, setHouseholdId] = useState(null);
  const [inviteCode, setInviteCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const authInstance = getAuth();

    const unsubscribe = onAuthStateChanged(authInstance, async user => {
      setCurrentUser(user);

      if (user) {
        try {
          const userDoc = await firestore()
            .collection('users')
            .doc(user.uid)
            .get();

          if (userDoc.exists() && userDoc.data()?.householdId) {
            const hId = userDoc.data().householdId;
            setHouseholdId(hId);

            const hDoc = await firestore()
              .collection('households')
              .doc(hId)
              .get();

            if (hDoc.exists()) {
              setInviteCode(hDoc.data()?.inviteCode || '');
            }
          }
        } catch (e) {
          console.error('Error loading cloud user profile:', e);
        }
      } else {
        setHouseholdId(null);
        setInviteCode('');
      }
    });

    return () => unsubscribe();
  }, []);
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
  // ✅ Add missing modal handler referenced in AccountSyncSection
  const handleOpenInviteModal = tab => {
    setInviteModalTab(tab);
    setIsInviteModalVisible(true);
  };

  // 1. SIGN IN (Existing Account)
  const handleSignIn = async () => {
    const cleanEmail = email ? email.trim() : '';
    const cleanPassword = password ? password.trim() : '';

    if (!cleanEmail || !cleanPassword) {
      Alert.alert('Missing Info', 'Please enter both an email and password.');
      return;
    }

    try {
      const user = await signInUser(cleanEmail, cleanPassword);

      // Get existing household ID
      const userDoc = await firestore().collection('users').doc(user.uid).get();
      let currentHId = userDoc.exists ? userDoc.data()?.householdId : null;

      if (!currentHId) {
        const result = await createHousehold(user.uid);
        currentHId = result.householdId;
      }

      setHouseholdId(currentHId);
      await AsyncStorage.setItem('@user_household_id', currentHId);

      // Pull Firestore records and write directly to @app_children & @app_logs
      const result = await pullCloudDataToLocal(currentHId);

      setPassword('');
      Alert.alert(
        'Signed In',
        `Synced \({result.logsCount} log(s) and\){result.childrenCount} child profile(s)!`,
      );
    } catch (e) {
      Alert.alert('Sign In Failed', e.message);
    }
  };

  // 2. CREATE ACCOUNT (New Account)
  const handleRegister = async () => {
    const cleanEmail = email ? email.trim() : '';
    const cleanPassword = password ? password.trim() : '';

    console.log('--- STARTING MIGRATION ---');
    const rawChildren = await AsyncStorage.getItem('@app_children');
    const rawLogs = await AsyncStorage.getItem('@app_logs');
    console.log('Local Children found:', rawChildren);
    console.log('Local Logs found:', rawLogs);

    if (!cleanEmail || !cleanPassword) {
      Alert.alert('Missing Info', 'Please enter both an email and password.');
      return;
    }

    try {
      const user = await registerUser(cleanEmail, cleanPassword);

      // Create a new household for the new user
      const result = await createHousehold(user.uid);
      setHouseholdId(result.householdId);
      setInviteCode(result.inviteCode);

      await migrateLocalDataToCloud(result.householdId);
      setPassword('');
      Alert.alert('Success', 'Account created successfully!');
    } catch (e) {
      Alert.alert('Registration Failed', e.message);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();

      // Wipe AsyncStorage so navigating to reporting/edit pages won't show old logs
      await AsyncStorage.removeItem('@app_logs');
      await AsyncStorage.removeItem('@app_children');
      await AsyncStorage.removeItem('@user_household_id');

      Alert.alert('Signed Out', 'You have been signed out.');
    } catch (e) {
      Alert.alert('Sign Out Failed', e.message);
    }
  };

  const handleJoinCodeSubmit = async enteredCode => {
    if (!currentUser) {
      Alert.alert(
        'Sign In Required',
        'Please sign in before joining a household.',
      );
      return;
    }
    if (!enteredCode || enteredCode.length < 6) {
      Alert.alert('Invalid Code', 'Please enter a valid 6-character code.');
      return;
    }

    try {
      // 1. Delegate database lookup & membership update to firestoreService
      const { householdId: targetHouseholdId, inviteCode: validCode } =
        await joinHouseholdWithCode(currentUser.uid, enteredCode);

      // 2. Update local state
      setHouseholdId(targetHouseholdId);
      setInviteCode(validCode);

      // 3. Sync local data to the newly joined household
      await migrateLocalDataToCloud(targetHouseholdId);

      // 4. Close modal & alert success
      setIsInviteModalVisible(false);
      Alert.alert('Connected!', 'Successfully joined the shared household!');
    } catch (e) {
      Alert.alert('Error Joining Household', e.message);
    }
  };
  // Update profile in storage & sync to Firestore
  const handleUpdateChild = async (childId, updatedChild) => {
    try {
      // 1. Fetch cached household ID
      const activeHouseholdId =
        await AsyncStorage.getItem('@user_household_id');

      // 2. Delegate local AsyncStorage save + Firestore cloud sync
      await saveOrUpdateChild(updatedChild, activeHouseholdId);

      // 3. Keep local screen state in sync
      const rawStored = await AsyncStorage.getItem('@app_children');
      if (rawStored) {
        const parsedStored = JSON.parse(rawStored);
        const active = parsedStored.filter(
          c => !c.archived && !c.isArchived && c.isActive !== false,
        );
        setChildren(active);
      }
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

      // Retrieve cached household ID for offline/online sync
      const activeHouseholdId =
        await AsyncStorage.getItem('@user_household_id');

      // Save locally and sync in background
      const updatedList = await saveOrUpdateChild(newChild, activeHouseholdId);
      setChildren(updatedList);
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

  const handleConfirmDeleteChild = async childId => {
    try {
      // 1. Update React local state
      const updatedList = children.filter(c => c.id !== childId);
      setChildren(updatedList);

      // 2. Remove child from local AsyncStorage
      const rawStored = await AsyncStorage.getItem('@app_children');
      if (rawStored) {
        const parsedStored = JSON.parse(rawStored);
        const filteredStorage = parsedStored.filter(c => c.id !== childId);
        await AsyncStorage.setItem(
          '@app_children',
          JSON.stringify(filteredStorage),
        );
      }

      // 3. Fallback selected child selection
      const currentSelectedId = await AsyncStorage.getItem(
        '@app_selected_child_id',
      );
      if (currentSelectedId === childId && updatedList.length > 0) {
        await AsyncStorage.setItem('@app_selected_child_id', updatedList[0].id);
      }

      // 4. Remove child logs from local AsyncStorage
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

      // 5. Remove any leftover child-specific keys from AsyncStorage
      const allKeys = await AsyncStorage.getAllKeys();
      const childKeys = allKeys.filter(
        key => key.includes(childId) && key !== '@app_children',
      );
      if (childKeys.length > 0) {
        await AsyncStorage.multiRemove(childKeys);
      }

      // -------------------------------------------------------------
      // 6. FIRESTORE SYNC (React Native Firebase)
      // -------------------------------------------------------------
      const activeHouseholdId =
        await AsyncStorage.getItem('@user_household_id');

      if (activeHouseholdId && childId) {
        // A. Delete Child document
        await firestore()
          .collection('households')
          .doc(activeHouseholdId)
          .collection('children')
          .doc(childId)
          .delete();

        // B. Query and Batch Delete all logs linked to this child
        const logsSnapshot = await firestore()
          .collection('households')
          .doc(activeHouseholdId)
          .collection('logs')
          .where('childId', '==', childId)
          .get();

        if (!logsSnapshot.empty) {
          const batch = firestore().batch();
          logsSnapshot.forEach(doc => {
            batch.delete(doc.ref);
          });
          await batch.commit();
        }
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

            {/* Account & Cloud Sync Section */}
            <Text style={[styles.sectionTitle, { marginTop: 16 }]}>
              Account & Sync
            </Text>
            <AccountSyncSection
              user={currentUser}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              onSignInPress={handleSignIn}
              onRegisterPress={handleRegister}
              onSignOutPress={handleSignOut}
              onInvitePartnerPress={() => handleOpenInviteModal('share')}
              onEnterInviteCodePress={() => handleOpenInviteModal('join')}
            />

            {/* Privacy Settings Section */}
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

            {/* Child Profiles Section */}
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

      {/* Household Invite Modal */}
      <HouseholdInviteModal
        visible={isInviteModalVisible}
        initialTab={inviteModalTab}
        onClose={() => setIsInviteModalVisible(false)}
        inviteCode={inviteCode || 'N/A'}
        onJoinCodeSubmit={handleJoinCodeSubmit}
      />
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
    paddingBottom: 40,
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
