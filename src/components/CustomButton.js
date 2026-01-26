import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

/**
 * CustomButton Component
 * @param {string} label - The text to show on the button.
 * @param {string} color - The hex background color (e.g., '#007AFF').
 * @param {function} onPress - The function to run when clicked.
 * @param {object} style - Optional extra styles for positioning.
 */
const CustomButton = ({ label, color, onPress, style }) => {
  return (
    <TouchableOpacity 
      // We combine a base style with the dynamic background color
      style={[styles.button, { backgroundColor: color }, style]} 
      onPress={onPress}
      activeOpacity={0.7} // Slight fade effect when pressed
    >
      <Text style={styles.text}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    width: '90%', // Standardized width
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    // Add a slight shadow for depth
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});

export default CustomButton;