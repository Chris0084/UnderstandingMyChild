import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

/**
 * DateStamp Component
 * @param {string} label - Title above the date
 * @param {Date} date - The current date value from state
 * @param {function} onChange - Function to update the date state
 */
const DateStamp = ({ label, date, onChange }) => {
  const [show, setShow] = useState(false);

  const togglePicker = () => {
    setShow(!show);
  };

  const onDateChange = (event, selectedDate) => {
    // On Android, the picker closes immediately after selection
    if (Platform.OS === 'android') {
      setShow(false);
    }
    
    // If the user didn't cancel, update the date
    if (selectedDate) {
      onChange(selectedDate);
    }
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
       <View style={styles.shadowWrapper}>
      <TouchableOpacity style={styles.dateDisplay} onPress={togglePicker}>
        <Text style={styles.dateText}>
          {date.toLocaleDateString('en-GB')} {/* Formats date to MM/DD/YYYY or similar */}
        </Text>
      </TouchableOpacity>

      {show && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}
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
    marginBottom: 8,
    alignSelf: 'flex-start',
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
  dateDisplay: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#f7f5f2',
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 16,
    color: '#000',
  },
});

export default DateStamp;