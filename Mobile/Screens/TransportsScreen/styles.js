import { View, StyleSheet, Alert, Text, TouchableOpacity, Image } from "react-native";

export const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: "#f8f9fa",
    },
    container: {
      flex: 1,
      backgroundColor: "#f8f9fa",
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: "#f8f9fa",
    },
    loadingText: {
      marginTop: 12,
      fontSize: 16,
      color: '#666',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: 'white',
      borderBottomWidth: 1,
      borderBottomColor: '#f0f0f0',
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#333',
    },
    backButton: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: '#f8f9fa',
    },
    refreshIconButton: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: '#EFF6FF',
    },
    listContainer: {
      padding: 16,
    },
    transportCard: {
      backgroundColor: 'white',
      borderRadius: 12,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
      overflow: 'hidden',
    },
    transportHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      backgroundColor: 'white',
      borderBottomWidth: 1,
      borderBottomColor: '#f0f0f0',
    },
    transportTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#333',
    },
    transportSubtitle: {
      fontSize: 14,
      color: '#666',
      marginTop: 2,
    },
    modifyButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#EFF6FF',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
    },
    modifyButtonText: {
      color: '#6366F1',
      fontWeight: '500',
      fontSize: 14,
      marginRight: 4,
    },
    transportDetails: {
      padding: 16,
    },
    detailSection: {
      marginBottom: 16,
    },
    sectionTitle: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    sectionIcon: {
      marginRight: 6,
    },
    sectionTitleText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#333',
    },
    detailGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    detailItem: {
      width: '48%',
      marginBottom: 12,
    },
    detailLabel: {
      fontSize: 14,
      color: '#666',
      marginBottom: 4,
    },
    detailValue: {
      fontSize: 15,
      fontWeight: '500',
      color: '#333',
    },
    statusContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    statusIcon: {
      marginRight: 4,
    },
    statusText: {
      fontWeight: '500',
      fontSize: 14,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    emptyIconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: '#EFF6FF',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#333',
      marginBottom: 8,
    },
    emptyText: {
      fontSize: 16,
      color: '#666',
      marginBottom: 24,
      textAlign: 'center',
    },
    refreshButton: {
      flexDirection: 'row',
      backgroundColor: '#6366F1',
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
    refreshButtonText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 16,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#fff' // Or whatever background color you prefer
    },
    actionSection: {
      marginTop: 16,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: '#E5E7EB',
    },
  
    // Start transport button
    startButton: {
      backgroundColor: '#6366F1',
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3,
    },
  
    // Active button state (CURSA ACTUALĂ)
    activeButton: {
      backgroundColor: '#10B981', // Green color
    },
  
    // Disabled button state
    disabledButton: {
      backgroundColor: '#9CA3AF', // Gray color
      opacity: 0.6,
    },
  
    // Button text
    startButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
      textAlign: 'center',
    },
  
    // Button icon
    buttonIcon: {
      marginRight: 8,
    },
  
    // Disabled card style
    disabledCard: {
      opacity: 0.7,
      backgroundColor: '#F9FAFB',
    },
  
    // Destination text
    destinationText: {
      fontSize: 12,
      color: '#666',
      marginTop: 4,
      flexDirection: 'row',
      alignItems: 'center',
    },
  
    // Loading text
    loadingText: {
      marginTop: 12,
      fontSize: 16,
      color: '#666',
      textAlign: 'center',
    },
  
    // Transport info section
    transportInfoSection: {
      backgroundColor: '#F8FAFC',
      padding: 12,
      borderRadius: 8,
      marginBottom: 12,
    },
  
    // Info row
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 6,
    },
  
    // Info text
    infoText: {
      fontSize: 14,
      color: '#374151',
      marginLeft: 8,
      fontWeight: '500',
    },
  });