import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';

const ChildSelectModal = ({
  visible,
  childrenList = [],
  selectedChildId,
  onSelectChild,
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={modalStyles.overlay}>
          <TouchableWithoutFeedback>
            <View style={modalStyles.content}>
              <Text style={modalStyles.title}>Select Child</Text>

              {childrenList.map(child => {
                const isSelected = child.id === selectedChildId;
                return (
                  <TouchableOpacity
                    key={child.id}
                    style={[
                      modalStyles.optionButton,
                      isSelected && modalStyles.selectedOption,
                    ]}
                    onPress={() => {
                      onSelectChild(child.id);
                      onClose();
                    }}>
                    <Text
                      style={[
                        modalStyles.optionText,
                        isSelected && modalStyles.selectedOptionText,
                      ]}>
                      {child.name}
                    </Text>
                    {isSelected && <Text style={modalStyles.checkmark}>✓</Text>}
                  </TouchableOpacity>
                );
              })}

              <TouchableOpacity
                style={modalStyles.cancelButton}
                onPress={onClose}>
                <Text style={modalStyles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

// 1. Define stylesheet
const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  optionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f5f5f5',
  },
  selectedOption: {
    backgroundColor: '#e6f0ff',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedOptionText: {
    fontWeight: 'bold',
    color: '#0066cc',
  },
  checkmark: {
    fontSize: 16,
    color: '#0066cc',
    fontWeight: 'bold',
  },
  cancelButton: {
    marginTop: 10,
    paddingVertical: 10,
  },
  cancelText: {
    color: '#ff3b30',
    fontSize: 16,
  },
});

// 2. Export the component (Fixes the undefined component error)
export default ChildSelectModal;
