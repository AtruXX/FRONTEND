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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { styles } from './styles';
import COLORS from '../../utils/COLORS';
import PageHeader from '../../components/General/Header';
import { useLoading } from '../../components/General/loadingSpinner';
import { BASE_URL } from '../../utils/BASE_URL';
import {
  useGetPersonalDocumentsQuery,
} from '../../services/documentsService';

const DocumentCard = ({ document, daysLeft, isExpired }) => {
  const cardStyle = isExpired ? [styles.documentCard, styles.expiredCard] : styles.documentCard;
  const titleStyle = isExpired ? [styles.documentTitle, styles.expiredTitle] : styles.documentTitle;
  const daysStyle = isExpired ? [styles.daysLeft, styles.expiredDays] : styles.daysLeft;

  return (
    <TouchableOpacity style={cardStyle} activeOpacity={0.7}>
      <View style={styles.documentHeader}>
        <View style={styles.documentIcon}>
          <Ionicons 
            name="document-text" 
            size={24} 
            color={isExpired ? COLORS.danger : COLORS.primary} 
          />
        </View>
        <View style={styles.documentInfo}>
          <Text style={titleStyle}>{document.name}</Text>
          <Text style={styles.documentCategory}>
            {document.category?.replace('_', ' ').toUpperCase() || 'DOCUMENT'}
          </Text>
        </View>
      </View>
      
      <View style={styles.documentFooter}>
        <View style={styles.expirationInfo}>
          <Ionicons 
            name={isExpired ? "alert-circle" : "time"} 
            size={16} 
            color={isExpired ? COLORS.danger : COLORS.medium} 
          />
          <Text style={daysStyle}>
            {isExpired ? `Expiring in ${daysLeft} days` : `${daysLeft} days left`}
          </Text>
        </View>
        {document.expiration_date && (
          <Text style={styles.expirationDate}>
            Expires: {new Date(document.expiration_date).toLocaleDateString()}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const ExpiredDocuments = () => {
  const navigation = useNavigation();
  const { showLoading, hideLoading } = useLoading();
  const [documentsWithExpiration, setDocumentsWithExpiration] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: documents,
    isLoading: documentsLoading,
    error: documentsError,
    refetch: refetchDocuments,
  } = useGetPersonalDocumentsQuery();

  const fetchExpirationData = useCallback(async () => {
    if (!documents || documents.length === 0) return;

    try {
      showLoading();
      
      const documentsWithExpirationPromises = documents.map(async (document) => {
        try {
          const token = await AsyncStorage.getItem('authToken');
          if (!token) throw new Error('No auth token found');

          const response = await fetch(
            `${BASE_URL}personal-documents/expiration/${document.id}/`,
            {
              method: 'GET',
              headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json',
              },
            }
          );

          if (response.ok) {
            const expirationData = await response.json();
            return {
              ...document,
              daysLeft: expirationData.days_left,
            };
          } else {
            console.warn(`Failed to fetch expiration for document ${document.id}`);
            return {
              ...document,
              daysLeft: null,
            };
          }
        } catch (error) {
          console.error(`Error fetching expiration for document ${document.id}:`, error);
          return {
            ...document,
            daysLeft: null,
          };
        }
      });

      const documentsWithExpirationData = await Promise.all(documentsWithExpirationPromises);
      
      // Filter documents that have expiration data and sort by days left
      const validDocuments = documentsWithExpirationData
        .filter(doc => doc.daysLeft !== null)
        .sort((a, b) => a.daysLeft - b.daysLeft);

      setDocumentsWithExpiration(validDocuments);
    } catch (error) {
      console.error('Error fetching expiration data:', error);
      Alert.alert('Error', 'Failed to load expiration data');
    } finally {
      hideLoading();
    }
  }, [documents, showLoading, hideLoading]);

  useEffect(() => {
    if (documents && !documentsLoading) {
      fetchExpirationData();
    }
  }, [documents, documentsLoading, fetchExpirationData]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetchDocuments();
      await fetchExpirationData();
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refetchDocuments, fetchExpirationData]);

  const handleRetry = useCallback(() => {
    handleRefresh();
  }, [handleRefresh]);

  if (documentsLoading && documentsWithExpiration.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <PageHeader
          title="Expired Documents"
          onBack={() => navigation.goBack()}
          onRetry={handleRetry}
          showRetry={true}
          showBack={true}
        />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading documents...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (documentsError) {
    return (
      <SafeAreaView style={styles.container}>
        <PageHeader
          title="Expired Documents"
          onBack={() => navigation.goBack()}
          onRetry={handleRetry}
          showRetry={true}
          showBack={true}
        />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={COLORS.danger} />
          <Text style={styles.errorTitle}>Error Loading Documents</Text>
          <Text style={styles.errorMessage}>
            {documentsError.message || 'Failed to load documents'}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const expiredDocuments = documentsWithExpiration.filter(doc => doc.daysLeft <= 10);
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
        {expiredDocuments.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="alert-circle" size={20} color={COLORS.danger} />
              <Text style={[styles.sectionTitle, styles.expiredSectionTitle]}>
                Expiring Soon (d 10 days)
              </Text>
            </View>
            {expiredDocuments.map((document) => (
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
              <Text style={styles.sectionTitle}>Upcoming Expiration (11-30 days)</Text>
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
            <Text style={styles.emptyTitle}>All Documents Valid</Text>
            <Text style={styles.emptyMessage}>
              No documents are expiring in the next 30 days
            </Text>
          </View>
        )}

        {expiredDocuments.length === 0 && upcomingDocuments.length === 0 && documentsWithExpiration.length > 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="checkmark-circle" size={64} color={COLORS.success} />
            <Text style={styles.emptyTitle}>No Expiring Documents</Text>
            <Text style={styles.emptyMessage}>
              All your documents are valid for more than 30 days
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ExpiredDocuments;