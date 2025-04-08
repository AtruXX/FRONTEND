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


const TransportsScreen = ({ navigation, route }) => {
  const [transports, setTransports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [authToken, setAuthToken] = useState(null);
  const [driverId, setDriverId] = useState(route.params?.driverId || 1);
  const [transportId, setTransportId] = useState(null);
  
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
      const url = `https://atrux-717ecf8763ea.herokuapp.com/latest_n_transports/5/${driverId}/`;
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

  const renderStatusIcon = (status) => {
    if (status === 'ok') {
      return <Ionicons name="checkmark-circle" size={20} color="green" />;
    } else if (status === 'probleme') {
      return <Ionicons name="warning" size={20} color="orange" />;
    } else {
      return <Ionicons name="alert-circle" size={20} color="red" />;
    }
  };

  const renderTransportItem = ({ item }) => (
    <View style={styles.transportCard}>
    <View style={styles.transportHeader}>
      <Text style={styles.transportTitle}>Transport #{item.id}</Text>
      <TouchableOpacity 
        style={styles.modifyButton} 
        onPress={() => handleModifyData(item)}  // Make sure you're passing the entire item
      >
        <Text style={styles.modifyButtonText}>Modifică</Text>
      </TouchableOpacity>
    </View>
      
      <View style={styles.transportDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Combinație camion:</Text>
          <Text style={styles.detailValue}>{item.truck_combination || 'N/A'}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Status camion:</Text>
          <View style={styles.statusContainer}>
            {renderStatusIcon(item.status_truck)}
            <Text style={styles.detailValue}>{item.status_truck || 'N/A'}</Text>
          </View>
        </View>
        
        {item.status_truck_text && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Detalii status camion:</Text>
            <Text style={styles.detailValue}>{item.status_truck_text}</Text>
          </View>
        )}
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Status marfă:</Text>
          <View style={styles.statusContainer}>
            {renderStatusIcon(item.status_goods)}
            <Text style={styles.detailValue}>{item.status_goods || 'N/A'}</Text>
          </View>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Status cuplaj:</Text>
          <Text style={styles.detailValue}>{item.status_coupling || 'N/A'}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Tip remorcă:</Text>
          <Text style={styles.detailValue}>{item.trailer_type || 'N/A'}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Număr remorcă:</Text>
          <Text style={styles.detailValue}>{item.trailer_number || 'N/A'}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Status remorcă:</Text>
          <View style={styles.statusContainer}>
            {renderStatusIcon(item.status_trailer_wagon)}
            <Text style={styles.detailValue}>{item.status_trailer_wagon || 'N/A'}</Text>
          </View>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Status încărcare:</Text>
          <Text style={styles.detailValue}>
            {item.status_loaded_truck === 'loaded' ? 'Încărcat' : 'Neîncărcat'}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Detracție:</Text>
          <Text style={styles.detailValue}>{item.detraction || 'N/A'}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Status transport:</Text>
          <View style={styles.statusContainer}>
            {renderStatusIcon(item.status_transport)}
            <Text style={styles.detailValue}>{item.status_transport || 'N/A'}</Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Dispecer ID:</Text>
          <Text style={styles.detailValue}>{item.dispatcher || 'N/A'}</Text>
        </View>
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Se încarcă transporturile...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transporturile Mele</Text>
        <View style={{ width: 24 }} />
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
              colors={['#3B82F6']}
            />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="car-outline" size={60} color="#ccc" />
          <Text style={styles.emptyText}>Nu există transporturi disponibile</Text>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={onRefresh}
          >
            <Text style={styles.refreshButtonText}>Reîmprospătare</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  backButton: {
    padding: 8,
  },
  listContainer: {
    padding: 16,
  },
  transportCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  transportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#3B82F6',
  },
  transportTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  modifyButton: {
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  modifyButtonText: {
    color: '#3B82F6',
    fontWeight: 'bold',
    fontSize: 14,
  },
  transportDetails: {
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 15,
    color: '#666',
    flex: 1,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    marginBottom: 20,
    textAlign: 'center',
  },
  refreshButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default TransportsScreen;