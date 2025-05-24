import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

const COLORS = {
  background: "#F4F5FB",     // Light lavender background
  card: "#FFFFFF",           // White
  primary: "#5A5BDE",        // Purple-blue (primary)
  secondary: "#6F89FF",      // Light blue
  accent: "#FF8C66",         // Soft orange
  accent2: "#81C3F8",        // Sky blue
  dark: "#373A56",           // Dark navy
  medium: "#6B6F8D",         // Medium navy-gray
  light: "#A0A4C1",          // Light gray-purple
  border: "#E2E5F1",         // Light border
  success: "#63C6AE",        // Turquoise
  warning: "#FFBD59",        // Amber
  danger: "#FF7285",         // Soft red
};

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Login'); // or whatever your login screen is named
    }, 3000); // 3 seconds

    return () => clearTimeout(timer); // Clean up timer on component unmount
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image 
        source={require("/Users/ioanagavrila/Desktop/FRONTEND/FRONTEND/Mobile/assets/LOGO_ATRUX.jpeg")} 
        style={styles.logo} 
        resizeMode="contain"
      />
      <Text style={styles.message}>AtruX - Ajutorul soferului la orice pas</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: 20,
  },
  logo: {
    width: 180,
    height: 180,
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