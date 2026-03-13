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
      'Weighted lap pad',
      'Compression clothing',
      'Deep pressure input',
      'Fidget tool / sensory object',
      'Movement break',
      'Balance cushion / wobble cushion',
      'Rocking chair or alternative seating',
      'Sensory swing',
      'Comfortable clothing',
    ],
  },
  {
    category: 'Structure & Predictability Supports',
    items: [
      'Visual timetable',
      'Now & Next board',
      'First/Then cards',
      'Timers or countdown clocks',
      'Routine charts',
      'Transition warnings',
      'Social story',
    ],
  },
  {
    category: 'Communication Supports',
    items: [
      'Visual supports / symbols',
      'AAC device or communication app',
      'Communication cards',
      'Reduced language',
      'Extra processing time',
      'Modelling expected language',
      'One instruction at a time',
    ],
  },
  {
    category: 'Social Interaction Supports',
    items: [
      'Social stories',
      'Comic strip conversations',
      'Small group interactions',
    ],
  },
  {
    category: 'Emotional Regulation Supports',
    items: [
      'Calm-down space',
      'Emotion cards or visuals',
      'Co-regulation with trusted adult',
      'Recovery time',
      'Predictable recovery routines',
    ],
  },
  {
    category: 'Environment Adjustments',
    items: ['Quiet workspace', 'Reduced group size'],
  },
  {
    category: 'Executive Function Supports',
    items: [
      'Checklists',
      'Visual planners',
      'Task breakdown cards',
      'Reminder systems',
      'Adult prompting for task initiation',
    ],
  },
  {
    category: 'Masking / Energy Management Supports',
    items: ['Recovery time after social demand', 'Quiet decompression time'],
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
