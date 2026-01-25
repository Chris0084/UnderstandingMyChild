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
     <View style={styles.shadowWrapper}>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    width: '90%',    
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4a463f',     // Dark grey color
    marginBottom: 8,   // Space between label and input box
    alignSelf: 'flex-start', // Forces the label to the left even if parent is centered
  },
  shadowWrapper: {
    // 1. Android Shadow
    elevation: 4, 
    
    // 2. iOS Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,

    // 3. Essential for shadows to show on some versions of Android
    backgroundColor: '#f7f5f2', 
    borderRadius: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f7f5f2',
    color: '#000',
  },
});

export default FreeTypeBox;