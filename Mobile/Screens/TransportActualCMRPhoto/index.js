import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert, ScrollView, Image, Dimensions, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useGetUserProfileQuery } from '../../services/profileService';
import { useGetDriverQueueQuery } from '../../services/transportService';
import { useUploadCMRFizicMutation, useGetCMRStatusQuery, useGetCMRCompleteQuery } from '../../services/CMRService';
import { styles } from './styles'; // Import your styles from the styles.js file
import PageHeader from "../../components/General/Header";
const PhotoCMRForm = ({ navigation }) => {
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedPhotoForView, setSelectedPhotoForView] = useState(null);
  // Get user profile to access active transport data
  const {
    data: profileData,
    isLoading: profileLoading,
    error: profileError,
    refetch: refetchProfile
  } = useGetUserProfileQuery();
  // Also get queue data for new transport system
  const {
    data: queueData,
    isLoading: queueLoading,
    error: queueError,
    refetch: refetchQueue
  } = useGetDriverQueueQuery();
  // Upload mutation - using new dedicated endpoint
  const [uploadCMRFizic, { isLoading: isUploading }] = useUploadCMRFizicMutation();
  // Get CMR status to show current state
  const {
    data: cmrStatus,
    refetch: refetchCMRStatus
  } = useGetCMRStatusQuery(activeTransportId, {
    skip: !activeTransportId
  });
  // Get complete CMR data including physical photos
  const {
    data: cmrCompleteData,
    isLoading: cmrCompleteLoading,
    refetch: refetchCMRComplete
  } = useGetCMRCompleteQuery(activeTransportId, {
    skip: !activeTransportId
  });
  // Smart transport ID detection with fallback
  const getActiveTransportId = () => {
    // Priority 1: Queue system current transport
    if (queueData?.current_transport_id) {
      return queueData.current_transport_id;
    }
    // Priority 2: Profile active transport (legacy system)
    if (profileData?.active_transport) {
      return profileData.active_transport;
    }
    // Priority 3: Check queue for startable transports
    if (queueData?.queue && queueData.queue.length > 0) {
      const startableTransport = queueData.queue.find(t => t.can_start || t.is_current);
      if (startableTransport) {
        return startableTransport.transport_id;
      }
      // Fallback to first transport in queue
      return queueData.queue[0]?.transport_id;
    }
    return null;
  };
  const activeTransportId = getActiveTransportId();
  const screenWidth = Dimensions.get('window').width;
  const imageSize = (screenWidth - 60) / 2; // 2 images per row with margins
  // Handle camera capture
  const handleCameraCapture = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permisiune necesară', 'Avem nevoie de permisiunea de a accesa camera pentru a fotografia CMR-ul.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });
    if (!result.canceled) {
      const newImage = {
        id: Date.now().toString(),
        uri: result.assets[0].uri,
        type: 'image/jpeg',
        name: `cmr_photo_${Date.now()}.jpg`,
        title: `CMR Photo ${selectedImages.length + 1}`,
        category: 'cmr'
      };
      setSelectedImages([...selectedImages, newImage]);
    }
  };
  // Handle gallery selection
  const handleGallerySelect = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permisiune necesară', 'Avem nevoie de permisiunea de a accesa galeria pentru a selecta imagini CMR.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
    });
    if (!result.canceled) {
      const newImages = result.assets.map((asset, index) => ({
        id: (Date.now() + index).toString(),
        uri: asset.uri,
        type: 'image/jpeg',
        name: `cmr_gallery_${Date.now() + index}.jpg`,
        title: `CMR Photo ${selectedImages.length + index + 1}`,
        category: 'cmr'
      }));
      setSelectedImages([...selectedImages, ...newImages]);
    }
  };
  // Handle document picker (for PDF files)
  const handleDocumentPicker = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
        multiple: true,
      });
      if (!result.canceled) {
        const newDocuments = result.assets.map((asset, index) => ({
          id: (Date.now() + index).toString(),
          uri: asset.uri,
          name: asset.name,
          type: asset.mimeType || 'application/pdf',
          mimeType: asset.mimeType,
          title: asset.name || `CMR Document ${selectedImages.length + index + 1}`,
          category: 'cmr'
        }));
        setSelectedImages([...selectedImages, ...newDocuments]);
      }
    } catch (error) {
      Alert.alert('Eroare', 'Nu s-a putut selecta documentul.');
    }
  };
  // Remove image
  const removeImage = (imageId) => {
    Alert.alert(
      'Șterge imaginea',
      'Sunteți sigur că doriți să ștergeți această imagine?',
      [
        {
          text: 'Anulează',
          style: 'cancel'
        },
        {
          text: 'Șterge',
          style: 'destructive',
          onPress: () => {
            setSelectedImages(selectedImages.filter(img => img.id !== imageId));
          }
        }
      ]
    );
  };
  // Handle upload using new dedicated endpoint
  const handleUpload = async () => {
    if (selectedImages.length === 0) {
      Alert.alert('Nicio imagine selectată', 'Vă rugăm să adăugați cel puțin o imagine sau document CMR.');
      return;
    }
    if (!activeTransportId) {
      Alert.alert('Eroare', 'Nu există un transport activ pentru încărcarea documentelor CMR.');
      return;
    }
    try {
      let uploadedCount = 0;
      const errors = [];
      // Upload each document individually using the new endpoint
      for (let i = 0; i < selectedImages.length; i++) {
        const doc = selectedImages[i];
        try {
          await uploadCMRFizic({
            transportId: activeTransportId,
            document: doc,
            title: doc.title || `CMR Fizic ${i + 1}`
          }).unwrap();
          uploadedCount++;
        } catch (error) {
          errors.push(`${doc.title || doc.name}: ${error.message}`);
        }
      }
      // Refresh CMR status and complete data after upload
      await refetchCMRStatus();
      await refetchCMRComplete();
      if (uploadedCount === selectedImages.length) {
        Alert.alert(
          'Upload reușit',
          `${uploadedCount} document${uploadedCount > 1 ? 'e' : ''} CMR încărcat${uploadedCount > 1 ? 'e' : ''} cu succes!`,
          [{
            text: 'OK',
            onPress: () => navigation.goBack()
          }]
        );
        setSelectedImages([]);
      } else if (uploadedCount > 0) {
        Alert.alert(
          'Upload parțial',
          `${uploadedCount} documente încărcate. ${errors.length} eșuate:\n${errors.join('\n')}`,
          [{ text: 'OK' }]
        );
        // Keep only failed images
        setSelectedImages(selectedImages.slice(uploadedCount));
      } else {
        Alert.alert(
          'Eroare upload',
          `Nu s-au putut încărca documentele:\n${errors.join('\n')}`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Eroare upload',
        error.message || 'Nu s-au putut încărca documentele. Verificați conexiunea la internet și încercați din nou.',
        [{ text: 'OK' }]
      );
    }
  };
  const handleRetry = useCallback(async () => {
    try {
      await Promise.all([
        refetchProfile(),
        refetchQueue(),
        refetchCMRComplete()
      ]);
    } catch (error) {
      // Retry failed, but we don't need to log it
    }
  }, [refetchProfile, refetchQueue, refetchCMRComplete]);
  // Handle viewing a photo in full screen
  const handleViewPhoto = (photo) => {
    setSelectedPhotoForView(photo);
  };
  // Get existing CMR photos from complete data
  const existingPhotos = cmrCompleteData?.physical_cmrs || [];
  // Render image preview
  const renderImagePreview = (image) => {
    return (
      <View key={image.id} style={[styles.imagePreviewContainer, { width: imageSize, height: imageSize }]}>
        {image.type === 'document' ? (
          <View style={styles.documentPreview}>
            <Ionicons name="document-text" size={40} color="#3B82F6" />
            <Text style={styles.documentName} numberOfLines={2}>
              {image.name}
            </Text>
          </View>
        ) : (
          <Image 
            source={{ uri: image.uri }} 
            style={styles.imagePreview}
            resizeMode="cover"
          />
        )}
        <TouchableOpacity 
          style={styles.removeImageButton}
          onPress={() => removeImage(image.id)}
        >
          <Ionicons name="close-circle" size={24} color="#EF4444" />
        </TouchableOpacity>
        <View style={styles.imageTypeIndicator}>
          <Ionicons
            name={image.mimeType?.includes('pdf') ? 'document' : 'image'}
            size={16}
            color="white"
          />
        </View>
      </View>
    );
  };
  // Error handling - only show error if PROFILE fails (queue is optional)
  if (profileError) {
    return (
      <SafeAreaView style={styles.container}>
        <PageHeader
          title="CMR"
          onBack={() => navigation.goBack()}
          onRetry={handleRetry}
          showRetry={true}
          showBack={true}
        />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={60} color="#FF7285" />
          <Text style={styles.errorTitle}>Eroare de profil</Text>
          <Text style={styles.errorText}>Nu s-au putut încărca datele profilului. Verifică conexiunea și încearcă din nou.</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>Încearcă din nou</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  // No active transport
  if (!activeTransportId && !profileLoading && !queueLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <PageHeader
          title="CMR"
          onBack={() => navigation.goBack()}
          showBack={true}
        />
        <View style={styles.errorContainer}>
          <Ionicons name="document-outline" size={60} color="#5A5BDE" />
          <Text style={styles.errorTitle}>Niciun transport activ</Text>
          <Text style={styles.errorText}>Nu aveți un transport activ pentru a încărca documente CMR</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>Reîncarcă</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={styles.container}>
      <PageHeader
        title="CMR"
        onBack={() => navigation.goBack()}
        onRetry={handleRetry}
        showRetry={true}
        showBack={true}
      />
      <ScrollView style={styles.photoFormContainer} contentContainerStyle={styles.photoFormContent}>
        {/* CMR Status Badge */}
        {cmrStatus && (
          <View style={[styles.instructionsContainer, { borderLeftColor:
            cmrStatus.status === 'both' ? '#10B981' :
            cmrStatus.status === 'digital_only' ? '#3B82F6' :
            cmrStatus.status === 'physical_only' ? '#F59E0B' :
            '#EF4444'
          }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Ionicons
                name={
                  cmrStatus.status === 'both' ? 'checkmark-circle' :
                  cmrStatus.status === 'digital_only' ? 'document-text' :
                  cmrStatus.status === 'physical_only' ? 'camera' :
                  'alert-circle'
                }
                size={24}
                color={
                  cmrStatus.status === 'both' ? '#10B981' :
                  cmrStatus.status === 'digital_only' ? '#3B82F6' :
                  cmrStatus.status === 'physical_only' ? '#F59E0B' :
                  '#EF4444'
                }
              />
              <Text style={[styles.instructionsTitle, { marginLeft: 8, marginBottom: 0 }]}>
                Status CMR: {
                  cmrStatus.status === 'both' ? 'Complet (Digital + Fizic)' :
                  cmrStatus.status === 'digital_only' ? 'Doar Digital' :
                  cmrStatus.status === 'physical_only' ? 'Doar Fizic' :
                  'Lipsă'
                }
              </Text>
            </View>
            <Text style={styles.instructionsText}>
              {cmrStatus.has_digital_cmr && `• CMR Digital: ${cmrStatus.digital_cmr_completed_percentage || '0%'}\n`}
              {cmrStatus.has_physical_cmr && `• CMR Fizice: ${cmrStatus.physical_cmr_count} document(e)\n`}
              {!cmrStatus.has_digital_cmr && !cmrStatus.has_physical_cmr && '• Nu există CMR pentru acest transport'}
            </Text>
          </View>
        )}
        {/* Existing CMR Photos Section */}
        {existingPhotos.length > 0 && (
          <View style={styles.existingPhotosSection}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Ionicons name="images" size={24} color="#10B981" />
              <Text style={[styles.instructionsTitle, { marginLeft: 8, marginBottom: 0, color: '#10B981' }]}>
                Fotografii CMR Existente ({existingPhotos.length})
              </Text>
            </View>
            <View style={styles.imagesGrid}>
              {existingPhotos.map((photo, index) => (
                <TouchableOpacity
                  key={photo.id || index}
                  style={[styles.imagePreviewContainer, { width: imageSize, height: imageSize }]}
                  onPress={() => handleViewPhoto(photo)}
                >
                  <Image
                    source={{ uri: photo.document }}
                    style={styles.imagePreview}
                    resizeMode="cover"
                  />
                  <View style={[styles.imageTypeIndicator, { backgroundColor: '#10B981' }]}>
                    <Ionicons name="checkmark" size={16} color="white" />
                  </View>
                  {photo.title && (
                    <View style={styles.photoTitleOverlay}>
                      <Text style={styles.photoTitleText} numberOfLines={1}>
                        {photo.title}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <Ionicons name="information-circle" size={24} color="#3B82F6" />
          <Text style={styles.instructionsTitle}>Instrucțiuni pentru fotografierea CMR-ului:</Text>
          <Text style={styles.instructionsText}>
            • Asigurați-vă că documentul este complet vizibil{'\n'}
            • Fotografiați într-o zonă bine luminată{'\n'}
            • Evitați umbrele sau reflexii{'\n'}
            • Puteți adăuga multiple pagini sau documente{'\n'}
            • Acceptăm imagini (JPEG, PNG, GIF, WebP) și fișiere PDF
          </Text>
        </View>
        {/* Action buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleCameraCapture}
          >
            <Ionicons name="camera" size={32} color="#3B82F6" />
            <Text style={styles.actionButtonText}>Fotografiază</Text>
            <Text style={styles.actionButtonSubtext}>Fă o poză nouă</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleGallerySelect}
          >
            <Ionicons name="images" size={32} color="#3B82F6" />
            <Text style={styles.actionButtonText}>Galerie</Text>
            <Text style={styles.actionButtonSubtext}>Selectează din galerie</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleDocumentPicker}
          >
            <Ionicons name="document-text" size={32} color="#3B82F6" />
            <Text style={styles.actionButtonText}>Document</Text>
            <Text style={styles.actionButtonSubtext}>Selectează PDF</Text>
          </TouchableOpacity>
        </View>
        {/* Selected images preview */}
        {selectedImages.length > 0 && (
          <View style={styles.previewSection}>
            <Text style={styles.previewTitle}>
              Imagini și documente selectate ({selectedImages.length})
            </Text>
            <View style={styles.imagesGrid}>
              {selectedImages.map(renderImagePreview)}
            </View>
          </View>
        )}
        {/* Upload button */}
        {selectedImages.length > 0 && (
          <TouchableOpacity 
            style={[
              styles.uploadButton,
              isUploading && styles.uploadButtonDisabled
            ]}
            onPress={handleUpload}
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Ionicons name="cloud-upload" size={24} color="#FFFFFF" />
                <Text style={styles.uploadButtonText}>Se încarcă...</Text>
              </>
            ) : (
              <>
                <Ionicons name="cloud-upload" size={24} color="#FFFFFF" />
                <Text style={styles.uploadButtonText}>
                  Încarcă {selectedImages.length} {selectedImages.length === 1 ? 'fișier' : 'fișiere'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}
        {/* Empty state */}
        {selectedImages.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="camera-outline" size={64} color="#9CA3AF" />
            <Text style={styles.emptyStateTitle}>Niciun CMR adăugat</Text>
            <Text style={styles.emptyStateText}>
              Folosiți butoanele de mai sus pentru a adăuga imagini sau documente CMR
            </Text>
          </View>
        )}
      </ScrollView>
      {/* Full Screen Photo Viewer Modal */}
      <Modal
        visible={selectedPhotoForView !== null}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setSelectedPhotoForView(null)}
      >
        <View style={styles.fullScreenModalOverlay}>
          <TouchableOpacity
            style={styles.closeFullScreenButton}
            onPress={() => setSelectedPhotoForView(null)}
          >
            <Ionicons name="close-circle" size={40} color="#FFFFFF" />
          </TouchableOpacity>
          {selectedPhotoForView && (
            <View style={styles.fullScreenImageContainer}>
              <Image
                source={{ uri: selectedPhotoForView.document }}
                style={styles.fullScreenImage}
                resizeMode="contain"
              />
              {selectedPhotoForView.title && (
                <View style={styles.fullScreenPhotoInfo}>
                  <Text style={styles.fullScreenPhotoTitle}>
                    {selectedPhotoForView.title}
                  </Text>
                  {selectedPhotoForView.uploaded_at && (
                    <Text style={styles.fullScreenPhotoDate}>
                      Încărcat: {new Date(selectedPhotoForView.uploaded_at).toLocaleDateString('ro-RO')}
                    </Text>
                  )}
                </View>
              )}
            </View>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
};
export default PhotoCMRForm;