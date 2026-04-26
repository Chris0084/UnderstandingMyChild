import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import InsightCard from './InsightCard';

const { width } = Dimensions.get('window');

const LeastEffectiveTools = ({ strategies, totalLogs }) => {
  if (!strategies || strategies.length === 0) {
    return (
      <InsightCard title="Least Effective Tools">
        <Text style={styles.emptyText}>No ineffective tools logged yet.</Text>
      </InsightCard>
    );
  }

  return (
    <InsightCard title="Least Effective Tools">
      {strategies.map((item, index) => {
        const barWidth =
          totalLogs > 0 ? (item.count / totalLogs) * (width * 0.5) : 0;

        return (
          <View key={index} style={styles.row}>
            <View style={styles.barContainer}>
              <Text style={styles.strategyName} numberOfLines={1}>
                {item.name}
              </Text>
              {/* Change bar color to Red/Orange */}
              <View style={[styles.bar, { width: barWidth }]} />
            </View>
            <Text style={styles.countText}>{item.count}x</Text>
          </View>
        );
      })}
    </InsightCard>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  barContainer: { flex: 1, marginRight: 10 },
  strategyName: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
    fontWeight: '500',
  },
  bar: {
    height: 8,
    backgroundColor: '#FF5252', // Red for "Least Effective"
    borderRadius: 4,
  },
  countText: {
    fontWeight: 'bold',
    color: '#D32F2F', // Darker Red
    fontSize: 14,
    minWidth: 30,
    textAlign: 'right',
  },
  emptyText: { color: '#999', fontStyle: 'italic', textAlign: 'center' },
});

export default LeastEffectiveTools;
