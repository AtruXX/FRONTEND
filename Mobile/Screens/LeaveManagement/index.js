// LeaveManagement/index.js - Main Leave Management Hub
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './styles';
import {
  useGetLeaveCalendarQuery,
  useGetLeaveRequestsQuery
} from '../../services/leaveService';
import PageHeader from "../../components/General/Header";

// Quick Stats Component
const QuickStats = React.memo(({ stats, onRefresh }) => (
  <View style={styles.statsContainer}>
    <View style={styles.statsHeader}>
      <Ionicons name="stats-chart" size={20} color="#6366F1" />
      <Text style={styles.statsTitle}>Rezumat Concedii</Text>
    </View>

    <View style={styles.statsGrid}>
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{stats.totalRequests || 0}</Text>
        <Text style={styles.statLabel}>Total cereri</Text>
      </View>

      <View style={styles.statItem}>
        <Text style={[styles.statNumber, { color: '#10B981' }]}>
          {stats.approvedRequests || 0}
        </Text>
        <Text style={styles.statLabel}>Aprobate</Text>
      </View>

      <View style={styles.statItem}>
        <Text style={[styles.statNumber, { color: '#F59E0B' }]}>
          {stats.pendingRequests || 0}
        </Text>
        <Text style={styles.statLabel}>În așteptare</Text>
      </View>

      <View style={styles.statItem}>
        <Text style={[styles.statNumber, { color: '#EF4444' }]}>
          {stats.rejectedRequests || 0}
        </Text>
        <Text style={styles.statLabel}>Respinse</Text>
      </View>
    </View>

    <TouchableOpacity style={styles.refreshStatsButton} onPress={onRefresh}>
      <Ionicons name="refresh" size={16} color="#6366F1" />
      <Text style={styles.refreshStatsText}>Actualizează</Text>
    </TouchableOpacity>
  </View>
));

// Quick Actions Component
const QuickActions = React.memo(({ navigation }) => (
  <View style={styles.actionsContainer}>
    <Text style={styles.actionsTitle}>Acțiuni rapide</Text>

    <View style={styles.actionsGrid}>
      <TouchableOpacity
        style={styles.actionCard}
        onPress={() => navigation.navigate('LeaveRequestScreen')}
      >
        <View style={styles.actionIconContainer}>
          <Ionicons name="add-circle" size={32} color="#6366F1" />
        </View>
        <Text style={styles.actionTitle}>Cerere nouă</Text>
        <Text style={styles.actionSubtitle}>Solicită zile libere</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionCard}
        onPress={() => navigation.navigate('LeaveHistoryScreen')}
      >
        <View style={styles.actionIconContainer}>
          <Ionicons name="list" size={32} color="#10B981" />
        </View>
        <Text style={styles.actionTitle}>Istoricul meu</Text>
        <Text style={styles.actionSubtitle}>Vezi toate cererile</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionCard}
        onPress={() => navigation.navigate('LeaveCalendarScreen')}
      >
        <View style={styles.actionIconContainer}>
          <Ionicons name="calendar" size={32} color="#F59E0B" />
        </View>
        <Text style={styles.actionTitle}>Calendar</Text>
        <Text style={styles.actionSubtitle}>Vezi perioada liberă</Text>
      </TouchableOpacity>
    </View>
  </View>
));

