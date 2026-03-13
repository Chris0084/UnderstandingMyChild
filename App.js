import { registerRootComponent } from 'expo';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import HomeScreen from './src/screens/HomeScreen';
import InputFormScreen from './src/screens/InputFormScreen';
import ReportingScreen from './src/screens/ReportingScreen';
import InformationScreen from './src/screens/InformationScreen';
import InsightsScreen from './src/screens/InsightsScreen';

// Initialize both navigators
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Create the "Tray" (MainTabs)
// This handles the bottom navigation for your 3 internal screens
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: { height: 60, paddingBottom: 10 },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Information')
            iconName = focused
              ? 'information-circle'
              : 'information-circle-outline';
          else if (route.name === 'InputForm')
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          else if (route.name === 'Reporting')
            iconName = focused
              ? 'document-text-outline'
              : 'document-text-outline';
          else if (route.name === 'Insights')
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';

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
        options={{ title: 'Log' }}
      />
      <Tab.Screen
        name="Reporting"
        component={ReportingScreen}
        options={{ title: 'Report' }}
      />
      <Tab.Screen
        name="Insights"
        component={InsightsScreen}
        options={{ title: 'Insights' }}
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
    backgroundColor: '#c42121',
  },
});
