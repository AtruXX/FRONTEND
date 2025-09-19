// TransportActualCMRDigital/index.js - Updated with useLoading
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  TextInput, 
  SafeAreaView, 
  Alert, 
  KeyboardAvoidingView, 
  Platform, 
  Modal, 
  FlatList, 
  ScrollView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useGetUserProfileQuery } from '../../services/profileService';
import {
  useGetCMRDataQuery,
  useUpdateCMRDataMutation,
  useCreateCMRDataMutation,
  CMR_ERROR_TYPES
} from '../../services/CMRService';
import { useLoading } from "../../components/General/loadingSpinner.js";
import { styles } from './styles';
import PageHeader from "../../components/General/Header";

// Memoized components for better performance
const ProgressIndicator = React.memo(({ completedPercentage }) => {
  if (!completedPercentage) return null;

  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressInfo}>
        <Text style={styles.progressLabel}>Progres completare:</Text>
        <Text style={styles.progressPercentage}>{completedPercentage}</Text>
      </View>
      <View style={styles.progressBar}>
        <View 
          style={[
            styles.progressFill, 
            { width: completedPercentage }
          ]} 
        />
      </View>
    </View>
  );
});

const CountryModal = React.memo(({ 
  visible, 
  countries, 
  onSelect, 
  onClose 
}) => {
  const renderCountryItem = useCallback(({ item }) => (
    <TouchableOpacity 
      style={styles.countryItem}
      onPress={() => onSelect(item)}
    >
      <Text style={styles.countryText}>{item}</Text>
    </TouchableOpacity>
  ), [onSelect]);

  const keyExtractor = useCallback((item) => item, []);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Selectați Țara</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#373A56" />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={countries}
            keyExtractor={keyExtractor}
            renderItem={renderCountryItem}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            windowSize={10}
            initialNumToRender={15}
          />
        </View>
      </View>
    </Modal>
  );
});

