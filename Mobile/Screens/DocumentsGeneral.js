import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Image, Platform } from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';

const DocumentsScreen = () => {
  // Sample recent documents data
  const [recentDocuments, setRecentDocuments] = useState([
    { id: 1, name: 'Foaia de parcurs', type: 'PDF', size: '1.2 MB', date: 'Today, 10:24 AM', status: 'approved' },
    { id: 2, name: 'Invoice TR-8742', type: 'DOCX', size: '0.8 MB', date: 'Yesterday', status: 'pending' },
    { id: 3, name: 'Delivery confirmation', type: 'JPG', size: '2.5 MB', date: '12 Feb, 2025', status: 'approved' },
    { id: 4, name: 'Truck maintenance report', type: 'PDF', size: '3.7 MB', date: '10 Feb, 2025', status: 'rejected' },
    { id: 5, name: 'Route plan February', type: 'PDF', size: '0.9 MB', date: '05 Feb, 2025', status: 'approved' },
  ]);

  const getFileIcon = (type) => {
    switch(type) {
      case 'PDF':
        return <MaterialCommunityIcons name="file-pdf-box" size={24} color="#E94335" />;
      case 'DOCX':
        return <MaterialCommunityIcons name="file-word-box" size={24} color="#4285F4" />;
      case 'JPG':
        return <MaterialCommunityIcons name="file-image" size={24} color="#34A853" />;
      default:
        return <MaterialCommunityIcons name="file-document" size={24} color="#777" />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'approved': return '#34A853';
      case 'pending': return '#FBBC05';
      case 'rejected': return '#E94335';
      default: return '#777';
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'approved': return 'Approved';
      case 'pending': return 'Pending';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Upload a document</Text>
      </View>

      <ScrollView style={styles.scrollContainer}>
        {/* Upload Section */}
        <View style={styles.uploadSection}>
          <Text style={styles.sectionTitle}>Upload or take a photo of</Text>
          <Text style={styles.documentName}>Foaia de parcurs</Text>
          
          <Text style={styles.helpText}>
            This helps you and your dispatcher access easier all the documents if needed to.
            You can always find it in it's folder in the "Papers" section.
          </Text>

          <View style={styles.filePreviewContainer}>
            <MaterialCommunityIcons name="file" size={40} color="#4285F4" />
          </View>

          <TouchableOpacity style={styles.uploadArea}>
            <Ionicons name="add-circle-outline" size={32} color="#4285F4" />
            <Text style={styles.uploadText}>Click to upload</Text>
          </TouchableOpacity>

          <View style={styles.fileTypesContainer}>
            <View style={styles.fileType}>
              <Text style={styles.fileTypeText}>PDF</Text>
            </View>
            <View style={styles.fileType}>
              <Text style={styles.fileTypeText}>DOCX</Text>
            </View>
            <View style={styles.fileType}>
              <Text style={styles.fileTypeText}>JPG</Text>
            </View>
            <View style={styles.fileType}>
              <Text style={styles.fileTypeText}>&gt; 10 MB</Text>
            </View>
          </View>

          <Text style={styles.orText}>Or</Text>

          <TouchableOpacity style={styles.cameraButton}>
            <Ionicons name="camera" size={20} color="#4285F4" />
            <Text style={styles.cameraButtonText}>Open Camera & Take Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.uploadDocumentButton}>
            <Text style={styles.uploadDocumentButtonText}>Upload document</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Documents Section */}
        <View style={styles.recentDocumentsSection}>
          <Text style={styles.recentDocumentsTitle}>Recent Documents</Text>
          
          {recentDocuments.map(doc => (
            <View key={doc.id} style={styles.documentItem}>
              <View style={styles.documentIconContainer}>
                {getFileIcon(doc.type)}
              </View>
              
              <View style={styles.documentInfo}>
                <Text style={styles.documentTitle}>{doc.name}</Text>
                <View style={styles.documentDetails}>
                  <Text style={styles.documentType}>{doc.type}</Text>
                  <Text style={styles.documentSize}>{doc.size}</Text>
                  <Text style={styles.documentDate}>{doc.date}</Text>
                </View>
              </View>
              
              <View style={styles.documentStatus}>
                <View style={[styles.statusIndicator, {backgroundColor: getStatusColor(doc.status)}]} />
                <Text style={styles.statusText}>{getStatusLabel(doc.status)}</Text>
              </View>
              
              <TouchableOpacity style={styles.documentMenuButton}>
                <MaterialIcons name="more-vert" size={20} color="#777" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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

export default DocumentsScreen;