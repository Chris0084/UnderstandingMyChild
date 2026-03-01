import React, { useState, useEffect } from 'react';
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

const InputFormScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();

  const existingEntry = route.params?.existingEntry;

  const [where, setWhere] = useState(existingEntry ? existingEntry.where : '');
  const [leadUp, setLeadUp] = useState(
    existingEntry ? existingEntry.leadUp : '',
  );
  const [whatHappened, setWhatHappened] = useState(
    existingEntry ? existingEntry.whatHappened : '',
  );
  const [after, setAfter] = useState(existingEntry ? existingEntry.after : '');
  const [logDate, setLogDate] = useState(
    existingEntry ? new Date(existingEntry.logDate) : new Date(),
  );
  const [selectedTags, setSelectedTags] = useState(
    existingEntry ? existingEntry.tags : [],
  );
  const [mood, setMood] = useState(
    existingEntry ? existingEntry.impactLevel : null,
  );

  const [isEditing, setIsEditing] = useState(!existingEntry);

  const [mediaUri, setMediaUri] = useState(
    existingEntry ? existingEntry.mediaUri : null,
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
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert('Error', 'Could not save entry.');
      console.error(e);
    }
  };

  return (
    <ScrollView
      style={[styles.scrollView, { paddingTop: insets.top }]}
      contentContainerStyle={styles.container}>
      <Text style={styles.text}>
        {existingEntry
          ? isEditing
            ? 'Edit Log'
            : 'View Log'
          : 'New Log Entry'}
      </Text>
      <FreeTypeBox
        label="WHERE"
        placeholder="Location (e.g Playground, Kitchen)..."
        numLines={2}
        value={where}
        onChangeText={setWhere}
        editable={isEditing}
      />
      <FreeTypeBox
        label="LEAD UP"
        placeholder="Triggers or environmental factors..."
        numLines={3}
        value={leadUp}
        onChangeText={setLeadUp}
        editable={isEditing}
      />

      <FreeTypeBox
        label="WHAT HAPPENED"
        placeholder="Triggers or environmental factors..."
        numLines={3}
        value={whatHappened}
        onChangeText={setWhatHappened}
        editable={isEditing}
      />

      <FreeTypeBox
        label="AFTER"
        placeholder="Immediate outcome or recovery..."
        numLines={3}
        value={after}
        onChangeText={setAfter}
        editable={isEditing}
      />
      <DateStamp
        label="DATE"
        date={logDate}
        onChange={setLogDate}
        editable={isEditing}
      />

      <TagSelector
        label="TAGS"
        tags={availableTags}
        selectedTags={selectedTags}
        onToggle={handleTagToggle}
        editable={isEditing}
      />

      <MediaSelector
        label="ATTACHED MEDIA"
        mediaUri={mediaUri}
        onMediaSelected={setMediaUri}
        editable={isEditing}
      />

      <MoodRadioGroup
        label="IMPACT LEVEL"
        selectedValue={mood} // This tells the component which one to highlight
        onSelect={setMood}
        editable={isEditing}
      />

      {/* --- CUSTOM SUBMIT BUTTON --- */}

      <View style={styles.buttonContainer}>
        {isEditing ? (
          <CustomButton
            label="Save Changes"
            color="#4CAF50"
            onPress={handleSaveEntry} // We will update this logic next
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
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingBottom: 40,
  },
  text: { fontSize: 20, marginBottom: 20 },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    marginTop: 20,
  },
  halfButton: {
    width: '48%',
    marginVertical: 0,
  },
});

export default InputFormScreen;
