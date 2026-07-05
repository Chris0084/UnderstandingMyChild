import React, { useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons'; // or 'react-native-vector-icons/Ionicons'
import NavCard from '../components/NavCard';
import Colors from '../constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage'; // 2. REMOVE whole line when strippng the day populate
import {
  getAnalytics,
  setAnalyticsCollectionEnabled,
} from '@react-native-firebase/analytics';

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [showConsentPopup, setShowConsentPopup] = React.useState(false);

  useEffect(() => {
    const checkPrivacyConsent = async () => {
      try {
        const hasAnswered = await AsyncStorage.getItem('@analytics_consent');
        const analyticsInstance = getAnalytics();

        if (hasAnswered === null) {
          await setAnalyticsCollectionEnabled(analyticsInstance, false);
          setShowConsentPopup(true);
        } else {
          const isOptedIn = hasAnswered === 'true';
          await setAnalyticsCollectionEnabled(analyticsInstance, isOptedIn);
        }
      } catch (e) {
        console.error('Consent check error:', e);
      }
    };

    checkPrivacyConsent();
  }, []);

  useEffect(() => {
    const runBackfill = async () => {
      try {
        const storedData = await AsyncStorage.getItem('@app_logs');
        if (!storedData) return;

        let logs = JSON.parse(storedData);
        let hasChanges = false;

        const updatedLogs = logs.map(log => {
          if (!log.timeOfDay) {
            const timestamp = parseInt(log.id);
            const date = !isNaN(timestamp)
              ? new Date(timestamp)
              : new Date(log.logDate);
            const hour = date.getHours();

            let timeLabel = 'Night time';
            if (hour >= 5 && hour < 12) timeLabel = 'Morning';
            else if (hour >= 12 && hour < 17) timeLabel = 'Afternoon';
            else if (hour >= 17 && hour < 21) timeLabel = 'Evening';

            hasChanges = true;
            return { ...log, timeOfDay: timeLabel };
          }
          return log;
        });

        if (hasChanges) {
          console.log('Backfilling missing timeOfDay data...');
          await AsyncStorage.setItem('@app_logs', JSON.stringify(updatedLogs));
        }
      } catch (e) {
        console.error('Backfill error:', e);
      }
    };

    runBackfill();
  }, []); // --- BACKFILL LOGIC END ---

  const handleConsentChange = async accepted => {
    try {
      const analyticsInstance = getAnalytics();
      await setAnalyticsCollectionEnabled(analyticsInstance, accepted);
      await AsyncStorage.setItem(
        '@analytics_consent',
        accepted ? 'true' : 'false',
      );
      setShowConsentPopup(false);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <View style={[styles.mainScreenContainer, { paddingTop: insets.top }]}>
      {/* --- FLOATING COG HEADER BUTTON --- */}
      <View style={styles.headerActionRow}>
        <View style={styles.welcomeTag}>
          <Text style={styles.welcomeTagText}>Support & Growth</Text>
        </View>

        <TouchableOpacity
          style={styles.cogButton}
          onPress={() => navigation.navigate('Settings')}
          activeOpacity={0.7}>
          <Ionicons name="settings-outline" size={30} color="#1A1A1A" />
        </TouchableOpacity>
      </View>

      <View style={styles.marginContainer}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>
          {/* TOP SECTION: Typography */}
          <View style={styles.textContainer}>
            <Text style={styles.titleText}>
              Welcome to{'\n'}Understanding My Child
            </Text>

            <Text style={styles.paragraphText}>
              A dedicated space to log, review, and understand your child’s
              unique developmental journey through simple journal entries.
            </Text>
          </View>

          <View style={styles.cardGrid}>
            <View style={styles.fullRow}>
              <NavCard
                title="Capture"
                description="Quickly log moments or incidents through a simple, guided form."
                iconName="add-circle-outline"
                accentColor={Colors.log_theme || '#FCE4EC'}
                backgroundColor={'#a7e7a7'}
                onPress={() =>
                  navigation.navigate('MainApp', { screen: 'InputForm' })
                }
              />
            </View>

            <View style={styles.fullRow}>
              <NavCard
                title="Information"
                description="Learn how to use the app and explore definitions for common terminology."
                iconName="information-circle-outline"
                accentColor={Colors.info_theme || '#D4EAE2'}
                onPress={() =>
                  navigation.navigate('MainApp', { screen: 'Information' })
                }
              />
            </View>

            <View style={styles.fullRow}>
              <NavCard
                title="Journal"
                description="Access your complete history of logs with easy tools to search and update entries."
                iconName="book-outline"
                accentColor={Colors.journal_theme || '#E3F2FD'}
                onPress={() =>
                  navigation.navigate('MainApp', { screen: 'Reporting' })
                }
              />
            </View>

            <View style={styles.fullRow}>
              <NavCard
                title="Trend Tracker"
                description="View essential data insights and trends based on your recorded logs."
                iconName="sparkles-outline"
                accentColor={Colors.trend_theme || '#FFF3E0'}
                onPress={() =>
                  navigation.navigate('MainApp', { screen: 'Insights' })
                }
              />
            </View>
          </View>
        </ScrollView>
      </View>

      {/* --- PRIVACY POPUP BANNER --- */}
      {showConsentPopup && (
        <View style={styles.consentBanner}>
          <Text style={styles.consentHeader}>Privacy & Analytics</Text>
          <Text style={styles.consentText}>
            To help us improve your user experience, we collect anonymous usage
            analytics. Rest assured, all data is completely anonymized, and
            absolutely no personal logs, journal text, or user inputs are
            collected or ever seen by the developers.{' '}
            <Text style={{ fontWeight: '700', color: '#1A1A1A' }}>
              You can update this preference at any time in the app settings.
            </Text>
          </Text>
          <View style={styles.consentButtons}>
            <Text
              style={styles.declineButton}
              onPress={() => handleConsentChange(false)}>
              Decline
            </Text>
            <Text
              style={styles.acceptButton}
              onPress={() => handleConsentChange(true)}>
              Accept & Continue
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  mainScreenContainer: {
    flex: 1,
    backgroundColor: Colors.background || '#F8F9FA',
  },
  headerActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Pushes the pill left and the cog right
    alignItems: 'center', // Aligns them perfectly straight in the center vertically
    paddingHorizontal: 25,
    paddingTop: 15,
    paddingBottom: 10,
    zIndex: 10,
  },
  cogButton: {
    width: 54,
    height: 54,
    borderRadius: 22,
    backgroundColor: '#28df10b4',
    alignItems: 'center',
    justifyContent: 'center',
    // Elegant soft shadow
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  marginContainer: {
    flex: 1,
    overflow: 'hidden',
    marginTop: 0, // Reset to zero now that the header layout is balanced
  },
  textContainer: {
    paddingHorizontal: 25,
    paddingTop: 10, // Tighter spacing below the new clean row
    marginBottom: 30,
    alignItems: 'flex-start',
  },
  welcomeTag: {
    backgroundColor: '#D4EAE2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    // Removed marginBottom so it doesn't push down away from the cog
  },
  welcomeTagText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#4A6159',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  titleText: {
    fontSize: 38,
    fontWeight: '900',
    color: '#1A1A1A',
    textAlign: 'left',
    lineHeight: 38,
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  paragraphText: {
    fontSize: 20,
    color: '#666',
    textAlign: 'left',
    lineHeight: 24,
  },
  cardGrid: {
    paddingHorizontal: 20,
    width: '100%',
  },
  fullRow: {
    width: '100%',
    marginBottom: 15,
  },
  splitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 15,
  },
  consentBanner: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 20,
    elevation: 8,
    shadowColor: '#1A1A1A',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  consentHeader: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  consentText: {
    fontSize: 14,
    color: '#555555',
    lineHeight: 22,
    marginBottom: 24,
  },
  consentButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 12,
  },
  declineButton: {
    fontSize: 15,
    color: '#666666',
    fontWeight: '600',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  acceptButton: {
    fontSize: 15,
    color: '#FFFFFF',
    backgroundColor: '#4A6159',
    fontWeight: '700',
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 12,
    overflow: 'hidden',
    textAlign: 'center',
  },
});
