import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from '@react-navigation/native';

const HomeScreen = () => {
    const navigation = useNavigation();
  return (
    
    <ScrollView style={styles.container}>
      {/* Header with profile */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Buna ziua,</Text>
          <Text style={styles.nameText}>Andrei</Text>
        </View>
        <View style={styles.profileContainer}>
         
        </View>
      </View>
      
      {/* Current status card */}
      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <Text style={styles.statusTitle}>Status Curent</Text>
          <View style={styles.statusIndicator}>
            <Text style={styles.statusText}>La volan</Text>
          </View>
        </View>
        <View style={styles.statusDetails}>
          {/* <View style={styles.statusItem}>
            <Ionicons name="time-outline" size={24} color="#3B82F6" />
            <View style={styles.statusItemText}>
              <Text style={styles.statusLabel}>Ore de munca</Text>
              <Text style={styles.statusValue}>6h 30m / 11h</Text>
            </View>
          </View>
          <View style={styles.statusItem}>
            <Ionicons name="location-outline" size={24} color="#3B82F6" />
            <View style={styles.statusItemText}>
              <Text style={styles.statusLabel}>Current Location</Text>
              <Text style={styles.statusValue}>France, Lyon</Text>
            </View>
          </View> */}
        </View>
      </View>
      
      {/* Quick actions grid */}
      <Text style={styles.sectionTitle}>Actiuni rapide:</Text>
      <View style={styles.gridContainer}>
        
        <TouchableOpacity 
          style={[styles.gridItem, { backgroundColor: "#EF4444" }]}
          onPress={() => navigation.navigate('Transporturi')}
        >
          <Ionicons name="calendar-outline" size={32} color="white" />
          <Text style={styles.gridText}>Transporturi</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.gridItem, { backgroundColor: "#3B82F6" }]}
          onPress={() => navigation.navigate('Camion')}
        >
          <Ionicons name="car-outline" size={32} color="white" />
          <Text style={styles.gridText}>Camion</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.gridItem, { backgroundColor: "#F59E0B" }]} 
          onPress={() => navigation.navigate('TransportActual')}
        >
          <Ionicons name="navigate-outline" size={32} color="white" />
          <Text style={styles.gridText}>Transport Actual</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.gridItem, { backgroundColor: "#10B981" }]}
          onPress={() => navigation.navigate('Documents', { screen: 'DocumentsGeneral' })}
        >
          <Ionicons name="document-outline" size={32} color="white" />
          <Text style={styles.gridText}>Documente</Text>
        </TouchableOpacity>
      </View>
      
      {/* Upcoming delivery card */}
      <Text style={styles.sectionTitle}>Urmatorul Transport:</Text>
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
    backgroundColor: "white",
  },
  welcomeText: {
    fontSize: 16,
    color: "#666",
  },
  nameText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  profileContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: "hidden",
    backgroundColor: "#e0e0e0",
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  statusCard: {
    backgroundColor: "white",
    borderRadius: 15,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  statusTitle: {
    fontSize: 18,
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
  statusDetails: {
    gap: 15,
  },
  statusItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusItemText: {
    marginLeft: 10,
  },
  statusLabel: {
    fontSize: 14,
    color: "#666",
  },
  statusValue: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginHorizontal: 20,
    marginTop: 25,
    marginBottom: 15,
    color: "#333",
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  gridItem: {
    width: "48%",
    height: 120,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  gridText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 8,
  },
  deliveryCard: {
    backgroundColor: "white",
    borderRadius: 15,
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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