import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Image, Platform } from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import {styles} from './styles'; // Import your styles from the styles.js file
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
      <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
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
export default DocumentsScreen;