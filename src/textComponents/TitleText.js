import React from 'react';
import { Text, StyleSheet } from 'react-native';

const TitleText = ({ children, style }) => {
  return (
    // We combine the base style with any extra styles passed in
    <Text style={[styles.title, style]}>{children}</Text>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 10,
    marginTop: 5,
    lineHeight: 28, // Adds a bit of breathing room
    letterSpacing: 0.3,
  },
});

export default TitleText;
