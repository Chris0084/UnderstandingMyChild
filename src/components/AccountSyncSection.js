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
  userRole, // 'owner' | 'contributor' | null
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
  // STATE 1: NOT LOGGED IN
  if (!user) {
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Sign In or Create Account</Text>
        <Text style={styles.cardSubtitle}>
          Sync your data across devices or join an existing household using a
          code.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Email address"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={onSignInPress}>
            <Text style={styles.primaryButtonText}>Sign In</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={onRegisterPress}>
            <Text style={styles.secondaryButtonText}>Register</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Unauthenticated users can join a household directly */}
        <TouchableOpacity
          style={styles.outlineButton}
          onPress={onEnterInviteCodePress}>
          <Text style={styles.outlineButtonText}>Join Household with Code</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // STATE 2: LOGGED IN AS PRIMARY (OWNER)
  if (userRole === 'owner') {
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Account & Household</Text>
        <Text style={styles.userEmail}>{user.email}</Text>
        <Text style={styles.roleBadge}>Primary Household Owner</Text>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={onInvitePartnerPress}>
          <Text style={styles.actionButtonText}>Invite Contributor</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.dangerButton} onPress={onSignOutPress}>
          <Text style={styles.dangerButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // STATE 3: LOGGED IN AS CONTRIBUTOR
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Account & Household</Text>
      <Text style={styles.userEmail}>{user.email}</Text>
      <Text style={styles.roleBadge}>Contributor</Text>

      <TouchableOpacity style={styles.dangerButton} onPress={onSignOutPress}>
        <Text style={styles.dangerButtonText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 16,
  },
  userEmail: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4A6159',
    marginTop: 4,
  },
  roleBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#888888',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#EFEFEF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    marginBottom: 10,
    color: '#1A1A1A',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  primaryButton: {
    flex: 1,
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
  secondaryButton: {
    flex: 1,
    backgroundColor: '#EAEAEA',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#1A1A1A',
    fontWeight: '700',
    fontSize: 14,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#EFEFEF',
  },
  dividerText: {
    marginHorizontal: 10,
    fontSize: 11,
    fontWeight: '700',
    color: '#AAA',
  },
  outlineButton: {
    borderWidth: 1.5,
    borderColor: '#4A6159',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  outlineButtonText: {
    color: '#4A6159',
    fontWeight: '700',
    fontSize: 14,
  },
  actionButton: {
    backgroundColor: '#4A6159',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  dangerButton: {
    backgroundColor: '#FFF0F0',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  dangerButtonText: {
    color: '#D32F2F',
    fontWeight: '700',
    fontSize: 14,
  },
});
