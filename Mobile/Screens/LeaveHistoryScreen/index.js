// LeaveHistoryScreen/index.js - Leave Requests History
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './styles';
import {
  useGetLeaveRequestsQuery,
  useDeleteLeaveRequestMutation
} from '../../services/leaveService';
import { useLoading } from "../../components/General/loadingSpinner.js";
import PageHeader from "../../components/General/Header";

// Status Filter Component
const StatusFilter = React.memo(({ selectedStatus, onStatusChange }) => {
  const statusOptions = [
    { key: 'all', label: 'Toate', color: '#6B7280' },
    { key: 'pending', label: 'În așteptare', color: '#F59E0B' },
    { key: 'approved', label: 'Aprobate', color: '#10B981' },
    { key: 'rejected', label: 'Respinse', color: '#EF4444' },
  ];

  return (
    <View style={styles.filterContainer}>
      <Text style={styles.filterTitle}>Filtrează după status:</Text>
      <View style={styles.filterOptions}>
        {statusOptions.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.filterOption,
              selectedStatus === option.key && styles.filterOptionActive,
              selectedStatus === option.key && { borderColor: option.color }
            ]}
            onPress={() => onStatusChange(option.key)}
          >
            <Text
              style={[
                styles.filterOptionText,
                selectedStatus === option.key && { color: option.color }
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
});

// Leave Request Item Component
const LeaveRequestItem = React.memo(({
  request,
  onEdit,
  onDelete,
  onViewDetails,
  isDeleting
}) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return '#10B981';
      case 'rejected': return '#EF4444';
      case 'pending': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved': return 'Aprobat';
      case 'rejected': return 'Respins';
      case 'pending': return 'În așteptare';
      default: return 'Necunoscut';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ro-RO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const calculateDays = () => {
    const start = new Date(request.start_date);
    const end = new Date(request.end_date);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const canEdit = request.status === 'pending';
  const canDelete = request.status === 'pending';

  return (
    <View style={styles.requestItem}>
      {/* Header */}
      <View style={styles.requestHeader}>
        <View style={styles.requestDatesContainer}>
          <Text style={styles.requestDates}>
            {formatDate(request.start_date)} - {formatDate(request.end_date)}
          </Text>
          <Text style={styles.requestDays}>
            {calculateDays()} {calculateDays() === 1 ? 'zi' : 'zile'}
          </Text>
        </View>

        <View style={[
          styles.statusBadge,
          { backgroundColor: `${getStatusColor(request.status)}15` }
        ]}>
          <Text style={[
            styles.statusText,
            { color: getStatusColor(request.status) }
          ]}>
            {getStatusText(request.status)}
          </Text>
        </View>
      </View>

      {/* Reason */}
      <Text style={styles.requestReason} numberOfLines={3}>
        {request.reason}
      </Text>

      {/* Approval/Rejection Details */}
      {request.status === 'approved' && request.approved_by_name && (
        <View style={styles.approvalContainer}>
          <Ionicons name="checkmark-circle" size={16} color="#10B981" />
          <Text style={styles.approvalText}>
            Aprobat de {request.approved_by_name}
          </Text>
        </View>
      )}

      {request.status === 'rejected' && request.rejection_reason && (
        <View style={styles.rejectionContainer}>
          <Ionicons name="close-circle" size={16} color="#EF4444" />
          <Text style={styles.rejectionText}>
            Motivul respingerii: {request.rejection_reason}
          </Text>
        </View>
      )}

      {/* Actions */}
      <View style={styles.requestActions}>
        <TouchableOpacity
          style={styles.detailsButton}
          onPress={() => onViewDetails(request)}
        >
          <Ionicons name="eye" size={16} color="#6366F1" />
          <Text style={styles.detailsButtonText}>Detalii</Text>
        </TouchableOpacity>

        {canEdit && (
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => onEdit(request)}
          >
            <Ionicons name="pencil" size={16} color="#F59E0B" />
            <Text style={styles.editButtonText}>Editează</Text>
          </TouchableOpacity>
        )}

        {canDelete && (
          <TouchableOpacity
            style={[
              styles.deleteButton,
              isDeleting && styles.deleteButtonDisabled
            ]}
            onPress={() => onDelete(request)}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Ionicons name="hourglass" size={16} color="#EF4444" />
            ) : (
              <Ionicons name="trash" size={16} color="#EF4444" />
            )}
            <Text style={styles.deleteButtonText}>Șterge</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Created Date */}
      <Text style={styles.createdDate}>
        Creat la: {new Date(request.created_at).toLocaleDateString('ro-RO', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}
      </Text>
    </View>
  );
});

// Empty State Component
const EmptyState = React.memo(({ selectedStatus, onCreateNew, onRefresh }) => {
  const getEmptyMessage = () => {
    switch (selectedStatus) {
      case 'pending':
        return 'Nu ai cereri în așteptare';
      case 'approved':
        return 'Nu ai cereri aprobate';
      case 'rejected':
        return 'Nu ai cereri respinse';
      default:
        return 'Nu ai nicio cerere de concediu';
    }
  };

  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="document-outline" size={48} color="#9CA3AF" />
      </View>

      <Text style={styles.emptyTitle}>{getEmptyMessage()}</Text>

      {selectedStatus === 'all' && (
        <>
          <Text style={styles.emptyText}>
            Începe prin a crea prima ta cerere de concediu
          </Text>
          <TouchableOpacity style={styles.createButton} onPress={onCreateNew}>
            <Ionicons name="add" size={20} color="white" />
            <Text style={styles.createButtonText}>Cerere nouă</Text>
          </TouchableOpacity>
        </>
      )}

      <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
        <Text style={styles.refreshButtonText}>Reîmprospătare</Text>
        <Ionicons name="refresh" size={16} color="#6366F1" />
      </TouchableOpacity>
    </View>
  );
});

