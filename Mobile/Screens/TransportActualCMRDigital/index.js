import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, SafeAreaView, Alert, KeyboardAvoidingView, Platform, Modal, FlatList, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useGetUserProfileQuery } from '../../services/profileService';
import { useGetCMRDataQuery, useUpdateCMRDataMutation } from '../../services/CMRService';
import { styles } from './styles';

const CMRDigitalForm = ({ navigation }) => {
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [activeField, setActiveField] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [editingMode, setEditingMode] = useState(false);
  const [localFormData, setLocalFormData] = useState({});

  // Get user profile to get active transport ID
  const {
    data: profileData,
    isLoading: profileLoading,
    error: profileError,
  } = useGetUserProfileQuery();

  const activeTransportId = profileData?.active_transport;

  // Get CMR data
  const {
    data: cmrData,
    isLoading: cmrLoading,
    error: cmrError,
    refetch: refetchCMR
  } = useGetCMRDataQuery(activeTransportId);

  // Update mutation
  const [updateCMRData, { isLoading: isUpdating }] = useUpdateCMRDataMutation();

  // European countries in Romanian
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

  // CMR fields definition with Romanian labels
  const cmrFields = [
    // Expeditor Section
    { key: 'expeditor_nume', label: 'Nume Expeditor', placeholder: 'Introduceți numele expeditorului', type: 'text', section: 'Expeditor' },
    { key: 'expeditor_adresa', label: 'Adresă Expeditor', placeholder: 'Introduceți adresa completă', type: 'text', section: 'Expeditor' },
    { key: 'expeditor_tara', label: 'Țara Expeditor', placeholder: 'Selectați țara expeditorului', type: 'country', section: 'Expeditor' },
    
    // Destinatar Section
    { key: 'destinatar_nume', label: 'Nume Destinatar', placeholder: 'Introduceți numele destinatarului', type: 'text', section: 'Destinatar' },
    { key: 'destinatar_adresa', label: 'Adresă Destinatar', placeholder: 'Introduceți adresa completă', type: 'text', section: 'Destinatar' },
    { key: 'destinatar_tara', label: 'Țara Destinatar', placeholder: 'Selectați țara destinatarului', type: 'country', section: 'Destinatar' },
    
    // Livrare Section
    { key: 'localitate_livrare', label: 'Localitatea Livrării', placeholder: 'Introduceți localitatea', type: 'text', section: 'Livrare' },
    { key: 'tara_livrare', label: 'Țara Livrării', placeholder: 'Selectați țara', type: 'country', section: 'Livrare' },
    { key: 'data_livrare', label: 'Data Livrării', placeholder: 'YYYY-MM-DD', type: 'date', section: 'Livrare' },
    
    // Încărcare Section
    { key: 'localitate_incarcare', label: 'Localitatea Încărcării', placeholder: 'Introduceți localitatea', type: 'text', section: 'Încărcare' },
    { key: 'tara_incarcare', label: 'Țara Încărcării', placeholder: 'Selectați țara', type: 'country', section: 'Încărcare' },
    { key: 'data_incarcare', label: 'Data Încărcării', placeholder: 'YYYY-MM-DD', type: 'date', section: 'Încărcare' },
    
    // Documente Section
    { key: 'documente_anexate', label: 'Documente Anexate', placeholder: 'Lista documentelor', type: 'text', section: 'Documente' },
    
    // Mărfuri Section
    { key: 'marci_numere', label: 'Mărci/Numere', placeholder: 'Introduceți mărci și numere', type: 'text', section: 'Mărfuri' },
    { key: 'numar_colete', label: 'Număr Colete', placeholder: 'Introduceți numărul', type: 'number', section: 'Mărfuri' },
    { key: 'mod_ambalare', label: 'Mod Ambalare', placeholder: 'Descrieți modul de ambalare', type: 'text', section: 'Mărfuri' },
    { key: 'natura_marfii', label: 'Natura Mărfii', placeholder: 'Descrieți natura mărfii', type: 'text', section: 'Mărfuri' },
    { key: 'numar_static', label: 'Număr Static', placeholder: 'Introduceți numărul static', type: 'text', section: 'Mărfuri' },
    { key: 'greutate_bruta', label: 'Greutate Brută (kg)', placeholder: 'Introduceți greutatea', type: 'decimal', section: 'Mărfuri' },
    { key: 'cubaj', label: 'Cubaj (m³)', placeholder: 'Introduceți cubajul', type: 'decimal', section: 'Mărfuri' },
    
    // Instrucțiuni Section
    { key: 'instructiuni_expeditor', label: 'Instrucțiuni Expeditor', placeholder: 'Introduceți instrucțiuni', type: 'textarea', section: 'Instrucțiuni' },
    { key: 'prescriptii_francare', label: 'Prescripții Francare', placeholder: 'Detalii despre francare', type: 'text', section: 'Instrucțiuni' },
    { key: 'conventii_speciale', label: 'Convenții Speciale', placeholder: 'Introduceți convenții speciale', type: 'textarea', section: 'Instrucțiuni' },
    
    // Transport Section
    { key: 'UIT', label: 'UIT', placeholder: 'Cod UIT', type: 'text', section: 'Transport' },
    { key: 'rambursare', label: 'Rambursare', placeholder: 'Suma rambursare', type: 'text', section: 'Transport' },
    { key: 'denumire_transportator', label: 'Denumire Transportator', placeholder: 'Numele transportatorului', type: 'text', section: 'Transport' },
    { key: 'adresa_transportator', label: 'Adresa Transportator', placeholder: 'Adresa completă', type: 'text', section: 'Transport' },
    { key: 'tara_transportator', label: 'Țara Transportator', placeholder: 'Selectați țara', type: 'country', section: 'Transport' },
    
    // Vehicul Section
    { key: 'marca_autovehicul', label: 'Marca Autovehicul', placeholder: 'Marca vehiculului', type: 'text', section: 'Vehicul' },
    { key: 'numar_circuaratie', label: 'Număr Circulație', placeholder: 'Numărul de înmatriculare', type: 'text', section: 'Vehicul' },
    { key: 'echipaj', label: 'Echipaj', placeholder: 'Numărul persoanelor', type: 'number', section: 'Vehicul' },
    { key: 'transportatori_succesivi', label: 'Transportatori Succesivi', placeholder: 'Lista transportatorilor', type: 'text', section: 'Vehicul' },
    
    // Observații Section
    { key: 'rezerve_observatii', label: 'Rezerve/Observații', placeholder: 'Observații generale', type: 'textarea', section: 'Observații' },
    
    // Financiar Section
    { key: 'pret_transport', label: 'Preț Transport', placeholder: 'Prețul de bază', type: 'decimal', section: 'Financiar' },
    { key: 'reduceri', label: 'Reduceri', placeholder: 'Suma reducerilor', type: 'decimal', section: 'Financiar' },
    { key: 'sold', label: 'Sold', placeholder: 'Soldul curent', type: 'decimal', section: 'Financiar' },
    { key: 'sporuri', label: 'Sporuri', placeholder: 'Suma sporurilor', type: 'decimal', section: 'Financiar' },
    { key: 'accesorii', label: 'Accesorii', placeholder: 'Costul accesoriilor', type: 'decimal', section: 'Financiar' },
    { key: 'diverse', label: 'Diverse', placeholder: 'Alte costuri', type: 'decimal', section: 'Financiar' },
    { key: 'total_de_plata', label: 'Total de Plată', placeholder: 'Suma totală', type: 'decimal', section: 'Financiar' },
    
    // Final Section
    { key: 'incheiat_la', label: 'Încheiat La', placeholder: 'Data încheierii', type: 'date', section: 'Final' },
  ];

  // Initialize local form data when CMR data is loaded
  useEffect(() => {
    if (cmrData) {
      setLocalFormData(cmrData);
    }
  }, [cmrData]);

  // Group fields by section
  const getFieldsBySection = () => {
    const sections = {};
    cmrFields.forEach(field => {
      if (!sections[field.section]) {
        sections[field.section] = [];
      }
      sections[field.section].push(field);
    });
    return sections;
  };

  // Handle field value update
  const updateFieldValue = (key, value) => {
    setLocalFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Handle country selection
  const handleCountrySelect = (country) => {
    if (activeField) {
      updateFieldValue(activeField, country);
      setShowCountryModal(false);
      setActiveField(null);
    }
  };

  // Handle field touch
  const handleFieldTouch = (field) => {
    if (!editingMode) return;
    
    if (field.type === 'country') {
      setActiveField(field.key);
      setShowCountryModal(true);
    }
  };

  // Handle save changes
  const handleSaveChanges = async () => {
    try {
      await updateCMRData({
        activeTransportId,
        cmrData: localFormData
      }).unwrap();

      Alert.alert(
        'Succes',
        'Datele CMR au fost actualizate cu succes!',
        [{ text: 'OK', onPress: () => {
          setEditingMode(false);
          refetchCMR();
        }}]
      );
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Eroare', 'Nu s-au putut salva modificările.');
    }
  };

  // Handle cancel editing
  const handleCancelEdit = () => {
    setLocalFormData(cmrData);
    setEditingMode(false);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('ro-RO');
  };

  // Render country modal
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
              <Ionicons name="close" size={24} color="#373A56" />
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
    const value = localFormData[field.key] || '';
    
    if (!editingMode) {
      // Display mode
      return (
        <View style={styles.displayField}>
          <Text style={styles.displayValue}>
            {field.type === 'date' ? formatDate(value) : value || 'Nu este completat'}
          </Text>
        </View>
      );
    }

    // Edit mode
    if (field.type === 'country') {
      return (
        <TouchableOpacity
          style={styles.selectInput}
          onPress={() => handleFieldTouch(field)}
        >
          <Text style={value ? styles.selectInputText : styles.selectInputPlaceholder}>
            {value || field.placeholder}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#A0A4C1" />
        </TouchableOpacity>
      );
    } else if (field.type === 'textarea') {
      return (
        <TextInput
          style={[styles.input, styles.textArea]}
          value={String(value)}
          onChangeText={(text) => updateFieldValue(field.key, text)}
          placeholder={field.placeholder}
          placeholderTextColor="#A0A4C1"
          multiline={true}
          numberOfLines={4}
        />
      );
    } else {
      return (
        <TextInput
          style={styles.input}
          value={String(value)}
          onChangeText={(text) => updateFieldValue(field.key, text)}
          placeholder={field.placeholder}
          placeholderTextColor="#A0A4C1"
          keyboardType={
            field.type === 'number' ? 'numeric' :
            field.type === 'decimal' ? 'decimal-pad' :
            field.type === 'date' ? 'default' : 'default'
          }
        />
      );
    }
  };

  // Loading state
  if (profileLoading || cmrLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Ionicons name="hourglass-outline" size={40} color="#5A5BDE" />
          <Text style={styles.loadingText}>Se încarcă datele CMR...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (profileError || cmrError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#373A56" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>CMR Digital</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={40} color="#FF7285" />
          <Text style={styles.errorTitle}>Eroare la încărcare</Text>
          <Text style={styles.errorText}>Nu s-au putut încărca datele CMR</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refetchCMR}>
            <Text style={styles.retryButtonText}>Încearcă din nou</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // No active transport
  if (!activeTransportId) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#373A56" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>CMR Digital</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="document-outline" size={60} color="#5A5BDE" />
          <Text style={styles.emptyTitle}>Niciun transport activ</Text>
          <Text style={styles.emptyText}>Nu aveți un transport activ pentru a vizualiza CMR-ul</Text>
        </View>
      </SafeAreaView>
    );
  }

  const sections = getFieldsBySection();

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={editingMode ? handleCancelEdit : () => navigation.goBack()} 
            style={styles.backButton}
          >
            <Ionicons name={editingMode ? "close" : "arrow-back"} size={24} color="#373A56" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>CMR Digital</Text>
          <TouchableOpacity 
            onPress={editingMode ? handleSaveChanges : () => setEditingMode(true)}
            style={styles.editButton}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <Ionicons name="hourglass-outline" size={24} color="#5A5BDE" />
            ) : (
              <Ionicons name={editingMode ? "checkmark" : "create-outline"} size={24} color="#5A5BDE" />
            )}
          </TouchableOpacity>
        </View>

        {/* Progress indicator */}
        {cmrData?.completed_percentage && (
          <View style={styles.progressContainer}>
            <View style={styles.progressInfo}>
              <Text style={styles.progressLabel}>Progres completare:</Text>
              <Text style={styles.progressPercentage}>{cmrData.completed_percentage}</Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: cmrData.completed_percentage }
                ]} 
              />
            </View>
          </View>
        )}

        <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
          {Object.entries(sections).map(([sectionName, fields]) => (
            <View key={sectionName} style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>{sectionName}</Text>
              
              {fields.map((field) => (
                <View key={field.key} style={styles.inputContainer}>
                  <Text style={styles.label}>{field.label}</Text>
                  {renderInput(field)}
                </View>
              ))}
            </View>
          ))}
        </ScrollView>

        {editingMode && (
          <View style={styles.editingFooter}>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={handleCancelEdit}
            >
              <Ionicons name="close" size={20} color="#FF7285" />
              <Text style={styles.cancelButtonText}>Anulează</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.saveButton} 
              onPress={handleSaveChanges}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <Ionicons name="hourglass-outline" size={20} color="#FFFFFF" />
              ) : (
                <Ionicons name="checkmark" size={20} color="#FFFFFF" />
              )}
              <Text style={styles.saveButtonText}>
                {isUpdating ? 'Se salvează...' : 'Salvează'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>

      {renderCountryModal()}
    </SafeAreaView>
  );
};

export default CMRDigitalForm;