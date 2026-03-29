import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Colors from '../constants/Colors';

const TagSelector = ({
  label,
  tags,
  selectedTags,
  onToggle,
  editable = true,
}) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View style={styles.tagContainer}>
        {tags.map(tag => {
          // Check if this specific tag is in our "selected" list
          const isSelected = selectedTags.includes(tag);

          return (
            <TouchableOpacity
              key={tag}
              onPress={() => {
                if (editable) {
                  onToggle(tag);
                }
              }}
              // Optional: Reduce the opacity or change style when not editable
              activeOpacity={editable ? 0.7 : 1}
              style={[
                styles.pill,
                isSelected ? styles.pillSelected : styles.pillUnselected,
              ]}>
              <Text
                style={[
                  styles.tagText,
                  isSelected ? styles.textSelected : styles.textUnselected,
                ]}>
                {tag}
              </Text>
            </TouchableOpacity>
          );
        })}
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
    color: '#4a463f',
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap', // This makes tags move to the next line
    gap: 10, // Modern way to add spacing between wrapped items
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20, // This creates the pill shape
    borderWidth: 1,
  },
  pillUnselected: {
    backgroundColor: '#f0f0f0',
    borderColor: '#ccc',
  },
  pillSelected: {
    backgroundColor: Colors.darkSage,
    borderColor: '#007AFF',
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  textUnselected: {
    color: '#333',
  },
  textSelected: {
    color: '#fff',
  },
});

export default TagSelector;
