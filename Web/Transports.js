import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Convert your TransportManager logic to a React component
const TransportsScreen = ({ navigation, route }) => {
  const [transports, setTransports] = useState([]);
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
  
  // Fetch transports when token is available
  useEffect(() => {
    if (authToken) {
      fetchTransports();
    }
  }, [authToken]);
  
  const fetchTransports = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        'https://atrux-717ecf8763ea.herokuapp.com/list_transports/', 
        {
          method: 'GET',
          headers: {
            'Authorization': `Token ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      
      const data = await response.json();
      setTransports(data);
    } catch (err) {
      console.error('Failed to fetch transports:', err);
      setError('Could not load transports. ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleEditTransport = (transport) => {
    // Navigate to edit screen with transport data
    navigation.navigate('Transport_Update', { transport });
  };
  
  // Render a single transport item
  const renderTransportItem = ({ item }) => (
    <View style={styles.transportCard}>
      <View style={styles.transportHeader}>
        <Text style={styles.transportTitle}>Transport #{item.id}</Text>
        <TouchableOpacity 
          style={styles.modifyButton} 
          onPress={() => handleEditTransport(item)}
        >
          <Text style={styles.modifyButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.transportDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Driver:</Text>
          <Text style={styles.detailValue}>{item.driver}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Truck:</Text>
          <Text style={styles.detailValue}>{item.truck || 'None'}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Trailer:</Text>
          <Text style={styles.detailValue}>{item.trailer || 'None'}</Text>
        </View>
        
        {/* Add the rest of your transport details here */}
        {/* Similar to what you had in your TransportManager.createTransportHTML */}
      </View>
    </View>
  );
  
  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading transports...</Text>
      </SafeAreaView>
    );
  }
  
  if (error) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={fetchTransports}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Transports</Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={fetchTransports}
        >
          <Ionicons name="refresh" size={24} color="#333" />
        </TouchableOpacity>
      </View>
      
      {transports.length > 0 ? (
        <FlatList
          data={transports}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderTransportItem}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No transports available</Text>
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
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
  },
  backButton: {
    padding: 8,
  },
  refreshButton: {
    padding: 8,
  },
  listContainer: {
    padding: 16,
  },
  transportCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  transportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    padding: 12,
  },
  transportTitle: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modifyButton: {
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
  },
  modifyButtonText: {
    color: '#3B82F6',
    fontWeight: '500',
  },
  transportDetails: {
    padding: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    color: '#666',
    flex: 1,
  },
  detailValue: {
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
  },
  errorText: {
    color: 'red',
    marginBottom: 16,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default TransportsScreen;