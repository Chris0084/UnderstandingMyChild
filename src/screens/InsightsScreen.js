import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TotalIncidents from '../insightComponents/TotalIncidents';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import EffectiveTools from '../insightComponents/EffectiveTools';
import LeastEffectiveTools from '../insightComponents/LeastEffectiveTools';
import Locations from '../insightComponents/Locations';
import PolarAreaChart from '../insightComponents/PolarAreaChart';
import PageHeader from '../components/PageHeader';
import Colors from '../constants/Colors';
import HeatMap from '../insightComponents/HeatMap';
import { Ionicons } from '@expo/vector-icons';
import ChildSelector from '../components/ChildSelector';

const { width } = Dimensions.get('window');
const logsRequired = 15;

const InsightsScreen = () => {
  const insets = useSafeAreaInsets();

  // FIX 1: Matching state variables for ChildSelector
  const [selectedChildId, setSelectedChildId] = useState('all');
  const [children, setChildren] = useState([]);

  const [stats, setStats] = useState({
    topStrategies: [],
    leastEffectiveStrategies: [],
    topLocations: [],
    topTags: [],
    heatMapData: null,
    totalLogs: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const calculateInsights = useCallback(async () => {
    try {
      // FIX 2: Load children profile list for the selector
      const storedChildren = await AsyncStorage.getItem('@app_children'); // adjust key if needed
      if (storedChildren) {
        setChildren(JSON.parse(storedChildren));
      }

      const storedData = await AsyncStorage.getItem('@app_logs');
      if (!storedData) {
        setStats(prev => ({ ...prev, totalLogs: 0 }));
        return;
      }
      const rawLogs = JSON.parse(storedData);

      // FIX 3: Filter logs based on selectedChildId
      let logs = rawLogs;

      // Treat 'all', '', null, or undefined as "Show All Children"
      const isAllSelected =
        !selectedChildId ||
        selectedChildId === 'all' ||
        selectedChildId === 'ALL' ||
        (typeof selectedChildId === 'object' && selectedChildId?.id === 'all');

      if (!isAllSelected) {
        logs = rawLogs.filter(log => {
          // Compare as strings to prevent type mismatch (e.g. number ID vs string ID)
          const logChildId = String(
            log.childId ?? log.child ?? log.childName ?? '',
          );
          const targetId = String(selectedChildId);
          return logChildId === targetId;
        });
      }

      if (rawLogs.length < logsRequired) {
        setStats(prev => ({ ...prev, totalLogs: logs.length }));
        return;
      }

      // --- 1. TALLY STRATEGIES (Effective vs Not Effective) ---
      const strategyCounts = {};
      const leastEffectiveCounts = {};

      logs.forEach(log => {
        Object.entries(log.strategies || {}).forEach(([name, status]) => {
          if (status === 'Effective') {
            strategyCounts[name] = (strategyCounts[name] || 0) + 1;
          } else if (status === 'Not effective') {
            leastEffectiveCounts[name] = (leastEffectiveCounts[name] || 0) + 1;
          }
        });
      });

      const topStrategies = Object.entries(strategyCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      const leastEffectiveStrategies = Object.entries(leastEffectiveCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // --- 2. TALLY LOCATIONS ---
      const locationCounts = {};
      logs.forEach(log => {
        const rawLoc = log.where || 'Unknown';
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
          if (Object.prototype.hasOwnProperty.call(tagCounts, tag)) {
            tagCounts[tag] += 1;
          }
        });
      });

      const topTags = Object.entries(tagCounts).map(([name, count]) => ({
        name,
        count,
      }));

      // --- 4. HEATMAP LOGIC ---
      const times = ['Morning', 'Afternoon', 'Evening', 'Night time'];
      const heatMapMatrix = Array.from({ length: 7 }, (_, i) => ({
        dayIndex: i,
        slots: times.map(t => ({ time: t, count: 0 })),
      }));

      logs.forEach(log => {
        const date = new Date(log.logDate);
        const rawDay = date.getDay();
        const mondayFirstIndex = rawDay === 0 ? 6 : rawDay - 1;
        const timeLabel = log.timeOfDay;

        if (timeLabel) {
          const timeIndex = times.indexOf(timeLabel);
          if (timeIndex !== -1) {
            heatMapMatrix[mondayFirstIndex].slots[timeIndex].count += 1;
          }
        }
      });

      const maxCount = Math.max(
        ...heatMapMatrix.flatMap(d => d.slots.map(s => s.count)),
        1,
      );

      // --- 5. UPDATE STATE ---
      setStats({
        topStrategies,
        leastEffectiveStrategies,
        topLocations,
        topTags,
        heatMapData: { matrix: heatMapMatrix, maxCount },
        totalLogs: logs.length,
      });
    } catch (e) {
      console.error('Error calculating insights:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedChildId]); // FIX 4: Include selectedChildId in calculateInsights useCallback

  useFocusEffect(
    useCallback(() => {
      calculateInsights();
    }, [calculateInsights]),
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    calculateInsights();
  }, [calculateInsights]);

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centerStage}>
          <ActivityIndicator
            size="large"
            color={Colors.trend_theme || '#007AFF'}
          />
          <Text style={styles.loadingText}>Loading insights...</Text>
        </View>
      );
    }
    // --- LOCK SCREEN COVER LAYOUT ---
    if (stats.totalLogs < logsRequired) {
      const remaining = logsRequired - stats.totalLogs;
      const progressPercent = (stats.totalLogs / logsRequired) * 100;

      return (
        <ScrollView
          contentContainerStyle={styles.lockScrollContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }>
          <View style={styles.lockContainer}>
            <View style={styles.lockCard}>
              <View style={styles.iconCircle}>
                <Ionicons name="lock-closed" size={32} color="#007AFF" />
              </View>

              <Text style={styles.lockTitle}>Almost There</Text>
              <Text style={styles.lockSubtitle}>
                Once you've added {logsRequired} logs, your Trend Tracker will
                reveal helpful patterns and insights.
              </Text>

              {/* Dynamic Progress Bar */}
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${progressPercent}%` },
                  ]}
                />
              </View>

              <Text style={styles.progressText}>
                {stats.totalLogs} / {logsRequired} Logs Filled • {remaining}{' '}
                more to go!
              </Text>
            </View>
          </View>
        </ScrollView>
      );
    }

    // --- FULL CHARTS VISIBLE SECTION ---
    return (
      <ScrollView
        style={styles.innerScroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <TotalIncidents count={stats.totalLogs} />
        <HeatMap data={stats.heatMapData} />
        <EffectiveTools
          strategies={stats.topStrategies}
          totalLogs={stats.totalLogs}
        />
        <LeastEffectiveTools
          strategies={stats.leastEffectiveStrategies}
          totalLogs={stats.totalLogs}
        />
        <Locations topLocations={stats.topLocations} />
        <PolarAreaChart tags={stats.topTags} />
      </ScrollView>
    );
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}>
      <PageHeader
        title="Trend Tracker"
        iconName="sparkles-outline"
        iconColor="#000000"
        accentColor={Colors.trend_theme}
      />
      <View style={styles.selectorContainer}>
        <ChildSelector
          childrenList={children}
          selectedChildId={selectedChildId}
          onSelectChild={val => {
            const nextId =
              typeof val === 'object' && val !== null ? val.id : val;
            setSelectedChildId(nextId);
          }}
          showAllOption={true}
        />
      </View>
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  innerScroll: { flex: 1, padding: 10 },
  centerStage: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#666', fontSize: 14 },

  // Lock Screen Formatting
  lockScrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  lockContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  lockCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    width: '100%',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  lockTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  lockSubtitle: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 25,
    paddingHorizontal: 10,
  },
  progressBarBg: {
    width: '100%',
    height: 10,
    backgroundColor: '#EEEEEE',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 5,
  },
  progressText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  selectorContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
});

export default InsightsScreen;
