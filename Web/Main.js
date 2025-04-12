import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, StyleSheet, Image } from "react-native-web";
import { Card, Title, Paragraph, Button, DataTable, Appbar, Menu, Divider, Badge, IconButton, Avatar, ActivityIndicator } from "react-native-paper";
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

const MainScreen = () => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState({});
  const [shipments, setShipments] = useState([]);
  const [menuVisible, setMenuVisible] = useState(false);
  const [isDispatcher, setIsDispatcher] = useState(false);

  useEffect(() => {
    // Check if user is authenticated and get user type
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        navigation.navigate('Login');
        return;
      }
      
      // Check if user is dispatcher
      const isDispatcherValue = localStorage.getItem('isDispatcher');
      setIsDispatcher(isDispatcherValue === 'true');
      
      // Get user data
      setUserData({
        name: localStorage.getItem('userName') || 'Dispatcher',
        company: localStorage.getItem('userCompany') || 'Atrux Logistics'
      });
      
      // Fetch shipments data
      await fetchShipments(token);
      setIsLoading(false);
    };
    
    checkAuth();
  }, [navigation]);

  const fetchShipments = async (token) => {
    try {
      const response = await fetch(
        "https://atrux-717ecf8763ea.herokuapp.com/dispatchers/shipments/",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Token ${token}`
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setShipments(data);
      } else {
        console.error("Failed to fetch shipments:", response.status);
      }
    } catch (error) {
      console.error("Error fetching shipments:", error);
    }
  };

  const handleLogout = () => {
    // Clear storage and redirect to login
    localStorage.removeItem('authToken');
    localStorage.removeItem('driverId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userCompany');
    localStorage.removeItem('isDriver');
    localStorage.removeItem('isDispatcher');
    navigation.navigate('Login');
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "Not scheduled";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return '#10B981'; // Green
      case 'in_transit': return '#3B82F6'; // Blue
      case 'assigned': return '#F59E0B'; // Amber
      case 'pending': return '#EF4444'; // Red
      default: return '#6B7280'; // Grey
    }
  };

  const getStatusGradient = (status) => {
    switch (status) {
      case 'delivered': return ['#059669', '#10B981'];
      case 'in_transit': return ['#2563EB', '#3B82F6'];
      case 'assigned': return ['#D97706', '#F59E0B'];
      case 'pending': return ['#DC2626', '#EF4444'];
      default: return ['#4B5563', '#6B7280'];
    }
  };

  const handleShipmentPress = (shipmentId) => {
    // Navigate to shipment details
    navigation.navigate('ShipmentDetails', { id: shipmentId });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1E40AF', '#3B82F6']} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Image 
              source={{ uri: 'https://placehold.co/200x200/png?text=AL' }}
              style={styles.logo}
            />
            <View>
              <Text style={styles.headerTitle}>Bine ai venit</Text>
              <Text style={styles.headerSubtitle}>{userData.company}</Text>
            </View>
          </View>
          
          <View style={styles.headerRight}>
            <View style={styles.notificationContainer}>
              <IconButton icon="bell" color="white" size={24} onPress={() => {}} />
              <Badge style={styles.notificationBadge}>3</Badge>
            </View>
            
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <View style={styles.profileContainer}>
                  <Avatar.Text 
                    size={40} 
                    label={userData.name.substring(0, 2).toUpperCase()} 
                    style={styles.avatar}
                    onPress={() => setMenuVisible(true)}
                  />
                  <Text style={styles.profileName}>{userData.name}</Text>
                </View>
              }
              style={styles.menu}
            >
              <Menu.Item onPress={() => {}} title="View Profile" icon="account" />
              <Menu.Item onPress={() => {}} title="Settings" icon="cog" />
              <Divider />
              <Menu.Item onPress={handleLogout} title="Logout" icon="logout" />
            </Menu>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.dashboardSummary}>
          <Card style={[styles.summaryCard, styles.elevation]}>
            <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.summaryCardGradient}>
              <Title style={styles.summaryNumber}>18</Title>
              <Text style={styles.summaryLabel}>Transporturi active</Text>
            </LinearGradient>
          </Card>
          
          <Card style={[styles.summaryCard, styles.elevation]}>
            <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.summaryCardGradient}>
              <Title style={styles.summaryNumber}>4</Title>
              <Text style={styles.summaryLabel}>Transporturi intarziate</Text>
            </LinearGradient>
          </Card>
          
          <Card style={[styles.summaryCard, styles.elevation]}>
            <LinearGradient colors={['#10B981', '#059669']} style={styles.summaryCardGradient}>
              <Title style={styles.summaryNumber}>12</Title>
              <Text style={styles.summaryLabel}>Soferi activi</Text>
            </LinearGradient>
          </Card>
        </View>

        <Card style={[styles.shipmentsCard, styles.elevation]}>
          <Card.Title 
            title="Recent Shipments" 
            titleStyle={styles.cardTitle}
            right={(props) => <Button mode="text" onPress={() => navigation.navigate('Shipments')}>View All</Button>}
          />
          <Divider />
          <Card.Content style={styles.shipmentsContent}>
            <DataTable>
              <DataTable.Header style={styles.tableHeader}>
                <DataTable.Title>ID</DataTable.Title>
                <DataTable.Title>Origin</DataTable.Title>
                <DataTable.Title>Destinatie</DataTable.Title>
                <DataTable.Title>ETA</DataTable.Title>
                <DataTable.Title>Status</DataTable.Title>
              </DataTable.Header>

              {shipments.length > 0 ? (
                shipments.map((shipment) => (
                  <DataTable.Row 
                    key={shipment.id} 
                    onPress={() => handleShipmentPress(shipment.id)}
                    style={styles.shipmentRow}
                  >
                    <DataTable.Cell>{shipment.id}</DataTable.Cell>
                    <DataTable.Cell>{shipment.origin_city}</DataTable.Cell>
                    <DataTable.Cell>{shipment.destination_city}</DataTable.Cell>
                    <DataTable.Cell>{formatDateTime(shipment.eta)}</DataTable.Cell>
                    <DataTable.Cell>
                      <LinearGradient 
                        colors={getStatusGradient(shipment.status)}
                        style={styles.statusBadge}
                        start={{x: 0, y: 0}}
                        end={{x: 1, y: 0}}
                      >
                        <Text style={styles.statusText}>{shipment.status.replace('_', ' ')}</Text>
                      </LinearGradient>
                    </DataTable.Cell>
                  </DataTable.Row>
                ))
              ) : (
                <DataTable.Row style={styles.emptyRow}>
                  <DataTable.Cell style={styles.emptyCell}>
                    <Text style={styles.emptyText}>Nu s-au gasit transporturi</Text>
                  </DataTable.Cell>
                </DataTable.Row>
              )}
            </DataTable>
          </Card.Content>
        </Card>

        <View style={styles.actionCards}>
          <Card style={[styles.actionCard, styles.elevation]}>
            <LinearGradient colors={['#f9fafb', '#f3f4f6']} style={styles.actionCardGradient}>
              <Card.Content style={styles.actionCardContent}>
                <View style={styles.actionIconContainer}>
                  <LinearGradient 
                    colors={['#3B82F6', '#2563EB']} 
                    style={styles.actionIcon}
                  >
                    <Text style={styles.actionIconText}>🚚</Text>
                  </LinearGradient>
                </View>
                <Title style={styles.actionTitle}>Atribuie soferi</Title>
                <Paragraph style={styles.actionDescription}>Atribuie un sofer unui transport disponibil</Paragraph>
              </Card.Content>
              <Card.Actions style={styles.actionCardFooter}>
                <Button 
                  mode="contained" 
                  onPress={() => navigation.navigate('Assign')}
                  style={styles.actionButton}
                  labelStyle={styles.actionButtonLabel}
                >
                  Assign
                </Button>
              </Card.Actions>
            </LinearGradient>
          </Card>
          
          <Card style={[styles.actionCard, styles.elevation]}>
            <LinearGradient colors={['#f9fafb', '#f3f4f6']} style={styles.actionCardGradient}>
              <Card.Content style={styles.actionCardContent}>
                <View style={styles.actionIconContainer}>
                  <LinearGradient 
                    colors={['#10B981', '#059669']} 
                    style={styles.actionIcon}
                  >
                    <Text style={styles.actionIconText}>📦</Text>
                  </LinearGradient>
                </View>
                <Title style={styles.actionTitle}>Creeaza transport</Title>
                <Paragraph style={styles.actionDescription}>Creeaza un nou transport/cursa</Paragraph>
              </Card.Content>
              <Card.Actions style={styles.actionCardFooter}>
                <Button 
                  mode="contained" 
                  onPress={() => navigation.navigate('CreateShipment')}
                  style={[styles.actionButton, styles.createButton]}
                  labelStyle={styles.actionButtonLabel}
                >
                  Creeaza
                </Button>
              </Card.Actions>
            </LinearGradient>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
    height: "100vh",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundColor: "#f9fafb",
  },
  loadingText: {
    marginTop: 12,
    color: "#4B5563",
    fontSize: 16,
  },
  header: {
    padding: 16,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
  },
  headerTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  headerSubtitle: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  notificationContainer: {
    position: "relative",
    marginRight: 16,
  },
  notificationBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#EF4444",
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    backgroundColor: "#1E3A8A",
  },
  profileName: {
    color: "white",
    marginLeft: 8,
    fontWeight: "500",
  },
  menu: {
    marginTop: 40,
  },
  content: {
    padding: 16,
  },
  dashboardSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  summaryCard: {
    width: "32%",
    overflow: "hidden",
    borderRadius: 12,
  },
  summaryCardGradient: {
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    height: 100,
  },
  summaryNumber: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 4,
  },
  summaryLabel: {
    color: "white",
    fontSize: 14,
    opacity: 0.9,
  },
  shipmentsCard: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  shipmentsContent: {
    paddingHorizontal: 0,
    paddingVertical: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  tableHeader: {
    backgroundColor: "#f3f4f6",
  },
  shipmentRow: {
    cursor: "pointer",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  emptyRow: {
    height: 100,
  },
  emptyCell: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    color: "#6B7280",
    fontSize: 16,
  },
  statusBadge: {
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: "center",
    justifyContent: "center",
    maxWidth: 100,
  },
  statusText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
    textTransform: "capitalize",
  },
  actionCards: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  actionCard: {
    width: "48.5%",
    borderRadius: 12,
    overflow: "hidden",
  },
  actionCardGradient: {
    height: "100%",
  },
  actionCardContent: {
    padding: 16,
    paddingBottom: 8,
  },
  actionIconContainer: {
    marginBottom: 12,
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  actionIconText: {
    fontSize: 24,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  actionDescription: {
    color: "#6B7280",
    marginBottom: 12,
  },
  actionCardFooter: {
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  actionButton: {
    borderRadius: 8,
    backgroundColor: "#3B82F6",
  },
  createButton: {
    backgroundColor: "#10B981",
  },
  actionButtonLabel: {
    fontSize: 14,
    fontWeight: "bold",
    paddingHorizontal: 8,
  },
  elevation: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
});

export default MainScreen;