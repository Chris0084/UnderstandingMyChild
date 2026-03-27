import React, { useRef } from 'react';
import {
  Modal,
  View,
  Text,
  PanResponder,
  Animated,
  StyleSheet,
  ScrollView,
  Switch,
} from 'react-native';
import TagSelector from './TagSelector';
import CustomButton from './CustomButton';

const FilterModal = ({
  visible,
  onClose,
  tags,
  selectedTags,
  onToggleTag,
  onReset,
  showFavoritesOnly,
  onToggleFavorites,
}) => {
  // 1. Setup Animation Value for the Y position
  const panY = useRef(new Animated.Value(0)).current;

  // 2. Setup the PanResponder logic
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event([null, { dy: panY }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (e, gestureState) => {
        // If swiped down more than 100 pixels
        if (gestureState.dy > 100) {
          onClose(); // Close modal
        }

        // Reset position if they didn't swipe far enough
        Animated.spring(panY, {
          toValue: 0,
          useNativeDriver: false,
        }).start();
      },
    }),
  ).current;

  const topPos = panY.interpolate({
    inputRange: [0, 500],
    outputRange: [0, 500],
    extrapolate: 'clamp',
  });

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.overlay}>
        <Animated.View
          style={[styles.modalContent, { transform: [{ translateY: topPos }] }]}
          {...panResponder.panHandlers}>
          {/* 3. The Visual "Grabber" Bar */}
          <View style={styles.grabberContainer}>
            <View style={styles.grabber} />
          </View>
          <View style={styles.modalContent}>
            <Text style={styles.title}>Filter Entries</Text>
            <View style={styles.filterSection}>
              <Text style={styles.sectionLabel}>Show Favorites Only</Text>
              <Switch
                trackColor={{ false: '#767577', true: '#E91E63' }}
                thumbColor={showFavoritesOnly ? '#fff' : '#f4f3f4'}
                onValueChange={onToggleFavorites}
                value={showFavoritesOnly}
              />
            </View>

            <ScrollView>
              <TagSelector
                label="Filter by Tags"
                tags={tags}
                selectedTags={selectedTags}
                onToggle={onToggleTag}
              />
            </ScrollView>

            <View style={styles.buttonRow}>
              <CustomButton
                label="Reset"
                color="#999"
                onPress={onReset}
                style={{ width: '45%' }}
              />
              <CustomButton
                label="Apply"
                color="#4CAF50"
                onPress={onClose}
                style={{ width: '45%' }}
              />
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  innerContent: {
    // Removed the nested modalContent style to fix double padding
  },
  grabberContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 15,
  },
  grabber: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#CCC',
  },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  filterSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionLabel: { fontSize: 16, color: '#444', fontWeight: '600' },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
});

export default FilterModal;
