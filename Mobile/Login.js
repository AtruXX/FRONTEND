import React, { useState } from "react";
import { View, StyleSheet, Alert, Text, TouchableOpacity, Image } from "react-native";
import { TextInput, Button, Card, Title } from "react-native-paper";
import { useNavigation } from '@react-navigation/native';


const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation();

  const handleLogin = async () => {
    const loginData = { email, password };

    try {
      const response = await fetch(
        "https://atrux-717ecf8763ea.herokuapp.com/auth/token/login/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(loginData),
        }
      );

      const data = await response.json();
      if (response.ok) {
        Alert.alert("Success", "Login successful!");
        navigation.navigate('Main'); // Navigate to HomeScreen
      } else {
        Alert.alert("Error", data.detail || "Login failed");
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong");
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