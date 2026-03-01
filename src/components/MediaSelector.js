import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

const MediaSelector = ({ label, mediaUri, onMediaSelected, editable }) => {
  const pickMedia = async () => {
    if (!editable) return;

    // Request permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'], // Allows both
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      onMediaSelected(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={[styles.box, !editable && styles.disabledBox]}
        onPress={pickMedia}>
        {mediaUri ? (
          <View style={styles.previewContainer}>
            <Image source={{ uri: mediaUri }} style={styles.preview} />
            {editable && <Text style={styles.changeText}>Tap to Change</Text>}
          </View>
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="camera-outline" size={30} color="#999" />
            <Text style={styles.placeholderText}>Add Photo or Video</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: '90%', marginBottom: 15 },
  label: { fontSize: 12, fontWeight: '700', color: '#757575', marginBottom: 5 },
  box: {
    height: 100,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  disabledBox: { backgroundColor: '#eee', borderStyle: 'solid' },
  preview: { width: '100%', height: '100%' },
  placeholder: { alignItems: 'center' },
  placeholderText: { color: '#999', fontSize: 12, marginTop: 5 },
  changeText: {
    position: 'absolute',
    bottom: 5,
    backgroundColor: 'rgba(0,0,0,0.5)',
    color: '#fff',
    paddingHorizontal: 10,
    borderRadius: 10,
    fontSize: 10,
  },
});

export default MediaSelector;
