import React from 'react';
import { Text, StyleSheet } from 'react-native';

const BodyText = ({ children, style, fontSize = 16 }) => {
  return (
    <Text
      style={[
        styles.body,
        { fontSize, lineHeight: fontSize * 1.5 }, // Dynamic override
        style,
      ]}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  body: {
    color: '#444444', // Slightly softer than pure black
    marginBottom: 15,
    fontWeight: '400',
    textAlign: 'left',
  },
});

export default BodyText;
