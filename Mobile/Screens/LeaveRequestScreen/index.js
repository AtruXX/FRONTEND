// LeaveRequestScreen/index.js - Create/Edit Leave Request
import React, { useState, useCallback, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Calendar from '../../components/General/Calendar';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './styles';
import {
  useCreateLeaveRequestMutation,
  useUpdateLeaveRequestMutation
} from '../../services/leaveService';
import PageHeader from "../../components/General/Header";

// Date Range Selector Component
const DateRangeSelector = React.memo(({
  startDate,
  endDate,
  onStartDateSelect,
  onEndDateSelect
}) => {
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);

  const formatDisplayDate = (dateString) => {
    if (!dateString) return 'Selectează data';
    return new Date(dateString).toLocaleDateString('ro-RO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const handleStartDateSelect = (date) => {
    onStartDateSelect(date);
    setShowStartCalendar(false);
    // If end date is before start date, clear it
    if (endDate && date > endDate) {
      onEndDateSelect('');
    }
  };

  const handleEndDateSelect = (date) => {
    onEndDateSelect(date);
    setShowEndCalendar(false);
  };

  // Get minimum date for end date selector (start date + 1 day or today)
  const getMinEndDate = () => {
    if (!startDate) return new Date().toISOString().split('T')[0];
    return startDate;
  };

  return (
    <View style={styles.dateRangeContainer}>
      <Text style={styles.sectionTitle}>Perioada concediului</Text>

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsText}>
          Selectează datele de început și de sfârșit pentru concediul tău
        </Text>
      </View>

      {/* Date Selectors */}
      <View style={styles.dateSelectorsContainer}>
        {/* Start Date Selector */}
        <View style={styles.dateSelectorItem}>
          <Text style={styles.dateLabel}>Data începerii *</Text>
          <TouchableOpacity
            style={[styles.dateSelector, startDate && styles.dateSelectorSelected]}
            onPress={() => setShowStartCalendar(true)}
          >
            <View style={styles.dateSelectorContent}>
              <Ionicons name="calendar-outline" size={20} color={startDate ? "#6366F1" : "#9CA3AF"} />
              <Text style={[styles.dateSelectorText, startDate && styles.dateSelectorTextSelected]}>
                {formatDisplayDate(startDate)}
              </Text>
            </View>
            <Ionicons name="chevron-down" size={16} color={startDate ? "#6366F1" : "#9CA3AF"} />
          </TouchableOpacity>
        </View>

        {/* End Date Selector */}
        <View style={styles.dateSelectorItem}>
          <Text style={styles.dateLabel}>Data încheierii *</Text>
          <TouchableOpacity
            style={[
              styles.dateSelector,
              endDate && styles.dateSelectorSelected,
              !startDate && styles.dateSelectorDisabled
            ]}
            onPress={() => startDate && setShowEndCalendar(true)}
            disabled={!startDate}
          >
            <View style={styles.dateSelectorContent}>
              <Ionicons name="calendar-outline" size={20} color={endDate ? "#6366F1" : "#9CA3AF"} />
              <Text style={[styles.dateSelectorText, endDate && styles.dateSelectorTextSelected]}>
                {startDate ? formatDisplayDate(endDate) : 'Selectează mai întâi data de început'}
              </Text>
            </View>
            <Ionicons name="chevron-down" size={16} color={endDate ? "#6366F1" : "#9CA3AF"} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Days Counter */}
      {startDate && endDate && (
        <View style={styles.daysCounter}>
          <View style={styles.daysCounterContent}>
            <Ionicons name="time" size={18} color="#6366F1" />
            <Text style={styles.daysCounterText}>
              {calculateDays()} {calculateDays() === 1 ? 'zi' : 'zile'} de concediu
            </Text>
          </View>
          {calculateDays() > 30 && (
            <View style={styles.warningContainer}>
              <Ionicons name="warning" size={16} color="#F59E0B" />
              <Text style={styles.warningText}>Atenție: Perioada depășește 30 de zile</Text>
            </View>
          )}
        </View>
      )}

      {/* Start Date Calendar Modal */}
      <Calendar
        visible={showStartCalendar}
        onClose={() => setShowStartCalendar(false)}
        selectedDate={startDate}
        onDateSelect={handleStartDateSelect}
        minDate={new Date().toISOString().split('T')[0]}
      />

      {/* End Date Calendar Modal */}
      <Calendar
        visible={showEndCalendar}
        onClose={() => setShowEndCalendar(false)}
        selectedDate={endDate}
        onDateSelect={handleEndDateSelect}
        minDate={getMinEndDate()}
      />
    </View>
  );
});

