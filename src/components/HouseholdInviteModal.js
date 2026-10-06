import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

export default function HouseholdInviteModal({
  visible,
  initialTab = 'share',
  onClose,
  inviteCode,
  onJoinCodeSubmit,
}) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [code, setCode] = useState('');

  const handleJoin = () => {
    onJoinCodeSubmit(code);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'share' && styles.activeTab]}
              onPress={() => setActiveTab('share')}>
              <Text style={styles.tabText}>Share Code</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'join' && styles.activeTab]}
              onPress={() => setActiveTab('join')}>
              <Text style={styles.tabText}>Join Household</Text>
            </TouchableOpacity>
          </View>

          {activeTab === 'share' ? (
            <View style={styles.body}>
              <Text style={styles.label}>Your Household Invite Code:</Text>
              <Text style={styles.codeText}>{inviteCode}</Text>
            </View>
          ) : (
            <View style={styles.body}>
              <Text style={styles.label}>Enter 8-Digit Invite Code:</Text>
              <TextInput
                style={styles.input}
                value={code}
                onChangeText={setCode}
                placeholder="e.g. A1b2C3d9"
                autoCapitalize="characters"
                maxLength={8}
              />

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleJoin}>
                <Text style={styles.submitButtonText}>Join Household</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#EFEFEF',
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderColor: '#4A6159',
  },
  tabText: {
    fontWeight: '700',
    color: '#1A1A1A',
  },
  body: {
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  codeText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#4A6159',
    letterSpacing: 2,
    marginVertical: 12,
  },
  input: {
    width: '100%',
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#EFEFEF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    textAlign: 'center',
    letterSpacing: 2,
    marginBottom: 10,
    color: '#1A1A1A',
  },
  submitButton: {
    width: '100%',
    backgroundColor: '#4A6159',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#FFF',
    fontWeight: '700',
  },
  closeButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#888',
    fontWeight: '600',
  },
});
