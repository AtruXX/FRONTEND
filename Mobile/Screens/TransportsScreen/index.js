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
  RefreshControl,
  ScrollView,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './styles'; // Import your styles from the styles.js file
import { 
  useGetTransportsQuery, 
  useSetActiveTransportMutation 
} from '../../services/transportService';
import { useGetUserProfileQuery } from '../../services/profileService';

const TransportsScreen = ({ navigation, route }) => {
  const [startingTransport, setStartingTransport] = useState(null);

  // Use the transport service hooks
  const {
    data: transportsData,
    isLoading: transportsLoading,
    isFetching: transportsFetching,
    error: transportsError,
    refetch: refetchTransports
  } = useGetTransportsQuery();

  const {
    data: profileData,
    isLoading: profileLoading,
    isFetching: profileFetching,
    error: profileError,
    refetch: refetchProfile
  } = useGetUserProfileQuery();

  const [setActiveTransportMutation, { isLoading: isSettingActive }] = useSetActiveTransportMutation();

  // Extract data from hooks
  const transports = transportsData?.transports || [];
  const activeTransportId = profileData?.active_transport || null;
  const loading = transportsLoading || profileLoading;
  const refreshing = transportsFetching || profileFetching;
  const error = transportsError || profileError;

  // Refresh data
  const onRefresh = async () => {
    try {
      await Promise.all([
        refetchProfile(),
        refetchTransports()
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

  // Handle starting a transport
  const handleStartTransport = async (transport) => {
    // Prevent starting if there's already an active transport
    if (activeTransportId && activeTransportId !== transport.id) {
      Alert.alert(
        'Atenție',
        'Ai deja un transport activ. Nu poți începe un nou transport până nu finalizezi cel curent.',
        [{ text: 'OK' }]
      );
      return;
    }

    setStartingTransport(transport.id);
    
    try {
      await setActiveTransportMutation(transport.id).unwrap();
      
      Alert.alert(
        'Succes!',
        'TRANSPORT ÎNCEPUT CU SUCCES! DISPECERUL TĂU VA FI ANUNȚAT!',
        [{ text: 'OK' }]
      );

      // Refresh data to get updated active transport
      await onRefresh();
    } catch (error) {
      console.error('Error starting transport:', error);
      Alert.alert(
        'Eroare',
        'Nu s-a putut începe transportul. Încearcă din nou.',
        [{ text: 'OK' }]
      );
    } finally {
      setStartingTransport(null);
    }
  };

  // Handle view details
  const handleViewDetails = (transport) => {
    console.log('View details for transport:', transport.id);
    // TODO: Navigate to details screen when implemented
    // navigation.navigate('TransportDetails', { transport });
    
    Alert.alert(
      'Info',
      `Detalii pentru transportul #${transport.id}\n\nFuncționalitatea va fi implementată în curând.`,
      [{ text: 'OK' }]
    );
  };

  // Get status color
  const getStatusColor = (status) => {
    if (status === 'ok') return '#10B981'; // Green
    if (status === 'probleme' || status === 'not started') return '#F59E0B'; // Orange/amber
    return '#EF4444'; // Red for errors
  };

  // Get status icon
  const getStatusIcon = (status) => {
    if (status === 'ok') return 'checkmark-circle';
    if (status === 'probleme') return 'warning';
    if (status === 'not started') return 'time-outline';
    return 'alert-circle';
  };

  // Error handling component
  const renderError = () => {
    if (!error) return null;
    
    return (
      <View style={styles.errorContainer}>
        <View style={styles.errorIconContainer}>
          <Ionicons name="alert-circle-outline" size={40} color="#EF4444" />
        </View>
        <Text style={styles.errorTitle}>Eroare la încărcarea transporturilor</Text>
        <Text style={styles.errorText}>{error.message || error.toString()}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={onRefresh}
        >
          <Text style={styles.retryButtonText}>Încearcă din nou</Text>
          <Ionicons name="refresh" size={18} color="white" style={{marginLeft: 6}} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderTransportItem = ({ item }) => {
    const isActive = activeTransportId === item.id;
    const isStarting = startingTransport === item.id;
    const hasActiveTransport = activeTransportId !== null;
    const canStartTransport = !hasActiveTransport || isActive;

    return (
      <View style={[styles.transportCard, !canStartTransport && styles.disabledCard]}>
        <View style={styles.transportHeader}>
          <View>
            <Text style={styles.transportTitle}>Transport #{item.id}</Text>
            <Text style={styles.transportSubtitle}>{item.truck_combination}</Text>
            {item.destination && (
              <Text style={styles.destinationText}>
                <Ionicons name="mail-outline" size={14} color="#666" />
                {' '}{item.destination}
              </Text>
            )}
            {item.company && (
              <Text style={styles.destinationText}>
                <Ionicons name="business-outline" size={14} color="#666" />
                {' '}{item.company}
              </Text>
            )}
          </View>
          <TouchableOpacity 
            style={styles.modifyButton} 
            onPress={() => handleViewDetails(item)}
          >
            <Text style={styles.modifyButtonText}>Vezi detalii</Text>
            <Ionicons name="chevron-forward-outline" size={16} color="#6366F1" />
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
                  <Text style={[styles.statusText, {color: getStatusColor(item.status_truck)}]}>
                    {item.status_truck === 'not started' ? 'Neînceput' : item.status_truck || 'Neînceput'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Status marfă</Text>
                <View style={[styles.statusContainer, {backgroundColor: `${getStatusColor(item.status_goods)}15`}]}>
                  <Ionicons name={getStatusIcon(item.status_goods)} size={16} color={getStatusColor(item.status_goods)} style={styles.statusIcon} />
                  <Text style={[styles.statusText, {color: getStatusColor(item.status_goods)}]}>
                    {item.status_goods === 'not started' ? 'Neînceput' : item.status_goods || 'Neînceput'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Status remorcă</Text>
                <View style={[styles.statusContainer, {backgroundColor: `${getStatusColor(item.status_trailer_wagon)}15`}]}>
                  <Ionicons name={getStatusIcon(item.status_trailer_wagon)} size={16} color={getStatusColor(item.status_trailer_wagon)} style={styles.statusIcon} />
                  <Text style={[styles.statusText, {color: getStatusColor(item.status_trailer_wagon)}]}>
                    {item.status_trailer_wagon === 'not started' ? 'Neînceput' : item.status_trailer_wagon || 'Neînceput'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Status cuplare</Text>
                <View style={[styles.statusContainer, {backgroundColor: `${getStatusColor(item.status_coupling)}15`}]}>
                  <Ionicons name={getStatusIcon(item.status_coupling)} size={16} color={getStatusColor(item.status_coupling)} style={styles.statusIcon} />
                  <Text style={[styles.statusText, {color: getStatusColor(item.status_coupling)}]}>
                    {item.status_coupling === 'not started' ? 'Neînceput' : item.status_coupling || 'Neînceput'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Status încărcare</Text>
                <View style={[styles.statusContainer, {backgroundColor: `${getStatusColor(item.status_loaded_truck)}15`}]}>
                  <Ionicons name={getStatusIcon(item.status_loaded_truck)} size={16} color={getStatusColor(item.status_loaded_truck)} style={styles.statusIcon} />
                  <Text style={[styles.statusText, {color: getStatusColor(item.status_loaded_truck)}]}>
                    {item.status_loaded_truck === 'not started' ? 'Neînceput' : item.status_loaded_truck || 'Neînceput'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Status transport</Text>
                <View style={[styles.statusContainer, {backgroundColor: `${getStatusColor(item.status_transport)}15`}]}>
                  <Ionicons name={getStatusIcon(item.status_transport)} size={16} color={getStatusColor(item.status_transport)} style={styles.statusIcon} />
                  <Text style={[styles.statusText, {color: getStatusColor(item.status_transport)}]}>
                    {item.status_transport === 'not started' ? 'Neînceput' : item.status_transport || 'Neînceput'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Transport Action Button */}
        <View style={styles.actionSection}>
          {isActive ? (
            <View style={[styles.startButton, styles.activeButton]}>
              <Ionicons name="checkmark-circle" size={20} color="white" style={styles.buttonIcon} />
              <Text style={styles.startButtonText}>TRANSPORT ACTIV</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={[
                styles.startButton,
                !canStartTransport && styles.disabledButton
              ]}
              onPress={() => handleStartTransport(item)}
              disabled={!canStartTransport || isStarting || isSettingActive}
            >
              {isStarting || isSettingActive ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Ionicons name="play-circle" size={20} color="white" style={styles.buttonIcon} />
                  <Text style={styles.startButtonText}>
                    {canStartTransport ? "ÎNCEPE ACEST TRANSPORT" : "TRANSPORT BLOCAT"}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>Se încarcă transporturile...</Text>
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
          <Text style={styles.headerTitle}>Transporturile Atribuite</Text>
          <TouchableOpacity 
            style={styles.refreshIconButton}
            onPress={onRefresh}
            disabled={refreshing}
          >
            <Ionicons name="refresh" size={22} color="#6366F1" />
          </TouchableOpacity>
        </View>
        
        {error ? renderError() : (
          transports.length > 0 ? (
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
              <Text style={styles.emptyTitle}>Niciun transport atribuit</Text>
              <Text style={styles.emptyText}>Nu există transporturi atribuite în acest moment</Text>
              <TouchableOpacity
                style={styles.refreshButton}
                onPress={onRefresh}
                disabled={refreshing}
              >
                <Text style={styles.refreshButtonText}>Reîmprospătare</Text>
                <Ionicons name="refresh" size={18} color="white" style={{marginLeft: 6}} />
              </TouchableOpacity>
            </View>
          )
        )}
      </View>
    </SafeAreaView>
  );
};

export default TransportsScreen;