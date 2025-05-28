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
  const [activeTransportId, setActiveTransportId] = useState(null); // Track active transport
  const [startingTransport, setStartingTransport] = useState(null); // Track which transport is being started
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

  // Load active transport from storage
  const loadActiveTransport = async () => {
    try {
      const activeId = await AsyncStorage.getItem('activeTransportId');
      if (activeId) {
        setActiveTransportId(parseInt(activeId));
      }
    } catch (error) {
      console.error("Error loading active transport:", error);
    }
  };

  // Save active transport to storage
  const saveActiveTransport = async (transportId) => {
    try {
      await AsyncStorage.setItem('activeTransportId', transportId.toString());
    } catch (error) {
      console.error("Error saving active transport:", error);
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
          // Load active transport
          loadActiveTransport();
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

  // Hardcoded transport data for testing
  const fetchTransports = async (token, driverId) => {
    try {
      setLoading(true);
      
      // Simulate loading delay
      setTimeout(() => {
        const hardcodedTransports = [
          {
            id: 1,
            truck_combination: "Scania R450 + Remorcă Krone",
            destination: "București → Cluj-Napoca",
            status_truck: "ok",
            status_goods: "ok",
            status_trailer_wagon: "ok",
            status_transport: "not started",
            departure_time: "08:00",
            arrival_time: "14:30",
            distance: "450 km"
          },
          {
            id: 2,
            truck_combination: "Mercedes Actros + Remorcă Schmitz",
            destination: "Cluj-Napoca → Timișoara",
            status_truck: "ok",
            status_goods: "probleme",
            status_trailer_wagon: "ok",
            status_transport: "not started",
            departure_time: "06:00",
            arrival_time: "12:00",
            distance: "320 km"
          },
          {
            id: 3,
            truck_combination: "Volvo FH16 + Remorcă Kögel",
            destination: "Timișoara → Constanța",
            status_truck: "probleme",
            status_goods: "ok",
            status_trailer_wagon: "ok",
            status_transport: "not started",
            departure_time: "10:00",
            arrival_time: "18:00",
            distance: "520 km"
          }
        ];
        
        setTransports(hardcodedTransports);
        setLoading(false);
        setRefreshing(false);
      }, 1000);
    } catch (err) {
      console.error('[DEBUG] Error setting hardcoded transports:', err);
      setError(err.message);
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle starting a transport
  const handleStartTransport = async (transport) => {
    setStartingTransport(transport.id);
    
    // Simulate a short delay for better UX
    setTimeout(() => {
      // Set this transport as active
      setActiveTransportId(transport.id);
      saveActiveTransport(transport.id);
      
      // Show success alert
      Alert.alert(
        'Succes!',
        'TI-AI INSUSIT CURSA CU SUCCES! DISPECERUL TAU VA FI ANUNTAT!',
        [{ text: 'OK' }]
      );
      
      setStartingTransport(null);
    }, 1000);
  };
  
  // Single useEffect that calls the function when component mounts
  useEffect(() => {
    // Always load hardcoded data
    fetchTransports();
  }, []);
  
  const onRefresh = () => {
    setRefreshing(true);
    fetchTransports();
  };

  const handleModifyData = (transport) => {
    navigation.navigate('Transport_Update', { transport: transport });
  };
  
  const handleViewPhoto = (photoUrl) => {
    // Implement photo viewing functionality
    Alert.alert('View Photo', `Would open photo: ${photoUrl}`);
  };

  const handleViewDetails = (item) => {
    // Navigate to details or implement details view
    console.log('View details for transport:', item.id);
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

  const renderTransportItem = ({ item }) => {
    const isActive = activeTransportId === item.id;
    const isStarting = startingTransport === item.id;
    const isDisabled = activeTransportId !== null && !isActive;

    return (
      <View style={[styles.transportCard, isDisabled && styles.disabledCard]}>
        <View style={styles.transportHeader}>
          <View>
            <Text style={styles.transportTitle}>Transport #{item.id}</Text>
            <Text style={styles.transportSubtitle}>{item.truck_combination || 'N/A'}</Text>
            {item.destination && (
              <Text style={styles.destinationText}>
                <Ionicons name="location-outline" size={14} color="#666" />
                {' '}{item.destination}
              </Text>
            )}
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

        {/* Start Transport Button */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={[
              styles.startButton,
              isActive && styles.activeButton,
              isDisabled && styles.disabledButton
            ]}
            onPress={() => handleStartTransport(item)}
            disabled={isDisabled || isStarting}
          >
            {isStarting ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Ionicons 
                  name={isActive ? "checkmark-circle" : "play-circle"} 
                  size={20} 
                  color="white" 
                  style={styles.buttonIcon} 
                />
                <Text style={styles.startButtonText}>
                  {isActive ? "CURSA ACTUALĂ" : "ÎNCEPE"}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>Se încarcă transporturile...</Text>
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