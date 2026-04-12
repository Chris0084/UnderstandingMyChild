import React, { useState, useEffect, useCallback } from 'react';
import {
  TouchableOpacity,
  ScrollView,
  Text,
  StyleSheet,
  Alert,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

// Import components
import FreeTypeBox from '../components/FreeTypeBox';
import DateStamp from '../components/DateStamp';
import TagSelector from '../components/TagSelector';
import CustomButton from '../components/CustomButton';
import MediaSelector from '../components/MediaSelector';
import StrategyModal from '../components/StrategyModal.js';
import Colors from '../constants/Colors.js';
import PageHeader from '../components/PageHeader.js';
import SplitButton from '../components/SplitButton.js';
import DiagonalSplitButton from '../components/DiagonalSplitButton.js';

const InputFormScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();

  // Use a local variable to make the code cleaner
  const currentEntryParam = route.params?.existingEntry;

  const defaultStrategies = {
    'Calm down space': 'Not used',
    'Ear defenders': 'Not used',
    'Emotion Cards': 'Not used',
    'Now and Next board': 'Not used',
    'Visual timetables': 'Not used',
    'Weighted blanket': 'Not used',
  };

  const [isFavorite, setIsFavorite] = useState(false);
  const [allLogs, setAllLogs] = useState([]);
  const [where, setWhere] = useState('');
  const [leadUp, setLeadUp] = useState('');
  const [whatHappened, setWhatHappened] = useState('');
  const [after, setAfter] = useState('');
  const [logDate, setLogDate] = useState(new Date());
  const [selectedTags, setSelectedTags] = useState([]);
  const [mood, setMood] = useState(null);
  const [mediaUri, setMediaUri] = useState(null);
  const [isEditing, setIsEditing] = useState(true);
  const [strategies, setStrategies] = useState(defaultStrategies);
  const [modalVisible, setModalVisible] = useState(false);

  // Load ALL logs once when component mounts
  useEffect(() => {
    const fetchAllLogs = async () => {
      const savedData = await AsyncStorage.getItem('@app_logs');
      if (savedData) {
        const parsed = JSON.parse(savedData);
        const sorted = parsed.sort(
          (a, b) => new Date(b.logDate) - new Date(a.logDate),
        );
        setAllLogs(sorted);
      }
    };
    fetchAllLogs();
  }, []);

  // Sync the form fields whenever the route param changes (like when using arrows)
  useFocusEffect(
    useCallback(() => {
      // 1. Grab params
      const entry = route.params?.existingEntry;
      const modeParam = route.params?.mode;

      // 2. Logic: If we have an entry, load it. If NOT, we MUST reset everything.
      if (entry && Object.keys(entry).length > 0) {
        setIsFavorite(entry.isFavorite || false);
        setWhere(entry.where || '');
        setLeadUp(entry.leadUp || '');
        setWhatHappened(entry.whatHappened || '');
        setAfter(entry.after || '');
        setLogDate(new Date(entry.logDate));
        setSelectedTags(entry.tags || []);
        setMediaUri(entry.mediaUri || null);
        setStrategies({ ...defaultStrategies, ...entry.strategies });

        // If mode is 'renderReportView', show report. Otherwise, show edit form.
        setIsEditing(modeParam !== 'renderReportView');
      } else {
        // THIS IS THE FIX: Explicitly clear everything for a New Log
        setWhere('');
        setLeadUp('');
        setWhatHappened('');
        setAfter('');
        setLogDate(new Date());
        setSelectedTags([]);
        setMediaUri(null);
        setStrategies(defaultStrategies);
        setIsEditing(true); // Always show the form for a new log
      }

      // No cleanup function here - it interferes with the Next/Prev arrows
    }, [route.params]), // Watch the whole params object
  );

  const handleToggleFavorite = async () => {
    const currentId = route.params?.existingEntry?.id;
    if (!currentId) return;

    try {
      const newFavoriteStatus = !isFavorite;
      setIsFavorite(newFavoriteStatus);

      const savedData = await AsyncStorage.getItem('@app_logs');
      let logs = savedData ? JSON.parse(savedData) : [];

      // Update the favorite status in the full list
      logs = logs.map(log =>
        log.id === currentId ? { ...log, isFavorite: newFavoriteStatus } : log,
      );

      await AsyncStorage.setItem('@app_logs', JSON.stringify(logs));
      setAllLogs(logs); // Keep our navigation list in sync
    } catch (e) {
      Alert.alert('Error', 'Could not save favorite status.');
    }
  };

  // DELETE LOG
  const handleDeleteLog = () => {
    Alert.alert(
      'Delete Log',
      'Are you sure you want to permanently delete this entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const currentId = route.params?.existingEntry?.id;
              const savedData = await AsyncStorage.getItem('@app_logs');
              let logs = savedData ? JSON.parse(savedData) : [];

              // Filter out the current log
              const updatedLogs = logs.filter(log => log.id !== currentId);

              await AsyncStorage.setItem(
                '@app_logs',
                JSON.stringify(updatedLogs),
              );
              setAllLogs(updatedLogs); // Update local list

              Alert.alert('Deleted', 'Entry removed successfully.');
              navigation.goBack(); // Take user back to the list
            } catch (e) {
              Alert.alert('Error', 'Could not delete entry.');
            }
          },
        },
      ],
    );
  };

  const handleStrategyChange = (name, value) => {
    setStrategies(prev => ({ ...prev, [name]: value }));
  };

  const navigateLogs = direction => {
    const currentId = route.params?.existingEntry?.id;
    const currentIndex = allLogs.findIndex(log => log.id === currentId);

    // Direction -1 is Newer (up the array), 1 is Older (down the array)
    const nextIndex = currentIndex + direction;

    if (nextIndex >= 0 && nextIndex < allLogs.length) {
      const nextLog = allLogs[nextIndex];
      // This will trigger the useFocusEffect above to update the UI
      navigation.setParams({ existingEntry: nextLog });
    } else {
      Alert.alert(
        'End of logs',
        direction === 1
          ? "You've reached the oldest log."
          : "You're looking at the most recent log.",
      );
    }
  };

  const handleTagToggle = tag => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(item => item !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSaveEntry = async () => {
    if (!where.trim()) {
      Alert.alert('Missing Info', "Please fill in the 'WHERE' field.");
      return;
    }

    try {
      const newEntry = {
        id: currentEntryParam ? currentEntryParam.id : Date.now().toString(),
        where,
        leadUp,
        whatHappened,
        after,
        logDate: logDate.toISOString(),
        tags: selectedTags,
        mediaUri,
        strategies,
        isFavorite: currentEntryParam ? isFavorite : false, // Save favorite status
      };

      const existingData = await AsyncStorage.getItem('@app_logs');
      let currentLogs = existingData ? JSON.parse(existingData) : [];

      if (currentEntryParam) {
        currentLogs = currentLogs.map(item =>
          item.id === currentEntryParam.id ? newEntry : item,
        );
      } else {
        currentLogs.push(newEntry);
      }

      await AsyncStorage.setItem('@app_logs', JSON.stringify(currentLogs));

      // Update local allLogs list so navigation arrows work with the new data
      const sorted = currentLogs.sort(
        (a, b) => new Date(b.logDate) - new Date(a.logDate),
      );
      setAllLogs(sorted);

      Alert.alert('Saved', 'Your entry has been recorded!', [
        { text: 'OK', onPress: () => setIsEditing(false) },
      ]);
    } catch (e) {
      Alert.alert('Error', 'Could not save entry.');
    }
  };

  const availableTags = [
    'Sensory',
    'Communication',
    'Routine',
    'Social Connection',
    'Self-Regulated',
    'Executive Function',
    'Sleep',
  ];

  const renderReportView = () => (
    <View style={styles.reportCard}>
      <View style={styles.navRow}>
        {/* PREV (Moves to an OLDER log) */}
        <TouchableOpacity
          onPress={() => navigateLogs(+1)} // +1 moves further down the list to older dates
          style={styles.navButton}>
          <Ionicons name="chevron-back" size={24} color="#2196F3" />
          <Text style={styles.navText}>Prev</Text>
        </TouchableOpacity>

        <Text style={styles.logCounter}>
          {/* {allLogs.findIndex(l => l.id === route.params?.existingEntry?.id) +
            allLogs.length}{' '}
          of {allLogs.length} */}
          {allLogs.length -
            allLogs.findIndex(
              l => l.id === route.params?.existingEntry?.id,
            )}{' '}
          of {allLogs.length}
        </Text>

        {/* NEXT (Moves to a NEWER log) */}
        <TouchableOpacity
          onPress={() => navigateLogs(-1)} // -1 moves up the list toward index 0 (today)
          style={styles.navButton}>
          <Text style={styles.navText}>Next</Text>
          <Ionicons name="chevron-forward" size={24} color="#2196F3" />
        </TouchableOpacity>
      </View>

      <View style={styles.reportHeader}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <Text style={styles.reportDate}>{logDate.toDateString()}</Text>

          {/* ACTION BUTTONS (Fav and Delete) */}
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity
              onPress={handleToggleFavorite}
              style={{ marginRight: 25 }}>
              <Ionicons
                name={isFavorite ? 'star' : 'star-outline'}
                size={30}
                color={isFavorite ? '#f80909' : '#999'}
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={handleDeleteLog}>
              <Ionicons name="trash-outline" size={30} color="#F44336" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.tagRow}>
          {selectedTags.length > 0 ? (
            selectedTags.map(tag => (
              <View key={tag} style={styles.reportTag}>
                <Text style={styles.reportTagText}>{tag.toUpperCase()}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.placeholderText}>No tags selected</Text>
          )}
        </View>
      </View>

      <View style={styles.reportSection}>
        <Text style={styles.reportLabel}>LOCATION</Text>
        <Text style={styles.reportValue}>{where || 'Not recorded'}</Text>
      </View>
      <View style={styles.reportSection}>
        <Text style={styles.reportLabel}>DETAILS</Text>
        <Text style={styles.reportSubLabel}>Lead Up:</Text>
        <Text style={styles.reportValue}>{leadUp || 'No details'}</Text>
        <Text style={[styles.reportSubLabel, { marginTop: 10 }]}>
          What Happened:
        </Text>
        <Text style={styles.reportValue}>{whatHappened || 'No details'}</Text>
        <Text style={[styles.reportSubLabel, { marginTop: 10 }]}>
          Recovery/After:
        </Text>
        <Text style={styles.reportValue}>{after || 'No details'}</Text>
        {mediaUri && (
          <View style={styles.reportSection}>
            <Text style={styles.reportLabel}>ATTACHED MEDIA</Text>
            <MediaSelector mediaUri={mediaUri} editable={false} />
          </View>
        )}
      </View>

      <View
        style={[
          styles.reportSection,
          { borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 15 },
        ]}>
        <Text style={styles.reportLabel}>SUPPORT STRATEGIES USED</Text>
        {Object.values(strategies).every(v => v === 'Not used') ? (
          <Text style={styles.placeholderText}>No strategies were used.</Text>
        ) : (
          Object.entries(strategies).map(([name, value]) => {
            if (value !== 'Not used') {
              return (
                <View key={name} style={styles.reportStrategyRow}>
                  <Ionicons
                    name={
                      value.includes('Effective')
                        ? 'checkmark-circle'
                        : 'close-circle'
                    }
                    size={18}
                    color={value.includes('Effective') ? '#4CAF50' : '#F44336'}
                  />
                  <Text style={styles.reportValue}>
                    <Text style={{ fontWeight: 'bold' }}> {name}:</Text> {value}
                  </Text>
                </View>
              );
            }
            return null;
          })
        )}
      </View>
    </View>
  );

  const renderFormView = () => (
    <>
      <FreeTypeBox
        label="WHERE"
        placeholder="Location (e.g Playground, Kitchen)..."
        value={where}
        onChangeText={setWhere}
        editable={true}
        accentColor={Colors.box_accent}
      />
      <FreeTypeBox
        label="LEAD UP"
        placeholder="Triggers or environmental factors..."
        value={leadUp}
        onChangeText={setLeadUp}
        editable={true}
        accentColor={Colors.box_accent}
      />
      <FreeTypeBox
        label="WHAT HAPPENED"
        placeholder="Triggers or environmental factors..."
        value={whatHappened}
        onChangeText={setWhatHappened}
        editable={true}
        accentColor={Colors.box_accent}
      />
      <FreeTypeBox
        label="AFTER"
        placeholder="Immediate outcome or recovery..."
        value={after}
        onChangeText={setAfter}
        editable={true}
        accentColor={Colors.box_accent}
      />
      <DateStamp
        label="DATE"
        date={logDate}
        onChange={setLogDate}
        editable={true}
      />
      <TagSelector
        label="Observation Categories"
        tags={availableTags}
        selectedTags={selectedTags}
        onToggle={handleTagToggle}
        editable={true}
      />
      <MediaSelector
        label="ATTACHED MEDIA"
        mediaUri={mediaUri}
        onMediaSelected={setMediaUri}
        editable={true}
      />
      <SplitButton
        label="Add Support Strategies"
        iconName="help-buoy-outline"
        // mainColor="#F9A825" // Warm Golden Yellow
        // accentColor="#F57F17" // Darker Golden for the split
        leftColor={Colors.button_main} // Your main green
        rightColor={Colors.support_strat_accent} // A slightly darker green
        onPress={() => setModalVisible(true)}
      />
      {/* <CustomButton
        label="Add Support Strategies"
        color="#2196F3"
        onPress={() => setModalVisible(true)}
      /> */}
      <View style={styles.summaryContainer}>
        {Object.entries(strategies).map(
          ([name, value]) =>
            value !== 'Not used' && (
              <View key={name} style={styles.strategyChip}>
                <Ionicons
                  name={
                    value.includes('Effective')
                      ? 'checkmark-circle'
                      : 'close-circle'
                  }
                  size={16}
                  color={value.includes('Effective') ? '#4CAF50' : '#F44336'}
                />
                <Text style={styles.chipText}>
                  <Text style={{ fontWeight: 'bold' }}> {name}:</Text> {value}
                </Text>
                <TouchableOpacity
                  onPress={() => handleStrategyChange(name, 'Not used')}
                  style={styles.deleteIcon}>
                  <Ionicons name="trash-outline" size={16} color="#999" />
                </TouchableOpacity>
              </View>
            ),
        )}
      </View>
    </>
  );

  return (
    <View style={[styles.scrollView, { paddingTop: insets.top }]}>
      <View style={{ width: '100%' }}>
        <PageHeader
          title={
            route.params?.existingEntry
              ? isEditing
                ? 'Edit Journal Entry'
                : 'Log Report'
              : 'New Journal Entry'
          }
          iconName={
            route.params?.existingEntry
              ? isEditing
                ? 'create-outline'
                : 'document-text-outline'
              : 'add-circle-outline'
          }
          iconColor={isEditing ? '#000000' : Colors.primary}
          accentColor={Colors.log_theme}
        />
      </View>

      {/* 2. SCROLLABLE CONTENT: The rest of the form */}
      <ScrollView
        contentContainerStyle={styles.container}
        // This ensures the scrollview background matches the page
        style={{ backgroundColor: Colors.background }}>
        {isEditing ? renderFormView() : renderReportView()}

        <StrategyModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          strategies={strategies}
          onUpdate={handleStrategyChange}
        />

        <View style={styles.buttonContainer}>
          {isEditing ? (
            <SplitButton
              label="Save"
              iconName="save-outline"
              leftColor={Colors.button_main}
              rightColor={Colors.save_button_accent} // A slightly darker green
              onPress={handleSaveEntry}
              style={styles.halfButton}
            />
          ) : (
            <SplitButton
              label="Edit"
              iconName="create-outline"
              leftColor={Colors.button_main} // Your main green
              rightColor={Colors.edit_button_accent} // A slightly darker green
              onPress={() => setIsEditing(true)}
              style={styles.halfButton}
            />
            // <CustomButton
            //   label="Edit"
            //   color="#FFA000"
            //   onPress={() => setIsEditing(true)}
            //   style={styles.halfButton}
            // />
          )}
          {/* <CustomButton
            label="Go Back"
            color="#757575"
            onPress={() => navigation.goBack()}
            style={styles.halfButton}
          /> */}
          <SplitButton
            label="Back"
            iconName="chevron-back-outline"
            leftColor={Colors.button_main}
            rightColor={Colors.back_button_accent}
            onPress={() => navigation.goBack()}
            style={styles.halfButton}
          />
        </View>
      </ScrollView>
    </View>
  );
};

