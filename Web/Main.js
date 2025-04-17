import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Modern color palette inspired by the Axiom design
const COLORS = {
  background: "#F4F5FB",     // Light lavender background
  card: "#FFFFFF",           // White
  primary: "#5A5BDE",        // Purple-blue (primary)
  secondary: "#6F89FF",      // Light blue
  accent: "#FF8C66",         // Soft orange
  accent2: "#81C3F8",        // Sky blue
  dark: "#373A56",           // Dark navy
  medium: "#6B6F8D",         // Medium navy-gray
  light: "#A0A4C1",          // Light gray-purple
  border: "#E2E5F1",         // Light border
  success: "#63C6AE",        // Turquoise
  warning: "#FFBD59",        // Amber
  danger: "#FF7285",         // Soft red
};

const DispatcherDashboard = () => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState({});
  const [shipments, setShipments] = useState([]);
  const [currentDate] = useState(new Date());
  const [authToken, setAuthToken] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [stats, setStats] = useState({
    activeShipments: 18,
    delayedShipments: 4,
    activeDrivers: 12,
    completionRate: 84,
  });
  useEffect(() => {
    const getAuthToken = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          setAuthToken(token);
        } else {
          setError('Authentication required. Please log in first.');
        }
      } catch (err) {
        setError('Failed to load authentication token.');
      } finally {
        setLoading(false);
      }
    };
    
    getAuthToken();
  }, []);
  // Define loadData outside both useEffects
const loadData = async () => {
  try {
    // User data
    setUserData({
      name: "Alexandru Popescu",
      company: "Atrux Logistics",
      role: "Manager de transport"
    });
    
    // Fetch active transports count
    // const response = await fetch("https://atrux-717ecf8763ea.herokuapp.com/active_transports", {
    //   method: "GET",
    //   headers: {
    //     'Authorization': `Token ${authToken}`,
    //     'Content-Type': 'application/json'
    //   }
    // });
    
    // if (!response.ok) {
    //   throw new Error(`API request failed with status ${response.status}`);
    // }
    // const data = await response.json();
    // console.log("API Data received:", data);
    // console.log("Active shipments count:", data.count);
   
    // // Update stats with count from API
    // setStats(prevStats => ({
    //   ...prevStats,
    //   activeShipments: data.count
    // }));
    
    // Set shipments data
    setShipments([
      {
        id: "TR-1234",
        origin_city: "Lyon",
        destination_city: "Cluj",
        eta: new Date(Date.now() + 86400000), // tomorrow
        status: "in_transit",
        cargo: "Electronice",
        pallets: 2,
        distance: "280 km",
        completion: 65,
        driver: "Gabriel Ionescu"
      },
      // ... other shipments
    ]);
    
    setIsLoading(false);
  } catch (error) {
    console.error("Error fetching data:", error);
    setIsLoading(false);
    // Consider setting an error state here
  }
};

