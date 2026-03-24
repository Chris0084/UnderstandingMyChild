import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MainNavButton from '../components/MainNavButton';
import HomeCardWrapper from '../components/HomeCardWrapper';

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.mainScreenContainer, { paddingTop: insets.top }]}>
      <View style={styles.marginContainer}>
        <HomeCardWrapper imageSource={require('../../assets/water-ripple.png')}>
          {/* Using ScrollView inside the card ensures buttons are reachable on small screens */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>
            <View style={styles.textContainer}>
              <Text style={styles.titleText}>
                Welcome to Understanding My Child
              </Text>
              <Text style={styles.paragraphText}>
                This app is here to support you as you learn more about your
                child’s development. There are no right or wrong answers — only
                observations that help build a clearer picture over time.
              </Text>
            </View>

            <MainNavButton
              title="Information"
              onPress={() =>
                navigation.navigate('MainApp', { screen: 'Information' })
              }
            />
            <MainNavButton
              title="Log Form"
              onPress={() =>
                navigation.navigate('MainApp', { screen: 'InputForm' })
              }
              color="#34C759"
            />
            <MainNavButton
              title="Reporting"
              onPress={() =>
                navigation.navigate('MainApp', { screen: 'Reporting' })
              }
              color="#5856D6"
            />
            <MainNavButton
              title="Insights"
              onPress={() =>
                navigation.navigate('MainApp', { screen: 'Insights' })
              }
              color="#FF9500"
            />
          </ScrollView>
        </HomeCardWrapper>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainScreenContainer: {
    flex: 1,
    backgroundColor: '#b7b7b4', // Matches your theme background
  },
  marginContainer: {
    flex: 1,
    margin: 10, // This creates the "gap" from the phone edge
    borderRadius: 20, // Rounds the outer corners of the whole UI
    overflow: 'hidden', // Important: clips the image/card to the rounded corners
  },
  textContainer: {
    marginBottom: 25,
    alignItems: 'center',
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  paragraphText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
});
