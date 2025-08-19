// TransportsScreen/index.js - Updated with useLoading
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './styles';
import { 
  useGetTransportsQuery, 
  useSetActiveTransportMutation 
} from '../../services/transportService';
import { useGetUserProfileQuery } from '../../services/profileService';
import { useLoading } from "../../components/General/loadingSpinner.js";
import PageHeader from "../../components/General/Header";

// Memoized components for better performance
const TransportStatusIndicator = React.memo(({ status }) => {
  const getStatusColor = useCallback((status) => {
    if (status === 'ok') return '#10B981';
    if (status === 'probleme' || status === 'not started') return '#F59E0B';
    return '#EF4444';
  }, []);

  const getStatusIcon = useCallback((status) => {
    if (status === 'ok') return 'checkmark-circle';
    if (status === 'probleme') return 'warning';
    if (status === 'not started') return 'time-outline';
    return 'alert-circle';
  }, []);

  const statusColor = getStatusColor(status);
  const statusIcon = getStatusIcon(status);
  const statusText = status === 'not started' ? 'Neînceput' : status || 'Neînceput';

  return (
    <View style={[styles.statusContainer, {backgroundColor: `${statusColor}15`}]}>
      <Ionicons name={statusIcon} size={16} color={statusColor} style={styles.statusIcon} />
      <Text style={[styles.statusText, {color: statusColor}]}>
        {statusText}
      </Text>
    </View>
  );
});

const TransportHeader = React.memo(({ transport, onViewDetails, canStartTransport }) => (
  <View style={styles.transportHeader}>
    <View>
      <Text style={styles.transportTitle}>Transport #{transport.id}</Text>
      <Text style={styles.transportSubtitle}>{transport.truck_combination}</Text>
      {transport.destination && (
        <Text style={styles.destinationText}>
          <Ionicons name="mail-outline" size={14} color="#666" />
          {' '}{transport.destination}
        </Text>
      )}
      {transport.company && (
        <Text style={styles.destinationText}>
          <Ionicons name="business-outline" size={14} color="#666" />
          {' '}{transport.company}
        </Text>
      )}
    </View>
    <TouchableOpacity 
      style={styles.modifyButton} 
      onPress={onViewDetails}
    >
      <Text style={styles.modifyButtonText}>Vezi detalii</Text>
      <Ionicons name="chevron-forward-outline" size={16} color="#6366F1" />
    </TouchableOpacity>
  </View>
));

