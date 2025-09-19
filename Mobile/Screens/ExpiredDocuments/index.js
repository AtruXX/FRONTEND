import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './styles';
import COLORS from '../../utils/COLORS';
import PageHeader from '../../components/General/Header';
import {
  useGetPersonalDocumentsQuery,
} from '../../services/documentsService';

const DocumentCard = ({ document, daysLeft, isExpired }) => {
  const cardStyle = isExpired ? [styles.documentCard, styles.expiredCard] : styles.documentCard;
  const titleStyle = isExpired ? [styles.documentTitle, styles.expiredTitle] : styles.documentTitle;
  const daysStyle = isExpired ? [styles.daysLeft, styles.expiredDays] : styles.daysLeft;

  // Enhanced document type detection
  const getDocumentIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'license':
      case 'licenta':
        return 'card';
      case 'insurance':
      case 'asigurare':
        return 'shield-checkmark';
      case 'permit':
      case 'permis':
        return 'badge';
      case 'certificate':
      case 'certificat':
        return 'ribbon';
      case 'cmr':
        return 'clipboard';
      default:
        return 'document-text';
    }
  };

  // Enhanced status text
  const getStatusText = () => {
    if (daysLeft < 0) {
      return `Expirat de ${Math.abs(daysLeft)} zile`;
    } else if (daysLeft === 0) {
      return 'Expiră astăzi';
    } else if (daysLeft === 1) {
      return 'Expiră mâine';
    } else if (isExpired) {
      return `Expiră în ${daysLeft} zile`;
    } else {
      return `${daysLeft} zile rămase`;
    }
  };

  return (
    <TouchableOpacity style={cardStyle} activeOpacity={0.7}>
      <View style={styles.documentHeader}>
        <View style={styles.documentIcon}>
          <Ionicons
            name={getDocumentIcon(document.category)}
            size={28}
            color={isExpired ? COLORS.danger : COLORS.primary}
          />
        </View>
        <View style={styles.documentInfo}>
          <Text style={titleStyle}>{document.title || document.name}</Text>
          <Text style={styles.documentCategory}>
            {document.category?.replace('_', ' ').toUpperCase() || 'DOCUMENT'}
          </Text>
        </View>
      </View>

      <View style={styles.documentFooter}>
        <View style={styles.expirationInfo}>
          <Ionicons
            name={daysLeft < 0 ? "close-circle" : isExpired ? "alert-circle" : "time"}
            size={16}
            color={daysLeft < 0 ? COLORS.danger : isExpired ? COLORS.warning : COLORS.medium}
          />
          <Text style={daysStyle}>
            {getStatusText()}
          </Text>
        </View>
        {document.expiration_date && (
          <Text style={styles.expirationDate}>
            Expiră: {new Date(document.expiration_date).toLocaleDateString('ro-RO')}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const ExpiredDocuments = () => {
  const navigation = useNavigation();
  const [documentsWithExpiration, setDocumentsWithExpiration] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: documents,
    isLoading: documentsLoading,
    error: documentsError,
    refetch: refetchDocuments,
  } = useGetPersonalDocumentsQuery();

  // Calculate days left from expiration_date locally
  const calculateDaysLeft = (expirationDate, documentTitle, documentId) => {
    console.log(`🔍 Debug: Document "${documentTitle}" (ID: ${documentId})`);
    console.log(`   Raw expiration_date: ${JSON.stringify(expirationDate)}`);
    console.log(`   Type: ${typeof expirationDate}`);
    console.log(`   Truthy check: ${!!expirationDate}`);
    
    if (!expirationDate || expirationDate === 'null' || expirationDate === null) {
      console.log(`❌ No expiration date for document: ${documentTitle} (ID: ${documentId})`);
      return null;
    }
    
    const today = new Date();
    const expiry = new Date(expirationDate);
    const timeDifference = expiry.getTime() - today.getTime();
    const daysLeft = Math.ceil(timeDifference / (1000 * 3600 * 24));
    
    console.log(`📅 Document: "${documentTitle}" (ID: ${documentId})`);
    console.log(`   Expires: ${expirationDate}`);
    console.log(`   Days left: ${daysLeft}`);
    console.log(`   Status: ${daysLeft <= 10 ? '🔴 EXPIRING SOON' : daysLeft <= 30 ? '🟡 UPCOMING' : '🟢 VALID'}`);
    
    return daysLeft;
  };

  const processDocuments = useCallback(() => {
    if (!documents || documents.length === 0) {
      console.log('📄 No documents found to process');
      setDocumentsWithExpiration([]);
      return;
    }

    console.log(`📋 Processing ${documents.length} documents for expiration data...`);
    
    // Process documents and calculate days left locally
    const documentsWithDays = documents
      .map(document => ({
        ...document,
        daysLeft: calculateDaysLeft(document.expiration_date, document.title || document.name, document.id),
      }))
      .filter(doc => doc.daysLeft !== null && doc.expiration_date) // Only include documents with expiration dates
      .sort((a, b) => a.daysLeft - b.daysLeft); // Sort by days left (ascending)

    console.log(`✅ Processed ${documentsWithDays.length} documents with expiration dates`);
    console.log('📊 Summary:');
    console.log(`   🔴 Expiring soon (≤10 days): ${documentsWithDays.filter(d => d.daysLeft <= 10).length}`);
    console.log(`   🟡 Upcoming (11-30 days): ${documentsWithDays.filter(d => d.daysLeft > 10 && d.daysLeft <= 30).length}`);
    console.log(`   🟢 Valid (>30 days): ${documentsWithDays.filter(d => d.daysLeft > 30).length}`);

    setDocumentsWithExpiration(documentsWithDays);
  }, [documents]);

  useEffect(() => {
    if (documents && !documentsLoading) {
      processDocuments();
    }
  }, [documents, documentsLoading, processDocuments]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetchDocuments();
      // Documents will be processed automatically in useEffect
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refetchDocuments]);

  const handleRetry = useCallback(() => {
    handleRefresh();
  }, [handleRefresh]);

  if (documentsLoading && documentsWithExpiration.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <PageHeader
          title="Documente Expirate"
          onBack={() => navigation.goBack()}
          onRetry={handleRetry}
          showRetry={true}
          showBack={true}
        />
        <View style={styles.loadingContainer}>
          <Ionicons name="document-text-outline" size={48} color={COLORS.primary} />
          <Text style={styles.loadingText}>Se încarcă documentele...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (documentsError) {
    return (
      <SafeAreaView style={styles.container}>
        <PageHeader
          title="Documente Expirate"
          onBack={() => navigation.goBack()}
          onRetry={handleRetry}
          showRetry={true}
          showBack={true}
        />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={COLORS.danger} />
          <Text style={styles.errorTitle}>Eroare la încărcarea documentelor</Text>
          <Text style={styles.errorMessage}>
            {documentsError.message || 'Nu s-au putut încărca documentele'}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>Încearcă din nou</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Enhanced document categorization
  const actuallyExpiredDocuments = documentsWithExpiration.filter(doc => doc.daysLeft < 0);
  const expiringSoonDocuments = documentsWithExpiration.filter(doc => doc.daysLeft >= 0 && doc.daysLeft <= 10);
  const upcomingDocuments = documentsWithExpiration.filter(doc => doc.daysLeft > 10 && doc.daysLeft <= 30);

  return (
    <SafeAreaView style={styles.container}>
      <PageHeader
        title="Expired Documents"
        onBack={() => navigation.goBack()}
        onRetry={handleRetry}
        showRetry={true}
        showBack={true}
      />

      <ScrollView
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {actuallyExpiredDocuments.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="close-circle" size={20} color={COLORS.danger} />
              <Text style={[styles.sectionTitle, styles.expiredSectionTitle]}>
                Documente Expirate
              </Text>
            </View>
            {actuallyExpiredDocuments.map((document) => (
              <DocumentCard
                key={document.id}
                document={document}
                daysLeft={document.daysLeft}
                isExpired={true}
              />
            ))}
          </View>
        )}

        {expiringSoonDocuments.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="alert-circle" size={20} color={COLORS.warning} />
              <Text style={[styles.sectionTitle, { color: COLORS.warning }]}>
                Expiră în curând (≤ 10 zile)
              </Text>
            </View>
            {expiringSoonDocuments.map((document) => (
              <DocumentCard
                key={document.id}
                document={document}
                daysLeft={document.daysLeft}
                isExpired={true}
              />
            ))}
          </View>
        )}

        {upcomingDocuments.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="time" size={20} color={COLORS.warning} />
              <Text style={styles.sectionTitle}>Expirare apropiată (11-30 zile)</Text>
            </View>
            {upcomingDocuments.map((document) => (
              <DocumentCard
                key={document.id}
                document={document}
                daysLeft={document.daysLeft}
                isExpired={false}
              />
            ))}
          </View>
        )}

        {documentsWithExpiration.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="checkmark-circle" size={64} color={COLORS.success} />
            <Text style={styles.emptyTitle}>Toate documentele sunt valide</Text>
            <Text style={styles.emptyMessage}>
              Nu există documente care expiră în următoarele 30 de zile
            </Text>
          </View>
        )}

        {actuallyExpiredDocuments.length === 0 && expiringSoonDocuments.length === 0 && upcomingDocuments.length === 0 && documentsWithExpiration.length > 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="checkmark-circle" size={64} color={COLORS.success} />
            <Text style={styles.emptyTitle}>Niciun document în expirare</Text>
            <Text style={styles.emptyMessage}>
              Toate documentele dumneavoastră sunt valide pentru mai mult de 30 de zile
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ExpiredDocuments;