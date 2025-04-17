import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Text, View } from 'react-native';
import LoginScreen from './Login.js';
import MainScreen from './Main.js';
import TransportsScreen from './Transports.js'; // Import TransportsScreen
import Drivers from './Drivers.js'
import Trucks from './Trucks.js'
// Initialize react-native-screens (add this at the top of your file)
import { enableScreens } from 'react-native-screens';
enableScreens();

// Simple error boundary
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: 'red' }}>Something went wrong!</Text>
          <Text>{this.state.error?.toString()}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

const Stack = createNativeStackNavigator();

function App() {
  console.log('App rendering');
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <NavigationContainer
          onStateChange={(state) => console.log('Nav state:', state)}
          fallback={<Text>Loading...</Text>}
        >
          <Stack.Navigator>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="Main" 
              component={MainScreen} 
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="Transports" 
              component={TransportsScreen} 
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="Drivers" 
              component={Drivers} 
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="Trucks" 
              component={Trucks} 
              options={{ headerShown: false }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

export default App;