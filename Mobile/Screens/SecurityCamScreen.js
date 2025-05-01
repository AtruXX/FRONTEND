import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Modal, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ImageSec from "./assets/IMAGESEC.png"
const { width } = Dimensions.get('window');

const SecurityPage = () => {
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      type: 'security',
      title: 'Security alert!',
      date: '2 days ago',
      time: '10:29 AM',
      message: 'Human detected at truck! Photos and videos have been sent to the dispatcher for review.',
      hasImage: true,
      imageSource: ImageSec
    },
    {
      id: 2,
      type: 'security',
      title: 'Security alert!',
      date: '3 days ago',
      time: '08:45 AM',
      message: 'Motion detected in restricted area. Security team has been notified.',
      read: true,
      hasImage: true,
      imageUrl: 'https://via.placeholder.com/400x300'
    },
    {
      id: 3,
      type: 'security',
      title: 'Security alert!',
      date: '1 week ago',
      time: '11:18 PM',
      message: 'Unauthorized access. Please check your truck.',
      read: true,
      hasImage: true,
      imageUrl: 'https://via.placeholder.com/400x300'
    },
    {
      id: 4,
      type: 'security',
      title: 'Security alert!',
      date: '1 week ago',
      time: '03:42 PM',
      message: 'Movement detected near vehicle. Security footage is being reviewed.',
      read: true,
      hasImage: true,
      imageUrl: 'https://via.placeholder.com/400x300'
    },
    {
      id: 5,
      type: 'security',
      title: 'Security alert!',
      date: '2 weeks ago',
      time: '07:15 AM',
      message: 'Alarm triggered at facility entrance. Security personnel dispatched.',
      read: true,
      hasImage: false
    },
    {
      id: 6,
      type: 'security',
      title: 'Security alert!',
      date: '2 weeks ago',
      time: '11:52 PM',
      message: 'Unauthorized access. Please check your truck.',
      read: true,
      hasImage: true,
      imageUrl: 'https://via.placeholder.com/400x300'
    },
    {
      id: 7,
      type: 'security',
      title: 'Security alert!',
      date: '3 weeks ago',
      time: '09:20 AM',
      message: 'Security sensor activated in parking area. Monitoring situation.',
      read: true,
      hasImage: false
    }
  ]);

  const [selectedAlert, setSelectedAlert] = useState(null);
  const [imageModalVisible, setImageModalVisible] = useState(false);

  const markAsRead = (id) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, read: true } : alert
    ));
  };

  const deleteAlert = (id) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
  };

  const showImageModal = (alert) => {
    if (alert.hasImage) {
      setSelectedAlert(alert);
      setImageModalVisible(true);
      if (!alert.read) {
        markAsRead(alert.id);
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Large space at the top */}
      <View style={styles.topSpacer} />
      
      {/* Page title pushed lower */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Security Alerts</Text>
      </View>
      
      <ScrollView style={styles.scrollView}>
        {alerts.map(alert => (
          <TouchableOpacity 
            key={alert.id} 
            style={styles.alertContainer}
            onPress={() => showImageModal(alert)}
            activeOpacity={0.7}
          >
            <View style={styles.alertContent}>
              <View style={[styles.iconContainer, alert.read ? styles.readIcon : styles.unreadIcon]}>
                <View style={[styles.innerIcon, alert.read ? styles.readInnerIcon : styles.unreadInnerIcon]}>
                  <Ionicons name="information" size={20} color="white" />
                </View>
              </View>
              
              <View style={styles.alertTextContainer}>
                <View style={styles.alertHeader}>
                  <View>
                    <Text style={styles.alertTitle}>{alert.title}</Text>
                    <Text style={styles.alertTime}>{alert.date} | {alert.time}</Text>
                  </View>
                  {!alert.read && (
                    <View style={styles.newBadge}>
                      <Text style={styles.newBadgeText}>New</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.alertMessage}>{alert.message}</Text>
                {alert.hasImage && (
                  <Text style={styles.viewDetailsText}>Tap to view footage</Text>
                )}
              </View>
            </View>
            
            {!alert.read && (
              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  style={[styles.button, styles.readButton]}
                  onPress={(e) => {
                    e.stopPropagation();
                    markAsRead(alert.id);
                  }}
                >
                  <Ionicons name="checkmark" size={18} color="white" style={styles.buttonIcon} />
                  <Text style={styles.buttonText}>Read</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.button, styles.deleteButton]}
                  onPress={(e) => {
                    e.stopPropagation();
                    deleteAlert(alert.id);
                  }}
                >
                  <Ionicons name="trash" size={18} color="white" style={styles.buttonIcon} />
                  <Text style={styles.buttonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Image Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={imageModalVisible}
        onRequestClose={() => setImageModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Security Footage</Text>
              <TouchableOpacity onPress={() => setImageModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            {selectedAlert && (
              <View style={styles.modalBody}>
                <Text style={styles.modalDate}>
                  {selectedAlert.date} | {selectedAlert.time}
                </Text>
                <Text style={styles.modalMessage}>{selectedAlert.message}</Text>
                
                {/* Test Images - In a real app, you would replace these with actual security camera footage */}
                <Image 
                  source={{ uri: 'https://via.placeholder.com/400x300?text=Security+Camera+1' }} 
                  style={styles.securityImage} 
                  resizeMode="cover"
                />
                <View style={styles.imageSpacer} />
                <Image 
                  source={{ uri: 'https://via.placeholder.com/400x300?text=Security+Camera+2' }} 
                  style={styles.securityImage} 
                  resizeMode="cover"
                />
                
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setImageModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  topSpacer: {
    height: 100, // Large space at the top
  },
  header: {
    padding: 16,
    paddingTop: 30, // Increased padding to push title lower
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 20, // Additional space after header
  },
  headerTitle: {
    fontSize: 24, // Larger font size
    fontWeight: 'bold',
    textAlign: 'center', // Center aligned
  },
  scrollView: {
    flex: 1,
  },
  alertContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: 'white',
    marginBottom: 8, // Added spacing between alerts
  },
  alertContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadIcon: {
    backgroundColor: '#ffeded',
  },
  readIcon: {
    backgroundColor: '#e0e0e0',
  },
  innerIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadInnerIcon: {
    backgroundColor: '#f44336',
  },
  readInnerIcon: {
    backgroundColor: '#9e9e9e',
  },
  alertTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  alertTime: {
    fontSize: 14,
    color: '#757575',
    marginTop: 2,
  },
  alertMessage: {
    marginTop: 6,
    color: '#424242',
  },
  viewDetailsText: {
    marginTop: 8,
    color: '#2196F3',
    fontSize: 14,
  },
  newBadge: {
    backgroundColor: '#4caf50',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  newBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    height: 56,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  readButton: {
    backgroundColor: '#4caf50',
  },
  deleteButton: {
    backgroundColor: '#9e9e9e',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: width * 0.9,
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 16,
  },
  modalDate: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 4,
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 16,
    color: '#333',
  },
  securityImage: {
    width: '100%',
    height: 200,
    borderRadius: 6,
    backgroundColor: '#e0e0e0',
  },
  imageSpacer: {
    height: 12,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#f44336',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default SecurityPage;