// screens/HomeScreen.js - Optimized version
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Alert, RefreshControl } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { styles } from "./styles";
import COLORS from "../../utils/COLORS.js";
import { useLoading } from "../../components/General/loadingSpinner.js";
import { useChangeDriverStatusMutation } from "../../services/statusUpdateService";
import { useNotifications } from "../NotificationsContext/index.js";
import { NotificationBadge } from "../../components/Notifications/index.js";

// RTK Query imports
import {
  useGetProfileQuery,
  useLogoutMutation,
  useUpdateProfileMutation
} from "../../services/authService";

// Memoized components for better performance
const ProfileContainer = React.memo(({ initials }) => (
  <View style={styles.profileContainer}>
    <Text style={styles.profileInitials}>{initials}</Text>
  </View>
));

const ActionCard = React.memo(({ iconName, label, onPress, iconColor }) => (
  <TouchableOpacity style={styles.actionCard} onPress={onPress}>
    <View style={[styles.actionIconContainer, { backgroundColor: COLORS.background }]}>
      <Ionicons name={iconName} size={28} color={iconColor} />
    </View>
    <Text style={styles.actionLabel}>{label}</Text>
  </TouchableOpacity>
));

const StatusDisplay = React.memo(({ isOnRoad, currentStatus }) => (
  <View style={[
    styles.statusDisplay,
    isOnRoad ? styles.driving : styles.parked
  ]}>
    <View style={[
      styles.statusDot,
      isOnRoad ? styles.drivingDot : styles.parkedDot
    ]} />
    <Text style={styles.statusText}>{currentStatus}</Text>
  </View>
));

