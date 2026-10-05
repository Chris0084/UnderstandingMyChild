import AsyncStorage from '@react-native-async-storage/async-storage';
import { syncChildrenToFirestore, addLogToFirestore } from './firestoreService';

export async function migrateLocalDataToCloud(householdId) {
  try {
    // 1. Migrate Children
    const rawChildren = await AsyncStorage.getItem('@app_children');
    if (rawChildren) {
      const children = JSON.parse(rawChildren);
      if (Array.isArray(children) && children.length > 0) {
        await syncChildrenToFirestore(householdId, children);
      }
    }

    // 2. Migrate Logs
    const rawLogs = await AsyncStorage.getItem('@app_logs');
    if (rawLogs) {
      const logs = JSON.parse(rawLogs);
      if (Array.isArray(logs) && logs.length > 0) {
        // Upload logs sequentially or via batches
        for (const log of logs) {
          await addLogToFirestore(householdId, log);
        }
      }
    }

    console.log(
      'Successfully migrated local AsyncStorage data to Cloud Firestore.',
    );
  } catch (error) {
    console.error('Data migration failed:', error);
  }
}
