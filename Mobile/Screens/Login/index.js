import React, { useState } from "react";
import { View, StyleSheet, Alert, Text, TouchableOpacity, Image } from "react-native";
import { TextInput, Button, Card, Title } from "react-native-paper";
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { styles } from "./styles"; 
const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation();
  const BASE_URL = "https://atrux-717ecf8763ea.herokuapp.com/api/v0.1/";
  const fetchUserProfile = async (token) => {
    try {
      console.log('Fetching user profile with token');
      const response = await fetch(
        `${BASE_URL}/api/v0.1/profile/`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Token ${token}`
          }
          
        }
      );
      console.log("Authorization: ",token);
      
      if (response.ok) {
        const profileData = await response.json();
        console.log('Profile data received:', profileData);
        
        // Store driver id
        if (profileData.id) {
          await AsyncStorage.setItem('driverId', profileData.id.toString());
          console.log('Driver ID stored:', profileData.id);
        }
        
        // You might want to store other useful info
        if (profileData.name) {
          await AsyncStorage.setItem('userName', profileData.name);
        }
        
        if (profileData.company) {
          await AsyncStorage.setItem('userCompany', profileData.company);
        }
        
        // Store user type (driver/dispatcher)
        await AsyncStorage.setItem('isDriver', profileData.is_driver.toString());
        await AsyncStorage.setItem('isDispatcher', profileData.is_dispatcher.toString());
        
      } else {
        const errorText = await response.text();
        console.error(`Failed to fetch user profile, status: ${response.status}, details:`, errorText);
        Alert.alert('Error', `Profile fetch failed: ${response.status}`);
        console.error("Failed to fetch user profile, status:", response.status);
       
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      // We'll continue with navigation even if profile fetch fails
      console.log('Continuing to Home despite profile fetch error');
    }
  };
  const handleLogin = async () => {
    const loginData = { email, password };
    try {
      console.log('Attempting login with:', email);
      const response = await fetch(
        `${BASE_URL}auth/token/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(loginData),
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        const token = data.auth_token;
        console.log('Login successful, token received');
        
        // Store token in secure storage
        try {
          await AsyncStorage.setItem('authToken', token);
          console.log('Token stored successfully in AsyncStorage');
        } catch (storageError) {
          console.error('Error storing token:', storageError);
        }
        
        // Fetch user profile to get driver_id
        await fetchUserProfile(token);
        navigation.navigate('Main');
      } else {
        console.error('Login response not OK:', response.status);
        Alert.alert('Error', 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'An error occurred during login');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerCard}>
        <Image source={require("../../assets/LOGO_ATRUX.jpeg")} style={styles.logo} />
        <Text style={styles.headerTitle}>Bine ai venit!</Text>
        <Text style={styles.headerSubtitle}>Logheaza-te pentru a continua</Text>
      </View>
      
      <View style={styles.formCard}>
        <View style={styles.inputWrapper}>
          <Text style={styles.inputLabel}>Adresa de email</Text>
          <View style={styles.inputContainer}>
            <TextInput
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              mode="flat"
            />
          </View>
        </View>

        <View style={styles.inputWrapper}>
          <Text style={styles.inputLabel}>Parola</Text>
          <View style={styles.inputContainer}>
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
              mode="flat"
              underlineColor="transparent"
              theme={{ colors: { primary: '#3B82F6' } }}
            />
          </View>
        </View>

        <TouchableOpacity>
          <Text style={styles.forgotPassword}>Ai uitat parola?</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.submitButton}
          onPress={handleLogin}
        >
          <Text style={styles.submitButtonText}>Logheaza-te</Text>
        </TouchableOpacity>
        
        <Text style={styles.signupText}>
          Nu ai un cont? <Text style={styles.signupLink}>Creeaza contul</Text>
        </Text>
      </View>
    </View>
  );
};




export default LoginScreen;