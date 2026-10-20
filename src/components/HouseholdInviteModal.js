// components/HouseholdInviteModal.js
import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  createNamedInvite,
  getHouseholdInvites,
  removeContributor,
} from '../services/firestoreService';

const MAX_CONTRIBUTORS = 3;

export default function HouseholdInviteModal({
  visible,
  initialTab = 'share', // 'share' | 'join'
  onClose,
  householdId,
  userRole,
  onJoinCodeSubmit,
}) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [contributorName, setContributorName] = useState('');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [invitesList, setInvitesList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newlyGeneratedCode, setNewlyGeneratedCode] = useState(null);

  // Sync state whenever modal opens
  useEffect(() => {
    if (visible) {
      setActiveTab(userRole === 'owner' ? 'share' : 'join');
      setNewlyGeneratedCode(null);
      setContributorName('');
      setJoinCodeInput('');
      if (householdId && userRole === 'owner') {
        loadInvites();
      }
    }
  }, [visible, initialTab, householdId, userRole]);

  const loadInvites = async () => {
    try {
      setLoading(true);
      const list = await getHouseholdInvites(householdId);
      setInvitesList(list);
    } catch (e) {
      console.error('Error fetching invites:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCode = async () => {
    const cleanName = contributorName.trim();
    if (!cleanName) {
      Alert.alert(
        'Name Required',
        'Please enter a name for this contributor (e.g. Grandma Mary).',
      );
      return;
    }

    try {
      setLoading(true);
      const result = await createNamedInvite(householdId, cleanName);
      setNewlyGeneratedCode(result.code);
      setContributorName('');
      await loadInvites();
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = item => {
    Alert.alert(
      'Remove Contributor?',
      `Are you sure you want to remove ${item.assignedToName || 'this contributor'}? They will lose access to this household.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await removeContributor(
                householdId,
                item.code,
                item.claimedByUid,
              );
              await loadInvites();
              Alert.alert(
                'Removed',
                `${item.assignedToName} has been removed.`,
              );
            } catch (e) {
              Alert.alert('Error', e.message);
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  };

  const handleJoin = () => {
    Keyboard.dismiss();
    const clean = joinCodeInput.trim().toUpperCase();
    if (!clean || clean.length !== 8) {
      Alert.alert('Invalid Code', 'Please enter a valid 8-character code.');
      return;
    }
    onJoinCodeSubmit(clean);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}>
        {/* Dimmed backdrop closes keyboard if tapped */}
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <View style={styles.container}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>
                {userRole === 'owner'
                  ? 'Manage Contributors'
                  : 'Join Household'}
              </Text>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Tab Selector: Only show "Join Household" if NOT an owner */}
            {userRole !== 'owner' && (
              <View style={styles.tabBar}>
                <View style={[styles.tab, styles.activeTab]}>
                  <Text style={[styles.tabText, styles.activeTabText]}>
                    Join Household
                  </Text>
                </View>
              </View>
            )}

            {/* TAB 1: OWNER MANAGE CONTRIBUTORS */}
            {activeTab === 'share' && (
              <View style={styles.tabContent}>
                <Text style={styles.label}>
                  Invite a New Contributor ({invitesList.length}/3)
                </Text>
                <Text style={styles.hint}>
                  Each code is single-use and assigned to one specific person.
                </Text>

                {/* If 3 contributors already exist, show warning banner. Otherwise show input! */}
                {invitesList.length >= 3 ? (
                  <View style={styles.limitBanner}>
                    <Text style={styles.limitBannerText}>
                      Maximum of 3 contributors reached. Delete an existing or
                      pending contributor below to add a new one.
                    </Text>
                  </View>
                ) : (
                  <View style={styles.inputRow}>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. Grandma Mary, Babysitter"
                      value={contributorName}
                      onChangeText={setContributorName}
                      placeholderTextColor="#999"
                    />
                    <TouchableOpacity
                      style={styles.generateBtn}
                      onPress={handleGenerateCode}
                      disabled={loading}>
                      <Text style={styles.generateBtnText}>Create Code</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {newlyGeneratedCode && (
                  <View style={styles.codeBanner}>
                    <Text style={styles.codeBannerTitle}>
                      Single-Use Code Created!
                    </Text>
                    <Text style={styles.codeText}>{newlyGeneratedCode}</Text>
                    <Text style={styles.codeBannerSubtitle}>
                      Share this code. Once they sign in with it, it cannot be
                      used again.
                    </Text>
                  </View>
                )}

                <Text style={[styles.label, { marginTop: 16 }]}>
                  Active & Pending Contributors ({invitesList.length}/3)
                </Text>

                {loading ? (
                  <ActivityIndicator
                    size="small"
                    color="#4A6159"
                    style={{ marginVertical: 16 }}
                  />
                ) : invitesList.length === 0 ? (
                  <Text style={styles.emptyText}>
                    No contributors invited yet.
                  </Text>
                ) : (
                  invitesList.map(item => (
                    <View key={item.code} style={styles.contributorCard}>
                      <View style={styles.contributorInfo}>
                        <Text style={styles.contributorName}>
                          {item.assignedToName}
                        </Text>
                        <Text style={styles.contributorStatus}>
                          {item.claimed
                            ? 'Joined (Active)'
                            : `Code: ${item.code} (Pending)`}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={() => handleConfirmDelete(item)}>
                        <Ionicons
                          name="trash-outline"
                          size={18}
                          color="#D32F2F"
                        />
                      </TouchableOpacity>
                    </View>
                  ))
                )}
              </View>
            )}

            {/* TAB 2: JOIN WITH CODE */}
            {activeTab === 'join' && (
              <View style={styles.tabContent}>
                <Text style={styles.label}>Enter Single-Use Invite Code</Text>
                <Text style={styles.hint}>
                  Enter the 8-character code shared by the primary household
                  owner.
                </Text>

                <TextInput
                  style={[styles.input, styles.codeInput]}
                  placeholder="e.g. 8A3X9K2L"
                  value={joinCodeInput}
                  onChangeText={setJoinCodeInput}
                  autoCapitalize="characters"
                  maxLength={8}
                  placeholderTextColor="#999"
                />

                <TouchableOpacity style={styles.joinBtn} onPress={handleJoin}>
                  <Text style={styles.joinBtnText}>Join Household</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  closeBtn: {
    padding: 4,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#F0F2F5',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#4A6159',
    fontWeight: '700',
  },
  tabContent: {
    paddingBottom: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  hint: {
    fontSize: 12,
    color: '#777',
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1A1A1A',
  },
  codeInput: {
    textAlign: 'center',
    fontSize: 22,
    letterSpacing: 4,
    fontWeight: '700',
    marginVertical: 16,
    paddingVertical: 14,
  },
  generateBtn: {
    backgroundColor: '#4A6159',
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderRadius: 12,
  },
  generateBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  codeBanner: {
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#C8E6C9',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  codeBannerTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2E7D32',
    textTransform: 'uppercase',
  },
  codeText: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 4,
    color: '#1B5E20',
    marginVertical: 6,
  },
  codeBannerSubtitle: {
    fontSize: 11,
    color: '#388E3C',
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginVertical: 16,
    fontSize: 13,
  },
  contributorCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#EFEFEF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  contributorInfo: {
    flex: 1,
  },
  contributorName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  contributorStatus: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  deleteBtn: {
    padding: 8,
  },
  joinBtn: {
    backgroundColor: '#4A6159',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  joinBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  limitBanner: {
    backgroundColor: '#FFF3E0',
    borderWidth: 1,
    borderColor: '#FFE0B2',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  limitBannerText: {
    color: '#E65100',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 18,
  },
});
