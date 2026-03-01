import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, FlatList, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SortButton from '../components/SortButton';

// Component Imports
import LogCard from '../components/LogCard';
import CustomButton from '../components/CustomButton';
import FilterButton from '../components/FilterButton';
import FilterModal from '../components/FilterModal';

const ReportingScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();

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
});

export default ReportingScreen;
