import React from 'react';
import { View, ScrollView, StyleSheet, Text, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../constants/Colors';

// Component Imports
import TitleText from '../textComponents/TitleText';
import BodyText from '../textComponents/BodyText';
import Spacer from '../textComponents/LineSpacer';
import HorizontalInfoCard from '../components/HorizontalInfoCard';
import HomeCardWrapper from '../components/HomeCardWrapper';
import PageHeader from '../components/PageHeader';

// CMS Data Import
import textContent from '../../CMS/content.json';

const imageMap = {
  whatThisAppWillDoInfo: require('../../assets/infoCardPics/whatThisAppWillDoInfo.png'),
  howToUseAppInfo: require('../../assets/infoCardPics/howToUseAppInfo.png'),
  communicationInfo: require('../../assets/infoCardPics/communicationInfo.png'),
  routineInfo: require('../../assets/infoCardPics/routineInfo.png'),
  sensoryInfo: require('../../assets/infoCardPics/sensoryInfo.png'),
  emotionalRegulation: require('../../assets/infoCardPics/emotionalRegulation.png'),
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
    <View style={[styles.mainScreenContainer, { paddingTop: insets.top }]}>
      <View style={styles.marginContainer}>
        <PageHeader
          title={'Information'}
          iconName={'information-circle-outline'}
          iconColor={'#000000'}
          accentColor={Colors.info_theme}></PageHeader>
        <ScrollView
          style={styles.transparentContainer}
          showsVerticalScrollIndicator={false}>
          <View style={styles.headerContainer}>
            {/* <TitleText style={styles.mainTitle}>
              {textContent.infoSection.title}
            </TitleText> */}
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
            'OBSERVATION CATEGORIES EXPLAINED',
            textContent.modelSections.filter(item => item.category === 'tags'),
          )}

          <Spacer height={20} />
          {/* Row 3 */}
          {renderHorizontalSection(
            'SUPPORT STRATAGIES EXPLAINED',
            textContent.modelSections.filter(
              item => item.category === 'supports',
            ),
          )}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainScreenContainer: {
    flex: 1,
    backgroundColor: Colors.background, // Use your Colors.primary here to match Home
  },
  marginContainer: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  transparentContainer: {
    flex: 1,
    backgroundColor: Colors.background, // CRITICAL: This lets the wrapper show through
  },
  headerContainer: {
    paddingHorizontal: 20,
    alignItems: 'center', // Centers text like the Home Screen
    // backgroundColor: Colors.background,
  },
  mainTitle: {
    fontSize: 28,
    color: '#333',
    textAlign: 'center', // Centers the title
  },
  sectionWrapper: {
    marginBottom: 5,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.darkGrey, // Slightly darker for readability on the wrapper
    letterSpacing: 0.8,
    marginLeft: 20,
    marginBottom: 15,
    borderBottomWidth: 2, // This creates the "colored margin" look
    borderBottomColor: '#9c9c9c', // Your chosen color
  },
  horizontalListPadding: {
    paddingLeft: 20,
    paddingRight: 5,
    paddingBottom: 15,
  },
});

export default InformationScreen;
