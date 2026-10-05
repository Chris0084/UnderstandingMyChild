import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import { getAuth } from '@react-native-firebase/auth';

export const pullCloudDataToLocal = async householdId => {
  try {
    if (!householdId) return { childrenCount: 0, logsCount: 0 };

    // 1. Fetch children records from Firestore
    const childrenSnapshot = await firestore()
      .collection('households')
      .doc(householdId)
      .collection('children')
      .get();

    const remoteChildren = childrenSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Save into @app_children
    await AsyncStorage.setItem('@app_children', JSON.stringify(remoteChildren));

    // 2. Fetch log entries from Firestore
    const logsSnapshot = await firestore()
      .collection('households')
      .doc(householdId)
      .collection('logs')
      .get();

    const remoteLogs = logsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Save into @app_logs
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

// Helper function to generate a unique 6-character invite code
const generateInviteCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Omit easily confused characters like O, 0, I, 1
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// 1. CREATE A NEW HOUSEHOLD
export const createHousehold = async userId => {
  const inviteCode = generateInviteCode();
  const householdRef = firestore().collection('households').doc();
  const householdId = householdRef.id;

  // Create household document
  await householdRef.set({
    createdBy: userId,
    members: [userId],
    inviteCode: inviteCode,
    createdAt: firestore.FieldValue.serverTimestamp(),
  });

  // Link household ID to user profile
  await firestore().collection('users').doc(userId).set(
    {
      householdId: householdId,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  return { householdId, inviteCode };
};

// 2. JOIN AN EXISTING HOUSEHOLD WITH A 6-CHAR CODE
export const joinHouseholdWithCode = async (userId, code) => {
  const cleanCode = code.trim().toUpperCase();

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

  // Link household ID to the user's document
  await firestore().collection('users').doc(userId).set(
    {
      householdId: householdId,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  return { householdId, inviteCode: cleanCode };
};

// 3. MIGRATE ASYNCSTORAGE DATA TO FIRESTORE
export const migrateLocalDataToCloud = async householdId => {
  try {
    if (!householdId) return;

    // 1. Read local children using your app's key
    const rawChildren = await AsyncStorage.getItem('@app_children');
    const localChildren = rawChildren ? JSON.parse(rawChildren) : [];

    for (const child of localChildren) {
      if (!child.id) continue;
      await firestore()
        .collection('households')
        .doc(householdId)
        .collection('children')
        .doc(String(child.id))
        .set(child, { merge: true });
    }

    // 2. Read local logs using your app's key
    const rawLogs = await AsyncStorage.getItem('@app_logs');
    const localLogs = rawLogs ? JSON.parse(rawLogs) : [];

    for (const log of localLogs) {
      if (!log.id) continue;
      await firestore()
        .collection('households')
        .doc(householdId)
        .collection('logs')
        .doc(String(log.id))
        .set(log, { merge: true });
    }

    console.log(
      `Migrated \({localChildren.length} children and\){localLogs.length} logs to cloud.`,
    );
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

    // Ensure the log has a valid unique string ID
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

      console.log(`Log \({logId} synced to cloud household\){householdId}`);
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

    // Ensure valid string ID
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

    // 1. Save locally to @app_children
    await AsyncStorage.setItem(
      '@app_children',
      JSON.stringify(currentChildren),
    );

    // 2. Queue write to Firestore if authenticated & householdId exists
    const currentUser = getAuth().currentUser;
    if (currentUser && householdId) {
      // Clean undefined fields before Firestore upload
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
