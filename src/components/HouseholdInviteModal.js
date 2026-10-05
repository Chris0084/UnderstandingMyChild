import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';

const HouseholdInviteModal = ({
  visible,
  onClose,
  inviteCode,
  onJoinCodeSubmit,
  initialTab = 'share', // DEFAULT TO 'share', BUT ACCEPT 'share' | 'join'
}) => {
  const [activeTab, setActiveTab] = useState(initialTab); // 'share' | 'join'
  const [enteredCode, setEnteredCode] = useState('');

  // RESET ACTIVE TAB WHEN MODAL BECOMES VISIBLE
  useEffect(() => {
    if (visible) {
      setActiveTab(initialTab);
      setEnteredCode('');
    }
  }, [visible, initialTab]);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={modalStyles.overlay}>
        <View style={modalStyles.modalContent}>
          {/* TAB HEADER */}
          <View style={modalStyles.tabRow}>
            <TouchableOpacity
              style={[
                modalStyles.tab,
                activeTab === 'share' && modalStyles.activeTab,
              ]}
              onPress={() => setActiveTab('share')}>
              <Text style={modalStyles.tabText}>Invite Partner</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                modalStyles.tab,
                activeTab === 'join' && modalStyles.activeTab,
              ]}
              onPress={() => setActiveTab('join')}>
              <Text style={modalStyles.tabText}>Join Household</Text>
            </TouchableOpacity>
          </View>

          {activeTab === 'share' ? (
            /* TAB 1: SHARE CODE */
            <View style={modalStyles.body}>
              <Text style={modalStyles.label}>
                Share this code with your partner or co-parent so they can join
                your family account:
              </Text>
              <View style={modalStyles.codeBox}>
                <Text style={modalStyles.codeText}>
                  {inviteCode || '--------'}
                </Text>
              </View>
              <Text style={modalStyles.helperText}>
                When they enter this code on their phone, both your apps will
                share the same child profiles and entry logs.
              </Text>
            </View>
          ) : (
            /* TAB 2: JOIN HOUSEHOLD */
            <View style={modalStyles.body}>
              <Text style={modalStyles.label}>
                Enter the 6-character code generated on your partner's phone:
              </Text>
              <TextInput
                style={modalStyles.input}
                placeholder="e.g. XY789Z"
                value={enteredCode}
                onChangeText={text => setEnteredCode(text.toUpperCase())}
                maxLength={6}
                autoCapitalize="characters"
              />
              <TouchableOpacity
                style={modalStyles.submitButton}
                onPress={() => onJoinCodeSubmit(enteredCode)}>
                <Text style={modalStyles.submitButtonText}>
                  Connect Household
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity style={modalStyles.closeButton} onPress={onClose}>
            <Text style={modalStyles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,

    backgroundColor: 'rgba(0,0,0,0.5)',

    justifyContent: 'center',

    padding: 20,
  },

  modalContent: {
    backgroundColor: '#FFF',

    borderRadius: 16,

    padding: 20,
  },

  tabRow: {
    flexDirection: 'row',

    borderBottomWidth: 1,

    borderBottomColor: '#E5E7EB',

    marginBottom: 16,
  },

  tab: {
    flex: 1,

    paddingVertical: 10,

    alignItems: 'center',
  },

  activeTab: {
    borderBottomWidth: 2,

    borderBottomColor: '#2563EB',
  },

  tabText: {
    fontWeight: '600',

    color: '#1F2937',
  },

  body: {
    marginVertical: 12,
  },

  label: {
    fontSize: 14,

    color: '#4B5563',

    marginBottom: 12,
  },

  codeBox: {
    backgroundColor: '#F3F4F6',

    borderRadius: 8,

    paddingVertical: 16,

    alignItems: 'center',

    borderWidth: 1,

    borderColor: '#E5E7EB',

    borderStyle: 'dashed',
  },

  codeText: {
    fontSize: 28,

    fontWeight: '700',

    letterSpacing: 4,

    color: '#1D4ED8',
  },

  helperText: {
    fontSize: 12,

    color: '#9CA3AF',

    marginTop: 10,

    textAlign: 'center',
  },

  input: {
    borderWidth: 1,

    borderColor: '#D1D5DB',

    borderRadius: 8,

    padding: 12,

    fontSize: 18,

    textAlign: 'center',

    letterSpacing: 2,

    marginBottom: 16,
  },

  submitButton: {
    backgroundColor: '#2563EB',

    borderRadius: 8,

    paddingVertical: 12,

    alignItems: 'center',
  },

  submitButtonText: {
    color: '#FFF',

    fontWeight: '600',
  },

  closeButton: {
    marginTop: 16,

    alignItems: 'center',
  },

  closeButtonText: {
    color: '#6B7280',

    fontWeight: '500',
  },
});

export default HouseholdInviteModal;
