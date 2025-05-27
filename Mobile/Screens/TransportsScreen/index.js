import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { styles } from './styles'; // Import your styles from the styles.js file

const TransportsScreen = ({ navigation, route }) => {
  const [transports, setTransports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [authToken, setAuthToken] = useState(null);
  const [driverId, setDriverId] = useState(route.params?.driverId || 1);
  const [error, setError] = useState(null);
  const [profileData, setProfileData] = useState({
    name: "",
    role: "",
    initials: "",
    id: "",
    on_road: false,
  });
  
  const BASE_URL = "https://atrux-717ecf8763ea.herokuapp.com/api/v0.1/";
  
  // Load auth token on component mount
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
        setProfileData(profileData);
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
          setLoading(false);
        }
      } catch (error) {
        console.error("Error loading auth token:", error);
        setLoading(false);
      }
    };
    loadAuthToken();
  }, []);

  // Define the fetch function outside of useEffect
  const fetchTransports = async (token, driverId) => {
    try {
      setLoading(true);
      console.log('[DEBUG] Using auth token:', token);
      
      if (!token) {
        console.error('[DEBUG] No auth token found. Aborting fetch.');
        setLoading(false);
        return;
      }
      
      const headers = {
        'Authorization': `Token ${token}`,
      };
      
      // Use the passed driver ID
      console.log(`[DEBUG] Sending GET request to ${BASE_URL}transports?driver_id=${driverId}`);
      
      const response = await fetch(`${BASE_URL}transports?driver_id=${driverId}`, {
        method: 'GET',
        headers: headers
      });
      
      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('[DEBUG] Received transport data:', data);
      
      if (data.transports && data.transports.length > 0) {
        // Set all transports instead of just the latest one
        setTransports(data.transports);
        setRefreshing(false);
      } else {
        console.log('[DEBUG] No transports found in the response');
        setTransports([]);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('[DEBUG] Error fetching transport:', err);
      setError(err.message);
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  // Single useEffect that calls the function when dependencies change
  useEffect(() => {
    if (authToken && driverId) {
      fetchTransports(authToken, driverId);
    }
  }, [authToken, driverId]);
  
  const onRefresh = () => {
    setRefreshing(true);
    if (authToken && driverId) {
      fetchTransports(authToken, driverId);
    } else {
      setRefreshing(false);
    }
  };

  const handleModifyData = (transport) => {
    navigation.navigate('Transport_Update', { transport: transport });
  };
  
  const handleViewPhoto = (photoUrl) => {
    // Implement photo viewing functionality
    Alert.alert('View Photo', `Would open photo: ${photoUrl}`);
  };

  const getStatusColor = (status) => {
    if (status === 'ok') return '#10B981'; // Green like statusIndicator in second file
    if (status === 'probleme' || status === 'not started') return '#F59E0B'; // Orange/amber color
    return '#EF4444'; // Red for errors
  };

  const getStatusIcon = (status) => {
    if (status === 'ok') return 'checkmark-circle';
    if (status === 'probleme') return 'warning';
    if (status === 'not started') return 'time-outline';
    return 'alert-circle';
  };


  const renderTransportItem = ({ item }) => (
    <View style={styles.transportCard}>
      <View style={styles.transportHeader}>
        <View>
          <Text style={styles.transportTitle}>Transport #{item.id}</Text>
          <Text style={styles.transportSubtitle}>{item.truck_combination || 'N/A'}</Text>
        </View>
        <TouchableOpacity 
          style={styles.modifyButton} 
          onPress={() => handleViewDetails(item)}
        >
          <Text style={styles.modifyButtonText}>Vezi detalii</Text>
          <Ionicons name="chevron-forward-outline" size={16} color="#6366F1" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.transportDetails}>
        <View style={styles.detailSection}>
          <View style={styles.sectionTitle}>
            <Ionicons name="car" size={18} color="#6366F1" style={styles.sectionIcon} />
            <Text style={styles.sectionTitleText}>Status Transport</Text>
          </View>
          
          <View style={styles.detailGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Status camion</Text>
              <View style={[styles.statusContainer, {backgroundColor: `${getStatusColor(item.status_truck)}15`}]}>
                <Ionicons name={getStatusIcon(item.status_truck)} size={16} color={getStatusColor(item.status_truck)} style={styles.statusIcon} />
                <Text style={[styles.statusText, {color: getStatusColor(item.status_truck)}]}>{item.status_truck || 'N/A'}</Text>
              </View>
            </View>
            
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Status marfă</Text>
              <View style={[styles.statusContainer, {backgroundColor: `${getStatusColor(item.status_goods)}15`}]}>
                <Ionicons name={getStatusIcon(item.status_goods)} size={16} color={getStatusColor(item.status_goods)} style={styles.statusIcon} />
                <Text style={[styles.statusText, {color: getStatusColor(item.status_goods)}]}>{item.status_goods || 'N/A'}</Text>
              </View>
            </View>
            
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Status remorcă</Text>
              <View style={[styles.statusContainer, {backgroundColor: `${getStatusColor(item.status_trailer_wagon)}15`}]}>
                <Ionicons name={getStatusIcon(item.status_trailer_wagon)} size={16} color={getStatusColor(item.status_trailer_wagon)} style={styles.statusIcon} />
                <Text style={[styles.statusText, {color: getStatusColor(item.status_trailer_wagon)}]}>{item.status_trailer_wagon || 'N/A'}</Text>
              </View>
            </View>
            
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Status transport</Text>
              <View style={[styles.statusContainer, {backgroundColor: `${getStatusColor(item.status_transport)}15`}]}>
                <Ionicons name={getStatusIcon(item.status_transport)} size={16} color={getStatusColor(item.status_transport)} style={styles.statusIcon} />
                <Text style={[styles.statusText, {color: getStatusColor(item.status_transport)}]}>{item.status_transport === 'not started' ? 'Neînceput' : item.status_transport || 'N/A'}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
  

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>

      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Transporturile Mele</Text>
          <TouchableOpacity 
            style={styles.refreshIconButton}
            onPress={onRefresh}
          >
            <Ionicons name="refresh" size={22} color="#6366F1" />
          </TouchableOpacity>
        </View>
        
        {transports.length > 0 ? (
          <FlatList
            data={transports}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderTransportItem}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#6366F1']}
              />
            }
          />
        ) : (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="car-outline" size={40} color="#6366F1" />
            </View>
            <Text style={styles.emptyTitle}>Niciun transport găsit</Text>
            <Text style={styles.emptyText}>Nu există transporturi disponibile în acest moment</Text>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={onRefresh}
            >
              <Text style={styles.refreshButtonText}>Reîmprospătare</Text>
              <Ionicons name="refresh" size={18} color="white" style={{marginLeft: 6}} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};



export default TransportsScreen;