import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import NavCard from '../components/NavCard';
import Colors from '../constants/Colors';

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.mainScreenContainer, { paddingTop: insets.top }]}>
      <View style={styles.marginContainer}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>
          {/* TOP SECTION: Enhanced Typography & Branding */}
          <View style={styles.textContainer}>
            <View style={styles.welcomeTag}>
              <Text style={styles.welcomeTagText}>Support & Growth</Text>
            </View>

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
                backgroundColor={'#80f08f'}
                //    style={{ width: '48%', height: 200 }} // Fixed height ensures they match
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
                //   style={{ width: '48%', height: 200 }}
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
    </View>
  );
}

const styles = StyleSheet.create({
  mainScreenContainer: {
    flex: 1,
    backgroundColor: Colors.background || '#F8F9FA',
  },
  marginContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  textContainer: {
    paddingHorizontal: 25,
    paddingTop: 40,
    marginBottom: 30,
    alignItems: 'flex-start', // Left alignment looks more modern
  },
  welcomeTag: {
    backgroundColor: '#D4EAE2', // Soft Sage
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 12,
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
});
