import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors'; // Adjust path if needed

/**
 * Updated NavCard Component
 * @param {string} title - The main bold header (e.g., 'Information').
 * @param {string} description - The smaller text below (e.g., 'Access expert resources...').
 * @param {string} iconName - Ionicons name for the top-left circle.
 * @param {string} accentColor - The color for the icon circle background.
 * @param {string} iconColor - The color of the 'i' icon itself.
 */
const NavCard = ({
  title,
  description,
  onPress,
  iconName = 'information', // Standard 'i' in circle
  accentColor = '#d0f4e7', // Light sage green from image
  iconColor = '#000000', // Darker sage from image
  backgroundColor = '#d9efd9',
  style,
}) => {
  return (
    <TouchableOpacity
      style={[styles.card, style, { backgroundColor: backgroundColor }]}
      onPress={onPress}
      activeOpacity={0.8}>
      {/* HEADER ROW: Icon and Title together */}
      <View style={styles.headerRow}>
        <View style={[styles.iconCircle, { backgroundColor: accentColor }]}>
          <Ionicons name={iconName} size={30} color={iconColor} />
        </View>
        <Text style={styles.titleText}>{title}</Text>
      </View>

      {/* DESCRIPTION: Sits underneath the header row */}
      <Text style={styles.descriptionText} numberOfLines={5}>
        {description}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    alignItems: 'flex-start',
    width: '100%',
    // Set a good default height, but allow it to grow if needed
    minHeight: 100,
    backgroundColor: '#fff', // Unified background
    borderRadius: 24, // Matches image_0.png
    padding: 20, // General internal padding
    marginVertical: 10,
    // Modern "Striking" Shadows
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  headerRow: {
    flexDirection: 'row', // Only the icon and title are in a row
    alignItems: 'center',
    marginBottom: 12,
  }, // Space between title and description
  iconCircle: {
    width: 45,
    height: 45,
    borderRadius: 22.5, // Half of 45 for a perfect circle
    backgroundColor: '#c3efc3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    marginTop: 5, // <--- Gives the icon a little "breathing room" from the top padding
  },
  textContainer: {
    flex: 1, // Takes up remaining horizontal space
    justifyContent: 'flex-start',
    paddingTop: 2, // Centers text blocks vertically
    paddingTop: 5, // Tweak alignment with icon
  },
  titleText: {
    fontSize: 26,
    fontWeight: '700', // Matches your "Striking" style guide
    color: '#333',
    //  marginBottom: 18,
    flex: 1,
  },
  descriptionText: {
    textAlign: 'left',
    fontSize: 18,
    color: '#666',
    lineHeight: 20, // Improves readability for longer text
    fontWeight: '400',
  },
});

export default NavCard;
