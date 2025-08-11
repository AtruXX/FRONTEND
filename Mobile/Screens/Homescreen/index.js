import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator } from "react-native";
import { useNavigation } from '@react-navigation/native';
import Ionicons from "react-native-vector-icons/Ionicons";
import AsyncStorage from '@react-native-async-storage/async-storage';

import { styles } from "./styles";
import TransportMainPage from "../TransportActualMain";
import { BASE_URL } from "../../utils/BASE_URL";
import COLORS from "../../utils/COLORS.js";
import { useLoading } from "../../components/General/loadingSpinner.js";
const HomeScreen = () => {
  const navigation = useNavigation();
  const { showLoading, hideLoading } = useLoading();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [transport, setTransport] = useState(null);
  const [transportLoading, setTransportLoading] = useState(true); // Keep this for transport card only
  const [error, setError] = useState(null);
  const [profileData, setProfileData] = useState({
    name: "",
    role: "",
    initials: "",
    id: "",
    on_road: false,
  });

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
  //adaugare alagere curse
  //curse atribuite sofer? 
  //preluare id transport - insusire poate in get driver 

  const monthName = getMonthNameRomanian(currentDate.getMonth());
  const year = currentDate.getFullYear();

  const fetchProfileData = async () => {
    try {
      showLoading(); // Use global loading
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
        id: data.id,
        on_road: data.on_road,
      });

    } catch (error) {
      console.error('[DEBUG] Caught error in fetchProfileData:', error);
    } finally {
      hideLoading(); // Use global loading
    }
  };


  useEffect(() => {
    const fetchTransport = async () => {
      try {
        setTransportLoading(true); // Use local loading for transport card
        const authToken = await AsyncStorage.getItem('authToken');
        console.log('[DEBUG] Retrieved auth token:', authToken);

        if (!authToken) {
          console.error('[DEBUG] No auth token found. Aborting fetch.');
          setTransportLoading(false);
          return;
        }

        const headers = {
          'Authorization': `Token ${authToken}`,
        };

        console.log(`[DEBUG] Sending GET request to ${BASE_URL}transports?driver_id=${profileData.id}`);
        const response = await fetch(`${BASE_URL}transports?driver_id=${profileData.id}`, {
          method: 'GET',
          headers: headers
        });

        if (!response.ok) {
          throw new Error(`API request failed with status: ${response.status}`);
        }

        const data = await response.json();
        console.log('[DEBUG] Received transport data:', data);

        if (data.transports && data.transports.length > 0) {
          const sortedTransports = [...data.transports].sort((a, b) => b.id - a.id);
          const lastTransport = sortedTransports[0];
          setTransport(lastTransport);
          console.log('[DEBUG] Set last transport:', lastTransport);
        } else {
          setTransport(null);
          console.log('[DEBUG] No transports found for driver');
        }

      } catch (err) {
        console.error('[DEBUG] Error fetching transport:', err);
        setError(err.message);
        setTransport(null);
      } finally {
        setTransportLoading(false); // Use local loading for transport card
      }
    };

    if (profileData.id) { // Only fetch when we have profile ID
      fetchTransport();
    }
  }, [profileData.id]);
  
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Eroare: {error}</Text>
      </View>
    );
  }

  const handleStatusChange = async () => {
    try {
      showLoading(); // Use global loading

      console.log('🌐 Request URL:', `${BASE_URL}status/`);
      const authToken = await AsyncStorage.getItem('authToken');

      const response = await fetch(`${BASE_URL}status/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Response status:', response.status);

      if (response.ok) {
        const updatedData = await response.json();
        console.log('✅ Response data:', JSON.stringify(updatedData, null, 2));

        setProfileData(updatedData);

        const newStatus = updatedData.driver.on_road ? 'La volan' : 'Parcat';

      } else {
        const errorText = await response.text();
        console.error('❌ Response error:', response.status, errorText);
        throw new Error(`Failed to update status: ${response.status}`);
      }

    } catch (error) {
      console.error('💥 Status update error:', error);
      Alert.alert('Eroare', 'Nu s-a putut actualiza statusul. Încearcă din nou.');
    } finally {
      hideLoading(); // Use global loading
    }
  };

  // Fixed: access nested driver.on_road for current and next status
  const currentStatus = profileData.driver?.on_road === true ? 'La volan' : 'Staționare';
  const nextStatus = profileData.driver?.on_road === true ? 'Staționare' : 'La volan';

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
                showLoading(); // Use global loading
                const authToken = await AsyncStorage.getItem('authToken');
                console.log('[DEBUG] Retrieved auth token:', authToken);

                if (!authToken) {
                  console.error('[DEBUG] No auth token found. Aborting fetch.');
                  return;
                }

                const response = await fetch(`${BASE_URL}auth/token/logout`, {
                  method: 'POST',
                  headers: {
                    'Authorization': `Token ${authToken}`,
                    'Content-Type': 'application/json',
                  },
                });

                if (response.ok) {
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
              } finally {
                hideLoading(); // Use global loading
              }
            }}
          >

            <Text style={styles.logoutText}>Deconectare</Text>
            <Ionicons name="log-out-outline" size={16} color={COLORS.primary} />
          </TouchableOpacity>
        </View>


        {/* Quick Actions Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Acțiuni rapide</Text>

          </View>

          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Transports')}>
              <View style={[styles.actionIconContainer, { backgroundColor: COLORS.background }]}>
                <Ionicons name="subway-outline" size={28} color={COLORS.primary} />
              </View>
              <Text style={styles.actionLabel}>Transporturi</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('DocumentsGeneral', { screen: 'DocumentsGeneral' })}>

              <View style={[styles.actionIconContainer, { backgroundColor: COLORS.background }]}>
                <Ionicons name="file-tray-full-outline" size={28} color={COLORS.secondary} />
              </View>
              <Text style={styles.actionLabel}>Documente</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Truck')}>
              <View style={[styles.actionIconContainer, { backgroundColor: COLORS.background }]}>
                <Ionicons name="bus-outline" size={28} color={COLORS.danger} />
              </View>
              <Text style={styles.actionLabel}>Camion</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate(TransportMainPage)}>
              <View style={[styles.actionIconContainer, { backgroundColor: COLORS.background }]}>
                <Ionicons name="map-outline" size={28} color={COLORS.success} />
              </View>
              <Text style={styles.actionLabel}>Transport actual</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statusCard}>
          {/* Current Status Display */}
          <View style={[
            styles.statusDisplay,
            profileData.driver?.on_road ? styles.driving : styles.parked
          ]}>
            <View style={[
              styles.statusDot,
              profileData.driver?.on_road ? styles.drivingDot : styles.parkedDot
            ]} />
            <Text style={styles.statusText}>
              {profileData.driver?.on_road ? 'La volan' : 'Parcat'}
            </Text>
          </View>

          {/* Simple Toggle Button */}
         <TouchableOpacity
  style={[
    styles.toggleButton,
    profileData.driver?.on_road ? styles.parkButton : styles.driveButton
    // Remove: loading && styles.disabled
  ]}
  onPress={handleStatusChange}
  // Remove: disabled={loading}
  activeOpacity={0.7}
>
  <Text style={styles.buttonText}>
    {profileData.driver?.on_road ? 'Parcheaza' : 'Pornește'}
  </Text>
</TouchableOpacity>
        </View>


        {/* Upcoming delivery card */}
        {transportLoading ? (

          <>
            <Text style={styles.sectionTitle}>Ultimul transport atribuit</Text>
            <View style={styles.deliveryCard}>
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.success} />
                <Text style={styles.loadingText}>Se încarcă transporturile...</Text>
              </View>
            </View>
          </>
        ) : transport ? (

          <>
            <Text style={styles.sectionTitle}>Ultimul transport atribuit:</Text>
            <View style={styles.deliveryCard}>
              <View style={styles.deliveryHeader}>
                <View>
                  <Text style={styles.deliveryTitle}>
                    {transport.origin_city} → {transport.destination_city}
                  </Text>
                  <Text style={styles.deliverySubtitle}>
                    {transport.time_estimation || 'Maine, 14:00'}
                  </Text>
                </View>
                <View style={[
                  styles.deliveryBadge,
                  transport.status_transport === 'not started' ? styles.badgeNotStarted :
                    transport.status_transport === 'in progress' ? styles.badgeInProgress :
                      transport.status_transport === 'delayed' ? styles.badgeDelayed :
                        styles.badgeCompleted
                ]}>
                  <Text style={styles.deliveryBadgeText}>
                    {transport.status_transport === 'not started' ? 'Neînceput' :
                      transport.status_transport === 'in progress' ? 'În desfășurare' :
                        transport.status_transport === 'delayed' ? 'Întârziat' :
                          'Finalizat'}
                  </Text>
                </View>
              </View>
              <View style={styles.deliveryDetails}>
                <View style={styles.deliveryItem}>
                  <Ionicons name="cube-outline" size={20} color={COLORS.medium} />
                  <Text style={styles.deliveryItemText}>{transport.goods_type}</Text>
                </View>
                <View style={styles.deliveryItem}>
                  <Ionicons name="navigate-outline" size={20} color={COLORS.medium} />
                  <Text style={styles.deliveryItemText}>
                    {transport.trailer_number || 'CJ12ABC'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.deliveryButton}
                onPress={() => console.log('Transport details:', transport)}
              >
                <Text style={styles.deliveryButtonText}>Vezi detalii</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={styles.deliveryCard}>
            <View style={styles.noDataContainer}>
              <Ionicons name="truck-outline" size={48} color={COLORS.light} />
              <Text style={styles.noDataTitle}>Nu există transporturi înregistrate</Text>
              <Text style={styles.noDataSubtitle}>
                Transporturile tale vor apărea aici când vor fi asignate
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>

  );
};


export default HomeScreen;