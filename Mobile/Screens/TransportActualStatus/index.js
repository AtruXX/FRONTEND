// TransportActualStatus/index.js - Optimized version
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
  ScrollView, 
  Image 
} from 'react-native';
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
import PageHeader from "../../components/General/Header";
// Memoized components for better performance
const ProgressBar = React.memo(({ currentPage, totalPages, percentage }) => (
  <View style={styles.progressContainer}>
    <View style={styles.progressBar}>
      <View 
        style={[
          styles.progressFill, 
          { width: `${percentage}%` }
        ]} 
      />
    </View>
    <Text style={styles.progressText} numberOfLines={1} adjustsFontSizeToFit>
      Pasul {currentPage} din {totalPages}
    </Text>
  </View>
));

const OptionModal = React.memo(({ 
  visible, 
  options, 
  onSelect, 
  onClose 
}) => {
  const renderOption = useCallback(({ item }) => (
    <TouchableOpacity 
      style={styles.optionItem}
      onPress={() => onSelect(item)}
    >
      <Text style={styles.optionText}>{item}</Text>
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
            <Text style={styles.modalTitle}>Selectați o opțiune</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#373A56" />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={options}
            keyExtractor={keyExtractor}
            renderItem={renderOption}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews={true}
          />
        </View>
      </View>
    </Modal>
  );
});

const SelectInput = React.memo(({ 
  value, 
  placeholder, 
  onPress 
}) => (
  <TouchableOpacity
    style={styles.selectInput}
    onPress={onPress}
  >
    <Text style={value ? styles.selectInputText : styles.selectInputPlaceholder}>
      {value || placeholder}
    </Text>
    <Ionicons name="chevron-down" size={20} color="#A0A4C1" />
  </TouchableOpacity>
));

const CameraButton = React.memo(({ 
  capturedPhotos, 
  onPress 
}) => (
  <TouchableOpacity
    style={styles.cameraButton}
    onPress={onPress}
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
        <Text style={styles.cameraButtonText}>Apăsați pentru a face o poză</Text>
      </View>
    )}
  </TouchableOpacity>
));

const FormInput = React.memo(({ 
  field, 
  value, 
  onChange, 
  onPress 
}) => {
  if (field.type === 'options') {
    return (
      <SelectInput
        value={value}
        placeholder={field.placeholder}
        onPress={onPress}
      />
    );
  } else if (field.type === 'camera') {
    return (
      <CameraButton
        capturedPhotos={value || []}
        onPress={onPress}
      />
    );
  } else {
    return (
      <TextInput
        style={styles.input}
        value={String(value || '')}
        onChangeText={onChange}
        placeholder={field.placeholder}
        placeholderTextColor="#A0A4C1"
        keyboardType={field.key === 'delay_estimation' ? 'numeric' : 'default'}
      />
    );
  }
});

const ButtonContainer = React.memo(({ 
  onPrevious, 
  onSubmitNow, 
  onNext, 
  canNext, 
  isUpdating, 
  isUploading, 
  isLastStep 
}) => (
  <View style={styles.buttonContainer}>
    <TouchableOpacity 
      style={[styles.button, styles.prevButton]} 
      onPress={onPrevious}
    >
      <Ionicons name="arrow-back" size={20} color="white" />
      <Text style={styles.buttonText}>Înapoi</Text>
    </TouchableOpacity>
    
    <TouchableOpacity 
      style={[styles.button, styles.submitNowButton]} 
      onPress={onSubmitNow}
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
        !canNext && styles.disabledButton
      ]} 
      onPress={onNext}
      disabled={!canNext}
    >
      <Text style={styles.buttonText}>
        {isLastStep ? 'Finalizare' : 'Mai Departe'}
      </Text>
      <Ionicons 
        name={isLastStep ? "checkmark" : "arrow-forward"} 
        size={20} 
        color="white" 
      />
    </TouchableOpacity>
  </View>
));

