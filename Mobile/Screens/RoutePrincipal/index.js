import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useGetUserProfileQuery } from '../../services/profileService';
import { useGetTransportByIdQuery } from '../../services/transportService';
import { RouteService } from '../../services/routeService';
import { MapService } from '../../services/mapService';
import { useLoading } from '../../components/General/loadingSpinner.js';
import PageHeader from '../../components/General/Header';
import { styles } from './styles';

const RoutePrincipalScreen = ({ navigation }) => {
  const { showLoading, hideLoading } = useLoading();
  const [routeData, setRouteData] = useState(null);
  const [processingRoute, setProcessingRoute] = useState(false);
  const [error, setError] = useState(null);
  
  // Get user profile to access active transport data
  const {
    data: profileData,
    isLoading: profileLoading,
    error: profileError
  } = useGetUserProfileQuery();
  
  // Get active transport ID
  const activeTransportId = profileData?.active_transport;
  
  // Fetch transport details with route data
  const {
    data: transportData,
    isLoading: transportLoading,
    error: transportError
  } = useGetTransportByIdQuery(activeTransportId, { 
    skip: !activeTransportId || profileLoading || profileError 
  });

  useEffect(() => {
    if (profileLoading || transportLoading || processingRoute) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [profileLoading, transportLoading, processingRoute, showLoading, hideLoading]);
  
  useEffect(() => {
    processTransportRoute();
  }, [transportData]);

  const processTransportRoute = async () => {
    if (!transportData?.route) return;
    
    setProcessingRoute(true);
    setError(null);
    
    try {
      // Request location permission for reverse geocoding
      let { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setError('Pentru a afișa numele locațiilor, aplicația are nevoie de acces la localizare.');
        // Still process route without geocoding
        const basicRoute = await RouteService.processRouteData(transportData.route);
        setRouteData(basicRoute);
        setProcessingRoute(false);
        return;
      }
      
      // Process route with full geocoding
      const processedRoute = await RouteService.processRouteData(transportData.route);
      setRouteData(processedRoute);
    } catch (error) {
      console.error('Error processing route:', error);
      setError('Eroare la procesarea rutei. Vă rugăm să încercați din nou.');
    } finally {
      setProcessingRoute(false);
    }
  };

  const handleOpenFullRoute = () => {
    if (!routeData?.locations) {
      Alert.alert('Eroare', 'Nu sunt disponibile date despre rută.');
      return;
    }
    
    MapService.showMapOptions(routeData.locations);
  };

  const handleOpenLocation = (location) => {
    MapService.openLocationInMaps(location, location.city);
  };


  const handleRefresh = () => {
    processTransportRoute();
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
  
  const renderRouteInfo = () => {
    if (!routeData) return null;
    
    return (
      <View style={styles.routeInfoContainer}>
        <View style={styles.routeInfoRow}>
          <View style={styles.routeInfoItem}>
            <Ionicons name="speedometer" size={20} color="#5A5BDE" />
            <Text style={styles.routeInfoLabel}>Distanță</Text>
            <Text style={styles.routeInfoValue}>{routeData.totalDistance} km</Text>
          </View>
          
          <View style={styles.routeInfoItem}>
            <Ionicons name="time" size={20} color="#5A5BDE" />
            <Text style={styles.routeInfoLabel}>Timp estimat</Text>
            <Text style={styles.routeInfoValue}>{routeData.travelTime}</Text>
          </View>
        </View>
      </View>
    );
  };


  // Handle no active transport
  if (!activeTransportId) {
    return (
      <SafeAreaView style={styles.container}>
        <PageHeader
          title="RUTA TRANSPORT"
          onBack={() => navigation.goBack()}
          showBack={true}
        />
        
        <View style={styles.emptyContainer}>
          <Ionicons name="car-outline" size={60} color="#5A5BDE" />
          <Text style={styles.emptyTitle}>Niciun transport activ</Text>
          <Text style={styles.emptyText}>Nu aveți un transport activ asignat în acest moment</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  // Handle errors
  if (profileError || transportError) {
    return (
      <SafeAreaView style={styles.container}>
        <PageHeader
          title="RUTA TRANSPORT"
          onBack={() => navigation.goBack()}
          onRetry={handleRefresh}
          showRetry={true}
          showBack={true}
        />
        
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={60} color="#FF7285" />
          <Text style={styles.emptyTitle}>Eroare la încărcare</Text>
          <Text style={styles.emptyText}>Nu s-au putut încărca datele rutei</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  // Handle no route data
  if (!transportData?.route) {
    return (
      <SafeAreaView style={styles.container}>
        <PageHeader
          title="RUTA TRANSPORT"
          onBack={() => navigation.goBack()}
          showBack={true}
        />
        
        <View style={styles.emptyContainer}>
          <Ionicons name="map-outline" size={60} color="#5A5BDE" />
          <Text style={styles.emptyTitle}>Rută indisponibilă</Text>
          <Text style={styles.emptyText}>Nu sunt disponibile informații despre rută pentru acest transport</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <PageHeader
        title="RUTA TRANSPORT"
        onBack={() => navigation.goBack()}
        onRetry={handleRefresh}
        showRetry={true}
        showBack={true}
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {error && (
          <View style={styles.errorBanner}>
            <Ionicons name="warning" size={20} color="#FF7285" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        
        {renderRouteInfo()}
        
        {routeData?.locations && (
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
              {routeData.locations.map((location, index) =>
                renderLocationCard(location, index, routeData.locations.length)
              )}
            </View>
          </View>
        )}
        
        {processingRoute && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#5A5BDE" />
            <Text style={styles.loadingText}>Se procesează ruta...</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default RoutePrincipalScreen;