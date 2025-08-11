import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  RefreshControl,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { styles } from './styles'; // Import your styles from the styles.js file
import { BASE_URL } from "../../utils/BASE_URL";

const TruckDetailsScreen = ({ navigation, route }) => {
  const [truckDetails, setTruckDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [authToken, setAuthToken] = useState(null);
  const [driverId, setDriverId] = useState(route.params?.driverId || 1);

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
          // Once we have the token, fetch driver profile or use driverId from route params
          if (!route.params?.driverId) {
            fetchDriverProfile(token);
          } else {
            fetchTruckDetails(token, route.params.driverId);
          }
        } else {
          console.error("No auth token found in AsyncStorage");
          setLoading(false);
          Alert.alert('Eroare', 'Sesiune expirată. Vă rugăm să vă autentificați din nou.');
        }
      } catch (error) {
        console.error("Error loading auth token:", error);
        setLoading(false);
        Alert.alert('Eroare', 'Nu s-a putut încărca token-ul de autentificare.');
      }
    };
    
    loadAuthToken();
  }, []);

  const fetchDriverProfile = async (token) => {
    try {
      const response = await fetch('https://atrux-717ecf8763ea.herokuapp.com/api/driver/profile/', {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`
        }
      });

      if (response.ok) {
        const profileData = await response.json();
        setDriverId(profileData.id);
        fetchTruckDetails(token, profileData.id);
      } else {
        console.error("Failed to fetch driver profile");
        setLoading(false);
        Alert.alert('Eroare', 'Nu s-a putut încărca profilul șoferului.');
      }
    } catch (error) {
      console.error("Error fetching driver profile:", error);
      setLoading(false);
      Alert.alert('Eroare', 'Verificați conexiunea la internet.');
    }
  };

  const fetchTruckDetails = async (token, driverId) => {
    setLoading(true);
    try {
      // This is a placeholder URL. Replace with your actual API endpoint
      const url = `https://atrux-717ecf8763ea.herokuapp.com/api/truck/details/${driverId}/`;
      console.log("Fetching URL:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Authorization": `Token ${token}`
        }
      });

      if (response.ok) {
        const truckData = await response.json();
        console.log("Truck data received:", truckData);
        setTruckDetails(truckData);
      } else {
        console.error("Fetch failed with status:", response.status);
        // For demo purposes, set mock data if API doesn't exist
        setTruckDetails({
          id: 'T-1234',
          number: 'BV-99-TRK',
          model: 'Volvo FH16',
          last_revision_date: '2025-03-15',
          next_revision_date: '2025-09-15',
          expirations: [
            {
              id: 1,
              document_type: 'Asigurare RCA',
              expiry_date: '2025-08-10',
              status: 'valid' // valid, warning, expired
            },
            {
              id: 2,
              document_type: 'Verificare tehnică',
              expiry_date: '2025-05-22',
              status: 'warning' // less than 30 days
            },
            {
              id: 3,
              document_type: 'Licență transport',
              expiry_date: '2025-12-31',
              status: 'valid'
            },
            {
              id: 4,
              document_type: 'Tahograf',
              expiry_date: '2025-04-01',
              status: 'expired'
            }
          ],
          specifications: {
            engine: 'D16K 750 CP',
            fuel_tank: '700 litri',
            transmission: 'I-Shift',
            max_weight: '44 tone'
          },
          maintenance_history: [
            {
              id: 1,
              date: '2025-03-15',
              type: 'Revizie completă',
              description: 'Schimb ulei, filtre, verificare sisteme',
              mileage: '125000 km'
            },
            {
              id: 2,
              date: '2024-11-10',
              type: 'Reparație',
              description: 'Înlocuire plăcuțe frână',
              mileage: '110000 km'
            }
          ]
        });
        Alert.alert('Notă', 'Se folosesc date demonstrative pentru camion.');
      }
    } catch (error) {
      console.error("Truck details fetch error:", error);
      Alert.alert('Eroare', 'Verificați conexiunea la internet.');
      
      // Set mock data for demo purposes
      setTruckDetails({
        id: 'T-1234',
        number: 'BV-99-TRK',
        model: 'Volvo FH16',
        last_revision_date: '2025-03-15',
        next_revision_date: '2025-09-15',
        expirations: [
          {
            id: 1,
            document_type: 'Asigurare RCA',
            expiry_date: '2025-08-10',
            status: 'valid' // valid, warning, expired
          },
          {
            id: 2,
            document_type: 'Verificare tehnică',
            expiry_date: '2025-05-22',
            status: 'warning' // less than 30 days
          },
          {
            id: 3,
            document_type: 'Licență transport',
            expiry_date: '2025-12-31',
            status: 'valid'
          },
          {
            id: 4,
            document_type: 'Tahograf',
            expiry_date: '2025-04-01',
            status: 'expired'
          }
        ],
        specifications: {
          engine: 'D16K 750 CP',
          fuel_tank: '700 litri',
          transmission: 'I-Shift',
          max_weight: '44 tone'
        },
        maintenance_history: [
          {
            id: 1,
            date: '2025-03-15',
            type: 'Revizie completă',
            description: 'Schimb ulei, filtre, verificare sisteme',
            mileage: '125000 km'
          },
          {
            id: 2,
            date: '2024-11-10',
            type: 'Reparație',
            description: 'Înlocuire plăcuțe frână',
            mileage: '110000 km'
          }
        ]
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    if (authToken && driverId) {
      fetchTruckDetails(authToken, driverId);
    } else {
      setRefreshing(false);
    }
  };

  // FIXED: Improved back button handler with multiple fallback options
  const handleBackPress = () => {
    try {
      // Method 1: Try to go back if possible
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        // Method 2: Navigate to a specific screen if can't go back
        navigation.navigate('Home'); // Replace 'Home' with your main screen name
        // Alternative: navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
      }
    } catch (error) {
      console.error('Navigation error:', error);
      // Method 3: Fallback - try to pop to top
      try {
        navigation.popToTop();
      } catch (fallbackError) {
        console.error('Fallback navigation error:', fallbackError);
        // Method 4: Last resort - reset navigation stack
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }], // Replace with your main screen
        });
      }
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('ro-RO', options);
  };

  const getDaysUntilExpiry = (dateString) => {
    const expiryDate = new Date(dateString);
    const today = new Date();
    const diffTime = expiryDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getExpiryStatusColor = (status) => {
    if (status === 'valid') return '#10B981'; // Green
    if (status === 'warning') return '#F59E0B'; // Orange/amber
    return '#EF4444'; // Red for expired
  };

  const getExpiryStatusText = (status, daysLeft) => {
    if (status === 'expired') return 'Expirat';
    if (status === 'warning') return `Expiră în ${daysLeft} zile`;
    return 'Valid';
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>Se încarcă detaliile camionului...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={[styles.backButton, { 
              // FIXED: Ensure proper touch target size and styling
              minWidth: 44, 
              minHeight: 44, 
              justifyContent: 'center', 
              alignItems: 'center' 
            }]}
            onPress={handleBackPress}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} // Increase touch area
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalii Camion</Text>
          <TouchableOpacity 
            style={[styles.refreshIconButton, {
              minWidth: 44,
              minHeight: 44,
              justifyContent: 'center',
              alignItems: 'center'
            }]}
            onPress={onRefresh}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="refresh" size={22} color="#6366F1" />
          </TouchableOpacity>
        </View>

        {truckDetails ? (
          <ScrollView 
            contentContainerStyle={styles.scrollContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#6366F1']}
              />
            }
          >
            {/* Truck Overview Card */}
            <View style={styles.truckOverviewCard}>
              <View style={styles.truckImageContainer}>
                {/* Placeholder for truck image */}
                <View style={styles.truckIconContainer}>
                  <Ionicons name="truck" size={48} color="#6366F1" />
                </View>
              </View>
              <View style={styles.truckInfoContainer}>
                <Text style={styles.truckModel}>{truckDetails.model}</Text>
                <Text style={styles.truckNumber}>{truckDetails.number}</Text>
                <View style={styles.truckIdContainer}>
                  <Ionicons name="barcode-outline" size={16} color="#666" />
                  <Text style={styles.truckIdText}>ID: {truckDetails.id}</Text>
                </View>
              </View>
            </View>

            {/* Revizii Card */}
            <View style={styles.detailCard}>
              <View style={styles.cardHeader}>
                <Ionicons name="calendar" size={20} color="#6366F1" />
                <Text style={styles.cardTitle}>Ultima Revizie</Text>
              </View>
              <View style={styles.cardContent}>
                <View style={styles.revisionDetails}>
                  <View style={styles.dateCircle}>
                    <Text style={styles.dateDay}>
                      {new Date(truckDetails.last_revision_date).getDate()}
                    </Text>
                    <Text style={styles.dateMonth}>
                      {new Date(truckDetails.last_revision_date).toLocaleString('ro-RO', { month: 'short' })}
                    </Text>
                  </View>
                  <View style={styles.revisionInfo}>
                    <Text style={styles.revisionDate}>
                      {formatDate(truckDetails.last_revision_date)}
                    </Text>
                    {truckDetails.maintenance_history && truckDetails.maintenance_history.length > 0 && (
                      <>
                        <Text style={styles.revisionType}>
                          {truckDetails.maintenance_history[0].type}
                        </Text>
                        <Text style={styles.revisionMileage}>
                          Kilometraj: {truckDetails.maintenance_history[0].mileage}
                        </Text>
                      </>
                    )}
                  </View>
                </View>
                <View style={styles.divider}></View>
                <View style={styles.nextRevisionContainer}>
                  <Text style={styles.nextRevisionLabel}>Următoarea revizie:</Text>
                  <Text style={styles.nextRevisionDate}>
                    {formatDate(truckDetails.next_revision_date)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Important Expiration Dates */}
            <View style={styles.detailCard}>
              <View style={styles.cardHeader}>
                <Ionicons name="alert-circle" size={20} color="#6366F1" />
                <Text style={styles.cardTitle}>Date Importante Expirare</Text>
              </View>
              <View style={styles.cardContent}>
                {truckDetails.expirations && truckDetails.expirations.map((item) => {
                  const daysLeft = getDaysUntilExpiry(item.expiry_date);
                  return (
                    <View key={item.id} style={styles.expirationItem}>
                      <View style={styles.expirationDetails}>
                        <Text style={styles.expirationTitle}>{item.document_type}</Text>
                        <Text style={styles.expirationDate}>
                          Expiră la: {formatDate(item.expiry_date)}
                        </Text>
                      </View>
                      <View 
                        style={[
                          styles.expirationStatus, 
                          {backgroundColor: `${getExpiryStatusColor(item.status)}15`}
                        ]}
                      >
                        <Text 
                          style={[
                            styles.expirationStatusText, 
                            {color: getExpiryStatusColor(item.status)}
                          ]}
                        >
                          {getExpiryStatusText(item.status, daysLeft)}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Technical Specifications */}
            <View style={styles.detailCard}>
              <View style={styles.cardHeader}>
                <Ionicons name="construct" size={20} color="#6366F1" />
                <Text style={styles.cardTitle}>Specificații Tehnice</Text>
              </View>
              <View style={styles.cardContent}>
                <View style={styles.specificationsGrid}>
                  {truckDetails.specifications && Object.entries(truckDetails.specifications).map(([key, value], index) => (
                    <View key={index} style={styles.specificationItem}>
                      <Text style={styles.specificationLabel}>
                        {key === 'engine' ? 'Motor' : 
                         key === 'fuel_tank' ? 'Rezervor' : 
                         key === 'transmission' ? 'Transmisie' : 
                         key === 'max_weight' ? 'Greutate Max' : key}
                      </Text>
                      <Text style={styles.specificationValue}>{value}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            {/* Maintenance History */}
            <View style={styles.detailCard}>
              <View style={styles.cardHeader}>
                <Ionicons name="time" size={20} color="#6366F1" />
                <Text style={styles.cardTitle}>Istoric Mentenanță</Text>
              </View>
              <View style={styles.cardContent}>
                {truckDetails.maintenance_history && truckDetails.maintenance_history.map((item) => (
                  <View key={item.id} style={styles.maintenanceItem}>
                    <View style={styles.maintenanceDate}>
                      <Text style={styles.maintenanceDateText}>
                        {formatDate(item.date)}
                      </Text>
                    </View>
                    <View style={styles.maintenanceDetails}>
                      <Text style={styles.maintenanceType}>{item.type}</Text>
                      <Text style={styles.maintenanceDescription}>{item.description}</Text>
                      <Text style={styles.maintenanceMileage}>Kilometraj: {item.mileage}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>
        ) : (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="truck-outline" size={40} color="#6366F1" />
            </View>
            <Text style={styles.emptyTitle}>Nicio informație găsită</Text>
            <Text style={styles.emptyText}>Nu există detalii disponibile pentru acest camion</Text>
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

export default TruckDetailsScreen;