const TransportStatusPage = React.memo(({ navigation }) => {
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

  // Status form data
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

  // Memoized status fields definition
  const statusFields = useMemo(() => [
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
  ], []);

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

  // Memoized current fields calculation
  const currentFields = useMemo(() => {
    const allFields = statusFields.slice(currentIndex, currentIndex + 4);
    return allFields.filter(field => {
      if (!field.conditionalDisplay) return true;
      
      const controllingField = statusFields.find(f => f.linkedField === field.key);
      if (!controllingField) return false;
      
      return controllingField.linkedFieldVisible(statusFormData[controllingField.key]);
    }).slice(0, 2);
  }, [statusFields, currentIndex, statusFormData]);

  // Memoized calculations
  const pageCalculations = useMemo(() => {
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
    
    const totalPages = Math.ceil(visibleFieldCount / 2);
    const currentPage = Math.floor(currentIndex / 2) + 1;
    const percentage = (currentPage / totalPages) * 100;
    
    return { totalPages, currentPage, percentage };
  }, [statusFields, statusFormData, currentIndex]);

  // Memoized handlers
  const setFormData = useCallback((key, value) => {
    setStatusFormData(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const handleOptionSelect = useCallback((option) => {
    if (activeField) {
      setFormData(activeField, option);
      setShowOptionsModal(false);
      setActiveField(null);
    }
  }, [activeField, setFormData]);

  const handleCameraCapture = useCallback(async () => {
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
      setCapturedPhotos(prev => [...prev, newPhoto]);
    }
  }, []);

  const handleFieldTouch = useCallback((field) => {
    if (field.type === 'options') {
      setActiveField(field.key);
      setModalOptions(field.options);
      setShowOptionsModal(true);
    } else if (field.type === 'camera') {
      handleCameraCapture();
    }
  }, [handleCameraCapture]);

  const areCurrentFieldsValid = useCallback(() => {
    return currentFields.every(field => {
      if (field.type === 'camera') return true;
      return statusFormData[field.key] !== undefined && statusFormData[field.key] !== "";
    });
  }, [currentFields, statusFormData]);

  const handleNext = useCallback(() => {
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
  }, [areCurrentFieldsValid, currentIndex, statusFields, statusFormData]);

  const handlePrevious = useCallback(() => {
    if (currentIndex >= 2) {
      setCurrentIndex(currentIndex - 2);
    } else {
      navigation.goBack();
    }
  }, [currentIndex, navigation]);

  const handleSubmit = useCallback(async () => {
    try {
      if (capturedPhotos.length > 0) {
        await uploadGoodsPhotos({ 
          activeTransportId, 
          photos: capturedPhotos 
        }).unwrap();
      }

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
  }, [capturedPhotos, statusFormData, activeTransportId, uploadGoodsPhotos, updateTransportStatus, navigation]);

  const handleSubmitNow = useCallback(async () => {
    Alert.alert(
      'Trimiteți formularul?',
      'Câmpurile necompletate vor fi salvate ca goale. Doriți să continuați?',
      [
        { text: 'Anulează', style: 'cancel' },
        { text: 'Trimite', onPress: handleSubmit }
      ]
    );
  }, [handleSubmit]);

  const isLastStep = useMemo(() => {
    return currentIndex + 2 >= statusFields.length;
  }, [currentIndex, statusFields.length]);

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
        <PageHeader
        title="STATUS"
        onBack={() => navigation.goBack()}
        onRetry={handleRetry}
        showRetry={true}
        showBack={true}
      />

        <ProgressBar 
          currentPage={pageCalculations.currentPage}
          totalPages={pageCalculations.totalPages}
          percentage={pageCalculations.percentage}
        />

        <ScrollView 
          style={styles.formContainer} 
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
        >
          {currentFields.map((field) => (
            <View key={field.key} style={styles.inputContainer}>
              <Text style={styles.label}>{field.label}</Text>
              <FormInput
                field={field}
                value={field.type === 'camera' ? capturedPhotos : statusFormData[field.key]}
                onChange={(text) => setFormData(field.key, text)}
                onPress={() => handleFieldTouch(field)}
              />
            </View>
          ))}
        </ScrollView>

        <ButtonContainer
          onPrevious={handlePrevious}
          onSubmitNow={handleSubmitNow}
          onNext={handleNext}
          canNext={areCurrentFieldsValid()}
          isUpdating={isUpdating}
          isUploading={isUploading}
          isLastStep={isLastStep}
        />
      </KeyboardAvoidingView>

      <OptionModal
        visible={showOptionsModal}
        options={modalOptions}
        onSelect={handleOptionSelect}
        onClose={() => setShowOptionsModal(false)}
      />
    </SafeAreaView>
  );
});

TransportStatusPage.displayName = 'TransportStatusPage';

export default TransportStatusPage;