const HomeScreen = React.memo(() => {
  const navigation = useNavigation();
  const { showLoading, hideLoading } = useLoading();
  const { unreadCount } = useNotifications();
  const [currentDate, setCurrentDate] = useState(new Date());
const [changeDriverStatus] = useChangeDriverStatusMutation();

  // RTK Query hooks
  const {
    data: profileData,
    error: profileError,
    isLoading: isProfileLoading,
    isFetching: isProfileFetching,
    refetch: refetchProfile,
  } = useGetProfileQuery(undefined, {
    refetchOnFocus: false,  // Prevent constant refetching when navigating
    refetchOnReconnect: true,
    pollingInterval: 0,     // Disable polling to prevent infinite requests
    refetchOnMountOrArgChange: 30,  // Only refetch if data is older than 30 seconds
  });

  const [updateProfile] = useUpdateProfileMutation();
  const [logout, { isLoading: isLogoutLoading }] = useLogoutMutation();

  // Memoize refetch to prevent unnecessary re-renders
  const memoizedRefetchProfile = useCallback(() => {
    refetchProfile();
  }, [refetchProfile]);

  // Memoized date calculations
  const dateInfo = useMemo(() => {
    const day = currentDate.getDate();
    const months = [
      'ianuarie', 'februarie', 'martie', 'aprilie',
      'mai', 'iunie', 'iulie', 'august',
      'septembrie', 'octombrie', 'noiembrie', 'decembrie'
    ];
    const monthName = months[currentDate.getMonth()];
    const year = currentDate.getFullYear();

    return { day, monthName, year };
  }, [currentDate]);

  // Memoized profile calculations

  // Date update effect with cleanup
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000);

    return () => clearInterval(intervalId);
  }, []);

  // Optimized loading management - removed unstable dependencies
  useEffect(() => {
    if (isProfileLoading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [isProfileLoading, showLoading, hideLoading]); // Include all dependencies

  // Memoized handlers
  const handleStatusChange = useCallback(async () => {
    try {
      showLoading();

      // Get current status from profile data
      const currentOnRoadStatus = profileData?.on_road ?? profileData?.driver?.on_road ?? false;
      const newOnRoadStatus = !currentOnRoadStatus;

      console.log('Current status:', currentOnRoadStatus ? 'La volan' : 'Parcat');
      console.log('Changing status to:', newOnRoadStatus ? 'La volan' : 'Parcat');

      // Use the dedicated status update service
      await changeDriverStatus({
        on_road: newOnRoadStatus
      }).unwrap();

      console.log('✅ Driver status updated successfully to:', newOnRoadStatus);

      // Refetch profile to get updated data
      try {
        await refetchProfile();
      } catch (refetchError) {
        console.warn('Profile refetch failed:', refetchError);
        // Don't show error for refetch failure, status update was successful
      }

    } catch (error) {
      console.error('💥 Driver status update error:', error);
      Alert.alert(
        'Eroare',
        'Nu s-a putut actualiza statusul. Verifică conexiunea și încearcă din nou.',
        [
          { text: 'OK', style: 'default' }
        ]
      );
    } finally {
      hideLoading();
    }
  }, [profileData, changeDriverStatus, refetchProfile, showLoading, hideLoading]);

  // Update the profileInfo calculation to handle both data structures:
  const profileInfo = useMemo(() => {
    if (!profileData) return { initials: 'U', currentStatus: 'Parcat' };
    
    const getInitials = (name) => {
      if (!name) return 'U';
      const nameParts = name.split(' ');
      const initials = nameParts.length > 1
        ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`
        : nameParts[0].substring(0, 2);
      return initials.toUpperCase();
    };

    // Check both possible locations for on_road status
    const isOnRoad = profileData?.on_road ?? profileData?.driver?.on_road ?? false;

    return {
      initials: getInitials(profileData?.name),
      currentStatus: isOnRoad ? 'La volan' : 'Parcat'
    };
  }, [profileData?.name, profileData?.on_road, profileData?.driver?.on_road]);


  const handleLogout = useCallback(async () => {
    try {
      await logout().unwrap();
      console.log('Logout successful');

      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Eroare', 'A aparut o eroare la deconectare.');
    }
  }, [logout, navigation]);

  // Memoized navigation handlers
  const navigationHandlers = useMemo(() => ({
    goToTransports: () => navigation.navigate('Transports'),
    goToDocuments: () => navigation.navigate('DocumentsGeneral', { screen: 'DocumentsGeneral' }),
    goToTruck: () => navigation.navigate('Truck'),
    goToTransportMain: () => navigation.navigate('TransportMainPage'),
    goToExpiredDocuments: () => navigation.navigate('ExpiredDocuments'),
    goToQueue: () => navigation.navigate('QueueScreen'),
    goToLeaveManagement: () => navigation.navigate('LeaveManagement'),
  }), [navigation]);

  // Memoized action cards data with ultra-basic guaranteed icons
  const primaryActionCard = useMemo(() => ({
    iconName: "location",
    label: "Transportul meu",
    onPress: navigationHandlers.goToTransportMain,
    iconColor: COLORS.success
  }), [navigationHandlers]);

  const actionCards = useMemo(() => [
    {
      iconName: "list",
      label: "Ordine Transporturi",
      onPress: navigationHandlers.goToQueue,
      iconColor: '#6366F1'
    },
    {
      iconName: "car",
      label: "Transporturi",
      onPress: navigationHandlers.goToTransports,
      iconColor: COLORS.primary
    },
    {
      iconName: "calendar",
      label: "Concedii",
      onPress: navigationHandlers.goToLeaveManagement,
      iconColor: '#10B981'
    },
    {
      iconName: "bus",
      label: "Camion",
      onPress: navigationHandlers.goToTruck,
      iconColor: COLORS.danger
    },
    {
      iconName: "folder",
      label: "Documente",
      onPress: navigationHandlers.goToDocuments,
      iconColor: COLORS.secondary
    },
    {
      iconName: "warning",
      label: "Documente Expirate",
      onPress: navigationHandlers.goToExpiredDocuments,
      iconColor: COLORS.warning
    }
  ], [navigationHandlers]);

  // Error handling
  if (profileError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Eroare la încărcarea profilului
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={memoizedRefetchProfile}
        >
          <Text style={styles.retryButtonText}>Încearcă din nou</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={isProfileFetching && !isProfileLoading}
            onRefresh={memoizedRefetchProfile}
            colors={[COLORS.primary]}
          />
        }
        removeClippedSubviews={true}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with profile */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Bun venit,</Text>
            <Text style={styles.nameText}>{profileData?.name || 'Utilizator'}</Text>
            <Text style={styles.roleText}>Sofer</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.notificationIcon}
              onPress={() => navigation.navigate('NotificationsScreen')}
            >
              <Ionicons name="notifications-outline" size={24} color={COLORS.primary} />
              {unreadCount > 0 && (
                <View style={styles.notificationBadgeContainer}>
                  <NotificationBadge size="small" />
                </View>
              )}
            </TouchableOpacity>
            <ProfileContainer initials={profileInfo.initials} />
          </View>
        </View>

        {/* Date display */}
        <View style={styles.dateContainer}>
          <Text style={styles.dateNumber}>{dateInfo.day}</Text>
          <View style={styles.dateDetails}>
            <Text style={styles.dateMonth}>{dateInfo.monthName}</Text>
            <Text style={styles.dateYear}>{dateInfo.year}</Text>
          </View>

          <TouchableOpacity
            style={[
              styles.logoutButton,
              isLogoutLoading && { opacity: 0.6 }
            ]}
            onPress={handleLogout}
            disabled={isLogoutLoading}
          >
            <Text style={styles.logoutText}>
              {isLogoutLoading ? 'Se deconectează...' : 'Deconectare'}
            </Text>
            <Ionicons name="log-out-outline" size={16} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Quick Actions Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Acțiuni rapide</Text>
          </View>

          {/* Primary Action - Full Width */}
          <TouchableOpacity
            style={styles.primaryActionCard}
            onPress={primaryActionCard.onPress}
          >
            <View style={[styles.primaryActionIconContainer, { backgroundColor: primaryActionCard.iconColor }]}>
              <Ionicons name={primaryActionCard.iconName} size={32} color="white" />
            </View>
            <Text style={styles.primaryActionLabel}>{primaryActionCard.label}</Text>
            <Ionicons name="chevron-forward" size={24} color={COLORS.primary} />
          </TouchableOpacity>

          {/* Secondary Actions Grid */}
          <View style={styles.actionsGrid}>
            {actionCards.map((card, index) => (
              <ActionCard
                key={index}
                iconName={card.iconName}
                label={card.label}
                onPress={card.onPress}
                iconColor={card.iconColor}
              />
            ))}
          </View>
        </View>

        {/* Status Card */}
        <View style={styles.statusCard}>
          <StatusDisplay 
            isOnRoad={profileData?.on_road ?? profileData?.driver?.on_road ?? false}
            currentStatus={profileInfo.currentStatus}
          />

          {/* Toggle Button - Updated */}
          <TouchableOpacity
            style={[
              styles.toggleButton,
              (profileData?.on_road ?? profileData?.driver?.on_road ?? false) 
                ? styles.parkButton 
                : styles.driveButton
            ]}
            onPress={handleStatusChange}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>
              {(profileData?.on_road ?? profileData?.driver?.on_road ?? false) 
                ? 'Parcheaza' 
                : 'Pornește'
              }
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
});

HomeScreen.displayName = 'HomeScreen';

export default HomeScreen;