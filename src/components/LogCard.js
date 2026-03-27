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

  // --- STRATEGY LOGIC ---
  // Get all strategies that are NOT "Not used"
  const activeStrategies = Object.entries(entry.strategies || {})
    .filter(([_, value]) => value !== 'Not used')
    .map(([name, value]) => ({ name, value })); // Return an object with both

  const displayStrategies = activeStrategies.slice(0, 3);
  const remainingCount = activeStrategies.length - 3;

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
          <View
            style={[
              styles.mediaBadge,
              // Subtly change background color if it's a video vs photo
              {
                backgroundColor:
                  entry.mediaUri.toLowerCase().endsWith('.mp4') ||
                  entry.mediaUri.toLowerCase().endsWith('.mov')
                    ? '#E8F5E9'
                    : '#FFF3E0',
              },
            ]}>
            {entry.mediaUri.toLowerCase().endsWith('.mp4') ||
            entry.mediaUri.toLowerCase().endsWith('.mov') ? (
              <>
                <Ionicons name="play-circle" size={14} color="#4CAF50" />
                <Text style={[styles.mediaText, { color: '#4CAF50' }]}>
                  VIDEO
                </Text>
              </>
            ) : (
              <>
                <Ionicons name="image" size={14} color="#FF9800" />
                <Text style={[styles.mediaText, { color: '#FF9800' }]}>
                  PHOTO
                </Text>
              </>
            )}
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
              params: { existingEntry: entry, mode: 'renderReportView' }, // 'params' is required for nested navigation
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

        <View style={styles.strategyContainer}>
          {displayStrategies.map((strat, index) => {
            const isNotEffective = strat.value === 'Not effective';

            return (
              <View
                key={index}
                style={[
                  styles.strategyPill,
                  isNotEffective && styles.pillRed, // Apply red background if not effective
                ]}>
                <Ionicons
                  name={
                    isNotEffective ? 'thumbs-down-sharp' : 'thumbs-up-sharp'
                  }
                  size={10}
                  color={isNotEffective ? '#D32F2F' : '#388E3C'}
                />
                <Text
                  style={[
                    styles.strategyText,
                    isNotEffective && styles.textRed,
                  ]}>
                  {strat.name.split('/')[0].trim().slice(0, 10)}
                </Text>
              </View>
            );
          })}
          {remainingCount > 0 && (
            <Text style={styles.moreText}>+{remainingCount}</Text>
          )}
        </View>
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
  strategyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1.5, // Give strategies more room than tags
  },
  strategyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 3,
    maxWidth: 80,
  },
  strategyText: {
    fontSize: 10,
    color: '#2E7D32',
    fontWeight: '600',
    marginLeft: 2,
  },
  moreText: {
    fontSize: 8,
    color: '#999',
    fontWeight: 'bold',
    marginLeft: 4,
  },
});

export default LogCard;
