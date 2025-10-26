// LeaveCalendarScreen/index.js - Visual Leave Calendar
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  RefreshControl,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './styles';
import {
  useGetLeaveRequestsQuery
} from '../../services/leaveService';
import PageHeader from "../../components/General/Header";

// Calendar Legend Component
const CalendarLegend = React.memo(() => (
  <View style={styles.legendContainer}>
    <Text style={styles.legendTitle}>Legenda:</Text>
    <View style={styles.legendItems}>
      <View style={styles.legendItem}>
        <View style={[styles.legendColor, { backgroundColor: '#10B981' }]} />
        <Text style={styles.legendText}>Concediu aprobat</Text>
      </View>
      <View style={styles.legendItem}>
        <View style={[styles.legendColor, { backgroundColor: '#F59E0B' }]} />
        <Text style={styles.legendText}>În așteptare</Text>
      </View>
      <View style={styles.legendItem}>
        <View style={[styles.legendColor, { backgroundColor: '#EF4444' }]} />
        <Text style={styles.legendText}>Respins</Text>
      </View>
    </View>
  </View>
));

// Calendar Stats Component
const CalendarStats = React.memo(({ stats, selectedMonth, onRefresh }) => {
  const monthName = new Date(selectedMonth + '-01').toLocaleDateString('ro-RO', {
    month: 'long',
    year: 'numeric'
  });

  return (
    <View style={styles.statsContainer}>
      <View style={styles.statsHeader}>
        <Text style={styles.statsTitle}>Statistica pentru {monthName}</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
          <Ionicons name="refresh" size={16} color="#6366F1" />
        </TouchableOpacity>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#10B981' }]}>
            {stats.approvedDays || 0}
          </Text>
          <Text style={styles.statLabel}>Zile aprobate</Text>
        </View>

        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#F59E0B' }]}>
            {stats.pendingDays || 0}
          </Text>
          <Text style={styles.statLabel}>În așteptare</Text>
        </View>

        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#6366F1' }]}>
            {stats.totalRequests || 0}
          </Text>
          <Text style={styles.statLabel}>Total cereri</Text>
        </View>
      </View>
    </View>
  );
});

// Upcoming Leave Component
const UpcomingLeave = React.memo(({ upcomingLeave, navigation }) => {
  if (!upcomingLeave || upcomingLeave.length === 0) {
    return (
      <View style={styles.upcomingContainer}>
        <Text style={styles.upcomingTitle}>Concedii viitoare</Text>
        <View style={styles.noUpcomingContainer}>
          <Ionicons name="calendar-outline" size={32} color="#9CA3AF" />
          <Text style={styles.noUpcomingText}>Nu ai concedii planificate</Text>
          <TouchableOpacity
            style={styles.planLeaveButton}
            onPress={() => navigation.navigate('LeaveRequestScreen')}
          >
            <Text style={styles.planLeaveButtonText}>Planifică concediu</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ro-RO', {
      day: '2-digit',
      month: 'short'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return '#10B981';
      case 'pending': return '#F59E0B';
      case 'rejected': return '#EF4444';
      default: return '#6B7280';
    }
  };

  return (
    <View style={styles.upcomingContainer}>
      <View style={styles.upcomingHeader}>
        <Text style={styles.upcomingTitle}>Concedii viitoare</Text>
        <TouchableOpacity onPress={() => navigation.navigate('LeaveHistoryScreen')}>
          <Text style={styles.viewAllText}>Vezi toate</Text>
        </TouchableOpacity>
      </View>

      {upcomingLeave.slice(0, 3).map((leave) => (
        <View key={leave.id} style={styles.upcomingItem}>
          <View style={styles.upcomingDateContainer}>
            <Text style={styles.upcomingDates}>
              {formatDate(leave.start_date)} - {formatDate(leave.end_date)}
            </Text>
            <View style={[
              styles.upcomingStatus,
              { backgroundColor: `${getStatusColor(leave.status)}15` }
            ]}>
              <Text style={[
                styles.upcomingStatusText,
                { color: getStatusColor(leave.status) }
              ]}>
                {leave.status === 'approved' ? 'Aprobat' :
                 leave.status === 'pending' ? 'În așteptare' : 'Respins'}
              </Text>
            </View>
          </View>
          <Text style={styles.upcomingReason} numberOfLines={2}>
            {leave.reason}
          </Text>
        </View>
      ))}
    </View>
  );
});

