import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, SafeAreaView, Alert, KeyboardAvoidingView, Platform, Modal, FlatList, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { styles } from './styles'; // Import your styles from the styles.js file

const TransportForm = ({ navigation }) => {
  // Initial state to track form type choice
  const [formType, setFormType] = useState(null); // null, 'cmr', or 'status'
  // Add this to your initial state declarations
  const [transportId, setTransportId] = useState(null);
  // Modal states
  const [showCountryModal, setShowCountryModal] = useState(false);
  //const [showCalendar, setShowCalendar] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [activeField, setActiveField] = useState(null);
  const [modalOptions, setModalOptions] = useState([]);
  const [showProblemsInput, setShowProblemsInput] = useState(false);
  const [showDelayInput, setShowDelayInput] = useState(false);
  const [driverId, setDriverId] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  // Reference for capturing images
  const [capturedImage, setCapturedImage] = useState(null);
  
  const BASE_URL = "https://atrux-717ecf8763ea.herokuapp.com/api/v0.1/";

  // Current date for calendar default
  const today = new Date();
  const formattedToday = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
  
  // List of European countries in Romanian
  const europeanCountries = [
    'Albania', 'Andorra', 'Austria', 'Belarus', 'Belgia', 'Bosnia și Herțegovina', 
    'Bulgaria', 'Cehia', 'Cipru', 'Croația', 'Danemarca', 'Elveția', 'Estonia', 
    'Finlanda', 'Franța', 'Germania', 'Grecia', 'Irlanda', 'Islanda', 'Italia', 
    'Letonia', 'Liechtenstein', 'Lituania', 'Luxemburg', 'Macedonia de Nord', 
    'Malta', 'Moldova', 'Monaco', 'Muntenegru', 'Norvegia', 'Olanda', 'Polonia', 
    'Portugalia', 'Regatul Unit', 'România', 'Rusia', 'San Marino', 'Serbia', 
    'Slovacia', 'Slovenia', 'Spania', 'Suedia', 'Turcia', 'Ucraina', 'Ungaria', 
    'Vatican'
  ];
  React.useEffect(() => {
    
    const loadAuthToken = async () => {
      try {
        console.log('Attempting to load auth token from AsyncStorage');
        const token = await AsyncStorage.getItem('authToken');
        console.log('Token from AsyncStorage:', token ? 'Token exists' : 'No token found');
        
        if (token) {
          setAuthToken(token);
          console.log('Auth token loaded and set in state');
          // Once we have the token, fetch the profile to get driverId
          fetchDriverProfile(token);
        } else {
          console.error("No auth token found in AsyncStorage");
          Alert.alert('Eroare', 'Sesiune expirată. Vă rugăm să vă autentificați din nou.');
        }
      } catch (error) {
        console.error("Error loading auth token:", error);
        Alert.alert('Eroare', 'Nu s-a putut încărca token-ul de autentificare.');
      }
    };
      
    
    loadAuthToken();
  }, []);
  const fetchDriverProfile = async (token) => {
    try {
      const response = await fetch(
        `${BASE_URL}profile/`,
        {
          method: "GET",
          headers: {
            "Authorization": `Token ${token}`
          }
        }
      );
      
      if (response.ok) {
        const profileData = await response.json();
        setDriverId(profileData.id); // Assuming the API returns an id field
        console.log("Driver ID set:", profileData.id);
      } else {
        console.error("Failed to fetch driver profile");
        Alert.alert('Eroare', 'Nu s-a putut obține profilul șoferului.');
      }
    } catch (error) {
      console.error("Error fetching driver profile:", error);
      Alert.alert('Eroare', 'Verificați conexiunea la internet.');
    }
  };
  const fetchLatestTransport = async (token, driverId) => {
    console.log("fetchLatestTransport called");
    console.log("Driver ID:", driverId);
    console.log("Token:", token);
  
    try {
      const url = `${BASE_URL}transport?driver_id=${driverId}`;
      console.log("Fetching URL:", url);
  
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Authorization": `Token ${token}`
        }
      });
  
      console.log("Fetch response status:", response.status);
  
      if (response.ok) {
        const transportData = await response.json();
        console.log("Raw transport data:", transportData);
  
        if (Array.isArray(transportData) && transportData.length > 0) {
          const latestTransport = transportData[0];
          console.log("Latest transport found:", latestTransport);
  
          if (latestTransport.id) {
            console.log("Setting transport ID:", latestTransport.id);
            setTransportId(latestTransport.id);
          } else {
            console.warn("No transport ID found in the latest transport data.");
          }
        } else {
          console.warn("Transport data is empty or not an array.");
        }
      } else {
        console.error("Fetch failed with status:", response.status);
        const errorText = await response.text();
        console.error("Error response text:", errorText);
      }
    } catch (error) {
      console.error("Transport fetch error:", error);
    }
  };
  
  // CMR form data
  const [cmrFormData, setCmrFormData] = useState({
    expeditor_nume: '',
    expeditor_adresa: '',
    expeditor_tara: '',
    destinatar_nume: '',
    destinatar_adresa: '',
    destinatar_tara: '',
    loc_livrare: '',
    loc_incarcare: '',
    //data_incarcare: formattedToday,
    marci_numere: '',
    numar_colete: '',
    mod_ambalare: '',
    natura_marfii: '',
    nr_static: '',
    greutate_bruta: '',
    cubaj: '',
    instructiuni_expeditor: '',
    conventii_speciale: '',
  });
  
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
  
  // Define CMR fields
  const cmrFields = [
    
    { key: 'expeditor_nume', label: 'Nume Expeditor', placeholder: 'Introduceți numele expeditorului', type: 'text' },
    { key: 'expeditor_adresa', label: 'Adresa Expeditor', placeholder: 'Introduceți adresa completă', type: 'text' },
    { key: 'expeditor_tara', label: 'Țara Expeditor', placeholder: 'Selectați țara expeditorului', type: 'country' },
    { key: 'destinatar_nume', label: 'Nume Destinatar', placeholder: 'Introduceți numele destinatarului', type: 'text' },
    { key: 'destinatar_adresa', label: 'Adresa Destinatar', placeholder: 'Introduceți adresa completă', type: 'text' },
    { key: 'destinatar_tara', label: 'Țara Destinatar', placeholder: 'Selectați țara destinatarului', type: 'country' },
    { key: 'loc_livrare', label: 'Locul Livrării Mărfii', placeholder: 'Introduceți locația de livrare', type: 'text' },
    { key: 'loc_incarcare', label: 'Locul Încărcării', placeholder: 'Introduceți locația de încărcare', type: 'text' },
    { key: 'marci_numere', label: 'Mărci/Numere', placeholder: 'Introduceți mărci și numere', type: 'number' },
    { key: 'numar_colete', label: 'Număr de Colete', placeholder: 'Introduceți numărul', type: 'number' },
    { key: 'mod_ambalare', label: 'Mod de Ambalare', placeholder: 'Descrieți modul de ambalare', type: 'text' },
    { key: 'natura_marfii', label: 'Natura Mărfii', placeholder: 'Descrieți natura mărfii', type: 'text' },
    { key: 'nr_static', label: 'Nr Static', placeholder: 'Introduceți numărul static', type: 'number' },
    { key: 'greutate_bruta', label: 'Greutate Brută (kg)', placeholder: 'Introduceți greutatea', type: 'number' },
    { key: 'cubaj', label: 'Cubaj (m³)', placeholder: 'Introduceți cubajul', type: 'number' },
    { key: 'instructiuni_expeditor', label: 'Instrucțiuni Expeditor', placeholder: 'Introduceți instrucțiuni', type: 'text' },
    { key: 'conventii_speciale', label: 'Convenții Speciale', placeholder: 'Introduceți convenții speciale', type: 'text' },
  ];


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


  // Track current index in the field list (showing 2 at a time)
  const [currentIndex, setCurrentIndex] = useState(0);


  // Get current fields and form data based on form type
  const getCurrentFields = () => {
    if (formType === 'cmr') {
      return cmrFields.slice(currentIndex, currentIndex + 2);
    } else if (formType === 'status') {
      // Filter out conditional display fields unless their linked field condition is met
      const allFields = statusFields.slice(currentIndex, currentIndex + 4); // Get more fields to accommodate conditional ones
      return allFields.filter(field => {
        if (!field.conditionalDisplay) return true;
        
        // Find the field that controls this conditional field
        const controllingField = statusFields.find(f => f.linkedField === field.key);
        if (!controllingField) return false;
        
        // Check if the condition is met
        return controllingField.linkedFieldVisible(statusFormData[controllingField.key]);
      }).slice(0, 2); // Only show 2 at a time
    }
    return [];
  };


  // Get current form data based on form type
  const getFormData = () => {
    return formType === 'cmr' ? cmrFormData : statusFormData;
  };


  // Update form data
  const setFormData = (key, value) => {
    // List of fields that should be stored as numbers
    const numericFields = ['marci_numere', 'numar_colete', 'nr_static', 'greutate_bruta', 'cubaj'];
    
    if (formType === 'cmr') {
      // If the field should be numeric, parse it as a number
      if (numericFields.includes(key)) {
        // Only convert to number if the value isn't empty
        const numericValue = value === '' ? '' : parseFloat(value);
        setCmrFormData({
          ...cmrFormData,
          [key]: numericValue
        });
      } else {
        // For non-numeric fields, store as string
        setCmrFormData({
          ...cmrFormData,
          [key]: value
        });
      }
    } else if (formType === 'status') {
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
    }
  };


  // Calculate total pages (showing 2 fields per page)
  const getTotalPages = () => {
    if (formType === 'cmr') {
      return Math.ceil(cmrFields.length / 2);
    } else if (formType === 'status') {
      // For status form, we need to count only non-conditional fields
      // or conditional fields that should be displayed
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
    }
    return 0;
  };


  const currentPage = Math.floor(currentIndex / 2) + 1;
  const totalPages = getTotalPages();


  // Handle country selection
  const handleCountrySelect = (country) => {
    if (activeField) {
      setFormData(activeField, country);
      setShowCountryModal(false);
      setActiveField(null);
    }
  };


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
    if (field.type === 'country') {
      setActiveField(field.key);
      setShowCountryModal(true);
    } else if (field.type === 'options') {
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
    const formData = getFormData();
    
    return currentFields.every(field => {
      // Special case for camera type, it's optional
      if (field.type === 'camera') return true;
      
      // For all other fields, ensure they have a value
      return formData[field.key] !== undefined && formData[field.key] !== "";
    });
  };


  // Handle next fields/page
  const handleNext = () => {
    if (!areCurrentFieldsValid()) {
      Alert.alert('Câmpuri obligatorii', 'Vă rugăm să completați toate câmpurile pentru a continua.');
      return;
    }


    // For status form, we need to check if we need to skip any conditional fields
    if (formType === 'status') {
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
    } else {
      // CMR form - simple navigation
      if (currentIndex + 2 < cmrFields.length) {
        setCurrentIndex(currentIndex + 2);
      } else {
        // Form is complete
        handleSubmit();
      }
    }
  };


  // Handle previous fields/page
  const handlePrevious = () => {
    if (currentIndex >= 2) {
      setCurrentIndex(currentIndex - 2);
    } else {
      // Return to form selection
      setFormType(null);
      setCurrentIndex(0);
    }
  };


  React.useEffect(() => {
    if (formType === 'cmr' && authToken && driverId) {
      fetchLatestTransport(authToken, driverId);
    }
  }, [formType, authToken, driverId]);
  
  // NEW: Prepare data with missing fields set to null for submission
  const prepareFormDataForSubmission = () => {
    if (formType === 'cmr') {
      // Create a copy of the form data
      const preparedData = { ...cmrFormData };
      
      // Loop through all fields defined for the form
      cmrFields.forEach(field => {
        // If field is empty or undefined, set it to null
        if (preparedData[field.key] === '' || preparedData[field.key] === undefined) {
          preparedData[field.key] = null;
        } else if (['marci_numere', 'numar_colete', 'nr_static', 'greutate_bruta', 'cubaj'].includes(field.key)) {
          // Ensure numeric fields are numbers
          preparedData[field.key] = preparedData[field.key] === '' ? null : parseFloat(preparedData[field.key]);
        }
      });
      
      // Add transport_id and driver_id
      if (transportId) {
        preparedData.transport_id = transportId;
      }
      
      if (driverId) {
        preparedData.driver_id = driverId;
      }
      
      return preparedData;
    } else if (formType === 'status') {
      // Create a copy of the form data
      const preparedData = { ...statusFormData };
      
      // Loop through all fields defined for the form
      statusFields.forEach(field => {
        // If field is empty or undefined, set it to null
        if (preparedData[field.key] === '' || preparedData[field.key] === undefined) {
          preparedData[field.key] = null;
        }
      });
      
      return preparedData;
    }
    
    return null;
  };


  // Handle form submission
  const handleSubmit = async () => {
    if (formType === 'cmr') {
      try {
        // Prepare data with empty fields set to null
        const cmrDataToSubmit = prepareFormDataForSubmission();
        
        if (!cmrDataToSubmit) {
          Alert.alert('Eroare', 'Nu s-au putut pregăti datele pentru trimitere.');
          return;
        }
        
        console.log('CMR Form data to submit:', cmrDataToSubmit);
        
        // Check for transport_id
        if (!cmrDataToSubmit.transport_id) {
          Alert.alert(
            'Eroare',
            'ID Transport lipsă. Vă rugăm să încercați din nou.',
            [{ text: 'OK' }]
          );
          return;
        }
        
        // Send data to the server
        const response = await fetch(
          "https://atrux-717ecf8763ea.herokuapp.com/add_cmr/",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Token ${authToken}`
            },
            body: JSON.stringify(cmrDataToSubmit)
          }
        );
        
        if (response.ok) {
          const responseData = await response.json();
          console.log('CMR submission successful:', responseData);
          setFormType(null);
          setCurrentIndex(0);
          
          Alert.alert(
            'Transport Salvat',
            'Datele CMR au fost salvate cu succes!',
            [{ text: 'OK', onPress: () => navigation.goBack() }]
          );
        } else {
          const errorData = await response.json();
          console.error('CMR submission failed:', errorData);
          
          Alert.alert(
            'Eroare',
            'Salvarea datelor CMR a eșuat. Vă rugăm să încercați din nou.',
            [{ text: 'OK' }]
          );
        }
      } catch (error) {
        console.error('Error submitting CMR:', error);
        
        Alert.alert(
          'Eroare',
          'A apărut o eroare la trimiterea datelor. Verificați conexiunea la internet.',
          [{ text: 'OK' }]
        );
      }
    } else if (formType === 'status') {
      // Prepare status form data
      const dataToSubmit = prepareFormDataForSubmission();
      
      console.log('STATUS Form submitted:', dataToSubmit);
      // Add your API call for status form here
      Alert.alert(
        'Transport Salvat',
        'Datele STATUS au fost salvate cu succes!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }
  };


  // NEW: Handle submit now (bypass validation)
  const handleSubmitNow = async () => {
    // Show confirmation to the user
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
          onPress: async () => {
            // Directly call submission with preparation that sets empty fields to null
            if (formType === 'cmr') {
              try {
                // Prepare data with empty fields set to null
                const cmrDataToSubmit = prepareFormDataForSubmission();
                
                if (!cmrDataToSubmit) {
                  Alert.alert('Eroare', 'Nu s-au putut pregăti datele pentru trimitere.');
                  return;
                }
                
                // Check for transport_id
                if (!cmrDataToSubmit.transport_id) {
                  Alert.alert(
                    'Eroare',
                    'ID Transport lipsă. Vă rugăm să încercați din nou.',
                    [{ text: 'OK' }]
                  );
                  return;
                }
                
                // Send data to the server
                const response = await fetch(
                  "https://atrux-717ecf8763ea.herokuapp.com/add_cmr/",
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      "Authorization": `Token ${authToken}`
                    },
                    body: JSON.stringify(cmrDataToSubmit)
                  }
                );
                
                if (response.ok) {
                  const responseData = await response.json();
                  console.log('CMR submission successful:', responseData);
                  setFormType(null);
                  setCurrentIndex(0);
                  
                  Alert.alert(
                    'Transport Salvat',
                    'Datele CMR au fost salvate cu succes!',
                    [{ text: 'OK', onPress: () => navigation.goBack() }]
                  );
                } else {
                  const errorData = await response.json();
                  console.error('CMR submission failed:', errorData);
                  
                  Alert.alert(
                    'Eroare',
                    'Salvarea datelor CMR a eșuat. Vă rugăm să încercați din nou.',
                    [{ text: 'OK' }]
                  );
                }
              } catch (error) {
                console.error('Error submitting CMR:', error);
                
                Alert.alert(
                  'Eroare',
                  'A apărut o eroare la trimiterea datelor. Verificați conexiunea la internet.',
                  [{ text: 'OK' }]
                );
              }
            } else if (formType === 'status') {
              const dataToSubmit = prepareFormDataForSubmission();
              console.log('STATUS Form submitted:', dataToSubmit);
              // Add your API call for status form here
              Alert.alert(
                'Transport Salvat',
                'Datele STATUS au fost salvate cu succes!',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
              );
            }
          }
        }
      ]
    );
  };


  // Get progress percentage
  const getProgressPercentage = () => {
    return ((currentPage) / totalPages) * 100;
  };


  const renderCountryModal = () => (
    <Modal
      visible={showCountryModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowCountryModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Selectați Țara</Text>
            <TouchableOpacity onPress={() => setShowCountryModal(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={europeanCountries}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.countryItem}
                onPress={() => handleCountrySelect(item)}
              >
                <Text style={styles.countryText}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );

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

  
  
  if (formType === null) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Transport actual</Text>
          <View style={{ width: 24 }} />
        </View>
        
        <ScrollView 
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
        >
          {/* UIT Code Information */}
          <View style={styles.uitCodeContainer}>
            <Text style={styles.uitLabel}>COD UIT:</Text>
            <Text style={styles.uitCode}>TR-8529-RO</Text>
          </View>
          
          <View style={styles.selectionContainer}>
            <Text style={styles.selectionTitle}>Alegeți tipul de formular:</Text>
            
            {/* CMR Button */}
            <TouchableOpacity
              style={[styles.selectionButton, { marginBottom: 20 }]}
              onPress={() => setFormType('cmr')}
            >
              <Ionicons name="document-text-outline" size={40} color="#3B82F6" />
              <Text style={styles.selectionButtonText}>CMR Digital</Text>
              <Text style={styles.selectionDescription}>
                Scrisoare de transport internațional de mărfuri (Expeditor, Destinatar, etc.)
              </Text>
            </TouchableOpacity>
            
            {/* Transport Status Button */}
            <TouchableOpacity
              style={[styles.selectionButton, { marginBottom: 20 }]}
              onPress={() => setFormType('status')}
            >
              <Ionicons name="car-outline" size={40} color="#3B82F6" />
              <Text style={styles.selectionButtonText}>Status Transport</Text>
              <Text style={styles.selectionDescription}>
                Informații despre starea camionului, mărfii și a transportului
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.selectionButton, { marginBottom: 20 }]}
              onPress={() => setFormType('status')}
            >
              <Ionicons name="camera-outline" size={40} color="#3B82F6" />
              <Text style={styles.selectionButtonText}>Fotografiaza CMR-UL</Text>
              <Text style={styles.selectionDescription}>
                Incarca o fotografie cu CMR-ul in format fizic
              </Text>
            </TouchableOpacity>
            {/* Download CMR Button */}
            <TouchableOpacity 
              style={styles.downloadButton} 
              onPress={() => handleDownloadCMR()}
            >
              <Ionicons name="cloud-download-outline" size={24} color="#FFFFFF" />
              <Text style={styles.downloadButtonText}>Descarcă acum CMR-ul</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
  
  // Add this function to handle the download
  const handleDownloadCMR = () => {
    // Implement download functionality here
    Alert.alert(
      'Descărcare CMR',
      'Descărcarea documentului CMR a început.',
      [{ text: 'OK' }]
    );
  };

  // Render input based on field type
  const renderInput = (field) => {
    const formData = getFormData();
    
    if (field.type === 'country') {
      return (
        <TouchableOpacity
          style={styles.selectInput}
          onPress={() => handleFieldTouch(field)}
        >
          <Text style={formData[field.key] ? styles.selectInputText : styles.selectInputPlaceholder}>
            {formData[field.key] || field.placeholder}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#6B7280" />
        </TouchableOpacity>
      );
    } else if (field.type === 'options') {
      return (
        <TouchableOpacity
          style={styles.selectInput}
          onPress={() => handleFieldTouch(field)}
        >
          <Text style={formData[field.key] ? styles.selectInputText : styles.selectInputPlaceholder}>
            {formData[field.key] || field.placeholder}
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
          {formData[field.key] ? (
            <View style={styles.photoPreviewContainer}>
              <Image source={{ uri: formData[field.key] }} style={styles.photoPreview} />
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
          value={String(formData[field.key])} // Convert to string for display
          onChangeText={(text) => setFormData(field.key, text)}
          placeholder={field.placeholder}
          placeholderTextColor="#9CA3AF"
          keyboardType={
            ['marci_numere', 'numar_colete', 'nr_static', 'greutate_bruta', 'cubaj'].includes(field.key)
              ? 'numeric'
              : 'default'
          }
        />
      );
    }
  };

  // Render form
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
          <Text style={styles.headerTitle}>
            {formType === 'cmr' ? 'Formular CMR' : 'Status Transport'}
          </Text>
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
            <Ionicons name="arrow-back" size={20} color="white" />
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
              {currentIndex + 2 >= (formType === 'cmr' ? cmrFields.length : statusFields.length) 
                ? 'Finalizare' 
                : 'Mai Departe'}
            </Text>
            <Ionicons 
              name={currentIndex + 2 >= (formType === 'cmr' ? cmrFields.length : statusFields.length) 
                ? "checkmark" 
                : "arrow-forward"} 
              size={20} 
              color="white" 
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {renderCountryModal()}
     
      {renderOptionsModal()}
    </SafeAreaView>
  );
};
export default TransportForm; 