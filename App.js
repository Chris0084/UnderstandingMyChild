import { registerRootComponent } from 'expo';
import { StyleSheet} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { SafeAreaProvider } from 'react-native-safe-area-context';
import HomeScreen from './src/screens/HomeScreen';
import InputFormScreen from './src/screens/InputFormScreen';

const Stack = createNativeStackNavigator();
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
            headerShown: false // Keeps your custom Logo design clean
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="InputForm" component={InputFormScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>);
}

// This tells Expo which component to boot first
registerRootComponent(App);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  }
});
