import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { trackAnalyticsAndExecute } from '../utils/analyticsHelper';

/**
 * SplitButton Component
 * @param {string} label - Text for the left side.
 * @param {string} iconName - Ionicons name for the right side.
 * @param {string} leftColor - Main background color (75%).
 * @param {string} rightColor - Accent background color (25%).
 * @param {function} onPress - Function to run on click.
 * @param {object} style - Extra positioning styles.
 */
const SplitButton = ({
  label,
  iconName,
  leftColor = '#3B6004',
  rightColor = '#2D4A03',
  onPress,
  style,
}) => {
  const handlePress = () => {
    // Sanitize label to create a clean event key (e.g., "Save Entry" -> "button_split_save_entry")
    const formattedId = (label || 'button')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, '_');

    const eventName = `button_split_${formattedId}`;

    trackAnalyticsAndExecute(eventName, () => {
      if (onPress) {
        onPress();
      }
    });
  };
  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={handlePress}
      activeOpacity={0.8}>
      {/* Left Section (75%) */}
      <View style={[styles.leftSection, { backgroundColor: leftColor }]}>
        <Text style={styles.text}>{label}</Text>
      </View>

      {/* Right Section (25%) */}
      <View style={[styles.rightSection, { backgroundColor: rightColor }]}>
        <Ionicons name={iconName} size={22} color="#FFFFFF" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 56,
    width: '90%',
    alignSelf: 'center',
    borderRadius: 15,
    overflow: 'hidden', // Crucial for rounded corners on the split colors
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    marginVertical: 10,
  },
  leftSection: {
    flex: 3, // Takes up 75%
    justifyContent: 'center',
    paddingLeft: 20,
  },
  rightSection: {
    flex: 1, // Takes up 25%
    justifyContent: 'center',
    alignItems: 'center',
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,255,255,0.1)', // Subtle divider line
  },
  text: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default SplitButton;
