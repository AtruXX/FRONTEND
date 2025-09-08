import { StyleSheet } from 'react-native';
import COLORS from '../../utils/COLORS.js';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background || '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    padding: 16,
  },
  
  // Empty state styles
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.dark || '#333333',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.medium || '#666666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  
  // Error banner styles
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#c62828',
    marginLeft: 12,
    fontWeight: '500',
  },
  
  // Route info styles
  routeInfoContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  routeInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  routeInfoItem: {
    alignItems: 'center',
    flex: 1,
  },
  routeInfoLabel: {
    fontSize: 12,
    color: COLORS.medium || '#666666',
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  routeInfoValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.dark || '#333333',
    textAlign: 'center',
  },
  
  // Locations container styles
  locationsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  locationsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  locationsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.dark || '#333333',
  },
  openFullRouteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5A5BDE',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  openFullRouteText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  locationsList: {
    paddingBottom: 8,
  },
  
  // Location card styles
  locationCard: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  locationCardContent: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  locationIconContainer: {
    alignItems: 'center',
    marginRight: 16,
    position: 'relative',
  },
  routeLine: {
    width: 2,
    height: 40,
    backgroundColor: '#e0e0e0',
    position: 'absolute',
    top: 32,
    left: 11,
  },
  locationInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationNumber: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#5A5BDE',
    backgroundColor: '#f0f0ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  openMapButton: {
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 20,
  },
  locationCity: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.dark || '#333333',
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 14,
    color: COLORS.medium || '#666666',
    marginBottom: 8,
    lineHeight: 20,
  },
  locationCoordinates: {
    fontSize: 12,
    color: COLORS.light || '#999999',
    fontFamily: 'monospace',
  },
  
  // Loading styles
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.medium || '#666666',
    fontWeight: '500',
  },
  
  // Legacy styles for compatibility
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.primary || '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 50,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  refreshButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 8,
    minWidth: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshButtonText: {
    fontSize: 16,
    color: '#ffffff',
  },
  mapContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  retryButton: {
    backgroundColor: '#f44336',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  infoContainer: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingHorizontal: 20,
    paddingVertical: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  infoText: {
    fontSize: 16,
    color: COLORS.medium || '#666666',
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '500',
  },
  coordinatesText: {
    fontSize: 12,
    color: COLORS.light || '#999999',
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.primary || '#007AFF',
    borderWidth: 3,
    borderColor: '#ffffff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  
  // Fallback styles for Expo Go
  fallbackContainer: {
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    borderWidth: 2,
    borderColor: '#e3f2fd',
    borderStyle: 'dashed',
    borderRadius: 12,
  },
  fallbackTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary || '#007AFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  fallbackText: {
    fontSize: 16,
    color: COLORS.medium || '#666666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  locationInfo: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    minWidth: 200,
  },
  fallbackLocationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary || '#007AFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  fallbackLocationText: {
    fontSize: 14,
    color: COLORS.dark || '#333333',
    textAlign: 'center',
    fontFamily: 'monospace',
    lineHeight: 20,
  },
  mapButton: {
    width: '100%',
    alignItems: 'center',
  },
  openMapText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary || '#007AFF',
    textAlign: 'center',
    marginTop: 12,
    padding: 8,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
  },
});