import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient'; // Import this
import Colors from '../constants/Colors'; // Import your colors

/**
 * SplitButton Component (Diagonal Split)
 * @param {string} label - Text for the button.
 * @param {string} iconName - Ionicons name for the right side.
 * @param {string} mainColor - Left side background color.
 * @param {string} accentColor - Right side (icon) background color.
 * @param {function} onPress - Function to run on click.
 * @param {object} style - Extra positioning styles.
 */
const DiagonalSplitButton = ({
  label,
  iconName,
  mainColor = Colors.button_main, // Defaults to your sage green
  accentColor = '#2D4A03', // Defaults to a dark green
  textColor = '#000000',
  onPress,
  style,
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={0.8}>
      {/* DIAGONAL GRADIENT BACKGROUND */}
      <LinearGradient
        colors={[mainColor, mainColor, accentColor, accentColor]}
        // These 'locations' are the secret. They create the sharp split.
        locations={[0, 0.7, 0.65, 1]} // Line splits sharply at 65%
        // Start is Top-Left (0,0), End is Bottom-Right (1,1) for diagonal
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}>
        {/* TEXT SECTION (Pushed left) */}
        <View style={styles.textWrapper}>
          <Text style={[styles.text, { color: textColor }]}>{label}</Text>
        </View>

        {/* ICON SECTION (Pushed right) */}
        <View style={styles.iconWrapper}>
          <Ionicons name={iconName} size={22} color="#FFFFFF" />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 56,
    width: '90%',
    alignSelf: 'center',
    borderRadius: 15,
    overflow: 'hidden', // Essential to mask the gradient to the corners
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    marginVertical: 10,
  },
  gradient: {
    flex: 1,
    flexDirection: 'row', // Lay out text and icon side-by-side
    alignItems: 'center',
  },
  textWrapper: {
    flex: 3, // Takes up 75% of the space
    paddingLeft: 20,
    justifyContent: 'center',
  },
  iconWrapper: {
    flex: 1, // Takes up 25% of the space
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default DiagonalSplitButton;
