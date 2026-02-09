import React from 'react';
import { Modal, View, Text, StyleSheet, ScrollView } from 'react-native';
import TagSelector from './TagSelector';
import MoodRadioGroup from './MoodRadioGroup';
import CustomButton from './CustomButton';

const FilterModal = ({
  visible,
  onClose,
  tags,
  selectedTags,
  onToggleTag,
  selectedMood,
  onSelectMood,
  onReset,
}) => {
  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Filter Entries</Text>

          <ScrollView>
            <TagSelector
              label="Filter by Tags"
              tags={tags}
              selectedTags={selectedTags}
              onToggle={onToggleTag}
            />

            <MoodRadioGroup
              label="Filter by Impact"
              selectedValue={selectedMood}
              onSelect={onSelectMood}
            />
          </ScrollView>

          <View style={styles.buttonRow}>
            <CustomButton
              label="Reset"
              color="#999"
              onPress={onReset}
              style={{ width: '45%' }}
            />
            <CustomButton
              label="Apply"
              color="#4CAF50"
              onPress={onClose}
              style={{ width: '45%' }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between' },
});

export default FilterModal;
