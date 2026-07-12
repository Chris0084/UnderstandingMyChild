import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const TimelineStepCard = ({
  stepNumber,
  title,
  weekLabel,
  summary,
  parentRole,
  expandedDetails,
  isLast,
  isCompleted,
  onToggleComplete,
  sourceUrl,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  const handleCheckboxTap = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onToggleComplete();
  };

  return (
    <View style={styles.timelineRow}>
      {/* LEFT COLUMN: Timeline Node Line & Dot */}
      <View style={styles.leftColumn}>
        <View style={[styles.dot, isCompleted && styles.dotCompleted]} />
        {!isLast && (
          <View
            style={[styles.verticalLine, isCompleted && styles.lineCompleted]}
          />
        )}
      </View>

      {/* RIGHT COLUMN: The Main Card */}
      <View style={styles.cardContainer}>
        <View style={[styles.card, isCompleted && styles.cardCompleted]}>
          {/* Top Status Bar: Checkbox + Action Label */}
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={handleCheckboxTap}
            activeOpacity={0.7}>
            <Ionicons
              name={isCompleted ? 'checkbox' : 'square-outline'}
              size={20}
              color={isCompleted ? '#4CAF50' : '#707070'}
            />
            <Text
              style={[
                styles.checkboxLabel,
                isCompleted && styles.checkboxLabelCompleted,
              ]}>
              {isCompleted ? 'Completed!' : 'Mark as complete'}
            </Text>
          </TouchableOpacity>

          {/* Title & Badge Row */}
          <View style={styles.headerRow}>
            <Text
              style={[
                styles.titleText,
                isCompleted && styles.titleTextCompleted,
              ]}>
              {stepNumber}. {title}
            </Text>

            {weekLabel && (
              <View
                style={[
                  styles.weekBadge,
                  isCompleted && styles.weekBadgeCompleted,
                ]}>
                <Text style={styles.weekBadgeText}>{weekLabel}</Text>
              </View>
            )}
          </View>

          {/* Content Body */}
          <View style={isCompleted && styles.contentCompleted}>
            <Text style={styles.summaryText}>{summary}</Text>

            {parentRole && (
              <View
                style={[
                  styles.parentRoleBox,
                  isCompleted && styles.parentRoleBoxCompleted,
                ]}>
                <Text
                  style={[
                    styles.parentRoleTitle,
                    isCompleted && styles.parentRoleTitleCompleted,
                  ]}>
                  Parent Role
                </Text>
                <Text style={styles.parentRoleBody}>{parentRole}</Text>
              </View>
            )}

            {isExpanded && (
              <View style={styles.expandedContent}>
                <Text style={styles.detailsHeading}>Detailed Guidance:</Text>
                <Text style={styles.detailsText}>{expandedDetails}</Text>

                {/* Web Link Integration */}
                {sourceUrl && (
                  <TouchableOpacity
                    style={styles.linkButton}
                    onPress={async () => {
                      const supported = await Linking.canOpenURL(sourceUrl);
                      if (supported) {
                        await Linking.openURL(sourceUrl);
                      } else {
                        Alert.alert(
                          'Error',
                          'Unable to open this guidance link.',
                        );
                      }
                    }}>
                    <Ionicons name="open-outline" size={14} color="#0056B3" />
                    <Text style={styles.linkButtonText}>
                      Read Official Statutory Guidance
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            <TouchableOpacity
              style={styles.toggleButton}
              onPress={toggleExpand}>
              <Text
                style={[
                  styles.toggleButtonText,
                  isCompleted && styles.toggleButtonTextCompleted,
                ]}>
                {isExpanded ? 'Hide Details' : 'View Details'}
              </Text>
              <Ionicons
                name={isExpanded ? 'chevron-up' : 'chevron-down'}
                size={14}
                color={isCompleted ? '#707070' : '#0056B3'}
                style={{ marginLeft: 4 }}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  timelineRow: { flexDirection: 'row', width: '100%' },
  leftColumn: { width: 30, alignItems: 'center' },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#0056B3',
    zIndex: 2,
    marginTop: 18, // Lowered slightly to align with the new text layout height
  },
  dotCompleted: { backgroundColor: '#4CAF50' },
  verticalLine: {
    position: 'absolute',
    top: 24,
    bottom: -16,
    width: 2,
    backgroundColor: '#E0E0E0',
    zIndex: 1,
  },
  lineCompleted: { backgroundColor: '#A9DFBF' },
  cardContainer: { flex: 1, paddingLeft: 10, paddingBottom: 20 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardCompleted: {
    backgroundColor: '#F4F6F4',
    borderColor: '#D0DBF0',
  },

  // New Checkbox Layout Styles
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    alignSelf: 'flex-start',
    backgroundColor: '#F5F5F5',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  checkboxLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
    marginLeft: 6,
  },
  checkboxLabelCompleted: {
    color: '#4CAF50',
    fontWeight: '700',
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0056B3',
    flex: 1,
    paddingRight: 8,
    lineHeight: 20,
  },
  titleTextCompleted: {
    color: '#777777',
    textDecorationLine: 'line-through',
  },
  weekBadge: {
    backgroundColor: '#EEF4FA',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 70,
  },
  weekBadgeCompleted: { backgroundColor: '#E0E0E0' },
  weekBadgeText: {
    fontSize: 10,
    color: '#333333',
    fontWeight: '600',
    textAlign: 'center',
  },
  summaryText: {
    fontSize: 13,
    color: '#444444',
    lineHeight: 18,
    marginBottom: 12,
  },
  parentRoleBox: {
    backgroundColor: '#F8F9FE',
    borderLeftWidth: 3,
    borderLeftColor: '#0056B3',
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
  },
  parentRoleBoxCompleted: {
    backgroundColor: '#EAEAEA',
    borderLeftColor: '#707070',
  },
  parentRoleTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0056B3',
    marginBottom: 2,
  },
  parentRoleTitleCompleted: { color: '#555555' },
  parentRoleBody: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#555555',
    lineHeight: 16,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  toggleButtonText: { color: '#0056B3', fontSize: 13, fontWeight: '600' },
  toggleButtonTextCompleted: { color: '#707070' },
  contentCompleted: { opacity: 0.75 },
  expandedContent: {
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    marginTop: 8,
    paddingTop: 12,
    marginBottom: 8,
  },
  detailsHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 4,
  },
  detailsText: { fontSize: 12, color: '#666666', lineHeight: 18 },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    backgroundColor: '#EEF4FA',
    padding: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  linkButtonText: {
    color: '#0056B3',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
});

export default TimelineStepCard;
