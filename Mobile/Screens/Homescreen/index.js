// screens/HomeScreen.js - Fixed and simplified version
import React, { useState, useEffect } from "react";
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

const HomeScreen = () => {
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

  // Date update effect
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000);

    return () => clearInterval(intervalId);
  }, []);

  // Update global loading based on profile loading
  useEffect(() => {
    if (isProfileLoading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [isProfileLoading, showLoading, hideLoading]);

  // Format day number
  const day = currentDate.getDate();

  // Get month name in Romanian
  const getMonthNameRomanian = (month) => {
    const months = [
      'ianuarie', 'februarie', 'martie', 'aprilie',
      'mai', 'iunie', 'iulie', 'august',
      'septembrie', 'octombrie', 'noiembrie', 'decembrie'
    ];
    return months[month];
  };

  const monthName = getMonthNameRomanian(currentDate.getMonth());
  const year = currentDate.getFullYear();

  // Handle status change using RTK Query
  const handleStatusChange = async () => {
    try {
      showLoading();
      
      // Toggle the on_road status
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
  };

  // Handle logout using RTK Query
  const handleLogout = async () => {
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
  };

  // Generate initials from name
  const getInitials = (name) => {
    if (!name) return 'U';
    const nameParts = name.split(' ');
    const initials = nameParts.length > 1
      ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`
      : nameParts[0].substring(0, 2);
    return initials.toUpperCase();
  };

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

  const initials = getInitials(profileData?.name);
  const currentStatus = profileData?.on_road === true ? 'La volan' : 'Parcat';

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
      >
        {/* Header with profile */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Bun venit,</Text>
            <Text style={styles.nameText}>{profileData?.name || 'Utilizator'}</Text>
            <Text style={styles.roleText}>Sofer</Text>
          </View>
          <View style={styles.profileContainer}>
            <Text style={styles.profileInitials}>{initials}</Text>
          </View>
        </View>

        {/* Date display */}
        <View style={styles.dateContainer}>
          <Text style={styles.dateNumber}>{day}</Text>
          <View style={styles.dateDetails}>
            <Text style={styles.dateMonth}>{monthName}</Text>
            <Text style={styles.dateYear}>{year}</Text>
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
            <TouchableOpacity 
              style={styles.actionCard} 
              onPress={() => navigation.navigate('Transports')}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: COLORS.background }]}>
                <Ionicons name="subway-outline" size={28} color={COLORS.primary} />
              </View>
              <Text style={styles.actionLabel}>Transporturi</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard} 
              onPress={() => navigation.navigate('DocumentsGeneral', { screen: 'DocumentsGeneral' })}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: COLORS.background }]}>
                <Ionicons name="file-tray-full-outline" size={28} color={COLORS.secondary} />
              </View>
              <Text style={styles.actionLabel}>Documente</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard} 
              onPress={() => navigation.navigate('Truck')}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: COLORS.background }]}>
                <Ionicons name="bus-outline" size={28} color={COLORS.danger} />
              </View>
              <Text style={styles.actionLabel}>Camion</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard} 
              onPress={() => navigation.navigate('TransportMainPage')}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: COLORS.background }]}>
                <Ionicons name="map-outline" size={28} color={COLORS.success} />
              </View>
              <Text style={styles.actionLabel}>Transport actual</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Status Card */}
        <View style={styles.statusCard}>
          {/* Current Status Display */}
          <View style={[
            styles.statusDisplay,
            profileData?.on_road ? styles.driving : styles.parked
          ]}>
            <View style={[
              styles.statusDot,
              profileData?.on_road ? styles.drivingDot : styles.parkedDot
            ]} />
            <Text style={styles.statusText}>{currentStatus}</Text>
          </View>

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

        {/* Debug Info - Remove this in production */}
        {__DEV__ && (
          <View style={{padding: 16, backgroundColor: '#f0f0f0', margin: 16}}>
            <Text style={{fontSize: 12}}>Debug Info:</Text>
            <Text style={{fontSize: 10}}>Profile ID: {profileData?.id}</Text>
            <Text style={{fontSize: 10}}>On Road: {profileData?.on_road?.toString()}</Text>
            <Text style={{fontSize: 10}}>Loading: {isProfileLoading.toString()}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;