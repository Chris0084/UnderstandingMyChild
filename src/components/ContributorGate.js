// components/ContributorGate.js
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function ContributorGate({
  children,
  navigation,
  screenTitle = 'This Section',
  allowContributor = false, // If true, contributor can view this page
}) {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Re-check role whenever the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      const checkRole = async () => {
        try {
          const storedRole = await AsyncStorage.getItem('@user_role');
          if (isMounted) {
            setRole(storedRole);
          }
        } catch (e) {
          console.error('Error checking user role in ContributorGate:', e);
        } finally {
          if (isMounted) {
            setLoading(false);
          }
        }
      };

      checkRole();

      return () => {
        isMounted = false;
      };
    }, []),
  );

  // 1. Loading state while reading AsyncStorage
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="small" color="#4A6159" />
      </View>
    );
  }

  // 2. If user is a contributor and this screen is restricted
  if (role === 'contributor' && !allowContributor) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <Ionicons name="lock-closed" size={32} color="#4A6159" />
          </View>

          <Text style={styles.title}>Primary Account Feature</Text>
          <Text style={styles.message}>
            You’re currently logged in as a household contributor. Your access
            is set up to create and submit new logs. Viewing{' '}
            {screenTitle.toLowerCase()} is reserved for the primary account
            owner as part of their subscription.
          </Text>

          {/* Action: Go Back */}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation?.goBack()}
            activeOpacity={0.8}>
            <Ionicons name="arrow-back" size={18} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // 3. Normal Owner or allowed user -> Render normal screen
  return children;
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    width: '100%',
    maxWidth: 380,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#EBF2EE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 10,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 24,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A6159',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    width: '100%',
    gap: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});
