import React, { useState } from 'react';
import { Video, ResizeMode } from 'expo-av';
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
  const [fullscreen, setFullscreen] = useState(false);

  // Helper to check if the file is a video
  const isVideo =
    mediaUri?.toLowerCase().endsWith('.mp4') ||
    mediaUri?.toLowerCase().endsWith('.mov') ||
    mediaUri?.toLowerCase().endsWith('.m4v');

  const pickMedia = async () => {
    if (!editable) return;
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission needed to access your gallery.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'], // Allows both
      allowsEditing: false,
      quality: 0.7,
    });

    if (!result.canceled) {
      onMediaSelected(result.assets[0].uri);
    }
  };

  const handlePress = () => {
    if (editable) {
      pickMedia();
    } else if (mediaUri) {
      setFullscreen(true);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <View style={[styles.card, !editable && styles.disabledCard]}>
        {mediaUri ? (
          <View style={styles.mediaWrapper}>
            {/* THUMBNAIL SECTION */}
            <TouchableOpacity
              onPress={handlePress}
              style={styles.thumbnailContainer}>
              {isVideo ? (
                <View>
                  <Video
                    source={{ uri: mediaUri }}
                    style={styles.thumbnail}
                    resizeMode={ResizeMode.COVER}
                    shouldPlay={false}
                    positionMillis={500} // Shows a frame from 0.5s in
                  />
                  {/* Overlay play icon so user knows it's a video */}
                  <View style={styles.playIconOverlay}>
                    <Ionicons name="play" size={16} color="white" />
                  </View>
                </View>
              ) : (
                <Image source={{ uri: mediaUri }} style={styles.thumbnail} />
              )}
            </TouchableOpacity>

            <View style={styles.infoArea}>
              <TouchableOpacity onPress={handlePress}>
                <Text style={styles.filename} numberOfLines={1}>
                  {isVideo ? 'Video Attachment' : 'Image Attachment'}
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
                    onPress={() => onMediaSelected(null)}
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
              Add Media
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* FULLSCREEN MODAL */}
      <Modal visible={fullscreen} transparent={true} animationType="fade">
        <View style={styles.fullScreenOverlay}>
          <TouchableOpacity
            style={styles.closeFull}
            onPress={() => setFullscreen(false)}>
            <Ionicons name="close-circle" size={40} color="white" />
          </TouchableOpacity>

          {isVideo ? (
            <Video
              source={{ uri: mediaUri }}
              style={styles.fullImage}
              useNativeControls
              resizeMode={ResizeMode.CONTAIN}
              shouldPlay={true}
            />
          ) : (
            <Image
              source={{ uri: mediaUri }}
              style={styles.fullImage}
              resizeMode="contain"
            />
          )}
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
    borderWidth: 3,
    borderColor: '#5d5a5a',
    borderStyle: 'dashed',
    padding: 10,
    minHeight: 60,
    justifyContent: 'center',
    elevation: 2,
  },
  disabledCard: { backgroundColor: '#F5F5F5', borderColor: '#EEE' },
  mediaWrapper: { flexDirection: 'row', alignItems: 'center' },
  thumbnailContainer: {
    position: 'relative',
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  playIconOverlay: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    padding: 4,
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
  fullImage: { width: width, height: height * 0.8 },
  closeFull: { position: 'absolute', top: 50, right: 20, zIndex: 10 },
});

export default MediaSelector;
