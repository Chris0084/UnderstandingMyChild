import React from 'react';
import { View, ScrollView, StyleSheet, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Component Imports
import TitleText from '../textComponents/TitleText';
import BodyText from '../textComponents/BodyText';
import Spacer from '../textComponents/LineSpacer';
import InfoButton from '../components/InfoButton';

// CMS Data Import
import textContent from '../../CMS/content.json';

const InformationScreen = () => {
  const insets = useSafeAreaInsets();

  // This header is unique content (The Intro)
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <TitleText style={styles.mainTitle}>
        {textContent.infoSection.title}
      </TitleText>

      <Spacer height={10} />

      <BodyText>{textContent.infoSection.infoPara1}</BodyText>

      <Spacer height={20} />

      <BodyText>{textContent.infoSection.infoPara2}</BodyText>

      {/* Decorative Line Spacer */}
      <View style={styles.divider} />
      <Spacer height={20} />
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <FlatList
        data={textContent.modelSections}
        keyExtractor={(item, index) => item.id + index}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listPadding}
        renderItem={({ item }) => (
          <InfoButton
            label={item.buttonLabel}
            modalTitle={item.modalTitle}
            // Passing both paragraphs with a double line break if para2 exists
            modalBody={
              item.para2 ? `${item.para1}\n\n${item.para2}` : item.para1
            }
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA', // Light grey background makes white cards pop
  },
  listPadding: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerContainer: {
    marginTop: 20,
  },
  mainTitle: {
    fontSize: 28,
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    width: '100%',
  },
});

export default InformationScreen;
