import React from 'react';
import { StyleSheet, View, Image, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const HomeCardWrapper = ({ children, imageSource }) => {
  return (
    <View style={styles.outerContainer}>
      {/* 1. The Header Image */}
      <Image
        source={imageSource}
        style={styles.headerImage}
        resizeMode="cover"
      />

      {/* 2. The Card Container */}
      <View style={styles.cardContainer}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#a7d7dc', // Matches your theme
  },
  headerImage: {
    width: width,
    height: width * 0.6, // Makes the image height proportional
  },
  cardContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    marginTop: -30, // Pulls the card up over the image slightly
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    paddingHorizontal: 25,
    paddingTop: 30,
    // Shadow for elevation
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
});

export default HomeCardWrapper;
