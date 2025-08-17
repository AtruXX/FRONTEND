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
import { BASE_URL } from "../../utils/BASE_URL";

const TransportsScreen = ({ navigation, route }) => {
  const [transports, setTransports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [authToken, setAuthToken] = useState(null);
  const [error, setError] = useState(null);
  const [activeTransportId, setActiveTransportId] = useState(null);
  const [startingTransport, setStartingTransport] = useState(null);
  const [profileData, setProfileData] = useState({
    name: "",
    role: "",
    initials: "",
    id: "",
    on_road: false,
  });

  // Fetch driver profile
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
        on_road: data.driver?.on_road || false,
      });
      
      // Set active transport from profile
      const activeTransport = data.driver?.active_transport;
      if (activeTransport) {
        setActiveTransportId(activeTransport);
      } else {
        setActiveTransportId(null);
      }
      
      console.log('Driver profile loaded:', data.name, 'ID:', data.id);
      console.log('Active transport:', activeTransport);
      return data;
    } catch (error) {
      console.error('Error fetching driver profile:', error);
      return null;
    }
  };

  // Fetch transports
  const fetchTransports = async (token) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${BASE_URL}transports`, {
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
      console.log('Transports data:', data);
      
      // Filter only assigned transports ("atribuit" status)
      const assignedTransports = data.transports.filter(transport => 
        transport.status === 'atribuit' && !transport.is_finished
      );
      
      // Transform the API data to match the component structure
      const transformedTransports = assignedTransports.map(transport => ({
        id: transport.id,
        truck_combination: `Truck #${transport.truck} + Trailer #${transport.trailer}`,
        destination: transport.email_destinatar || 'N/A',
        status_truck: transport.status_truck || 'not started',
        status_goods: transport.status_goods || 'not started',
        status_trailer_wagon: transport.status_trailer || 'not started',
        status_transport: transport.status_transport || 'not started',
        status_coupling: transport.status_coupling || 'not started',
        status_loaded_truck: transport.status_loaded_truck || 'not started',
        departure_time: 'N/A', // Not provided in API
        arrival_time: 'N/A',   // Not provided in API
        distance: 'N/A',       // Not provided in API
        // Additional fields from API
        email_expeditor: transport.email_expeditor,
        email_destinatar: transport.email_destinatar,
        status: transport.status,
        is_finished: transport.is_finished,
        status_truck_problems: transport.status_truck_problems,
        status_trailer_description: transport.status_trailer_description,
        delay_estimation: transport.delay_estimation,
        company: transport.company,
        dispatcher: transport.dispatcher,
        driver: transport.driver,
        truck: transport.truck,
        trailer: transport.trailer,
        route: transport.route
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

  // Set active transport
  const setActiveTransport = async (transportId) => {
    try {
      const authToken = await AsyncStorage.getItem('authToken');
      if (!authToken) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${BASE_URL}set-active-transport/${transportId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Active transport set successfully:', data);
      
      // Update local state
      setActiveTransportId(transportId);
      
      return true;
    } catch (error) {
      console.error('Error setting active transport:', error);
      Alert.alert(
        'Eroare',
        'Nu s-a putut începe transportul. Încearcă din nou.',
        [{ text: 'OK' }]
      );
      return false;
    }
  };

  // Initialize data loading
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Loading auth token and data...');
        const token = await AsyncStorage.getItem('authToken');
        
        if (token) {
          setAuthToken(token);
          
          // Fetch profile first to get active transport
          await fetchDriverProfile(token);
          
          // Then fetch transports
          await fetchTransports(token);
        } else {
          console.error("No auth token found in AsyncStorage");
          setError("Authentication token not found");
          setLoading(false);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        setError("Error loading data");
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Refresh data
  const onRefresh = async () => {
    setRefreshing(true);
    
    try {
      const authToken = await AsyncStorage.getItem('authToken');
      if (authToken) {
        // Refresh profile first, then transports
        await fetchDriverProfile(authToken);
        await fetchTransports(authToken);
      } else {
        setError("Authentication token not found");
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
      setError("Error refreshing data");
    } finally {
      setRefreshing(false);
    }
  };

  // Handle starting a transport
  const handleStartTransport = async (transport) => {
    // Prevent starting if there's already an active transport
    if (activeTransportId && activeTransportId !== transport.id) {
      Alert.alert(
        'Atenție',
        'Ai deja un transport activ. Nu poți începe un nou transport până nu finalizezi cel curent.',
        [{ text: 'OK' }]
      );
      return;
    }

    setStartingTransport(transport.id);
    
    try {
      const success = await setActiveTransport(transport.id);
      
      if (success) {
        Alert.alert(
          'Succes!',
          'TRANSPORT ÎNCEPUT CU SUCCES! DISPECERUL TĂU VA FI ANUNȚAT!',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error starting transport:', error);
    } finally {
      setStartingTransport(null);
    }
  };

  // Handle view details
  const handleViewDetails = (transport) => {
    console.log('View details for transport:', transport.id);
    // TODO: Navigate to details screen when implemented
    // navigation.navigate('TransportDetails', { transport });
    
    Alert.alert(
      'Info',
      `Detalii pentru transportul #${transport.id}\n\nFuncționalitatea va fi implementată în curând.`,
      [{ text: 'OK' }]
    );
  };

  // Get status color
  const getStatusColor = (status) => {
    if (status === 'ok') return '#10B981'; // Green
    if (status === 'probleme' || status === 'not started') return '#F59E0B'; // Orange/amber
    return '#EF4444'; // Red for errors
  };

  // Get status icon
  const getStatusIcon = (status) => {
    if (status === 'ok') return 'checkmark-circle';
    if (status === 'probleme') return 'warning';
    if (status === 'not started') return 'time-outline';
    return 'alert-circle';
  };

  // Error handling component
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
    const hasActiveTransport = activeTransportId !== null;
    const canStartTransport = !hasActiveTransport || isActive;

    return (
      <View style={[styles.transportCard, !canStartTransport && styles.disabledCard]}>
        <View style={styles.transportHeader}>
          <View>
            <Text style={styles.transportTitle}>Transport #{item.id}</Text>
            <Text style={styles.transportSubtitle}>{item.truck_combination}</Text>
            {item.destination && (
              <Text style={styles.destinationText}>
                <Ionicons name="mail-outline" size={14} color="#666" />
                {' '}{item.destination}
              </Text>
            )}
            {item.company && (
              <Text style={styles.destinationText}>
                <Ionicons name="business-outline" size={14} color="#666" />
                {' '}{item.company}
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
                  <Text style={[styles.statusText, {color: getStatusColor(item.status_truck)}]}>
                    {item.status_truck === 'not started' ? 'Neînceput' : item.status_truck || 'Neînceput'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Status marfă</Text>
                <View style={[styles.statusContainer, {backgroundColor: `${getStatusColor(item.status_goods)}15`}]}>
                  <Ionicons name={getStatusIcon(item.status_goods)} size={16} color={getStatusColor(item.status_goods)} style={styles.statusIcon} />
                  <Text style={[styles.statusText, {color: getStatusColor(item.status_goods)}]}>
                    {item.status_goods === 'not started' ? 'Neînceput' : item.status_goods || 'Neînceput'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Status remorcă</Text>
                <View style={[styles.statusContainer, {backgroundColor: `${getStatusColor(item.status_trailer_wagon)}15`}]}>
                  <Ionicons name={getStatusIcon(item.status_trailer_wagon)} size={16} color={getStatusColor(item.status_trailer_wagon)} style={styles.statusIcon} />
                  <Text style={[styles.statusText, {color: getStatusColor(item.status_trailer_wagon)}]}>
                    {item.status_trailer_wagon === 'not started' ? 'Neînceput' : item.status_trailer_wagon || 'Neînceput'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Status cuplare</Text>
                <View style={[styles.statusContainer, {backgroundColor: `${getStatusColor(item.status_coupling)}15`}]}>
                  <Ionicons name={getStatusIcon(item.status_coupling)} size={16} color={getStatusColor(item.status_coupling)} style={styles.statusIcon} />
                  <Text style={[styles.statusText, {color: getStatusColor(item.status_coupling)}]}>
                    {item.status_coupling === 'not started' ? 'Neînceput' : item.status_coupling || 'Neînceput'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Status încărcare</Text>
                <View style={[styles.statusContainer, {backgroundColor: `${getStatusColor(item.status_loaded_truck)}15`}]}>
                  <Ionicons name={getStatusIcon(item.status_loaded_truck)} size={16} color={getStatusColor(item.status_loaded_truck)} style={styles.statusIcon} />
                  <Text style={[styles.statusText, {color: getStatusColor(item.status_loaded_truck)}]}>
                    {item.status_loaded_truck === 'not started' ? 'Neînceput' : item.status_loaded_truck || 'Neînceput'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Status transport</Text>
                <View style={[styles.statusContainer, {backgroundColor: `${getStatusColor(item.status_transport)}15`}]}>
                  <Ionicons name={getStatusIcon(item.status_transport)} size={16} color={getStatusColor(item.status_transport)} style={styles.statusIcon} />
                  <Text style={[styles.statusText, {color: getStatusColor(item.status_transport)}]}>
                    {item.status_transport === 'not started' ? 'Neînceput' : item.status_transport || 'Neînceput'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Transport Action Button */}
        <View style={styles.actionSection}>
          {isActive ? (
            <View style={[styles.startButton, styles.activeButton]}>
              <Ionicons name="checkmark-circle" size={20} color="white" style={styles.buttonIcon} />
              <Text style={styles.startButtonText}>TRANSPORT ACTIV</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={[
                styles.startButton,
                !canStartTransport && styles.disabledButton
              ]}
              onPress={() => handleStartTransport(item)}
              disabled={!canStartTransport || isStarting}
            >
              {isStarting ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Ionicons name="play-circle" size={20} color="white" style={styles.buttonIcon} />
                  <Text style={styles.startButtonText}>
                    {canStartTransport ? "ÎNCEPE ACEST TRANSPORT" : "TRANSPORT BLOCAT"}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}
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
          <Text style={styles.headerTitle}>Transporturile Atribuite</Text>
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
              <Text style={styles.emptyTitle}>Niciun transport atribuit</Text>
              <Text style={styles.emptyText}>Nu există transporturi atribuite în acest moment</Text>
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