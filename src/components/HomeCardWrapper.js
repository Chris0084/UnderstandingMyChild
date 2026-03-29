import React from 'react';
import { StyleSheet, View, Image, Dimensions } from 'react-native';
import Colors from '../constants/Colors';

const { width } = Dimensions.get('window');

const HomeCardWrapper = ({
  children,
  imageSource,
  narrowImage = false,
  containImage = false,
}) => {
  return (
    <View style={styles.outerContainer}>
      {/* 1. The Header Image */}
      <Image
        source={imageSource}
        style={[
          styles.headerImage,
          narrowImage && { height: width * 0.3 }, // Overwrites height if true
        ]}
        resizeMode={containImage ? 'contain' : 'cover'}
      />

      {/* 2. The Card Container */}
      <View style={styles.cardContainer}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: Colors.sage, // Matches your theme
  },
  headerImage: {
    width: width,
    height: width * 0.6, // Makes the image height proportional
  },
  cardContainer: {
    flex: 1,
    backgroundColor: Colors.sage,
    marginTop: 0, // Pulls the card up over the image slightly
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    paddingHorizontal: 25,
    paddingTop: 30,
    // Shadow for elevation
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    // elevation: 5,
  },
});

export default HomeCardWrapper;
