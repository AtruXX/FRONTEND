import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import LoginScreen from "./Login";
import HomeScreen from "./HomeScreen";
import Transports from "./Transports.js";
import TransportStatus from "./TransportStatus.js";
import ProfileScreen from "./ProfileScreen.js";
import DocumentsScreen from "./DocumentsGeneral.js";
import Transport_Update from "./Modify_transport_page.js";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Create individual stacks for each main section
const HomeStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeScreen" component={HomeScreen}/> 
    </Stack.Navigator>
  );
};

const TransportsStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TransportsList" component={Transports} />
      <Stack.Screen name="TransportStatus" component={TransportStatus} />
      <Stack.Screen name="Transport_Update" component={Transport_Update} />
    </Stack.Navigator>
  );
};

const ProfileStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
      <Stack.Screen name="DocumentsGeneral" component={DocumentsScreen} />
    </Stack.Navigator>
  );
};

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === "Home") iconName = "home";
          else if (route.name === "Transports") iconName = "car";
          else if (route.name === "Profile") iconName = "person";
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#3b82f6",
        tabBarInactiveTintColor: "gray",
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Transports" component={TransportsStack} />
      <Tab.Screen name="Profile" component={ProfileStack} />
      
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Main" component={TabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;