import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  ActivityIndicator, 
  SafeAreaView, 
  StatusBar, 
  Alert,
  TouchableOpacity
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const TrucksScreen = () => {
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  
  // Load auth token on component mount
  useEffect(() => {
    const getAuthToken = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          setAuthToken(token);
        } else {
          setError('Authentication required. Please log in first.');
        }
      } catch (err) {
        setError('Failed to load authentication token.');
      } finally {
        setLoading(false);
      }
    };
    getAuthToken();
  }, []);
  
  // Fetch trucks when token is available
  useEffect(() => {
    if (authToken) {
      fetchTrucks();
    }
  }, [authToken]);
  
  const fetchTrucks = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://atrux-717ecf8763ea.herokuapp.com/get_trucks/', {
        method: 'GET',
        headers: {
          'Authorization': `Token ${authToken}`,  
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setTrucks(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
      Alert.alert('Error', 'Failed to fetch trucks data');
      console.error('Error fetching trucks:', err);
    }
  };

  const getServiceStatus = (nextServiceDate) => {
    if (!nextServiceDate) return { status: 'unknown', color: '#9E9E9E' };
    
    const today = new Date();
    const serviceDate = new Date(nextServiceDate);
    const diffTime = serviceDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { status: 'overdue', color: '#F44336' };
    } else if (diffDays <= 7) {
      return { status: 'upcoming', color: '#FF9800' };
    } else {
      return { status: 'good', color: '#4CAF50' };
    }
  };

  const getTruckIcon = (make) => {
    const makeNormalized = make?.toLowerCase() || '';
    
    if (makeNormalized.includes('volvo')) {
      return 'truck';
    } else if (makeNormalized.includes('mercedes')) {
      return 'truck-delivery';
    } else if (makeNormalized.includes('scania')) {
      return 'truck-fast';
    } else {
      return 'truck-check';
    }
  };

  const getRandomColor = (id) => {
    const colors = [
      ['#3A1C71', '#D76D77', '#FFAF7B'],
      ['#00B4DB', '#0083B0', '#005F7F'],
      ['#134E5E', '#71B280', '#9BDC92'],
      ['#373B44', '#4286f4', '#9CECFB'],
      ['#8E2DE2', '#4A00E0', '#6E48AA'],
      ['#FF416C', '#FF4B2B', '#FFA07A']
    ];
    return colors[id % colors.length];
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  };

  const renderTruckItem = ({ item }) => {
    const gradientColors = getRandomColor(item.id);
    const serviceStatus = getServiceStatus(item.next_service_date);
    
    return (
      <View style={styles.truckCardContainer}>
        <View style={styles.truckCard}>
          <View style={styles.iconSection}>
            <LinearGradient
              colors={gradientColors}
              style={styles.iconGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <MaterialCommunityIcons name={getTruckIcon(item.make)} size={30} color="#FFFFFF" />
            </LinearGradient>
            <View style={styles.plateContainer}>
              <Text style={styles.plateText}>{item.license_plate}</Text>
            </View>
          </View>
          
          <View style={styles.truckInfo}>
            <View style={styles.truckHeader}>
              <Text style={styles.truckMakeModel}>{item.make} {item.model}</Text>
              <Text style={styles.truckYear}>{item.year}</Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.detailsContainer}>
              <View style={styles.detailRow}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>VIN</Text>
                  <Text style={styles.detailValue}>{item.vin || 'Not specified'}</Text>
                </View>
              </View>
              
              <View style={styles.detailRow}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Last Service</Text>
                  <Text style={styles.detailValue}>{formatDate(item.last_service_date)}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Next Service</Text>
                  <Text style={[styles.detailValue, { color: serviceStatus.color }]}>
                    {formatDate(item.next_service_date)}
                  </Text>
                </View>
              </View>
              
              <View style={[styles.serviceStatusBar, { backgroundColor: serviceStatus.color + '20' }]}>
                <View style={styles.serviceStatusDot}>
                  <View style={[styles.statusDot, { backgroundColor: serviceStatus.color }]} />
                </View>
                <Text style={[styles.serviceStatusText, { color: serviceStatus.color }]}>
                  {serviceStatus.status === 'good' && 'Service up to date'}
                  {serviceStatus.status === 'upcoming' && 'Service due soon'}
                  {serviceStatus.status === 'overdue' && 'Service overdue'}
                  {serviceStatus.status === 'unknown' && 'Service status unknown'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.headerCard}>
      <Text style={styles.headerTitle}>Fleet</Text>
      <Text style={styles.headerSubtitle}>
        {trucks.length} vehicles in fleet
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <View style={styles.loadingCard}>
          <ActivityIndicator size="large" color="#6E78F7" />
          <Text style={styles.loadingText}>Loading trucks...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <View style={styles.errorCard}>
          <Text style={styles.errorTitle}>Oops!</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => authToken && fetchTrucks()}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {trucks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No Trucks Found</Text>
            <Text style={styles.emptyText}>There are currently no trucks registered in the system.</Text>
            <TouchableOpacity style={styles.refreshButton} onPress={fetchTrucks}>
              <Text style={styles.refreshButtonText}>Refresh</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <FlatList
          data={trucks}
          renderItem={renderTruckItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          ListHeaderComponent={renderHeader}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ECEFF1',
  },
  headerCard: {
    marginHorizontal: 20,
    marginVertical: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#A7A9AF',
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#303F9F',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#7986CB',
  },
  listContainer: {
    paddingBottom: 20,
  },
  truckCardContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  truckCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    shadowColor: '#A7A9AF',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  iconSection: {
    marginRight: 16,
    alignItems: 'center',
  },
  iconGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plateContainer: {
    backgroundColor: '#303F9F',
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: 8,
    marginTop: 6,
  },
  plateText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 10,
  },
  truckInfo: {
    flex: 1,
  },
  truckHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  truckMakeModel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#303F9F',
  },
  truckYear: {
    fontSize: 14,
    color: '#7986CB',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 8,
  },
  detailsContainer: {
    flex: 1,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#9E9E9E',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    color: '#424242',
    fontWeight: '500',
  },
  serviceStatusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginTop: 4,
  },
  serviceStatusDot: {
    marginRight: 8,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  serviceStatusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ECEFF1',
    padding: 20,
  },
  loadingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#A7A9AF',
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    width: '80%',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#5C6BC0',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ECEFF1',
    padding: 20,
  },
  errorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#A7A9AF',
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    width: '80%',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F44336',
    marginBottom: 12,
  },
  errorText: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#3F51B5',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#A7A9AF',
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    width: '80%',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#5C6BC0',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    marginBottom: 24,
  },
  refreshButton: {
    backgroundColor: '#3F51B5',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default TrucksScreen;