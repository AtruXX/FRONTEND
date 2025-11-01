import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, Alert, Modal, TextInput, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useGetUserProfileQuery } from '../../services/profileService';
import { useFinalizeTransportMutation, useGetTransportByIdQuery, useGetDriverQueueQuery } from '../../services/transportService';
import { useDownloadCMRDocumentMutation, useGetCMRDataQuery, useUpdateCMRDataMutation, useGetCMRStatusQuery, useGetCMRCompleteQuery } from '../../services/CMRService';
import { MapService } from '../../services/mapService';
import { styles } from './styles'; // Import your styles from the styles.js file
import PageHeader from "../../components/General/Header";
const TransportMainPage = ({ navigation }) => {
  // UIT edit modal state
  const [showUitModal, setShowUitModal] = useState(false);
  const [uitInput, setUitInput] = useState('');
  // CMR photos modal state
  const [showCMRPhotosModal, setShowCMRPhotosModal] = useState(false);
  const [selectedPhotoForView, setSelectedPhotoForView] = useState(null);
  // ALWAYS call hooks at the top level - never conditionally
  // Get user profile to access active transport data
  const {
    data: profileData,
    isLoading: profileLoading,
    error: profileError,
    refetch: refetchProfile
  } = useGetUserProfileQuery();
  // Queue system hook to get current transport
  const {
    data: queueData,
    isLoading: queueLoading,
    error: queueError,
    refetch: refetchQueue
  } = useGetDriverQueueQuery();
  // Mutations - always call these hooks
  const [finalizeTransport, { isLoading: isFinalizing }] = useFinalizeTransportMutation();
  const [downloadCMR, { isLoading: isDownloading }] = useDownloadCMRDocumentMutation();
  const [updateCMRData, { isLoading: isUpdatingCMR }] = useUpdateCMRDataMutation();
  // SMART: Get active transport ID with intelligent fallback logic
  const getActiveTransportId = () => {
    // If queue loading or has error, skip queue checks and use profile
    if (queueLoading || queueError) {
      if (profileData?.active_transport) {
        return profileData.active_transport;
      }
      return null;
    }
    // Priority 1: Queue system current transport
    if (queueData?.current_transport_id) {
      return queueData.current_transport_id;
    }
    // Priority 2: Profile active transport (legacy system)
    if (profileData?.active_transport) {
      return profileData.active_transport;
    }
    // Priority 3: Check if queue has properly ordered transports and use first one
    if (queueData?.queue && queueData.queue.length > 0) {
      // Find transport with position 1 or lowest position
      const sortedQueue = [...queueData.queue].sort((a, b) => a.queue_position - b.queue_position);
      const firstTransport = sortedQueue[0];
      // If positions are properly set (>= 1) and can start, use it
      if (firstTransport.queue_position >= 1 && firstTransport.can_start) {
        return firstTransport.transport_id;
      }
      // ENHANCED FALLBACK: If queue positions are malformed (0, 0, 0) but we have transports,
      // try to find a transport that's actually startable or in progress
      const startableTransport = sortedQueue.find(t => t.can_start || t.is_current);
      if (startableTransport) {
        return startableTransport.transport_id;
      }
      // Last resort: use first transport but log warning
      if (sortedQueue.length > 0) {
        return firstTransport.transport_id;
      }
    }
    return null;
  };
  const activeTransportId = getActiveTransportId();

  // Fetch full transport details - skip if no transportId OR profile/queue is still loading
  const {
    data: transportData,
    isLoading: transportLoading,
    error: transportError,
    refetch: refetchTransport
  } = useGetTransportByIdQuery(activeTransportId, {
    skip: !activeTransportId || profileLoading || queueLoading || profileError
  });
  // Fetch CMR data to get UIT code
  const {
    data: cmrData,
    isLoading: cmrLoading,
    error: cmrError,
    refetch: refetchCMR
  } = useGetCMRDataQuery(activeTransportId, {
    skip: !activeTransportId || profileLoading || queueLoading || profileError
  });
  // Fetch CMR status to check for photos and digital CMR
  const {
    data: cmrStatus,
    isLoading: cmrStatusLoading,
    error: cmrStatusError,
    refetch: refetchCMRStatus
  } = useGetCMRStatusQuery(activeTransportId, {
    skip: !activeTransportId || profileLoading || queueLoading || profileError
  });
  // Fetch complete CMR data including physical photos
  const {
    data: cmrCompleteData,
    isLoading: cmrCompleteLoading,
    refetch: refetchCMRComplete
  } = useGetCMRCompleteQuery(activeTransportId, {
    skip: !activeTransportId || profileLoading || queueLoading || profileError
  });
  const handleDownloadCMR = async () => {
    if (!activeTransportId) {
      Alert.alert('Eroare', 'Nu există un transport activ pentru descărcare.');
      return;
    }
    // Check if digital CMR exists before attempting download
    if (!cmrStatus?.has_digital_cmr && !cmrStatus?.has_physical_cmr) {
      Alert.alert(
        'CMR nu există',
        'Nu există un document CMR disponibil pentru descărcare. Vă rugăm să așteptați ca dispecerul să genereze CMR-ul sau completați un CMR digital.',
        [
          { text: 'OK', style: 'cancel' }
        ]
      );
      return;
    }
    try {
      await downloadCMR(activeTransportId).unwrap();
      // PDF opens automatically, no need for success alert
    } catch (error) {
      // Show user-friendly error message
      let errorMessage = 'Nu s-a putut deschide documentul CMR.';
      if (error?.message?.includes('Nu există niciun document')) {
        errorMessage = 'Dispecerul nu a generat încă documentul CMR PDF. Vă rugăm să așteptați sau să contactați dispecerul.';
      } else if (error?.message?.includes('Network') || error?.message?.includes('network')) {
        errorMessage = 'Verificați conexiunea la internet și încercați din nou.';
      }
      Alert.alert('Eroare', errorMessage);
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
              const errorMessage = error?.message || 'Nu s-a putut finaliza transportul. Încercați din nou.';
              Alert.alert('Eroare', errorMessage);
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
    await refetchQueue();
    if (refetchTransport) {
      await refetchTransport();
    }
    if (refetchCMR) {
      await refetchCMR();
    }
    if (refetchCMRStatus) {
      await refetchCMRStatus();
    }
    if (refetchCMRComplete) {
      await refetchCMRComplete();
    }
  }, [refetchProfile, refetchQueue, refetchTransport, refetchCMR, refetchCMRStatus, refetchCMRComplete]);
  // Handle viewing CMR photos in modal
  const handleViewCMRPhotos = () => {
    if (!activeTransportId) {
      Alert.alert('Eroare', 'Nu există un transport activ.');
      return;
    }
    if (!cmrStatus?.has_physical_cmr) {
      Alert.alert(
        'Fără fotografii CMR',
        'Nu există fotografii CMR încărcate pentru acest transport. Doriți să adăugați fotografii?',
        [
          { text: 'Nu', style: 'cancel' },
          {
            text: 'Da, adaugă',
            onPress: () => navigation.navigate('PhotoCMRForm')
          }
        ]
      );
      return;
    }
    // Show photos in modal instead of navigating
    setShowCMRPhotosModal(true);
  };
  // Handle viewing a single photo in full screen
  const handleViewSinglePhoto = (photo) => {
    // Close the CMR photos modal first to prevent freezing
    setShowCMRPhotosModal(false);
    // Use a small delay to ensure the first modal is closed before opening the second
    setTimeout(() => {
      setSelectedPhotoForView(photo);
    }, 300);
  };
  // Get existing CMR photos
  const existingCMRPhotos = cmrCompleteData?.physical_cmrs || [];
  // Handle UIT edit button press
  const handleEditUIT = () => {
    // Pre-fill input with current UIT if it exists
    const currentUIT = cmrData?.UIT?.trim() || '';
    setUitInput(currentUIT);
    setShowUitModal(true);
  };
  // Handle UIT save
  const handleSaveUIT = async () => {
    if (!activeTransportId) {
      Alert.alert('Eroare', 'Nu există un transport activ.');
      return;
    }
    // Check if CMR exists first
    if (!cmrData) {
      Alert.alert(
        'CMR nu există',
        'Pentru a edita codul UIT, trebuie să existe mai întâi un CMR. Doriți să navigați la pagina CMR pentru a crea unul?',
        [
          { text: 'Anulează', style: 'cancel' },
          {
            text: 'Mergi la CMR',
            onPress: () => {
              setShowUitModal(false);
              navigation.navigate('CMRDigitalForm');
            }
          }
        ]
      );
      return;
    }
    try {
      // Try updating with minimal payload - just the UIT field
      await updateCMRData({
        activeTransportId,
        cmrData: {
          UIT: uitInput.trim()
        }
      }).unwrap();
      // Refresh CMR data to show updated UIT
      await refetchCMR();
      setShowUitModal(false);
      Alert.alert('Succes', 'Codul UIT a fost actualizat cu succes.');
    } catch (error) {
      // Show specific error message if available
      const errorMessage = error?.message || error?.data?.detail || 'Nu s-a putut actualiza codul UIT. Încercați din nou.';
      Alert.alert('Eroare', errorMessage);
    }
  };
  // Handle modal cancel
  const handleCancelUIT = () => {
    setUitInput('');
    setShowUitModal(false);
  };
  // Handle opening route navigation
  const handleOpenRouteNavigation = () => {
    if (!activeTransportId) {
      Alert.alert('Eroare', 'Nu există un transport activ.');
      return;
    }
    if (!transportData?.route_polyline) {
      Alert.alert(
        'Rută indisponibilă',
        'Nu există o rută calculată pentru acest transport. Dispecerul trebuie să calculeze ruta mai întâi.',
        [{ text: 'OK' }]
      );
      return;
    }
    MapService.showPolylineMapOptions(transportData.route_polyline, {
      route_distance: transportData.route_distance,
      route_travel_time: transportData.route_travel_time,
      route_toll_costs: transportData.route_toll_costs
    });
  };
  // Handle error state - only show error if profile fails (queue is optional)
  if (profileError) {
    // Get user-friendly Romanian error message
    const errorMessage = profileError?.message || 'Nu s-au putut încărca datele profilului. Verifică conexiunea și încearcă din nou.';

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
          <Text style={styles.emptyText}>
            {errorMessage}
          </Text>
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
  // Handle no active transport with intelligent messaging
  if (!activeTransportId) {
    // Determine the reason and provide helpful message
    let emptyTitle = "Niciun transport activ";
    let emptyText = "Nu aveți un transport activ asignat în acest moment";
    let showQueueButton = false;
    if (queueData && queueData.queue_count > 0) {
      const allPositionsZero = queueData.queue.every(t => t.queue_position === 0);
      const noCanStart = queueData.queue.every(t => !t.can_start);
      if (allPositionsZero && noCanStart) {
        emptyTitle = "Transporturi în coadă neordonate";
        emptyText = `Aveți ${queueData.queue_count} transporturi în coadă, dar acestea nu sunt încă ordonate de dispecer. Contactați dispecerul pentru a organiza coada.`;
        showQueueButton = true;
      } else if (noCanStart) {
        emptyTitle = "Transporturi în așteptare";
        emptyText = `Aveți ${queueData.queue_count} transporturi în coadă, dar niciun transport nu poate fi început încă.`;
        showQueueButton = true;
      }
    }
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
          <Text style={styles.emptyTitle}>{emptyTitle}</Text>
          <Text style={styles.emptyText}>{emptyText}</Text>
          {/* Queue Button */}
          {showQueueButton && (
            <TouchableOpacity
              style={[styles.backToHomeButton, { backgroundColor: '#6366F1', marginBottom: 12 }]}
              onPress={() => navigation.navigate('QueueScreen')}
            >
              <Text style={[styles.backToHomeText, { color: 'white' }]}>Vezi Coada de Transporturi</Text>
            </TouchableOpacity>
          )}
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
          <View style={styles.uitCodeInfo}>
            <Text style={styles.uitLabel}>COD UIT:</Text>
            <Text style={styles.uitCode}>{getUitCode()}</Text>
          </View>
          {/* Only show edit button if CMR exists or can be created */}
          {(cmrData || !cmrError) && (
            <TouchableOpacity
              style={styles.uitEditButton}
              onPress={handleEditUIT}
              disabled={isUpdatingCMR}
            >
              <Ionicons
                name="pencil"
                size={20}
                color="#5A5BDE"
              />
            </TouchableOpacity>
          )}
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
          {/* Navigate Route Button - only show if route polyline exists */}
          {transportData?.route_polyline && (
            <TouchableOpacity
              style={[styles.selectionButton, { marginBottom: 20, backgroundColor: '#10B981' }]}
              onPress={handleOpenRouteNavigation}
            >
              <View style={[styles.iconCircle, { backgroundColor: '#059669' }]}>
                <Ionicons name="navigate" size={32} color="#FFFFFF" />
              </View>
              <Text style={styles.selectionButtonText}>Navighează Ruta</Text>
              <Text style={styles.selectionDescription}>
                Deschide ruta în Google Maps sau Waze pentru navigație
              </Text>
            </TouchableOpacity>
          )}
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
          {/* View CMR Photos Button - only show if photos exist */}
          {cmrStatus?.has_physical_cmr && (
            <TouchableOpacity
              style={[styles.selectionButton, { marginBottom: 20, backgroundColor: '#10B981' }]}
              onPress={handleViewCMRPhotos}
            >
              <View style={[styles.iconCircle, { backgroundColor: '#059669' }]}>
                <Ionicons name="images-outline" size={32} color="#FFFFFF" />
              </View>
              <Text style={styles.selectionButtonText}>Vezi Fotografii CMR</Text>
              <Text style={styles.selectionDescription}>
                Vizualizează fotografiile CMR încărcate ({cmrStatus.physical_cmr_count} {cmrStatus.physical_cmr_count === 1 ? 'fotografie' : 'fotografii'})
              </Text>
            </TouchableOpacity>
          )}
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
      {/* UIT Edit Modal */}
      <Modal
        visible={showUitModal}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCancelUIT}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editează Codul UIT</Text>
              <TouchableOpacity onPress={handleCancelUIT}>
                <Ionicons name="close" size={24} color="#373A56" />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Codul UIT:</Text>
              <TextInput
                style={styles.uitInput}
                value={uitInput}
                onChangeText={setUitInput}
                placeholder="Introduceți codul UIT"
                placeholderTextColor="#A0A4C1"
                autoCapitalize="characters"
                autoCorrect={false}
              />
            </View>
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancelUIT}
              >
                <Text style={styles.cancelButtonText}>Anulează</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, isUpdatingCMR && styles.saveButtonDisabled]}
                onPress={handleSaveUIT}
                disabled={isUpdatingCMR}
              >
                {isUpdatingCMR ? (
                  <Ionicons name="hourglass-outline" size={20} color="#FFFFFF" />
                ) : (
                  <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                )}
                <Text style={styles.saveButtonText}>
                  {isUpdatingCMR ? 'Se salvează...' : 'Salvează'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* CMR Photos Modal */}
      <Modal
        visible={showCMRPhotosModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCMRPhotosModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '80%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Fotografii CMR ({existingCMRPhotos.length})</Text>
              <TouchableOpacity onPress={() => setShowCMRPhotosModal(false)}>
                <Ionicons name="close" size={24} color="#373A56" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                {existingCMRPhotos.map((photo, index) => {
                  const screenWidth = Dimensions.get('window').width;
                  const imageSize = (screenWidth - 100) / 2;
                  return (
                    <TouchableOpacity
                      key={photo.id || index}
                      style={{
                        width: imageSize,
                        height: imageSize,
                        marginBottom: 16,
                        borderRadius: 8,
                        overflow: 'hidden',
                        backgroundColor: '#F3F4F6'
                      }}
                      onPress={() => handleViewSinglePhoto(photo)}
                    >
                      <Image
                        source={{ uri: photo.document }}
                        style={{ width: '100%', height: '100%' }}
                        resizeMode="cover"
                      />
                      {photo.title && (
                        <View style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          backgroundColor: 'rgba(0,0,0,0.6)',
                          padding: 4
                        }}>
                          <Text style={{ color: 'white', fontSize: 12, textAlign: 'center' }} numberOfLines={1}>
                            {photo.title}
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowCMRPhotosModal(false)}
              >
                <Text style={styles.cancelButtonText}>Închide</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={() => {
                  setShowCMRPhotosModal(false);
                  navigation.navigate('PhotoCMRForm');
                }}
              >
                <Ionicons name="add" size={20} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>Adaugă Fotografii</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* Full Screen Photo Viewer Modal */}
      <Modal
        visible={selectedPhotoForView !== null}
        animationType="fade"
        transparent={true}
        onRequestClose={() => {
          setSelectedPhotoForView(null);
          // Re-open the CMR photos modal after closing full-screen view
          setTimeout(() => {
            setShowCMRPhotosModal(true);
          }, 300);
        }}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.95)' }}>
          {/* Header with back and close buttons */}
          <View style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 100,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingTop: 50,
            zIndex: 10,
            backgroundColor: 'rgba(0,0,0,0.3)'
          }}>
            <TouchableOpacity
              style={{ padding: 8 }}
              onPress={() => {
                setSelectedPhotoForView(null);
                setTimeout(() => {
                  setShowCMRPhotosModal(true);
                }, 300);
              }}
            >
              <Ionicons name="arrow-back" size={32} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity
              style={{ padding: 8 }}
              onPress={() => setSelectedPhotoForView(null)}
            >
              <Ionicons name="close" size={32} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          {selectedPhotoForView && (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100, paddingBottom: 120 }}>
              <Image
                source={{ uri: selectedPhotoForView.document }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="contain"
              />
            </View>
          )}
          {selectedPhotoForView?.title && (
            <View style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: 'rgba(0,0,0,0.7)',
              padding: 20,
              paddingBottom: 40
            }}>
              <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', textAlign: 'center' }}>
                {selectedPhotoForView.title}
              </Text>
              {selectedPhotoForView.uploaded_at && (
                <Text style={{ color: '#D1D5DB', fontSize: 14, textAlign: 'center', marginTop: 8 }}>
                  Încărcat: {new Date(selectedPhotoForView.uploaded_at).toLocaleDateString('ro-RO', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Text>
              )}
            </View>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
};
export default TransportMainPage;