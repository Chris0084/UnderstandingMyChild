import React from 'react';
import { Text, StyleSheet } from 'react-native';

const BodyText = ({ children, style }) => {
  return <Text style={[styles.body, style]}>{children}</Text>;
};

const styles = StyleSheet.create({
  body: {
    fontSize: 16,
    // LineHeight is usually 1.4x to 1.6x the font size for readability
    lineHeight: 24,
    color: '#444444', // Slightly softer than pure black
    marginBottom: 15,
    fontWeight: '400',
    textAlign: 'left',
  },
});

export default BodyText;
