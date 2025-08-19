import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useGetUserProfileQuery } from '../../services/profileService';
import { useFinalizeTransportMutation } from '../../services/transportService';
import { useDownloadCMRDocumentMutation } from '../../services/CMRService';
import { styles } from './styles'; // Import your styles from the styles.js file
import PageHeader from "../../components/General/Header";
const TransportMainPage = ({ navigation }) => {
  // Get user profile to access active transport data
  const {
    data: profileData,
    isLoading: profileLoading,
    error: profileError,
    refetch: refetchProfile
  } = useGetUserProfileQuery();

  // Mutations
  const [finalizeTransport, { isLoading: isFinalizing }] = useFinalizeTransportMutation();
  const [downloadCMR, { isLoading: isDownloading }] = useDownloadCMRDocumentMutation();

  const activeTransportId = profileData?.active_transport;

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
      console.error('Download CMR error:', error);
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
              console.error('Finalize transport error:', error);
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

  // Generate UIT code based on active transport or profile data
  const generateUitCode = () => {
    if (activeTransportId) {
      return `TR-${activeTransportId}-RO`;
    }
    return `TR-${profileData?.id || '0000'}-RO`;
  };

  if (profileLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Ionicons name="hourglass-outline" size={40} color="#5A5BDE" />
          <Text style={styles.loadingText}>Se încarcă datele transportului...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!activeTransportId) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#373A56" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Transport actual</Text>
          <View style={{ width: 24 }} />
        </View>
        
        <View style={styles.emptyContainer}>
          <Ionicons name="truck-outline" size={60} color="#5A5BDE" />
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
  const handleRetry = useCallback(async () => {
  await refetchProfile();
}, [refetchProfile]);

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
          <Text style={styles.uitCode}>{generateUitCode()}</Text>
        </View>
        
        <View style={styles.selectionContainer}>
          <Text style={styles.selectionTitle}>Alegeți tipul de formular:</Text>
          
          {/* Vezi Ruta Button */}
          <TouchableOpacity
            style={[styles.selectionButton, { marginBottom: 20 }]}
            onPress={() => navigateTo('RouteView')}
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