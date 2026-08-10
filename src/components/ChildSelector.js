import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';

/**
 * ChildSelector Component
 *
 * @param {Array} childrenList - Array of active child objects, e.g., [{ id: '1', name: 'Child 1', color: '#FF5722' }]
 * @param {string} selectedChildId - ID of currently active child (or 'ALL')
 * @param {function} onSelectChild - Callback when a child circle is pressed
 * @param {function} onAddChild - Callback when an "Add Child" slot is pressed (Optional)
 * @param {function} onRenameChild - Callback when a child name is updated: (childId, newName) => void
 * @param {number} maxChildren - Max allowed profile limit (default: 3)
 * @param {boolean} showAllOption - Controls whether the "All" slot appears at the front (default: false)
 */
const ChildSelector = ({
  childrenList = [],
  selectedChildId,
  onSelectChild,
  onAddChild,
  onRenameChild,
  maxChildren = 3,
  showAllOption = false,
}) => {
  const [isRenameModalVisible, setIsRenameModalVisible] = useState(false);
  const [targetChild, setTargetChild] = useState(null);
  const [renamedText, setRenamedText] = useState('');

  // Checks specifically if the profile is still set to default "Child 1"
  const isDefaultChildOne = child => {
    if (!child) return false;
    const nameLower = (child.name || '').trim().toLowerCase();
    return nameLower === 'child 1' || (child.id === '1' && nameLower === '');
  };

  const handleChildPress = child => {
    onSelectChild(child.id);

    // If it's the default "Child 1", open the rename modal
    if (isDefaultChildOne(child)) {
      setTargetChild(child);
      setRenamedText(child.name || 'Child 1');
      setIsRenameModalVisible(true);
    }
  };

  const handleSaveRename = () => {
    if (targetChild && renamedText.trim() && onRenameChild) {
      onRenameChild(targetChild.id, renamedText.trim());
    }
    setIsRenameModalVisible(false);
  };

  return (
    <View style={styles.container}>
      {/* 1. Render "ALL" slot at the start if showAllOption is true */}
      {showAllOption && (
        <TouchableOpacity
          key="all-slot"
          style={styles.slotWrapper}
          onPress={() => onSelectChild('ALL')}
          activeOpacity={0.7}>
          <View
            style={[
              styles.circle,
              selectedChildId === 'ALL'
                ? styles.selectedCircle
                : styles.unselectedCircle,
              {
                backgroundColor: selectedChildId === 'ALL' ? '#7ED321' : '#888',
              },
            ]}>
            <Ionicons name="people" size={22} color="#FFF" />
          </View>
          <Text
            numberOfLines={1}
            style={[
              styles.nameLabel,
              selectedChildId === 'ALL' && styles.selectedNameLabel,
            ]}>
            All
          </Text>
        </TouchableOpacity>
      )}

      {/* 2. Render active children passed in childrenList */}
      {childrenList.map((child, index) => {
        const isSelected = child.id === selectedChildId;
        const initial = child.name ? child.name.charAt(0).toUpperCase() : '?';
        const childColor = child.color || Colors.button_main || '#4A6159';
        const showEditBadge = isDefaultChildOne(child);

        // Profile color if selected, black if unselected
        const circleBackgroundColor = isSelected ? childColor : '#888';

        return (
          <TouchableOpacity
            key={child.id || `child-${index}`}
            style={styles.slotWrapper}
            onPress={() => handleChildPress(child)}
            activeOpacity={0.7}>
            <View
              style={[
                styles.circle,
                { backgroundColor: circleBackgroundColor },
                isSelected ? styles.selectedCircle : styles.unselectedCircle,
              ]}>
              <Text style={styles.selectedText}>{initial}</Text>

              {/* Show edit pencil icon overlay ONLY on Child 1 default */}
              {showEditBadge && (
                <View style={styles.editBadge}>
                  <Ionicons name="pencil" size={10} color="#FFF" />
                </View>
              )}
            </View>
            <Text
              numberOfLines={1}
              style={[
                styles.nameLabel,
                isSelected && styles.selectedNameLabel,
              ]}>
              {child.name || `Child ${index + 1}`}
            </Text>
          </TouchableOpacity>
        );
      })}

      {/* 3. Render "Add Child" slot ONLY if onAddChild callback is passed and maxChildren limit isn't reached */}
      {onAddChild && childrenList.length < maxChildren && (
        <TouchableOpacity
          key="add-slot"
          style={styles.slotWrapper}
          onPress={onAddChild}
          activeOpacity={0.7}>
          <View style={[styles.circle, styles.addCircle]}>
            <Ionicons name="add" size={24} color="#888" />
          </View>
          <Text numberOfLines={1} style={styles.addLabel}>
            Add Child
          </Text>
        </TouchableOpacity>
      )}

      {/* Rename Modal */}
      <Modal
        visible={isRenameModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsRenameModalVisible(false)}>
        <TouchableWithoutFeedback
          onPress={() => setIsRenameModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalCard}>
                <Text style={styles.modalTitle}>Set Child's Name</Text>

                <TextInput
                  style={styles.input}
                  value={renamedText}
                  onChangeText={setRenamedText}
                  autoFocus
                  selectTextOnFocus
                  placeholder="Enter name"
                  placeholderTextColor="#999"
                />

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.btn, styles.cancelBtn]}
                    onPress={() => setIsRenameModalVisible(false)}
                    activeOpacity={0.7}>
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.btn, styles.saveBtn]}
                    onPress={handleSaveRename}
                    activeOpacity={0.7}>
                    <Text style={styles.saveBtnText}>Update Name</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '90%',
    paddingVertical: 12,
    marginVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#eee',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  slotWrapper: {
    alignItems: 'center',
    width: 70,
  },
  circle: {
    width: 44,
    height: 44,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    position: 'relative',
  },
  selectedCircle: {
    borderWidth: 2,
    borderColor: '#f32121',
  },
  unselectedCircle: {
    borderWidth: 1.5,
    borderColor: '#ddbebe',
  },
  addCircle: {
    backgroundColor: '#F9F9F9',
    borderWidth: 2,
    borderColor: '#CCC',
    borderStyle: 'dashed',
  },
  selectedText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '700',
  },
  editBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: Colors.log_theme || '#2196F3',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFF',
  },
  nameLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    color: Colors.log_theme || '#2196F3',
  },
  selectedNameLabel: {
    color: '#333',
    fontWeight: '700',
  },
  addLabel: {
    fontSize: 11,
    color: '#888',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 16,
    color: '#1A1A1A',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  btn: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    backgroundColor: '#F0F0F0',
    marginRight: 6,
  },
  cancelBtnText: {
    color: '#666',
    fontWeight: '700',
    fontSize: 14,
  },
  saveBtn: {
    backgroundColor: '#2196F3',
    marginLeft: 6,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});

export default ChildSelector;
