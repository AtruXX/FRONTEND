import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './styles';

const { height: screenHeight } = Dimensions.get('window');

const TransportDetailsModal = ({ visible, transport, onClose }) => {
  if (!transport) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ro-RO');
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status) => {
    if (status === 'ok') return '#10B981';
    if (status === 'probleme' || status === 'not started') return '#F59E0B';
    return '#EF4444';
  };

  const getStatusText = (status) => {
    if (status === 'ok') return 'OK';
    if (status === 'probleme') return 'Probleme';
    if (status === 'not started') return 'Neînceput';
    return status || 'Neînceput';
  };

  const StatusIndicator = ({ status, label }) => (
    <View style={styles.statusRow}>
      <Text style={styles.statusLabel}>{label}:</Text>
      <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(status)}15` }]}>
        <Ionicons name="ellipse" size={8} color={getStatusColor(status)} />
        <Text style={[styles.statusText, { color: getStatusColor(status) }]}>
          {getStatusText(status)}
        </Text>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        {/* Header */}
        <View style={styles.modalHeader}>
          <View style={styles.headerContent}>
            <View style={styles.dragIndicator} />
            <View style={styles.headerTitleRow}>
              <Text style={styles.modalTitle}>Transport #{transport.id}</Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>{transport.truck_combination}</Text>
          </View>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.modalContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Basic Info Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="information-circle" size={20} color="#6366F1" />
              <Text style={styles.sectionTitle}>Informații Generale</Text>
            </View>

            <View style={styles.infoGrid}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Companie:</Text>
                <Text style={styles.infoValue}>{transport.company || 'N/A'}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Destinație:</Text>
                <Text style={styles.infoValue}>{transport.destination || 'N/A'}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Data creării:</Text>
                <Text style={styles.infoValue}>{formatDate(transport.created_at)}</Text>
              </View>

              {transport.updated_at && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Ultima actualizare:</Text>
                  <Text style={styles.infoValue}>{formatDate(transport.updated_at)}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Status Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="checkmark-circle" size={20} color="#6366F1" />
              <Text style={styles.sectionTitle}>Status Transport</Text>
            </View>

            <View style={styles.statusGrid}>
              <StatusIndicator status={transport.status_truck} label="Status Camion" />
              <StatusIndicator status={transport.status_goods} label="Status Marfă" />
              <StatusIndicator status={transport.status_trailer_wagon} label="Status Remorcă" />
              <StatusIndicator status={transport.status_coupling} label="Status Cuplare" />
              <StatusIndicator status={transport.status_loaded_truck} label="Status Încărcare" />
              <StatusIndicator status={transport.status_transport} label="Status Transport" />
            </View>
          </View>

          {/* CMR Section if available */}
          {(transport.cmr_sender || transport.cmr_receiver || transport.cmr_goods) && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="document-text" size={20} color="#6366F1" />
                <Text style={styles.sectionTitle}>Informații CMR</Text>
              </View>

              <View style={styles.infoGrid}>
                {transport.cmr_sender && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Expeditor:</Text>
                    <Text style={styles.infoValue}>{transport.cmr_sender}</Text>
                  </View>
                )}

                {transport.cmr_receiver && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Destinatar:</Text>
                    <Text style={styles.infoValue}>{transport.cmr_receiver}</Text>
                  </View>
                )}

                {transport.cmr_goods && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Marfă:</Text>
                    <Text style={styles.infoValue}>{transport.cmr_goods}</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Additional Details */}
          {(transport.notes || transport.special_instructions) && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="chatbubble-ellipses" size={20} color="#6366F1" />
                <Text style={styles.sectionTitle}>Observații</Text>
              </View>

              <View style={styles.notesContainer}>
                {transport.notes && (
                  <Text style={styles.notesText}>{transport.notes}</Text>
                )}
                {transport.special_instructions && (
                  <Text style={styles.notesText}>{transport.special_instructions}</Text>
                )}
              </View>
            </View>
          )}

          {/* Bottom padding for safe scrolling */}
          <View style={styles.bottomPadding} />
        </ScrollView>
      </View>
    </Modal>
  );
};

export default TransportDetailsModal;