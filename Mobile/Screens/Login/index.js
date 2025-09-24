// screens/LoginScreen.js - Updated with better error handling
import React, { useState } from "react";
import { View, Alert, Text, TouchableOpacity, Image } from "react-native";
import { TextInput } from "react-native-paper";
import { useNavigation } from '@react-navigation/native';

import { styles } from "./styles";
import COLORS from "../../utils/COLORS.js";
import { useLoading } from "../../components/General/loadingSpinner.js";

// Import the hooks from authService
import { useLoginMutation } from "../../services/authService";

const LoginScreen = () => {
  const [phone_number, setPhoneNumber] = useState('+40 ');
  const [password, setPassword] = useState("");
  const navigation = useNavigation();
  const { showLoading, hideLoading } = useLoading();
  
  // RTK Query mutation hook
  const [login, { isLoading: isLoginLoading, error: loginError }] = useLoginMutation();

  const handleForgotPassword = () => {
    Alert.alert(
      'Parola uitata',
      'Te rugam sa iti contactezi administratorul firmei pentru a putea recupera credentialele.',
      [{ text: 'OK', style: 'default' }]
    );
  };

  const handleCreateAccount = () => {
    Alert.alert(
      'Creare cont',
      'Te rugam sa vorbesti cu administratorul firmei tale pentru a putea intra in contact.',
      [{ text: 'OK', style: 'default' }]
    );
  };

  const handleLogin = async () => {
    // Validation
    if (!phone_number.trim() || !password.trim()) {
      Alert.alert('Error', 'Te rugam sa completezi toate campurile.');
      return;
    }

    // Additional validation for phone number format
    const cleanPhoneNumber = phone_number.trim();
    if (cleanPhoneNumber.length < 10) {
      Alert.alert('Error', 'Te rugam sa introduci un numar de telefon valid.');
      return;
    }

    try {
      
      // Call the login mutation
      const result = await login({ 
        phone_number: cleanPhoneNumber, 
        password: password.trim() 
      }).unwrap();
      
      
      
      // Navigate to main app
      navigation.navigate('Main');
      
    } catch (error) {
      
      // Handle different error types with user-friendly messages
      let errorMessage = 'A aparut o eroare in timpul autentificarii. Te rugam sa incerci din nou.';
      
      // Parse the error message
      if (error.message) {
        if (error.message.includes('400')) {
          // Check if it's the specific "Unable to log in" error
          if (error.message.includes('Unable to log in with provided credentials')) {
            errorMessage = 'Numarul de telefon sau parola sunt incorecte. Te rugam sa verifici datele introduse.';
          } else {
            errorMessage = 'Datele introduse nu sunt valide. Te rugam sa verifici formatul numarului de telefon si parola.';
          }
        } else if (error.message.includes('401')) {
          errorMessage = 'Credentiale invalide. Te rugam sa verifici numarul de telefon si parola.';
        } else if (error.message.includes('FETCH_ERROR') || error.message.includes('Network')) {
          errorMessage = 'Probleme de conectare. Te rugam sa verifici conexiunea la internet.';
        } else if (error.message.includes('500')) {
          errorMessage = 'Probleme cu serverul. Te rugam sa incerci din nou mai tarziu.';
        }
      }
      
      Alert.alert('Eroare autentificare', errorMessage);
    }
  };

  // Update global loading state based on RTK Query loading state
  React.useEffect(() => {
    if (isLoginLoading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [isLoginLoading, showLoading, hideLoading]);

  return (
    <View style={styles.container}>
      <View style={styles.headerCard}>
        <Image source={require("../../assets/LOGO_ATRUX.png")} style={styles.logo} />
        <Text style={styles.headerTitle}>Bine ai venit!</Text>
        <Text style={styles.headerSubtitle}>Logheaza-te pentru a continua</Text>
      </View>

      <View style={styles.formCard}>
        <View style={styles.inputWrapper}>
          <Text style={styles.inputLabel}>Numar de telefon</Text>
          <View style={styles.inputContainer}>
            <TextInput
              value={phone_number}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              autoCapitalize="none"
              style={styles.input}
              mode="flat"
              disabled={isLoginLoading}
              placeholder="Ex: +40123456789"
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
              theme={{ colors: { primary: COLORS.primary } }}
              disabled={isLoginLoading}
              placeholder="Introdu parola"
            />
          </View>
        </View>

        <TouchableOpacity onPress={handleForgotPassword} disabled={isLoginLoading}>
          <Text style={styles.forgotPassword}>Ai uitat parola?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.submitButton,
            isLoginLoading && { opacity: 0.6 }
          ]}
          onPress={handleLogin}
          disabled={isLoginLoading}
        >
          <Text style={styles.submitButtonText}>
            {isLoginLoading ? 'Se proceseaza...' : 'Logheaza-te'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.signupText}>
          Nu ai un cont?{' '}
          <Text 
            style={[
              styles.signupLink,
              isLoginLoading && { opacity: 0.6 }
            ]} 
            onPress={isLoginLoading ? null : handleCreateAccount}
          >
            Creeaza contul
          </Text>
        </Text>

        {/* Debug info - Remove this in production */}
        {__DEV__ && (
          <View style={{ marginTop: 20, padding: 10, backgroundColor: '#f0f0f0' }}>
            <Text style={{ fontSize: 12, color: '#666' }}>Debug Info:</Text>
            <Text style={{ fontSize: 10, color: '#666' }}>Phone: {phone_number}</Text>
            <Text style={{ fontSize: 10, color: '#666' }}>Password length: {password.length}</Text>
            <Text style={{ fontSize: 10, color: '#666' }}>Loading: {isLoginLoading.toString()}</Text>
            {loginError && (
              <Text style={{ fontSize: 10, color: 'red' }}>Error: {loginError.message}</Text>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

export default LoginScreen;