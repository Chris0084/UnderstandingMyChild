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
import CustomButton from './CustomButton'; // Reusing your existing button for the modal close
import Colors from '../constants/Colors';

const HorizontalInfoCard = ({ title, body, label, imageSource }) => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <TouchableOpacity
        style={styles.card}
        onPress={() => setModalVisible(true)}
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
                color="#2196F3"
              />
            </View>
          )}
        </View>
        <Text style={styles.cardLabel} numberOfLines={2}>
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
              color="#2196F3"
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
    height: 160, // Increased height slightly to fit image + text better
    backgroundColor: '#fff',
    borderRadius: 20,
    marginRight: 15,
    overflow: 'hidden', // Clips the image to the card corners
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  imageContainer: {
    width: '100%',
    height: '65%', // Image takes up the top portion
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
    padding: 8, // Space around the text at the bottom
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
    color: '#2196F3',
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
