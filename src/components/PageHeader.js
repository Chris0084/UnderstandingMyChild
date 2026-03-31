import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';

const PageHeader = ({ title, iconName, iconColor = Colors.primary }) => {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.titleRow}>
        <Text style={styles.headerText}>{title}</Text>
        {iconName && (
          <Ionicons
            name={iconName}
            size={48}
            color={iconColor}
            style={styles.iconStyle}
          />
        )}
      </View>
      {/* A subtle "Striking" accent line */}
      <View style={styles.accentLine} />
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
    justifyContent: 'space-between', // Pushes icon to the right
  },
  headerText: {
    fontSize: 32, // Large and striking
    fontWeight: '900', // Extra Bold sans-serif
    color: '#333',
    letterSpacing: -0.5, // Modern, tight kerning
    textTransform: 'capitalize', // Ensures consistent look
    flex: 1, // Allows text to wrap if too long
  },
  iconStyle: {
    marginLeft: 15,
    marginRight: 25,
    // Add a slight shadow to the icon to make it pop
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 2,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25, // Perfect circle
    backgroundColor: '#FFFFFF', // White base
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 15,
    marginRight: 20,
    // High-definition shadow
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  accentLine: {
    height: 8,
    width: '70%', // Short, stylish underline
    backgroundColor: Colors.primary || '#528900',
    marginTop: 2,
    borderRadius: 4,
  },
});

export default PageHeader;
