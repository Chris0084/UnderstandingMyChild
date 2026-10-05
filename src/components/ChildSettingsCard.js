import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PRESET_COLORS = [
  '#ff0000', // Red
  '#ff8700', // Orange
  '#ffd300', // Yellow
  '#58ff0a', // Bright Green
  '#0aefff', // Cyan
  '#580aff', // Indigo
  '#be0aff', // Purple
];

export default function ChildSettingsCard({
  child,
  onSave,
  onDelete,
  canDelete,
}) {
  const [name, setName] = useState(child?.name || '');
  const [selectedColor, setSelectedColor] = useState(
    child?.color || PRESET_COLORS[0],
  );

  // Keep local state in sync if child props change externally
  useEffect(() => {
    if (child) {
      setName(child.name || '');
      setSelectedColor(child.color || PRESET_COLORS[0]);
    }
  }, [child?.name, child?.color]);

  // Update local state as the user types (no Firestore call)
  const handleNameChange = text => {
    setName(text);
  };

  // Trigger Firestore / AsyncStorage save only when typing is finished
  const handleNameSubmit = () => {
    const trimmedName = name.trim();
    if (trimmedName && trimmedName !== child?.name) {
      onSave(child.id, { ...child, name: trimmedName, color: selectedColor });
    }
  };

  // Color selection still saves immediately on tap
  const handleColorSelect = color => {
    setSelectedColor(color);
    onSave(child.id, { ...child, name: name.trim(), color });
  };

  const initial = name.trim() ? name.trim().charAt(0).toUpperCase() : '?';

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
            onEndEditing={handleNameSubmit}
            onBlur={handleNameSubmit}
            placeholder="Enter child name"
            placeholderTextColor="#AAA"
            maxLength={12}
            returnKeyType="done"
          />
        </View>

        {/* Delete Icon Button */}
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
