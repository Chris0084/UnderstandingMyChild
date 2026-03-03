import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import StrategyRow from './StrategyRow';

const StrategyMatrix = ({ label, values, onValueChange, editable }) => {
  const strategies = [
    'Ear defenders',
    'Weighted blanket',
    'Visual timetables',
    'Now and Next board',
    'Calm down space',
    'Emotion Cards',
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.mainLabel}>{label}</Text>

      {/* Table Header */}
      <View style={styles.header}>
        <View style={{ flex: 2 }} />
        <View style={styles.headerOptions}>
          <Text style={styles.headerText}>N/U</Text>
          <Text style={styles.headerText}>N/E</Text>
          <Text style={styles.headerText}>Eff</Text>
          <Text style={styles.headerText}>V/Eff</Text>
        </View>
      </View>

      {strategies.map(strat => (
        <StrategyRow
          key={strat}
          label={strat}
          selectedValue={values[strat]}
          onSelect={val => onValueChange(strat, val)}
          editable={editable}
        />
      ))}

      {/* Legend for abbreviations */}
      <Text style={styles.legend}>
        N/U: Not used | N/E: Not effective | Eff: Effective | V/Eff: Very
        effective
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '95%',
    marginBottom: 10,
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 12,
  },
  mainLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#999',
    letterSpacing: 1,
    marginBottom: 15,
    textTransform: 'uppercase',
  },
  header: { flexDirection: 'row', marginBottom: 5, paddingBottom: 5 },
  headerOptions: {
    flex: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#AAA',
    flex: 1,
    textAlign: 'center',
  },
  legend: {
    fontSize: 10,
    color: '#AAA',
    marginTop: 10,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

export default StrategyMatrix;
