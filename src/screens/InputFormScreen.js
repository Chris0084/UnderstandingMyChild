import React, { useState } from 'react';
import { ScrollView, Text, StyleSheet, Button } from 'react-native';
import FreeTypeBox from '../components/FreeTypeBox';
import DateStamp from '../components/DateStamp';
import TagSelector from '../components/TagSelector';

const InputFormScreen = ({ navigation }) => {
const [observations, setObservations] = useState('');
const [logDate, setLogDate] = useState(new Date());

//  State for selected tags
  const [selectedTags, setSelectedTags] = useState([]);

//   list of tag names
  const availableTags = ['Urgent', 'Routine', 'Maintenance', 'Safety', 'Follow-up'];

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


  <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.text}>This is the Log Form Screen</Text>
      <FreeTypeBox
      label="Observations"
        placeholder="Type your observations here..."
        numLines={5}
      />
       <FreeTypeBox
      label="Notes"
        placeholder="Type your notes here..."
        numLines={3}
      />
  
      <DateStamp label="Log Date" date={logDate} onChange={setLogDate} />

      <TagSelector 
        label="Select Tags"
        tags={availableTags}
        selectedTags={selectedTags}
        onToggle={handleTagToggle}
      />
      <Button title="Go Back" onPress={() => navigation.goBack()} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 20, marginBottom: 20 }
});

export default InputFormScreen;