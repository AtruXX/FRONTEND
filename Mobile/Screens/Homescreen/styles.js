import { View, StyleSheet, Alert, Text, TouchableOpacity, Image } from "react-native";
import COLORS from "../../utils/COLORS.js";

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: COLORS.card,
  },
  welcomeText: {
    fontSize: 14,
    color: COLORS.medium,
  },
  nameText: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.dark,
    marginTop: 2,
  },
  roleText: {
    fontSize: 14,
    color: COLORS.medium,
    marginTop: 2,
  },
  profileContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  profileInitials: {
    color: COLORS.card,
    fontSize: 18,
    fontWeight: "bold",
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notificationIcon: {
    position: 'relative',
    padding: 8,
  },
  notificationBadgeContainer: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  dateNumber: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  dateDetails: {
    marginLeft: 10,
  },
  dateMonth: {
    fontSize: 16,
    color: COLORS.medium,
  },
  dateYear: {
    fontSize: 14,
    color: COLORS.light,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: "auto",
    padding: 8,
    borderRadius: 8,
    backgroundColor: COLORS.background,
  },
  logoutText: {
    color: COLORS.primary,
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
    color: COLORS.dark,
  },
  seeAllText: {
    color: COLORS.primary,
    fontWeight: "500",
  },
  primaryActionCard: {
    width: '100%',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryActionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  primaryActionLabel: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.dark,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 10,
  },
  statCard: {
    width: "48%",
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: COLORS.dark,
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
    backgroundColor: COLORS.background,
    marginBottom: 10,
  },
  statLabel: {
    fontSize: 18,
    color: COLORS.medium,
    marginBottom: 6,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.dark,
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
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 15,
    marginBottom: 20,
    alignItems: "center",
    shadowColor: COLORS.dark,
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
    color: COLORS.dark,
    textAlign: "center",
    marginTop: 5,
  },
  statusCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    margin: 16,
    shadowColor: COLORS.dark,
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
    backgroundColor: COLORS.selected,
  },
  
  parked: {
    backgroundColor: COLORS.background,
  },
  
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  
  drivingDot: {
    backgroundColor: COLORS.success,
  },
  
  parkedDot: {
    backgroundColor: COLORS.secondary,
  },
  
  statusText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.dark,
  },
  
  toggleButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  driveButton: {
    backgroundColor: COLORS.success,
  },
  
  parkButton: {
    backgroundColor: COLORS.secondary,
  },
  
  disabled: {
    opacity: 0.6,
  },
  
  buttonText: {
    color: COLORS.card,
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
    borderColor: COLORS.card,
    borderRadius: 4,
    marginBottom: 2,
  },
  parkingText: {
    position: 'absolute',
    color: COLORS.card,
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
    backgroundColor: COLORS.card,
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
    backgroundColor: COLORS.card,
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
    color: COLORS.card,
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
    color: COLORS.light,
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  
  drivingText: {
    color: COLORS.success,
  },
  
  parkedText: {
    color: COLORS.secondary,
  },
  
  changeInstructions: {
    alignItems: 'center',
  },
  
  instructionText: {
    fontSize: 14,
    color: COLORS.medium,
    textAlign: 'center',
    marginBottom: 4,
  },
  
  nextStatusText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.light,
  },

  deliveryCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    marginHorizontal: 20,
    marginVertical: 20,
    padding: 15,
    shadowColor: COLORS.dark,
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
    color: COLORS.dark,
  },
  deliverySubtitle: {
    fontSize: 14,
    color: COLORS.medium,
    marginTop: 2,
  },
  deliveryBadge: {
    backgroundColor: COLORS.success,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  deliveryBadgeText: {
    color: COLORS.card,
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
    color: COLORS.medium,
  },
  deliveryButton: {
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  deliveryButtonText: {
    color: COLORS.card,
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
    color: COLORS.medium,
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
    color: COLORS.dark,
    marginTop: 16,
    textAlign: 'center',
  },
  noDataSubtitle: {
    fontSize: 14,
    color: COLORS.medium,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.dark,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  
  // Badge status styles for different transport statuses
  badgeNotStarted: {
    backgroundColor: COLORS.light,
  },
  badgeInProgress: {
    backgroundColor: COLORS.primary,
  },
  badgeDelayed: {
    backgroundColor: COLORS.warning,
  },
  badgeCompleted: {
    backgroundColor: COLORS.success,
  },
  
  // Error container styles
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.danger,
    textAlign: 'center',
  },
});