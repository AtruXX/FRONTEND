import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MapService } from '../../services/mapService';

/**
 * Example component showing how the route page displays location data
 * This demonstrates the new UI without requiring actual transport data
 */
const RouteExample = () => {
  // Sample route data based on your Berlin to Zurich route
  const sampleLocations = [
    {
      id: 0,
      latitude: 52.5168,
      longitude: 13.4037,
      city: 'Berlin',
      street: 'Unter den Linden',
      region: 'Berlin',
      country: 'Germany',
      formattedAddress: 'Unter den Linden, Berlin, Germany',
      isStart: true,
      isEnd: false
    },
    {
      id: 1,
      latitude: 51.3397,
      longitude: 12.3731,
      city: 'Leipzig',
      street: 'Augustusplatz',
      region: 'Sachsen',
      country: 'Germany',
      formattedAddress: 'Augustusplatz, Leipzig, Sachsen, Germany',
      isStart: false,
      isEnd: false
    },
    {
      id: 2,
      latitude: 50.9375,
      longitude: 11.5893,
      city: 'Jena',
      street: 'Markt',
      region: 'Thüringen',
      country: 'Germany',
      formattedAddress: 'Markt, Jena, Thüringen, Germany',
      isStart: false,
      isEnd: false
    },
    {
      id: 3,
      latitude: 50.1109,
      longitude: 8.6821,
      city: 'Frankfurt am Main',
      street: 'Römerberg',
      region: 'Hessen',
      country: 'Germany',
      formattedAddress: 'Römerberg, Frankfurt am Main, Hessen, Germany',
      isStart: false,
      isEnd: false
    },
    {
      id: 4,
      latitude: 48.7758,
      longitude: 9.1829,
      city: 'Stuttgart',
      street: 'Schlossplatz',
      region: 'Baden-Württemberg',
      country: 'Germany',
      formattedAddress: 'Schlossplatz, Stuttgart, Baden-Württemberg, Germany',
      isStart: false,
      isEnd: false
    },
    {
      id: 5,
      latitude: 47.9990,
      longitude: 7.8421,
      city: 'Freiburg im Breisgau',
      street: 'Münsterplatz',
      region: 'Baden-Württemberg',
      country: 'Germany',
      formattedAddress: 'Münsterplatz, Freiburg im Breisgau, Germany',
      isStart: false,
      isEnd: false
    },
    {
      id: 6,
      latitude: 47.3769,
      longitude: 8.5417,
      city: 'Zürich',
      street: 'Bahnhofstrasse',
      region: 'Zürich',
      country: 'Switzerland',
      formattedAddress: 'Bahnhofstrasse, Zürich, Switzerland',
      isStart: false,
      isEnd: true
    }
  ];

  const routeInfo = {
    totalDistance: '380.5',
    travelTime: '6h 20m'
  };

  const handleOpenLocation = (location) => {
    MapService.openLocationInMaps(location, location.city);
  };

  const handleOpenFullRoute = () => {
    MapService.showMapOptions(sampleLocations);
  };

  const renderLocationCard = (location, index, total) => {
    const getLocationIcon = () => {
      if (location.isStart) return 'play-circle';
      if (location.isEnd) return 'checkmark-circle';
      return 'location';
    };
    
    const getLocationColor = () => {
      if (location.isStart) return '#4CAF50';
      if (location.isEnd) return '#FF5722';
      return '#5A5BDE';
    };
    
    return (
      <TouchableOpacity
        key={location.id}
        style={styles.locationCard}
        onPress={() => handleOpenLocation(location)}
        activeOpacity={0.7}
      >
        <View style={styles.locationCardContent}>
          <View style={styles.locationIconContainer}>
            <Ionicons
              name={getLocationIcon()}
              size={24}
              color={getLocationColor()}
            />
            {index < total - 1 && <View style={styles.routeLine} />}
          </View>
          
          <View style={styles.locationInfo}>
            <View style={styles.locationHeader}>
              <Text style={styles.locationNumber}>
                {location.isStart ? 'START' : location.isEnd ? 'DESTINAȚIE' : `OPRIRE ${index}`}
              </Text>
              <TouchableOpacity
                style={styles.openMapButton}
                onPress={() => handleOpenLocation(location)}
              >
                <Ionicons name="map" size={16} color="#5A5BDE" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.locationCity}>
              {location.city || 'Locație necunoscută'}
            </Text>
            
            {location.formattedAddress && location.formattedAddress !== 'Adresă necunoscută' && (
              <Text style={styles.locationAddress}>
                {location.formattedAddress}
              </Text>
            )}
            
            <Text style={styles.locationCoordinates}>
              {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>🚛 Route Preview Example</Text>
      <Text style={styles.subtitle}>Berlin → Zürich Transport Route</Text>
      
      {/* Route Info */}
      <View style={styles.routeInfoContainer}>
        <View style={styles.routeInfoRow}>
          <View style={styles.routeInfoItem}>
            <Ionicons name="speedometer" size={20} color="#5A5BDE" />
            <Text style={styles.routeInfoLabel}>Distanță</Text>
            <Text style={styles.routeInfoValue}>{routeInfo.totalDistance} km</Text>
          </View>
          
          <View style={styles.routeInfoItem}>
            <Ionicons name="time" size={20} color="#5A5BDE" />
            <Text style={styles.routeInfoLabel}>Timp estimat</Text>
            <Text style={styles.routeInfoValue}>{routeInfo.travelTime}</Text>
          </View>
        </View>
      </View>

      {/* Locations */}
      <View style={styles.locationsContainer}>
        <View style={styles.locationsHeader}>
          <Text style={styles.locationsTitle}>Puncte de pe rută</Text>
          <TouchableOpacity
            style={styles.openFullRouteButton}
            onPress={handleOpenFullRoute}
          >
            <Ionicons name="navigate" size={16} color="#FFFFFF" />
            <Text style={styles.openFullRouteText}>Navigează</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.locationsList}>
          {sampleLocations.map((location, index) =>
            renderLocationCard(location, index, sampleLocations.length)
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    color: '#666',
  },
  routeInfoContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  routeInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  routeInfoItem: {
    alignItems: 'center',
    flex: 1,
  },
  routeInfoLabel: {
    fontSize: 12,
    color: '#666666',
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  routeInfoValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
  },
  locationsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  locationsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  locationsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  openFullRouteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5A5BDE',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  openFullRouteText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  locationsList: {
    paddingBottom: 8,
  },
  locationCard: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  locationCardContent: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  locationIconContainer: {
    alignItems: 'center',
    marginRight: 16,
    position: 'relative',
  },
  routeLine: {
    width: 2,
    height: 40,
    backgroundColor: '#e0e0e0',
    position: 'absolute',
    top: 32,
    left: 11,
  },
  locationInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationNumber: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#5A5BDE',
    backgroundColor: '#f0f0ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  openMapButton: {
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 20,
  },
  locationCity: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
    lineHeight: 20,
  },
  locationCoordinates: {
    fontSize: 12,
    color: '#999999',
    fontFamily: 'monospace',
  },
};

export default RouteExample;