// Leave Request Form Component
const LeaveRequestForm = React.memo(({
  reason,
  onReasonChange,
  startDate,
  endDate,
  onSubmit,
  onCancel,
  isSubmitting,
  isEditing = false
}) => {
  const isFormValid = startDate && endDate && reason.trim().length > 0;

  return (
    <View style={styles.formContainer}>
      <View style={styles.reasonContainer}>
        <Text style={styles.sectionTitle}>Motivul concediului</Text>
        <TextInput
          style={styles.reasonInput}
          value={reason}
          onChangeText={onReasonChange}
          placeholder="Descrieți motivul pentru concediu (ex: Vacanță în familie, Probleme medicale, etc.)"
          placeholderTextColor="#9CA3AF"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          maxLength={500}
          returnKeyType="done"
          blurOnSubmit={true}
          onSubmitEditing={() => {
            // Dismiss keyboard when user presses "Done"
          }}
        />
        <Text style={styles.characterCount}>
          {reason.length}/500 caractere
        </Text>
      </View>

      <View style={styles.formActions}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={onCancel}
          disabled={isSubmitting}
        >
          <Text style={styles.cancelButtonText}>Anulează</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.submitButton,
            !isFormValid && styles.submitButtonDisabled
          ]}
          onPress={onSubmit}
          disabled={!isFormValid || isSubmitting}
        >
          {isSubmitting ? (
            <Ionicons name="hourglass" size={20} color="white" />
          ) : (
            <>
              <Ionicons name="checkmark" size={20} color="white" />
              <Text style={styles.submitButtonText}>
                {isEditing ? 'Actualizează cererea' : 'Trimite cererea'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
});

// Main Leave Request Screen
const LeaveRequestScreen = React.memo(({ navigation, route }) => {
  const editingRequest = route.params?.request; // For editing existing request
  const isEditing = !!editingRequest;

  // Form state
  const [startDate, setStartDate] = useState(editingRequest?.start_date || '');
  const [endDate, setEndDate] = useState(editingRequest?.end_date || '');
  const [reason, setReason] = useState(editingRequest?.reason || '');

  // Service hooks
  const [createLeaveRequest, { isLoading: isCreating }] = useCreateLeaveRequestMutation();
  const [updateLeaveRequest, { isLoading: isUpdating }] = useUpdateLeaveRequestMutation();

  const isSubmitting = isCreating || isUpdating;

  const handleStartDateSelect = useCallback((date) => {
    setStartDate(date);
  }, []);

  const handleEndDateSelect = useCallback((date) => {
    setEndDate(date);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!startDate || !endDate || !reason.trim()) {
      Alert.alert('Eroare', 'Te rugăm să completezi toate câmpurile obligatorii.');
      return;
    }

    try {
      const requestData = {
        dataStart: startDate,
        dataFinal: endDate,
        reason: reason.trim()
      };

      if (isEditing) {
        await updateLeaveRequest({
          id: editingRequest.id,
          ...requestData
        }).unwrap();


        Alert.alert(
          'Succes!',
          'Cererea de concediu a fost actualizată cu succes.',
          [{
            text: 'OK',
            onPress: () => navigation.goBack()
          }]
        );
      } else {
        await createLeaveRequest(requestData).unwrap();


        Alert.alert(
          'Succes!',
          'Cererea de concediu a fost trimisă cu succes. Vei fi notificat când cererea va fi aprobată sau respinsă.',
          [{
            text: 'OK',
            onPress: () => navigation.goBack()
          }]
        );
      }
    } catch (error) {
      console.error('Error submitting leave request:', error);

      let errorMessage = 'Nu s-a putut trimite cererea. Încearcă din nou.';

      if (error.message?.includes('overlap')) {
        errorMessage = 'Perioada selectată se suprapune cu o cerere existentă.';
      } else if (error.message?.includes('past')) {
        errorMessage = 'Nu poți solicita concediu pentru o dată din trecut.';
      } else if (error.message?.includes('30 days')) {
        errorMessage = 'Perioada de concediu nu poate depăși 30 de zile.';
      }

      Alert.alert('Eroare', errorMessage);
    }
  }, [startDate, endDate, reason, isEditing, editingRequest, createLeaveRequest, updateLeaveRequest, navigation]);

  const handleCancel = useCallback(() => {
    if (startDate || endDate || reason) {
      Alert.alert(
        'Anulare',
        'Ești sigur că vrei să anulezi? Toate datele introduse vor fi pierdute.',
        [
          { text: 'Nu, continuă editarea', style: 'cancel' },
          {
            text: 'Da, anulează',
            style: 'destructive',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } else {
      navigation.goBack();
    }
  }, [startDate, endDate, reason, navigation]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <PageHeader
        title={isEditing ? "EDITEAZĂ CEREREA" : "CERERE CONCEDIU"}
        onBack={handleCancel}
        showBack={true}
      />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Date Range Selector */}
          <DateRangeSelector
            startDate={startDate}
            endDate={endDate}
            onStartDateSelect={handleStartDateSelect}
            onEndDateSelect={handleEndDateSelect}
          />

          {/* Form */}
          <LeaveRequestForm
            reason={reason}
            onReasonChange={setReason}
            startDate={startDate}
            endDate={endDate}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
            isEditing={isEditing}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
});

LeaveRequestScreen.displayName = 'LeaveRequestScreen';

export default LeaveRequestScreen;