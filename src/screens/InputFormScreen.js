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

const InputFormScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();

  const [where, setWhere] = useState('');
  const [leadUp, setLeadUp] = useState('');
  const [whatHappened, setWhatHappened] = useState('');
  const [after, setAfter] = useState('');
  const [logDate, setLogDate] = useState(new Date());
  const [selectedTags, setSelectedTags] = useState([]);
  const [mood, setMood] = useState(null);

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
    // Simple validation: Ensure at least 'WHERE' is filled
    if (!where.trim()) {
      Alert.alert('Missing Info', "Please fill in the 'WHERE' field.");
      return;
    }

    try {
      const newEntry = {
        id: Date.now().toString(), // Unique Ref Number
        where,
        leadUp,
        whatHappened,
        after,
        logDate: logDate.toISOString(),
        tags: selectedTags,
        impactLevel: mood,
      };

      // 1. Get existing data
      const existingData = await AsyncStorage.getItem('@app_logs');
      const currentLogs = existingData ? JSON.parse(existingData) : [];

      // 2. Add new entry
      currentLogs.push(newEntry);

      // 3. Save back to AsyncStorage
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
      <Text style={styles.text}>This is the Log Form Screen</Text>
      <FreeTypeBox
        label="WHERE"
        placeholder="Location (e.g Playground, Kitchen)..."
        numLines={2}
        value={where}
        onChangeText={setWhere}
      />
      <FreeTypeBox
        label="LEAD UP"
        placeholder="Triggers or environmental factors..."
        numLines={3}
        value={leadUp}
        onChangeText={setLeadUp}
      />

      <FreeTypeBox
        label="WHAT HAPPENED"
        placeholder="Triggers or environmental factors..."
        numLines={3}
        value={whatHappened}
        onChangeText={setWhatHappened}
      />

      <FreeTypeBox
        label="AFTER"
        placeholder="Immediate outcome or recovery..."
        numLines={3}
        value={after}
        onChangeText={setAfter}
      />
      <DateStamp label="DATE" date={logDate} onChange={setLogDate} />

      <TagSelector
        label="TAGS"
        tags={availableTags}
        selectedTags={selectedTags}
        onToggle={handleTagToggle}
      />

      <MoodRadioGroup
        label="IMPACT LEVEL"
        selectedValue={mood} // This tells the component which one to highlight
        onSelect={setMood}
      />

      {/* --- CUSTOM SUBMIT BUTTON --- */}

      <View style={styles.buttonContainer}>
        <CustomButton
          label="Save Entry"
          color="#4CAF50" // Green hex
          onPress={handleSaveEntry}
          style={styles.halfButton}
        />

        <CustomButton
          label="Go Back"
          color="#757575" // Grey hex
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
