import { Platform, Linking, Alert } from 'react-native';
/**
 * Service for opening external map applications
 */
export class MapService {
  /**
   * Open route in external map application using polyline
   * @param {string|Object} polyline - GeoJSON polyline string or object
   * @param {Object} options - Options for map opening
   */
  static async openRouteFromPolyline(polyline, options = {}) {
    if (!polyline) {
      Alert.alert('Eroare', 'Nu sunt disponibile date despre rută.');
      return;
    }
    try {
      // Parse polyline to get coordinates
      let coordinates = [];
      if (typeof polyline === 'string') {
        const parsed = JSON.parse(polyline);
        coordinates = parsed.coordinates || parsed.geometry?.coordinates || [];
      } else if (polyline.coordinates) {
        coordinates = polyline.coordinates;
      } else if (polyline.geometry?.coordinates) {
        coordinates = polyline.geometry.coordinates;
      } else if (Array.isArray(polyline)) {
        coordinates = polyline;
      }
      if (!coordinates || coordinates.length === 0) {
        Alert.alert('Eroare', 'Nu s-au putut extrage coordonatele din rută.');
        return;
      }
      // Convert to waypoints format [lng, lat] -> {latitude, longitude}
      const waypoints = coordinates.map(coord => ({
        latitude: coord[1],  // lat is second
        longitude: coord[0]  // lng is first
      }));
      // Use existing openRouteInMaps with waypoints
      await this.openRouteInMaps(waypoints, options);
    } catch (error) {
      Alert.alert('Eroare', 'Nu s-a putut deschide ruta în aplicația de navigație.');
    }
  }
  /**
   * Open route in external map application
   * @param {Array} waypoints - Array of location objects with latitude/longitude
   * @param {Object} options - Options for map opening
   */
  static async openRouteInMaps(waypoints, options = {}) {
    if (!waypoints || waypoints.length === 0) {
      Alert.alert('Eroare', 'Nu sunt disponibile coordonate pentru rută.');
      return;
    }
    const start = waypoints[0];
    const end = waypoints[waypoints.length - 1];
    const intermediate = waypoints.slice(1, -1);
    try {
      // Try to open in preferred map app
      const opened = await this.tryOpenInPreferredApp(start, end, intermediate, options);
      if (!opened) {
        // Fallback to web maps
        this.openInWebMaps(start, end, intermediate);
      }
    } catch (error) {
      Alert.alert('Eroare', 'Nu s-a putut deschide aplicația de navigație.');
    }
  }
  /**
   * Try to open route in preferred map application
   * @param {Object} start - Start location
   * @param {Object} end - End location  
   * @param {Array} intermediate - Intermediate waypoints
   * @param {Object} options - Opening options
   * @returns {Promise<boolean>} Success status
   */
  static async tryOpenInPreferredApp(start, end, intermediate, options) {
    const apps = this.getAvailableMapApps();
    for (const app of apps) {
      try {
        const url = this.buildUrlForApp(app, start, end, intermediate, options);
        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
          await Linking.openURL(url);
          return true;
        }
      } catch (error) {
        continue;
      }
    }
    return false;
  }
  /**
   * Get list of available map applications based on platform
   * @returns {Array} Array of map app configurations
   */
  static getAvailableMapApps() {
    const apps = [];
    if (Platform.OS === 'ios') {
      apps.push(
        { name: 'Apple Maps', scheme: 'maps://', priority: 1 },
        { name: 'Google Maps', scheme: 'comgooglemaps://', priority: 2 },
        { name: 'Waze', scheme: 'waze://', priority: 3 }
      );
    } else {
      apps.push(
        { name: 'Google Maps', scheme: 'google.navigation:', priority: 1 },
        { name: 'Waze', scheme: 'waze://', priority: 2 }
      );
    }
    return apps.sort((a, b) => a.priority - b.priority);
  }
  /**
   * Build URL for specific map application
   * @param {Object} app - App configuration
   * @param {Object} start - Start location
   * @param {Object} end - End location
   * @param {Array} intermediate - Intermediate waypoints
   * @param {Object} options - URL building options
   * @returns {string} Deep link URL
   */
  static buildUrlForApp(app, start, end, intermediate, options) {
    const { latitude: startLat, longitude: startLng } = start;
    const { latitude: endLat, longitude: endLng } = end;
    switch (app.name) {
      case 'Apple Maps':
        if (intermediate.length > 0) {
          // Apple Maps with waypoints
          const waypoints = intermediate.map(wp => `${wp.latitude},${wp.longitude}`).join('|');
          return `maps://maps.apple.com/?saddr=${startLat},${startLng}&daddr=${endLat},${endLng}&waypoints=${waypoints}&dirflg=d`;
        }
        return `maps://maps.apple.com/?saddr=${startLat},${startLng}&daddr=${endLat},${endLng}&dirflg=d`;
      case 'Google Maps':
        if (Platform.OS === 'ios') {
          if (intermediate.length > 0) {
            const waypoints = intermediate.map(wp => `${wp.latitude},${wp.longitude}`).join('|');
            return `comgooglemaps://?saddr=${startLat},${startLng}&daddr=${endLat},${endLng}&waypoints=${waypoints}&directionsmode=driving`;
          }
          return `comgooglemaps://?saddr=${startLat},${startLng}&daddr=${endLat},${endLng}&directionsmode=driving`;
        } else {
          if (intermediate.length > 0) {
            const waypoints = intermediate.map(wp => `${wp.latitude},${wp.longitude}`).join('|');
            return `google.navigation:q=${endLat},${endLng}&waypoints=${waypoints}&mode=d`;
          }
          return `google.navigation:q=${endLat},${endLng}&mode=d`;
        }
      case 'Waze':
        // Waze doesn't support waypoints, so just navigate to end point
        return `waze://?ll=${endLat},${endLng}&navigate=yes`;
      default:
        return null;
    }
  }
  /**
   * Open route in web-based maps (fallback)
   * @param {Object} start - Start location
   * @param {Object} end - End location
   * @param {Array} intermediate - Intermediate waypoints
   */
  static openInWebMaps(start, end, intermediate) {
    const { latitude: startLat, longitude: startLng } = start;
    const { latitude: endLat, longitude: endLng } = end;
    let url;
    if (intermediate.length > 0) {
      const waypoints = intermediate.map(wp => `${wp.latitude},${wp.longitude}`).join('|');
      url = `https://www.google.com/maps/dir/${startLat},${startLng}/${waypoints}/${endLat},${endLng}`;
    } else {
      url = `https://www.google.com/maps/dir/${startLat},${startLng}/${endLat},${endLng}`;
    }
    Linking.openURL(url).catch(error => {
      Alert.alert('Eroare', 'Nu s-a putut deschide harta în browser.');
    });
  }
  /**
   * Open single location in maps
   * @param {Object} location - Location object with latitude/longitude
   * @param {string} label - Optional label for the location
   */
  static async openLocationInMaps(location, label = '') {
    const { latitude, longitude } = location;
    try {
      let url;
      if (Platform.OS === 'ios') {
        // Try Apple Maps first
        url = `maps://maps.apple.com/?q=${latitude},${longitude}&ll=${latitude},${longitude}`;
        const canOpenAppleMaps = await Linking.canOpenURL(url);
        if (canOpenAppleMaps) {
          await Linking.openURL(url);
          return;
        }
        // Try Google Maps on iOS
        url = `comgooglemaps://?q=${latitude},${longitude}&center=${latitude},${longitude}&zoom=15`;
        const canOpenGoogleMaps = await Linking.canOpenURL(url);
        if (canOpenGoogleMaps) {
          await Linking.openURL(url);
          return;
        }
      } else {
        // Android - try Google Maps
        url = `geo:${latitude},${longitude}?q=${latitude},${longitude}${label ? `(${label})` : ''}`;
        const canOpenGeoUrl = await Linking.canOpenURL(url);
        if (canOpenGeoUrl) {
          await Linking.openURL(url);
          return;
        }
      }
      // Fallback to web
      url = `https://www.google.com/maps?q=${latitude},${longitude}`;
      await Linking.openURL(url);
    } catch (error) {
      Alert.alert('Eroare', 'Nu s-a putut deschide locația în hartă.');
    }
  }
  /**
   * Show options for opening maps from polyline
   * @param {string|Object} polyline - GeoJSON polyline
   * @param {Object} routeData - Route metadata (distance, time, etc.)
   */
  static showPolylineMapOptions(polyline, routeData = {}) {
    if (!polyline) {
      Alert.alert('Eroare', 'Nu sunt disponibile date despre rută.');
      return;
    }
    Alert.alert(
      'Deschide Ruta',
      `${routeData.route_distance ? `Distanță: ${(routeData.route_distance / 1000).toFixed(1)} km\n` : ''}${routeData.route_travel_time ? `Timp: ${Math.floor(routeData.route_travel_time / 3600)}h ${Math.floor((routeData.route_travel_time % 3600) / 60)}m\n` : ''}Selectează aplicația de navigație:`,
      [
        {
          text: 'Google Maps',
          onPress: () => this.openRouteFromPolyline(polyline, { preferredApp: 'Google Maps' }),
        },
        {
          text: 'Waze',
          onPress: () => this.openRouteFromPolyline(polyline, { preferredApp: 'Waze' }),
        },
        {
          text: 'Altă aplicație',
          onPress: () => this.openRouteFromPolyline(polyline, { navigation: true }),
        },
        {
          text: 'Anulează',
          style: 'cancel',
        },
      ]
    );
  }
  /**
   * Show options for opening maps
   * @param {Array} waypoints - Array of waypoints
   */
  static showMapOptions(waypoints) {
    const start = waypoints[0];
    const end = waypoints[waypoints.length - 1];
    Alert.alert(
      'Deschide Ruta',
      'Selectează cum dorești să vizualizezi ruta:',
      [
        {
          text: 'Navigație completă',
          onPress: () => this.openRouteInMaps(waypoints, { navigation: true }),
        },
        {
          text: 'Vezi ruta',
          onPress: () => this.openRouteInMaps(waypoints, { navigation: false }),
        },
        {
          text: 'Doar destinația',
          onPress: () => this.openLocationInMaps(end, end.city),
        },
        {
          text: 'Anulează',
          style: 'cancel',
        },
      ]
    );
  }
  /**
   * Get formatted address for display
   * @param {Object} location - Location object
   * @returns {string} Formatted address
   */
  static getDisplayAddress(location) {
    if (location.formattedAddress && location.formattedAddress !== 'Adresă necunoscută') {
      return location.formattedAddress;
    }
    if (location.city && location.city !== 'Locație necunoscută') {
      const parts = [location.city];
      if (location.region && location.region !== location.city) {
        parts.push(location.region);
      }
      if (location.country) {
        parts.push(location.country);
      }
      return parts.join(', ');
    }
    return `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;
  }
}