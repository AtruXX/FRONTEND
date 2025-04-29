import React, { useState, useEffect } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { Ionicons, Feather, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const [profileData, setProfileData] = useState({
    company: "",
    name: "",
    role: "",
    initials: ""
  });
  
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
      const response = await fetch('https://atrux-717ecf8763ea.herokuapp.com/get_profile/', {
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
      <View style={styles.settingContainer}>
        <View style={styles.settingIconContainer}>
          <Feather name="bell" size={20} color="#777" />
        </View>
        <View style={styles.settingTextContainer}>
          <Text style={styles.settingTitle}>Notificari</Text>
          <Text style={styles.settingSubtitle}>Editeaza notificarile</Text>
        </View>
        <Ionicons name="chevron-down" size={24} color="#777" />
      </View>
      
      {/* Routes Section */}
      <View style={styles.settingContainer}>
        <View style={styles.settingIconContainer}>
          <Feather name="map" size={20} color="#777" />
        </View>
        <View style={styles.settingTextContainer}>
          <Text style={styles.settingTitle}>Rute</Text>
          <Text style={styles.settingSubtitle}>Vezi istoricul rutelor</Text>
        </View>
        <Ionicons name="chevron-down" size={24} color="#777" />
      </View>
      
      {/* Dispatcher Contact Section */}
      <View style={styles.settingContainer}>
        <View style={styles.settingIconContainer}>
          <Feather name="phone" size={20} color="#777" />
        </View>
        <View style={styles.settingTextContainer}>
          <Text style={styles.settingTitle}>Contact dispecer</Text>
          <Text style={styles.settingSubtitle}>Contacteaza-ti telefonic dispecerul</Text>
        </View>
        <Ionicons name="chevron-down" size={24} color="#777" />
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  
  profileInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  profileTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '500',
  },
  profileRole: {
    fontSize: 16,
    color: '#4285F4',
    marginTop: 2,
  },
  notificationButton: {
    padding: 8,
  },
  sectionContainer: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#777',
    marginTop: 2,
  },
  dataContainer: {
    backgroundColor: '#f9f9f9',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
  },
  dataTitle: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 12,
  },
  dataRow: {
    flexDirection: 'row',
    marginVertical: 6,
  },
  dataLabel: {
    fontSize: 14,
    color: '#777',
  },
  dataDivider: {
    fontSize: 14,
    color: '#777',
    marginHorizontal: 6,
  },
  dataValue: {
    fontSize: 14,
    color: '#777',
  },
  settingsTitle: {
    fontSize: 22,
    fontWeight: '500',
    marginTop: 24,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  settingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  addIconCircle: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#4285F4',
    justifyContent: 'center',
    alignItems: 'center',
    bottom: -2,
    right: -2,
  },
  settingTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#777',
    marginTop: 2,
  },
  signOutButton: {
    marginTop: 24,
    marginHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  signOutText: {
    fontSize: 16,
    color: '#F44336',
    fontWeight: '500',
  },
  profileContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#6366F1",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ProfileScreen;