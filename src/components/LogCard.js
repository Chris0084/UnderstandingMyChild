import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const LogCard = ({ entry }) => {
  // Format the date to be more readable
  const formattedDate = new Date(entry.logDate).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.headerText}>{formattedDate}</Text>
        <Text style={styles.headerText}>Where: {entry.where.slice(-25)}</Text>
      </View>

      <Text style={styles.label}>WHAT HAPPENED:</Text>
      <Text style={styles.value}>{entry.whatHappened}</Text>

      {entry.tags && entry.tags.length > 0 && (
        <View style={styles.tagContainer}>
          {entry.tags.map((tag, index) => (
            <Text key={index} style={styles.tag}>
              {tag}
            </Text>
          ))}
        </View>
      )}

      {entry.impactLevel && (
        <Text style={styles.impactText}>Impact: {entry.impactLevel}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginVertical: 8,
    width: '95%',
    alignSelf: 'center',
    // Shadow/Elevation
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 5,
    marginBottom: 10,
  },
  headerText: { fontWeight: 'bold', color: '#333' },
  idText: { fontSize: 10, color: '#999' },
  label: { fontSize: 12, fontWeight: '700', color: '#757575', marginTop: 5 },
  value: { fontSize: 15, color: '#333', marginBottom: 5 },
  tagContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 },
  tag: {
    backgroundColor: '#e1f5fe',
    color: '#0288d1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    fontSize: 11,
    marginRight: 5,
    marginBottom: 5,
  },
  impactText: { marginTop: 10, fontWeight: '600', color: '#f44336' },
});

export default LogCard;
