import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
  Dimensions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const MediaSelector = ({ label, mediaUri, onMediaSelected, editable }) => {
  const [fullscreen, setFullscreen] = useState(false); // Controls the popup

  const pickMedia = async () => {
    if (!editable) return;

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission needed to access your gallery.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsEditing: true,
      quality: 0.7, // Slightly lower quality saves storage space
    });

    if (!result.canceled) {
      onMediaSelected(result.assets[0].uri);
    }
  };

  const removeMedia = () => {
    onMediaSelected(null);
  };

  // Logic for what happens when the thumbnail is tapped
  const handlePress = () => {
    if (editable) {
      pickMedia(); // If editing, tap to change
    } else if (mediaUri) {
      setFullscreen(true); // If viewing, tap to zoom
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <View style={[styles.card, !editable && styles.disabledCard]}>
        {mediaUri ? (
          <View style={styles.mediaWrapper}>
            {/* Wrap the thumbnail so it triggers handlePress */}
            <TouchableOpacity onPress={handlePress}>
              <Image source={{ uri: mediaUri }} style={styles.thumbnail} />
            </TouchableOpacity>

            <View style={styles.infoArea}>
              {/* Wrap the text area as well so it's a bigger touch target */}
              <TouchableOpacity onPress={handlePress}>
                <Text style={styles.filename} numberOfLines={1}>
                  Attachment added
                </Text>
                {!editable && (
                  <Text style={{ fontSize: 11, color: '#007AFF' }}>
                    Tap to view
                  </Text>
                )}
              </TouchableOpacity>

              {editable && (
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    onPress={pickMedia}
                    style={styles.smallButton}>
                    <Text style={styles.buttonText}>Change</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={removeMedia}
                    style={styles.deleteButton}>
                    <Ionicons name="trash-outline" size={16} color="#f44336" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.placeholderBtn}
            onPress={pickMedia}
            disabled={!editable}>
            <Ionicons
              name="attach"
              size={20}
              color={editable ? '#007AFF' : '#999'}
            />
            <Text
              style={[
                styles.placeholderText,
                !editable && styles.disabledText,
              ]}>
              Add photo or video evidence
            </Text>
          </TouchableOpacity>
        )}
      </View>
      {/* --- FULLSCREEN VIEW MODAL --- */}
      <Modal visible={fullscreen} transparent={true} animationType="fade">
        <View style={styles.fullScreenOverlay}>
          <TouchableOpacity
            style={styles.closeFull}
            onPress={() => setFullscreen(false)}>
            <Ionicons name="close-circle" size={40} color="white" />
          </TouchableOpacity>

          <Image
            source={{ uri: mediaUri }}
            style={styles.fullImage}
            resizeMode="contain"
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: '90%', marginBottom: 20 },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#999',
    letterSpacing: 1,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 10,
    minHeight: 80,
    justifyContent: 'center',
    // Shadow for that "card" look
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  disabledCard: { backgroundColor: '#F5F5F5', borderColor: '#EEE' },
  mediaWrapper: { flexDirection: 'row', alignItems: 'center' },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  infoArea: { flex: 1, marginLeft: 15, justifyContent: 'center' },
  filename: { fontSize: 14, fontWeight: '500', color: '#333', marginBottom: 5 },
  actionRow: { flexDirection: 'row', alignItems: 'center' },
  smallButton: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 15,
    marginRight: 10,
  },
  buttonText: { fontSize: 12, color: '#007AFF', fontWeight: 'bold' },
  deleteButton: { padding: 5 },
  placeholderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  placeholderText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  disabledText: { color: '#999' },
  fullScreenOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: width,
    height: height * 0.8,
  },
  closeFull: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
});

export default MediaSelector;
