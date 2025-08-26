import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Alert, ActivityIndicator, TouchableOpacity, ScrollView, Image, Platform, Linking, Modal } from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import {styles} from './styles'; 
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import PageHeader from '../../components/General/Header';
import { useLoading } from "../../components/General/loadingSpinner.js";
import { 
  useGetPersonalDocumentsQuery, 
  useUploadPersonalDocumentMutation,
  useDeletePersonalDocumentMutation,
  DOCUMENT_CATEGORIES 
} from '../../services/documentsService';

const DocumentsScreen = ({ navigation, route }) => {
  const { showLoading, hideLoading } = useLoading();
  
  // Local state
  const [selectedFile, setSelectedFile] = useState(null);
  const [category, setCategory] = useState(''); // No default category
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showAllDocuments, setShowAllDocuments] = useState(false);

  // Use the documents service hooks
  const {
    data: documents,
    isLoading: documentsLoading,
    isFetching: documentsFetching,
    error: documentsError,
    refetch: refetchDocuments
  } = useGetPersonalDocumentsQuery();

  const [uploadDocumentMutation, { isLoading: isUploading }] = useUploadPersonalDocumentMutation();
  const [deleteDocumentMutation, { isLoading: isDeleting }] = useDeletePersonalDocumentMutation();

  // Extract data from hooks
  const recentDocuments = documents || [];
  const loading = documentsLoading;
  const error = documentsError;

  // Update global loading state based on local loading states
  useEffect(() => {
    if (loading || isUploading || isDeleting) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [loading, isUploading, isDeleting, showLoading, hideLoading]);

  const handleRetry = useCallback(async () => {
    await refetchDocuments();
  }, [refetchDocuments]);

  // Get documents to display (limit to 3 if showAllDocuments is false)
  const getDocumentsToDisplay = () => {
    if (showAllDocuments || recentDocuments.length <= 3) {
      return recentDocuments;
    }
    return recentDocuments.slice(0, 3);
  };

  // Toggle show all documents
  const toggleShowAllDocuments = () => {
    setShowAllDocuments(!showAllDocuments);
  };

  // Get document title based on selected category
  const getDocumentTitle = () => {
    if (!category) return 'Selectează tipul documentului';
    const selectedCategory = DOCUMENT_CATEGORIES.find(cat => cat.value === category);
    return selectedCategory ? selectedCategory.label : 'Document';
  };

  // Get file icon based on document type
  const getFileIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return <MaterialIcons name="picture-as-pdf" size={24} color="#E74C3C" />;
      case 'docx':
      case 'doc':
        return <MaterialIcons name="description" size={24} color="#3498DB" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
        return <MaterialIcons name="image" size={24} color="#27AE60" />;
      default:
        return <MaterialIcons name="insert-drive-file" size={24} color="#95A5A6" />;
    }
  };

  // Get status color based on document status
  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return '#27AE60'; // Green
      case 'pending':
        return '#F39C12'; // Orange
      case 'rejected':
        return '#E74C3C'; // Red
      default:
        return '#95A5A6'; // Gray
    }
  };

  // Get status label based on document status
  const getStatusLabel = (status) => {
    switch (status) {
      case 'approved':
        return 'Approved';
      case 'pending':
        return 'Pending';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Unknown';
    }
  };

  const openDocument = async (url) => {
    try {
      const supported = await Linking.canOpenURL(url);
      
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          'Error',
          'Cannot open this document. The URL may be invalid or expired.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error opening document URL:', error);
      Alert.alert(
        'Error',
        'Failed to open the document. Please try again later.',
        [{ text: 'OK' }]
      );
    }
  };

  const showDocumentOptions = (document) => {
    Alert.alert(
      document.name,
      'Choose an action',
      [
        {
          text: 'Open',
          onPress: () => openDocument(document.url)
        },
        {
          text: 'Share',
          onPress: () => shareDocument(document)
        },
        {
          text: 'Download',
          onPress: () => downloadDocument(document)
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => confirmDeleteDocument(document)
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  };

  const shareDocument = (document) => {
    // Implementation for sharing document
    Alert.alert('Share', `Sharing ${document.name} functionality would be implemented here`);
  };

  // Function to download document (placeholder)
  const downloadDocument = (document) => {
    // Implementation for downloading document
    Alert.alert('Download', `Downloading ${document.name} functionality would be implemented here`);
  };

  const confirmDeleteDocument = (document) => {
    Alert.alert(
      'Delete Document',
      `Are you sure you want to delete "${document.name}"? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteDocument(document.id)
        }
      ]
    );
  };

  const deleteDocument = async (documentId) => {
    try {
      await deleteDocumentMutation(documentId).unwrap();
      Alert.alert('Success', 'Document deleted successfully!');
      // Refresh the documents list
      await refetchDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      Alert.alert('Error', 'Failed to delete the document. Please try again.');
    }
  };

  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
        const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        
        if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
          Alert.alert('Permission required', 'Camera and media library permissions are needed to use this feature.');
        }
      }
    })();
  }, []);

  const selectCategory = (selectedCategory) => {
    setCategory(selectedCategory.value);
    setShowCategoryModal(false);
  };

  const pickDocument = async () => {
    if (!category) {
      Alert.alert('Selectează tipul documentului', 'Te rugăm să selectezi mai întâi tipul documentului pe care vrei să îl încarci.');
      return;
    }

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'],
        copyToCacheDirectory: true
      });

      if (result.canceled) {
        return;
      }

      const fileInfo = result.assets[0];
      const fileSize = await getFileSize(fileInfo.uri);
      
      if (fileSize > 10 * 1024 * 1024) { // 10MB limit
        Alert.alert('File too large', 'Please select a file smaller than 10MB.');
        return;
      }

      setSelectedFile(fileInfo);
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'An error occurred while picking the document.');
    }
  };

  const takePicture = async () => {
    if (!category) {
      Alert.alert('Selectează tipul documentului', 'Te rugăm să selectezi mai întâi tipul documentului pe care vrei să îl încarci.');
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
      });

      if (result.canceled) {
        return;
      }

      const fileInfo = result.assets[0];
      const fileSize = await getFileSize(fileInfo.uri);
      
      if (fileSize > 10 * 1024 * 1024) { // 10MB limit
        Alert.alert('File too large', 'Please select a file smaller than 10MB.');
        return;
      }

      setSelectedFile(fileInfo);
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Error', 'An error occurred while taking the picture.');
    }
  };

  const getFileSize = async (uri) => {
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      return fileInfo.size;
    } catch (error) {
      console.error('Error getting file size:', error);
      return 0;
    }
  };

  const getFileName = (uri) => {
    return uri.split('/').pop();
  };

  const uploadDocument = async () => {
    if (!selectedFile) {
      Alert.alert('No file selected', 'Please select a document to upload.');
      return;
    }

    if (!category) {
      Alert.alert('Selectează tipul documentului', 'Te rugăm să selectezi tipul documentului înainte de încărcare.');
      return;
    }

    try {
      await uploadDocumentMutation({
        document: selectedFile,
        title: getDocumentTitle(),
        category: category
      }).unwrap();

      Alert.alert('Success', 'Document uploaded successfully!');
      
      // Reset the form
      setSelectedFile(null);
      setCategory('');
      
      // Refresh the documents list
      await refetchDocuments();
    } catch (error) {
      console.error('Error uploading document:', error);
      Alert.alert('Error', error.message || 'An error occurred while uploading the document. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <PageHeader
        title="Profil"
        onBack={() => navigation.goBack()}
        onRetry={handleRetry}
        showRetry={true}
        showBack={true}
      />

      <ScrollView style={styles.scrollContainer}>
        {/* Upload Section */}
        <View style={styles.uploadSection}>
          <Text style={styles.sectionTitle}>Încarcă sau fotografiază</Text>
          
          {/* Document Type Selector */}
          <TouchableOpacity 
            style={[styles.categorySelector, !category && styles.categorySelectorEmpty]}
            onPress={() => setShowCategoryModal(true)}
          >
            <Text style={[styles.documentName, !category && styles.placeholderText]}>
              {getDocumentTitle()}
            </Text>
            <MaterialIcons name="keyboard-arrow-down" size={24} color="#666" />
          </TouchableOpacity>

          <Text style={styles.helpText}>
            Acest lucru te ajută pe tine și pe dispatcher să accesați mai ușor toate documentele dacă este necesar.
            Îl poți găsi întotdeauna în dosarul său din secțiunea "Acte".
          </Text>
          
          {selectedFile ? (
            <View style={styles.filePreviewContainer}>
              <MaterialCommunityIcons name="file-check" size={40} color="#4285F4" />
              <Text style={styles.selectedFileName} numberOfLines={1} ellipsizeMode="middle">
                {getFileName(selectedFile.uri)}
              </Text>
            </View>
          ) : (
            <View style={styles.filePreviewContainer}>
              <MaterialCommunityIcons name="file" size={40} color="#4285F4" />
            </View>
          )}
          
          <TouchableOpacity 
            style={[styles.uploadArea, !category && styles.disabledUploadArea]} 
            onPress={pickDocument}
            disabled={!category}
          >
            <Ionicons name="add-circle-outline" size={32} color={category ? "#4285F4" : "#ccc"} />
            <Text style={[styles.uploadText, !category && styles.disabledText]}>
              Apasă pentru a încărca
            </Text>
          </TouchableOpacity>
          
          <View style={styles.fileTypesContainer}>
            <View style={styles.fileType}>
              <Text style={styles.fileTypeText}>PDF</Text>
            </View>
            <View style={styles.fileType}>
              <Text style={styles.fileTypeText}>DOCX</Text>
            </View>
            <View style={styles.fileType}>
              <Text style={styles.fileTypeText}>JPG</Text>
            </View>
            <View style={styles.fileType}>
              <Text style={styles.fileTypeText}>&lt; 10 MB</Text>
            </View>
          </View>
          
          <Text style={styles.orText}>Sau</Text>
          
          <TouchableOpacity 
            style={[styles.cameraButton, !category && styles.disabledCameraButton]} 
            onPress={takePicture}
            disabled={!category}
          >
            <Ionicons name="camera" size={20} color={category ? "#4285F4" : "#ccc"} />
            <Text style={[styles.cameraButtonText, !category && styles.disabledText]}>
              Deschide Camera & Fă o Poză
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.uploadDocumentButton, (!selectedFile || !category || isUploading) && styles.disabledButton]}
            onPress={uploadDocument}
            disabled={!selectedFile || !category || isUploading}
          >
            {isUploading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.uploadDocumentButtonText}>Încarcă documentul</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Recent Documents Section */}
        <View style={styles.recentDocumentsSection}>
          <View style={styles.recentDocumentsHeader}>
            <Text style={styles.recentDocumentsTitle}>Documente Recente</Text>
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={handleRetry}
              disabled={loading || documentsFetching}
            >
              {loading || documentsFetching ? (
                <ActivityIndicator size="small" color="#4285F4" />
              ) : (
                <Ionicons name="refresh" size={20} color="#4285F4" />
              )}
            </TouchableOpacity>
          </View>
          
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Eroare la încărcarea documentelor: {error.message || error.toString()}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
                <Text style={styles.retryButtonText}>Încearcă din nou</Text>
              </TouchableOpacity>
            </View>
          ) : loading ? (
            <ActivityIndicator size="large" color="#4285F4" style={styles.loader} />
          ) : recentDocuments.length > 0 ? (
            <>
              {getDocumentsToDisplay().map(doc => (
                <TouchableOpacity 
                  key={doc.id} 
                  style={styles.documentItem}
                  onPress={() => openDocument(doc.url)}
                >
                  <View style={styles.documentIconContainer}>
                    {getFileIcon(doc.type)}
                  </View>
                  <View style={styles.documentInfo}>
                    <Text style={styles.documentTitle}>{doc.name}</Text>
                    <View style={styles.documentDetails}>
                      <Text style={styles.documentType}>{doc.type}</Text>
                      <Text style={styles.documentSize}>{doc.size}</Text>
                      <Text style={styles.documentDate}>{doc.date}</Text>
                    </View>
                  </View>
                  <View style={styles.documentStatus}>
                    <View style={[styles.statusIndicator, {backgroundColor: getStatusColor(doc.status)}]} />
                    <Text style={styles.statusText}>{getStatusLabel(doc.status)}</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.documentMenuButton}
                    onPress={(e) => {
                      e.stopPropagation(); // Prevent triggering the parent onPress
                      showDocumentOptions(doc);
                    }}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <ActivityIndicator size="small" color="#777" />
                    ) : (
                      <MaterialIcons name="more-vert" size={20} color="#777" />
                    )}
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
              
              {recentDocuments.length > 3 && (
                <TouchableOpacity 
                  style={styles.showMoreButton}
                  onPress={toggleShowAllDocuments}
                >
                  <Text style={styles.showMoreText}>
                    {showAllDocuments 
                      ? `Afișează mai puțin` 
                      : `Afișează toate documentele (${recentDocuments.length})`
                    }
                  </Text>
                  <Ionicons 
                    name={showAllDocuments ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color="#4285F4" 
                  />
                </TouchableOpacity>
              )}
            </>
          ) : (
            <Text style={styles.noDocumentsText}>Nu s-au găsit documente</Text>
          )}
        </View>
      </ScrollView>

      {/* Category Selection Modal */}
      <Modal
        visible={showCategoryModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selectează tipul documentului</Text>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => setShowCategoryModal(false)}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScrollView}>
              {DOCUMENT_CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.value}
                  style={[
                    styles.categoryOption,
                    category === cat.value && styles.selectedCategoryOption
                  ]}
                  onPress={() => selectCategory(cat)}
                >
                  <Text style={[
                    styles.categoryOptionText,
                    category === cat.value && styles.selectedCategoryOptionText
                  ]}>
                    {cat.label}
                  </Text>
                  {category === cat.value && (
                    <Ionicons name="checkmark" size={20} color="#4285F4" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default DocumentsScreen;