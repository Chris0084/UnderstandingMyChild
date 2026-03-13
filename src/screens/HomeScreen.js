import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Logo from '../components/Logo';
import MainNavButton from '../components/MainNavButton';

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        // This applies padding only where the "unsafe" areas are
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}>
      <View style={styles.content}>
        <Logo
          source={require('../../assets/childParentLightbulb.png')}
          size={120}
        />

        <View style={styles.textContainer}>
          <Text style={styles.titleText}>
            Welcome to Understanding My Child
          </Text>
          <Text style={styles.paragraphText}>
            This app is here to support you as you learn more about your child’s
            development. There are no right or wrong answers — only observations
            that help build a clearer picture over time. Take your time, follow
            your instincts, and remember that every child develops in their own
            unique way.
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
            navigation.navigate('MainApp', { screen: 'InsightsScreen' })
          }
          color="#FF9500"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#a7d7dc',
  },
  content: {
    flex: 1,
    paddingHorizontal: 25,
  },
  textContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  titleText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  paragraphText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    lineHeight: 24,
  },
});
