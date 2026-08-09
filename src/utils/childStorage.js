import AsyncStorage from '@react-native-async-storage/async-storage';

const LOGS_KEY = '@app_logs';
const PROFILES_KEY = '@children_profiles';
const ACTIVE_CHILD_KEY = '@active_child_id';
const MIGRATION_FLAG_KEY = '@schema_migrated_child_id_v1';

// Default initial child profile
const DEFAULT_PRIMARY_CHILD = {
  id: '1',
  name: 'Child 1',
  createdAt: new Date().toISOString(),
};

/**
 * 1. MIGRATION FUNCTION
 * Run once on app startup. Adds `childId: '1'` to all legacy logs
 * and initializes the default profile if it doesn't exist yet.
 */
export const migrateExistingLogsToChildOne = async () => {
  try {
    const isMigrated = await AsyncStorage.getItem(MIGRATION_FLAG_KEY);
    if (isMigrated === 'true') {
      return; // Migration already completed previously
    }

    console.log('Running childId migration for existing records...');

    // A. Migrate Existing Logs
    const rawLogs = await AsyncStorage.getItem(LOGS_KEY);
    if (rawLogs) {
      const logs = JSON.parse(rawLogs);
      const updatedLogs = logs.map(log => ({
        ...log,
        childId: log.childId || '1', // Tag legacy logs with childId '1'
      }));
      await AsyncStorage.setItem(LOGS_KEY, JSON.stringify(updatedLogs));
    }

    // B. Ensure Child Profile Lookup Table Exists
    const rawProfiles = await AsyncStorage.getItem(PROFILES_KEY);
    if (!rawProfiles) {
      await AsyncStorage.setItem(
        PROFILES_KEY,
        JSON.stringify([DEFAULT_PRIMARY_CHILD]),
      );
    }

    // C. Ensure Active Child ID is Set
    const activeChildId = await AsyncStorage.getItem(ACTIVE_CHILD_KEY);
    if (!activeChildId) {
      await AsyncStorage.setItem(ACTIVE_CHILD_KEY, '1');
    }

    // D. Mark Migration as Complete
    await AsyncStorage.setItem(MIGRATION_FLAG_KEY, 'true');
    console.log('childId migration completed successfully.');
  } catch (error) {
    console.error('Failed to run childId migration:', error);
  }
};

/**
 * 2. PROFILE LOOKUP & NAME MANAGEMENT HELPERS
 */

// Fetch all child profiles from the lookup table
export const getChildProfiles = async () => {
  try {
    const rawProfiles = await AsyncStorage.getItem(PROFILES_KEY);
    return rawProfiles ? JSON.parse(rawProfiles) : [DEFAULT_PRIMARY_CHILD];
  } catch (error) {
    console.error('Error reading child profiles:', error);
    return [DEFAULT_PRIMARY_CHILD];
  }
};

// Update a child's name in the lookup table by ID
export const updateChildName = async (childId, newName) => {
  try {
    const profiles = await getChildProfiles();
    const updatedProfiles = profiles.map(profile =>
      profile.id === childId ? { ...profile, name: newName.trim() } : profile,
    );

    await AsyncStorage.setItem(PROFILES_KEY, JSON.stringify(updatedProfiles));
    return updatedProfiles;
  } catch (error) {
    console.error(`Error updating name for child ID ${childId}:`, error);
    throw error;
  }
};

// Helper to look up a child's name synchronously from an in-memory list
export const getChildNameFromList = (childId, profilesList = []) => {
  const child = profilesList.find(p => p.id === childId);
  return child ? child.name : 'Unknown';
};

// Active Child Selection Helpers
export const getActiveChildId = async () => {
  try {
    const id = await AsyncStorage.getItem(ACTIVE_CHILD_KEY);
    return id || '1';
  } catch {
    return '1';
  }
};

export const setActiveChildId = async childId => {
  try {
    await AsyncStorage.setItem(ACTIVE_CHILD_KEY, childId);
  } catch (error) {
    console.error('Error setting active child ID:', error);
  }
};
