import { getAnalytics, logEvent } from '@react-native-firebase/analytics';

/**
 * Executes a callback and tracks the custom analytics event using the modular SDK.
 * @param {string} eventName - Name of the event to log.
 * @param {function} callback - Code to execute (navigation, modal open, etc.).
 */
export const trackAnalyticsAndExecute = async (eventName, callback) => {
  try {
    const analyticsInstance = getAnalytics();
    await logEvent(analyticsInstance, eventName);
    console.log(`[Analytics Logs] Event fired for: ${eventName}`);
  } catch (error) {
    console.warn(`[Analytics Logs] Failed to log event "${eventName}":`, error);
  } finally {
    if (typeof callback === 'function') {
      callback();
    }
  }
};
