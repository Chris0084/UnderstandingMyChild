import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TotalIncidents from '../insightComponents/TotalIncidents';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import EffectiveTools from '../insightComponents/EffectiveTools';
import Locations from '../insightComponents/Locations';
import PolarAreaChart from '../insightComponents/PolarAreaChart';
import PageHeader from '../components/PageHeader';
import Colors from '../constants/Colors';

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
        let rawLoc = log.where || 'Unknown';
        const cleanLoc = rawLoc
          .trim()
          .toLowerCase()
          .split(/\s+/) // Splits by any amount of whitespace
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        locationCounts[cleanLoc] = (locationCounts[cleanLoc] || 0) + 1;
      });

      const topLocations = Object.entries(locationCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);

      const tagCounts = {
        Sensory: 0,
        Communication: 0,
        Routine: 0,
        'Social Connection': 0,
        'Self-Regulated': 0,
        'Executive Function': 0,
        Sleep: 0,
      };

      // Now loop through logs to fill tagCounts
      logs.forEach(log => {
        (log.tags || []).forEach(tag => {
          if (tagCounts.hasOwnProperty(tag)) {
            tagCounts[tag] += 1;
          }
        });
      });

      // Now map it to the array format your RadialTagChart needs
      const topTags = Object.entries(tagCounts).map(([name, count]) => ({
        name,
        count,
      }));

      // 4. Update state ONCE at the very end with everything
      setStats({
        topStrategies,
        topLocations,
        topTags, // This is what the Radial chart uses
        totalLogs: logs.length,
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}>
      <PageHeader
        title={'Trend Tracker'}
        iconName={'sparkles-outline'}
        iconColor={'#000000'}></PageHeader>

      <ScrollView style={[styles.container]}>
        <TotalIncidents count={stats.totalLogs} />

        <EffectiveTools
          strategies={stats.topStrategies}
          totalLogs={stats.totalLogs}
        />

        <Locations topLocations={stats.topLocations} />

        <PolarAreaChart tags={stats.topTags} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.sage, padding: 10 },
});

export default InsightsScreen;
