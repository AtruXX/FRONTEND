import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from "../../utils/BASE_URL";

import { styles } from './styles'; // Import your styles from the styles.js file

const TransportMainPage = ({ navigation }) => {
  const [driverId, setDriverId] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  

  useEffect(() => {
    const loadAuthToken = async () => {
      try {
        console.log('Attempting to load auth token from AsyncStorage');
        const token = await AsyncStorage.getItem('authToken');
        console.log('Token from AsyncStorage:', token ? 'Token exists' : 'No token found');
        
        if (token) {
          setAuthToken(token);
          console.log('Auth token loaded and set in state');
          // Once we have the token, fetch the profile to get driverId
          fetchDriverProfile(token);
        } else {
          console.error("No auth token found in AsyncStorage");
          Alert.alert('Eroare', 'Sesiune expirată. Vă rugăm să vă autentificați din nou.');
        }
      } catch (error) {
        console.error("Error loading auth token:", error);
        Alert.alert('Eroare', 'Nu s-a putut încărca token-ul de autentificare.');
      }
    };
    
    loadAuthToken();
  }, []);

  const fetchDriverProfile = async (token) => {
    try {
      const response = await fetch(
        `${BASE_URL}profile/`,
        {
          method: "GET",
          headers: {
            "Authorization": `Token ${token}`
          }
        }
      );
      
      if (response.ok) {
        const profileData = await response.json();
        setDriverId(profileData.id);
        console.log("Driver ID set:", profileData.id);
      } else {
        console.error("Failed to fetch driver profile");
        Alert.alert('Eroare', 'Nu s-a putut obține profilul șoferului.');
      }
    } catch (error) {
      console.error("Error fetching driver profile:", error);
      Alert.alert('Eroare', 'Verificați conexiunea la internet.');
    }
  };

  const handleDownloadCMR = () => {
    Alert.alert(
      'Descărcare CMR',
      'Descărcarea documentului CMR a început.',
      [{ text: 'OK' }]
    );
  };

  const navigateTo = (screenName) => {
    navigation.navigate(screenName, {
      authToken: authToken,
      driverId: driverId
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transport actual</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView 
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {/* UIT Code Information */}
        <View style={styles.uitCodeContainer}>
          <Text style={styles.uitLabel}>COD UIT:</Text>
          <Text style={styles.uitCode}>TR-8529-RO</Text>
        </View>
        
        <View style={styles.selectionContainer}>
          <Text style={styles.selectionTitle}>Alegeți tipul de formular:</Text>
          
          {/* Vezi Ruta Button */}
          <TouchableOpacity
            style={[styles.selectionButton, { marginBottom: 20 }]}
            onPress={() => navigateTo('RouteView')}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="map-outline" size={32} color="#FFFFFF" />
            </View>
            <Text style={styles.selectionButtonText}>Vezi Ruta</Text>
            <Text style={styles.selectionDescription}>
              Vizualizează ruta de transport și punctele de oprire
            </Text>
          </TouchableOpacity>
          
          {/* CMR Digital Button */}
          <TouchableOpacity
            style={[styles.selectionButton, { marginBottom: 20 }]}
            onPress={() => navigateTo('CMRDigitalForm')}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="document-text-outline" size={32} color="#FFFFFF" />
            </View>
            <Text style={styles.selectionButtonText}>CMR Digital</Text>
            <Text style={styles.selectionDescription}>
              Scrisoare de transport internațional de mărfuri (Expeditor, Destinatar, etc.)
            </Text>
          </TouchableOpacity>
          
          {/* Transport Status Button */}
          <TouchableOpacity
            style={[styles.selectionButton, { marginBottom: 20 }]}
            onPress={() => navigateTo('StatusTransportForm')}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="car-outline" size={32} color="#FFFFFF" />
            </View>
            <Text style={styles.selectionButtonText}>Status Transport</Text>
            <Text style={styles.selectionDescription}>
              Informații despre starea camionului, mărfii și a transportului
            </Text>
          </TouchableOpacity>

          {/* Photo CMR Button */}
          <TouchableOpacity
            style={[styles.selectionButton, { marginBottom: 20 }]}
            onPress={() => navigateTo('PhotoCMRForm')}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="camera-outline" size={32} color="#FFFFFF" />
            </View>
            <Text style={styles.selectionButtonText}>Fotografiaza CMR-UL</Text>
            <Text style={styles.selectionDescription}>
              Incarca o fotografie cu CMR-ul in format fizic
            </Text>
          </TouchableOpacity>

          {/* Download CMR Button */}
          <TouchableOpacity 
            style={styles.downloadButton} 
            onPress={handleDownloadCMR}
          >
            <Ionicons name="cloud-download-outline" size={24} color="#FFFFFF" />
            <Text style={styles.downloadButtonText}>Descarcă acum CMR-ul</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TransportMainPage;