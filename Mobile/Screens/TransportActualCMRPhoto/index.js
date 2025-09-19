import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert, ScrollView, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useGetUserProfileQuery } from '../../services/profileService';
import { useUploadCMRDocumentsMutation } from '../../services/CMRService';
import { useLoading } from "../../components/General/loadingSpinner.js";
import { styles } from './styles'; // Import your styles from the styles.js file
import PageHeader from "../../components/General/Header";

const PhotoCMRForm = ({ navigation }) => {
  const { showLoading, hideLoading } = useLoading();
  const [selectedImages, setSelectedImages] = useState([]);

  // Get user profile to access active transport data
  const {
    data: profileData,
    isLoading: profileLoading,
    error: profileError,
    refetch: refetchProfile
  } = useGetUserProfileQuery();

  // Upload mutation
  const [uploadCMRDocuments, { isLoading: isUploading }] = useUploadCMRDocumentsMutation();

  const activeTransportId = profileData?.active_transport;

  const screenWidth = Dimensions.get('window').width;
  const imageSize = (screenWidth - 60) / 2; // 2 images per row with margins

  // Update global loading state
  useEffect(() => {
    if (profileLoading || isUploading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [profileLoading, isUploading, showLoading, hideLoading]);

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

  // Handle upload
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
      await uploadCMRDocuments({
        activeTransportId,
        documents: selectedImages
      }).unwrap();

      Alert.alert(
        'Upload reușit',
        'Documentele CMR au fost încărcate cu succes!',
        [{
          text: 'OK',
          onPress: () => navigation.goBack()
        }]
      );

      // Clear selected images after successful upload
      setSelectedImages([]);
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
      await refetchProfile();
    } catch (error) {
      // Retry failed, but we don't need to log it
    }
  }, [refetchProfile]);

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

  // Error handling
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
          <Text style={styles.errorText}>Nu s-au putut încărca datele profilului</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>Încearcă din nou</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // No active transport
  if (!activeTransportId && !profileLoading) {
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
        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <Ionicons name="information-circle" size={24} color="#3B82F6" />
          <Text style={styles.instructionsTitle}>Instrucțiuni pentru fotografierea CMR-ului:</Text>
          <Text style={styles.instructionsText}>
            • Asigurați-vă că documentul este complet vizibil{'\n'}
            • Fotografiați într-o zonă bine luminată{'\n'}
            • Evitați umbrele sau reflexii{'\n'}
            • Puteți adăuga multiple pagini sau documente{'\n'}
            • Acceptăm și fișiere PDF
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
    </SafeAreaView>
  );
};

export default PhotoCMRForm;