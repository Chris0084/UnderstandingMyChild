import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function AccountSyncSection({
  user,
  userRole, // 'owner' | 'contributor' | null
  onGoogleSignInPress,
  onAppleSignInPress,
  onSignOutPress,
  onInvitePartnerPress,
  onEnterInviteCodePress,
}) {
  const [authLoading, setAuthLoading] = useState(false);

  const handleGoogle = async () => {
    if (authLoading) return;
    setAuthLoading(true);
    try {
      await onGoogleSignInPress();
    } finally {
      setAuthLoading(false);
    }
  };

  const handleApple = async () => {
    if (authLoading) return;
    setAuthLoading(true);
    try {
      await onAppleSignInPress();
    } finally {
      setAuthLoading(false);
    }
  };

  // -------------------------------------------------------------
  // STATE 1: NOT LOGGED IN
  // -------------------------------------------------------------
  if (!user) {
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Sign In to Sync</Text>
        <Text style={styles.cardSubtitle}>
          Sign in with your Google or Apple account to sync your logs or join a
          shared household.
        </Text>

        {authLoading ? (
          <ActivityIndicator
            size="small"
            color="#4A6159"
            style={styles.loader}
          />
        ) : (
          <View style={styles.buttonStack}>
            {/* Google Sign In */}
            <TouchableOpacity
              style={styles.googleButton}
              onPress={handleGoogle}
              activeOpacity={0.8}>
              <Ionicons
                name="logo-google"
                size={18}
                color="#EA4335"
                style={styles.buttonIcon}
              />
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </TouchableOpacity>

            {/* Apple Sign In (iOS Only) */}
            {Platform.OS === 'ios' && (
              <TouchableOpacity
                style={styles.appleButton}
                onPress={handleApple}
                activeOpacity={0.8}>
                <Ionicons
                  name="logo-apple"
                  size={20}
                  color="#FFFFFF"
                  style={styles.buttonIcon}
                />
                <Text style={styles.appleButtonText}>Sign in with Apple</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>HAVE AN INVITE CODE?</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity
          style={styles.outlineButton}
          onPress={onEnterInviteCodePress}
          activeOpacity={0.8}>
          <Text style={styles.outlineButtonText}>Join Household with Code</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // -------------------------------------------------------------
  // STATE 2: LOGGED IN AS PRIMARY (OWNER)
  // -------------------------------------------------------------
  if (userRole === 'owner') {
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Account & Household</Text>
        <Text style={styles.userEmail}>{user.displayName || user.email}</Text>
        <Text style={styles.roleBadge}>Primary Household Owner</Text>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={onInvitePartnerPress}
          activeOpacity={0.8}>
          <Text style={styles.actionButtonText}>
            Invite/Manage Contributors
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dangerButton}
          onPress={onSignOutPress}
          activeOpacity={0.8}>
          <Text style={styles.dangerButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // -------------------------------------------------------------
  // STATE 3: LOGGED IN AS CONTRIBUTOR
  // -------------------------------------------------------------
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Account & Household</Text>
      <Text style={styles.userEmail}>{user.displayName || user.email}</Text>
      <Text style={styles.roleBadge}>Contributor</Text>

      <TouchableOpacity
        style={styles.dangerButton}
        onPress={onSignOutPress}
        activeOpacity={0.8}>
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
    lineHeight: 18,
  },
  loader: {
    marginVertical: 20,
  },
  buttonStack: {
    gap: 10,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    paddingVertical: 13,
    borderRadius: 12,
  },
  googleButtonText: {
    color: '#374151',
    fontWeight: '700',
    fontSize: 15,
  },
  appleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
    paddingVertical: 13,
    borderRadius: 12,
  },
  appleButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  buttonIcon: {
    marginRight: 10,
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
