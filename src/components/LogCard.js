import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const LogCard = ({ entry }) => {
  const navigation = useNavigation();

  const formattedDate = new Date(entry.logDate).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerText}>{formattedDate}</Text>
          <Text style={styles.headerText}>
            Where: {entry.where.slice(0, 15)}
          </Text>
        </View>

        {/* --- MEDIA INDICATOR --- */}
        {entry.mediaUri && (
          <View style={styles.mediaBadge}>
            <Ionicons name="attach" size={14} color="#4CAF50" />
            <Text style={styles.mediaText}>MEDIA</Text>
          </View>
        )}
      </View>

      {/* Row containing Label and Button */}
      <View style={styles.labelRow}>
        <Text style={styles.label}>WHAT HAPPENED</Text>

        <TouchableOpacity
          style={styles.pillButton}
          onPress={() =>
            navigation.navigate('MainApp', {
              screen: 'InputForm',
              params: { existingEntry: entry }, // 'params' is required for nested navigation
            })
          }>
          <Text style={styles.pillButtonText}>View/Edit</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.value} numberOfLines={2}>
        {entry.whatHappened}
      </Text>

      {/* Bottom section for Tags and Impact */}
      <View style={styles.footer}>
        <View style={styles.tagContainer}>
          {entry.tags?.slice(0, 6).map((tag, index) => (
            <Text key={index} style={styles.tag}>
              {tag}
            </Text>
          ))}
        </View>

        {entry.impactLevel && (
          <Text style={styles.impactText}>{entry.impactLevel}</Text>
        )}
      </View>
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
    paddingBottom: 8,
    marginBottom: 10,
  },
  headerText: { fontWeight: 'bold', color: '#333', fontSize: 13 },

  mediaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9', // Light green background
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  mediaText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#4CAF50', // Green text
    marginLeft: 2,
  },

  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },

  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#999',
    letterSpacing: 0.5,
  },
  value: { fontSize: 14, color: '#444', marginBottom: 10 },

  pillButton: {
    backgroundColor: '#E3F2FD', // Light blue background
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  pillButtonText: {
    color: '#007AFF',
    fontSize: 10,
    fontWeight: 'bold',
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  tagContainer: { flexDirection: 'row', flexWrap: 'wrap', flex: 1 },
  tag: {
    backgroundColor: '#f0f0f0',
    color: '#666',
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginBottom: 4,
    borderRadius: 8,
    fontSize: 9,
    marginRight: 4,
  },
  impactText: {
    fontWeight: '700',
    color: '#f44336',
    fontSize: 10,
    textTransform: 'uppercase',
  },
});

export default LogCard;
