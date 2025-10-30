import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Alert, ActivityIndicator, TouchableOpacity, ScrollView, Image, Platform, Linking, Modal } from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import {styles} from './styles';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import PageHeader from '../../components/General/Header';
import Calendar from '../../components/General/Calendar';
import { 
  useGetPersonalDocumentsQuery, 
  useUploadPersonalDocumentMutation,
  useDeletePersonalDocumentMutation,
  DOCUMENT_CATEGORIES 
} from '../../services/documentsService';
const DocumentsScreen = ({ navigation, route }) => {
  // Local state
  const [selectedFile, setSelectedFile] = useState(null);
  const [category, setCategory] = useState(''); // No default category
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showAllDocuments, setShowAllDocuments] = useState(false);
  const [expirationDate, setExpirationDate] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
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
          'Eroare',
          'Nu se poate deschide documentul. Linkul poate fi invalid sau expirat.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Eroare',
        'Nu s-a putut deschide documentul. Încercați din nou mai târziu.',
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
          text: 'Deschide',
          onPress: () => openDocument(document.url)
        },
        {
          text: 'Distribuie',
          onPress: () => shareDocument(document)
        },
        {
          text: 'Descarcă',
          onPress: () => downloadDocument(document)
        },
        {
          text: 'Șterge',
          style: 'destructive',
          onPress: () => confirmDeleteDocument(document)
        },
        {
          text: 'Anulează',
          style: 'cancel'
        }
      ]
    );
  };
  const shareDocument = (document) => {
    // Implementation for sharing document
    Alert.alert('Distribuire', `Funcționalitatea de distribuire pentru ${document.name} va fi implementată aici`);
  };
  // Function to download document (placeholder)
  const downloadDocument = (document) => {
    // Implementation for downloading document
    Alert.alert('Descărcare', `Funcționalitatea de descărcare pentru ${document.name} va fi implementată aici`);
  };
  const confirmDeleteDocument = (document) => {
    Alert.alert(
      'Șterge Document',
      `Sunteți sigur că doriți să ștergeți "${document.name}"? Această acțiune nu poate fi anulată.`,
      [
        {
          text: 'Anulează',
          style: 'cancel'
        },
        {
          text: 'Șterge',
          style: 'destructive',
          onPress: () => deleteDocument(document.id)
        }
      ]
    );
  };
  const deleteDocument = async (documentId) => {
    try {
      await deleteDocumentMutation(documentId).unwrap();
      Alert.alert('Succes', 'Documentul a fost șters cu succes!');
      // Refresh the documents list
      await refetchDocuments();
    } catch (error) {
      Alert.alert('Eroare', 'Nu s-a putut șterge documentul. Încercați din nou.');
    }
  };
  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
        const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
          Alert.alert('Permisiune necesară', 'Sunt necesare permisiunile pentru cameră și galeria foto pentru a utiliza această funcție.');
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
      // Backend accepts up to 20MB
      if (fileSize > 20 * 1024 * 1024) {
        Alert.alert('Fișier prea mare', 'Fișierul este prea mare. Dimensiunea maximă acceptată este 20MB.');
        return;
      }
      // Validate file type more strictly
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(fileInfo.mimeType)) {
        Alert.alert('Format neacceptat', 'Formatul fișierului nu este acceptat. Folosiți doar PDF, DOCX, JPG sau PNG.');
        return;
      }
      setSelectedFile(fileInfo);
    } catch (error) {
      Alert.alert('Eroare', 'A apărut o eroare la selectarea documentului.');
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
      // Backend accepts up to 20MB
      if (fileSize > 20 * 1024 * 1024) {
        Alert.alert('Fișier prea mare', 'Fișierul este prea mare. Dimensiunea maximă acceptată este 20MB.');
        return;
      }
      setSelectedFile(fileInfo);
    } catch (error) {
      Alert.alert('Eroare', 'A apărut o eroare la realizarea fotografiei.');
    }
  };
  const getFileSize = async (uri) => {
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      return fileInfo.size;
    } catch (error) {
      return 0;
    }
  };
  const getFileName = (uri) => {
    return uri.split('/').pop();
  };
  const uploadDocument = async () => {
    if (!selectedFile) {
      Alert.alert('Niciun fișier selectat', 'Vă rugăm să selectați un document pentru încărcare.');
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
        category: category,
        expiration_date: expirationDate || null
      }).unwrap();
      Alert.alert('Succes', 'Documentul a fost încărcat cu succes!');
      // Reset the form
      setSelectedFile(null);
      setCategory('');
      setExpirationDate('');
      // Refresh the documents list
      await refetchDocuments();
    } catch (error) {
      // Use the error message from the service which already uses our enhanced error handler
      const userMessage = error.message || 'A apărut o eroare la încărcarea documentului. Încercați din nou.';
      Alert.alert('Eroare', userMessage);
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
        {/* Upload Section - Redesigned */}
        <View style={styles.uploadSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconContainer}>
              <Ionicons name="cloud-upload-outline" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>Încarcă Document</Text>
              <Text style={styles.sectionSubtitle}>Selectează și încarcă documentele personale</Text>
            </View>
          </View>
          {/* Quick Action Cards */}
          <View style={styles.actionCardsContainer}>
            {/* Document Type Selector Card */}
            <TouchableOpacity
              style={[styles.actionCard, category && styles.actionCardSelected]}
              onPress={() => setShowCategoryModal(true)}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: category ? '#6366F1' : '#E5E7EB' }]}>
                <Ionicons name="document-outline" size={28} color={category ? "#FFFFFF" : "#9CA3AF"} />
              </View>
              <Text style={styles.actionLabel}>Tip Document</Text>
              <Text style={[styles.actionDescription, category && styles.actionDescriptionSelected]} numberOfLines={2}>
                {category ? getDocumentTitle() : 'Selectează tipul'}
              </Text>
            </TouchableOpacity>
            {/* Expiration Date Card */}
            <TouchableOpacity
              style={[styles.actionCard, expirationDate && styles.actionCardSelected]}
              onPress={() => setShowCalendar(true)}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: expirationDate ? '#10B981' : '#E5E7EB' }]}>
                <Ionicons name="calendar-outline" size={28} color={expirationDate ? "#FFFFFF" : "#9CA3AF"} />
              </View>
              <Text style={styles.actionLabel}>Data Expirării</Text>
              <Text style={[styles.actionDescription, expirationDate && styles.actionDescriptionSelected]} numberOfLines={2}>
                {expirationDate ? new Date(expirationDate).toLocaleDateString('ro-RO') : 'Opțional'}
              </Text>
            </TouchableOpacity>
          </View>
          {/* File Preview Section */}
          {selectedFile && (
            <View style={styles.filePreviewSection}>
              <View style={styles.filePreviewContent}>
                <View style={styles.fileIconWrapper}>
                  <MaterialCommunityIcons name="file-check" size={32} color="#10B981" />
                </View>
                <View style={styles.fileDetails}>
                  <Text style={styles.fileName} numberOfLines={1} ellipsizeMode="middle">
                    {getFileName(selectedFile.uri)}
                  </Text>
                  <Text style={styles.fileStatus}>Document selectat ✓</Text>
                </View>
                <TouchableOpacity
                  style={styles.removeFileButton}
                  onPress={() => setSelectedFile(null)}
                >
                  <Ionicons name="close-circle" size={24} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          )}
          {/* Upload Methods */}
          <View style={styles.uploadMethodsContainer}>
            <Text style={styles.uploadMethodsTitle}>Alege modul de încărcare</Text>
            {/* File Upload Option */}
            <TouchableOpacity
              style={[styles.uploadMethodCard, !category && styles.disabledUploadMethod]}
              onPress={pickDocument}
              disabled={!category}
            >
              <View style={styles.uploadMethodIcon}>
                <Ionicons name="folder-open-outline" size={24} color={category ? "#6366F1" : "#9CA3AF"} />
              </View>
              <View style={styles.uploadMethodContent}>
                <Text style={[styles.uploadMethodTitle, !category && styles.disabledText]}>
                  Selectează din fișiere
                </Text>
                <Text style={[styles.uploadMethodSubtitle, !category && styles.disabledText]}>
                  PDF, DOCX, JPG, PNG (max 10MB)
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={category ? "#6366F1" : "#9CA3AF"} />
            </TouchableOpacity>
            {/* Camera Option */}
            <TouchableOpacity
              style={[styles.uploadMethodCard, !category && styles.disabledUploadMethod]}
              onPress={takePicture}
              disabled={!category}
            >
              <View style={styles.uploadMethodIcon}>
                <Ionicons name="camera-outline" size={24} color={category ? "#EF4444" : "#9CA3AF"} />
              </View>
              <View style={styles.uploadMethodContent}>
                <Text style={[styles.uploadMethodTitle, !category && styles.disabledText]}>
                  Fotografiază documentul
                </Text>
                <Text style={[styles.uploadMethodSubtitle, !category && styles.disabledText]}>
                  Deschide camera și fă o poză
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={category ? "#EF4444" : "#9CA3AF"} />
            </TouchableOpacity>
          </View>
          {/* Upload Button */}
          <TouchableOpacity
            style={[styles.uploadButton, (!selectedFile || !category || isUploading) && styles.disabledUploadButton]}
            onPress={uploadDocument}
            disabled={!selectedFile || !category || isUploading}
          >
            <View style={styles.uploadButtonContent}>
              {isUploading ? (
                <>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.uploadButtonText}>Se încarcă...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="cloud-upload" size={20} color="#FFFFFF" />
                  <Text style={styles.uploadButtonText}>Încarcă Documentul</Text>
                </>
              )}
            </View>
          </TouchableOpacity>
          {/* Help Text */}
          <View style={styles.helpContainer}>
            <Ionicons name="information-circle-outline" size={16} color="#6B7280" />
            <Text style={styles.helpText}>
              Documentele încărcate vor fi disponibile în secțiunea "Documente Recente" și vor putea fi accesate de dispatcher.
            </Text>
          </View>
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
              <Text style={styles.errorText}>
                {error.message || 'Nu s-au putut încărca documentele. Verificați conexiunea și încercați din nou.'}
              </Text>
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
      {/* Calendar Modal */}
      <Calendar
        visible={showCalendar}
        onClose={() => setShowCalendar(false)}
        selectedDate={expirationDate}
        onDateSelect={(date) => setExpirationDate(date)}
        minDate={new Date().toISOString().split('T')[0]} // Today's date as minimum
      />
    </SafeAreaView>
  );
};
export default DocumentsScreen;