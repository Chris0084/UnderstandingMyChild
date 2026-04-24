import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, FlatList, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SortButton from '../components/SortButton';
import * as Clipboard from 'expo-clipboard';
import { Alert, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { SAMPLE_LOGS } from '../constants/sampleData';

// Component Imports
import LogCard from '../components/LogCard';
import CustomButton from '../components/CustomButton';
import FilterButton from '../components/FilterButton';
import FilterModal from '../components/FilterModal';
import PageHeader from '../components/PageHeader.js';
import Colors from '../constants/Colors.js';

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
  const [filterMediaOnly, setFilterMediaOnly] = useState(false);

  // Filter states
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
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

    if (showFavoritesOnly) {
      result = result.filter(log => log.isFavorite === true);
    }

    if (filterMediaOnly) {
      // Only keep logs that have an image or a video URI
      result = result.filter(log => log.mediaUri || log.mediaUri);
    }
    // ----------------------

    if (filterTags.length > 0) {
      result = result.filter(
        log => log.tags && log.tags.some(t => filterTags.includes(t)),
      );
    }

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
  }, [
    allLogs,
    filterTags,
    filterMood,
    isAscending,
    showFavoritesOnly,
    filterMediaOnly,
  ]);

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
    setShowFavoritesOnly(false);
    setFilterMediaOnly(false);
  };

  const exportFavoritesToPDF = async () => {
    console.log('QQQ');
    // 1. Filter only the favorites from your master list
    const favorites = allLogs.filter(log => log.isFavorite);
    console.log('DEBUG FAVORITES:', JSON.stringify(favorites[0], null, 2));

    if (favorites.length === 0) {
      Alert.alert(
        'No Favorites',
        'Please mark some entries as favorites first.',
      );
      return;
    }

    // 2. Generate the HTML String
    const htmlContent = `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; background-color: #f4f4f4; }
          h1 { text-align: center; color: #1A1A1A; font-size: 28px; margin-bottom: 40px; text-transform: uppercase; letter-spacing: 2px; }
          
          .report-card { 
            background-color: white; 
            border-radius: 20px; 
            padding: 30px; 
            margin-bottom: 30px; 
            page-break-inside: avoid;
            border: 1px solid #e0e0e0;
          }
          
          .header-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px; }
          .report-date { font-size: 18px; font-weight: bold; color: #1A1A1A; }
          .fav-star { color: #f80909; font-size: 24px; }

          .tag-row { display: flex; flex-wrap: wrap; margin-bottom: 20px; }
          .report-tag { 
            background-color: #F0F2F5; 
            padding: 6px 12px; 
            border-radius: 8px; 
            margin-right: 8px; 
            margin-bottom: 8px;
          }
          .report-tag-text { font-size: 10px; font-weight: 800; color: #555; letter-spacing: 1px; }
          
          .report-section { margin-top: 20px; }
          .report-label { font-size: 12px; font-weight: 900; color: #999; letter-spacing: 1.5px; margin-bottom: 6px; display: block; }
          .report-sub-label { font-size: 14px; font-weight: bold; color: #444; margin-top: 12px; display: block; }
          .report-value { font-size: 15px; color: #333; line-height: 1.6; margin-top: 4px; display: block; }
          
          .divider { border-top: 2px solid #f0f0f0; margin-top: 25px; padding-top: 20px; }
          
          .strategy-row { display: flex; align-items: center; margin-top: 10px; }
          .dot { height: 8px; width: 8px; border-radius: 50%; display: inline-block; margin-right: 10px; }
          .effective { background-color: #4CAF50; }
          .ineffective { background-color: #F44336; }
          .strategy-text { font-size: 14px; color: #333; }
        </style>
      </head>
      <body>
        <h1>Favorite Observations</h1>
      ${favorites
        .map(log => {
          // 1. Date Handling
          const logDate = log.logDate ? new Date(log.logDate) : new Date();

          // 2. Title Logic (Using your 'where' key from debug)
          const displayTitle = log.where ? log.where : 'Observation';

          // 3. Strategies Handling
          const strategies = log.strategies || {};
          const strategyEntries = Object.entries(strategies).filter(
            ([_, v]) => v !== 'Not used',
          );

          return `
    <div class="report-card">
      <div class="header-top">
        <div style="display: flex; flex-direction: column;">
          <span class="report-date">${logDate.toDateString()}</span>
          <span style="font-size: 15px; color: #007AFF; font-weight: bold; margin-top: 4px; text-transform: uppercase;">
            ${displayTitle}
          </span>
        </div>
        <span class="fav-star">★</span>
      </div>

      <div class="tag-row">
        ${
          log.tags && log.tags.length > 0
            ? log.tags
                .map(
                  tag =>
                    `<div class="report-tag"><span class="report-tag-text">${tag.toUpperCase()}</span></div>`,
                )
                .join('')
            : '<span style="color: #999; font-size: 12px;">No tags selected</span>'
        }
      </div>

      <div class="report-section">
        <span class="report-label">OBSERVATION DETAILS</span>
        
        <span class="report-sub-label">Lead Up:</span>
        <span class="report-value">${log.leadUp || 'No details recorded.'}</span>
        
        <span class="report-sub-label">What Happened:</span>
        <span class="report-value">${log.whatHappened || 'No details recorded.'}</span>
        
        <span class="report-sub-label">Recovery/After:</span>
        <span class="report-value">${log.after || 'No details recorded.'}</span>
      </div>

      <div class="report-section divider">
        <span class="report-label">SUPPORT STRATEGIES USED</span>
        ${
          strategyEntries.length === 0
            ? '<span style="color: #999; font-size: 14px;">No specific strategies were recorded.</span>'
            : strategyEntries
                .map(
                  ([name, value]) => `
                <div class="strategy-row">
                  <span class="dot ${value.includes('Effective') ? 'effective' : 'ineffective'}"></span>
                  <span class="strategy-text"><strong>${name}:</strong> ${value}</span>
                </div>
              `,
                )
                .join('')
        }
      </div>
    </div>
  `;
        })
        .join('')}
      </body>
    </html>
  `;

    // 3. Generate PDF and Launch Sharing Menu
    try {
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });

      await Sharing.shareAsync(uri, {
        UTI: '.pdf',
        mimeType: 'application/pdf',
        dialogTitle: 'Share your favorite observations',
      });
    } catch (error) {
      console.error('PDF Generation Error:', error);
      Alert.alert('Error', 'Something went wrong while creating the PDF.');
    }
  };

  // --- THE RETURN STATEMENT ---
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <PageHeader
        title={'Journal'}
        iconName={'book-outline'}
        iconColor={'#000000'}
        accentColor={Colors.journal_theme}></PageHeader>

      <View style={styles.buttonRow}>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            onPress={() => setShowFavoritesOnly(!showFavoritesOnly)}
            style={styles.iconCircle}>
            <Ionicons
              name={showFavoritesOnly ? 'star' : 'star-outline'}
              size={22}
              color={showFavoritesOnly ? '#f80909' : '#555'}
            />
          </TouchableOpacity>
          <SortButton
            ascending={isAscending}
            onPress={() => setIsAscending(!isAscending)}
          />
          <FilterButton
            onPress={() => setModalVisible(true)}
            activeFiltersCount={
              filterTags.length +
              (filterMood ? 1 : 0) +
              (showFavoritesOnly ? 1 : 0) +
              (filterMediaOnly ? 1 : 0)
            }
          />
          <TouchableOpacity
            onPress={exportFavoritesToPDF}
            style={styles.exportLabelButton}>
            <Ionicons name="share-outline" size={18} color="#007AFF" />
            <Text style={styles.exportLabelText}>Export/Share Favorites</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={filteredLogs}
        keyExtractor={item => item.id}
        renderItem={({ item, index }) => (
          <LogCard entry={item} isAlternate={index % 2 === 0} />
        )}
        // Combine the static styles with the dynamic inset value here
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
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
        filterMediaOnly={filterMediaOnly}
        onToggleMediaFilter={() => setFilterMediaOnly(!filterMediaOnly)}
        selectedMood={filterMood}
        onSelectMood={setFilterMood}
        onReset={resetFilters}
      />

      {/* <TouchableOpacity
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
      </TouchableOpacity> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    margin: 20,
    textAlign: 'center',
    color: '#333',
  },
  buttonRow: {
    // flexDirection: 'row',
    // justifyContent: 'space-between',
    // alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap', // <--- THIS IS THE KEY
    rowGap: 10, // Adds space between rows when it wraps
    columnGap: 8, // Adds space between buttons horizontally
    justifyContent: 'flex-start', // Keeps everything to the left
  },
  exportLabelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD', // Light blue background
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    // Matching the shadow/elevation of your other buttons
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    marginLeft: 8,
  },
  exportLabelText: {
    color: '#007AFF',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
  },
  // Add this new style
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8, // Space between star and sort
    // Shadow/Elevation to match Sort/Filter buttons
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  halfButton: {
    width: '35%', // Shrink the Back button slightly to make room
    marginVertical: 0,
  },
  listContent: {},
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
