import React, { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Modal,
  View,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CustomButton from './CustomButton';
import Colors from '../constants/Colors';

// Analytics Helper
import { trackAnalyticsAndExecute } from '../utils/analyticsHelper';

const HorizontalInfoCard = ({
  title,
  body,
  label,
  imageSource,
  analyticsId,
  analyticsParams,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const handleCardPress = () => {
    // Generate a fallback key from label/title if analyticsId isn't explicitly passed
    const fallbackKey = (label || title || 'card')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, '_');

    const eventName = analyticsId
      ? `info_card_${analyticsId}`
      : `info_card_${fallbackKey}`;

    trackAnalyticsAndExecute(
      eventName,
      () => {
        setModalVisible(true);
      },
      analyticsParams,
    );
  };

  return (
    <>
      <TouchableOpacity
        style={styles.card}
        onPress={handleCardPress}
        activeOpacity={0.8}>
        <View style={styles.imageContainer}>
          {imageSource ? (
            <Image
              source={imageSource}
              style={styles.cardImage}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.iconCircle}>
              <Ionicons
                name="information-circle-outline"
                size={24}
                color="#85b285"
              />
            </View>
          )}
        </View>
        <Text style={styles.cardLabel} numberOfLines={3}>
          {label}
        </Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{title}</Text>
            <ScrollView style={styles.modalBodyScroll}>
              <Text style={styles.modalBodyText}>{body}</Text>
            </ScrollView>
            <CustomButton
              label="Close"
              onPress={() => setModalVisible(false)}
              color="#85b285"
            />
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 140,
    height: 160,
    backgroundColor: '#fff',
    borderRadius: 20,
    marginRight: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  imageContainer: {
    width: '100%',
    height: '55%',
    backgroundColor: Colors.info_card_background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 25,
    padding: 25,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#85b285',
  },
  modalBodyScroll: {
    marginBottom: 20,
  },
  modalBodyText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
  },
});

export default HorizontalInfoCard;
