import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

/**
 * MainNavButton Component
 * @param {string} title - The text to display inside the button
 * @param {function} onPress - The function to run when clicked
 * @param {string} color - Optional custom background color
 */
const MainNavButton = ({ title, onPress, color = '#007AFF' }) => {
  return (
    <TouchableOpacity 
      style={[styles.button, { backgroundColor: color }]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: '100%',           // Standardizes width for the list of buttons
    paddingVertical: 15,
    borderRadius: 12,        // Modern rounded corners
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,       // Spacing between buttons
    elevation: 3,            // Shadow for Android
    shadowColor: '#000',     // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default MainNavButton;