// App.js - Hermes-compatible optimized version
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import { Provider } from 'react-redux';
import { store } from './store';
import LoginScreen from "./Screens/Login";
import HomeScreen from "./Screens/Homescreen";
import Transports from "./Screens/TransportsScreen";
import ProfileScreen from "./Screens/ProfileScreen";
import DocumentsScreen from "./Screens/DocumentsGeneral";
import Transport_Update from "./Screens/ModifyTransport";
import Truck from "./Screens/Truck";
import SplashScreen from "./Screens/SplashScreen";
import TransportMainPage from "./Screens/TransportActualMain";
import CMRDigitalForm from "./Screens/TransportActualCMRDigital";
import StatusTransportForm from "./Screens/TransportActualStatus";
import PhotoCMRForm from "./Screens/TransportActualCMRPhoto";
import { NavigationContainer } from '@react-navigation/native';
import { Pressable, View, StyleSheet, Platform } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

// Import your notifications context
import { NotificationsProvider } from './Screens/NotificationsContext/index.js';
import { LoadingProvider } from './components/General/loadingSpinner.js';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Shared screen options to avoid recreation
const slideTransitionOptions = {
  headerShown: false,
  gestureEnabled: true,
  transitionSpec: {
    open: { animation: 'timing', config: { duration: 300 } },
    close: { animation: 'timing', config: { duration: 300 } },
  },
  cardStyleInterpolator: ({ current, layouts }) => ({
    cardStyle: {
      transform: [{
        translateX: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [layouts.screen.width, 0],
        }),
      }],
    },
  }),
};

const fadeTransitionOptions = {
  headerShown: false,
  transitionSpec: {
    open: {
      animation: 'timing',
      config: {
        duration: 600,
      },
    },
  },
  cardStyleInterpolator: ({ current }) => ({
    cardStyle: {
      opacity: current.progress,
    },
  }),
};

const mainScreenOptions = {
  gestureEnabled: false,
  headerLeft: null,
  headerShown: false,
  ...fadeTransitionOptions,
};

// Custom Tab Bar component with fluid animation and safe area support
function FluidTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();
  
  const getIconName = (routeName, isFocused) => {
    if (routeName === 'Home') return isFocused ? 'home' : 'home-outline';
    if (routeName === 'Transports') return isFocused ? 'car' : 'car-outline';
    if (routeName === 'Profile') return isFocused ? 'person' : 'person-outline';
    return 'help-outline';
  };

  const handleTabPress = (route, isFocused) => {
    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });

    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(route.name);
    }
  };
  
  return (
    <View style={[styles.tabContainer, { paddingBottom: insets.bottom }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        // Animated styles for the tab bubble
        const animatedTabStyle = useAnimatedStyle(() => {
          return {
            transform: [
              { 
                scale: withSpring(isFocused ? 1.2 : 1, { 
                  damping: 10, 
                  stiffness: 100 
                }) 
              }
            ],
            backgroundColor: isFocused ? '#6366F1' : 'transparent',
          };
        });

        const iconName = getIconName(route.name, isFocused);

        return (
          <Pressable
            key={route.key}
            onPress={() => handleTabPress(route, isFocused)}
            style={styles.tabButton}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
          >
            <Animated.View style={[styles.tabBubble, animatedTabStyle]}>
              <Ionicons
                name={iconName}
                size={24}
                color={isFocused ? 'white' : 'gray'}
              />
            </Animated.View>
          </Pressable>
        );
      })}
    </View>
  );
}

// Create individual stack navigators for each tab
function HomeStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen 
        name="Truck" 
        component={Truck} 
        options={slideTransitionOptions}
      />
      <Stack.Screen 
        name="DocumentsGeneral" 
        component={DocumentsScreen} 
        options={slideTransitionOptions}
      />
      {/* Add TransportMainPage to Home stack as well */}
      <Stack.Screen 
        name="TransportMainPage" 
        component={TransportMainPage}
        options={slideTransitionOptions}
      />
      <Stack.Screen 
        name="CMRDigitalForm" 
        component={CMRDigitalForm}
        options={slideTransitionOptions}
      />
      <Stack.Screen 
        name="StatusTransportForm" 
        component={StatusTransportForm}
        options={slideTransitionOptions}
      />
      <Stack.Screen 
        name="PhotoCMRForm" 
        component={PhotoCMRForm}
        options={slideTransitionOptions}
      />
    </Stack.Navigator>
  );
}

function TransportsStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TransportsScreen" component={Transports} />
      <Stack.Screen 
        name="Transport_Update" 
        component={Transport_Update}
        options={slideTransitionOptions}
      />
      <Stack.Screen 
        name="TransportMainPage" 
        component={TransportMainPage}
        options={slideTransitionOptions}
      />
      <Stack.Screen 
        name="CMRDigitalForm" 
        component={CMRDigitalForm}
        options={slideTransitionOptions}
      />
      <Stack.Screen 
        name="StatusTransportForm" 
        component={StatusTransportForm}
        options={slideTransitionOptions}
      />
      <Stack.Screen 
        name="PhotoCMRForm" 
        component={PhotoCMRForm}
        options={slideTransitionOptions}
      />
    </Stack.Navigator>
  );
}

function ProfileStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
    </Stack.Navigator>
  );
}

// Main tab navigator that appears after login - now contains stack navigators
function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <FluidTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={HomeStackNavigator} />
      <Tab.Screen name="Transports" component={TransportsStackNavigator} />
      <Tab.Screen name="Profile" component={ProfileStackNavigator} />
    </Tab.Navigator>
  );
}

// Main app navigator wrapped with NavigationContainer
function AppNavigatorContent() {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen 
        name="Splash" 
        component={SplashScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Login" 
        component={LoginScreen} 
        options={fadeTransitionOptions}
      />
      <Stack.Screen
        name="Main"
        component={MainTabs}
        options={mainScreenOptions}
        listeners={{
          beforeRemove: (e) => {
            if (e.data.action.type === 'GO_BACK' || e.data.action.type === 'POP') {
              e.preventDefault();
            }
          },
        }}
      />
    </Stack.Navigator>
  );
}

//aici avem redux provider incorporatt
function AppNavigator() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <NotificationsProvider>
          <LoadingProvider>
            <NavigationContainer>
              <AppNavigatorContent />
            </NavigationContainer>
          </LoadingProvider>
        </NotificationsProvider>
      </SafeAreaProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    minHeight: 70,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#f1f1f1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
    paddingHorizontal: 10,
    paddingTop: 10,
    position: 'relative',
    zIndex: 1000,
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBubble: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AppNavigator;