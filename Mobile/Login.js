import React, { useState } from "react";
import { View, StyleSheet, Alert, Text, TouchableOpacity, Image } from "react-native";
import { TextInput, Button, Card, Title } from "react-native-paper";
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';


const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation();
  const fetchUserProfile = async (token) => {
    try {
      console.log('Fetching user profile with token');
      const response = await fetch(
        "https://atrux-717ecf8763ea.herokuapp.com/get_profile/",
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
        "https://atrux-717ecf8763ea.herokuapp.com/auth/token/login/",
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
      <Card style={styles.card}>
        <Card.Content>
          <Image source={require("./assets/LOGO_ATRUX.jpeg")} style={styles.logo} />
          <Title style={styles.title}>Log In</Title>
          <TextInput
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
            mode="outlined"
          />
          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
            mode="outlined"
          />
          <TouchableOpacity>
            <Text style={styles.forgotPassword}>Forgot password?</Text>
          </TouchableOpacity>
          <Button mode="contained" onPress={handleLogin} style={styles.button}>
            Log In
          </Button>
          <Text style={styles.signupText}>
            Don't have an account? <Text style={styles.signupLink}>Create Account</Text>
          </Text>
          
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 400,
    padding: 20,
    elevation: 5,
    borderRadius: 10,
    backgroundColor: "#ffffff",
  },
  logo: {
    width: 100,
    height: 100,
    alignSelf: "center",
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#3b82f6",
  },
  input: {
    marginBottom: 15,
  },
  forgotPassword: {
    color: "red",
    textAlign: "right",
    marginBottom: 15,
  },
  button: {
    marginTop: 10,
    borderRadius: 25,
    paddingVertical: 8,
    backgroundColor: "#3b82f6",
  },
  signupText: {
    textAlign: "center",
    marginTop: 15,
    color: "gray",
  },
  signupLink: {
    fontWeight: "bold",
    color: "black",
  },
  orText: {
    textAlign: "center",
    marginVertical: 10,
    color: "gray",
  },
  socialContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  socialIcon: {
    width: 40,
    height: 40,
    marginHorizontal: 10,
  },
});

export default LoginScreen;