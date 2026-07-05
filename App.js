import React, { useEffect } from 'react';
import { registerRootComponent } from 'expo';
import { StyleSheet, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';

import HomeScreen from './src/screens/HomeScreen';
import InputFormScreen from './src/screens/InputFormScreen';
import ReportingScreen from './src/screens/ReportingScreen';
import InformationScreen from './src/screens/InformationScreen';
import InsightsScreen from './src/screens/InsightsScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const REVENUECAT_API_KEY_ANDROID = 'goog_IWwoiEXBtmlKnyOAttqtyASFHeP';
const REVENUECAT_API_KEY_IOS = 'appl_ZPpTExksxWvIRwWfNBToxzoSvFo';
// Initialize both navigators
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Create the "Tray" (MainTabs)
// This handles the bottom navigation for your 3 internal screens
function MainTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      backBehavior="history"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          paddingTop: 5,
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
          height: 60 + (insets.bottom > 0 ? insets.bottom : 0),
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Information')
            iconName = focused
              ? 'information-circle'
              : 'information-circle-outline';
          else if (route.name === 'InputForm')
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          else if (route.name === 'Reporting')
            iconName = focused ? 'book' : 'book-outline';
          else if (route.name === 'Insights')
            iconName = focused ? 'sparkles' : 'sparkles-outline';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}>
      <Tab.Screen
        name="Information"
        component={InformationScreen}
        options={{ title: 'Info' }}
      />
      <Tab.Screen
        name="InputForm"
        component={InputFormScreen}
        options={{ title: 'Captue' }}
        listeners={({ navigation }) => ({
          tabPress: e => {
            // Prevent default action
            e.preventDefault();

            // Manually navigate and force params to be undefined
            navigation.navigate('InputForm', {
              existingEntry: undefined,
              mode: undefined,
            });
          },
        })}
      />
      <Tab.Screen
        name="Reporting"
        component={ReportingScreen}
        options={{ title: 'Journal' }}
      />
      <Tab.Screen
        name="Insights"
        component={InsightsScreen}
        options={{ title: 'Trends' }}
      />
    </Tab.Navigator>
  );
}
/**
 * App.js acts as your "Root Wrapper".
 * You will later wrap <HomeScreen /> with things like
 * Navigation Containers or Theme Providers.
 */
export default function App() {
  useEffect(() => {
    const initializePurchases = async () => {
      try {
        Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG); // Helps track the 7-day sandbox trials in logs

        if (Platform.OS === 'ios') {
          await Purchases.configure({ apiKey: REVENUECAT_API_KEY_IOS });
        } else if (Platform.OS === 'android') {
          await Purchases.configure({ apiKey: REVENUECAT_API_KEY_ANDROID });
        }
        getCustomerInfo();
      } catch (error) {
        console.error('RevenueCat Initialization Error:', error);
      }
    };

    initializePurchases();
  }, []);

  async function getCustomerInfo() {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      const offerings = await Purchases.getOfferings();
      const products = await Purchases.getProducts(['UMC_annual']);
      console.log('QQQ:');
      console.log('customerInfo:', customerInfo);
      console.log('offerings:', offerings);
      console.log('products:', products);
    } catch (e) {
      console.error('RevenueCat error:', e);
    }
  }

  return (
    <SafeAreaProvider style={styles.container}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerShown: false, // Keeps your custom Logo design clean
          }}>
          {/* Home stays separate so it has NO bottom tray */}
          <Stack.Screen name="Home" component={HomeScreen} />

          {/* This one Stack screen now holds ALL your tabbed pages */}
          <Stack.Screen name="MainApp" component={MainTabs} />

          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{ title: 'Settings' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

// This tells Expo which component to boot first
registerRootComponent(App);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff00',
  },
});
