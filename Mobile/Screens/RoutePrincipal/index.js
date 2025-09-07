import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, Platform, Linking } from 'react-native';
import * as Location from 'expo-location';
import { styles } from './styles';

const RoutePrincipalScreen = () => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [mapRegion, setMapRegion] = useState({
    latitude: 44.4268, // Bucharest default coordinates
    longitude: 26.1025,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

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


  const openInGoogleMaps = () => {
    if (location) {
      const { latitude, longitude } = location.coords;
      const url = Platform.select({
        ios: `maps://app?saddr=${latitude},${longitude}`,
        android: `geo:${latitude},${longitude}?q=${latitude},${longitude}`,
      });
      const fallbackUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
      
      Linking.canOpenURL(url).then(supported => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Linking.openURL(fallbackUrl);
        }
      });
    }
  };

  const renderMap = () => {
    return (
      <View style={[styles.map, styles.fallbackContainer]}>
        <Text style={styles.fallbackTitle}>📍 Harta</Text>
        <Text style={styles.fallbackText}>
          Apasa pentru a deschide locatia in aplicatia de harti
        </Text>
        {location && (
          <TouchableOpacity onPress={openInGoogleMaps} style={styles.mapButton}>
            <View style={styles.locationInfo}>
              <Text style={styles.fallbackLocationTitle}>Locatia curenta:</Text>
              <Text style={styles.fallbackLocationText}>
                Lat: {location.coords.latitude.toFixed(6)}
              </Text>
              <Text style={styles.fallbackLocationText}>
                Lng: {location.coords.longitude.toFixed(6)}
              </Text>
              <Text style={styles.openMapText}>
                🗺️ Deschide in Google Maps
              </Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
    );
  };


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