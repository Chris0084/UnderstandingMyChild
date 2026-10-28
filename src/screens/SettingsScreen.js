// screens/SettingsScreen.js
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
import {
  getAuth,
  onAuthStateChanged,
  signInAnonymously,
} from '@react-native-firebase/auth';

// Services
import {
  createHousehold,
  claimNamedInviteCode,
  pullCloudDataToLocal,
  saveOrUpdateChild,
  migrateLocalDataToCloud,
  verifyHouseholdMembership,
} from '../services/firestoreService';
import {
  configureGoogleSignIn,
  signInWithGoogle,
  signInWithApple,
  signOutUser,
} from '../services/authService';

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
  const [userRole, setUserRole] = useState(null);

  // Initialize Auth & listen to state changes
  useEffect(() => {
    configureGoogleSignIn();

    const authInstance = getAuth();
    const unsubscribe = onAuthStateChanged(authInstance, async user => {
      setCurrentUser(user);

      if (user) {
        try {
          const isValid = await verifyHouseholdMembership(() => {
            setHouseholdId(null);
            setUserRole(null);
            setCurrentUser(null);
            setChildren([
              { id: '1', name: 'Child 1', color: '#4A6159', isActive: true },
            ]);
          });

          if (!isValid) return; // Booted out!

          const userDoc = await firestore()
            .collection('users')
            .doc(user.uid)
            .get();
          const userData = userDoc.exists ? userDoc.data() : null;

          if (userData && userData.householdId) {
            setHouseholdId(userData.householdId);
            setUserRole(userData.role || 'contributor');
          }
        } catch (e) {
          console.error('Error loading cloud user profile:', e);
        }
      } else {
        setHouseholdId(null);
        setUserRole(null);
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

  const handleOpenInviteModal = tab => {
    setInviteModalTab(tab);
    setIsInviteModalVisible(true);
  };

  // 1. SETUP AFTER PRIMARY GOOGLE/APPLE SIGN IN
  const handlePostAuthSetup = async (user, displayNameOverride = null) => {
    try {
      setLoading(true);
      const userDocRef = firestore().collection('users').doc(user.uid);
      // Determine the best available display name
      // (Firebase auth user.displayName, or Apple's first-time name, or fallback)
      const resolvedDisplayName =
        user.displayName || displayNameOverride || 'User';

      // A. Check user's Firestore document
      const userDoc = await firestore().collection('users').doc(user.uid).get();
      let currentHId = userDoc.exists ? userDoc.data()?.householdId : null;

      await AsyncStorage.setItem('@user_name', resolvedDisplayName);

      // Read local storage
      const rawLocalLogs = await AsyncStorage.getItem('@app_logs');
      const localLogs = rawLocalLogs ? JSON.parse(rawLocalLogs) : [];
      const rawLocalChildren = await AsyncStorage.getItem('@app_children');
      const localChildren = rawLocalChildren
        ? JSON.parse(rawLocalChildren)
        : [];
      const hasLocalData = localLogs.length > 0 || localChildren.length > 0;

      // If brand new user with no household document yet
      if (!currentHId) {
        const result = await createHousehold(user.uid);
        currentHId = result.householdId;
        setUserRole('owner');
        setHouseholdId(currentHId);
        await AsyncStorage.setItem('@user_household_id', currentHId);

        // Save user profile document in Firestore including display name
        await userDocRef.set(
          {
            uid: user.uid,
            email: user.email || '',
            displayName: resolvedDisplayName,
            householdId: currentHId,
            role: 'owner',
            createdAt: firestore.FieldValue.serverTimestamp(),
          },
          { merge: true },
        );

        // Upload any existing local logs & children to the new cloud household
        if (hasLocalData) {
          const migration = await migrateLocalDataToCloud(currentHId);
          Alert.alert(
            'Account Created & Synced',
            `Backed up ${migration.logsCount} log(s) and ${migration.childrenCount} child profile(s) to your cloud account!`,
          );
        } else {
          Alert.alert('Welcome!', 'Your account and household are ready.');
        }
        return;
      }

      // Existing household found: Check cloud logs count
      setUserRole(userDoc.data()?.role || 'owner');
      setHouseholdId(currentHId);
      await AsyncStorage.setItem('@user_household_id', currentHId);

      // If existing user doc doesn't have a name saved yet, fill it in
      if (!userDoc.data()?.displayName && resolvedDisplayName) {
        await userDocRef.update({ displayName: resolvedDisplayName });
      }

      const cloudLogsSnapshot = await firestore()
        .collection('households')
        .doc(currentHId)
        .collection('logs')
        .limit(1)
        .get();
      const hasCloudLogs = !cloudLogsSnapshot.empty;

      // SCENARIO 1: Cloud has logs AND phone has local logs (CONFLICT!)
      if (hasCloudLogs && hasLocalData) {
        Alert.alert(
          'Existing Cloud Data Found',
          'This account already has logs in the cloud. Syncing will download your cloud account data and replace the logs currently on this phone. Do you want to proceed?',
          [
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: async () => {
                // Sign out so local data is not overwritten
                await signOutUser();
                setHouseholdId(null);
                setUserRole(null);
                setCurrentUser(null);
              },
            },
            {
              text: 'Replace & Sync',
              style: 'destructive',
              onPress: async () => {
                const syncResult = await pullCloudDataToLocal(currentHId);
                const freshChildren =
                  await AsyncStorage.getItem('@app_children');
                if (freshChildren) setChildren(JSON.parse(freshChildren));
                Alert.alert(
                  'Synced',
                  `Downloaded ${syncResult?.logsCount || 0} cloud log(s).`,
                );
              },
            },
          ],
        );
        return;
      }

      // SCENARIO 2: Cloud is empty, but phone HAS local data -> Upload to cloud
      if (!hasCloudLogs && hasLocalData) {
        const migration = await migrateLocalDataToCloud(currentHId);
        Alert.alert(
          'Data Synced to Cloud',
          `Uploaded ${migration.logsCount} log(s) and ${migration.childrenCount} child profile(s) to your cloud household.`,
        );
        return;
      }

      // SCENARIO 3: Cloud has data, phone is empty (or both are empty) -> Download from cloud
      const syncResult = await pullCloudDataToLocal(currentHId);
      const freshChildren = await AsyncStorage.getItem('@app_children');
      if (freshChildren) setChildren(JSON.parse(freshChildren));
      Alert.alert(
        'Signed In',
        `Welcome back! Synced ${syncResult?.logsCount || 0} log(s).`,
      );
    } catch (e) {
      console.error('Post-auth setup error:', e);
      Alert.alert('Error Syncing Account', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const result = await signInWithGoogle();
    if (result.success) {
      await handlePostAuthSetup(result.user);
    } else if (result.error) {
      Alert.alert('Google Sign-In Failed', result.error);
    }
  };

  const handleAppleSignIn = async () => {
    const result = await signInWithApple();
    if (result.success) {
      await handlePostAuthSetup(result.user, result.displayName);
    } else if (result.error) {
      Alert.alert('Apple Sign-In Failed', result.error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
      await AsyncStorage.multiRemove([
        '@app_logs',
        '@app_children',
        '@user_household_id',
        '@user_role',
        '@user_name',
      ]);
      setHouseholdId(null);
      setUserRole(null);
      setCurrentUser(null);
      setChildren([
        { id: '1', name: 'Child 1', color: '#4A6159', isActive: true },
      ]);
      Alert.alert('Signed Out', 'You have been signed out.');
    } catch (e) {
      Alert.alert('Sign Out Failed', e.message);
    }
  };

  // 2. CONTRIBUTOR JOINS HOUSEHOLD WITH SINGLE-USE CODE
  const handleJoinCodeSubmit = async enteredCode => {
    let tempUserCreated = null;
    const authInstance = getAuth();

    try {
      setLoading(true);

      let targetUser = currentUser;
      if (!targetUser) {
        const userCredential = await signInAnonymously(authInstance);
        targetUser = userCredential.user;
        tempUserCreated = targetUser;
      }

      // 👈 Use explicit claimResult object
      const claimResult = await claimNamedInviteCode(targetUser, enteredCode);
      const joinedHId = claimResult.householdId;
      const joinedName = claimResult.assignedToName || 'Contributor';

      setHouseholdId(joinedHId);
      setUserRole('contributor');
      setCurrentUser(targetUser);
      setIsInviteModalVisible(false);

      await AsyncStorage.setItem('@user_household_id', joinedHId);
      await AsyncStorage.setItem('@user_role', 'contributor');
      await AsyncStorage.setItem('@user_name', joinedName);

      // Pass 'contributor' so it ONLY pulls children profiles, NOT household logs!
      const result = await pullCloudDataToLocal(joinedHId, 'contributor');

      // Refresh local children state
      const rawStored = await AsyncStorage.getItem('@app_children');
      if (rawStored) {
        setChildren(JSON.parse(rawStored));
      }

      Alert.alert(
        'Connected!',
        `Joined as ${joinedName}! Loaded ${result?.childrenCount || 0} child profile(s).`,
      );
    } catch (e) {
      console.error('Error claiming invite code:', e);

      if (tempUserCreated) {
        try {
          await tempUserCreated.delete();
        } catch (delError) {
          console.log('Error cleaning up temp user:', delError.message);
        }
        setCurrentUser(null);
        setHouseholdId(null);
        setUserRole(null);
      }

      Alert.alert('Error Joining Household', e.message);
    } finally {
      setLoading(false);
    }
  };

  // Profile management & Sync
  const handleUpdateChild = async (childId, updatedChild) => {
    try {
      const activeHouseholdId =
        await AsyncStorage.getItem('@user_household_id');
      await saveOrUpdateChild(updatedChild, activeHouseholdId);

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

      const activeHouseholdId =
        await AsyncStorage.getItem('@user_household_id');
      const updatedList = await saveOrUpdateChild(newChild, activeHouseholdId);
      setChildren(updatedList);
    } catch (e) {
      console.error('Error adding new child:', e);
    }
  };

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

      const activeHouseholdId =
        await AsyncStorage.getItem('@user_household_id');
      if (activeHouseholdId && childId) {
        await firestore()
          .collection('households')
          .doc(activeHouseholdId)
          .collection('children')
          .doc(childId)
          .delete();

        const logsSnapshot = await firestore()
          .collection('households')
          .doc(activeHouseholdId)
          .collection('logs')
          .where('childId', '==', childId)
          .get();

        if (logsSnapshot && !logsSnapshot.empty) {
          const batch = firestore().batch();
          logsSnapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
          });
          await batch.commit();
        }
      }
    } catch (e) {
      console.error('Error deleting child profile and data:', e);
    }
  };

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
              userRole={userRole}
              onGoogleSignInPress={handleGoogleSignIn}
              onAppleSignInPress={handleAppleSignIn}
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

            {/* Child Profiles Section - OWNER ONLY */}
            {userRole !== 'contributor' && (
              <>
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
                    <Ionicons
                      name="add-circle-outline"
                      size={22}
                      color="#4A6159"
                    />
                    <Text style={styles.addChildText}>Add Child Profile</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>

      {/* Household Invite Modal */}
      <HouseholdInviteModal
        visible={isInviteModalVisible}
        initialTab={inviteModalTab}
        onClose={() => setIsInviteModalVisible(false)}
        householdId={householdId}
        userRole={userRole}
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
