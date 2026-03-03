import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const StrategyRow = ({ label, selectedValue, onSelect, editable }) => {
  const options = [
    'Not used',
    'Made Worse',
    'Not effective',
    'Effective',
    'Very effective',
  ];

  return (
    <View style={styles.row}>
      <Text style={styles.strategyLabel}>{label}</Text>
      <View style={styles.optionsContainer}>
        {options.map(option => {
          const isSelected = selectedValue === option;
          return (
            <TouchableOpacity
              key={option}
              style={styles.cell}
              onPress={() => editable && onSelect(option)}
              disabled={!editable}>
              <Ionicons
                name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                size={22}
                color={isSelected ? '#4CAF50' : '#CCC'}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  strategyLabel: {
    flex: 2, // Gives the text more room
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  },
  optionsContainer: {
    flex: 3, // Aligning the radio buttons
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default StrategyRow;
