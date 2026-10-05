import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

export default function AccountSyncSection({
  user,
  email,
  setEmail,
  password,
  setPassword,
  onSignInPress,
  onRegisterPress,
  onSignOutPress,
  onInvitePartnerPress,
  onEnterInviteCodePress,
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Account & Cloud Sync</Text>

      {user ? (
        <View style={styles.userContainer}>
          <View style={styles.userHeaderRow}>
            <Text style={styles.userEmail}>{user.email || 'Logged In'}</Text>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={onSignOutPress}>
              <Text style={styles.secondaryButtonText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.divider} />
          <View style={styles.householdActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onInvitePartnerPress}>
              <Text style={styles.actionButtonText}>Invite Partner</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={onEnterInviteCodePress}>
              <Text style={styles.actionButtonText}>Enter Invite Code</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.guestContainer}>
          <Text style={styles.description}>
            Sign in to sync your child profiles and EHCP logs across multiple
            devices or invite a co-parent.
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Email Address"
            placeholderTextColor="#999999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#999999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.primaryButton, styles.flexButton]}
              onPress={onSignInPress}>
              <Text style={styles.primaryButtonText}>Sign In</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.outlineButton, styles.flexButton]}
              onPress={onRegisterPress}>
              <Text style={styles.outlineButtonText}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  description: {
    fontSize: 13,
    color: '#666666',
    lineHeight: 19,
    marginBottom: 14,
  },
  input: {
    backgroundColor: '#F8F9F8',
    borderWidth: 1,
    borderColor: '#E2E8E5',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1A1A1A',
    marginBottom: 10,
  },
  guestContainer: {
    marginBottom: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
    marginBottom: 8,
  },
  flexButton: {
    flex: 1,
  },
  primaryButton: {
    backgroundColor: '#4A6159',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  outlineButton: {
    borderWidth: 1.5,
    borderColor: '#4A6159',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  outlineButtonText: {
    color: '#4A6159',
    fontWeight: '700',
    fontSize: 14,
  },
  userContainer: {
    marginBottom: 12,
  },
  userEmail: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4A6159',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#D1D1D6',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#666666',
    fontWeight: '600',
    fontSize: 13,
  },
  divider: {
    height: 1,
    backgroundColor: '#EFEFEF',
    marginVertical: 12,
  },
  householdActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#F4F6F5',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4A6159',
  },
  userHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
});
