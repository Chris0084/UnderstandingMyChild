import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Colors from '../constants/Colors';

const PageHeader = ({
  title,
  iconName,
  iconColor = Colors.primary,
  accentColor,
  showHomeButton = true,
  homeRouteName = 'Home', // Change if your main screen route has a different name
  onHomePress,
}) => {
  const navigation = useNavigation();
  const finalAccentColor = accentColor || iconColor || Colors.primary;

  const handleHomePress = () => {
    if (onHomePress) {
      onHomePress();
    } else {
      navigation.navigate(homeRouteName);
    }
  };

  return (
    <View style={styles.headerContainer}>
      <View style={styles.titleRow}>
        <Text style={styles.headerText}>{title}</Text>

        <View style={styles.rightIconsContainer}>
          {iconName && (
            <Ionicons
              name={iconName}
              size={48}
              color={iconColor}
              style={styles.iconStyle}
            />
          )}
          {showHomeButton && (
            <TouchableOpacity
              style={styles.homeButton}
              onPress={handleHomePress}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="home-outline" size={48} color={iconColor} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* A subtle "Striking" accent line */}
      <View
        style={[styles.accentLine, { backgroundColor: finalAccentColor }]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'transparent',
    marginBottom: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#333',
    letterSpacing: -0.5,
    textTransform: 'capitalize',
    flex: 1,
  },
  rightIconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  homeButton: {
    padding: 6,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconStyle: {
    marginLeft: 8,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  accentLine: {
    height: 8,
    width: '70%',
    backgroundColor: Colors.primary || '#528900',
    marginTop: 2,
    borderRadius: 4,
  },
});

export default PageHeader;
