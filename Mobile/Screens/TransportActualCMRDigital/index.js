import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, SafeAreaView, Alert, KeyboardAvoidingView, Platform, Modal, FlatList, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { styles } from './styles'; // Import your styles from the styles.js file

const CMRDigitalForm = ({ navigation, route }) => {
  const { authToken, driverId } = route.params;
  const [transportId, setTransportId] = useState(null);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [activeField, setActiveField] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  
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

  useEffect(() => {
    if (authToken && driverId) {
      fetchLatestTransport(authToken, driverId);
    }
  }, [authToken, driverId]);

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

  // Get current fields (showing 2 at a time)
  const getCurrentFields = () => {
    return cmrFields.slice(currentIndex, currentIndex + 2);
  };

  // Update form data
  const setFormData = (key, value) => {
    const numericFields = ['marci_numere', 'numar_colete', 'nr_static', 'greutate_bruta', 'cubaj'];
    
    if (numericFields.includes(key)) {
      const numericValue = value === '' ? '' : parseFloat(value);
      setCmrFormData({
        ...cmrFormData,
        [key]: numericValue
      });
    } else {
      setCmrFormData({
        ...cmrFormData,
        [key]: value
      });
    }
  };

  // Calculate total pages (showing 2 fields per page)
  const getTotalPages = () => {
    return Math.ceil(cmrFields.length / 2);
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

  // Handle field touch
  const handleFieldTouch = (field) => {
    if (field.type === 'country') {
      setActiveField(field.key);
      setShowCountryModal(true);
    }
  };

  // Check if current fields are valid
  const areCurrentFieldsValid = () => {
    const currentFields = getCurrentFields();
    
    return currentFields.every(field => {
      return cmrFormData[field.key] !== undefined && cmrFormData[field.key] !== "";
    });
  };

  // Handle next fields/page
  const handleNext = () => {
    if (!areCurrentFieldsValid()) {
      Alert.alert('Câmpuri obligatorii', 'Vă rugăm să completați toate câmpurile pentru a continua.');
      return;
    }

    if (currentIndex + 2 < cmrFields.length) {
      setCurrentIndex(currentIndex + 2);
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

  // Prepare data for submission
  const prepareFormDataForSubmission = () => {
    const preparedData = { ...cmrFormData };
    
    cmrFields.forEach(field => {
      if (preparedData[field.key] === '' || preparedData[field.key] === undefined) {
        preparedData[field.key] = null;
      } else if (['marci_numere', 'numar_colete', 'nr_static', 'greutate_bruta', 'cubaj'].includes(field.key)) {
        preparedData[field.key] = preparedData[field.key] === '' ? null : parseFloat(preparedData[field.key]);
      }
    });
    
    if (transportId) {
      preparedData.transport_id = transportId;
    }
    
    if (driverId) {
      preparedData.driver_id = driverId;
    }
    
    return preparedData;
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      const cmrDataToSubmit = prepareFormDataForSubmission();
      
      if (!cmrDataToSubmit) {
        Alert.alert('Eroare', 'Nu s-au putut pregăti datele pentru trimitere.');
        return;
      }
      
      console.log('CMR Form data to submit:', cmrDataToSubmit);
      
      if (!cmrDataToSubmit.transport_id) {
        Alert.alert(
          'Eroare',
          'ID Transport lipsă. Vă rugăm să încercați din nou.',
          [{ text: 'OK' }]
        );
        return;
      }
      
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
        
        Alert.alert(
          'Transport Salvat',
          'Datele CMR au fost salvate cu succes!',
          [{ text: 'OK', onPress: () => navigation.navigate('TransportMainPage') }]
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

  // Render input based on field type
  const renderInput = (field) => {
    if (field.type === 'country') {
      return (
        <TouchableOpacity
          style={styles.selectInput}
          onPress={() => handleFieldTouch(field)}
        >
          <Text style={cmrFormData[field.key] ? styles.selectInputText : styles.selectInputPlaceholder}>
            {cmrFormData[field.key] || field.placeholder}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#6B7280" />
        </TouchableOpacity>
      );
    } else {
      return (
        <TextInput
          style={styles.input}
          value={String(cmrFormData[field.key])}
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
          <Text style={styles.headerTitle}>Formular CMR Digital</Text>
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
              {currentIndex + 2 >= cmrFields.length ? 'Finalizare' : 'Mai Departe'}
            </Text>
            <Ionicons 
              name={currentIndex + 2 >= cmrFields.length ? "checkmark" : "arrow-forward"} 
              size={20} 
              color="white" 
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {renderCountryModal()}
    </SafeAreaView>
  );
};

export default CMRDigitalForm;