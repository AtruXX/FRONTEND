import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Alert, ActivityIndicator, TouchableOpacity, ScrollView, Image, Platform, Linking, Modal } from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import {styles} from './styles'; // Import your styles from the styles.js file
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { BASE_URL } from "../../utils/BASE_URL";

const DocumentsScreen = ({ navigation, route }) => {
  // Document categories
  const documentCategories = [
    { value: 'permis_de_conducere', label: 'Permis de conducere' },
    { value: 'atestate', label: 'Atestat profesional' },
    { value: 'certificat_medical', label: 'Certificat medical' },
    { value: 'aviz_psihologic', label: 'Aviz psihologic' },
    { value: 'buletin', label: 'Carte de identitate' },
    { value: 'fisa_postului', label: 'Fișa postului' },
    { value: 'contract_munca', label: 'Contract individual de muncă' },
    { value: 'adeverinta_angajator', label: 'Adeverință angajator' },
    { value: 'formular_eu', label: 'Formular A1/Portable Document A1 (UE)' },
    { value: 'cereri_de_concediu', label: 'Cereri concediu' },
    { value: 'alte_documente_personale', label: 'Alte documente' }
  ];

  // Sample recent documents data
  const [recentDocuments, setRecentDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [category, setCategory] = useState(''); // No default category
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showAllDocuments, setShowAllDocuments] = useState(false);

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
    const selectedCategory = documentCategories.find(cat => cat.value === category);
    return selectedCategory ? selectedCategory.label : 'Document';
  };

  // Function to fetch personal documents from the API
  const fetchPersonalDocuments = async () => {
    try {
      // Get the authentication token from AsyncStorage
      const authToken = await AsyncStorage.getItem('authToken');
      
      if (!authToken) {
        throw new Error('Authentication token not found');
      }
      
      // Set up the request with the authentication token in the header
      const response = await fetch(`${BASE_URL}personal-documents/`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      // Parse the JSON response
      const data = await response.json();
      
      // Map the API response to match the document format in your state
      const formattedDocuments = data.map((doc) => ({
        id: doc.id,
        name: doc.title,
        type: getFileExtension(doc.document),
        size: '1.0 MB', // Placeholder size since not provided by API
        date: new Date().toLocaleDateString(), // Current date as placeholder
        status: getCategoryStatus(doc.category), // Map category to a status
        url: doc.document,
        category: doc.category
      }));
      
      return formattedDocuments;
    } catch (error) {
      console.error('Error fetching personal documents:', error);
      throw error;
    }
  };

  // Helper function to extract file extension from URL
  const getFileExtension = (url) => {
    if (!url) return '';
    
    // Extract filename from URL
    const filename = url.split('?')[0]; // Remove query parameters
    const extension = filename.split('.').pop().toUpperCase();
    
    return extension || '';
  };

  // Map document category to status for display
  const getCategoryStatus = (category) => {
    const statusMap = {
      'carnet_de_sofer': 'approved',
      'atestate': 'approved',
      // Add more category to status mappings as needed
    };
    
    return statusMap[category] || 'pending';
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

  // Function to load documents
  const loadDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      const documents = await fetchPersonalDocuments();
      setRecentDocuments(documents);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle retry function for refresh button
  const handleRetry = async () => {
    await loadDocuments();
  };

  // Load documents when component mounts
  useEffect(() => {
    loadDocuments();
  }, []);

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

  const getFileExtensionUp = (uri) => {
    return uri.split('.').pop().toLowerCase();
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

    setIsUploading(true);

    try {
      // Get the auth token from AsyncStorage
      const authToken = await AsyncStorage.getItem('authToken');
      
      if (!authToken) {
        Alert.alert('Authentication Error', 'Please log in to upload documents.');
        setIsUploading(false);
        return;
      }

      // Prepare file information
      const fileUri = selectedFile.uri;
      const fileName = getFileName(fileUri);
      const fileExtension = getFileExtensionUp(fileUri);
      const fileType = selectedFile.mimeType || `application/${fileExtension}`;
      
      // Create form data
      const formData = new FormData();
      
      // Add the file
      formData.append('document', {
        uri: fileUri,
        name: fileName,
        type: fileType,
      });
      
      // Add other required fields
      formData.append('title', getDocumentTitle());
      formData.append('category', category);

      // Make the API request
      const response = await fetch(`${BASE_URL}personal-documents/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${authToken}`,
          // Add any other headers needed from AsyncStorage
        },
        body: formData,
      });

      const responseData = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'Document uploaded successfully!');
        // Reset the form
        setSelectedFile(null);
        setCategory('');
        // Refresh the documents list
        await loadDocuments();
      } else {
        console.error('Upload failed:', responseData);
        Alert.alert('Upload Failed', responseData.message || 'An error occurred while uploading the document.');
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      Alert.alert('Error', 'An error occurred while uploading the document. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.navigate("Main")}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Încarcă un document</Text>
      </View>

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
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#4285F4" />
              ) : (
                <Ionicons name="refresh" size={20} color="#4285F4" />
              )}
            </TouchableOpacity>
          </View>
          
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Eroare la încărcarea documentelor: {error}</Text>
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
                  >
                    <MaterialIcons name="more-vert" size={20} color="#777" />
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
              {documentCategories.map((cat) => (
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