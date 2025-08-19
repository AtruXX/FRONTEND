import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  RefreshControl,
  Image,
  Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useGetUserProfileQuery } from '../../services/profileService';
import { 
  useGetActiveTransportQuery, 
  useGetTruckQuery, 
  useGetTruckDocumentsQuery 
} from '../../services/vehicleService';
import PageHeader from "../../components/General/Header";
const TruckPageScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);

  // Get user profile
  const {
    data: profileData,
    isLoading: profileLoading,
    error: profileError,
    refetch: refetchProfile
  } = useGetUserProfileQuery();

  // Get active transport using the transport ID from profile
  const activeTransportId = profileData?.active_transport;
  const {
    data: activeTransport,
    isLoading: transportLoading,
    error: transportError,
    refetch: refetchTransport
  } = useGetActiveTransportQuery(activeTransportId);

  // Get truck details using truck ID from active transport
  const {
    data: truckData,
    isLoading: truckLoading,
    error: truckError,
    refetch: refetchTruck
  } = useGetTruckQuery(activeTransport?.truck);

  // Get truck documents
  const {
    data: truckDocuments,
    isLoading: documentsLoading,
    error: documentsError,
    refetch: refetchDocuments
  } = useGetTruckDocumentsQuery(activeTransport?.truck);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchProfile(),
        refetchTransport(),
        refetchTruck(),
        refetchDocuments()
      ]);
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleBackPress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Home');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('ro-RO', options);
  };

  const getDocumentStatusColor = (status, expirationDate) => {
    if (status === 'expired' || (expirationDate && new Date(expirationDate) < new Date())) {
      return '#EF4444'; // Red
    }
    if (expirationDate) {
      const daysUntilExpiry = Math.ceil((new Date(expirationDate) - new Date()) / (1000 * 60 * 60 * 24));
      if (daysUntilExpiry <= 30) {
        return '#F59E0B'; // Orange
      }
    }
    return '#10B981'; // Green
  };

  const openDocument = async (documentUrl) => {
    try {
      const supported = await Linking.canOpenURL(documentUrl);
      if (supported) {
        await Linking.openURL(documentUrl);
      } else {
        Alert.alert('Eroare', 'Nu se poate deschide documentul');
      }
    } catch (error) {
      console.error('Error opening document:', error);
      Alert.alert('Eroare', 'Nu se poate deschide documentul');
    }
  };

  const isLoading = profileLoading || transportLoading || truckLoading || documentsLoading;

  if (isLoading && !refreshing) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>Se încarcă detaliile camionului...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!activeTransportId || !activeTransport) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          
          
          <View style={styles.emptyContainer}>
            <Ionicons name="truck-outline" size={60} color="#6366F1" />
            <Text style={styles.emptyTitle}>Niciun transport activ</Text>
            <Text style={styles.emptyText}>Nu aveți un transport activ asignat în acest moment</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }


  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <PageHeader
        title="AUTOVEHICUL"
        onBack={() => navigation.goBack()}
        onRetry={onRefresh}
        showRetry={true}
        showBack={true}
      />

        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#6366F1']}
            />
          }
        >
          {/* Truck Overview Card */}
          {truckData && (
            <View style={styles.truckOverviewCard}>
              <View style={styles.truckImageContainer}>
                <View style={styles.truckIconContainer}>
                  <Ionicons name="truck" size={48} color="#6366F1" />
                </View>
              </View>
              <View style={styles.truckInfoContainer}>
                <Text style={styles.truckModel}>{truckData.make} {truckData.model}</Text>
                <Text style={styles.truckNumber}>{truckData.license_plate}</Text>
                <View style={styles.truckIdContainer}>
                  <Ionicons name="barcode-outline" size={16} color="#666" />
                  <Text style={styles.truckIdText}>VIN: {truckData.vin}</Text>
                </View>
                <View style={styles.truckIdContainer}>
                  <Ionicons name="calendar-outline" size={16} color="#666" />
                  <Text style={styles.truckIdText}>An: {truckData.year}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Transport Info Card */}
          <View style={styles.detailCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="location" size={20} color="#6366F1" />
              <Text style={styles.cardTitle}>Transport Activ</Text>
            </View>
            <View style={styles.cardContent}>
              <View style={styles.transportDetail}>
                <Text style={styles.transportLabel}>Destinatar:</Text>
                <Text style={styles.transportValue}>{activeTransport.email_destinatar || 'N/A'}</Text>
              </View>
              <View style={styles.transportDetail}>
                <Text style={styles.transportLabel}>Status:</Text>
                <Text style={[styles.transportValue, { color: '#6366F1', fontWeight: '600' }]}>
                  {activeTransport.status}
                </Text>
              </View>
              <View style={styles.transportDetail}>
                <Text style={styles.transportLabel}>Dispatcher:</Text>
                <Text style={styles.transportValue}>{activeTransport.dispatcher || 'N/A'}</Text>
              </View>
              <View style={styles.transportDetail}>
                <Text style={styles.transportLabel}>Trailer:</Text>
                <Text style={styles.transportValue}>#{activeTransport.trailer}</Text>
              </View>
            </View>
          </View>

          {/* Technical Specifications */}
          {truckData && (
            <View style={styles.detailCard}>
              <View style={styles.cardHeader}>
                <Ionicons name="construct" size={20} color="#6366F1" />
                <Text style={styles.cardTitle}>Specificații Tehnice</Text>
              </View>
              <View style={styles.cardContent}>
                <View style={styles.specificationsGrid}>
                  <View style={styles.specificationItem}>
                    <Text style={styles.specificationLabel}>Motor</Text>
                    <Text style={styles.specificationValue}>
                      {truckData.engine?.type} - {truckData.engine?.horsepower} HP
                    </Text>
                  </View>
                  <View style={styles.specificationItem}>
                    <Text style={styles.specificationLabel}>Greutate Maximă</Text>
                    <Text style={styles.specificationValue}>
                      {truckData.weight?.gross_weight} {truckData.weight?.unit}
                    </Text>
                  </View>
                  <View style={styles.specificationItem}>
                    <Text style={styles.specificationLabel}>Dimensiuni</Text>
                    <Text style={styles.specificationValue}>
                      {truckData.dimensions?.length}"L x {truckData.dimensions?.width}"W x {truckData.dimensions?.height}"H
                    </Text>
                  </View>
                  <View style={styles.specificationItem}>
                    <Text style={styles.specificationLabel}>Tip Încărcare</Text>
                    <Text style={styles.specificationValue}>
                      {truckData.load?.load_type}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Legal & Safety Information */}
          {truckData?.legal_condition && (
            <View style={styles.detailCard}>
              <View style={styles.cardHeader}>
                <Ionicons name="shield-checkmark" size={20} color="#6366F1" />
                <Text style={styles.cardTitle}>Informații Legale</Text>
              </View>
              <View style={styles.cardContent}>
                <View style={styles.legalItem}>
                  <Text style={styles.legalLabel}>Rating Siguranță:</Text>
                  <Text style={[styles.legalValue, { color: '#10B981' }]}>
                    {truckData.legal_condition.safety_rating}
                  </Text>
                </View>
                <View style={styles.legalItem}>
                  <Text style={styles.legalLabel}>Ultima Inspecție DOT:</Text>
                  <Text style={styles.legalValue}>
                    {formatDate(truckData.legal_condition.dot_inspection)}
                  </Text>
                </View>
                <View style={styles.legalItem}>
                  <Text style={styles.legalLabel}>Polița Asigurare:</Text>
                  <Text style={styles.legalValue}>
                    {truckData.legal_condition.insurance_policy}
                  </Text>
                </View>
                <View style={styles.legalItem}>
                  <Text style={styles.legalLabel}>Expirare Înregistrare:</Text>
                  <Text style={styles.legalValue}>
                    {formatDate(truckData.legal_condition.registration_expiry)}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Documents Card */}
          {truckDocuments && truckDocuments.documents && truckDocuments.documents.length > 0 && (
            <View style={styles.detailCard}>
              <View style={styles.cardHeader}>
                <Ionicons name="document-text" size={20} color="#6366F1" />
                <Text style={styles.cardTitle}>Documente ({truckDocuments.number_of_documents})</Text>
              </View>
              <View style={styles.cardContent}>
                {truckDocuments.documents.map((doc) => (
                  <TouchableOpacity
                    key={doc.id}
                    style={styles.documentItem}
                    onPress={() => openDocument(doc.document)}
                  >
                    <View style={styles.documentInfo}>
                      <Text style={styles.documentTitle}>{doc.title}</Text>
                      <Text style={styles.documentCategory}>Categorie: {doc.category}</Text>
                      {doc.expiration_date && (
                        <Text style={styles.documentExpiry}>
                          Expiră: {formatDate(doc.expiration_date)}
                        </Text>
                      )}
                      {doc.description && (
                        <Text style={styles.documentDescription}>{doc.description}</Text>
                      )}
                    </View>
                    <View style={styles.documentActions}>
                      <View
                        style={[
                          styles.documentStatus,
                          { backgroundColor: `${getDocumentStatusColor(doc.status, doc.expiration_date)}15` }
                        ]}
                      >
                        <Text
                          style={[
                            styles.documentStatusText,
                            { color: getDocumentStatusColor(doc.status, doc.expiration_date) }
                          ]}
                        >
                          {doc.status}
                        </Text>
                      </View>
                      <Ionicons name="download-outline" size={20} color="#6366F1" />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Maintenance Card */}
          {truckData?.last_service_date && (
            <View style={styles.detailCard}>
              <View style={styles.cardHeader}>
                <Ionicons name="build" size={20} color="#6366F1" />
                <Text style={styles.cardTitle}>Mentenanță</Text>
              </View>
              <View style={styles.cardContent}>
                <View style={styles.maintenanceItem}>
                  <Text style={styles.maintenanceLabel}>Ultima Revizie:</Text>
                  <Text style={styles.maintenanceValue}>
                    {formatDate(truckData.last_service_date)}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  refreshButton: {
    padding: 8,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  scrollContainer: {
    padding: 16,
  },
  truckOverviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  truckImageContainer: {
    marginRight: 16,
  },
  truckIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  truckInfoContainer: {
    flex: 1,
  },
  truckModel: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  truckNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366F1',
    marginBottom: 8,
  },
  truckIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  truckIdText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 6,
  },
  detailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },
  cardContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  transportDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  transportLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  transportValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
    marginLeft: 12,
  },
  specificationsGrid: {
    gap: 12,
  },
  specificationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  specificationLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  specificationValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
    marginLeft: 12,
  },
  legalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  legalLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  legalValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
    marginLeft: 12,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  documentInfo: {
    flex: 1,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  documentCategory: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  documentExpiry: {
    fontSize: 12,
    color: '#F59E0B',
    marginBottom: 2,
  },
  documentDescription: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  documentActions: {
    alignItems: 'center',
    marginLeft: 12,
  },
  documentStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  documentStatusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  maintenanceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  maintenanceLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  maintenanceValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
  },
});

export default TruckPageScreen;