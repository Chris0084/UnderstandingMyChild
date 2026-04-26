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
import HeatMap from '../insightComponents/HeatMap';

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

      // --- 1. TALLY STRATEGIES ---
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
        .slice(0, 5);

      // --- 2. TALLY LOCATIONS ---
      const locationCounts = {};
      logs.forEach(log => {
        let rawLoc = log.where || 'Unknown';
        const cleanLoc = rawLoc
          .trim()
          .toLowerCase()
          .split(/\s+/)
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        locationCounts[cleanLoc] = (locationCounts[cleanLoc] || 0) + 1;
      });

      const topLocations = Object.entries(locationCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);

      // --- 3. TALLY TAGS (Polar Chart) ---
      const tagCounts = {
        Sensory: 0,
        Communication: 0,
        Routine: 0,
        'Social Connection': 0,
        'Self-Regulated': 0,
        'Executive Function': 0,
        Sleep: 0,
      };

      logs.forEach(log => {
        (log.tags || []).forEach(tag => {
          if (tagCounts.hasOwnProperty(tag)) {
            tagCounts[tag] += 1;
          }
        });
      });

      const topTags = Object.entries(tagCounts).map(([name, count]) => ({
        name,
        count,
      }));

      // --- 4. HEATMAP LOGIC (NEW) ---
      const times = ['Morning', 'Afternoon', 'Evening', 'Night time'];
      // Initialize a 7-day matrix (Sun-Sat)
      let heatMapMatrix = Array.from({ length: 7 }, (_, i) => ({
        dayIndex: i,
        slots: times.map(t => ({ time: t, count: 0 })),
      }));

      logs.forEach(log => {
        const date = new Date(log.logDate);
        const dayIndex = date.getDay(); // 0 is Sunday
        const timeLabel = log.timeOfDay;

        if (timeLabel) {
          const timeIndex = times.indexOf(timeLabel);
          if (timeIndex !== -1) {
            heatMapMatrix[dayIndex].slots[timeIndex].count += 1;
          }
        }
      });

      // Find the highest number of incidents in any single slot to scale colors
      const maxCount = Math.max(
        ...heatMapMatrix.flatMap(d => d.slots.map(s => s.count)),
        1, // Default to 1 to avoid division by zero
      );

      // --- 5. UPDATE STATE (ONCE) ---
      setStats({
        topStrategies,
        topLocations,
        topTags,
        heatMapData: { matrix: heatMapMatrix, maxCount }, // Added this
        totalLogs: logs.length,
      });
    } catch (e) {
      console.error('Error calculating insights:', e);
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
        iconColor={'#000000'}
        accentColor={Colors.trend_theme}></PageHeader>

      <ScrollView style={[styles.container]}>
        <TotalIncidents count={stats.totalLogs} />

        <HeatMap data={stats.heatMapData} />

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
  container: { flex: 1, backgroundColor: Colors.background, padding: 10 },
});

export default InsightsScreen;
