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
  RefreshControl
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
  const [transportId, setTransportId] = useState(null);
  const BASE_URL = "https://atrux-717ecf8763ea.herokuapp.com/api/v0.1/";
  // Load auth token on component mount
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
          // Instead of showing an alert here, just keep loading state
        }
      } catch (error) {
        console.error("Error loading auth token:", error);
        setLoading(false);
        // Instead of showing an alert here, just keep loading state
      }
    };
    loadAuthToken();
  }, []);

;
  
  // Fetch latest transport when driverId or authToken changes
  useEffect(() => {
    if (authToken && driverId) {
      fetchLatestTransport(authToken, driverId);
    }
  }, [authToken, driverId]);
  
  const fetchLatestTransport = async (token, driverId) => {
    console.log("fetchLatestTransport called");
    console.log("Driver ID:", driverId);
    console.log("Token:", token);
    
    setLoading(true);
    try {
      const url = `${BASE_URL}transports/${driverId}`;
      console.log("Fetching URL:", url);
  
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Authorization": `Token ${token}`
        }
      });
  
      console.log("Fetch response status:", response.status);
  
      if (response.ok) {
        const transportData = await response.json();
        console.log("Raw transport data:", transportData);
  
        if (Array.isArray(transportData) && transportData.length > 0) {
          setTransports(transportData);
          const latestTransport = transportData[0];
          console.log("Latest transport found:", latestTransport);
  
          if (latestTransport.id) {
            console.log("Setting transport ID:", latestTransport.id);
            setTransportId(latestTransport.id);
          } else {
            console.warn("No transport ID found in the latest transport data.");
          }
        } else {
          console.warn("Transport data is empty or not an array.");
          setTransports([]);
        }
      } else {
        console.error("Fetch failed with status:", response.status);
        const errorText = await response.text();
        console.error("Error response text:", errorText);
        Alert.alert('Eroare', 'Nu s-a putut încărca lista de transporturi.');
      }
    } catch (error) {
      console.error("Transport fetch error:", error);
      Alert.alert('Eroare', 'Verificați conexiunea la internet.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  const onRefresh = () => {
    setRefreshing(true);
    if (authToken && driverId) {
      fetchLatestTransport(authToken, driverId);
    } else {
      setRefreshing(false);
    }
  };

  const handleModifyData = (transport) => {
    navigation.navigate('Transport_Update', { transport: transport });
  };

  const getStatusColor = (status) => {
    if (status === 'ok') return '#10B981'; // Green like statusIndicator in second file
    if (status === 'probleme') return '#F59E0B'; // Orange/amber color
    return '#EF4444'; // Red for errors
  };

  const getStatusIcon = (status) => {
    if (status === 'ok') return 'checkmark-circle';
    if (status === 'probleme') return 'warning';
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
          onPress={() => handleModifyData(item)}
        >
          <Text style={styles.modifyButtonText}>Modifică</Text>
          <Ionicons name="create-outline" size={16} color="#6366F1" />
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
                <Text style={[styles.statusText, {color: getStatusColor(item.status_transport)}]}>{item.status_transport || 'N/A'}</Text>
              </View>
            </View>
          </View>
        </View>
        
        <View style={styles.detailSection}>
          <View style={styles.sectionTitle}>
            <Ionicons name="information-circle" size={18} color="#6366F1" style={styles.sectionIcon} />
            <Text style={styles.sectionTitleText}>Detalii Transport</Text>
          </View>
          
          <View style={styles.detailGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Status cuplaj</Text>
              <Text style={styles.detailValue}>{item.status_coupling || 'N/A'}</Text>
            </View>
            
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Tip remorcă</Text>
              <Text style={styles.detailValue}>{item.trailer_type || 'N/A'}</Text>
            </View>
            
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Număr remorcă</Text>
              <Text style={styles.detailValue}>{item.trailer_number || 'N/A'}</Text>
            </View>
            
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Încărcare</Text>
              <Text style={styles.detailValue}>
                {item.status_loaded_truck === 'loaded' ? 'Încărcat' : 'Neîncărcat'}
              </Text>
            </View>
            
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Detracție</Text>
              <Text style={styles.detailValue}>{item.detraction || 'N/A'}</Text>
            </View>
            
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Dispecer ID</Text>
              <Text style={styles.detailValue}>{item.dispatcher || 'N/A'}</Text>
            </View>
          </View>
        </View>
        
        {item.status_truck_text && (
          <View style={styles.notesSection}>
            <View style={styles.sectionTitle}>
              <Ionicons name="document-text" size={18} color="#6366F1" style={styles.sectionIcon} />
              <Text style={styles.sectionTitleText}>Notă</Text>
            </View>
            <Text style={styles.noteText}>{item.status_truck_text}</Text>
          </View>
        )}
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