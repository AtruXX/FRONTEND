import { View, StyleSheet, Alert, Text, TouchableOpacity, Image } from "react-native";

export const styles = StyleSheet.create({
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
    backButton: {
      padding: 8,
    },
    formContainer: {
      padding: 16,
    },
    formSection: {
      backgroundColor: 'white',
      borderRadius: 12,
      marginBottom: 16,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#333',
      marginBottom: 16,
    },
    formGroup: {
      marginBottom: 16,
    },
    label: {
      fontSize: 16,
      color: '#666',
      marginBottom: 8,
    },
    input: {
      backgroundColor: '#f9f9f9',
      borderWidth: 1,
      borderColor: '#e0e0e0',
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
    },
    textArea: {
      height: 100,
      textAlignVertical: 'top',
    },
    pickerContainer: {
      borderWidth: 1,
      borderColor: '#e0e0e0',
      borderRadius: 8,
      backgroundColor: '#f9f9f9',
      overflow: 'hidden',
    },
    picker: {
      height: 50,
    },
    submitButton: {
      backgroundColor: '#3B82F6',
      borderRadius: 8,
      padding: 16,
      alignItems: 'center',
      marginTop: 8,
      marginBottom: 32,
    },
    submitButtonText: {
      color: 'white',
      fontSize: 18,
      fontWeight: 'bold',
    },
    // Add these to your styles
  dropdownButton: {
      backgroundColor: '#f9f9f9',
      borderWidth: 1,
      borderColor: '#e0e0e0',
      borderRadius: 8,
      padding: 12,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    dropdownButtonText: {
      fontSize: 16,
      color: '#333',
    },
    modalOverlay: {
      flex: 1,
      justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)',
      padding: 20,
    },
    dropdownModal: {
      backgroundColor: 'white',
      borderRadius: 8,
      padding: 10,
      maxHeight: 300,
    },
    dropdownItem: {
      padding: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
    },
    dropdownItemText: {
      fontSize: 16,
      color: '#333',
    },
  });