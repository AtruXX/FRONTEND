// screens/HomeScreen.js - Optimized version
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Alert, RefreshControl } from "react-native";
import { useNavigation } from '@react-navigation/native';
import Ionicons from "react-native-vector-icons/Ionicons";

import { styles } from "./styles";
import COLORS from "../../utils/COLORS.js";
import { useLoading } from "../../components/General/loadingSpinner.js";

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
  const [currentDate, setCurrentDate] = useState(new Date());

  // RTK Query hooks
  const {
    data: profileData,
    error: profileError,
    isLoading: isProfileLoading,
    isFetching: isProfileFetching,
    refetch: refetchProfile,
  } = useGetProfileQuery(undefined, {
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const [updateProfile] = useUpdateProfileMutation();
  const [logout, { isLoading: isLogoutLoading }] = useLogoutMutation();

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

    return {
      initials: getInitials(profileData?.name),
      currentStatus: profileData?.on_road === true ? 'La volan' : 'Parcat'
    };
  }, [profileData?.name, profileData?.on_road]);

  // Date update effect with cleanup
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000);

    return () => clearInterval(intervalId);
  }, []);

  // Optimized loading management
  useEffect(() => {
    if (isProfileLoading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [isProfileLoading, showLoading, hideLoading]);

  // Memoized handlers
  const handleStatusChange = useCallback(async () => {
    try {
      showLoading();
      
      const newOnRoadStatus = !profileData?.on_road;
      
      await updateProfile({ 
        on_road: newOnRoadStatus 
      }).unwrap();

      console.log('✅ Status updated successfully');
      
    } catch (error) {
      console.error('💥 Status update error:', error);
      Alert.alert('Eroare', 'Nu s-a putut actualiza statusul. Încearcă din nou.');
    } finally {
      hideLoading();
    }
  }, [profileData?.on_road, updateProfile, showLoading, hideLoading]);

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
  }), [navigation]);

  // Memoized action cards data
  const actionCards = useMemo(() => [
    {
      iconName: "subway-outline",
      label: "Transporturi",
      onPress: navigationHandlers.goToTransports,
      iconColor: COLORS.primary
    },
    {
      iconName: "file-tray-full-outline",
      label: "Documente",
      onPress: navigationHandlers.goToDocuments,
      iconColor: COLORS.secondary
    },
    {
      iconName: "bus-outline",
      label: "Camion",
      onPress: navigationHandlers.goToTruck,
      iconColor: COLORS.danger
    },
    {
      iconName: "map-outline",
      label: "Transport actual",
      onPress: navigationHandlers.goToTransportMain,
      iconColor: COLORS.success
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
          onPress={refetchProfile}
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
            onRefresh={refetchProfile}
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
          <ProfileContainer initials={profileInfo.initials} />
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
            isOnRoad={profileData?.on_road}
            currentStatus={profileInfo.currentStatus}
          />

          {/* Toggle Button */}
          <TouchableOpacity
            style={[
              styles.toggleButton,
              profileData?.on_road ? styles.parkButton : styles.driveButton
            ]}
            onPress={handleStatusChange}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>
              {profileData?.on_road ? 'Parcheaza' : 'Pornește'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
});

HomeScreen.displayName = 'HomeScreen';

export default HomeScreen;