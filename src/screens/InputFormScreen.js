import React, { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, Text, StyleSheet, Button } from 'react-native';
import FreeTypeBox from '../components/FreeTypeBox';
import DateStamp from '../components/DateStamp';
import TagSelector from '../components/TagSelector';
import MoodRadioGroup from '../components/MoodRadioGroup';

const InputFormScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();

  const [observations, setObservations] = useState('');
  const [logDate, setLogDate] = useState(new Date());
  const [selectedTags, setSelectedTags] = useState([]);
  const [mood, setMood] = useState(null);



//   list of tag names
  const availableTags = ['Sensory', 'Communication', 'Routine', 'Social Connection', 'Self-Regulated', 'Executive Function'];

//   The logic to add/remove tags
  const handleTagToggle = (tag) => {
    if (selectedTags.includes(tag)) {
      // Remove tag if it exists
      setSelectedTags(selectedTags.filter(item => item !== tag));
    } else {
      // Add tag if it doesn't exist
      setSelectedTags([...selectedTags, tag]);
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
      />
       <FreeTypeBox
      label="LEAD UP"
        placeholder="Triggers or environmental factors..."
        numLines={3}
      />

       <FreeTypeBox
      label="WHAT HAPPENED"
        placeholder="Triggers or environmental factors..."
        numLines={3}
      />

     < FreeTypeBox
      label="AFTER"
        placeholder="Immediate outcome or recovery..."
        numLines={3}
      />  
      <DateStamp label="DATE" date={logDate} onChange={setLogDate} />

      <TagSelector 
        label="TAGS"
        tags={availableTags}
        selectedTags={selectedTags}
        onToggle={handleTagToggle}
      />

      <MoodRadioGroup label="IMPACT LEVEL"
        selectedValue={mood} // This tells the component which one to highlight
        onSelect={setMood} />
      <Button title="Go Back" onPress={() => navigation.goBack()} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#ffffff',
    paddingBottom: 40,
 },
  text: { fontSize: 20, marginBottom: 20 }
});

export default InputFormScreen;