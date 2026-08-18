import { getAnalytics, logEvent } from '@react-native-firebase/analytics';

/**
 * Executes a callback and tracks the custom analytics event using the modular SDK.
 * @param {string} eventName - The button/action ID to be passed as button_id.
 * @param {function} [callback] - Code to execute (navigation, modal open, etc.).
 */
export const trackAnalyticsAndExecute = async (eventName, callback) => {
  try {
    const analyticsInstance = getAnalytics();
    const currentTimestamp = new Date().toISOString();

    await logEvent(analyticsInstance, 'custom_eventQQQ', {
      button_id: eventName,
      click_timestamp: currentTimestamp,
    });

    console.log(`[Analytics Logs] Event fired: custom_eventQQQ`, {
      button_id: eventName,
      click_timestamp: currentTimestamp,
    });
  } catch (error) {
    console.warn(`[Analytics Logs] Failed to log event "${eventName}":`, error);
  } finally {
    if (typeof callback === 'function') {
      callback();
    }
  }
};
