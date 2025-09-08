import * as Location from 'expo-location';

/**
 * Service for handling route operations and polyline processing
 */
export class RouteService {
  
  /**
   * Decode polyline string to coordinate array
   * @param {string} polylineString - Encoded polyline string
   * @returns {Array} Array of [lat, lng] coordinates
   */
  static decodePolyline(polylineString) {
    try {
      // Parse the polyline if it's a JSON string
      let coordinates;
      if (typeof polylineString === 'string') {
        const parsed = JSON.parse(polylineString);
        coordinates = parsed.coordinates;
      } else {
        coordinates = polylineString.coordinates;
      }
      
      // Return coordinates in [lat, lng] format
      return coordinates.map(coord => [coord[1], coord[0]]); // Swap lng,lat to lat,lng
    } catch (error) {
      console.error('Error decoding polyline:', error);
      return [];
    }
  }

  /**
   * Extract key waypoints from the route coordinates
   * @param {Array} coordinates - Array of [lat, lng] coordinates
   * @param {number} numberOfPoints - Number of key points to extract (default: 7)
   * @returns {Array} Array of key waypoints
   */
  static extractKeyWaypoints(coordinates, numberOfPoints = 7) {
    if (!coordinates || coordinates.length === 0) return [];
    
    if (coordinates.length <= numberOfPoints) {
      return coordinates;
    }
    
    const keyPoints = [];
    const step = Math.floor(coordinates.length / (numberOfPoints - 1));
    
    // Always include start point
    keyPoints.push(coordinates[0]);
    
    // Extract intermediate points
    for (let i = 1; i < numberOfPoints - 1; i++) {
      const index = i * step;
      if (index < coordinates.length) {
        keyPoints.push(coordinates[index]);
      }
    }
    
    // Always include end point
    keyPoints.push(coordinates[coordinates.length - 1]);
    
    return keyPoints;
  }

  /**
   * Reverse geocode coordinates to get location names
   * @param {Array} coordinates - Array of [lat, lng] coordinates
   * @returns {Promise<Array>} Array of location objects with address information
   */
  static async reverseGeocodeWaypoints(coordinates) {
    const locationPromises = coordinates.map(async (coord, index) => {
      try {
        const [latitude, longitude] = coord;
        const results = await Location.reverseGeocodeAsync({
          latitude,
          longitude
        });
        
        if (results && results.length > 0) {
          const result = results[0];
          return {
            id: index,
            latitude,
            longitude,
            city: result.city || result.subregion || 'Locație necunoscută',
            street: result.street || '',
            streetNumber: result.streetNumber || '',
            region: result.region || '',
            country: result.country || '',
            postalCode: result.postalCode || '',
            formattedAddress: this.formatAddress(result),
            isStart: index === 0,
            isEnd: index === coordinates.length - 1
          };
        }
        
        return {
          id: index,
          latitude,
          longitude,
          city: 'Locație necunoscută',
          street: '',
          streetNumber: '',
          region: '',
          country: '',
          postalCode: '',
          formattedAddress: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
          isStart: index === 0,
          isEnd: index === coordinates.length - 1
        };
      } catch (error) {
        console.error(`Error geocoding coordinates ${coord}:`, error);
        return {
          id: index,
          latitude: coord[0],
          longitude: coord[1],
          city: 'Eroare geocoding',
          street: '',
          streetNumber: '',
          region: '',
          country: '',
          postalCode: '',
          formattedAddress: `${coord[0].toFixed(4)}, ${coord[1].toFixed(4)}`,
          isStart: index === 0,
          isEnd: index === coordinates.length - 1
        };
      }
    });
    
    return Promise.all(locationPromises);
  }

  /**
   * Format address from geocoding result
   * @param {Object} geocodeResult - Result from reverse geocoding
   * @returns {string} Formatted address string
   */
  static formatAddress(result) {
    const parts = [];
    
    if (result.streetNumber) parts.push(result.streetNumber);
    if (result.street) parts.push(result.street);
    if (result.city) parts.push(result.city);
    if (result.region && result.region !== result.city) parts.push(result.region);
    if (result.country) parts.push(result.country);
    
    return parts.length > 0 ? parts.join(', ') : 'Adresă necunoscută';
  }

  /**
   * Calculate distance between two coordinates
   * @param {number} lat1 - First latitude
   * @param {number} lng1 - First longitude
   * @param {number} lat2 - Second latitude
   * @param {number} lng2 - Second longitude
   * @returns {number} Distance in kilometers
   */
  static calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Process route data and extract key information
   * @param {Object} routeData - Route data from transport object
   * @returns {Promise<Object>} Processed route information
   */
  static async processRouteData(routeData) {
    try {
      if (!routeData || !routeData.polyline) {
        throw new Error('Invalid route data');
      }

      // Decode polyline to coordinates
      const coordinates = this.decodePolyline(routeData.polyline);
      
      if (coordinates.length === 0) {
        throw new Error('No coordinates found in polyline');
      }

      // Extract key waypoints
      const keyWaypoints = this.extractKeyWaypoints(coordinates, 7);
      
      // Reverse geocode to get location names
      const locations = await this.reverseGeocodeWaypoints(keyWaypoints);
      
      // Calculate total distance if available
      const totalDistance = routeData.distance 
        ? (routeData.distance / 1000).toFixed(1) // Convert meters to km
        : this.calculateTotalDistance(coordinates).toFixed(1);

      // Calculate estimated travel time
      const travelTime = routeData.travelTime 
        ? this.formatTravelTime(routeData.travelTime)
        : this.estimateTravelTime(parseFloat(totalDistance));

      return {
        locations,
        totalDistance,
        travelTime,
        startLocation: locations[0],
        endLocation: locations[locations.length - 1],
        intermediateStops: locations.slice(1, -1),
        allCoordinates: coordinates,
        keyWaypoints
      };
    } catch (error) {
      console.error('Error processing route data:', error);
      throw error;
    }
  }

  /**
   * Calculate total distance from coordinates
   * @param {Array} coordinates - Array of [lat, lng] coordinates
   * @returns {number} Total distance in kilometers
   */
  static calculateTotalDistance(coordinates) {
    let totalDistance = 0;
    for (let i = 1; i < coordinates.length; i++) {
      totalDistance += this.calculateDistance(
        coordinates[i-1][0], coordinates[i-1][1],
        coordinates[i][0], coordinates[i][1]
      );
    }
    return totalDistance;
  }

  /**
   * Format travel time from seconds
   * @param {number} seconds - Travel time in seconds
   * @returns {string} Formatted time string
   */
  static formatTravelTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  /**
   * Estimate travel time based on distance
   * @param {number} distanceKm - Distance in kilometers
   * @returns {string} Estimated travel time
   */
  static estimateTravelTime(distanceKm) {
    // Assume average speed of 60 km/h for trucks
    const hours = distanceKm / 60;
    return this.formatTravelTime(hours * 3600);
  }
}