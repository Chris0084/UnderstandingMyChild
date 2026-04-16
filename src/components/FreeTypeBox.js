import React, { useState, useEffect, useRef } from 'react';
import {
  TextInput,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  useSpeechRecognitionEvent,
  ExpoSpeechRecognitionModule,
} from 'expo-speech-recognition';

const FreeTypeBox = ({
  label,
  placeholder,
  numLines = 2,
  value,
  onChangeText,
  editable = true,
  accentColor = '#3B6004',
  enableSpeech = false,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isThisBoxActive, setIsThisBoxActive] = useState(false);
  const [interimText, setInterimText] = useState(''); // Stores live speech in-progress

  // --- Animation Logic ---
  const pulseAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (isListening && isThisBoxActive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isListening, isThisBoxActive]);

  // --- Voice Events ---
  useSpeechRecognitionEvent('start', () => {
    if (isThisBoxActive) setIsListening(true);
  });

  useSpeechRecognitionEvent('end', () => {
    setIsListening(false);
    setIsThisBoxActive(false);
    setInterimText(''); // Clear the live preview when finished
  });

  useSpeechRecognitionEvent('error', event => {
    console.log('Speech Error:', event.error, event.message);
    setIsListening(false);
    setIsThisBoxActive(false);
    setInterimText('');
  });

  useSpeechRecognitionEvent('result', event => {
    if (!isThisBoxActive) return;

    const transcript = event.results[0]?.transcript;

    if (event.isFinal) {
      // User finished talking: Save permanently to the parent state
      const newValue = value ? `${value} ${transcript}` : transcript;
      onChangeText(newValue);
      setInterimText(''); // Reset preview
    } else {
      // User is still talking: Show live preview words
      setInterimText(transcript);
    }
  });

  const toggleListening = async () => {
    try {
      if (isListening && isThisBoxActive) {
        ExpoSpeechRecognitionModule.stop();
      } else {
        ExpoSpeechRecognitionModule.stop();

        const result =
          await ExpoSpeechRecognitionModule.requestPermissionsAsync();
        if (!result.granted) {
          Alert.alert('Permission denied', 'Microphone access is required.');
          return;
        }

        setIsThisBoxActive(true);
        await ExpoSpeechRecognitionModule.start({
          lang: 'en-GB', // Changed to UK as per your code
          interimResults: true, // Live updates enabled
          androidSpeechTimeout: 5000,
          androidRecognitionExtra: {
            'android.speech.extra.SPEECH_INPUT_MINIMUM_LENGTH_MILLIS': 5000,
            'android.speech.extra.SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS': 3000,
            'android.speech.extra.SPEECH_INPUT_POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS': 3000, // Fixed: set to 3000 to match others
          },
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
            style={[
              styles.input,
              { height: numLines * 24 },
              isListening && isThisBoxActive && { color: '#6a6a6a' }, // Dim color while live typing
            ]}
            placeholder={placeholder}
            placeholderTextColor="#868e76"
            // Show [Existing Text] + [Live Preview]
            value={
              interimText
                ? value
                  ? `${value} ${interimText}`
                  : interimText
                : value
            }
            onChangeText={onChangeText}
            editable={editable}
            multiline={true}
            numberOfLines={numLines}
            textAlignVertical="top"
          />

          {enableSpeech && (
            <TouchableOpacity
              style={styles.micButton}
              onPress={toggleListening}
              activeOpacity={0.7}>
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <Ionicons
                  name={isListening && isThisBoxActive ? 'mic' : 'mic-outline'}
                  size={26}
                  color={
                    isListening && isThisBoxActive ? '#47e73c' : accentColor
                  }
                />
              </Animated.View>
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
    fontSize: 14,
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
