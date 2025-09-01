import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, Platform } from 'react-native';
import * as Location from 'expo-location';
import Constants from 'expo-constants';
import { styles } from './styles';

let MapView, Marker, PROVIDER_GOOGLE;
let isNativeMapAvailable = false;

try {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
  PROVIDER_GOOGLE = Maps.PROVIDER_GOOGLE;
  isNativeMapAvailable = true;
} catch (error) {
  console.log('react-native-maps not available, using fallback');
  isNativeMapAvailable = false;
}

const RoutePrincipalScreen = () => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [mapRegion, setMapRegion] = useState({
    latitude: 44.4268, // Bucharest default coordinates
    longitude: 26.1025,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const googleMapsApiKey = Constants.expoConfig?.extra?.googleMapsApiKey;

  useEffect(() => {
    getLocationPermission();
  }, []);

  const getLocationPermission = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        Alert.alert(
          'Permisiuni locatie',
          'Pentru a afisa ruta, aplicatia are nevoie de acces la localizare.',
          [{ text: 'OK', style: 'default' }]
        );
        return;
      }

      getCurrentLocation();
    } catch (error) {
      console.error('Error requesting location permission:', error);
      setErrorMsg('Error requesting location permission');
    }
  };

  const getCurrentLocation = async () => {
    try {
      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      setLocation(location);
      setMapRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    } catch (error) {
      console.error('Error getting current location:', error);
      setErrorMsg('Unable to get current location');
    }
  };

  const handleRefreshLocation = () => {
    getCurrentLocation();
  };

  const handleMapPress = (event) => {
    const coordinate = event.nativeEvent.coordinate;
    console.log('Map pressed at:', coordinate);
  };

  const renderMap = () => {
    if (!isNativeMapAvailable) {
      return (
        <View style={[styles.map, styles.fallbackContainer]}>
          <Text style={styles.fallbackTitle}>📍 Harta</Text>
          <Text style={styles.fallbackText}>
            Pentru a vedea harta, te rog sa construiesti aplicatia sau sa folosesti Expo Development Client
          </Text>
          {location && (
            <View style={styles.locationInfo}>
              <Text style={styles.fallbackLocationTitle}>Locatia curenta:</Text>
              <Text style={styles.fallbackLocationText}>
                Lat: {location.coords.latitude.toFixed(6)}
              </Text>
              <Text style={styles.fallbackLocationText}>
                Lng: {location.coords.longitude.toFixed(6)}
              </Text>
            </View>
          )}
        </View>
      );
    }

    return (
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={mapRegion}
        onPress={handleMapPress}
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsCompass={true}
        showsScale={true}
        showsTraffic={false}
        mapType="standard"
        followsUserLocation={false}
        loadingEnabled={true}
      >
        {location && (
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="Locatia mea"
            description="Pozitia curenta"
            pinColor="red"
          />
        )}
      </MapView>
    );
  };

  if (!googleMapsApiKey) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Google Maps API key not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ruta Principala</Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={handleRefreshLocation}
        >
          <Text style={styles.refreshButtonText}>🔄</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.mapContainer}>
        {renderMap()}
      </View>

      {errorMsg && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorMsg}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={getLocationPermission}
          >
            <Text style={styles.retryButtonText}>Incearca din nou</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          Apasa pe harta pentru a selecta o destinatie
        </Text>
        {location && (
          <Text style={styles.coordinatesText}>
            Lat: {location.coords.latitude.toFixed(6)}, 
            Lng: {location.coords.longitude.toFixed(6)}
          </Text>
        )}
      </View>
    </View>
  );
};

export default RoutePrincipalScreen;