import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const InsightCard = ({ title, children, displayWrapper = true }) => {
  if (!displayWrapper) {
    return (
      <View style={styles.wrapper}>
        {title && <Text style={styles.externalTitle}>{title}</Text>}
        <View>{children}</View>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      {title && <Text style={styles.externalTitle}>{title}</Text>}

      <View style={styles.card}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 12,
  },
  externalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#455A64',
    marginBottom: 8,
    marginLeft: 4, // Slight indent to align with the card shadow
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 20,
    // Standard iOS Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Android Elevation
    elevation: 3,
  },
});

export default InsightCard;
