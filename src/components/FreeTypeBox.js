import React from 'react';
import { TextInput, StyleSheet, View, Text } from 'react-native';

/**
 * FreeTypeBox Component
* * @param {string} label - The title that appers on the text box.
* * @param {string} placeholder - The "template text" shown when empty.
 * @param {number} numLines - How many lines of text space to show.
 * @param {string} value - The current text (passed from the parent).
 * @param {function} onChange - The function to run when the user types.
 */
const FreeTypeBox = ({ label, placeholder, numLines, value, onChange }) => {
  return (
    <View style={styles.container}>
        {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input, 
          { height: numLines * 24 } // Sets height based on line count
        ]}
        placeholder={placeholder}
        value={value}
        onChangeText={onChange}
        
        // Essential props for "Free Type" behavior:
        multiline={true}            // Allows text to wrap to new lines
        numberOfLines={numLines}    // Sets initial height on Android
        textAlignVertical="top"     // Forces text to start at the top (Android)
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    width: '90%',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',     // Dark grey color
    marginBottom: 8,   // Space between label and input box
    alignSelf: 'flex-start', // Forces the label to the left even if parent is centered
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#000',
  },
});

export default FreeTypeBox;