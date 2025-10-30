import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import Animated, { useSharedValue, withTiming, useAnimatedStyle, runOnJS } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../../utils/BASE_URL.js';
const COLORS = {
  background: "#F4F5FB", // Light lavender background
  card: "#FFFFFF", // White
  primary: "#5A5BDE", // Purple-blue (primary)
  secondary: "#6F89FF", // Light blue
  accent: "#FF8C66", // Soft orange
  accent2: "#81C3F8", // Sky blue
  dark: "#373A56", // Dark navy
  medium: "#6B6F8D", // Medium navy-gray
  light: "#A0A4C1", // Light gray-purple
  border: "#E2E5F1", // Light border
  success: "#63C6AE", // Turquoise
  warning: "#FFBD59", // Amber
  danger: "#FF7285", // Soft red
};
const SplashScreen = ({ navigation }) => {
  const opacity = useSharedValue(1);
  const [isChecking, setIsChecking] = useState(true);
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));
  // Function to check if token is valid
  const validateToken = async (token) => {
    try {
      const response = await fetch(`${BASE_URL}profile/`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  };
  // Function to check authentication and navigate accordingly
  const checkAuthAndNavigate = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const driverId = await AsyncStorage.getItem('driverId');
      if (token && driverId) {
        // Token exists, validate it
        const isValid = await validateToken(token);
        if (isValid) {
          // Token is valid, go to main app
          navigation.replace('Main');
          return;
        } else {
          // Token is invalid, clear storage and go to login
          await AsyncStorage.multiRemove([
            'authToken',
            'driverId',
            'userName',
            'userCompany',
            'isDriver',
            'isDispatcher'
          ]);
        }
      }
      // No token or invalid token, go to login
      navigation.replace('Login');
    } catch (error) {
      // In case of error, go to login
      navigation.replace('Login');
    } finally {
      setIsChecking(false);
    }
  };
  useEffect(() => {
    const timer = setTimeout(() => {
      opacity.value = withTiming(0, { duration: 500 }, (finished) => {
        if (finished) {
          runOnJS(checkAuthAndNavigate)();
        }
      });
    }, 1000); // Reduced from 2500ms to 1000ms for faster startup
    return () => clearTimeout(timer);
  }, [navigation, opacity]);
  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Image
        source={require("../../assets/LOGO_NB.png")}
        style={styles.logo}
        resizeMode="contain"
      />
    </Animated.View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
  },
  logo: {
    width: 263,
    height: 166,
    marginBottom: 40,
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  message: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    color: COLORS.primary,
    letterSpacing: 0.5,
    lineHeight: 28,
    marginHorizontal: 30,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    color: COLORS.card,
    marginTop: 20,
    opacity: 0.8,
  },
});
export default SplashScreen;