// ... (Your styles remain exactly the same as you had them)

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingBottom: 70,
  },
  text: { fontSize: 20, marginBottom: 20 },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    marginTop: 0,
  },
  halfButton: {
    width: '48%',
    marginVertical: 0,
  },
  summaryContainer: {
    width: '90%',
    flexDirection: 'row',
    flexWrap: 'wrap', // This allows chips to wrap to the next line
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    minHeight: 50,
    marginBottom: 10,
  },
  strategyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingLeft: 10, // Room for the checkmark
    paddingRight: 5, // Less room here because the bin has its own padding
    paddingVertical: 6,
    margin: 4,
    elevation: 1,
  },
  deleteIcon: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 5,
    borderLeftWidth: 1,
    borderLeftColor: '#eee', // Subtle divider line
  },
  chipText: {
    fontSize: 12,
    color: '#333',
    marginLeft: 4,
  },
  reportCard: {
    width: '92%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    // Add shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    // Add elevation for Android
    elevation: 4,
    borderWidth: 1,
    borderColor: '#efefef',
    borderLeftColor: Colors.apricot,
    borderLeftWidth: 20,
  },
  reportHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 15,
    marginBottom: 15,
  },
  reportDate: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  reportLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#999',
    letterSpacing: 1,
    marginBottom: 5,
  },
  reportSection: {
    marginBottom: 20,
  },
  reportSubLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#555',
  },
  reportValue: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  reportTag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginRight: 6,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  reportTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#666',
  },
  reportStrategyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Better for long text wrapping
    marginTop: 10,
    paddingRight: 10,
  },
  placeholderText: {
    fontSize: 14,
    color: '#aaa',
    fontStyle: 'italic',
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
  },
  navText: {
    color: '#2196F3',
    fontWeight: '600',
    fontSize: 14,
  },
  logCounter: {
    fontSize: 12,
    color: '#999',
    fontWeight: 'bold',
  },
});

export default InputFormScreen;
