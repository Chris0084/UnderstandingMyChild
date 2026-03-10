import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const options = ['Not used', 'Not effective', 'Effective'];

const StrategyRadioButton = ({ label, value, onSelect }) => (
  <View style={styles.container}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.radioGroup}>
      {options.map(opt => (
        <TouchableOpacity
          key={opt}
          style={[styles.btn, value === opt && styles.selectedBtn]}
          onPress={() => onSelect(opt)}>
          <Text
            style={[styles.btnText, value === opt && styles.selectedBtnText]}>
            {opt}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  label: { fontSize: 14, fontWeight: 'bold', marginBottom: 8, color: '#333' },
  radioGroup: { flexDirection: 'row', justifyContent: 'space-between' },
  btn: {
    flex: 1,
    paddingVertical: 6,
    marginHorizontal: 2,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  selectedBtn: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  btnText: { fontSize: 11, color: '#666' },
  selectedBtnText: { color: '#fff', fontWeight: 'bold' },
});

export default StrategyRadioButton;
