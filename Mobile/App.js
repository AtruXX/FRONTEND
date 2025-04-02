import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import LoginScreen from "./Login";
import HomeScreen from "./HomeScreen";
import SecurityCamScreen from "./SecurityCamScreen";
import TransportStatus from "./TransportStatus.js";
import ProfileScreen from "./ProfileScreen.js";
import DocumentsScreen from "./DocumentsGeneral.js";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const DocumentsStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DocumentsGeneral" component={DocumentsScreen} />
      {/* You can add more document-related screens here */}
    </Stack.Navigator>
  );
};

const TransportStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TransportStatus" component={TransportStatus} />
      {/* You can add more transport-related screens here */}
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
          else if (route.name === "Security Cam") iconName = "videocam";
          else if (route.name === "Messages") iconName = "chatbubble";
          else if (route.name === "Profile") iconName = "person";
          else if (route.name === "Documents") iconName = "document-text";
          else if (route.name === "Transport") iconName = "car";
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#3b82f6",
        tabBarInactiveTintColor: "gray",
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Security Cam" component={SecurityCamScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Documents" component={DocumentsStack} />
      <Tab.Screen name="Transport" component={TransportStack} />
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