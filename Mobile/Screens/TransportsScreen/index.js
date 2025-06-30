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

  // ADD: Base URL - Update this with your actual API base URL
  const BASE_URL = "https://atrux-717ecf8763ea.herokuapp.com/api/v0.1/";

  // ADD: fetchDriverProfile function
  const fetchDriverProfile = async (token) => {
    try {
      const response = await fetch(`${BASE_URL}auth/users/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Update profile data state
      setProfileData({
        name: data.name,
        role: data.is_driver ? "Driver" : (data.is_dispatcher ? "Dispatcher" : "User"),
        initials: data.name.split(' ').map(n => n[0]).join('').toUpperCase(),
        id: data.id,
        on_road: false, // You can update this based on your logic
      });
      
      // Set the driver ID from the API response
      setDriverId(data.id);
      
      console.log('Driver profile loaded:', data.name, 'ID:', data.id);
      return data;
    } catch (error) {
      console.error('Error fetching driver profile:', error);
      return null;
    }
  };

  // ADD: Load active transport from storage
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

  // ADD: Save active transport to storage
  const saveActiveTransport = async (transportId) => {
    try {
      await AsyncStorage.setItem('activeTransportId', transportId.toString());
    } catch (error) {
      console.error("Error saving active transport:", error);
    }
  };
  
  // FIXED: fetchTransports function with proper URL
  const fetchTransports = async (token, driverId) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching transports for driver ID:', driverId);
      const url = `${BASE_URL}transports?status=atribuit&driver=${driverId}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Transform the API data to match your existing component structure
      const transformedTransports = data.transports.map(transport => ({
        id: transport.id,
        truck_combination: transport.truck_combination,
        destination: `${transport.origin_city} → ${transport.destination_city}`,
        status_truck: transport.status_truck,
        status_goods: transport.status_goods,
        status_trailer_wagon: transport.status_trailer_wagon,
        status_transport: transport.status_transport,
        departure_time: transport.time_estimation ? 
          new Date(transport.time_estimation).toLocaleTimeString('ro-RO', {
            hour: '2-digit',
            minute: '2-digit'
          }) : 'N/A',
        arrival_time: 'N/A', // Not provided in API response
        distance: 'N/A', // Not provided in API response
        // Additional fields from API that might be useful
        goods_type: transport.goods_type,
        trailer_type: transport.trailer_type,
        trailer_number: transport.trailer_number,
        delay_estimation: transport.delay_estimation,
        is_finished: transport.is_finished,
        company: transport.company,
        dispatcher: transport.dispatcher,
        goods_photos: transport.goods_photos
      }));
      
      setTransports(transformedTransports);
      setLoading(false);
      setRefreshing(false);
      
    } catch (err) {
      console.error('[DEBUG] Error fetching transports:', err);
      setError(err.message || 'Failed to fetch transports');
      setLoading(false);
      setRefreshing(false);
    }
  };

  // FIXED: useEffect to properly pass token and driverId
  useEffect(() => {
    const loadAuthToken = async () => {
      try {
        console.log('Attempting to load auth token from AsyncStorage');
        const token = await AsyncStorage.getItem('authToken');
        console.log('Token from AsyncStorage:', token ? 'Token exists' : 'No token found');
        if (token) {
          setAuthToken(token);
          console.log('Auth token loaded and set in state');
          
          // Load active transport
          await loadActiveTransport();
          
          // Fetch the profile to get driverId
          const profileData = await fetchDriverProfile(token);
          
          // Fetch transports with token and driverId
          const driverIdToUse = profileData?.id || driverId;
          await fetchTransports(token, driverIdToUse);
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

  // FIXED: onRefresh function
  const onRefresh = () => {
    setRefreshing(true);
    if (authToken && driverId) {
      fetchTransports(authToken, driverId);
    } else {
      // Fallback - try to reload everything
      const loadAndRefresh = async () => {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          const profileData = await fetchDriverProfile(token);
          const driverIdToUse = profileData?.id || driverId;
          await fetchTransports(token, driverIdToUse);
        } else {
          setRefreshing(false);
        }
      };
      loadAndRefresh();
    }
  };

  // ADD: Handle starting a transport
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
        'TI-AI ÎNSUȘIT CURSA CU SUCCES! DISPECERUL TĂU VA FI ANUNȚAT!',
        [{ text: 'OK' }]
      );
      
      setStartingTransport(null);
    }, 1000);
  };

  // ADD: Handle view details
  const handleViewDetails = (transport) => {
    // Navigate to details or implement details view
    console.log('View details for transport:', transport.id);
    // You can navigate to a details screen here
    // navigation.navigate('TransportDetails', { transport });
  };

  // ADD: Get status color
  const getStatusColor = (status) => {
    if (status === 'ok') return '#10B981'; // Green
    if (status === 'probleme' || status === 'not started') return '#F59E0B'; // Orange/amber
    return '#EF4444'; // Red for errors
  };

  // ADD: Get status icon
  const getStatusIcon = (status) => {
    if (status === 'ok') return 'checkmark-circle';
    if (status === 'probleme') return 'warning';
    if (status === 'not started') return 'time-outline';
    return 'alert-circle';
  };

  // FIXED: Error handling component
  const renderError = () => {
    if (!error) return null;
    
    return (
      <View style={styles.errorContainer}>
        <View style={styles.errorIconContainer}>
          <Ionicons name="alert-circle-outline" size={40} color="#EF4444" />
        </View>
        <Text style={styles.errorTitle}>Eroare la încărcarea transporturilor</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={onRefresh}
        >
          <Text style={styles.retryButtonText}>Încearcă din nou</Text>
          <Ionicons name="refresh" size={18} color="white" style={{marginLeft: 6}} />
        </TouchableOpacity>
      </View>
    );
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
        
        {error ? renderError() : (
          transports.length > 0 ? (
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
          )
        )}
      </View>
    </SafeAreaView>
  );
};

export default TransportsScreen;