const CMRInput = React.memo(({ 
  field, 
  value, 
  editingMode, 
  onPress, 
  onChange 
}) => {
  const formatDate = useCallback((dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('ro-RO');
  }, []);

  if (!editingMode) {
    return (
      <View style={styles.displayField}>
        <Text style={styles.displayValue}>
          {field.type === 'date' ? formatDate(value) : value || 'Nu este completat'}
        </Text>
      </View>
    );
  }

  if (field.type === 'country') {
    return (
      <TouchableOpacity
        style={styles.selectInput}
        onPress={onPress}
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
        onChangeText={onChange}
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
        onChangeText={onChange}
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
});

const CMRSection = React.memo(({ 
  sectionName, 
  fields, 
  formData, 
  editingMode, 
  onFieldUpdate, 
  onFieldTouch 
}) => (
  <View style={styles.sectionContainer}>
    <Text style={styles.sectionTitle}>{sectionName}</Text>
    
    {fields.map((field) => (
      <View key={field.key} style={styles.inputContainer}>
        <Text style={styles.label}>{field.label}</Text>
        <CMRInput
          field={field}
          value={formData[field.key] || ''}
          editingMode={editingMode}
          onPress={() => onFieldTouch(field)}
          onChange={(text) => onFieldUpdate(field.key, text)}
        />
      </View>
    ))}
  </View>
));

const EditingFooter = React.memo(({ 
  onCancel, 
  onSave, 
  isUpdating 
}) => (
  <View style={styles.editingFooter}>
    <TouchableOpacity 
      style={styles.cancelButton} 
      onPress={onCancel}
    >
      <Ionicons name="close" size={20} color="#FF7285" />
      <Text style={styles.cancelButtonText}>Anulează</Text>
    </TouchableOpacity>
    
    <TouchableOpacity 
      style={styles.saveButton} 
      onPress={onSave}
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
));

const CMRDigitalForm = React.memo(({ navigation }) => {
  const { showLoading, hideLoading } = useLoading();
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [activeField, setActiveField] = useState(null);
  const [editingMode, setEditingMode] = useState(false);
  const [localFormData, setLocalFormData] = useState({});

  // Get user profile to get active transport ID
  const {
    data: profileData,
    isLoading: profileLoading,
    error: profileError,
    refetch: refetchProfile
  } = useGetUserProfileQuery();

  const activeTransportId = profileData?.active_transport;

  // Get CMR data with enhanced error handling
  const {
    data: cmrData,
    isLoading: cmrLoading,
    error: cmrError,
    cmrExists,
    refetch: refetchCMR
  } = useGetCMRDataQuery(activeTransportId);

  // Mutations
  const [updateCMRData, { isLoading: isUpdating }] = useUpdateCMRDataMutation();
  const [createCMRData, { isLoading: isCreating }] = useCreateCMRDataMutation();

  // Update global loading state
  useEffect(() => {
    if (profileLoading || cmrLoading || isUpdating || isCreating) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [profileLoading, cmrLoading, isUpdating, isCreating, showLoading, hideLoading]);

  // European countries in Romanian
  const europeanCountries = useMemo(() => [
    'Albania', 'Andorra', 'Austria', 'Belarus', 'Belgia', 'Bosnia și Herțegovina', 
    'Bulgaria', 'Cehia', 'Cipru', 'Croația', 'Danemarca', 'Elveția', 'Estonia', 
    'Finlanda', 'Franța', 'Germania', 'Grecia', 'Irlanda', 'Islanda', 'Italia', 
    'Letonia', 'Liechtenstein', 'Lituania', 'Luxemburg', 'Macedonia de Nord', 
    'Malta', 'Moldova', 'Monaco', 'Muntenegru', 'Norvegia', 'Olanda', 'Polonia', 
    'Portugalia', 'Regatul Unit', 'România', 'Rusia', 'San Marino', 'Serbia', 
    'Slovacia', 'Slovenia', 'Spania', 'Suedia', 'Turcia', 'Ucraina', 'Ungaria', 
    'Vatican'
  ], []);

  // CMR fields definition with Romanian labels
  const cmrFields = useMemo(() => [
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
  ], []);

  // Initialize local form data when CMR data is loaded
  useEffect(() => {
    if (cmrData) {
      setLocalFormData(cmrData);
    }
  }, [cmrData]);

  // Group fields by section
  const getFieldsBySection = useMemo(() => {
    const sections = {};
    cmrFields.forEach(field => {
      if (!sections[field.section]) {
        sections[field.section] = [];
      }
      sections[field.section].push(field);
    });
    return sections;
  }, [cmrFields]);

  // Memoized handlers
  const updateFieldValue = useCallback((key, value) => {
    setLocalFormData(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const handleCountrySelect = useCallback((country) => {
    if (activeField) {
      updateFieldValue(activeField, country);
      setShowCountryModal(false);
      setActiveField(null);
    }
  }, [activeField, updateFieldValue]);

  const handleFieldTouch = useCallback((field) => {
    if (!editingMode) return;
    
    if (field.type === 'country') {
      setActiveField(field.key);
      setShowCountryModal(true);
    }
  }, [editingMode]);

  const handleRetry = useCallback(async () => {
    try {
      await Promise.all([
        refetchProfile(),
        refetchCMR()
      ]);
    } catch (error) {
      console.error('Error during retry:', error);
    }
  }, [refetchProfile, refetchCMR]);

  // Handle creating new CMR with empty data
  const handleCreateNewCMR = useCallback(async () => {
    if (!activeTransportId) return;

    try {
      const emptyCMRData = {
        expeditor_nume: '',
        expeditor_adresa: '',
        expeditor_tara: '',
        destinatar_nume: '',
        destinatar_adresa: '',
        destinatar_tara: '',
        marfa_descriere: '',
        greutate: '',
        observatii: ''
      };

      await createCMRData({
        activeTransportId,
        cmrData: emptyCMRData
      }).unwrap();

      // Refresh the data to show the newly created CMR
      await refetchCMR();

      // Switch to editing mode so the driver can fill in the details
      setEditingMode(true);

      Alert.alert(
        'CMR Creat',
        'CMR-ul a fost creat cu succes. Puteți acum să completați datele.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Create CMR error:', error);
      Alert.alert(
        'Eroare',
        'Nu s-a putut crea CMR-ul. Încercați din nou.',
        [{ text: 'OK' }]
      );
    }
  }, [activeTransportId, createCMRData, refetchCMR]);

  const handleSaveChanges = useCallback(async () => {
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
  }, [activeTransportId, localFormData, updateCMRData, refetchCMR]);

  const handleCancelEdit = useCallback(() => {
    setLocalFormData(cmrData);
    setEditingMode(false);
  }, [cmrData]);

  // Memoized render functions
  const renderSection = useCallback(([sectionName, fields]) => (
    <CMRSection
      key={sectionName}
      sectionName={sectionName}
      fields={fields}
      formData={localFormData}
      editingMode={editingMode}
      onFieldUpdate={updateFieldValue}
      onFieldTouch={handleFieldTouch}
    />
  ), [localFormData, editingMode, updateFieldValue, handleFieldTouch]);

  // Error state - handle profile errors first
  if (profileError) {
    return (
      <SafeAreaView style={styles.container}>
        <PageHeader
          title="CMR Digital"
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

  // Enhanced CMR error handling based on error type
  if (cmrError) {
    // Handle CMR not found - offer to create new CMR
    if (cmrError.type === CMR_ERROR_TYPES.NOT_FOUND) {
      return (
        <SafeAreaView style={styles.container}>
          <PageHeader
            title="CMR Digital"
            onBack={() => navigation.goBack()}
            showBack={true}
          />
          <View style={styles.errorContainer}>
            <Ionicons name="document-outline" size={60} color="#5A5BDE" />
            <Text style={styles.errorTitle}>CMR nu există</Text>
            <Text style={styles.errorText}>
              Nu există un CMR pentru acest transport. Doriți să creați unul nou?
            </Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.createButton}
                onPress={handleCreateNewCMR}
                disabled={isCreating}
              >
                {isCreating ? (
                  <Ionicons name="hourglass-outline" size={20} color="#FFFFFF" />
                ) : (
                  <Ionicons name="add" size={20} color="#FFFFFF" />
                )}
                <Text style={styles.createButtonText}>
                  {isCreating ? 'Se creează...' : 'Creează CMR'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={handleRetry}
              >
                <Text style={styles.retryButtonText}>Reîncarcă</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      );
    }

    // Handle other error types
    const getErrorConfig = () => {
      switch (cmrError.type) {
        case CMR_ERROR_TYPES.NETWORK_ERROR:
          return {
            icon: 'wifi-outline',
            title: 'Problemă de conexiune',
            message: cmrError.message || 'Verificați conexiunea la internet și încercați din nou.',
            color: '#FF9500'
          };
        case CMR_ERROR_TYPES.AUTH_ERROR:
          return {
            icon: 'lock-closed-outline',
            title: 'Acces restricționat',
            message: cmrError.message || 'Nu aveți permisiuni pentru această acțiune.',
            color: '#FF7285'
          };
        case CMR_ERROR_TYPES.SERVER_ERROR:
          return {
            icon: 'server-outline',
            title: 'Eroare de server',
            message: cmrError.message || 'Serverul întâmpină probleme. Încercați din nou.',
            color: '#FF7285'
          };
        default:
          return {
            icon: 'alert-circle-outline',
            title: 'Eroare neașteptată',
            message: cmrError.message || 'A apărut o eroare neașteptată.',
            color: '#FF7285'
          };
      }
    };

    const errorConfig = getErrorConfig();

    return (
      <SafeAreaView style={styles.container}>
        <PageHeader
          title="CMR Digital"
          onBack={() => navigation.goBack()}
          onRetry={handleRetry}
          showRetry={true}
          showBack={true}
        />
        <View style={styles.errorContainer}>
          <Ionicons name={errorConfig.icon} size={60} color={errorConfig.color} />
          <Text style={styles.errorTitle}>{errorConfig.title}</Text>
          <Text style={styles.errorText}>{errorConfig.message}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
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
        <PageHeader
          title="CMR Digital"
          onBack={() => navigation.goBack()}
          onRetry={handleRetry}
          showRetry={true}
          showBack={true}
        />
        <View style={styles.emptyContainer}>
          <Ionicons name="document-outline" size={60} color="#5A5BDE" />
          <Text style={styles.emptyTitle}>Niciun transport activ</Text>
          <Text style={styles.emptyText}>Nu aveți un transport activ pentru a vizualiza CMR-ul</Text>
        </View>
      </SafeAreaView>
    );
  }

  const sections = getFieldsBySection;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <PageHeader
          title="CMR Digital"
          onBack={editingMode ? handleCancelEdit : () => navigation.goBack()}
          onRetry={handleRetry}
          showRetry={true}
          showBack={true}
          rightButton={
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
          }
        />

        <ProgressIndicator completedPercentage={cmrData?.completed_percentage} />

        <ScrollView 
          style={styles.formContainer} 
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
        >
          {Object.entries(sections).map(renderSection)}
        </ScrollView>

        {editingMode && (
          <EditingFooter
            onCancel={handleCancelEdit}
            onSave={handleSaveChanges}
            isUpdating={isUpdating}
          />
        )}
      </KeyboardAvoidingView>

      <CountryModal
        visible={showCountryModal}
        countries={europeanCountries}
        onSelect={handleCountrySelect}
        onClose={() => setShowCountryModal(false)}
      />
    </SafeAreaView>
  );
});

CMRDigitalForm.displayName = 'CMRDigitalForm';

export default CMRDigitalForm;