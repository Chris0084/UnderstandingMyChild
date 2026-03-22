import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import InsightCard from './InsightCard'; // Make sure the path is correct

// We need this to calculate the bar width
const { width } = Dimensions.get('window');

const EffectiveTools = ({ strategies, totalLogs }) => {
  // Guard clause: if there is no data yet, show a tiny message
  if (!strategies || strategies.length === 0) {
    return (
      <InsightCard title="Most Effective Tools">
        <Text style={styles.emptyText}>No data available yet.</Text>
      </InsightCard>
    );
  }

  return (
    <InsightCard title="Most Effective Tools">
      {strategies.map((item, index) => {
        // Calculate percentage for the bar width
        // We use a max width of about 60% of the screen
        const barWidth =
          totalLogs > 0 ? (item.count / totalLogs) * (width * 0.5) : 0;

        return (
          <View key={index} style={styles.row}>
            <View style={styles.barContainer}>
              <Text style={styles.strategyName} numberOfLines={1}>
                {item.name}
              </Text>
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  barContainer: {
    flex: 1,
    marginRight: 10,
  },
  strategyName: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
    fontWeight: '500',
  },
  bar: {
    height: 8,
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  countText: {
    fontWeight: 'bold',
    color: '#388E3C',
    fontSize: 14,
    minWidth: 30,
    textAlign: 'right',
  },
  emptyText: {
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

export default EffectiveTools;
