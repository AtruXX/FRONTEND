import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from "react-native";
import { useNavigation } from '@react-navigation/native';
import Ionicons from "react-native-vector-icons/Ionicons";
import AsyncStorage from '@react-native-async-storage/async-storage';

import { styles } from "./styles"; 
const HomeScreen = () => {
  const navigation = useNavigation();
  const [profileData, setProfileData] = useState({
    name: "",
    role: "",
    initials: ""
  });
  const [currentDate, setCurrentDate] = useState(new Date());
  const BASE_URL = "https://atrux-717ecf8763ea.herokuapp.com";

  useEffect(() => {
    fetchProfileData();
  }, []);
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000);

    return () => clearInterval(intervalId);
  }, []);

  // Format day number
  const day = currentDate.getDate();

  // Get month name in Romanian
  const getMonthNameRomanian = (month) => {
    const months = [
      'ianuarie', 'februarie', 'martie', 'aprilie',
      'mai', 'iunie', 'iulie', 'august',
      'septembrie', 'octombrie', 'noiembrie', 'decembrie'
    ];
    return months[month];
  };

  const monthName = getMonthNameRomanian(currentDate.getMonth());
  const year = currentDate.getFullYear();

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

      const response = await fetch(`${BASE_URL}/api/v0.1/profile/`, {
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
        initials: initials.toUpperCase()
      });

    } catch (error) {
      console.error('[DEBUG] Caught error in fetchProfileData:', error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        {/* Header with profile */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Bun venit,</Text>
            <Text style={styles.nameText}>{profileData.name}</Text>
            <Text style={styles.roleText}>{profileData.role}</Text>
          </View>
          <View style={styles.profileContainer}>
            <Text style={styles.profileInitials}>{profileData.initials}</Text>
          </View>
        </View>

        {/* Date display */}
        <View style={styles.dateContainer}>
          <Text style={styles.dateNumber}>{day}</Text>
          <View style={styles.dateDetails}>
            <Text style={styles.dateMonth}>{monthName}</Text>
            <Text style={styles.dateYear}>{year}</Text>
          </View>

          <TouchableOpacity style={styles.logoutButton}
            onPress={async () => {
              try {
                const authToken = await AsyncStorage.getItem('authToken');
                console.log('[DEBUG] Retrieved auth token:', authToken);

                if (!authToken) {
                  console.error('[DEBUG] No auth token found. Aborting fetch.');
                  return;
                }

                const response = await fetch(`${BASE_URL}/api/v0.1/auth/${authToken}/logout`, {
                  method: 'POST',
                  headers: {
                    'Authorization': `Token ${authToken}`,
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

            <Text style={styles.logoutText}>Deconectare</Text>
            <Ionicons name="log-out-outline" size={16} color="#3B82F6" />
          </TouchableOpacity>
        </View>


        {/* Quick Actions Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Acțiuni rapide</Text>

          </View>

          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Transports')}>
              <View style={[styles.actionIconContainer, { backgroundColor: '#EFF6FF' }]}>
                <Ionicons name="subway-outline" size={24} color="#3B82F6" />
              </View>
              <Text style={styles.actionLabel}>Transporturi</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Profile', { screen: 'DocumentsGeneral' })}>

              <View style={[styles.actionIconContainer, { backgroundColor: '#F0F9FF' }]}>
                <Ionicons name="file-tray-full-outline" size={24} color="#0EA5E9" />
              </View>
              <Text style={styles.actionLabel}>Documente</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Truck')}>
              <View style={[styles.actionIconContainer, { backgroundColor: '#FEF2F2' }]}>
                <Ionicons name="bus-outline" size={24} color="#EF4444" />
              </View>
              <Text style={styles.actionLabel}>Camion</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Transports', { screen: 'TransportStatus' })}>
              <View style={[styles.actionIconContainer, { backgroundColor: '#F0FFF4' }]}>
                <Ionicons name="map-outline" size={24} color="#10B981" />
              </View>
              <Text style={styles.actionLabel}>Transport actual</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Status Card - Current status */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.statusTitle}>Status Curent</Text>
            <View style={styles.statusIndicator}>
              <Text style={styles.statusText}>La volan</Text>
            </View>
          </View>
        </View>

        {/* Upcoming delivery card */}
        <View style={styles.deliveryCard}>
          <View style={styles.deliveryHeader}>
            <View>
              <Text style={styles.deliveryTitle}>LYON → CLUJ</Text>
              <Text style={styles.deliverySubtitle}>Maine, 14:00</Text>
            </View>
            <View style={styles.deliveryBadge}>
              <Text style={styles.deliveryBadgeText}>La timp</Text>
            </View>
          </View>
          <View style={styles.deliveryDetails}>
            <View style={styles.deliveryItem}>
              <Ionicons name="cube-outline" size={20} color="#666" />
              <Text style={styles.deliveryItemText}>Electronice - 2 paleti</Text>
            </View>
            <View style={styles.deliveryItem}>
              <Ionicons name="navigate-outline" size={20} color="#666" />
              <Text style={styles.deliveryItemText}>280 km</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.deliveryButton}>
            <Text style={styles.deliveryButtonText}>Vezi detalii</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};


export default HomeScreen;