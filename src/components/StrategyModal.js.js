import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import StrategyRadioButton from './StrategyRadioButton';

const STRATEGY_DATA = [
  {
    category: 'Sensory Supports',
    items: [
      'Ear defenders / noise-reducing headphones',
      'Quiet space / low stimulation area',
      'Reduced lighting',
      'Weighted blanket',
      'Movement breaks',
    ],
  },
  {
    category: 'Structure & Predictability',
    items: [
      'Visual timetable',
      'Now & Next board',
      'Timers / countdown clocks',
      'Preparation for change',
    ],
  },
  {
    category: 'Communication',
    items: ['Visual supports', 'Written instructions', 'Processing time'],
  },
  {
    category: 'Emotional Regulation',
    items: ['Calm-down space', 'Co-regulation with adult', 'Recovery time'],
  },
];

// This creates the { 'Item Name': 'Not used' } object automatically
const defaultStrategies = {};
STRATEGY_DATA.forEach(cat => {
  cat.items.forEach(item => {
    defaultStrategies[item] = 'Not used';
  });
});

const StrategyModal = ({ visible, onClose, strategies, onUpdate }) => {
  const [expandedCategory, setExpandedCategory] = useState(null);

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Support Strategies</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close-circle" size={30} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView>
            {STRATEGY_DATA.map(cat => (
              <View key={cat.category} style={styles.catWrapper}>
                <TouchableOpacity
                  style={styles.catHeader}
                  onPress={() =>
                    setExpandedCategory(
                      expandedCategory === cat.category ? null : cat.category,
                    )
                  }>
                  <Text style={styles.catTitle}>{cat.category}</Text>
                  <Ionicons
                    name={
                      expandedCategory === cat.category
                        ? 'chevron-up'
                        : 'chevron-down'
                    }
                    size={20}
                  />
                </TouchableOpacity>

                {expandedCategory === cat.category && (
                  <View style={styles.itemsList}>
                    {cat.items.map(item => (
                      <StrategyRadioButton
                        key={item}
                        label={item}
                        value={strategies[item] || 'Not used'}
                        onSelect={val => onUpdate(item, val)}
                      />
                    ))}
                  </View>
                )}
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.doneBtn} onPress={onClose}>
            <Text style={styles.doneText}>Done</Text>
          </TouchableOpacity>
        </View>
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
  content: {
    backgroundColor: '#fff',
    height: '80%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: { fontSize: 20, fontWeight: 'bold' },
  catWrapper: {
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  catHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
  },
  catTitle: { fontSize: 16, fontWeight: '600', color: '#4CAF50' },
  itemsList: { paddingBottom: 10 },
  doneBtn: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  doneText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default StrategyModal;
