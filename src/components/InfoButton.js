import React, { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  Modal,
  ScrollView,
} from 'react-native';
import TitleText from '../textComponents/TitleText';
import BodyText from '../textComponents/BodyText';
import LineSpacer from '../textComponents/LineSpacer';
import CustomButton from './CustomButton'; // Reusing your existing Close button

const InfoButton = ({ label, modalTitle, modalBody }) => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View>
      {/* THE TRIGGER BUTTON */}
      <TouchableOpacity
        style={styles.buttonPill}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}>
        <Text style={styles.buttonLabel}>{label}</Text>
        {/* This icon makes it obvious it's clickable */}
        <Text style={styles.arrowIcon}>➔</Text>
      </TouchableOpacity>

      {/* THE MODAL */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.overlay}>
          <View style={styles.modalView}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <TitleText style={styles.centeredTitle}>{modalTitle}</TitleText>
              <LineSpacer height={15} />

              <BodyText>{modalBody}</BodyText>

              <LineSpacer height={20} />
            </ScrollView>

            <CustomButton
              label="Close"
              color="#757575"
              onPress={() => setModalVisible(false)}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  buttonPill: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderRadius: 15,
    marginVertical: 8,
    width: '100%',
    // Soft Shadow
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF', // Blue accent stripe
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  arrowIcon: {
    fontSize: 18,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)', // Dim the background
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 25,
    padding: 25,
    elevation: 5,
  },
  centeredTitle: {
    textAlign: 'center',
    color: '#007AFF',
  },
});

export default InfoButton;
