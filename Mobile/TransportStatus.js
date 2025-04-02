import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TransportStatus = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [transportData, setTransportData] = useState({
    status_truck: "",
    status_goods: "",
    truck_combination: "",
    status_coupling: "",
    trailer_type: "",
    trailer_number: "",
    status_trailer_wagon: "",
    status_loaded_truck: "",
    detraction: "",
    status_transport: ""
  });

  const handleSaveData = () => {
    // Here you would typically save the data to your backend
    console.log("Saving transport data:", transportData);
    setModalVisible(false);
  };

  const handleFinishTransport = () => {
    // Logic to finalize the transport
    console.log("Transport finished with data:", transportData);
    // You might want to navigate away or show a confirmation
    alert("Transport completed successfully!");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transport Status</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <Ionicons name="car-outline" size={24} color="#3B82F6" />
          <Text style={styles.statusTitle}>Assigned Transport</Text>
        </View>
        
        <View style={styles.dataSection}>
          <Text style={styles.dataLabel}>Truck Status:</Text>
          <Text style={styles.dataValue}>{transportData.status_truck || "Not set"}</Text>
          
          <Text style={styles.dataLabel}>Goods Status:</Text>
          <Text style={styles.dataValue}>{transportData.status_goods || "Not set"}</Text>
          
          <Text style={styles.dataLabel}>Truck Combination:</Text>
          <Text style={styles.dataValue}>{transportData.truck_combination || "Not set"}</Text>
          
          <Text style={styles.dataLabel}>Coupling Status:</Text>
          <Text style={styles.dataValue}>{transportData.status_coupling || "Not set"}</Text>
          
          <Text style={styles.dataLabel}>Trailer Type:</Text>
          <Text style={styles.dataValue}>{transportData.trailer_type || "Not set"}</Text>
          
          <Text style={styles.dataLabel}>Trailer Number:</Text>
          <Text style={styles.dataValue}>{transportData.trailer_number || "Not set"}</Text>
          
          <Text style={styles.dataLabel}>Trailer/Wagon Status:</Text>
          <Text style={styles.dataValue}>{transportData.status_trailer_wagon || "Not set"}</Text>
          
          <Text style={styles.dataLabel}>Loaded Truck Status:</Text>
          <Text style={styles.dataValue}>{transportData.status_loaded_truck || "Not set"}</Text>
          
          <Text style={styles.dataLabel}>Detraction:</Text>
          <Text style={styles.dataValue}>{transportData.detraction || "Not set"}</Text>
          
          <Text style={styles.dataLabel}>Transport Status:</Text>
          <Text style={styles.dataValue}>{transportData.status_transport || "Not set"}</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.completeButton]} 
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="create-outline" size={20} color="white" />
            <Text style={styles.buttonText}>Complete Data</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.finishButton]}
            onPress={handleFinishTransport}
          >
            <Ionicons name="checkmark-circle-outline" size={20} color="white" />
            <Text style={styles.buttonText}>Finish Transport</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal for entering transport data */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Complete Transport Data</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close-outline" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer}>
              <FormField 
                label="Truck Status" 
                options={["ok", "damaged", "needs repair"]} 
                value={transportData.status_truck}
                onSelect={(value) => setTransportData({...transportData, status_truck: value})}
              />
              
              <FormField 
                label="Goods Status" 
                options={["ok", "damaged", "incomplete"]} 
                value={transportData.status_goods}
                onSelect={(value) => setTransportData({...transportData, status_goods: value})}
              />
              
              <FormField 
                label="Truck Combination" 
                options={["semi-remorca", "remorca", "single"]} 
                value={transportData.truck_combination}
                onSelect={(value) => setTransportData({...transportData, truck_combination: value})}
              />
              
              <FormField 
                label="Coupling Status" 
                options={["cuplat cu remorca", "decuplat"]} 
                value={transportData.status_coupling}
                onSelect={(value) => setTransportData({...transportData, status_coupling: value})}
              />
              
              <FormField 
                label="Trailer Type" 
                options={["semiremorca", "remorca", "container"]} 
                value={transportData.trailer_type}
                onSelect={(value) => setTransportData({...transportData, trailer_type: value})}
              />
              
              <View style={styles.inputField}>
                <Text style={styles.inputLabel}>Trailer Number:</Text>
                <TextInput
                  style={styles.textInput}
                  value={transportData.trailer_number}
                  onChangeText={(text) => setTransportData({...transportData, trailer_number: text})}
                  placeholder="Enter trailer number"
                />
              </View>
              
              <FormField 
                label="Trailer/Wagon Status" 
                options={["ok", "damaged", "needs repair"]} 
                value={transportData.status_trailer_wagon}
                onSelect={(value) => setTransportData({...transportData, status_trailer_wagon: value})}
              />
              
              <FormField 
                label="Loaded Truck Status" 
                options={["loaded", "empty", "partially loaded"]} 
                value={transportData.status_loaded_truck}
                onSelect={(value) => setTransportData({...transportData, status_loaded_truck: value})}
              />
              
              <FormField 
                label="Detraction" 
                options={["da", "nu"]} 
                value={transportData.detraction}
                onSelect={(value) => setTransportData({...transportData, detraction: value})}
              />
              
              <FormField 
                label="Transport Status" 
                options={["ok", "delayed", "cancelled"]} 
                value={transportData.status_transport}
                onSelect={(value) => setTransportData({...transportData, status_transport: value})}
              />
            </ScrollView>

            <TouchableOpacity style={styles.saveButton} onPress={handleSaveData}>
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Helper component for form fields with options
const FormField = ({ label, options, value, onSelect }) => {
  return (
    <View style={styles.formField}>
      <Text style={styles.formLabel}>{label}:</Text>
      <View style={styles.optionsContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.optionButton,
              value === option && styles.selectedOption,
            ]}
            onPress={() => onSelect(option)}
          >
            <Text style={[
              styles.optionText,
              value === option && styles.selectedOptionText,
            ]}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statusCard: {
    margin: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#333',
  },
  dataSection: {
    marginBottom: 16,
  },
  dataLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  dataValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  completeButton: {
    backgroundColor: '#3B82F6',
  },
  finishButton: {
    backgroundColor: '#10B981',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 6,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  formContainer: {
    padding: 16,
  },
  formField: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  optionButton: {
    backgroundColor: '#f5f5f5',
    padding: 8,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedOption: {
    backgroundColor: '#3B82F6',
  },
  optionText: {
    color: '#333',
  },
  selectedOptionText: {
    color: 'white',
  },
  inputField: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 6,
    padding: 10,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#3B82F6',
    padding: 16,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TransportStatus;