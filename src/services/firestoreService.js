import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import { getAuth, signOut } from '@react-native-firebase/auth';

export const MAX_CONTRIBUTORS = 3;

export const pullCloudDataToLocal = async (householdId, userRole) => {
  try {
    const currentUser = getAuth().currentUser;
    if (!currentUser || !householdId) return { childrenCount: 0, logsCount: 0 };

    const effectiveRole =
      userRole || (await AsyncStorage.getItem('@user_role')) || 'owner';

    // 1. Fetch children records (Both Owners & Contributors need this to select which child to log for)
    const childrenSnapshot = await firestore()
      .collection('households')
      .doc(householdId)
      .collection('children')
      .get();

    const remoteChildren = childrenSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    await AsyncStorage.setItem('@app_children', JSON.stringify(remoteChildren));

    // 2. PRIVACY GUARD: If Contributor, DO NOT pull down household logs!
    if (userRole === 'contributor') {
      await AsyncStorage.setItem('@app_logs', JSON.stringify([]));
      return {
        childrenCount: remoteChildren.length,
        logsCount: 0,
      };
    }

    // 3. For Primary Owner: Fetch all household log entries
    const logsSnapshot = await firestore()
      .collection('households')
      .doc(householdId)
      .collection('logs')
      .get();

    const remoteLogs = logsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    await AsyncStorage.setItem('@app_logs', JSON.stringify(remoteLogs));

    return {
      childrenCount: remoteChildren.length,
      logsCount: remoteLogs.length,
    };
  } catch (error) {
    console.error('Error pulling cloud data:', error);
    throw error;
  }
};

