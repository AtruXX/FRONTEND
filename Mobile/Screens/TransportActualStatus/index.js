import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, SafeAreaView, Alert, KeyboardAvoidingView, Platform, Modal, FlatList, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useGetUserProfileQuery } from '../../services/profileService';
import { 
  useGetActiveTransportStatusQuery, 
  useUpdateTransportStatusMutation,
  useUploadGoodsPhotosMutation,
  useGetGoodsPhotosQuery 
} from '../../services/statusService';
import { styles } from './styles';

const TransportStatusPage = ({ navigation }) => {
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [activeField, setActiveField] = useState(null);
  const [modalOptions, setModalOptions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [capturedPhotos, setCapturedPhotos] = useState([]);

  // Get user profile to get active transport ID
  const {
    data: profileData,
    isLoading: profileLoading,
    error: profileError,
    refetch: refetchProfile
  } = useGetUserProfileQuery();

  const activeTransportId = profileData?.active_transport;

  // Get current transport status
  const {
    data: transportStatus,
    isLoading: statusLoading,
    error: statusError,
    refetch: refetchStatus
  } = useGetActiveTransportStatusQuery(activeTransportId);

  // Get existing goods photos
  const {
    data: goodsPhotos,
    isLoading: photosLoading,
    refetch: refetchPhotos
  } = useGetGoodsPhotosQuery(activeTransportId);

  // Mutations
  const [updateTransportStatus, { isLoading: isUpdating }] = useUpdateTransportStatusMutation();
  const [uploadGoodsPhotos, { isLoading: isUploading }] = useUploadGoodsPhotosMutation();

  // Status form data - initialize with API data
  const [statusFormData, setStatusFormData] = useState({
    is_finished: false,
    status_truck: "",
    status_truck_problems: "",
    status_goods: "",
    status_coupling: "",
    status_trailer: "",
    status_trailer_description: "",
    status_loaded_truck: "",
    status_transport: "",
    delay_estimation: null
  });

  // Update form data when API data is loaded
  useEffect(() => {
    if (transportStatus) {
      setStatusFormData({
        is_finished: transportStatus.is_finished || false,
        status_truck: transportStatus.status_truck || "",
        status_truck_problems: transportStatus.status_truck_problems || "",
        status_goods: transportStatus.status_goods || "",
        status_coupling: transportStatus.status_coupling || "",
        status_trailer: transportStatus.status_trailer || "",
        status_trailer_description: transportStatus.status_trailer_description || "",
        status_loaded_truck: transportStatus.status_loaded_truck || "",
        status_transport: transportStatus.status_transport || "",
        delay_estimation: transportStatus.delay_estimation || null
      });
    }
  }, [transportStatus]);

  // Define Status fields with Romanian options
  const statusFields = [
    { 
      key: 'status_truck', 
      label: 'Stare Camion', 
      placeholder: 'Selectați starea camionului', 
      type: 'options',
      options: ['În regulă', 'Nu este în regulă'],
      linkedField: 'status_truck_problems',
      linkedFieldVisible: (value) => value === 'Nu este în regulă'
    },
    { 
      key: 'status_truck_problems', 
      label: 'Descrieți pe scurt problemele', 
      placeholder: 'Descrieți problemele camionului', 
      type: 'text',
      conditionalDisplay: true
    },
    { 
      key: 'status_goods', 
      label: 'Stare Marfă', 
      placeholder: 'Selectați starea mărfii', 
      type: 'options',
      options: ['În regulă', 'Nu este în regulă'],
      linkedField: 'goods_photo',
      linkedFieldVisible: (value) => value === 'Nu este în regulă'
    },
    { 
      key: 'goods_photo', 
      label: 'Faceți o poză mărfii', 
      placeholder: 'Apăsați pentru a face o poză', 
      type: 'camera',
      conditionalDisplay: true
    },
    { 
      key: 'status_coupling', 
      label: 'Stare Cuplare', 
      placeholder: 'Selectați starea cuplării', 
      type: 'options',
      options: ['Cuplat', 'Decuplat', 'Probleme la cuplare']
    },
    { 
      key: 'status_trailer', 
      label: 'Stare Remorcă', 
      placeholder: 'Selectați starea remorcii', 
      type: 'options',
      options: ['În regulă', 'Nu este în regulă'],
      linkedField: 'status_trailer_description',
      linkedFieldVisible: (value) => value === 'Nu este în regulă'
    },
    { 
      key: 'status_trailer_description', 
      label: 'Descriere problemă remorcă', 
      placeholder: 'Descrieți problema remorcii', 
      type: 'text',
      conditionalDisplay: true
    },
    { 
      key: 'status_loaded_truck', 
      label: 'Stare Încărcare', 
      placeholder: 'Selectați starea încărcării', 
      type: 'options',
      options: ['Încărcat complet', 'Încărcat parțial', 'Descărcat', 'În curs de încărcare', 'În curs de descărcare']
    },
    { 
      key: 'status_transport', 
      label: 'Stare Transport', 
      placeholder: 'Selectați starea transportului', 
      type: 'options',
      options: ['La timp', 'Întârziat', 'Început', 'În curs', 'Finalizat'],
      linkedField: 'delay_estimation',
      linkedFieldVisible: (value) => value === 'Întârziat'
    },
    { 
      key: 'delay_estimation', 
      label: 'Estimare întârziere (ore)', 
      placeholder: 'Introduceți numărul de ore întârziere', 
      type: 'text',
      conditionalDisplay: true
    }
  ];

  // Get current fields (showing 2 at a time, filtering conditional fields)
  const getCurrentFields = () => {
    const allFields = statusFields.slice(currentIndex, currentIndex + 4);
    return allFields.filter(field => {
      if (!field.conditionalDisplay) return true;
      
      const controllingField = statusFields.find(f => f.linkedField === field.key);
      if (!controllingField) return false;
      
      return controllingField.linkedFieldVisible(statusFormData[controllingField.key]);
    }).slice(0, 2);
  };

  // Update form data
  const setFormData = (key, value) => {
    setStatusFormData({
      ...statusFormData,
      [key]: value
    });
  };

  // Calculate total pages
  const getTotalPages = () => {
    let visibleFieldCount = 0;
    let i = 0;
    while (i < statusFields.length) {
      const field = statusFields[i];
      if (!field.conditionalDisplay) {
        visibleFieldCount++;
      } else {
        const controllingField = statusFields.find(f => f.linkedField === field.key);
        if (controllingField && controllingField.linkedFieldVisible(statusFormData[controllingField.key])) {
          visibleFieldCount++;
        }
      }
      i++;
    }
    return Math.ceil(visibleFieldCount / 2);
  };

  const currentPage = Math.floor(currentIndex / 2) + 1;
  const totalPages = getTotalPages();

  // Handle options selection
  const handleOptionSelect = (option) => {
    if (activeField) {
      setFormData(activeField, option);
      setShowOptionsModal(false);
      setActiveField(null);
    }
  };

  // Handle camera capture
  const handleCameraCapture = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permisiune necesară', 'Avem nevoie de permisiunea de a accesa camera.');
      return;
    }
    
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });
    
    if (!result.canceled) {
      const newPhoto = {
        uri: result.assets[0].uri,
        type: 'image/jpeg',
        name: `goods_photo_${Date.now()}.jpg`
      };
      setCapturedPhotos([...capturedPhotos, newPhoto]);
    }
  };

  // Handle field touch
  const handleFieldTouch = (field) => {
    if (field.type === 'options') {
      setActiveField(field.key);
      setModalOptions(field.options);
      setShowOptionsModal(true);
    } else if (field.type === 'camera') {
      handleCameraCapture();
    }
  };

  // Check if current fields are valid
  const areCurrentFieldsValid = () => {
    const currentFields = getCurrentFields();
    
    return currentFields.every(field => {
      if (field.type === 'camera') return true;
      return statusFormData[field.key] !== undefined && statusFormData[field.key] !== "";
    });
  };

  // Handle next fields/page
  const handleNext = () => {
    if (!areCurrentFieldsValid()) {
      Alert.alert('Câmpuri obligatorii', 'Vă rugăm să completați toate câmpurile pentru a continua.');
      return;
    }

    let newIndex = currentIndex + 2;
    
    while (newIndex < statusFields.length) {
      const field = statusFields[newIndex];
      if (field.conditionalDisplay) {
        const controllingField = statusFields.find(f => f.linkedField === field.key);
        if (!controllingField || !controllingField.linkedFieldVisible(statusFormData[controllingField.key])) {
          newIndex++;
          continue;
        }
      }
      break;
    }
    
    if (newIndex < statusFields.length) {
      setCurrentIndex(newIndex);
    } else {
      handleSubmit();
    }
  };

  // Handle previous fields/page
  const handlePrevious = () => {
    if (currentIndex >= 2) {
      setCurrentIndex(currentIndex - 2);
    } else {
      navigation.goBack();
    }
  };

  // Handle form submission
  // Handle form submission
