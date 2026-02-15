import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const SortButton = ({ onPress, ascending }) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.text}>Date {ascending ? '↑' : '↓'}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#f0f0f0',
    // Use a fixed height for perfect alignment
    height: 40,
    // OR ensure paddingVertical is identical
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 10, // Add some space between Sort and Filter buttons
    borderColor: '#ccc',
    flexDirection: 'row', // Helps with vertical centering of text
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { color: '#333', fontWeight: '600', fontSize: 13 },
});

export default SortButton;