// Helper to generate a unique 10-character single-use invite code
const generateInviteCode = () => {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // Omit easily confused characters like 0/O, 1/I
  let result = '';
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// 1. CREATE A NEW HOUSEHOLD (Owner)
export const createHousehold = async userId => {
  const householdRef = firestore().collection('households').doc();
  const householdId = householdRef.id;

  // Create household document with an empty invites map
  await householdRef.set({
    createdBy: userId,
    members: [userId],
    invites: {}, // Keyed by invite code: { [code]: { assignedToName, claimed, ... } }
    createdAt: firestore.FieldValue.serverTimestamp(),
  });

  // Link household ID & role to owner user profile
  await firestore().collection('users').doc(userId).set(
    {
      householdId: householdId,
      role: 'owner',
      updatedAt: firestore.FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  await AsyncStorage.setItem('@user_household_id', householdId);

  return { householdId };
};

/**
 * Creates a named, single-use invite code for a specific contributor.
 * Enforces a maximum limit of contributors per household.
 */
export const createNamedInvite = async (householdId, contributorName) => {
  const cleanName = contributorName ? contributorName.trim() : 'Contributor';

  // 1. Fetch current household to check current contributor count
  const householdDoc = await firestore()
    .collection('households')
    .doc(householdId)
    .get();
  if (!householdDoc.exists) {
    throw new Error('Household does not exist.');
  }

  const invitesMap = householdDoc.data()?.invites || {};
  const currentCount = Object.keys(invitesMap).length;

  if (currentCount >= MAX_CONTRIBUTORS) {
    throw new Error(
      `Contributor limit reached. A household can have a maximum of ${MAX_CONTRIBUTORS} contributors. Please delete an existing or unused invite first.`,
    );
  }

  // 2. Generate unique code and save
  const code = generateInviteCode();

  await firestore()
    .collection('households')
    .doc(householdId)
    .update({
      [`invites.${code}`]: {
        assignedToName: cleanName,
        claimed: false,
        claimedByUid: null,
        createdAt: new Date().toISOString(),
      },
    });

  return { code, assignedToName: cleanName };
};

// 3. CLAIM SINGLE-USE INVITE CODE (Contributor)
// 3. CLAIM SINGLE-USE INVITE CODE (Contributor)
export const claimNamedInviteCode = async (user, code) => {
  const cleanCode = code ? code.trim().toUpperCase() : '';

  if (!cleanCode || cleanCode.length !== 10) {
    throw new Error('Please enter a valid 10-character code.');
  }

  // Find the household that contains this invite code
  const snapshot = await firestore()
    .collection('households')
    .where(`invites.${cleanCode}.claimed`, '==', false)
    .limit(1)
    .get();

  if (snapshot.empty) {
    throw new Error('This code is invalid, expired, or has already been used.');
  }

  const householdDoc = snapshot.docs[0];
  const householdId = householdDoc.id;
  const householdData = householdDoc.data();
  const inviteInfo = householdData.invites
    ? householdData.invites[cleanCode]
    : null;
  const displayName =
    inviteInfo && inviteInfo.assignedToName
      ? inviteInfo.assignedToName
      : 'Contributor';

  // Batch write: Mark invite as claimed and add contributor to members
  const batch = firestore().batch();

  // Update household document
  batch.update(householdDoc.ref, {
    [`invites.${cleanCode}.claimed`]: true,
    [`invites.${cleanCode}.claimedByUid`]: user.uid,
    members: firestore.FieldValue.arrayUnion(user.uid),
  });

  // Update contributor user document
  const userRef = firestore().collection('users').doc(user.uid);
  batch.set(
    userRef,
    {
      householdId: householdId,
      role: 'contributor',
      displayName: displayName,
      inviteCode: cleanCode,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  await batch.commit();

  // Cache household locally for offline sync
  await AsyncStorage.setItem('@user_household_id', householdId);
  await AsyncStorage.setItem('@user_role', 'contributor');
  await AsyncStorage.setItem('@user_name', displayName);

  return {
    householdId: householdId,
    assignedToName: displayName,
  };
};

// 4. GET ALL INVITES & CONTRIBUTORS FOR A HOUSEHOLD (Owner UI)
export const getHouseholdInvites = async householdId => {
  if (!householdId) return [];

  const doc = await firestore().collection('households').doc(householdId).get();
  if (!doc.exists) return [];

  const data = doc.data();
  const invitesMap = data.invites || {};

  // Convert map to an array for easy rendering in the UI
  return Object.keys(invitesMap).map(code => ({
    code,
    ...invitesMap[code],
  }));
};

// 5. REMOVE / REVOKE A CONTRIBUTOR OR UNCLAIMED CODE (Owner)
export const removeContributor = async (householdId, code, contributorUid) => {
  const householdRef = firestore().collection('households').doc(householdId);

  // Remove the invite code and remove the member from the household
  await householdRef.update({
    [`invites.${code}`]: firestore.FieldValue.delete(),
    ...(contributorUid
      ? { members: firestore.FieldValue.arrayRemove(contributorUid) }
      : {}),
  });
};

// 2. JOIN AN EXISTING HOUSEHOLD WITH A 10-CHAR CODE (Contributor)
export const joinHouseholdWithCode = async (userId, code) => {
  const cleanCode = code.trim();

  // Find household document matching the invite code
  const snapshot = await firestore()
    .collection('households')
    .where('inviteCode', '==', cleanCode)
    .get();

  if (snapshot.empty) {
    throw new Error('Invalid code. Please check and try again.');
  }

  const householdDoc = snapshot.docs[0];
  const householdId = householdDoc.id;

  // Add user to the household's members array
  await firestore()
    .collection('households')
    .doc(householdId)
    .update({
      members: firestore.FieldValue.arrayUnion(userId),
    });

  // Link household ID & role to the user's document
  await firestore().collection('users').doc(userId).set(
    {
      householdId: householdId,
      role: 'contributor',
      updatedAt: firestore.FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  return { householdId, inviteCode: cleanCode };
};

// 3. MIGRATE ASYNCSTORAGE DATA TO FIRESTORE
export const migrateLocalDataToCloud = async householdId => {
  try {
    if (!householdId) return { childrenCount: 0, logsCount: 0 };
    const currentUser = getAuth().currentUser;

    // ---------------------------------------------------------
    // 1. MIGRATE CHILDREN
    // ---------------------------------------------------------
    const rawChildren = await AsyncStorage.getItem('@app_children');
    let localChildren = rawChildren ? JSON.parse(rawChildren) : [];

    console.log('--- 🔄 MIGRATING CHILDREN TO CLOUD ---', localChildren);

    // SAFETY FALLBACK: If local storage has logs but no child profile was ever saved,
    // generate a default Child 1 profile so the cloud household has a child to log against!
    if (!localChildren || localChildren.length === 0) {
      localChildren = [
        { id: '1', name: 'Child 1', color: '#4A6159', isActive: true },
      ];
      await AsyncStorage.setItem(
        '@app_children',
        JSON.stringify(localChildren),
      );
    }

    let childrenUploadedCount = 0;

    for (let index = 0; index < localChildren.length; index++) {
      const child = localChildren[index];
      const childId = String(child.id || index + 1);

      // Clean undefined values so Firestore doesn't reject the write
      const cleanChild = JSON.parse(
        JSON.stringify({
          ...child,
          id: childId,
          name: child.name || `Child ${index + 1}`,
          color: child.color || '#4A6159',
          isActive: child.isActive !== false,
          updatedAt: new Date().toISOString(),
        }),
      );

      // Save to households/{householdId}/children/{childId}
      await firestore()
        .collection('households')
        .doc(householdId)
        .collection('children')
        .doc(childId)
        .set(cleanChild, { merge: true });

      childrenUploadedCount++;
      console.log(
        `✅ Uploaded child ${cleanChild.name} (${childId}) to cloud.`,
      );
    }

    // ---------------------------------------------------------
    // 2. MIGRATE LOGS
    // ---------------------------------------------------------
    const rawLogs = await AsyncStorage.getItem('@app_logs');
    const localLogs = rawLogs ? JSON.parse(rawLogs) : [];

    for (const log of localLogs) {
      if (!log.id) continue;
      const cleanLog = JSON.parse(
        JSON.stringify({
          ...log,
          createdByUid: log.createdByUid || currentUser?.uid || null,
          createdByName:
            log.createdByName || currentUser?.displayName || 'Primary Owner',
        }),
      );

      await firestore()
        .collection('households')
        .doc(householdId)
        .collection('logs')
        .doc(String(log.id))
        .set(cleanLog, { merge: true });
    }

    console.log(
      `🎉 Migration complete: ${childrenUploadedCount} child(ren) and ${localLogs.length} logs uploaded.`,
    );

    return {
      childrenCount: childrenUploadedCount,
      logsCount: localLogs.length,
    };
  } catch (error) {
    console.error('Error migrating local data to cloud:', error);
    throw error;
  }
};

export const saveOrUpdateLog = async (logData, householdId) => {
  try {
    // 1. Update local AsyncStorage array (@app_logs)
    const rawLogs = await AsyncStorage.getItem('@app_logs');
    let currentLogs = rawLogs ? JSON.parse(rawLogs) : [];

    const logId = logData.id ? String(logData.id) : String(Date.now());
    const updatedLog = {
      ...logData,
      id: logId,
      updatedAt: new Date().toISOString(),
    };

    const existingIndex = currentLogs.findIndex(l => String(l.id) === logId);
    if (existingIndex >= 0) {
      currentLogs[existingIndex] = updatedLog;
    } else {
      currentLogs.push(updatedLog);
    }

    await AsyncStorage.setItem('@app_logs', JSON.stringify(currentLogs));

    // 2. If user is logged in and belongs to a household, push to Firestore
    const currentUser = getAuth().currentUser;
    if (currentUser && householdId) {
      await firestore()
        .collection('households')
        .doc(householdId)
        .collection('logs')
        .doc(logId)
        .set(updatedLog, { merge: true });

      console.log(`Log ${logId} synced to cloud household ${householdId}`);
    }

    return updatedLog;
  } catch (error) {
    console.error('Error saving or syncing log:', error);
    throw error;
  }
};

export const deleteLog = async (logId, householdId) => {
  try {
    const stringId = String(logId);

    // 1. Remove from local AsyncStorage (@app_logs)
    const rawLogs = await AsyncStorage.getItem('@app_logs');
    let currentLogs = rawLogs ? JSON.parse(rawLogs) : [];
    const filteredLogs = currentLogs.filter(l => String(l.id) !== stringId);
    await AsyncStorage.setItem('@app_logs', JSON.stringify(filteredLogs));

    // 2. Delete from Firestore if authenticated and householdId exists
    const currentUser = getAuth().currentUser;
    if (currentUser && householdId) {
      await firestore()
        .collection('households')
        .doc(householdId)
        .collection('logs')
        .doc(stringId)
        .delete();

      console.log(`Log ${stringId} deleted from cloud.`);
    }
  } catch (error) {
    console.error('Error deleting log:', error);
    throw error;
  }
};

export const saveOrUpdateChild = async (childData, householdId) => {
  try {
    const rawStored = await AsyncStorage.getItem('@app_children');
    let currentChildren = rawStored ? JSON.parse(rawStored) : [];

    const childId = String(childData.id);
    const cleanChild = { ...childData, id: childId };

    const existingIndex = currentChildren.findIndex(
      c => String(c.id) === childId,
    );
    if (existingIndex >= 0) {
      currentChildren[existingIndex] = cleanChild;
    } else {
      currentChildren.push(cleanChild);
    }

    // 1. Save locally
    await AsyncStorage.setItem(
      '@app_children',
      JSON.stringify(currentChildren),
    );

    // 2. Queue write to Firestore
    const currentUser = getAuth().currentUser;
    if (currentUser && householdId) {
      const cleanData = JSON.parse(JSON.stringify(cleanChild));

      await firestore()
        .collection('households')
        .doc(householdId)
        .collection('children')
        .doc(childId)
        .set(cleanData, { merge: true });

      console.log(`Child profile ${childId} synced to cloud.`);
    }

    return currentChildren;
  } catch (error) {
    console.error('Error saving or updating child:', error);
    throw error;
  }
};

/**
 * Reusable check to verify if the active user is still a member of the household.
 * If access was revoked by the owner:
 * - Signs user out of Firebase Auth
 * - Wipes all local household storage
 * - Displays an alert popup
 * - Calls optional onRevoked callback to reset screen states
 *
 * @param {Function} onRevoked Optional callback for screen state resets
 * @returns {Promise<boolean>} true if active, false if revoked
 */
export const verifyHouseholdMembership = async onRevoked => {
  try {
    const authInstance = getAuth();
    const currentUser = authInstance.currentUser;

    // Not logged in -> nothing to revoke
    if (!currentUser) return true;

    const householdId = await AsyncStorage.getItem('@user_household_id');
    const userRole = await AsyncStorage.getItem('@user_role');

    // Only users associated with a household need to be checked
    if (!householdId) return true;

    // Fetch the household doc to check members array
    const householdDoc = await firestore()
      .collection('households')
      .doc(householdId)
      .get();

    const isMember =
      householdDoc.exists &&
      householdDoc.data()?.members?.includes(currentUser.uid);

    if (!isMember) {
      console.log('Revoked membership detected for user:', currentUser.uid);

      // 1. Sign out of Firebase Auth
      await signOut(authInstance);

      // 2. Wipe all household local storage
      await AsyncStorage.multiRemove([
        '@app_logs',
        '@app_children',
        '@user_household_id',
        '@user_role',
        '@user_name',
      ]);

      // 3. Reset screen state if callback provided
      if (typeof onRevoked === 'function') {
        onRevoked();
      }

      // 4. Alert user
      Alert.alert(
        'Access Removed',
        'Your access to this household has been revoked by the primary owner. You have been signed out.',
        [{ text: 'OK' }],
      );

      return false; // Access was revoked!
    }

    return true; // Still active
  } catch (error) {
    // If offline / network error, don't boot them prematurely
    console.error('Error verifying household membership:', error);
    return true;
  }
};