const handleSubmit = async () => {
  try {
    // First upload photos if any
    if (capturedPhotos.length > 0) {
      await uploadGoodsPhotos({ 
        activeTransportId, 
        photos: capturedPhotos 
      }).unwrap();
    }

    // Then update transport status - FIXED: Pass activeTransportId
    await updateTransportStatus({ 
      statusData: statusFormData, 
      activeTransportId: activeTransportId 
    }).unwrap();

    Alert.alert(
      'Status Actualizat',
      'Statusul transportului a fost actualizat cu succes!',
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  } catch (error) {
    console.error('Submit error:', error);
    Alert.alert('Eroare', 'Nu s-a putut actualiza statusul transportului.');
  }
};

  // Handle submit now (bypass validation)
  const handleSubmitNow = async () => {
    Alert.alert(
      'Trimiteți formularul?',
      'Câmpurile necompletate vor fi salvate ca goale. Doriți să continuați?',
      [
        {
          text: 'Anulează',
          style: 'cancel'
        },
        {
          text: 'Trimite',
          onPress: handleSubmit
        }
      ]
    );
  };

  // Get progress percentage
  const getProgressPercentage = () => {
    return ((currentPage) / totalPages) * 100;
  };

  // Render options selection modal
  const renderOptionsModal = () => (
    <Modal
      visible={showOptionsModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowOptionsModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Selectați o opțiune</Text>
            <TouchableOpacity onPress={() => setShowOptionsModal(false)}>
              <Ionicons name="close" size={24} color="#373A56" />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={modalOptions}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.optionItem}
                onPress={() => handleOptionSelect(item)}
              >
                <Text style={styles.optionText}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );

  // Render input based on field type
  const renderInput = (field) => {
    if (field.type === 'options') {
      return (
        <TouchableOpacity
          style={styles.selectInput}
          onPress={() => handleFieldTouch(field)}
        >
          <Text style={statusFormData[field.key] ? styles.selectInputText : styles.selectInputPlaceholder}>
            {statusFormData[field.key] || field.placeholder}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#A0A4C1" />
        </TouchableOpacity>
      );
    } else if (field.type === 'camera') {
      return (
        <TouchableOpacity
          style={styles.cameraButton}
          onPress={() => handleFieldTouch(field)}
        >
          {capturedPhotos.length > 0 ? (
            <View style={styles.photoPreviewContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {capturedPhotos.map((photo, index) => (
                  <Image key={index} source={{ uri: photo.uri }} style={styles.photoPreview} />
                ))}
              </ScrollView>
              <Text style={styles.photoTakenText}>{capturedPhotos.length} poze realizate</Text>
            </View>
          ) : (
            <View style={styles.cameraButtonContent}>
              <Ionicons name="camera" size={24} color="#5A5BDE" />
              <Text style={styles.cameraButtonText}>{field.placeholder}</Text>
            </View>
          )}
        </TouchableOpacity>
      );
    } else {
      return (
        <TextInput
          style={styles.input}
          value={String(statusFormData[field.key] || '')}
          onChangeText={(text) => setFormData(field.key, text)}
          placeholder={field.placeholder}
          placeholderTextColor="#A0A4C1"
          keyboardType={field.key === 'delay_estimation' ? 'numeric' : 'default'}
        />
      );
    }
  };

  if (profileLoading || statusLoading) {
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
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={40} color="#FF7285" />
          <Text style={styles.emptyTitle}>Niciun transport activ</Text>
          <Text style={styles.emptyText}>Nu aveți un transport activ pentru a actualiza statusul.</Text>
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

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handlePrevious} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#373A56" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Status Transport</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${getProgressPercentage()}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText} numberOfLines={1} adjustsFontSizeToFit>
            Pasul {currentPage} din {totalPages}
          </Text>
        </View>

        <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
          {getCurrentFields().map((field) => (
            <View key={field.key} style={styles.inputContainer}>
              <Text style={styles.label}>{field.label}</Text>
              {renderInput(field)}
            </View>
          ))}
        </ScrollView>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.prevButton]} 
            onPress={handlePrevious}
          >
            <Ionicons name="arrow-back" size={20} color="white" />
            <Text style={styles.buttonText}>Înapoi</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.submitNowButton]} 
            onPress={handleSubmitNow}
            disabled={isUpdating || isUploading}
          >
            {isUpdating || isUploading ? (
              <Ionicons name="hourglass-outline" size={20} color="white" />
            ) : (
              <Ionicons name="checkmark" size={20} color="white" />
            )}
            <Text style={styles.buttonText}>
              {isUpdating || isUploading ? 'Se salvează...' : 'Trimite acum'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.button, 
              styles.nextButton,
              !areCurrentFieldsValid() && styles.disabledButton
            ]} 
            onPress={handleNext}
            disabled={!areCurrentFieldsValid()}
          >
            <Text style={styles.buttonText}>
              {currentIndex + 2 >= statusFields.length ? 'Finalizare' : 'Mai Departe'}
            </Text>
            <Ionicons 
              name={currentIndex + 2 >= statusFields.length ? "checkmark" : "arrow-forward"} 
              size={20} 
              color="white" 
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {renderOptionsModal()}
    </SafeAreaView>
  );
};


export default TransportStatusPage;