import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// const PRESET_COLORS = [
//   '#4A6159', // Default Sage
//   '#2196F3', // Blue
//   '#E91E63', // Pink
//   '#9C27B0', // Purple
//   '#FF9800', // Orange
//   '#4CAF50', // Green
// ];

const PRESET_COLORS = [
  '#ff0000', // Default Sage
  '#ff8700', // Blue
  '#ffd300', // Pink
  '#58ff0a', // Purple
  '#0aefff', // Green
  '#580aff', // Green
  '#be0aff', // Green
];

export default function ChildSettingsCard({
  child,
  onSave,
  onDelete,
  canDelete,
}) {
  const [name, setName] = useState(child.name || '');
  const [selectedColor, setSelectedColor] = useState(
    child.color || PRESET_COLORS[0],
  );

  const handleNameChange = text => {
    setName(text);
    onSave(child.id, { ...child, name: text, color: selectedColor });
  };

  const handleColorSelect = color => {
    setSelectedColor(color);
    onSave(child.id, { ...child, name, color });
  };

  const initial = name ? name.charAt(0).toUpperCase() : '?';

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        {/* Child Avatar Circle */}
        <View style={[styles.avatarCircle, { backgroundColor: selectedColor }]}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>

        {/* Name Input Field */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Child Name</Text>
          <TextInput
            style={styles.textInput}
            value={name}
            onChangeText={handleNameChange}
            placeholder="Enter child name"
            placeholderTextColor="#AAA"
            maxLength={12}
          />
        </View>

        {/* Delete Icon Button (Only rendered for 2nd and 3rd child) */}
        {canDelete && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => onDelete(child)}
            activeOpacity={0.7}>
            <Ionicons name="trash-outline" size={20} color="#D32F2F" />
          </TouchableOpacity>
        )}
      </View>

      {/* Color Selection Palette */}
      <Text style={styles.colorLabel}>Circle Color</Text>
      <View style={styles.colorPalette}>
        {PRESET_COLORS.map(color => {
          const isSelected = selectedColor === color;
          return (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorSwatch,
                { backgroundColor: color },
                isSelected && styles.selectedSwatch,
              ]}
              onPress={() => handleColorSelect(color)}
              activeOpacity={0.8}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  inputContainer: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888',
    marginBottom: 4,
  },
  textInput: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    borderBottomWidth: 1,
    borderBottomColor: '#DDD',
    paddingVertical: 4,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: '#FFEBEE',
  },
  colorLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888',
    marginBottom: 8,
  },
  colorPalette: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  colorSwatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  selectedSwatch: {
    borderWidth: 3,
    borderColor: '#1A1A1A',
  },
});
