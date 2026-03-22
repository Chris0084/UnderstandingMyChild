import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import InsightCard from '../insightComponents/InsightCard';

const TotalIncidents = ({ count }) => {
  return (
    <InsightCard title="Total Logs">
      <View style={styles.container}>
        <View style={styles.iconCircle}>
          <Ionicons name="stats-chart" size={24} color="#388E3C" />
        </View>
        <View>
          <Text style={styles.value}>{count}</Text>
        </View>
      </View>
    </InsightCard>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  label: {
    fontSize: 14,
    color: '#757575',
    fontWeight: '600',
  },
  value: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#212121',
  },
});

export default TotalIncidents;