// Main Leave History Screen
const LeaveHistoryScreen = React.memo(({ navigation, route }) => {
  const { showLoading, hideLoading } = useLoading();
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [deletingRequestId, setDeletingRequestId] = useState(null);

  // Fetch leave requests
  const {
    data: requestsData,
    isLoading: requestsLoading,
    isFetching: requestsFetching,
    error: requestsError,
    refetch: refetchRequests
  } = useGetLeaveRequestsQuery({
    status: selectedStatus === 'all' ? undefined : selectedStatus
  });

  const [deleteLeaveRequest] = useDeleteLeaveRequestMutation();

  // Update global loading state
  useEffect(() => {
    if (requestsLoading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [requestsLoading, showLoading, hideLoading]);

  // Filter and sort requests
  const requests = useMemo(() => {
    if (!requestsData?.results) return [];

    return requestsData.results.sort((a, b) => {
      // Sort by created date, newest first
      return new Date(b.created_at) - new Date(a.created_at);
    });
  }, [requestsData]);

  const onRefresh = useCallback(async () => {
    try {
      await refetchRequests();
    } catch (error) {
      console.error('Error refreshing requests:', error);
    }
  }, [refetchRequests]);

  const handleStatusChange = useCallback((status) => {
    setSelectedStatus(status);
  }, []);

  const handleEdit = useCallback((request) => {
    navigation.navigate('LeaveRequestScreen', { request });
  }, [navigation]);

  const handleDelete = useCallback(async (request) => {
    Alert.alert(
      'Confirmă ștergerea',
      `Ești sigur că vrei să ștergi cererea de concediu din perioada ${new Date(request.start_date).toLocaleDateString('ro-RO')} - ${new Date(request.end_date).toLocaleDateString('ro-RO')}?`,
      [
        { text: 'Anulează', style: 'cancel' },
        {
          text: 'Șterge',
          style: 'destructive',
          onPress: async () => {
            setDeletingRequestId(request.id);
            try {
              await deleteLeaveRequest(request.id).unwrap();
              Alert.alert('Succes', 'Cererea a fost ștersă cu succes.');
              await refetchRequests();
            } catch (error) {
              console.error('Error deleting request:', error);
              Alert.alert('Eroare', 'Nu s-a putut șterge cererea. Încearcă din nou.');
            } finally {
              setDeletingRequestId(null);
            }
          }
        }
      ]
    );
  }, [deleteLeaveRequest, refetchRequests]);

  const handleViewDetails = useCallback((request) => {
    // You could navigate to a detailed view or show a modal
    Alert.alert(
      'Detalii cerere',
      `Perioada: ${new Date(request.start_date).toLocaleDateString('ro-RO')} - ${new Date(request.end_date).toLocaleDateString('ro-RO')}\n\nMotiv: ${request.reason}\n\nStatus: ${request.status === 'approved' ? 'Aprobat' : request.status === 'rejected' ? 'Respins' : 'În așteptare'}${request.rejection_reason ? `\n\nMotivul respingerii: ${request.rejection_reason}` : ''}`,
      [{ text: 'OK' }]
    );
  }, []);

  const handleCreateNew = useCallback(() => {
    navigation.navigate('LeaveRequestScreen');
  }, [navigation]);

  const renderRequestItem = useCallback(({ item }) => (
    <LeaveRequestItem
      request={item}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onViewDetails={handleViewDetails}
      isDeleting={deletingRequestId === item.id}
    />
  ), [handleEdit, handleDelete, handleViewDetails, deletingRequestId]);

  const keyExtractor = useCallback((item) => item.id.toString(), []);

  // Handle error state
  if (requestsError) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <PageHeader
          title="ISTORICUL CONCEDIILOR"
          onBack={() => navigation.goBack()}
          onRetry={onRefresh}
          showRetry={true}
          showBack={true}
        />

        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={60} color="#EF4444" />
          <Text style={styles.errorTitle}>Eroare la încărcare</Text>
          <Text style={styles.errorText}>
            Nu s-au putut încărca cererile de concediu. Verifică conexiunea și încearcă din nou.
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
            <Text style={styles.retryButtonText}>Încearcă din nou</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <PageHeader
        title="ISTORICUL CONCEDIILOR"
        onBack={() => navigation.goBack()}
        onRetry={onRefresh}
        showRetry={true}
        showBack={true}
      />

      <View style={styles.container}>
        {/* Status Filter */}
        <StatusFilter
          selectedStatus={selectedStatus}
          onStatusChange={handleStatusChange}
        />

        {/* Create New Button */}
        <View style={styles.createNewContainer}>
          <TouchableOpacity style={styles.createNewButton} onPress={handleCreateNew}>
            <Ionicons name="add" size={20} color="white" />
            <Text style={styles.createNewButtonText}>Cerere nouă</Text>
          </TouchableOpacity>
        </View>

        {/* Requests List */}
        {requests.length > 0 ? (
          <FlatList
            data={requests}
            keyExtractor={keyExtractor}
            renderItem={renderRequestItem}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl
                refreshing={requestsFetching}
                onRefresh={onRefresh}
                colors={['#6366F1']}
              />
            }
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <EmptyState
            selectedStatus={selectedStatus}
            onCreateNew={handleCreateNew}
            onRefresh={onRefresh}
          />
        )}
      </View>
    </SafeAreaView>
  );
});

LeaveHistoryScreen.displayName = 'LeaveHistoryScreen';

export default LeaveHistoryScreen;