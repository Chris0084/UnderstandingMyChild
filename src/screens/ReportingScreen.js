import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, FlatList, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SortButton from '../components/SortButton';
import * as Clipboard from 'expo-clipboard';
import { Alert, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SAMPLE_LOGS } from '../constants/sampleData';

// Component Imports
import LogCard from '../components/LogCard';
import CustomButton from '../components/CustomButton';
import FilterButton from '../components/FilterButton';
import FilterModal from '../components/FilterModal';

const ReportingScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();

  const injectSampleData = async () => {
    try {
      // const sampleData = SAMPLE_LOGS;
      const sampleData = [];

      // 1. Get current logs first (so you don't delete your own work)
      const existingData = await AsyncStorage.getItem('@app_logs');
      const parsedExisting = existingData ? JSON.parse(existingData) : [];

      // 2. Combine them
      const newData = [...parsedExisting, ...sampleData];

      // 3. Save back to storage
      await AsyncStorage.setItem('@app_logs', JSON.stringify(newData));

      Alert.alert(
        'Success',
        // '25 sample logs have been added to your database!',
        'This feature is not active at the moment nothing has happened to your data',
      );

      // 4. Refresh the UI
      fetchLogs();
    } catch (e) {
      console.error(e);
    }
  };

  const exportFilteredData = async () => {
    if (filteredLogs.length === 0) {
      Alert.alert(
        'No Data',
        'There are no logs matching your current filters to export.',
      );
      return;
    }

    try {
      // 1. Convert the filtered array to a formatted JSON string
      const jsonString = JSON.stringify(filteredLogs, null, 2);
      console.log('TTT hit here');
      // 2. Copy to clipboard
      await Clipboard.setStringAsync(jsonString);

      Alert.alert(
        'Export Successful',
        `${filteredLogs.length} logs copied to clipboard as JSON. You can now paste this into an email or document.`,
      );
    } catch (error) {
      console.error('Clipboard Error Details:', error);
      Alert.alert('Error', 'Failed to copy data to clipboard.');
    }
  };

  // State Management
  const [allLogs, setAllLogs] = useState([]); // Master data
  const [filteredLogs, setFilteredLogs] = useState([]); // Displayed data
  const [modalVisible, setModalVisible] = useState(false);
  const [isAscending, setIsAscending] = useState(false); // false = Newest First

  // Filter states
  const [filterTags, setFilterTags] = useState([]);
  const [filterMood, setFilterMood] = useState(null);

  const availableTags = [
    'Sensory',
    'Communication',
    'Routine',
    'Social Connection',
    'Self-Regulated',
    'Executive Function',
    'Sleep',
  ];

  // Refresh data every time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchLogs();
    }, []),
  );
  // 2. Apply Filters whenever data or filter choices change
  useEffect(() => {
    let result = [...allLogs];

    if (filterTags.length > 0) {
      result = result.filter(
        log => log.tags && log.tags.some(t => filterTags.includes(t)),
      );
    }

    if (filterMood) {
      result = result.filter(log => log.impactLevel === filterMood);
    }

    result.sort((a, b) => {
      const dateA = new Date(a.logDate);
      const dateB = new Date(b.logDate);
      return isAscending ? dateA - dateB : dateB - dateA;
    });

    setFilteredLogs(result);
  }, [allLogs, filterTags, filterMood, isAscending]);

  const fetchLogs = async () => {
    try {
      const storedData = await AsyncStorage.getItem('@app_logs');
      if (storedData) {
        setAllLogs(JSON.parse(storedData));
      }
    } catch (error) {
      console.error('Error loading logs:', error);
    }
  };

  const resetFilters = () => {
    setFilterTags([]);
    setFilterMood(null);
  };

  // --- THE RETURN STATEMENT ---
  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}>
      <Text style={styles.title}>Activity Report</Text>

      <View style={styles.buttonRow}>
        <CustomButton
          label="Go Back"
          color="#757575"
          onPress={() => navigation.goBack()}
          style={styles.halfButton}
        />
        <View style={styles.actionButtons}>
          <SortButton
            ascending={isAscending}
            onPress={() => setIsAscending(!isAscending)}
          />
          <FilterButton
            onPress={() => setModalVisible(true)}
            activeFiltersCount={filterTags.length + (filterMood ? 1 : 0)}
          />
        </View>
      </View>

      <FlatList
        data={filteredLogs}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <LogCard entry={item} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text>No entries match these filters.</Text>
          </View>
        }
      />

      <FilterModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        tags={availableTags}
        selectedTags={filterTags}
        onToggleTag={tag =>
          setFilterTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag],
          )
        }
        selectedMood={filterMood}
        onSelectMood={setFilterMood}
        onReset={resetFilters}
      />

      <TouchableOpacity
        style={styles.exportButton}
        onPress={exportFilteredData}>
        <Ionicons name="copy-outline" size={18} color="#007AFF" />
        <Text style={styles.exportButtonText}>Copy Filtered Data (JSON)</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.exportButton,
          { backgroundColor: '#f44336', marginTop: 10 },
        ]}
        onPress={injectSampleData}>
        <Ionicons name="flask-outline" size={18} color="#fff" />
        <Text style={[styles.exportButtonText, { color: '#fff' }]}>
          Inject Demo Data
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    margin: 20,
    textAlign: 'center',
    color: '#333',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  actionButtons: {
    flexDirection: 'row', // Put Sort and Filter side-by-side
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  halfButton: {
    width: '35%', // Shrink the Back button slightly to make room
    marginVertical: 0,
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyContainer: {
    marginTop: 50,
    alignItems: 'center',
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E3F2FD',
    padding: 12,
    margin: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  exportButtonText: {
    color: '#007AFF',
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default ReportingScreen;
