import React, { useState, useEffect, useCallback } from 'react';
import {
  TouchableOpacity,
  ScrollView,
  Text,
  StyleSheet,
  Alert,
  View,
  Button,
  Modal,
  TextInput,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';

// Import components
import FreeTypeBox from '../components/FreeTypeBox';
import DateStamp from '../components/DateStamp';
import TagSelector from '../components/TagSelector';
import CustomButton from '../components/CustomButton';
import MediaSelector from '../components/MediaSelector';
import StrategyModal from '../components/StrategyModal.js';
import Colors from '../constants/Colors.js';
import PageHeader from '../components/PageHeader.js';
import SplitButton from '../components/SplitButton.js';
import TimeOfDaySelector from '../components/TimeOfDaySelector.js';
import * as FileSystem from 'expo-file-system/legacy';
import ChildSelector from '../components/ChildSelector';
import { debugPrintAllStorage } from '../utils/debugStorage.js';
import ChildSelectModal from '../components/ChildSelectModal.js';

const getTimeOfDay = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Morning';
  if (hour >= 12 && hour < 17) return 'Afternoon';
  if (hour >= 17 && hour < 22) return 'Evening';
  return 'Night time';
};

const InputFormScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();

  const currentEntryParam = route.params?.existingEntry;

  const defaultStrategies = {
    'Calm down space': 'Not used',
    'Ear defenders': 'Not used',
    'Emotion Cards': 'Not used',
    'Now and Next board': 'Not used',
    'Visual timetables': 'Not used',
    'Weighted blanket': 'Not used',
  };

  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState('');
  const [isAddChildModalVisible, setIsAddChildModalVisible] = useState(false);
  const [newChildName, setNewChildName] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [allLogs, setAllLogs] = useState([]);
  const [where, setWhere] = useState('');
  const [leadUp, setLeadUp] = useState('');
  const [whatHappened, setWhatHappened] = useState('');
  const [after, setAfter] = useState('');
  const [logDate, setLogDate] = useState(new Date());
  const [selectedTags, setSelectedTags] = useState([]);
  const [mood, setMood] = useState(null);
  const [mediaUri, setMediaUri] = useState(null);
  const [isEditing, setIsEditing] = useState(true);
  const [strategies, setStrategies] = useState(defaultStrategies);
  const [modalVisible, setModalVisible] = useState(false);
  const [timeOfDay, setTimeOfDay] = useState(getTimeOfDay());
  const [childModalVisible, setChildModalVisible] = useState(false);

  // Find current child name for display on the trigger button
  const activeChild = children.find(c => c.id == selectedChildId);

  const handleSelectChild = async id => {
    setSelectedChildId(id);

    // If viewing an existing entry (View Mode), save child update immediately
    if (!isEditing && currentEntryParam?.id) {
      try {
        const savedData = await AsyncStorage.getItem('@app_logs');
        let currentLogs = savedData ? JSON.parse(savedData) : [];

        currentLogs = currentLogs.map(item =>
          item.id === currentEntryParam.id ? { ...item, childId: id } : item,
        );

        await AsyncStorage.setItem('@app_logs', JSON.stringify(currentLogs));
        setAllLogs(currentLogs);
      } catch (e) {
        Alert.alert('Error', 'Could not update child selection.');
      }
    }
  };

  const handleAddChild = () => {
    setNewChildName('');
    setIsAddChildModalVisible(true);
  };

  const handleSaveNewChild = async () => {
    if (!newChildName.trim()) {
      Alert.alert('Validation Error', 'Please enter a name for the profile.');
      return;
    }

    // Find the highest numeric ID currently in use and increment it
    const maxId = children.reduce((max, child) => {
      const num = parseInt(child.id, 10);
      return !isNaN(num) && num > max ? num : max;
    }, 0);

    const nextId = (maxId + 1).toString(); // Produces '2', '3', etc.

    const newChild = {
      id: nextId,
      name: newChildName.trim(),
      color: '#D32F2F',
      isActive: true,
    };

    const updatedChildren = [...children, newChild];

    try {
      setChildren(updatedChildren);
      setSelectedChildId(newChild.id);
      setIsAddChildModalVisible(false);

      await AsyncStorage.setItem(
        '@app_children',
        JSON.stringify(updatedChildren),
      );
    } catch (e) {
      Alert.alert('Error', 'Could not save new child profile.');
    }
  };

  const handleRenameChild = async (childId, newName) => {
    if (!newName.trim()) {
      Alert.alert('Validation Error', 'Profile name cannot be empty.');
      return;
    }

    // Map through children list to update the target child name immutably
    const updatedChildren = children.map(child => {
      if (child.id == childId) {
        return { ...child, name: newName.trim() };
      }
      return child;
    });

    try {
      // 1. Update component state so the UI updates instantly
      setChildren(updatedChildren);

      // 2. Persist the updated profiles array to AsyncStorage
      await AsyncStorage.setItem(
        '@app_children',
        JSON.stringify(updatedChildren),
      );
    } catch (e) {
      Alert.alert('Error', 'Could not save updated child profile name.');
    }
  };

  // Load children list on mount safely
  useEffect(() => {
    const loadChildren = async () => {
      try {
        const savedChildren = await AsyncStorage.getItem('@app_children');
        let parsed = savedChildren ? JSON.parse(savedChildren) : [];

        if (parsed.length === 0) {
          // Default seed only if storage is empty
          parsed = [
            { id: '1', name: 'Child 1', color: '#4A6159', isActive: true },
          ];
          await AsyncStorage.setItem('@app_children', JSON.stringify(parsed));
        }

        setChildren(parsed);

        // Check if there is a globally selected child, else fallback to first in array
        const savedSelectedId = await AsyncStorage.getItem(
          '@app_selected_child_id',
        );
        const defaultId =
          savedSelectedId && parsed.some(c => c.id === savedSelectedId)
            ? savedSelectedId
            : parsed[0]?.id;

        setSelectedChildId(defaultId);
      } catch (e) {
        console.error('Failed to load children profiles', e);
      }
    };

    loadChildren();
  }, []);

  useEffect(() => {
    const fetchAllLogs = async () => {
      const savedData = await AsyncStorage.getItem('@app_logs');
      if (savedData) {
        const parsed = JSON.parse(savedData);
        const sorted = parsed.sort(
          (a, b) => new Date(b.logDate) - new Date(a.logDate),
        );
        setAllLogs(sorted);
      }
    };
    fetchAllLogs();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const checkPremiumStatus = async () => {
        try {
          const result = await RevenueCatUI.presentPaywallIfNeeded({
            requiredEntitlementIdentifier: 'UMC_subscriber',
          });

          if (result === PAYWALL_RESULT.CANCELLED) {
            navigation.goBack();
            return;
          }
        } catch (error) {
          console.error('Failed to present RevenueCat Paywall overlay:', error);
        }
      };

      checkPremiumStatus();
      const entry = route.params?.existingEntry;
      const modeParam = route.params?.mode;

      if (entry && Object.keys(entry).length > 0) {
        setIsFavorite(entry.isFavorite || false);
        // Fallback dynamically to current selectedChildId or first child in list
        setSelectedChildId(entry.childId || selectedChildId || children[0]?.id);
        setWhere(entry.where || '');
        setLeadUp(entry.leadUp || '');
        setWhatHappened(entry.whatHappened || '');
        setAfter(entry.after || '');
        setLogDate(new Date(entry.logDate));
        setSelectedTags(entry.tags || []);
        setMediaUri(entry.mediaUri || null);
        setStrategies({ ...defaultStrategies, ...entry.strategies });
        setTimeOfDay(entry.timeOfDay || 'Morning');
        setIsEditing(modeParam !== 'renderReportView');
      } else {
        // Keep active selectedChildId instead of resetting to '1'
        setWhere('');
        setLeadUp('');
        setWhatHappened('');
        setAfter('');
        setLogDate(new Date());
        setSelectedTags([]);
        setMediaUri(null);
        setStrategies(defaultStrategies);
        setTimeOfDay(getTimeOfDay());
        setIsEditing(true);
      }
    }, [route.params, children]),
  );

  const handleToggleFavorite = async () => {
    const currentId = route.params?.existingEntry?.id;
    if (!currentId) return;

    try {
      const newFavoriteStatus = !isFavorite;
      setIsFavorite(newFavoriteStatus);

      const savedData = await AsyncStorage.getItem('@app_logs');
      let logs = savedData ? JSON.parse(savedData) : [];

      logs = logs.map(log =>
        log.id === currentId ? { ...log, isFavorite: newFavoriteStatus } : log,
      );

      await AsyncStorage.setItem('@app_logs', JSON.stringify(logs));
      setAllLogs(logs);
    } catch (e) {
      Alert.alert('Error', 'Could not save favorite status.');
    }
  };

  const handleDeleteLog = () => {
    Alert.alert(
      'Delete Log',
      'Are you sure you want to permanently delete this entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const currentId = route.params?.existingEntry?.id;
              const savedData = await AsyncStorage.getItem('@app_logs');
              let logs = savedData ? JSON.parse(savedData) : [];

              const updatedLogs = logs.filter(log => log.id !== currentId);

              await AsyncStorage.setItem(
                '@app_logs',
                JSON.stringify(updatedLogs),
              );
              setAllLogs(updatedLogs);

              Alert.alert('Deleted', 'Entry removed successfully.');
              navigation.goBack();
            } catch (e) {
              Alert.alert('Error', 'Could not delete entry.');
            }
          },
        },
      ],
    );
  };

  const handleStrategyChange = (name, value) => {
    setStrategies(prev => ({ ...prev, [name]: value }));
  };

  const navigateLogs = direction => {
    const currentId = route.params?.existingEntry?.id;
    const currentIndex = allLogs.findIndex(log => log.id === currentId);

    const nextIndex = currentIndex + direction;

    if (nextIndex >= 0 && nextIndex < allLogs.length) {
      const nextLog = allLogs[nextIndex];
      navigation.setParams({ existingEntry: nextLog });
    } else {
      Alert.alert(
        'End of logs',
        direction === 1
          ? "You've reached the oldest log."
          : "You're looking at the most recent log.",
      );
    }
  };

  const handleTagToggle = tag => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(item => item !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const saveMediaPermanently = async tempUri => {
    if (!tempUri) return null;

    try {
      const extension = tempUri.split('.').pop();
      const filename = `journal_${Date.now()}.${extension}`;
      const permanentUri = FileSystem.documentDirectory + filename;

      if (tempUri.includes(FileSystem.documentDirectory)) {
        return tempUri;
      }

      await FileSystem.copyAsync({
        from: tempUri,
        to: permanentUri,
      });

      return permanentUri;
    } catch (error) {
      console.error('Error saving media:', error);
      return tempUri;
    }
  };

  const handleSaveEntry = async () => {
    if (!where.trim()) {
      Alert.alert('Missing Info', "Please fill in the 'WHERE' field.");
      return;
    }

    try {
      const permanentMediaUri = await saveMediaPermanently(mediaUri);

      // Fallback childId to active selection or first child in list dynamically
      const targetChildId = selectedChildId || children[0]?.id || '1';

      const newEntry = {
        id: currentEntryParam ? currentEntryParam.id : Date.now().toString(),
        childId: targetChildId,
        where,
        leadUp,
        whatHappened,
        after,
        logDate: logDate.toISOString(),
        timeOfDay,
        tags: selectedTags,
        mediaUri: permanentMediaUri,
        strategies,
        isFavorite: currentEntryParam ? isFavorite : false,
      };

      const existingData = await AsyncStorage.getItem('@app_logs');
      let currentLogs = existingData ? JSON.parse(existingData) : [];

      if (currentEntryParam) {
        currentLogs = currentLogs.map(item =>
          item.id === currentEntryParam.id ? newEntry : item,
        );
      } else {
        currentLogs.push(newEntry);
      }

      await AsyncStorage.setItem('@app_logs', JSON.stringify(currentLogs));

      const sorted = currentLogs.sort(
        (a, b) => new Date(b.logDate) - new Date(a.logDate),
      );
      setAllLogs(sorted);

      Alert.alert('Saved', 'Your entry has been recorded!', [
        {
          text: 'OK',
          onPress: () =>
            navigation.navigate('MainApp', { screen: 'Reporting' }),
        },
      ]);
    } catch (e) {
      Alert.alert('Error', 'Could not save entry.');
    }
  };

  const availableTags = [
    'Sensory',
    'Communication',
    'Routine',
    'Social Connection',
    'Self-Regulated',
    'Executive Function',
    'Sleep',
  ];

  const renderReportView = () => {
    const getTimeStyles = time => {
      switch (time) {
        case 'Morning':
          return { icon: 'sunny-outline', color: '#FFB300' };
        case 'Afternoon':
          return { icon: 'partly-sunny-outline', color: '#FB8C00' };
        case 'Evening':
          return { icon: 'moon-outline', color: '#5C6BC0' };
        case 'Night time':
          return { icon: 'cloudy-night-outline', color: '#283593' };
        default:
          return { icon: 'time-outline', color: '#999' };
      }
    };

    const activeChild = children.find(c => c.id === selectedChildId);
    const timeStyles = getTimeStyles(timeOfDay);

    return (
      <View style={styles.reportCard}>
        {/* 1. NAVIGATION ROW */}
        <View style={styles.navRow}>
          <TouchableOpacity
            onPress={() => navigateLogs(+1)}
            style={styles.navButton}>
            <Ionicons name="chevron-back" size={24} color="#2196F3" />
            <Text style={styles.navText}>Prev</Text>
          </TouchableOpacity>

          <Text style={styles.logCounter}>
            {allLogs.length -
              allLogs.findIndex(
                l => l.id === route.params?.existingEntry?.id,
              )}{' '}
            of {allLogs.length}
          </Text>

          <TouchableOpacity
            onPress={() => navigateLogs(-1)}
            style={styles.navButton}>
            <Text style={styles.navText}>Next</Text>
            <Ionicons name="chevron-forward" size={24} color="#2196F3" />
          </TouchableOpacity>
        </View>

        {/* 2. HEADER SECTION */}
        <View style={styles.reportHeader}>
          {/* Display target child profile name */}
          {activeChild && (
            <Text
              style={{
                fontSize: 22,
                fontWeight: '800',
                color: Colors.primary,
                marginTop: 2,
              }}>
              {activeChild.name}
            </Text>
          )}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}>
            <View style={{ flexDirection: 'column', flex: 1 }}>
              <Text style={styles.reportDate}>{logDate.toDateString()}</Text>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: 4,
                }}>
                <Ionicons
                  name={timeStyles.icon}
                  size={18}
                  color={timeStyles.color}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: timeStyles.color,
                  }}>
                  {timeOfDay}
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity
                onPress={handleToggleFavorite}
                style={{ marginRight: 20 }}>
                <Ionicons
                  name={isFavorite ? 'star' : 'star-outline'}
                  size={30}
                  color={isFavorite ? Colors.starred_theme : '#999'}
                />
              </TouchableOpacity>

              <TouchableOpacity onPress={handleDeleteLog}>
                <Ionicons name="trash-outline" size={30} color="#F44336" />
              </TouchableOpacity>
            </View>
          </View>

          {/* 3. TAGS ROW */}
          <View style={styles.tagRow}>
            {selectedTags.length > 0 ? (
              selectedTags.map(tag => (
                <View key={tag} style={styles.reportTag}>
                  <Text style={styles.reportTagText}>{tag.toUpperCase()}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.placeholderText}>No tags selected</Text>
            )}
          </View>
        </View>

        {/* 4. CONTENT SECTIONS */}
        <View style={styles.reportSection}>
          <Text style={styles.reportLabel}>LOCATION</Text>
          <Text style={styles.reportValue}>{where || 'Not recorded'}</Text>
        </View>

        <View style={styles.reportSection}>
          <Text style={styles.reportLabel}>DETAILS</Text>
          <Text style={styles.reportSubLabel}>Lead Up:</Text>
          <Text style={styles.reportValue}>{leadUp || 'No details'}</Text>
          <Text style={[styles.reportSubLabel, { marginTop: 10 }]}>
            What Happened:
          </Text>
          <Text style={styles.reportValue}>{whatHappened || 'No details'}</Text>
          <Text style={[styles.reportSubLabel, { marginTop: 10 }]}>
            Recovery/After:
          </Text>
          <Text style={styles.reportValue}>{after || 'No details'}</Text>
        </View>

        {mediaUri && (
          <View style={styles.reportSection}>
            <Text style={styles.reportLabel}>ATTACHED MEDIA</Text>
            <MediaSelector mediaUri={mediaUri} editable={false} />
          </View>
        )}

        {/* 5. STRATEGIES SECTION */}
        <View
          style={[
            styles.reportSection,
            { borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 15 },
          ]}>
          <Text style={styles.reportLabel}>SUPPORT STRATEGIES USED</Text>
          {Object.values(strategies).every(v => v === 'Not used') ? (
            <Text style={styles.placeholderText}>No strategies were used.</Text>
          ) : (
            Object.entries(strategies).map(([name, value]) => {
              if (value !== 'Not used') {
                return (
                  <View key={name} style={styles.reportStrategyRow}>
                    <Ionicons
                      name={
                        value.includes('Effective')
                          ? 'checkmark-circle'
                          : 'close-circle'
                      }
                      size={18}
                      color={
                        value.includes('Effective') ? '#4CAF50' : '#F44336'
                      }
                    />
                    <Text style={styles.reportValue}>
                      <Text style={{ fontWeight: 'bold' }}> {name}:</Text>{' '}
                      {value}
                    </Text>
                  </View>
                );
              }
              return null;
            })
          )}
        </View>
      </View>
    );
  };

  const renderFormView = () => (
    <>
      <FreeTypeBox
        label="WHERE"
        placeholder="Location (e.g Playground, Kitchen)..."
        value={where}
        onChangeText={setWhere}
        editable={true}
        accentColor={Colors.box_accent}
      />
      <FreeTypeBox
        label="LEAD UP"
        placeholder="Triggers or environmental factors..."
        value={leadUp}
        onChangeText={setLeadUp}
        editable={true}
        accentColor={Colors.box_accent}
        numLines={3}
        enableSpeech={true}
      />
      <FreeTypeBox
        label="WHAT HAPPENED"
        placeholder="Triggers or environmental factors..."
        value={whatHappened}
        onChangeText={setWhatHappened}
        editable={true}
        accentColor={Colors.box_accent}
        numLines={3}
        enableSpeech={true}
      />
      <FreeTypeBox
        label="AFTER"
        placeholder="Immediate outcome or recovery..."
        value={after}
        onChangeText={setAfter}
        editable={true}
        accentColor={Colors.box_accent}
        numLines={3}
        enableSpeech={true}
      />
      <DateStamp
        label="DATE"
        date={logDate}
        onChange={setLogDate}
        editable={true}
      />
      <TimeOfDaySelector onSelect={setTimeOfDay} selectedTime={timeOfDay} />
      <TagSelector
        label="Observation Categories"
        tags={availableTags}
        selectedTags={selectedTags}
        onToggle={handleTagToggle}
        editable={true}
      />
      <MediaSelector
        label="ATTACHED MEDIA"
        mediaUri={mediaUri}
        onMediaSelected={setMediaUri}
        editable={true}
      />
      <SplitButton
        label="Add Support Strategies"
        iconName="help-buoy-outline"
        leftColor={Colors.button_main}
        rightColor={Colors.support_strat_accent}
        onPress={() => setModalVisible(true)}
      />
      <View style={styles.summaryContainer}>
        {Object.entries(strategies).map(
          ([name, value]) =>
            value !== 'Not used' && (
              <View key={name} style={styles.strategyChip}>
                <Ionicons
                  name={
                    value.includes('Effective')
                      ? 'checkmark-circle'
                      : 'close-circle'
                  }
                  size={16}
                  color={value.includes('Effective') ? '#4CAF50' : '#F44336'}
                />
                <Text style={styles.chipText}>
                  <Text style={{ fontWeight: 'bold' }}> {name}:</Text> {value}
                </Text>
                <TouchableOpacity
                  onPress={() => handleStrategyChange(name, 'Not used')}
                  style={styles.deleteIcon}>
                  <Ionicons name="trash-outline" size={16} color="#999" />
                </TouchableOpacity>
              </View>
            ),
        )}
      </View>
    </>
  );

  return (
    <View style={[styles.scrollView, { paddingTop: insets.top }]}>
      <View style={{ width: '100%' }}>
        <PageHeader
          title={
            route.params?.existingEntry
              ? isEditing
                ? 'Edit Journal Entry'
                : 'Log Report'
              : 'New Journal Entry'
          }
          iconName={
            route.params?.existingEntry
              ? isEditing
                ? 'create-outline'
                : 'document-text-outline'
              : 'add-circle-outline'
          }
          iconColor={isEditing ? '#000000' : Colors.primary}
          accentColor={Colors.log_theme}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        style={{ backgroundColor: Colors.background }}>
        {/* Top Child Selector - Interactive in both Edit and View modes */}
        {!route.params?.existingEntry && (
          <ChildSelector
            childrenList={children}
            selectedChildId={selectedChildId}
            onSelectChild={handleSelectChild}
            onAddChild={handleAddChild}
            onRenameChild={handleRenameChild}
          />
        )}

        {/* {Boolean(route.params?.existingEntry) &&
          isEditing &&
          children.length > 1 && (
            <View style={styles.selectorWrapper}>
              <Text style={styles.fieldLabel}>Child Profile</Text>

              <TouchableOpacity
                style={styles.triggerButton}
                onPress={() => setChildModalVisible(true)}>
                <Text style={styles.triggerText}>
                  {activeChild ? activeChild.name : 'Select Child'}
                </Text>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>

              <ChildSelectModal
                visible={childModalVisible}
                childrenList={children}
                selectedChildId={selectedChildId}
                onSelectChild={id => setSelectedChildId(id)}
                onClose={() => setChildModalVisible(false)}
              />
            </View>
          )} */}

        {Boolean(route.params?.existingEntry) &&
          isEditing &&
          children.length > 1 && (
            <View style={styles.selectorWrapper}>
              <TouchableOpacity
                style={styles.childSelectorCard}
                onPress={() => setChildModalVisible(true)}
                activeOpacity={0.8}>
                <View style={styles.childInfoLeft}>
                  {/* Dynamic background color from activeChild */}
                  <View
                    style={[
                      styles.childAvatarCircle,
                      {
                        backgroundColor:
                          activeChild?.color || Colors.primary || '#2196f3',
                      },
                    ]}>
                    <Text style={styles.childAvatarText}>
                      {activeChild?.name
                        ? activeChild.name.charAt(0).toUpperCase()
                        : '?'}
                    </Text>
                  </View>

                  <View style={styles.childMetaText}>
                    <Text style={styles.childLabel}>Selected Child</Text>
                    <Text style={styles.childName}>
                      {activeChild ? activeChild.name : 'Select Child'}
                    </Text>
                  </View>
                </View>

                <View style={styles.actionBadge}>
                  <Text style={styles.actionBadgeText}>Change ▾</Text>
                </View>
              </TouchableOpacity>

              <ChildSelectModal
                visible={childModalVisible}
                childrenList={children}
                selectedChildId={selectedChildId}
                onSelectChild={id => setSelectedChildId(id)}
                onClose={() => setChildModalVisible(false)}
              />
            </View>
          )}

        {/* <Button
          title="🔍 Debug Print All Storage"
          onPress={debugPrintAllStorage}
          color="#FF9800"
        /> */}

        {isEditing ? renderFormView() : renderReportView()}

        <StrategyModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          strategies={strategies}
          onUpdate={handleStrategyChange}
        />

        <View style={styles.buttonContainer}>
          {isEditing ? (
            <SplitButton
              label="Save"
              iconName="save-outline"
              leftColor={Colors.button_main}
              rightColor={Colors.save_button_accent}
              onPress={handleSaveEntry}
              style={styles.halfButton}
            />
          ) : (
            <SplitButton
              label="Edit"
              iconName="create-outline"
              leftColor={Colors.button_main}
              rightColor={Colors.edit_button_accent}
              onPress={() => setIsEditing(true)}
              style={styles.halfButton}
            />
          )}
          <SplitButton
            label="Back"
            iconName="chevron-back-outline"
            leftColor={Colors.button_main}
            rightColor={Colors.back_button_accent}
            onPress={() => navigation.goBack()}
            style={styles.halfButton}
          />
        </View>
      </ScrollView>
      <Modal
        visible={isAddChildModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsAddChildModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Add Child Profile</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Child's Name"
              value={newChildName}
              onChangeText={setNewChildName}
              autoFocus={true}
              maxLength={12}
            />

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsAddChildModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveNewChild}>
                <Text style={styles.saveButtonText}>Add Profile</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    justify: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingBottom: 300,
  },
  text: { fontSize: 20, marginBottom: 20 },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    marginTop: 0,
  },
  halfButton: {
    width: '48%',
    marginVertical: 0,
  },
  summaryContainer: {
    width: '90%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    minHeight: 50,
    marginBottom: 10,
  },
  strategyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingLeft: 10,
    paddingRight: 5,
    paddingVertical: 6,
    margin: 4,
    elevation: 1,
  },
  deleteIcon: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 5,
    borderLeftWidth: 1,
    borderLeftColor: '#eee',
  },
  chipText: {
    fontSize: 12,
    color: '#333',
    marginLeft: 4,
  },
  reportCard: {
    width: '92%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#efefef',
    borderLeftColor: Colors.apricot,
    borderLeftWidth: 20,
  },
  reportHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 15,
    marginBottom: 15,
  },
  reportDate: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  reportLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#999',
    letterSpacing: 1,
    marginBottom: 5,
  },
  reportSection: {
    marginBottom: 20,
  },
  reportSubLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#555',
  },
  reportValue: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  reportTag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginRight: 6,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  reportTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#666',
  },
  reportStrategyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 10,
    paddingRight: 10,
  },
  placeholderText: {
    fontSize: 14,
    color: '#aaa',
    fontStyle: 'italic',
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
  },
  navText: {
    color: '#2196F3',
    fontWeight: '600',
    fontSize: 14,
  },
  logCounter: {
    fontSize: 12,
    color: '#999',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: Colors.primary || '#2196F3',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  triggerButton: {
    width: '90%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  triggerText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  selectorWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  childSelectorCard: {
    width: '90%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f0f7ff',
    borderWidth: 1.5,
    borderColor: Colors.primary || '#2196f3',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 10,
    shadowColor: Colors.primary || '#2196f3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  childInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  childAvatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.primary || '#2196f3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  childAvatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  childMetaText: {
    justifyContent: 'center',
  },
  childLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  childName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  actionBadge: {
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary || '#2196f3',
  },
  actionBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary || '#2196f3',
  },
});

export default InputFormScreen;
