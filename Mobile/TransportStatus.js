import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, SafeAreaView, Alert, KeyboardAvoidingView, Platform, Modal, FlatList, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import * as ImagePicker from 'expo-image-picker';

const TransportForm = ({ navigation }) => {
  // Initial state to track form type choice
  const [formType, setFormType] = useState(null); // null, 'cmr', or 'status'
  
  // Modal states
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [activeField, setActiveField] = useState(null);
  const [modalOptions, setModalOptions] = useState([]);
  const [showProblemsInput, setShowProblemsInput] = useState(false);
  const [showDelayInput, setShowDelayInput] = useState(false);
  
  // Reference for capturing images
  const [capturedImage, setCapturedImage] = useState(null);
  
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
    data_incarcare: formattedToday,
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
    { key: 'data_incarcare', label: 'Data Încărcării', placeholder: 'DD/MM/YYYY', type: 'date' },
    { key: 'marci_numere', label: 'Mărci/Numere', placeholder: 'Introduceți mărci și numere', type: 'text' },
    { key: 'numar_colete', label: 'Număr de Colete', placeholder: 'Introduceți numărul', type: 'text' },
    { key: 'mod_ambalare', label: 'Mod de Ambalare', placeholder: 'Descrieți modul de ambalare', type: 'text' },
    { key: 'natura_marfii', label: 'Natura Mărfii', placeholder: 'Descrieți natura mărfii', type: 'text' },
    { key: 'nr_static', label: 'Nr Static', placeholder: 'Introduceți numărul static', type: 'text' },
    { key: 'greutate_bruta', label: 'Greutate Brută (kg)', placeholder: 'Introduceți greutatea', type: 'text' },
    { key: 'cubaj', label: 'Cubaj (m³)', placeholder: 'Introduceți cubajul', type: 'text' },
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
    if (formType === 'cmr') {
      setCmrFormData({
        ...cmrFormData,
        [key]: value
      });
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

  // Handle date selection
  const handleDateSelect = (date) => {
    const selectedDate = new Date(date.dateString);
    const formattedDate = `${selectedDate.getDate().toString().padStart(2, '0')}/${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}/${selectedDate.getFullYear()}`;
    
    setFormData('data_incarcare', formattedDate);
    setShowCalendar(false);
  };

  // Handle field touch
  const handleFieldTouch = (field) => {
    if (field.type === 'country') {
      setActiveField(field.key);
      setShowCountryModal(true);
    } else if (field.type === 'date') {
      setShowCalendar(true);
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

  // Handle form submission
  const handleSubmit = () => {
    const dataToSubmit = formType === 'cmr' ? cmrFormData : statusFormData;
    console.log(`${formType.toUpperCase()} Form submitted:`, dataToSubmit);
    Alert.alert(
      'Transport Salvat',
      `Datele ${formType.toUpperCase()} au fost salvate cu succes!`,
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  // Get progress percentage
  const getProgressPercentage = () => {
    return ((currentPage) / totalPages) * 100;
  };

  // Format calendar date for marking selected date
  const getMarkedDates = () => {
    if (formType === 'cmr' && cmrFormData.data_incarcare) {
      const parts = cmrFormData.data_incarcare.split('/');
      if (parts.length === 3) {
        const formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
        return {
          [formattedDate]: { selected: true, selectedColor: '#3B82F6' }
        };
      }
    }
    return {};
  };

  // Render country selection modal
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

  // Render calendar modal
  const renderCalendarModal = () => (
    <Modal
      visible={showCalendar}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowCalendar(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Selectați Data</Text>
            <TouchableOpacity onPress={() => setShowCalendar(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          <Calendar
            onDayPress={handleDateSelect}
            markedDates={getMarkedDates()}
            theme={{
              todayTextColor: '#3B82F6',
              selectedDayBackgroundColor: '#3B82F6',
              selectedDayTextColor: '#ffffff',
              arrowColor: '#3B82F6',
            }}
          />
        </View>
      </View>
    </Modal>
  );

  // Render form type selection
  if (formType === null) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tip Transport</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.selectionContainer}>
          <Text style={styles.selectionTitle}>Alegeți tipul de formular:</Text>
          
          <TouchableOpacity 
            style={styles.selectionButton} 
            onPress={() => setFormType('cmr')}
          >
            <Ionicons name="document-text-outline" size={36} color="#3B82F6" />
            <Text style={styles.selectionButtonText}>CMR</Text>
            <Text style={styles.selectionDescription}>
              Scrisoare de transport internațional de mărfuri (Expeditor, Destinatar, etc.)
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.selectionButton} 
            onPress={() => setFormType('status')}
          >
            <Ionicons name="car-outline" size={36} color="#3B82F6" />
            <Text style={styles.selectionButtonText}>Status Transport</Text>
            <Text style={styles.selectionDescription}>
              Informații despre starea camionului, mărfii și a transportului
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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
    } else if (field.type === 'date') {
      return (
        <TouchableOpacity
          style={styles.selectInput}
          onPress={() => handleFieldTouch(field)}
        >
          <Text style={styles.selectInputText}>
            {formData[field.key]}
          </Text>
          <Ionicons name="calendar" size={20} color="#6B7280" />
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
          value={formData[field.key]}
          onChangeText={(text) => setFormData(field.key, text)}
          placeholder={field.placeholder}
          placeholderTextColor="#9CA3AF"
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
            style={[
              styles.button, 
              styles.nextButton,
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
      {renderCalendarModal()}
      {renderOptionsModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
     },
    progressContainer: {
    padding: 16,
    backgroundColor: 'white',
     },
    progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 8,
     },
    progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 4,
     },
    progressText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'right',
     },
    formContainer: {
    flex: 1,
    padding: 24,
     },
    inputContainer: {
    marginBottom: 28,
     },
    label: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
     },
    input: {
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    backgroundColor: 'white',
    height: 60,
     },
    selectInput: {
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    backgroundColor: 'white',
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
     },
    selectInputText: {
    fontSize: 18,
    color: '#333',
     },
    selectInputPlaceholder: {
    fontSize: 18,
    color: '#9CA3AF',
     },
    buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
     },
    button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 8,
     },
    prevButton: {
    backgroundColor: '#64748B',
     },
    nextButton: {
    backgroundColor: '#3B82F6',
     },
    disabledButton: {
    backgroundColor: '#94A3B8',
     },
    buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    marginHorizontal: 8,
     },
    // Styles for selection screen
    selectionContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
     },
    selectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 32,
    color: '#333',
    textAlign: 'center',
     },
    selectionButton: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
     },
    selectionButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
    marginBottom: 8,
     },
    selectionDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
     },
    // Modal styles
    modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
     },
    modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '100%',
    maxHeight: '80%',
    padding: 20,
     },
    modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
     },
    modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
     },
    countryItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
     },
    countryText: {
    fontSize: 18,
    color: '#333',
     },
     optionItem:{
      paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
     },
     optionText:{
      fontSize: 18,
    color: '#333',
     }
    });
    export default TransportForm; 