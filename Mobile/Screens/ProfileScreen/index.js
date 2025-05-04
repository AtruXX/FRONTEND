import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Linking, Platform, SafeAreaView, StatusBar, ScrollView } from 'react-native';
import { Ionicons, Feather, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { styles } from "./styles"; 
const ProfileScreen = () => {
  const navigation = useNavigation();
  const [profileData, setProfileData] = useState({
    company: "",
    name: "",
    role: "",
    initials: ""
    
  });
  const [contactExpanded, setContactExpanded] = useState(false);
  const dispatcherNumber = '0745346397';
  const BASE_URL = "https://atrux-717ecf8763ea.herokuapp.com/api/v0.1/";

  const toggleContact = () => {
    setContactExpanded(!contactExpanded);
  };

  const callDispatcher = () => {
    const phoneUrl = Platform.OS === 'android'
      ? `tel:${dispatcherNumber}`
      : `telprompt:${dispatcherNumber}`;

    Linking.canOpenURL(phoneUrl)
      .then(supported => {
        if (supported) {
          return Linking.openURL(phoneUrl);
        }
      })
      .catch(error => console.log('Error with phone call:', error));
  };
  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const authToken = await AsyncStorage.getItem('authToken');
      console.log('[DEBUG] Retrieved auth token:', authToken);
      if (!authToken) {
        console.error('[DEBUG] No auth token found. Aborting fetch.');
        return;
      }

      const headers = {
        'Authorization': `Token ${authToken}`,
      };

      console.log('[DEBUG] Sending GET request to /get_profile with headers:', headers);
      const response = await fetch(`${BASE_URL}profile/`, {
        method: 'GET',
        headers: headers
      });

      console.log('[DEBUG] Response status:', response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[DEBUG] Server responded with error:', errorText);
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log('[DEBUG] Received profile data:', data);

      const nameParts = data.name.split(' ');
      const initials = nameParts.length > 1
        ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`
        : nameParts[0].substring(0, 2);

      setProfileData({
        name: data.name,
        role: "Sofer",
        initials: initials.toUpperCase(),
        company: data.company || "" // Add the company field here
      });

    } catch (error) {
      console.error('[DEBUG] Caught error in fetchProfileData:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
       <ScrollView 
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>

      </View>

      {/* Profile Info */}
      <View style={styles.profileInfoContainer}>
        <View style={styles.profileContainer}>
          <Text style={styles.profileInitials}>{profileData.initials}</Text>
        </View>
        <View style={styles.profileTextContainer}>
          <Text style={styles.profileName}>{profileData.name}</Text>
          <Text style={styles.profileRole}>{profileData.role}</Text>
        </View>

      </View>

      {/* Profile Details Section */}


      {/* General Data Section */}
      <View style={styles.dataContainer}>
        <Text style={styles.dataTitle}>Date generale</Text>

        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Companie</Text>
          <Text style={styles.dataDivider}>|</Text>
          <Text style={styles.dataValue}>{profileData.company}</Text>
        </View>

        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Camion actual</Text>
          <Text style={styles.dataDivider}>|</Text>
          <Text style={styles.dataValue}>TRK-7842</Text>
        </View>

        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Expirare Permis</Text>
          <Text style={styles.dataDivider}>|</Text>
          <Text style={styles.dataValue}>B-234567</Text>
        </View>

        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Telefon:</Text>
          <Text style={styles.dataDivider}>|</Text>
          <Text style={styles.dataValue}>0745123456</Text>
        </View>


      </View>

      {/* Settings Section */}
      <Text style={styles.settingsTitle}>Setari</Text>

      {/* Notifications Section */}
      <View style={styles.settingOuterContainer}>
        <TouchableOpacity
          style={styles.settingContainer}
          activeOpacity={0.7}
        >
          <View style={styles.settingIconContainer}>
          <Feather name="bell" size={20} color="#777" />
          </View>

          <View style={styles.settingTextContainer}>
            <Text style={styles.settingTitle}>Notificari</Text>
            <Text style={styles.settingSubtitle}>Editeaza Notificarile</Text>
          </View>
          <Ionicons
            name={"chevron-down"}
            size={24}
            color="#777"
          />
        </TouchableOpacity>


      </View>

      {/* Routes Section */}
      <View style={styles.settingOuterContainer}>
        <TouchableOpacity
          style={styles.settingContainer}
          activeOpacity={0.7}
        >
          <View style={styles.settingIconContainer}>
            <Feather name="map" size={20} color="#777" />
          </View>

          <View style={styles.settingTextContainer}>
            <Text style={styles.settingTitle}>Rute</Text>
            <Text style={styles.settingSubtitle}>Vezi istoricul rutelor</Text>
          </View>
          <Ionicons
            name={"chevron-down"}
            size={24}
            color="#777"
          />
        </TouchableOpacity>


      </View>


      {/* Dispatcher Contact Section */}
      <View style={styles.settingOuterContainer}>
        <TouchableOpacity
          style={styles.settingContainer}
          onPress={toggleContact}
          activeOpacity={0.7}
        >
          <View style={styles.settingIconContainer}>
            <Feather name="phone" size={20} color="#777" />
          </View>
          <View style={styles.settingTextContainer}>
            <Text style={styles.settingTitle}>Contact dispecer</Text>
            <Text style={styles.settingSubtitle}>Contactează-ți telefonic dispecerul</Text>
          </View>
          <Ionicons
            name={contactExpanded ? "chevron-up" : "chevron-down"}
            size={24}
            color="#777"
          />
        </TouchableOpacity>

        {contactExpanded && (
          <View style={styles.dropdownContainer}>
            <Text style={styles.dropdownText}>
              Atinge pentru a apela dispecerul:
            </Text>
            <TouchableOpacity
              style={styles.callButton}
              onPress={callDispatcher}
            >
              <Feather name="phone-call" size={18} color="#FFFFFF" />
              <Text style={styles.callButtonText}>{dispatcherNumber}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Sign Out Button */}
      <TouchableOpacity style={styles.signOutButton}
        onPress={async () => {
          try {
            const token = await AsyncStorage.getItem('authToken');

            if (!token) {
              alert('No token found.');
              return;
            }

            const response = await fetch('https://atrux-717ecf8763ea.herokuapp.com/auth/token/logout', {
              method: 'POST',
              headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json',
              },
            });

            if (response.ok) {
              // Navigate to Login
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } else {
              const err = await response.json();
              console.error('Logout failed:', err);
              alert('Logout failed.');
            }
          } catch (error) {
            console.error('Logout error:', error);
            alert('Something went wrong during logout.');
          }
        }}
      >
        <Text style={styles.signOutText}>Delogheaza-te</Text>
      </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};



export default ProfileScreen;