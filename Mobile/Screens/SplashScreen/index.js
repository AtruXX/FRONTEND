import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import Animated, { useSharedValue, withTiming, useAnimatedStyle, runOnJS } from 'react-native-reanimated';

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

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  useEffect(() => {
    const navigateToLogin = () => {
      navigation.replace('Login');
    };

    const timer = setTimeout(() => {
      opacity.value = withTiming(0, { duration: 500 }, (finished) => {
        if (finished) {
          runOnJS(navigateToLogin)();
        }
      });
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigation, opacity]);

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Image
// ✅ CORRECT - Relative path
source={require("../../assets/LOGO_NB.png")}        style={styles.logo}
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
});

export default SplashScreen;