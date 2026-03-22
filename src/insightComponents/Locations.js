import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import InsightCard from '../insightComponents/InsightCard';

const Locations = ({ topLocations }) => {
  const formatLocationName = name => {
    if (!name) return 'Unknown';

    return name
      .trim() // Remove white space from start/end
      .toLowerCase() // Lowercase everything first
      .split(' ') // Split into words
      .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
      .join(' '); // Put back together
  };

  return (
    <InsightCard displayWrapper={false} title="High-Frequency Locations">
      <View style={styles.locationContainer}>
        {topLocations.map((item, index) => (
          <View key={index} style={styles.locCard}>
            <Ionicons name="location" size={24} color="#2196F3" />
            <Text style={styles.locName}>{item.name}</Text>
            <Text style={styles.locCount}>{item.count} Incidents</Text>
          </View>
        ))}
      </View>
    </InsightCard>
  );
};

const styles = StyleSheet.create({
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

export default Locations;
