import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

/**
 * Logo Component
 * @param {object} source - The image requirement (e.g., require('../../assets/logo.png'))
 * @param {number} size - Optional override for width/height
 */
const Logo = ({ source, size = 120 }) => {
  return (
    <View style={styles.container}>
      <Image 
        source={source} 
        style={[styles.image, { width: size, height: size }]} 
        resizeMode="contain" // Ensures the image isn't cropped awkwardly
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 20, // Adds space above and below the logo
  },
  image: {
    // Default styles can go here
  },
});

export default Logo;