// Recent Requests Component
const RecentRequests = React.memo(({ requests, navigation, onRefresh }) => {
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

  if (!requests || requests.length === 0) {
    return (
      <View style={styles.recentContainer}>
        <View style={styles.recentHeader}>
          <Text style={styles.recentTitle}>Cereri recente</Text>
          <TouchableOpacity onPress={onRefresh}>
            <Ionicons name="refresh" size={20} color="#6366F1" />
          </TouchableOpacity>
        </View>

        <View style={styles.emptyRecentContainer}>
          <Ionicons name="document-outline" size={40} color="#9CA3AF" />
          <Text style={styles.emptyRecentText}>Nu ai cereri de concediu</Text>
          <TouchableOpacity
            style={styles.createFirstButton}
            onPress={() => navigation.navigate('LeaveRequestScreen')}
          >
            <Text style={styles.createFirstButtonText}>Creează prima cerere</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.recentContainer}>
      <View style={styles.recentHeader}>
        <Text style={styles.recentTitle}>Cereri recente</Text>
        <TouchableOpacity onPress={() => navigation.navigate('LeaveHistoryScreen')}>
          <Text style={styles.viewAllText}>Vezi toate</Text>
        </TouchableOpacity>
      </View>

      {requests.slice(0, 3).map((request) => (
        <View key={request.id} style={styles.requestItem}>
          <View style={styles.requestHeader}>
            <Text style={styles.requestDates}>
              {formatDate(request.start_date)} - {formatDate(request.end_date)}
            </Text>
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

          <Text style={styles.requestReason} numberOfLines={2}>
            {request.reason}
          </Text>

          <Text style={styles.requestDays}>
            {request.total_days || 0} zile
          </Text>
        </View>
      ))}

      <TouchableOpacity
        style={styles.viewAllButton}
        onPress={() => navigation.navigate('LeaveHistoryScreen')}
      >
        <Text style={styles.viewAllButtonText}>Vezi toate cererile</Text>
        <Ionicons name="chevron-forward" size={16} color="#6366F1" />
      </TouchableOpacity>
    </View>
  );
});

// Main Leave Management Screen
const LeaveManagement = React.memo(({ navigation, route }) => {
  // Fetch leave requests for stats and recent display
  const {
    data: requestsData,
    isLoading: requestsLoading,
    isFetching: requestsFetching,
    error: requestsError,
    refetch: refetchRequests
  } = useGetLeaveRequestsQuery();

  // Fetch leave calendar for quick overview
  const {
    data: calendarData,
    isLoading: calendarLoading,
    isFetching: calendarFetching,
    error: calendarError,
    refetch: refetchCalendar
  } = useGetLeaveCalendarQuery();

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refetchRequests();
      refetchCalendar();
    }, [refetchRequests, refetchCalendar])
  );

  // Calculate stats from requests data
  const stats = useMemo(() => {
    // Handle both possible response structures
    const requests = requestsData?.results || requestsData?.requests || [];
    const totalCount = requestsData?.count || requestsData?.total_requests || requests.length;

    if (!requests || requests.length === 0) {
      return {
        totalRequests: totalCount,
        approvedRequests: 0,
        pendingRequests: 0,
        rejectedRequests: 0
      };
    }
    const calculatedStats = {
      totalRequests: totalCount,
      approvedRequests: requests.filter(r => r.status === 'approved').length,
      pendingRequests: requests.filter(r => r.status === 'pending').length,
      rejectedRequests: requests.filter(r => r.status === 'rejected').length
    };


    return calculatedStats;
  }, [requestsData]);

  const onRefresh = useCallback(async () => {
    try {
      await Promise.all([
        refetchRequests(),
        refetchCalendar()
      ]);
    } catch (error) {
      console.error('Error refreshing leave data:', error);
    }
  }, [refetchRequests, refetchCalendar]);

  const handleRetry = useCallback(async () => {
    try {
      await Promise.all([
        refetchRequests(),
        refetchCalendar()
      ]);
    } catch (error) {
      console.error('Error during retry:', error);
    }
  }, [refetchRequests, refetchCalendar]);

  // Handle error state
  if (requestsError && calendarError) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <PageHeader
          title="CONCEDII"
          onBack={() => navigation.goBack()}
          onRetry={handleRetry}
          showRetry={true}
          showBack={true}
        />

        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={60} color="#EF4444" />
          <Text style={styles.errorTitle}>Eroare la încărcare</Text>
          <Text style={styles.errorText}>
            Nu s-au putut încărca datele despre concedii. Verifică conexiunea și încearcă din nou.
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>Încearcă din nou</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <PageHeader
        title="CONCEDII"
        onBack={() => navigation.goBack()}
        onRetry={handleRetry}
        showRetry={true}
        showBack={true}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={requestsFetching || calendarFetching}
            onRefresh={onRefresh}
            colors={['#6366F1']}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Stats */}
        <QuickStats stats={stats} onRefresh={onRefresh} />

        {/* Quick Actions */}
        <QuickActions navigation={navigation} />

        {/* Recent Requests */}
        <RecentRequests
          requests={requestsData?.results}
          navigation={navigation}
          onRefresh={onRefresh}
        />
      </ScrollView>
    </SafeAreaView>
  );
});

LeaveManagement.displayName = 'LeaveManagement';

export default LeaveManagement;