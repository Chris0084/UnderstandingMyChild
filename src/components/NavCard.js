import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';

const NavCard = ({
  label,
  imageSource,
  onPress,
  iconName = 'arrow-forward-circle-outline',
}) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.imageContainer}>
        {imageSource ? (
          <Image
            source={imageSource}
            style={styles.cardImage}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.iconCircle}>
            <Ionicons
              name={iconName}
              size={50}
              color={Colors.primary || '#2196F3'}
            />
          </View>
        )}
      </View>
      <Text style={styles.cardLabel} numberOfLines={2}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 160,
    height: 190,
    backgroundColor: '#fff',
    borderRadius: 20,
    marginRight: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  imageContainer: {
    width: '100%',
    height: '65%',
    backgroundColor: Colors.bottle || '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 25,
    backgroundColor: '#c3efc3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    padding: 8,
    textAlign: 'center', // Added to look better for navigation
  },
});

export default NavCard;
