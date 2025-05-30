import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, SafeAreaView, Alert, KeyboardAvoidingView, Platform, Modal, FlatList, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import { styles } from './styles'; // Import your styles from the styles.js file

const StatusTransportForm = ({ navigation, route }) => {
  const { authToken, driverId } = route.params;
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [activeField, setActiveField] = useState(null);
  const [modalOptions, setModalOptions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [capturedImage, setCapturedImage] = useState(null);

  // Status form data
  const [statusFormData, setStatusFormData] = useState({
    status_truck: "",
    status_truck_problems: "",
    status_goods: "",
    goods_photo: null,
    truck_combination: "",
    status_coupling: "",
    trailer_type: "",
    trailer_number: "",
    status_trailer_wagon: "",
    status_trailer_wagon_description: "",
    status_loaded_truck: "",
    status_transport: "",
    delay_estimation: ""
  });

  // Define Status fields with the new options structure
  const statusFields = [
    { 
      key: 'status_truck', 
      label: 'Stare Camion', 
      placeholder: 'Selectați starea camionului', 
      type: 'options',
      options: ['OK', 'Not OK'],
      linkedField: 'status_truck_problems',
      linkedFieldVisible: (value) => value === 'Not OK'
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
      options: ['OK', 'Not OK'],
      linkedField: 'goods_photo',
      linkedFieldVisible: (value) => value === 'Not OK'
    },
    { 
      key: 'goods_photo', 
      label: 'Faceți o poză', 
      placeholder: 'Apăsați pentru a face o poză', 
      type: 'camera',
      conditionalDisplay: true
    },
    { 
      key: 'truck_combination', 
      label: 'Combinație Camion', 
      placeholder: 'Selectați combinația camionului', 
      type: 'options',
      options: ['Semi-remorcă', 'Prelată', 'Frigorific', 'Platforme', 'Transport containere']
    },
    { 
      key: 'status_coupling', 
      label: 'Stare Cuplare', 
      placeholder: 'Selectați starea cuplării', 
      type: 'options',
      options: ['Cuplat', 'Decuplat']
    },
    { 
      key: 'trailer_type', 
      label: 'Tip Remorcă', 
      placeholder: 'Selectați tipul remorcii', 
      type: 'options',
      options: ['Prelată', 'Frigorific', 'Platforme']
    },
    { 
      key: 'trailer_number', 
      label: 'Număr Remorcă', 
      placeholder: 'Introduceți numărul remorcii', 
      type: 'text'
    },
    { 
      key: 'status_trailer_wagon', 
      label: 'Stare Vagon', 
      placeholder: 'Selectați starea vagonului', 
      type: 'options',
      options: ['OK', 'Not OK'],
      linkedField: 'status_trailer_wagon_description',
      linkedFieldVisible: (value) => value === 'Not OK'
    },
    { 
      key: 'status_trailer_wagon_description', 
      label: 'Scrieți o descriere', 
      placeholder: 'Descrieți problema vagonului', 
      type: 'text',
      conditionalDisplay: true
    },
    { 
      key: 'status_loaded_truck', 
      label: 'Stare Încărcare', 
      placeholder: 'Selectați starea încărcării', 
      type: 'options',
      options: ['Încărcat', 'Descărcat']
    },
    { 
      key: 'status_transport', 
      label: 'Stare Transport', 
      placeholder: 'Selectați starea transportului', 
      type: 'options',
      options: ['Punctual', 'Întârziat'],
      linkedField: 'delay_estimation',
      linkedFieldVisible: (value) => value === 'Întârziat'
    },
    { 
      key: 'delay_estimation', 
      label: 'Ce întârziere aproximativă?', 
      placeholder: 'Estimați întârzierea', 
      type: 'text',
      conditionalDisplay: true
    }
  ];

  // Get current fields (showing 2 at a time, filtering conditional fields)
  const getCurrentFields = () => {
    const allFields = statusFields.slice(currentIndex, currentIndex + 4); // Get more fields to accommodate conditional ones
    return allFields.filter(field => {
      if (!field.conditionalDisplay) return true;
      
      // Find the field that controls this conditional field
      const controllingField = statusFields.find(f => f.linkedField === field.key);
      if (!controllingField) return false;
      
      // Check if the condition is met
      return controllingField.linkedFieldVisible(statusFormData[controllingField.key]);
    }).slice(0, 2); // Only show 2 at a time
  };

  // Update form data
  const setFormData = (key, value) => {
    setStatusFormData({
      ...statusFormData,
      [key]: value
    });

    // Find the field definition
    const field = statusFields.find(f => f.key === key);
    
    // If this field has a linked field, check if we need to show/hide it
    if (field && field.linkedField) {
      const shouldShowLinked = field.linkedFieldVisible(value);
      if (shouldShowLinked) {
        // If we need to show the linked field, update current fields
        // This will be handled by getCurrentFields() filtering
      }
    }
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
        // Find the field that controls this conditional field
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

  // Handle camera
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
      setCapturedImage(result.assets[0].uri);
      setFormData('goods_photo', result.assets[0].uri);
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
      // Special case for camera type, it's optional
      if (field.type === 'camera') return true;
      
      // For all other fields, ensure they have a value
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
    
    // Skip conditional fields that shouldn't be displayed
    while (newIndex < statusFields.length) {
      const field = statusFields[newIndex];
      if (field.conditionalDisplay) {
        // Find the field that controls this conditional field
        const controllingField = statusFields.find(f => f.linkedField === field.key);
        if (!controllingField || !controllingField.linkedFieldVisible(statusFormData[controllingField.key])) {
          // Skip this field
          newIndex++;
          continue;
        }
      }
      break;
    }
    
    if (newIndex < statusFields.length) {
      setCurrentIndex(newIndex);
    } else {
      // Form is complete
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

  // Prepare data for submission
  const prepareFormDataForSubmission = () => {
    const preparedData = { ...statusFormData };
    
    statusFields.forEach(field => {
      if (preparedData[field.key] === '' || preparedData[field.key] === undefined) {
        preparedData[field.key] = null;
      }
    });
    
    return preparedData;
  };

  // Handle form submission
  const handleSubmit = async () => {
    const dataToSubmit = prepareFormDataForSubmission();
    
    console.log('STATUS Form submitted:', dataToSubmit);
    // Add your API call for status form here
    Alert.alert(
      'Transport Salvat',
      'Datele STATUS au fost salvate cu succes!',
      [{ text: 'OK', onPress: () => navigation.navigate('TransportMainPage') }]
    );
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
              <Ionicons name="close" size={24} color="#333" />
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
          <Ionicons name="chevron-down" size={20} color="#6B7280" />
        </TouchableOpacity>
      );
    } else if (field.type === 'camera') {
      return (
        <TouchableOpacity
          style={styles.cameraButton}
          onPress={() => handleFieldTouch(field)}
        >
          {statusFormData[field.key] ? (
            <View style={styles.photoPreviewContainer}>
              <Image source={{ uri: statusFormData[field.key] }} style={styles.photoPreview} />
              <Text style={styles.photoTakenText}>Poză realizată</Text>
            </View>
          ) : (
            <View style={styles.cameraButtonContent}>
              <Ionicons name="camera" size={24} color="#3B82F6" />
              <Text style={styles.cameraButtonText}>{field.placeholder}</Text>
            </View>
          )}
        </TouchableOpacity>
      );
    } else {
      return (
        <TextInput
          style={styles.input}
          value={String(statusFormData[field.key])}
          onChangeText={(text) => setFormData(field.key, text)}
          placeholder={field.placeholder}
          placeholderTextColor="#9CA3AF"
        />
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handlePrevious} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
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
          <Text style={styles.progressText}>Pagina {currentPage} din {totalPages}</Text>
        </View>

        <ScrollView style={styles.formContainer}>
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
            style={[styles.button, styles.prevButton]} 
            onPress={handleSubmitNow}
          >
            <Ionicons name="checkmark" size={20} color="white" />
            <Text style={styles.buttonText}>Trimite acum</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.button, 
              styles.prevButton,
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

export default StatusTransportForm;