import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useGetUserProfileQuery } from '../../services/profileService';
import { useFinalizeTransportMutation, useGetTransportByIdQuery } from '../../services/transportService';
import { useDownloadCMRDocumentMutation, useGetCMRDataQuery } from '../../services/CMRService';
import { useLoading } from "../../components/General/loadingSpinner.js";
import { styles } from './styles'; // Import your styles from the styles.js file
import PageHeader from "../../components/General/Header";

const TransportMainPage = ({ navigation }) => {
  const { showLoading, hideLoading } = useLoading();
  
  // ALWAYS call hooks at the top level - never conditionally
  // Get user profile to access active transport data
  const {
    data: profileData,
    isLoading: profileLoading,
    error: profileError,
    refetch: refetchProfile
  } = useGetUserProfileQuery();

  // Mutations - always call these hooks
  const [finalizeTransport, { isLoading: isFinalizing }] = useFinalizeTransportMutation();
  const [downloadCMR, { isLoading: isDownloading }] = useDownloadCMRDocumentMutation();

  // FIXED: Get active transport ID from the correct path
  const activeTransportId = profileData?.active_transport;
  

  // Fetch full transport details - skip if no transportId OR profile is still loading
  const {
    data: transportData,
    isLoading: transportLoading,
    error: transportError,
    refetch: refetchTransport
  } = useGetTransportByIdQuery(activeTransportId, {
    skip: !activeTransportId || profileLoading || profileError
  });

  // Fetch CMR data to get UIT code
  const {
    data: cmrData,
    isLoading: cmrLoading,
    error: cmrError
  } = useGetCMRDataQuery(activeTransportId, {
    skip: !activeTransportId || profileLoading || profileError
  });

  // Update global loading state
  useEffect(() => {
    if (profileLoading || transportLoading || cmrLoading || isFinalizing || isDownloading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [profileLoading, transportLoading, cmrLoading, isFinalizing, isDownloading, showLoading, hideLoading]);

  const handleDownloadCMR = async () => {
    if (!activeTransportId) {
      Alert.alert('Eroare', 'Nu există un transport activ pentru descărcare.');
      return;
    }

    try {
      await downloadCMR(activeTransportId).unwrap();
      Alert.alert(
        'Descărcare CMR',
        'Descărcarea documentului CMR a început.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Eroare', 'Nu s-a putut descărca documentul CMR.');
    }
  };

  const handleFinalizeTransport = async () => {
    if (!activeTransportId) {
      Alert.alert('Eroare', 'Nu există un transport activ pentru finalizare.');
      return;
    }

    Alert.alert(
      'Finalizare Transport',
      'Sunteți sigur că doriți să finalizați transportul? Această acțiune nu poate fi anulată.',
      [
        {
          text: 'Anulează',
          style: 'cancel'
        },
        {
          text: 'Finalizează',
          style: 'destructive',
          onPress: async () => {
            try {
              await finalizeTransport(activeTransportId).unwrap();
              Alert.alert(
                'Transport Finalizat',
                'Transportul a fost finalizat cu succes!',
                [{ 
                  text: 'OK', 
                  onPress: () => {
                    refetchProfile(); // Refresh profile to update active transport
                    navigation.navigate('Home');
                  }
                }]
              );
            } catch (error) {
              Alert.alert('Eroare', 'Nu s-a putut finaliza transportul.');
            }
          }
        }
      ]
    );
  };

  const navigateTo = (screenName) => {
    navigation.navigate(screenName);
  };

  // Get UIT code from CMR data or show appropriate message
  const getUitCode = () => {
    // If CMR data is loading, show loading message
    if (cmrLoading) {
      return 'Se încarcă...';
    }

    // If CMR data failed to load or doesn't exist, show message
    if (cmrError || !cmrData) {
      return 'Nu există CMR';
    }

    // If UIT field exists and has value, show it
    if (cmrData.UIT && cmrData.UIT.trim() !== '') {
      return cmrData.UIT;
    }

    // If UIT field is empty, show message
    return 'UIT nu este completat';
  };

  const handleRetry = useCallback(async () => {
    await refetchProfile();
    if (refetchTransport) {
      await refetchTransport();
    }
  }, [refetchProfile, refetchTransport]);

  // Handle error state
  if (profileError) {
    return (
      <SafeAreaView style={styles.container}>
        <PageHeader
          title="CURSA ACTUALA"
          onBack={() => navigation.goBack()}
          onRetry={handleRetry}
          showRetry={true}
          showBack={true}
        />
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={60} color="#FF7285" />
          <Text style={styles.emptyTitle}>Eroare la încărcare</Text>
          <Text style={styles.emptyText}>Nu s-au putut încărca datele transportului</Text>
          <TouchableOpacity
            style={styles.backToHomeButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.backToHomeText}>Înapoi la pagina principală</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Handle no active transport
  if (!activeTransportId) {
    return (
      <SafeAreaView style={styles.container}>
        <PageHeader
          title="CURSA ACTUALA"
          onBack={() => navigation.goBack()}
          onRetry={handleRetry}
          showRetry={true}
          showBack={true}
        />
        
        <View style={styles.emptyContainer}>
          <Ionicons name="car-outline" size={60} color="#5A5BDE" />
          <Text style={styles.emptyTitle}>Niciun transport activ</Text>
          <Text style={styles.emptyText}>Nu aveți un transport activ asignat în acest moment</Text>
          <TouchableOpacity
            style={styles.backToHomeButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.backToHomeText}>Înapoi la pagina principală</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Main render - only reached if we have an active transport
  return (
    <SafeAreaView style={styles.container}>
      <PageHeader
        title="CURSA ACTUALA"
        onBack={() => navigation.goBack()}
        onRetry={handleRetry}
        showRetry={true}
        showBack={true}
      />
      
      <ScrollView 
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {/* UIT Code Information */}
        <View style={styles.uitCodeContainer}>
          <Text style={styles.uitLabel}>COD UIT:</Text>
          <Text style={styles.uitCode}>{getUitCode()}</Text>
        </View>
        
        <View style={styles.selectionContainer}>
          <Text style={styles.selectionTitle}>Alegeți tipul de formular:</Text>
          
          {/* Vezi Ruta Button */}
          <TouchableOpacity
            style={[styles.selectionButton, { marginBottom: 20 }]}
            onPress={() => navigateTo('RoutePrincipal')}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="map-outline" size={32} color="#FFFFFF" />
            </View>
            <Text style={styles.selectionButtonText}>Vezi Ruta</Text>
            <Text style={styles.selectionDescription}>
              Vizualizează ruta de transport și punctele de oprire
            </Text>
          </TouchableOpacity>
          
          {/* CMR Digital Button */}
          <TouchableOpacity
            style={[styles.selectionButton, { marginBottom: 20 }]}
            onPress={() => navigateTo('CMRDigitalForm')}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="document-text-outline" size={32} color="#FFFFFF" />
            </View>
            <Text style={styles.selectionButtonText}>CMR Digital</Text>
            <Text style={styles.selectionDescription}>
              Scrisoare de transport internațional de mărfuri (Expeditor, Destinatar, etc.)
            </Text>
          </TouchableOpacity>
          
          {/* Transport Status Button */}
          <TouchableOpacity
            style={[styles.selectionButton, { marginBottom: 20 }]}
            onPress={() => navigateTo('StatusTransportForm')}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="car-outline" size={32} color="#FFFFFF" />
            </View>
            <Text style={styles.selectionButtonText}>Status Transport</Text>
            <Text style={styles.selectionDescription}>
              Informații despre starea camionului, mărfii și a transportului
            </Text>
          </TouchableOpacity>

          {/* Photo CMR Button */}
          <TouchableOpacity
            style={[styles.selectionButton, { marginBottom: 20 }]}
            onPress={() => navigateTo('PhotoCMRForm')}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="camera-outline" size={32} color="#FFFFFF" />
            </View>
            <Text style={styles.selectionButtonText}>Fotografiază CMR-ul</Text>
            <Text style={styles.selectionDescription}>
              Încarcă o fotografie cu CMR-ul în format fizic
            </Text>
          </TouchableOpacity>

          {/* Download CMR Button */}
          <TouchableOpacity 
            style={styles.downloadButton} 
            onPress={handleDownloadCMR}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <Ionicons name="hourglass-outline" size={24} color="#FFFFFF" />
            ) : (
              <Ionicons name="cloud-download-outline" size={24} color="#FFFFFF" />
            )}
            <Text style={styles.downloadButtonText}>
              {isDownloading ? 'Se descarcă...' : 'Descarcă acum CMR-ul'}
            </Text>
          </TouchableOpacity>

          {/* Finalize Transport Button */}
          <TouchableOpacity 
            style={styles.finalizeButton} 
            onPress={handleFinalizeTransport}
            disabled={isFinalizing}
          >
            {isFinalizing ? (
              <Ionicons name="hourglass-outline" size={24} color="#FFFFFF" />
            ) : (
              <Ionicons name="checkmark-circle-outline" size={24} color="#FFFFFF" />
            )}
            <Text style={styles.finalizeButtonText}>
              {isFinalizing ? 'Se finalizează...' : 'FINALIZEAZĂ TRANSPORT'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TransportMainPage;