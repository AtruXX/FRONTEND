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
  TouchableOpacity,
  Image
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

const DriversScreen = () => {
  const [drivers, setDrivers] = useState([]);
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
  
  // Fetch drivers when token is available
  useEffect(() => {
    if (authToken) {
      fetchDrivers();
    }
  }, [authToken]);
  
  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://atrux-717ecf8763ea.herokuapp.com/get_drivers', {
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
      setDrivers(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
      Alert.alert('Error', 'Failed to fetch drivers data');
      console.error('Error fetching drivers:', err);
    }
  };

  const getDriverInitials = (name) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getRandomColor = (id) => {
    const colors = [
      ['#FF9966', '#FF5E62'],
      ['#36D1DC', '#5B86E5'],
      ['#CB356B', '#BD3F32'],
      ['#3A1C71', '#D76D77'],
      ['#00B4DB', '#0083B0'],
      ['#FEAC5E', '#C779D0'],
      ['#43C6AC', '#191654'],
      ['#834D9B', '#D04ED6']
    ];
    return colors[id % colors.length];
  };

  const renderDriverItem = ({ item }) => {
    const gradientColors = getRandomColor(item.id);
    
    return (
      <View style={styles.driverCardContainer}>
        <View style={styles.driverCard}>
          <View style={styles.avatarSection}>
            <LinearGradient
              colors={gradientColors}
              style={styles.avatarGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.avatarText}>{getDriverInitials(item.name)}</Text>
            </LinearGradient>
            <View style={styles.statusIndicator}>
              <View style={[styles.statusDot, { backgroundColor: item.on_road ? '#4CAF50' : '#FF5722' }]} />
            </View>
          </View>
          
          <View style={styles.driverInfo}>
            <Text style={styles.driverName}>{item.name || 'Unknown Name'}</Text>
            {item.email && <Text style={styles.driverEmail}>{item.email}</Text>}
            
            <View style={styles.divider} />
            
            <View style={styles.detailRow}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Company</Text>
                <Text style={styles.detailValue}>{item.company || 'Not specified'}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Rating</Text>
                <View style={styles.ratingContainer}>
                  <Text style={styles.ratingValue}>{item.rating.toFixed(1)}</Text>
                  <Text style={styles.ratingMax}>/5.0</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.detailRow}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Status</Text>
                <Text style={[styles.detailValue, { color: item.on_road ? '#4CAF50' : '#FF5722' }]}>
                  {item.on_road ? 'On Road' : 'Available'}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Role</Text>
                <Text style={styles.detailValue}>
                  {item.is_driver && item.is_dispatcher ? 'Driver & Dispatcher' : 
                   item.is_driver ? 'Driver' : 
                   item.is_dispatcher ? 'Dispatcher' : 'Unknown'}
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
      <Text style={styles.headerTitle}>Drivers</Text>
      <Text style={styles.headerSubtitle}>
        {drivers.length} active drivers
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <View style={styles.loadingCard}>
          <ActivityIndicator size="large" color="#6E78F7" />
          <Text style={styles.loadingText}>Loading drivers...</Text>
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
          <TouchableOpacity style={styles.retryButton} onPress={() => authToken && fetchDrivers()}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {drivers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No Drivers Found</Text>
            <Text style={styles.emptyText}>There are currently no drivers available in the system.</Text>
            <TouchableOpacity style={styles.refreshButton} onPress={fetchDrivers}>
              <Text style={styles.refreshButtonText}>Refresh</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <FlatList
          data={drivers}
          renderItem={renderDriverItem}
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
  driverCardContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  driverCard: {
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
  avatarSection: {
    marginRight: 16,
    position: 'relative',
  },
  avatarGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  statusIndicator: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 2,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#303F9F',
    marginBottom: 2,
  },
  driverEmail: {
    fontSize: 14,
    color: '#7986CB',
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 8,
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
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  ratingValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFC107',
  },
  ratingMax: {
    fontSize: 12,
    color: '#BDBDBD',
    marginLeft: 2,
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

export default DriversScreen;