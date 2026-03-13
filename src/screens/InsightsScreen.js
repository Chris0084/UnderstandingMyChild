import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const InsightsScreen = () => {
  const insets = useSafeAreaInsets();
  const [stats, setStats] = useState({
    topStrategies: [],
    topLocations: [],
    totalLogs: 0,
  });

  useFocusEffect(
    useCallback(() => {
      calculateInsights();
    }, []),
  );

  const calculateInsights = async () => {
    try {
      const storedData = await AsyncStorage.getItem('@app_logs');
      if (!storedData) return;
      const logs = JSON.parse(storedData);

      // 1. Tally Strategies
      const strategyCounts = {};
      logs.forEach(log => {
        Object.entries(log.strategies || {}).forEach(([name, status]) => {
          if (status === 'Effective') {
            strategyCounts[name] = (strategyCounts[name] || 0) + 1;
          }
        });
      });

      const topStrategies = Object.entries(strategyCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5); // Get Top 5

      // 2. Tally Locations
      const locationCounts = {};
      logs.forEach(log => {
        const loc = log.where || 'Unknown';
        locationCounts[loc] = (locationCounts[loc] || 0) + 1;
      });

      const topLocations = Object.entries(locationCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);

      setStats({ topStrategies, topLocations, totalLogs: logs.length });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.header}>Data Insights</Text>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Total Incidents Logged</Text>
        <Text style={styles.summaryValue}>{stats.totalLogs}</Text>
      </View>

      <Text style={styles.sectionTitle}>Most Effective Tools</Text>
      <View style={styles.card}>
        {stats.topStrategies.map((item, index) => (
          <View key={index} style={styles.row}>
            <View style={styles.barContainer}>
              <Text style={styles.strategyName} numberOfLines={1}>
                {item.name}
              </Text>
              <View
                style={[
                  styles.bar,
                  { width: (item.count / stats.totalLogs) * (width * 0.6) },
                ]}
              />
            </View>
            <Text style={styles.countText}>{item.count}x</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>High-Frequency Locations</Text>
      <View style={styles.locationContainer}>
        {stats.topLocations.map((item, index) => (
          <View key={index} style={styles.locCard}>
            <Ionicons name="location" size={24} color="#2196F3" />
            <Text style={styles.locName}>{item.name}</Text>
            <Text style={styles.locCount}>{item.count} Incidents</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA', padding: 20 },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A237E',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#455A64',
    marginTop: 25,
    marginBottom: 10,
  },
  summaryCard: {
    backgroundColor: '#388E3C',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    elevation: 4,
  },
  summaryLabel: { color: '#FFF', fontSize: 16, opacity: 0.9 },
  summaryValue: { color: '#FFF', fontSize: 42, fontWeight: 'bold' },
  card: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 12,
    elevation: 2,
  },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  barContainer: { flex: 1, marginRight: 10 },
  strategyName: { fontSize: 14, color: '#333', marginBottom: 4 },
  bar: { height: 8, backgroundColor: '#4CAF50', borderRadius: 4 },
  countText: { fontWeight: 'bold', color: '#388E3C' },
  locationContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  locCard: {
    backgroundColor: '#FFF',
    width: '31%',
    padding: 10,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  locName: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 5,
  },
  locCount: { fontSize: 10, color: '#666' },
});

export default InsightsScreen;
