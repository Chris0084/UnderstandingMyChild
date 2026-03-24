import React from 'react';
import { View, ScrollView, StyleSheet, Text, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Component Imports
import TitleText from '../textComponents/TitleText';
import BodyText from '../textComponents/BodyText';
import Spacer from '../textComponents/LineSpacer';
import HorizontalInfoCard from '../components/HorizontalInfoCard';

// CMS Data Import
import textContent from '../../CMS/content.json';

const imageMap = {
  what_will_this_app: require('../../assets/infoCardPics/what_will_this_app_do.png'),
  how_to_use: require('../../assets/infoCardPics/how_to_use.png'),
  communication: require('../../assets/infoCardPics/communication.png'),
  change_routine: require('../../assets/infoCardPics/change_routine.png'),
  social_interaction: require('../../assets/infoCardPics/social_interaction.png'),
};

const InformationScreen = () => {
  const insets = useSafeAreaInsets();

  // Helper to render a horizontal row
  const renderHorizontalSection = (title, data) => (
    <View style={styles.sectionWrapper}>
      <Text style={styles.sectionHeader}>{title}</Text>
      <FlatList
        horizontal
        data={data}
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.horizontalListPadding}
        renderItem={({ item }) => (
          <HorizontalInfoCard
            label={item.buttonLabel}
            title={item.modalTitle}
            body={item.para2 ? `${item.para1}\n\n${item.para2}` : item.para1}
            imageSource={imageMap[item.imageKey]} // Pass the mapped image
          />
        )}
      />
    </View>
  );

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Intro Header */}
      <View style={styles.headerContainer}>
        <TitleText style={styles.mainTitle}>
          {textContent.infoSection.title}
        </TitleText>
        <Spacer height={10} />
        <BodyText>{textContent.infoSection.infoPara1}</BodyText>
        <Spacer height={10} />
        <BodyText>{textContent.infoSection.infoPara2}</BodyText>
      </View>

      <Spacer height={30} />

      {/* Row 1: Your App */}
      {renderHorizontalSection(
        'YOUR APP',
        textContent.modelSections.filter(item => item.category === 'app'),
      )}

      <Spacer height={20} />

      {/* Row 2: Tags Defined */}
      {renderHorizontalSection(
        'TAGS DEFINED',
        textContent.modelSections.filter(item => item.category === 'tags'),
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  headerContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  mainTitle: {
    fontSize: 28,
    color: '#333',
  },
  sectionWrapper: {
    marginBottom: 10,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '800',
    color: '#999',
    letterSpacing: 1.5,
    marginLeft: 20,
    marginBottom: 15,
  },
  horizontalListPadding: {
    paddingLeft: 20,
    paddingRight: 5,
    paddingBottom: 10, // Space for shadows
  },
});

export default InformationScreen;