// Main Leave Calendar Screen
const LeaveCalendarScreen = React.memo(({ navigation, route }) => {
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7) // YYYY-MM format
  );

  // Calculate month boundaries for API calls
  const monthBoundaries = useMemo(() => {
    const year = parseInt(selectedMonth.split('-')[0]);
    const month = parseInt(selectedMonth.split('-')[1]);
    const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];
    return { startDate, endDate };
  }, [selectedMonth]);

  // Fetch user's own requests for calendar display and upcoming leave
  const {
    data: requestsData,
    isLoading: requestsLoading,
    isFetching: requestsFetching,
    error: requestsError,
    refetch: refetchRequests
  } = useGetLeaveRequestsQuery();

  // Process driver's own leave requests to create marked dates
  const markedDates = useMemo(() => {
    if (!requestsData?.results) return {};

    const marked = {};

    requestsData.results.forEach((leave) => {
      const start = new Date(leave.start_date);
      const end = new Date(leave.end_date);
      const current = new Date(start);

      // Color based on status - green for approved leave as requested
      let color = '#6B7280'; // default
      if (leave.status === 'approved') color = '#10B981'; // Green for approved
      else if (leave.status === 'pending') color = '#F59E0B'; // Yellow for pending
      else if (leave.status === 'rejected') color = '#EF4444'; // Red for rejected

      while (current <= end) {
        const dateString = current.toISOString().split('T')[0];

        // Only mark dates in the selected month
        if (dateString.startsWith(selectedMonth)) {
          marked[dateString] = {
            color: color,
            textColor: 'white',
            startingDay: current.getTime() === start.getTime(),
            endingDay: current.getTime() === end.getTime(),
          };
        }

        current.setDate(current.getDate() + 1);
      }
    });

    return marked;
  }, [requestsData, selectedMonth]);

  // Calculate stats for selected month
  const monthStats = useMemo(() => {
    if (!requestsData?.results) return {};

    const monthRequests = requestsData.results.filter(request => {
      const startDate = request.start_date.slice(0, 7);
      const endDate = request.end_date.slice(0, 7);
      return startDate === selectedMonth || endDate === selectedMonth;
    });

    let approvedDays = 0;
    let pendingDays = 0;

    monthRequests.forEach(request => {
      const start = new Date(request.start_date);
      const end = new Date(request.end_date);
      const diffTime = Math.abs(end - start);
      const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      if (request.status === 'approved') {
        approvedDays += days;
      } else if (request.status === 'pending') {
        pendingDays += days;
      }
    });

    return {
      approvedDays,
      pendingDays,
      totalRequests: monthRequests.length
    };
  }, [requestsData, selectedMonth]);

  // Get upcoming leave requests
  const upcomingLeave = useMemo(() => {
    if (!requestsData?.results) return [];

    const today = new Date().toISOString().split('T')[0];
    return requestsData.results
      .filter(request => request.start_date >= today)
      .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
      .slice(0, 5);
  }, [requestsData]);

  const onRefresh = useCallback(async () => {
    try {
      await refetchRequests();
    } catch (error) {
      console.error('Error refreshing calendar data:', error);
    }
  }, [refetchRequests]);

  const handleMonthChange = useCallback((month) => {
    setSelectedMonth(month.dateString.slice(0, 7));
  }, []);

  const handleDayPress = useCallback((day) => {
    const selectedDate = day.dateString;

    // Find leave for this date from driver's own requests
    const leaveForDate = requestsData?.results?.find(leave =>
      selectedDate >= leave.start_date && selectedDate <= leave.end_date
    );

    if (leaveForDate) {
      Alert.alert(
        'Detalii concediu',
        `Perioada: ${new Date(leaveForDate.start_date).toLocaleDateString('ro-RO')} - ${new Date(leaveForDate.end_date).toLocaleDateString('ro-RO')}\nStatus: ${leaveForDate.status === 'approved' ? 'Aprobat' : leaveForDate.status === 'pending' ? 'În așteptare' : 'Respins'}\nMotiv: ${leaveForDate.reason}${leaveForDate.rejection_reason ? `\nMotiv respingere: ${leaveForDate.rejection_reason}` : ''}`,
        [{ text: 'OK' }]
      );
    }
  }, [requestsData]);

  // Handle error state
  if (requestsError) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <PageHeader
          title="CALENDAR CONCEDII"
          onBack={() => navigation.goBack()}
          onRetry={onRefresh}
          showRetry={true}
          showBack={true}
        />

        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={60} color="#EF4444" />
          <Text style={styles.errorTitle}>Eroare la încărcare</Text>
          <Text style={styles.errorText}>
            Nu s-au putut încărca datele calendarului. Verifică conexiunea și încearcă din nou.
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
        title="CALENDAR CONCEDII"
        onBack={() => navigation.goBack()}
        onRetry={onRefresh}
        showRetry={true}
        showBack={true}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={requestsFetching}
            onRefresh={onRefresh}
            colors={['#6366F1']}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Calendar Stats */}
        <CalendarStats
          stats={monthStats}
          selectedMonth={selectedMonth}
          onRefresh={onRefresh}
        />

        {/* Calendar */}
        <View style={styles.calendarContainer}>
          <Calendar
            current={selectedMonth + '-15'} // Mid-month to ensure proper display
            onMonthChange={handleMonthChange}
            onDayPress={handleDayPress}
            markingType={'period'}
            markedDates={markedDates}
            theme={{
              calendarBackground: 'white',
              textSectionTitleColor: '#6366F1',
              selectedDayBackgroundColor: '#6366F1',
              selectedDayTextColor: 'white',
              todayTextColor: '#6366F1',
              dayTextColor: '#1F2937',
              textDisabledColor: '#D1D5DB',
              dotColor: '#6366F1',
              selectedDotColor: 'white',
              arrowColor: '#6366F1',
              monthTextColor: '#1F2937',
              indicatorColor: '#6366F1',
              textDayFontWeight: '500',
              textMonthFontWeight: '600',
              textDayHeaderFontWeight: '500',
              textDayFontSize: 16,
              textMonthFontSize: 18,
              textDayHeaderFontSize: 14
            }}
          />
        </View>

        {/* Calendar Legend */}
        <CalendarLegend />

        {/* Upcoming Leave */}
        <UpcomingLeave
          upcomingLeave={upcomingLeave}
          navigation={navigation}
        />
      </ScrollView>
    </SafeAreaView>
  );
});

LeaveCalendarScreen.displayName = 'LeaveCalendarScreen';

export default LeaveCalendarScreen;