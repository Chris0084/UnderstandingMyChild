import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import InsightCard from './InsightCard';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 66) / 8; // Accounts for labels and padding

const HeatMap = ({ data }) => {
  if (!data) return null;

  const times = ['Morning', 'Afternoon', 'Evening', 'Night time'];
  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  // Helper to determine color intensity
  const getCellColor = count => {
    if (count === 0) return '#F5F5F5'; // Empty/Default state

    // 1. Determine where this count sits on a scale of 0 to 1
    const intensity = count / data.maxCount;

    // 2. Map intensity to Hue (60 is Yellow, 0 is Red)
    // As intensity increases, hue decreases toward Red
    const hue = 60 - intensity * 60;

    // 3. Map intensity to Lightness (Optional but makes it look better)
    // This makes low counts a bit lighter/softer and high counts deep and rich
    const lightness = 80 - intensity * 30;

    return `hsl(${hue}, 100%, ${lightness}%)`;
  };

  return (
    <InsightCard displayWrapper={false} title="Weekly Time Patterns">
      <View style={styles.card}>
        <View style={styles.gridContainer}>
          {/* Y-Axis Labels (Times) */}
          <View style={styles.yAxis}>
            {times.map(time => (
              <Text key={time} style={styles.axisLabel}>
                {time.split(' ')[0]}
              </Text>
            ))}
          </View>

          {/* The Grid */}
          <View style={styles.grid}>
            {/* Header Row for Day Labels */}
            <View style={styles.row}>
              {dayLabels.map((label, i) => (
                <Text
                  key={i}
                  style={[
                    styles.axisLabel,
                    { width: COLUMN_WIDTH, textAlign: 'center' },
                  ]}>
                  {label}
                </Text>
              ))}
            </View>

            {/* Data Rows */}
            {times.map((time, timeIdx) => (
              <View key={time} style={styles.row}>
                {data.matrix.map((day, dayIdx) => {
                  const count = day.slots[timeIdx].count;
                  return (
                    <View
                      key={`${dayIdx}-${timeIdx}`}
                      style={[
                        styles.cell,
                        { backgroundColor: getCellColor(count) },
                      ]}>
                      {count > 0 && (
                        <Text style={styles.cellText}>{count}</Text>
                      )}
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        </View>
      </View>
    </InsightCard>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 15,
    marginVertical: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  gridContainer: { flexDirection: 'row' },
  yAxis: {
    justifyContent: 'space-between',
    paddingVertical: 25,
    marginRight: 5,
  },
  axisLabel: { fontSize: 10, color: '#999', fontWeight: 'bold' },
  grid: { flex: 1 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  cell: {
    width: COLUMN_WIDTH,
    height: COLUMN_WIDTH,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellText: { fontSize: 10, fontWeight: 'bold', color: '#000000' },
});

export default HeatMap;