// A single useEffect that handles the data loading
useEffect(() => {
  if (authToken) {
    loadData();
  }
}, [authToken, loadData]); // Include loadData in dependencies
  const formatDateTime = (date) => {
    if (!date) return "Neprogramat";
    return date.toLocaleDateString() + ", " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatMonth = () => {
    const options = { month: 'long' };
    return currentDate.toLocaleDateString('ro-RO', options);
  };

  const formatDay = () => {
    return currentDate.getDate();
  };

  const formatYear = () => {
    return currentDate.getFullYear();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return COLORS.success;
      case 'in_transit': return COLORS.secondary;
      case 'assigned': return COLORS.warning;
      case 'pending': return COLORS.danger;
      default: return COLORS.light;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'delivered': return 'Livrat';
      case 'in_transit': return 'În tranzit';
      case 'assigned': return 'Atribuit';
      case 'pending': return 'În așteptare';
      default: return 'Necunoscut';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered': return 'check-circle';
      case 'in_transit': return 'truck';
      case 'assigned': return 'user-check';
      case 'pending': return 'clock';
      default: return 'help-circle';
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Se încarcă...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header with greeting and profile */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.welcomeText}>Bun venit,</Text>
            <Text style={styles.nameText}>{userData.name}</Text>
            <Text style={styles.roleText}>{userData.role}</Text>
          </View>
          
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.notificationButton}>
              <Feather name="bell" size={22} color={COLORS.medium} />
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationCount}>3</Text>
              </View>
            </TouchableOpacity>
            
            <View style={styles.profileContainer}>
              <Text style={styles.profileInitials}>
                {userData.name.split(' ').map(n => n[0]).join('')}
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.dateContainer}>
          <View style={styles.dateContent}>
            <Text style={styles.dayText}>{formatDay()}</Text>
            <View>
              <Text style={styles.monthText}>{formatMonth()}</Text>
              <Text style={styles.yearText}>{formatYear()}</Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.calendarButton}>
            <Feather name="calendar" size={16} color={COLORS.primary} />
            <Text style={styles.calendarText}>Calendar</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Dashboard summary */}
      <View style={styles.summarySection}>
        <Text style={styles.sectionTitle}>Statistici generale</Text>
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryIconContainer}>
              <Feather name="truck" size={18} color={COLORS.secondary} />
            </View>
            <Text style={styles.summaryLabel}>Transporturi active</Text>
            <Text style={styles.summaryNumber}>{stats.activeShipments}</Text>
          </View>
          
          <View style={styles.summaryCard}>
            <View style={styles.summaryIconContainer}>
              <Feather name="alert-triangle" size={18} color={COLORS.warning} />
            </View>
            <Text style={styles.summaryLabel}>Transporturi întârziate</Text>
            <Text style={styles.summaryNumber}>{stats.delayedShipments}</Text>
          </View>
          
          <View style={styles.summaryCard}>
            <View style={styles.summaryIconContainer}>
              <Feather name="users" size={18} color={COLORS.success} />
            </View>
            <Text style={styles.summaryLabel}>Șoferi activi</Text>
            <Text style={styles.summaryNumber}>{stats.activeDrivers}</Text>
          </View>
          
          <View style={styles.summaryCard}>
            <View style={styles.summaryIconContainer}>
              <Feather name="pie-chart" size={18} color={COLORS.primary} />
            </View>
            <Text style={styles.summaryLabel}>Rată finalizare</Text>
            <Text style={styles.summaryNumber}>{stats.completionRate}%</Text>
          </View>
        </View>
      </View>
      
      {/* Quick actions */}
      <View style={styles.actionsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Acțiuni rapide</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>Vezi toate</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.gridContainer}>
          <TouchableOpacity 
            style={styles.gridItem}
            onPress={() => navigation.navigate('Transports')}
          >
            <View style={[styles.gridIconContainer, { backgroundColor: COLORS.secondary + '20' }]}>
              <Feather name="clipboard" size={22} color={COLORS.secondary} />
            </View>
            <Text style={styles.gridText}>Transporturi</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.gridItem}
            onPress={() => navigation.navigate('Drivers')}
          >
            <View style={[styles.gridIconContainer, { backgroundColor: COLORS.primary + '20' }]}>
              <Feather name="users" size={22} color={COLORS.primary} />
            </View>
            <Text style={styles.gridText}>Șoferi</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.gridItem}
            onPress={() => navigation.navigate('Trucks')}
          >
            <View style={[styles.gridIconContainer, { backgroundColor: COLORS.accent + '20' }]}>
              <Feather name="truck" size={22} color={COLORS.accent} />
            </View>
            <Text style={styles.gridText}>Camioane</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.gridItem}
            onPress={() => navigation.navigate('CreateShipment')}
          >
            <View style={[styles.gridIconContainer, { backgroundColor: COLORS.success + '20' }]}>
              <Feather name="plus" size={22} color={COLORS.success} />
            </View>
            <Text style={styles.gridText}>Creare transport</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Recent Shipments */}
      <View style={styles.shipmentsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Transporturi recente</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>Vezi toate</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.shipmentsContainer}>
          {shipments.map((shipment) => (
            <TouchableOpacity 
              key={shipment.id}
              style={styles.shipmentCard}
              onPress={() => navigation.navigate('ShipmentDetails', { id: shipment.id })}
            >
              <View style={styles.shipmentHeader}>
                <View style={styles.shipmentTitleContainer}>
                  <View style={[styles.statusIconContainer, { backgroundColor: getStatusColor(shipment.status) + '20' }]}>
                    <Feather name={getStatusIcon(shipment.status)} size={16} color={getStatusColor(shipment.status)} />
                  </View>
                  <View>
                    <Text style={styles.shipmentRoute}>{shipment.origin_city} → {shipment.destination_city}</Text>
                    <Text style={styles.shipmentId}>ID: {shipment.id}</Text>
                  </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(shipment.status) }]}>
                  <Text style={styles.statusText}>{getStatusLabel(shipment.status)}</Text>
                </View>
              </View>
              
              <View style={styles.progressContainer}>
                <View style={styles.progressBarContainer}>
                  <View style={[styles.progressBar, { width: `${shipment.completion}%`, backgroundColor: getStatusColor(shipment.status) }]} />
                </View>
                <Text style={styles.progressText}>{shipment.completion}%</Text>
              </View>
              
              <View style={styles.shipmentDetails}>
                <View style={styles.detailColumn}>
                  <Text style={styles.detailLabel}>Data estimată sosire:</Text>
                  <Text style={styles.detailValue}>{formatDateTime(shipment.eta)}</Text>
                </View>
                
                <View style={styles.detailSeparator} />
                
                <View style={styles.detailColumn}>
                  <Text style={styles.detailLabel}>Încărcătură:</Text>
                  <Text style={styles.detailValue}>{shipment.pallets} paleți • {shipment.cargo}</Text>
                </View>
                
                <View style={styles.detailSeparator} />
                
                <View style={styles.detailColumn}>
                  <Text style={styles.detailLabel}>Șofer atribuit:</Text>
                  <Text style={styles.detailValue}>{shipment.driver}</Text>
                </View>
                
                <View style={styles.detailSeparator} />
                
                <View style={styles.detailColumn}>
                  <Text style={styles.detailLabel}>Distanță:</Text>
                  <Text style={styles.detailValue}>{shipment.distance}</Text>
                </View>
              </View>
              
              <View style={styles.shipmentActions}>
                <TouchableOpacity style={styles.actionButton}>
                  <Feather name="phone" size={16} color={COLORS.primary} />
                  <Text style={styles.actionText}>Contact</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.actionButton}>
                  <Feather name="map-pin" size={16} color={COLORS.primary} />
                  <Text style={styles.actionText}>Locație</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.viewDetailsButton}>
                  <Text style={styles.viewDetailsText}>Vezi detalii</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      {/* Help section */}
      <View style={styles.helpContainer}>
        <View style={styles.helpContent}>
          <View style={styles.helpTextContainer}>
            <Text style={styles.helpTitle}>Aveți nevoie de ajutor?</Text>
            <Text style={styles.helpText}>Contactați echipa de suport pentru orice întrebări legate de aplicație sau transporturi.</Text>
          </View>
          
          <TouchableOpacity style={styles.helpButton}>
            <Text style={styles.helpButtonText}>Suport</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    backgroundColor: COLORS.background,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.medium,
  },
  header: {
    backgroundColor: COLORS.card,
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 10,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 14,
    color: COLORS.medium,
  },
  nameText: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.dark,
    marginTop: 4,
  },
  roleText: {
    fontSize: 14,
    color: COLORS.medium,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  notificationButton: {
    marginRight: 16,
    padding: 8,
    borderRadius: 12,
    backgroundColor: COLORS.card,
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  notificationBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.danger,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationCount: {
    color: COLORS.card,
    fontSize: 10,
    fontWeight: "bold",
  },
  profileContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  profileInitials: {
    color: COLORS.card,
    fontSize: 18,
    fontWeight: "bold",
  },
  dateContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  dateContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  dayText: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.primary,
    marginRight: 8,
  },
  monthText: {
    fontSize: 16,
    color: COLORS.dark,
    fontWeight: "500",
  },
  yearText: {
    fontSize: 14,
    color: COLORS.medium,
  },
  calendarButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    paddingHorizontal: 12,
    backgroundColor: COLORS.primary + '10',
    borderRadius: 20,
  },
  calendarText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 6,
  },
  summarySection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.dark,
    marginBottom: 16,
  },
  summaryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  summaryCard: {
    width: "48%",
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.medium,
    marginBottom: 6,
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.dark,
  },
  actionsSection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "500",
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gridItem: {
    width: "48%",
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  gridIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  gridText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.dark,
  },
  shipmentsSection: {
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 24,
  },
  shipmentsContainer: {
    marginBottom: 16,
  },
  shipmentCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    marginBottom: 16,
    padding: 20,
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  shipmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  shipmentTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  shipmentRoute: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.dark,
  },
  shipmentId: {
    fontSize: 14,
    color: COLORS.medium,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: COLORS.card,
    fontWeight: "bold",
    fontSize: 12,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  progressBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    marginRight: 12,
    overflow: "hidden",
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.dark,
  },
  shipmentDetails: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  detailColumn: {
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 13,
    color: COLORS.medium,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 15,
    color: COLORS.dark,
    fontWeight: "500",
  },
  detailSeparator: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 8,
  },
  shipmentActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  actionText: {
    color: COLORS.primary,
    marginLeft: 6,
    fontWeight: "500",
  },
  viewDetailsButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  viewDetailsText: {
    color: COLORS.card,
    fontWeight: "bold",
    fontSize: 14,
  },
  helpContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  helpContent: {
    backgroundColor: COLORS.primary + '10',
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  helpTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  helpTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.dark,
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: COLORS.medium,
    lineHeight: 20,
  },
  helpButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  helpButtonText: {
    color: COLORS.card,
    fontWeight: "bold",
    fontSize: 14,
  },
});

export default DispatcherDashboard;