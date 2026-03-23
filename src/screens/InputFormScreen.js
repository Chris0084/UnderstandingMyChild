import React, { useState, useEffect, useCallback } from 'react';
import { TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, Text, StyleSheet, Alert, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Import components
import FreeTypeBox from '../components/FreeTypeBox';
import DateStamp from '../components/DateStamp';
import TagSelector from '../components/TagSelector';
import MoodRadioGroup from '../components/MoodRadioGroup';
import CustomButton from '../components/CustomButton';
import MediaSelector from '../components/MediaSelector';
import StrategyMatrix from '../components/StrategyMatrix';
import StrategyModal from '../components/StrategyModal.js';
import { Ionicons } from '@expo/vector-icons';

const InputFormScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();

  const existingEntry = route.params?.existingEntry;
  const defaultStrategies = {
    'Calm down space': 'Not used',
    'Ear defenders': 'Not used',
    'Emotion Cards': 'Not used',
    'Now and Next board': 'Not used',
    'Visual timetables': 'Not used',
    'Weighted blanket': 'Not used',
  };
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

  // Helper function to update just one strategy
  const handleStrategyChange = (name, value) => {
    setStrategies(prev => ({ ...prev, [name]: value }));
  };

  useFocusEffect(
    useCallback(() => {
      const entry = route.params?.existingEntry;

      if (entry) {
        // If we arrived with an entry (from Reporting), fill the form
        setWhere(entry.where);
        setLeadUp(entry.leadUp);
        setWhatHappened(entry.whatHappened);
        setAfter(entry.after);
        setLogDate(new Date(entry.logDate));
        setSelectedTags(entry.tags || []);
        setMood(entry.impactLevel);
        setMediaUri(entry.mediaUri);
        setStrategies({ ...defaultStrategies, ...entry.strategies });
        setIsEditing(false); // Start in View mode
      } else {
        // If we arrived via Tab or Home (no entry), clear the form
        setWhere('');
        setLeadUp('');
        setWhatHappened('');
        setAfter('');
        setLogDate(new Date());
        setSelectedTags([]);
        setMood(null);
        setMediaUri(null);
        setStrategies(defaultStrategies);
        setIsEditing(true); // Start in New Log mode
      }

      return () => navigation.setParams({ existingEntry: undefined });
    }, [route.params?.existingEntry]),
  );

  useEffect(() => {
    const displayData = async () => {
      const savedData = await AsyncStorage.getItem('@app_logs');
      console.log('DATABASE CONTENT:', JSON.parse(savedData));
    };
    displayData();
  }, []);

  //   list of tag names
  const availableTags = [
    'Sensory',
    'Communication',
    'Routine',
    'Social Connection',
    'Self-Regulated',
    'Executive Function',
    'Sleep',
  ];

  //   The logic to add/remove tags
  const handleTagToggle = tag => {
    if (selectedTags.includes(tag)) {
      // Remove tag if it exists
      setSelectedTags(selectedTags.filter(item => item !== tag));
    } else {
      // Add tag if it doesn't exist
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // --- SUBMIT LOGIC ---
  const handleSaveEntry = async () => {
    if (!where.trim()) {
      Alert.alert('Missing Info', "Please fill in the 'WHERE' field.");
      return;
    }

    try {
      const newEntry = {
        // Use the existing ID if editing, otherwise create a new one
        id: existingEntry ? existingEntry.id : Date.now().toString(),
        where,
        leadUp,
        whatHappened,
        after,
        logDate: logDate.toISOString(),
        tags: selectedTags,
        impactLevel: mood,
        mediaUri,
        strategies,
      };

      const existingData = await AsyncStorage.getItem('@app_logs');
      let currentLogs = existingData ? JSON.parse(existingData) : [];

      if (existingEntry) {
        // EDIT MODE: Find the old version by ID and replace it
        currentLogs = currentLogs.map(item =>
          item.id === existingEntry.id ? newEntry : item,
        );
      } else {
        // NEW ENTRY MODE: Just add it to the list
        currentLogs.push(newEntry);
      }

      await AsyncStorage.setItem('@app_logs', JSON.stringify(currentLogs));

      Alert.alert('Saved', 'Your entry has been recorded!', [
        { text: 'OK', onPress: () => setIsEditing(false) },
      ]);
    } catch (e) {
      Alert.alert('Error', 'Could not save entry.');
      console.error(e);
    }
  };

  // This is your new "Report" style view
  const renderReportView = () => (
    <View style={styles.reportCard}>
      <View style={styles.reportHeader}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <Text style={styles.reportDate}>{logDate.toDateString()}</Text>
        </View>
        <View style={styles.reportSection}>
          <Text style={styles.reportLabel}>LOCATION</Text>
          <Text style={styles.reportValue}>{where || 'Not recorded'}</Text>
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

      {/* 2. Media Section (Only shows if there is a URI) */}
      {mediaUri && (
        <View style={styles.reportSection}>
          <Text style={styles.reportLabel}>ATTACHED MEDIA</Text>
          <MediaSelector
            mediaUri={mediaUri}
            editable={false} // This will show the image/video but hide the 'delete' or 'add' buttons
          />
        </View>
      )}

      {/* 3. The Narrative Sections */}

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
      </View>

      {/* 4. Support Strategies Section */}
      <View
        style={[
          styles.reportSection,
          { borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 15 },
        ]}>
        <Text style={styles.reportLabel}>SUPPORT STRATEGIES USED</Text>
        {Object.values(strategies).every(v => v === 'Not used') ? (
          <Text style={styles.placeholderText}>
            No strategies were used for this log.
          </Text>
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
                    <Text style={{ fontWeight: 'bold' }}>{name}:</Text> {value}
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
  // 2. This is your existing Form view (the input boxes)
  const renderFormView = () => (
    <>
      <FreeTypeBox
        label="WHERE"
        placeholder="Location (e.g Playground, Kitchen)..."
        value={where}
        onChangeText={setWhere}
        editable={true}
      />
      <FreeTypeBox
        label="LEAD UP"
        placeholder="Triggers or environmental factors..."
        value={leadUp}
        onChangeText={setLeadUp}
        editable={true}
      />
      <FreeTypeBox
        label="WHAT HAPPENED"
        placeholder="Triggers or environmental factors..."
        value={whatHappened}
        onChangeText={setWhatHappened}
        editable={true}
      />
      <FreeTypeBox
        label="AFTER"
        placeholder="Immediate outcome or recovery..."
        value={after}
        onChangeText={setAfter}
        editable={true}
      />

      <DateStamp
        label="DATE"
        date={logDate}
        onChange={setLogDate}
        editable={true}
      />

      <TagSelector
        label="TAGS"
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

      <CustomButton
        label="Add Support Strategies"
        color="#2196F3"
        onPress={() => setModalVisible(true)}
      />

      {/* Strategy Summary List (Preview while editing) */}
      <View style={styles.summaryContainer}>
        {Object.entries(strategies).map(([name, value]) => {
          if (value !== 'Not used') {
            return (
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
            );
          }
          return null;
        })}
        {Object.values(strategies).every(v => v === 'Not used') && (
          <Text style={styles.placeholderText}>
            No strategies selected yet.
          </Text>
        )}
      </View>
    </>
  );

  return (
    <ScrollView
      style={[styles.scrollView, { paddingTop: insets.top }]}
      contentContainerStyle={styles.container}>
      <Text style={styles.text}>
        {existingEntry
          ? isEditing
            ? 'Edit Log'
            : 'Log Report'
          : 'New Log Entry'}
      </Text>

      {/* --- THE TOGGLE --- */}
      {isEditing ? renderFormView() : renderReportView()}

      <StrategyModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        strategies={strategies}
        onUpdate={handleStrategyChange}
      />

      <View style={styles.buttonContainer}>
        {isEditing ? (
          <CustomButton
            label="Save Changes"
            color="#4CAF50"
            onPress={handleSaveEntry}
            style={styles.halfButton}
          />
        ) : (
          <CustomButton
            label="Edit"
            color="#FFA000"
            onPress={() => setIsEditing(true)}
            style={styles.halfButton}
          />
        )}
        <CustomButton
          label="Go Back"
          color="#757575"
          onPress={() => navigation.goBack()}
          style={styles.halfButton}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
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
});

export default InputFormScreen;
