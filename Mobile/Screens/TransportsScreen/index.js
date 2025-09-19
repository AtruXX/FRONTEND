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
  useGetDriverTransportsQuery,
  useSetActiveTransportMutation
} from '../../services/transportService';
import { useGetUserProfileQuery } from '../../services/profileService';
import { useLoading } from "../../components/General/loadingSpinner.js";
import PageHeader from "../../components/General/Header";
import TransportDetailsModal from "../../components/TransportDetailsModal";

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
  onStartTransport,
  isCompleted = false
}) => {
  if (isCompleted) {
    return (
      <View style={[styles.startButton, styles.completedButton]}>
        <Ionicons name="checkmark-done-circle" size={20} color="white" style={styles.buttonIcon} />
        <Text style={styles.startButtonText}>TRANSPORT FINALIZAT</Text>
      </View>
    );
  }

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
  onViewDetails,
  activeTab
}) => {
  const isActive = activeTransportId === item.id;
  const isStarting = startingTransport === item.id;
  const canStartTransport = !hasActiveTransport || isActive;
  const isCompleted = activeTab === 'completed' || item.is_finished;

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
          isCompleted={isCompleted}
        />
      </View>
    </View>
  );
});

const EmptyState = React.memo(({ onRefresh, refreshing, activeTab }) => (
  <View style={styles.emptyContainer}>
    <View style={styles.emptyIconContainer}>
      <Ionicons
        name={activeTab === 'active' ? "car-outline" : "checkmark-done-circle-outline"}
        size={40}
        color="#6366F1"
      />
    </View>
    <Text style={styles.emptyTitle}>
      {activeTab === 'active' ? 'Niciun transport activ' : 'Niciun transport finalizat'}
    </Text>
    <Text style={styles.emptyText}>
      {activeTab === 'active'
        ? 'Nu există transporturi active atribuite în acest moment'
        : 'Nu ai finalizat încă niciun transport'
      }
    </Text>
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
    <Text style={styles.errorText}>
      {error.message?.includes('401')
        ? 'Sesiunea a expirat. Te rugăm să te autentifici din nou.'
        : error.message?.includes('404')
        ? 'Endpoint-ul pentru transporturi nu a fost găsit.'
        : error.message?.includes('500')
        ? 'Eroare server. Te rugăm să încerci din nou mai târziu.'
        : error.message || 'Nu s-au putut încărca transporturile'}
    </Text>
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
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'completed'
  const [selectedTransport, setSelectedTransport] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Use the transport service hooks
  const {
    data: transportsData,
    isLoading: transportsLoading,
    isFetching: transportsFetching,
    error: transportsError,
    refetch: refetchTransports
  } = useGetDriverTransportsQuery();

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
  const { transports, activeTransportId, loading, refreshing, error, stats } = useMemo(() => {
    const currentTransports = activeTab === 'active'
      ? transportsData?.activeTransports || []
      : transportsData?.completedTransports || [];

    return {
      transports: currentTransports,
      activeTransportId: profileData?.active_transport || null,
      loading: transportsLoading || profileLoading,
      refreshing: transportsFetching || profileFetching,
      error: transportsError || profileError,
      stats: {
        active: transportsData?.activeCount || 0,
        completed: transportsData?.completedCount || 0,
        total: transportsData?.totalTransports || 0
      }
    };
  }, [activeTab, transportsData, profileData, transportsLoading, profileLoading, transportsFetching, profileFetching, transportsError, profileError]);

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
    setSelectedTransport(transport);
    setModalVisible(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
    setSelectedTransport(null);
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
      activeTab={activeTab}
    />
  ), [activeTransportId, startingTransport, isSettingActive, handleStartTransport, handleViewDetails, activeTab]);

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
          title="TRANSPORTURILE MELE"
          onBack={() => navigation.goBack()}
          onRetry={handleRetry}
          showRetry={true}
          showBack={true}
        />

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'active' && styles.activeTab]}
            onPress={() => setActiveTab('active')}
          >
            <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>
              Active ({stats.active})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'completed' && styles.activeTab]}
            onPress={() => setActiveTab('completed')}
          >
            <Text style={[styles.tabText, activeTab === 'completed' && styles.activeTabText]}>
              Finalizate ({stats.completed})
            </Text>
          </TouchableOpacity>
        </View>
        
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
          <EmptyState onRefresh={onRefresh} refreshing={refreshing} activeTab={activeTab} />
        )}

        {/* Transport Details Modal */}
        <TransportDetailsModal
          visible={modalVisible}
          transport={selectedTransport}
          onClose={handleCloseModal}
        />
      </View>
    </SafeAreaView>
  );
});

TransportsScreen.displayName = 'TransportsScreen';

export default TransportsScreen;