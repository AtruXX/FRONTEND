import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import LoginScreen from "./Screens/Login";
import HomeScreen from "./Screens/Homescreen";
import Transports from "./Screens/TransportsScreen";
import TransportStatus from "./Screens/TransportStatus";
import ProfileScreen from "./Screens/ProfileScreen";
import DocumentsScreen from "./Screens/DocumentsGeneral";
import Transport_Update from "./Screens/ModifyTransport";
import Truck from "./Screens/Truck";
import SplashScreen from "./Screens/SplashScreen";
import { NavigationContainer } from '@react-navigation/native';
import { Pressable, View, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Custom Tab Bar component with fluid animation
const FluidTabBar = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.tabContainer}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

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

        // Determine which icon to display
        let iconName;
        if (route.name === 'Home') iconName = isFocused ? 'home' : 'home-outline';
        else if (route.name === 'Transports') iconName = isFocused ? 'car' : 'car-outline';
        else if (route.name === 'Profile') iconName = isFocused ? 'person' : 'person-outline';

        return (
          <Pressable
            key={index}
            onPress={onPress}
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
};

// Main tab navigator that appears after login
const MainTabs = () => {
  return (
    <Tab.Navigator
      tabBar={props => <FluidTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Transports" component={Transports} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

// Main app navigator
const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} 
        options={{
          // Custom transition just for Login screen
          transitionSpec: {
            open: {
              animation: 'timing',
              config: {
                duration: 600, // Slower fade for login
              },
            },
          },
          cardStyleInterpolator: ({ current }) => ({
            cardStyle: {
              opacity: current.progress,
            },
          }),
        }}
        />
        <Stack.Screen
          name="Main"
          component={MainTabs}
          
          options={{
            gestureEnabled: false,
            headerLeft: null,
            // Custom transition just for Login screen
            transitionSpec: {
              open: {
                animation: 'timing',
                config: {
                  duration: 600, // Slower fade for login
                },
              },
            },
            cardStyleInterpolator: ({ current }) => ({
              cardStyle: {
                opacity: current.progress,
              },
            }),
          }}
        />
        {/* Home related screens */}
        <Stack.Screen name="Truck" component={Truck} 
        options={{
          gestureEnabled: false,
          headerLeft: null,
          // Custom transition just for Login screen
          transitionSpec: {
            open: {
              animation: 'timing',
              config: {
                duration: 600, // Slower fade for login
              },
            },
          },
          cardStyleInterpolator: ({ current }) => ({
            cardStyle: {
              opacity: current.progress,
            },
          }),
        }}/>
        {/* Transport related screens */}
        <Stack.Screen name="TransportStatus" component={TransportStatus} 
        options={{
          gestureEnabled: false,
          headerLeft: null,
          // Custom transition just for Login screen
          transitionSpec: {
            open: {
              animation: 'timing',
              config: {
                duration: 600, // Slower fade for login
              },
            },
          },
          cardStyleInterpolator: ({ current }) => ({
            cardStyle: {
              opacity: current.progress,
            },
          }),
        }}
        />
        <Stack.Screen name="Transport_Update" component={Transport_Update}
        options={{
          gestureEnabled: false,
          headerLeft: null,
          // Custom transition just for Login screen
          transitionSpec: {
            open: {
              animation: 'timing',
              config: {
                duration: 600, // Slower fade for login
              },
            },
          },
          cardStyleInterpolator: ({ current }) => ({
            cardStyle: {
              opacity: current.progress,
            },
          }),
        }}
        />
        {/* Profile related screens */}
        <Stack.Screen name="DocumentsGeneral" component={DocumentsScreen} 
        options={{
          gestureEnabled: false,
          headerLeft: null,
          // Custom transition just for Login screen
          transitionSpec: {
            open: {
              animation: 'timing',
              config: {
                duration: 600, // Slower fade for login
              },
            },
          },
          cardStyleInterpolator: ({ current }) => ({
            cardStyle: {
              opacity: current.progress,
            },
          }),
        }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
// Styles for the fluid tab bar
const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    height: 70,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#f1f1f1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
    paddingHorizontal: 10,
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