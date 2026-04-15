import React, { useState } from 'react';
import {
  TextInput,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  useSpeechRecognitionEvent,
  ExpoSpeechRecognitionModule,
} from 'expo-speech-recognition';

const FreeTypeBox = ({
  label,
  placeholder,
  numLines,
  value,
  onChangeText,
  editable = true,
  accentColor = '#3B6004',
  enableSpeech = false,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isThisBoxActive, setIsThisBoxActive] = useState(false);

  // --- Voice Events ---

  // Only turn on the "listening" visual (red mic) if THIS box is the active one
  useSpeechRecognitionEvent('start', () => {
    if (isThisBoxActive) {
      setIsListening(true);
    }
  });

  useSpeechRecognitionEvent('end', () => {
    setIsListening(false);
    setIsThisBoxActive(false); // Reset so other boxes don't get confused
  });

  useSpeechRecognitionEvent('error', event => {
    console.log('Speech Error:', event.error, event.message);
    setIsListening(false);
    setIsThisBoxActive(false);
  });

  useSpeechRecognitionEvent('result', event => {
    // CRITICAL: Only update the text if this specific box started the session
    if (!isThisBoxActive) return;

    const transcript = event.results[0]?.transcript;
    if (transcript) {
      const newValue = value ? `${value} ${transcript}` : transcript;
      onChangeText(newValue);
    }
  });

  const toggleListening = async () => {
    try {
      if (isListening && isThisBoxActive) {
        // If we are currently the one listening, stop it
        ExpoSpeechRecognitionModule.stop();
      } else {
        // If another box is listening, we should probably stop that first (safety)
        ExpoSpeechRecognitionModule.stop();

        const result =
          await ExpoSpeechRecognitionModule.requestPermissionsAsync();
        if (!result.granted) {
          Alert.alert(
            'Permission denied',
            'Microphone access is required for voice typing.',
          );
          return;
        }

        // 1. Tell THIS instance it is now the target for results
        setIsThisBoxActive(true);

        // 2. Start the engine
        await ExpoSpeechRecognitionModule.start({
          lang: 'en-US',
          interimResults: false,
        });
      }
    } catch (e) {
      console.error('Failed to toggle voice:', e);
      setIsThisBoxActive(false);
    }
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View style={[styles.inputContainer, { borderLeftColor: accentColor }]}>
        <View style={styles.shadowWrapper}>
          <TextInput
            style={[styles.input, { height: numLines * 24 }]}
            placeholder={placeholder}
            placeholderTextColor="#868e76"
            value={value}
            onChangeText={onChangeText}
            editable={editable}
            multiline={true}
            numberOfLines={numLines}
            textAlignVertical="top"
          />

          {/* --- The Mic Button --- */}
          {enableSpeech && (
            <TouchableOpacity
              style={styles.micButton}
              onPress={toggleListening}
              activeOpacity={0.7}>
              <Ionicons
                name={isListening && isThisBoxActive ? 'mic' : 'mic-outline'}
                size={22}
                color={isListening && isThisBoxActive ? '#E74C3C' : accentColor}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    width: '90%',
    alignSelf: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4a463f',
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  shadowWrapper: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    backgroundColor: '#f7f5f2',
    borderRadius: 12,
    position: 'relative',
  },
  inputContainer: {
    borderRadius: 12,
    borderLeftWidth: 20,
    backgroundColor: '#f7f5f2',
  },
  input: {
    borderWidth: 1,
    borderLeftWidth: 0,
    borderColor: '#ccc',
    borderBottomRightRadius: 12,
    borderTopRightRadius: 12,
    padding: 12,
    paddingRight: 45,
    fontSize: 16,
    backgroundColor: '#f7f5f2',
    color: '#000',
  },
  micButton: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    padding: 4,
  },
});

export default FreeTypeBox;
