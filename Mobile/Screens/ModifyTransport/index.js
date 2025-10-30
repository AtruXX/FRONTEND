import React, { useState, useEffect, useCallback } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { styles } from './styles'; // Import your styles from the styles.js file
import { BASE_URL } from "../../utils/BASE_URL";
import PageHeader from "../../components/General/Header";
const Modify_Page = ({ navigation, route }) => {
    // Safely handle potentially undefined route.params
    const transportData = route.params?.transport || {};
    const [showStatusCouplingDropdown, setShowStatusCouplingDropdown] = useState(false);
const statusOptions = [
  { label: "OK", value: "ok" },
  { label: "Probleme", value: "probleme" },
  { label: "Defect", value: "defect" }
];
const [showStatusIncarcareDropdown, setShowStatusIncarcareDropdown] = useState(false);
const [showStatusCamionDropdown, setShowStatusCamionDropdown] = useState(false);
const [showStatusMarfaDropdown, setShowStatusMarfaDropdown] = useState(false);
const [showStatusRemorcaDropdown, setShowStatusRemorcaDropdown] = useState(false);
const [showStatusTransportDropdown, setShowStatusTransportDropdown] = useState(false);
const statusIncarcareOptions = [
  { label: "Incarcat", value: "incarcat" },
  { label: "Probleme", value: "probleme" },
  { label: "Descarcat", value: "descarcat" }
];
const statusTransportOptions = [
    { label: "Intarziat", value: "intarziat" },
    { label: "Punctual", value: "punctual" },
  ];
    // Debug what we received
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [authToken, setAuthToken] = useState(null);
    // Form state with safe defaults
    const [formData, setFormData] = useState({
      transport_id: transportData.id || '',
      truck_combination: transportData.truck_combination || '',
      status_truck: transportData.status_truck || 'ok',
      status_truck_text: transportData.status_truck_text || '',
      status_goods: transportData.status_goods || 'ok',
      status_coupling: transportData.status_coupling || '',
      trailer_type: transportData.trailer_type || '',
      trailer_number: transportData.trailer_number || '',
      status_trailer_wagon: transportData.status_trailer_wagon || 'ok',
      status_loaded_truck: transportData.status_loaded_truck || 'loaded',
      detraction: transportData.detraction || '',
      status_transport: transportData.status_transport || 'ok',
      dispatcher: transportData.dispatcher || ''
    });
  useEffect(() => {
    const loadAuthToken = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          setAuthToken(token);
        } else {
          Alert.alert('Eroare', 'Sesiune expirată. Vă rugăm să vă autentificați din nou.');
          navigation.navigate('Login');
        }
      } catch (error) {
        Alert.alert('Eroare', 'Nu s-a putut încărca token-ul de autentificare.');
      }
    };
    loadAuthToken();
  }, []);
  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };
  const handleSubmit = async () => {
    if (!authToken) {
      Alert.alert('Eroare', 'Token-ul de autentificare lipsește.');
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch(
        'https://atrux-717ecf8763ea.herokuapp.com/update_transport/',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${authToken}`
          },
          body: JSON.stringify(formData)
        }
      );
      if (response.ok) {
        Alert.alert(
          'Succes',
          'Transportul a fost actualizat cu succes.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        const errorData = await response.json();
        Alert.alert('Eroare', 'Nu s-a putut actualiza transportul. Verificați datele introduse.');
      }
    } catch (error) {
      Alert.alert('Eroare', 'Verificați conexiunea la internet.');
    } finally {
      setSubmitting(false);
    }
  };
const handleRetry = useCallback(async () => {
  // Add any specific retry logic for transport modification
  // For example, refetch transport data if available
}, []);
  return (
    <SafeAreaView style={styles.container}>
      <PageHeader
        title="Transport"
        onBack={() => navigation.goBack()}
        onRetry={handleRetry}
        showRetry={true}
        showBack={true}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.formContainer}>
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Informații Camion</Text>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Combinație camion</Text>
              <TextInput
                style={styles.input}
                value={formData.truck_combination}
                onChangeText={(value) => handleInputChange('truck_combination', value)}
                placeholder="Introduceți combinația camionului"
              />
            </View>
            <View style={styles.formGroup}>
  <Text style={styles.label}>Status Camion</Text>
  <TouchableOpacity 
    style={styles.dropdownButton}
    onPress={() => setShowStatusCamionDropdown(true)}
  >
    <Text style={styles.dropdownButtonText}>
      {statusOptions.find(option => option.value === formData.status_truck)?.label || 'Selectează'}
    </Text>
    <Ionicons name="chevron-down" size={20} color="#666" />
  </TouchableOpacity>
  <Modal
    visible={showStatusCamionDropdown}
    transparent={true}
    animationType="slide"
    onRequestClose={() => setShowStatusCamionDropdown(false)}
  >
    <TouchableOpacity 
      style={styles.modalOverlay}
      activeOpacity={1}
      onPress={() => setShowStatusCamionDropdown(false)}
    >
      <View style={styles.dropdownModal}>
        <FlatList
          data={statusOptions}
          keyExtractor={(item) => item.value}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                handleInputChange('status_truck', item.value);
                setShowStatusCamionDropdown(false);
              }}
            >
              <Text style={styles.dropdownItemText}>{item.label}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </TouchableOpacity>
  </Modal>
</View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Detalii status camion</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.status_truck_text}
                onChangeText={(value) => handleInputChange('status_truck_text', value)}
                placeholder="Introduceți detalii despre statusul camionului"
                multiline
                numberOfLines={3}
              />
            </View>
          </View>
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Informații Marfă</Text>
            </View>
            <View style={styles.formGroup}>
  <Text style={styles.label}>Status Marfa</Text>
  <TouchableOpacity 
    style={styles.dropdownButton}
    onPress={() => setShowStatusMarfaDropdown(true)}
  >
    <Text style={styles.dropdownButtonText}>
      {statusOptions.find(option => option.value === formData.status_goods)?.label || 'Selectează'}
    </Text>
    <Ionicons name="chevron-down" size={20} color="#666" />
  </TouchableOpacity>
  <Modal
    visible={showStatusMarfaDropdown}
    transparent={true}
    animationType="slide"
    onRequestClose={() => setShowStatusMarfaDropdown(false)}
  >
    <TouchableOpacity 
      style={styles.modalOverlay}
      activeOpacity={1}
      onPress={() => setShowStatusMarfaDropdown(false)}
    >
      <View style={styles.dropdownModal}>
        <FlatList
          data={statusOptions}
          keyExtractor={(item) => item.value}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                handleInputChange('status_goods', item.value);
                setShowStatusMarfaDropdown(false);
              }}
            >
              <Text style={styles.dropdownItemText}>{item.label}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </TouchableOpacity>
  </Modal>
</View>
            <View style={styles.formGroup}>
  <Text style={styles.label}>Status Incarcare</Text>
  <TouchableOpacity 
    style={styles.dropdownButton}
    onPress={() => setShowStatusIncarcareDropdown(true)}
  >
    <Text style={styles.dropdownButtonText}>
      {statusIncarcareOptions.find(option => option.value === formData.status_loaded_truck)?.label || 'Selectează'}
    </Text>
    <Ionicons name="chevron-down" size={20} color="#666" />
  </TouchableOpacity>
  <Modal
    visible={showStatusIncarcareDropdown}
    transparent={true}
    animationType="slide"
    onRequestClose={() => setShowStatusIncarcareDropdown(false)}
  >
    <TouchableOpacity 
      style={styles.modalOverlay}
      activeOpacity={1}
      onPress={() => setShowStatusIncarcareDropdown(false)}
    >
      <View style={styles.dropdownModal}>
        <FlatList
          data={statusIncarcareOptions}
          keyExtractor={(item) => item.value}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                handleInputChange('status_loaded_truck', item.value);
                setShowStatusIncarcareDropdown(false);
              }}
            >
              <Text style={styles.dropdownItemText}>{item.label}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </TouchableOpacity>
  </Modal>
</View>
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Informații Remorcă</Text>
            </View>
            <View style={styles.formGroup}>
  <Text style={styles.label}>Status Cuplaj</Text>
  <TouchableOpacity 
    style={styles.dropdownButton}
    onPress={() => setShowStatusCouplingDropdown(true)}
  >
    <Text style={styles.dropdownButtonText}>
      {statusOptions.find(option => option.value === formData.status_coupling)?.label || 'Selectează'}
    </Text>
    <Ionicons name="chevron-down" size={20} color="#666" />
  </TouchableOpacity>
  <Modal
    visible={showStatusCouplingDropdown}
    transparent={true}
    animationType="slide"
    onRequestClose={() => setShowStatusCouplingDropdown(false)}
  >
    <TouchableOpacity 
      style={styles.modalOverlay}
      activeOpacity={1}
      onPress={() => setShowStatusCouplingDropdown(false)}
    >
      <View style={styles.dropdownModal}>
        <FlatList
          data={statusOptions}
          keyExtractor={(item) => item.value}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                handleInputChange('status_coupling', item.value);
                setShowStatusCouplingDropdown(false);
              }}
            >
              <Text style={styles.dropdownItemText}>{item.label}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </TouchableOpacity>
  </Modal>
</View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Tip remorcă</Text>
              <TextInput
                style={styles.input}
                value={formData.trailer_type}
                onChangeText={(value) => handleInputChange('trailer_type', value)}
                placeholder="Introduceți tipul remorcii"
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Număr remorcă</Text>
              <TextInput
                style={styles.input}
                value={formData.trailer_number}
                onChangeText={(value) => handleInputChange('trailer_number', value)}
                placeholder="Introduceți numărul remorcii"
              />
            </View>
            <View style={styles.formGroup}>
  <Text style={styles.label}>Status Remorca</Text>
  <TouchableOpacity 
    style={styles.dropdownButton}
    onPress={() => setShowStatusRemorcaDropdown(true)}
  >
    <Text style={styles.dropdownButtonText}>
      {statusOptions.find(option => option.value === formData.status_trailer_wagon)?.label || 'Selectează'}
    </Text>
    <Ionicons name="chevron-down" size={20} color="#666" />
  </TouchableOpacity>
  <Modal
    visible={showStatusRemorcaDropdown}
    transparent={true}
    animationType="slide"
    onRequestClose={() => setShowStatusRemorcaDropdown(false)}
  >
    <TouchableOpacity 
      style={styles.modalOverlay}
      activeOpacity={1}
      onPress={() => setShowStatusRemorcaDropdown(false)}
    >
      <View style={styles.dropdownModal}>
        <FlatList
          data={statusOptions}
          keyExtractor={(item) => item.value}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                handleInputChange('status_trailer_wagon', item.value);
                setShowStatusRemorcaDropdown(false);
              }}
            >
              <Text style={styles.dropdownItemText}>{item.label}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </TouchableOpacity>
  </Modal>
</View>
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Alte Informații</Text>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Detracție</Text>
              <TextInput
                style={styles.input}
                value={formData.detraction}
                onChangeText={(value) => handleInputChange('detraction', value)}
                placeholder="Introduceți detracția"
              />
            </View>
           </View> 
            <View style={styles.formGroup}>
  <Text style={styles.label}>Status Transport</Text>
  <TouchableOpacity 
    style={styles.dropdownButton}
    onPress={() => setShowStatusTransportDropdown(true)}
  >
    <Text style={styles.dropdownButtonText}>
      {statusTransportOptions.find(option => option.value === formData.status_transport)?.label || 'Selectează'}
    </Text>
    <Ionicons name="chevron-down" size={20} color="#666" />
  </TouchableOpacity>
  <Modal
    visible={showStatusTransportDropdown}
    transparent={true}
    animationType="slide"
    onRequestClose={() => setShowStatusTransportDropdown(false)}
  >
    <TouchableOpacity 
      style={styles.modalOverlay}
      activeOpacity={1}
      onPress={() => setShowStatusTransportDropdown(false)}
    >
      <View style={styles.dropdownModal}>
        <FlatList
          data={statusTransportOptions}
          keyExtractor={(item) => item.value}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                handleInputChange('status_transport', item.value);
                setShowStatusTransportDropdown(false);
              }}
            >
              <Text style={styles.dropdownItemText}>{item.label}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </TouchableOpacity>
  </Modal>
</View>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>Actualizare Transport</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
export default Modify_Page;