const TransportDetails = React.memo(({ transport }) => {
  const statusFields = useMemo(() => [
    { key: 'status_truck', label: 'Status camion' },
    { key: 'status_goods', label: 'Status marfă' },
    { key: 'status_trailer_wagon', label: 'Status remorcă' },
    { key: 'status_coupling', label: 'Status cuplare' },
    { key: 'status_loaded_truck', label: 'Status încărcare' },
    { key: 'status_transport', label: 'Status transport' },
  ], []);

  return (
    <View style={styles.transportDetails}>
      <View style={styles.detailSection}>
        <View style={styles.sectionTitle}>
          <Ionicons name="car" size={18} color="#6366F1" style={styles.sectionIcon} />
          <Text style={styles.sectionTitleText}>Status Transport</Text>
        </View>
        
        <View style={styles.detailGrid}>
          {statusFields.map((field) => (
            <View key={field.key} style={styles.detailItem}>
              <Text style={styles.detailLabel}>{field.label}</Text>
              <TransportStatusIndicator status={transport[field.key]} />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
});

const TransportActionButton = React.memo(({ 
  transport, 
  isActive, 
  canStartTransport, 
  isStarting, 
  isSettingActive, 
  onStartTransport 
}) => {
  if (isActive) {
    return (
      <View style={[styles.startButton, styles.activeButton]}>
        <Ionicons name="checkmark-circle" size={20} color="white" style={styles.buttonIcon} />
        <Text style={styles.startButtonText}>TRANSPORT ACTIV</Text>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={[
        styles.startButton,
        !canStartTransport && styles.disabledButton
      ]}
      onPress={() => onStartTransport(transport)}
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
  );
});

const TransportItem = React.memo(({ 
  item, 
  activeTransportId, 
  hasActiveTransport, 
  startingTransport, 
  isSettingActive, 
  onStartTransport, 
  onViewDetails 
}) => {
  const isActive = activeTransportId === item.id;
  const isStarting = startingTransport === item.id;
  const canStartTransport = !hasActiveTransport || isActive;

  return (
    <View style={[styles.transportCard, !canStartTransport && styles.disabledCard]}>
      <TransportHeader 
        transport={item}
        onViewDetails={() => onViewDetails(item)}
        canStartTransport={canStartTransport}
      />
      
      <TransportDetails transport={item} />

      <View style={styles.actionSection}>
        <TransportActionButton
          transport={item}
          isActive={isActive}
          canStartTransport={canStartTransport}
          isStarting={isStarting}
          isSettingActive={isSettingActive}
          onStartTransport={onStartTransport}
        />
      </View>
    </View>
  );
});

const EmptyState = React.memo(({ onRefresh, refreshing }) => (
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
));

const ErrorState = React.memo(({ error, onRefresh }) => (
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
));

const TransportsScreen = React.memo(({ navigation, route }) => {
  const { showLoading, hideLoading } = useLoading();
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

  // Update global loading state
  useEffect(() => {
    if (transportsLoading || profileLoading || isSettingActive) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [transportsLoading, profileLoading, isSettingActive, showLoading, hideLoading]);

  // Memoized data extraction
  const { transports, activeTransportId, loading, refreshing, error } = useMemo(() => ({
    transports: transportsData?.transports || [],
    activeTransportId: profileData?.active_transport || null,
    loading: transportsLoading || profileLoading,
    refreshing: transportsFetching || profileFetching,
    error: transportsError || profileError
  }), [transportsData, profileData, transportsLoading, profileLoading, transportsFetching, profileFetching, transportsError, profileError]);

  // Memoized handlers
  const onRefresh = useCallback(async () => {
    try {
      await Promise.all([
        refetchProfile(),
        refetchTransports()
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  }, [refetchProfile, refetchTransports]);

  const handleRetry = useCallback(async () => {
    try {
      await Promise.all([
        refetchProfile(),
        refetchTransports()
      ]);
    } catch (error) {
      console.error('Error during retry:', error);
    }
  }, [refetchProfile, refetchTransports]);

  const handleStartTransport = useCallback(async (transport) => {
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
  }, [activeTransportId, setActiveTransportMutation, onRefresh]);

  const handleViewDetails = useCallback((transport) => {
    console.log('View details for transport:', transport.id);
    Alert.alert(
      'Info',
      `Detalii pentru transportul #${transport.id}\n\nFuncționalitatea va fi implementată în curând.`,
      [{ text: 'OK' }]
    );
  }, []);

  // Memoized render functions
  const renderTransportItem = useCallback(({ item }) => (
    <TransportItem
      item={item}
      activeTransportId={activeTransportId}
      hasActiveTransport={activeTransportId !== null}
      startingTransport={startingTransport}
      isSettingActive={isSettingActive}
      onStartTransport={handleStartTransport}
      onViewDetails={handleViewDetails}
    />
  ), [activeTransportId, startingTransport, isSettingActive, handleStartTransport, handleViewDetails]);

  const keyExtractor = useCallback((item) => item.id.toString(), []);

  const getItemLayout = useCallback((data, index) => ({
    length: 300, // Approximate item height
    offset: 300 * index,
    index,
  }), []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <PageHeader
          title="TRANSPORTURI"
          onBack={() => navigation.goBack()}
          onRetry={handleRetry}
          showRetry={true}
          showBack={true}
        />
        
        {error ? (
          <ErrorState error={error} onRefresh={onRefresh} />
        ) : transports.length > 0 ? (
          <FlatList
            data={transports}
            keyExtractor={keyExtractor}
            renderItem={renderTransportItem}
            getItemLayout={getItemLayout}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#6366F1']}
              />
            }
            // Performance optimizations
            removeClippedSubviews={true}
            maxToRenderPerBatch={5}
            updateCellsBatchingPeriod={50}
            initialNumToRender={10}
            windowSize={10}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <EmptyState onRefresh={onRefresh} refreshing={refreshing} />
        )}
      </View>
    </SafeAreaView>
  );
});

TransportsScreen.displayName = 'TransportsScreen';

export default TransportsScreen;