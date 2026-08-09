import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Utility function to print all AsyncStorage keys and parsed values
 * to the terminal/console for debugging purposes.
 */
export const debugPrintAllStorage = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();

    if (keys.length === 0) {
      console.log('========== ASYNCSTORAGE IS EMPTY ==========');
      return;
    }

    const stores = await AsyncStorage.multiGet(keys);

    console.log('========== ALL ASYNCSTORAGE DATA ==========');
    stores.forEach(([key, value]) => {
      let parsedValue;
      try {
        parsedValue = JSON.parse(value);
      } catch {
        parsedValue = value; // Fallback if string isn't valid JSON
      }
      console.log(`\n🔑 KEY: ${key}`);
      console.log(JSON.stringify(parsedValue, null, 2));
    });
    console.log('===========================================');
  } catch (error) {
    console.error('Error printing AsyncStorage contents:', error);
  }
};
