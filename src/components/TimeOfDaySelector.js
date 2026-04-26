import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';

const TIME_OPTIONS = [
  { id: '1', label: 'Morning', range: '5am - 12pm', icon: 'sunny-outline' },
  {
    id: '2',
    label: 'Afternoon',
    range: '12pm - 5pm',
    icon: 'partly-sunny-outline',
  },
  { id: '3', label: 'Evening', range: '5pm - 10pm', icon: 'moon-outline' },
  {
    id: '4',
    label: 'Night time',
    range: '10pm - 5am',
    icon: 'cloudy-night-outline',
  },
];

const TimeOfDaySelector = ({ onSelect, selectedTime }) => {
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelect = label => {
    onSelect(label);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>TIME OF DAY</Text>

      <View style={styles.shadowWrapper}>
        <TouchableOpacity
          style={styles.selectorPressable}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.7}>
          <Text style={styles.selectedText}>{selectedTime}</Text>
          <Ionicons name="chevron-down" size={20} color="#ccc" />
        </TouchableOpacity>
      </View>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Time of Day</Text>
            {TIME_OPTIONS.map(item => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.optionItem,
                  selectedTime === item.label && styles.selectedOptionItem,
                ]}
                onPress={() => handleSelect(item.label)}>
                <Ionicons
                  name={item.icon}
                  size={24}
                  color={selectedTime === item.label ? Colors.primary : '#666'}
                />
                {/* NEW: Container to stack the label and the range */}
                <View style={styles.textContainer}>
                  <Text
                    style={[
                      styles.optionLabel,
                      selectedTime === item.label && styles.selectedOptionLabel,
                    ]}>
                    {item.label}
                  </Text>
                  <Text style={styles.rangeText}>{item.range}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    width: '90%',
    alignSelf: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4a463f',
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  shadowWrapper: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    backgroundColor: '#f7f5f2',
    borderRadius: 12,
  },
  selectorPressable: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#f7f5f2',
  },
  selectedText: {
    fontSize: 16,
    color: '#000',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#4a463f',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    marginVertical: 4,
  },
  selectedOptionItem: {
    backgroundColor: '#f0f0f0',
  },
  textContainer: {
    marginLeft: 15,
  },
  optionLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  selectedOptionLabel: {
    fontWeight: 'bold',
    color: Colors.primary,
  },
  rangeText: {
    fontSize: 12,
    color: '#888', // Subtle grey for the time range
    marginTop: 2,
  },
});

export default TimeOfDaySelector;
