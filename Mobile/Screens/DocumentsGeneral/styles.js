import { View, StyleSheet, Alert, Text, TouchableOpacity, Image } from "react-native";

export const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#FFFFFF',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#E1E1E1',
    },
    backButton: {
      padding: 4,
      marginRight: 12,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
    },
    scrollContainer: {
      flex: 1,
    },
    uploadSection: {
      padding: 20,
    },
    sectionTitle: {
      fontSize: 18,
      color: '#333',
    },
    documentName: {
      fontSize: 18,
      fontWeight: '500',
      color: '#4285F4',
      marginBottom: 12,
    },
    helpText: {
      fontSize: 14,
      color: '#999',
      lineHeight: 20,
      marginBottom: 16,
    },
    filePreviewContainer: {
      alignSelf: 'center',
      marginVertical: 16,
      padding: 20,
      backgroundColor: '#F0F6FF',
      borderRadius: 8,
    },
    uploadArea: {
      height: 180,
      borderWidth: 2,
      borderColor: '#4285F4',
      borderRadius: 16,
      borderStyle: 'dashed',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    uploadText: {
      marginTop: 8,
      fontSize: 16,
      color: '#777',
    },
    fileTypesContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: 24,
    },
    fileType: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      backgroundColor: '#F5F5F5',
      borderRadius: 4,
      marginHorizontal: 4,
    },
    fileTypeText: {
      fontSize: 14,
      color: '#666',
    },
    orText: {
      textAlign: 'center',
      fontSize: 16,
      color: '#777',
      marginBottom: 16,
    },
    cameraButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#EEF3FF',
      borderRadius: 25,
      paddingVertical: 12,
      paddingHorizontal: 24,
      marginBottom: 24,
    },
    cameraButtonText: {
      fontSize: 16,
      color: '#4285F4',
      marginLeft: 8,
    },
    uploadDocumentButton: {
      backgroundColor: '#4285F4',
      borderRadius: 25,
      paddingVertical: 16,
      alignItems: 'center',
    },
    uploadDocumentButtonText: {
      fontSize: 16,
      fontWeight: '500',
      color: '#FFFFFF',
    },
    recentDocumentsSection: {
      padding: 20,
      borderTopWidth: 8,
      borderTopColor: '#F0F2F5',
    },
    recentDocumentsTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 16,
    },
    documentItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#EEEEEE',
    },
    documentIconContainer: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    documentInfo: {
      flex: 1,
    },
    documentTitle: {
      fontSize: 16,
      fontWeight: '500',
      marginBottom: 4,
    },
    documentDetails: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    documentType: {
      fontSize: 12,
      color: '#777',
      marginRight: 8,
    },
    documentSize: {
      fontSize: 12,
      color: '#777',
      marginRight: 8,
    },
    documentDate: {
      fontSize: 12,
      color: '#777',
    },
    documentStatus: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 12,
    },
    statusIndicator: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: 4,
    },
    statusText: {
      fontSize: 12,
      color: '#777',
    },
    documentMenuButton: {
      padding: 4,
    },
  });