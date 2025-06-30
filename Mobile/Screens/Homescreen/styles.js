import { View, StyleSheet, Alert, Text, TouchableOpacity, Image } from "react-native";

export const styles = StyleSheet.create({
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
    fontSize: 18,
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
    marginVertical: 20,
    paddingHorizontal: 5,
  },
  actionCard: {
    width: "48%",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 15,
    marginBottom: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    paddingVertical: 24,
  },
  actionIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35, // Makes it circular
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  actionLabel: {
    fontSize: 20,
    fontWeight: "500",
    color: "#1E293B",
    textAlign: "center",
    marginTop: 5,
  },
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  
  statusDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  
  driving: {
    backgroundColor: '#e8f5e8',
  },
  
  parked: {
    backgroundColor: '#e3f2fd',
  },
  
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  
  drivingDot: {
    backgroundColor: '#4CAF50',
  },
  
  parkedDot: {
    backgroundColor: '#2196F3',
  },
  
  statusText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  
  toggleButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  driveButton: {
    backgroundColor: '#4CAF50',
  },
  
  parkButton: {
    backgroundColor: '#2196F3',
  },
  
  disabled: {
    opacity: 0.6,
  },
  
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: 8,
  },
  // Parking icon styles
  parkingIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  parkingSquare: {
    width: 32,
    height: 32,
    borderWidth: 3,
    borderColor: '#fff',
    borderRadius: 4,
    marginBottom: 2,
  },
  parkingText: {
    position: 'absolute',
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Car icon styles
  carIcon: {
    width: 40,
    height: 24,
    position: 'relative',
  },
  carBody: {
    width: 40,
    height: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    position: 'absolute',
    top: 4,
  },
  carWindows: {
    width: 24,
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 4,
    position: 'absolute',
    top: 6,
    left: 8,
  },
  carWheel: {
    width: 8,
    height: 8,
    backgroundColor: '#fff',
    borderRadius: 4,
    position: 'absolute',
    bottom: 0,
  },
  frontWheel: {
    right: 2,
  },
  backWheel: {
    left: 2,
  },
  actionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 2,
  },
  nextStatusHint: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    textAlign: 'center',
  },
  helperText: {
    color: '#7f8c8d',
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  
  drivingText: {
    color: '#2E7D32',
  },
  
  parkedText: {
    color: '#1565C0',
  },
  
  changeInstructions: {
    alignItems: 'center',
  },
  
  instructionText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 4,
  },
  
  nextStatusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
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
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  noDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  noDataTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    textAlign: 'center',
  },
  noDataSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2c3e50',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
});