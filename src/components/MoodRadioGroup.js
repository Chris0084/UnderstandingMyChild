import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const MoodRadioGroup = ({
  label,
  selectedValue,
  onSelect,
  editable = true,
}) => {
  // 1. Define the 4 options with their unique colors
  const options = [
    { id: 'CALMING', color: '#B8E2C8', icon: '☁️' }, // Green
    { id: 'NEUTRAL', color: '#94A684', icon: '⚖️' }, // Blue
    { id: 'CHALLENGING', color: '#F9E897', icon: '⚡' }, // Orange
    { id: 'OVERWHELMING', color: '#FFB3B3', icon: '💥' }, // Red
  ];

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View style={styles.grid}>
        {options.map(option => {
          const isSelected = selectedValue === option.id;

          return (
            <TouchableOpacity
              key={option.id}
              onPress={() => {
                if (editable) {
                  onSelect(option.id);
                }
              }}
              activeOpacity={editable ? 0.7 : 1}
              style={[
                styles.square,
                {
                  backgroundColor: isSelected
                    ? option.color
                    : option.color + '20', // Light background version
                  borderColor: isSelected ? '#000000' : 'transparent',

                  borderWidth: isSelected ? 3 : 0, // Highlighted border
                },
              ]}>
              {/* Icon Placeholder */}
              <Text style={styles.iconText}>{option.icon}</Text>

              <Text style={[styles.optionText, { color: '#000000' }]}>
                {option.id}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 15,
    width: '90%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  square: {
    width: '23%', // Fits two per row with a small gap
    aspectRatio: 1, // Keeps it a perfect square
    borderRadius: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '2%', // Vertical gap between rows
    // Shadow for a "button" feel
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  iconText: {
    fontSize: 14,
    marginBottom: 8,
  },
  optionText: {
    fontSize: 8,
    fontWeight: 'Bold',
    letterSpacing: 0.5,
  },
});

export default MoodRadioGroup;
