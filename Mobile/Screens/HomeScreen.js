import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from "react-native";
import { useNavigation } from '@react-navigation/native';
import Ionicons from "react-native-vector-icons/Ionicons";
import AsyncStorage from '@react-native-async-storage/async-storage';


const HomeScreen = () => {
  const navigation = useNavigation();
  const [profileData, setProfileData] = useState({
    name: "",
    role: "",
    initials: ""
  });
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    fetchProfileData();
  }, []);
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000);

    return () => clearInterval(intervalId);
  }, []);

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

  const fetchProfileData = async () => {
    try {
      const authToken = await AsyncStorage.getItem('authToken');
      console.log('[DEBUG] Retrieved auth token:', authToken);

      if (!authToken) {
        console.error('[DEBUG] No auth token found. Aborting fetch.');
        return;
      }

      const headers = {
        'Authorization': `Token ${authToken}`,
      };

      console.log('[DEBUG] Sending GET request to /get_profile with headers:', headers);

      const response = await fetch('https://atrux-717ecf8763ea.herokuapp.com/get_profile/', {
        method: 'GET',
        headers: headers
      });

      console.log('[DEBUG] Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[DEBUG] Server responded with error:', errorText);
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log('[DEBUG] Received profile data:', data);

      const nameParts = data.name.split(' ');
      const initials = nameParts.length > 1
        ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`
        : nameParts[0].substring(0, 2);

      setProfileData({
        name: data.name,
        role: "Sofer",
        initials: initials.toUpperCase()
      });

    } catch (error) {
      console.error('[DEBUG] Caught error in fetchProfileData:', error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        {/* Header with profile */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Bun venit,</Text>
            <Text style={styles.nameText}>{profileData.name}</Text>
            <Text style={styles.roleText}>{profileData.role}</Text>
          </View>
          <View style={styles.profileContainer}>
            <Text style={styles.profileInitials}>{profileData.initials}</Text>
          </View>
        </View>

        {/* Date display */}
        <View style={styles.dateContainer}>
          <Text style={styles.dateNumber}>{day}</Text>
          <View style={styles.dateDetails}>
            <Text style={styles.dateMonth}>{monthName}</Text>
            <Text style={styles.dateYear}>{year}</Text>
          </View>

          <TouchableOpacity style={styles.logoutButton}
            onPress={async () => {
              try {
                const authToken = await AsyncStorage.getItem('authToken');
                console.log('[DEBUG] Retrieved auth token:', authToken);

                if (!authToken) {
                  console.error('[DEBUG] No auth token found. Aborting fetch.');
                  return;
                }

                const response = await fetch('https://atrux-717ecf8763ea.herokuapp.com/auth/token/logout', {
                  method: 'POST',
                  headers: {
                    'Authorization': `Token ${authToken}`,
                    'Content-Type': 'application/json',
                  },
                });

                if (response.ok) {


                  // Navigate to Login
                  navigation.reset({
                    index: 0,
                    routes: [{ name: 'Login' }],
                  });
                } else {
                  const err = await response.json();
                  console.error('Logout failed:', err);
                  alert('Logout failed.');
                }
              } catch (error) {
                console.error('Logout error:', error);
                alert('Something went wrong during logout.');
              }
            }}
          >

            <Text style={styles.logoutText}>Deconectare</Text>
            <Ionicons name="log-out-outline" size={16} color="#3B82F6" />
          </TouchableOpacity>
        </View>


        {/* Quick Actions Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Acțiuni rapide</Text>

          </View>

          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Transports')}>
              <View style={[styles.actionIconContainer, { backgroundColor: '#EFF6FF' }]}>
                <Ionicons name="subway-outline" size={24} color="#3B82F6" />
              </View>
              <Text style={styles.actionLabel}>Transporturi</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Documents', { screen: 'DocumentsGeneral' })}>
              <View style={[styles.actionIconContainer, { backgroundColor: '#F0F9FF' }]}>
                <Ionicons name="file-tray-full-outline" size={24} color="#0EA5E9" />
              </View>
              <Text style={styles.actionLabel}>Documente</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Truck')}>
              <View style={[styles.actionIconContainer, { backgroundColor: '#FEF2F2' }]}>
                <Ionicons name="bus-outline" size={24} color="#EF4444" />
              </View>
              <Text style={styles.actionLabel}>Camion</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Transports', { screen: 'TransportStatus' })}>
              <View style={[styles.actionIconContainer, { backgroundColor: '#F0FFF4' }]}>
                <Ionicons name="map-outline" size={24} color="#10B981" />
              </View>
              <Text style={styles.actionLabel}>Transport actual</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Status Card - Current status */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.statusTitle}>Status Curent</Text>
            <View style={styles.statusIndicator}>
              <Text style={styles.statusText}>La volan</Text>
            </View>
          </View>
        </View>

        {/* Upcoming delivery card */}
        <View style={styles.deliveryCard}>
          <View style={styles.deliveryHeader}>
            <View>
              <Text style={styles.deliveryTitle}>LYON → CLUJ</Text>
              <Text style={styles.deliverySubtitle}>Maine, 14:00</Text>
            </View>
            <View style={styles.deliveryBadge}>
              <Text style={styles.deliveryBadgeText}>La timp</Text>
            </View>
          </View>
          <View style={styles.deliveryDetails}>
            <View style={styles.deliveryItem}>
              <Ionicons name="cube-outline" size={20} color="#666" />
              <Text style={styles.deliveryItemText}>Electronice - 2 paleti</Text>
            </View>
            <View style={styles.deliveryItem}>
              <Ionicons name="navigate-outline" size={20} color="#666" />
              <Text style={styles.deliveryItemText}>280 km</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.deliveryButton}>
            <Text style={styles.deliveryButtonText}>Vezi detalii</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: "white",
  },
  welcomeText: {
    fontSize: 14,
    color: "#666",
  },
  nameText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginTop: 2,
  },
  roleText: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  profileContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#6366F1",
    justifyContent: "center",
    alignItems: "center",
  },
  profileInitials: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  dateNumber: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#6366F1",
  },
  dateDetails: {
    marginLeft: 10,
  },
  dateMonth: {
    fontSize: 16,
    color: "#666",
  },
  dateYear: {
    fontSize: 14,
    color: "#999",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: "auto",
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#F0F7FF",
  },
  logoutText: {
    color: "#3B82F6",
    marginRight: 5,
    fontWeight: "500",
  },
  sectionContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  seeAllText: {
    color: "#3B82F6",
    fontWeight: "500",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 10,
  },
  statCard: {
    width: "48%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    marginBottom: 10,
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 6,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 10,
  },
  actionCard: {
    width: "48%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  actionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  actionLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
  },
  statusCard: {
    backgroundColor: "white",
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statusHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  statusIndicator: {
    backgroundColor: "#10B981",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
  },
  deliveryCard: {
    backgroundColor: "white",
    borderRadius: 12,
    marginHorizontal: 20,
    marginVertical: 20,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  deliveryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 15,
  },
  deliveryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  deliverySubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  deliveryBadge: {
    backgroundColor: "#10B981",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  deliveryBadgeText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
  },
  deliveryDetails: {
    marginBottom: 15,
    gap: 10,
  },
  deliveryItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  deliveryItemText: {
    marginLeft: 10,
    fontSize: 14,
    color: "#555",
  },
  deliveryButton: {
    backgroundColor: "#3B82F6",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  deliveryButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default HomeScreen;