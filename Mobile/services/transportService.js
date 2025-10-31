// services/transportService.js - Fixed version with better error handling
import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../utils/BASE_URL.js';
import { getUserFriendlyErrorMessage } from '../utils/errorHandler.js';
// Helper function to wait for auth token with retries
const waitForAuthToken = async (maxRetries = 5, delay = 200) => {
  for (let i = 0; i < maxRetries; i++) {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      return token;
    }
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  throw new Error('Auth token not available after maximum retries');
};
// Helper function to check if token is truly invalid (not just a temporary issue)
const verifyTokenValidity = async (token) => {
  try {
    // Use a simple endpoint to verify token validity
    const response = await fetch(`${BASE_URL}profile/`, {
      method: 'GET',
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.ok;
  } catch (error) {
    return false;
  }
};
// Custom hook for getting transports query
export const useGetTransportsQuery = (options = {}) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);
  const fetchTransports = useCallback(async () => {
    if (options.skip) return;
    setIsFetching(true);
    setError(null);
    try {
      // Wait for auth token to be available
      const token = await waitForAuthToken();
      // Double-check we have driver ID too
      const driverId = await AsyncStorage.getItem('driverId');
      if (!driverId) {
      }
      const response = await fetch(`${BASE_URL}active-transports`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        const errorData = await response.text();
        if (response.status === 401) {
          // Before clearing token, verify it's actually invalid
          const isTokenValid = await verifyTokenValidity(token);
          if (!isTokenValid) {
            await AsyncStorage.multiRemove([
              'authToken', 'driverId', 'userName', 'userCompany', 'isDriver', 'isDispatcher'
            ]);
          }
        }
        // Create user-friendly error message
        const userFriendlyMessage = getUserFriendlyErrorMessage(response.status);
        const error = new Error(userFriendlyMessage);
        error.status = response.status;
        error.originalMessage = errorData;
        throw error;
      }
      const transportData = await response.json();
      // Handle new API structure with active_transports array
      const rawTransports = transportData.active_transports || [];
      // Filter only non-finished transports (is_finished: false)
      const activeTransports = rawTransports.filter(transport => 
        !transport.is_finished
      );
      // Transform the API data to match the component structure
      const transformedTransports = activeTransports.map(transport => ({
        id: transport.id,
        truck_combination: `Truck #${transport.truck} + Trailer #${transport.trailer}`,
        destination: transport.email_destinatar || 'N/A',
        status_truck: transport.status_truck || 'not started',
        status_goods: transport.status_goods || 'not started',
        status_trailer_wagon: transport.status_trailer || 'not started',
        status_transport: transport.status_transport || 'not started',
        status_coupling: transport.status_coupling || 'not started',
        status_loaded_truck: transport.status_loaded_truck || 'not started',
        departure_time: 'N/A',
        arrival_time: 'N/A',
        distance: 'N/A',
        // Additional fields from API
        email_expeditor: transport.email_expeditor,
        email_destinatar: transport.email_destinatar,
        status: transport.status,
        is_finished: transport.is_finished,
        status_truck_problems: transport.status_truck_problems,
        status_trailer_description: transport.status_trailer_description,
        delay_estimation: transport.delay_estimation,
        company: transport.company,
        dispatcher: transport.dispatcher,
        driver: transport.driver,
        truck: transport.truck,
        trailer: transport.trailer,
        // Route fields from backend (backend doesn't have 'route' field anymore)
        route_id: transport.route_id,
        route_distance: transport.route_distance,
        route_travel_time: transport.route_travel_time,
        route_toll_costs: transport.route_toll_costs,
        route_polyline: transport.route_polyline,
        route_calculated_at: transport.route_calculated_at
      }));
      // Store all transports (for profile count) and filtered transports
      setData({ 
        transports: transformedTransports,
        allTransports: rawTransports,
        totalTransports: rawTransports.length,
        numberOfActiveTransports: transportData.number_of_active_transports || rawTransports.length
      });
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  }, [options.skip]);
  // Initial load with longer delay to ensure all auth data is ready
  useEffect(() => {
    // Wait a bit longer for all auth setup to complete
    const timer = setTimeout(() => {
      fetchTransports();
    }, 500); // Increased delay
    return () => clearTimeout(timer);
  }, [fetchTransports]);
  return {
    data,
    isLoading,
    isFetching,
    error,
    refetch: fetchTransports,
  };
};
// Custom hook for set active transport mutation
export const useSetActiveTransportMutation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const setActiveTransport = useCallback(async (transportId) => {
    setIsLoading(true);
    setError(null);
    try {
      // Wait for auth token to be available
      const token = await waitForAuthToken();
      const response = await fetch(`${BASE_URL}set-active-transport/${transportId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        const errorData = await response.text();
        if (response.status === 401) {
          // Don't clear token here, let other parts handle it
        }
        // Create user-friendly error message
        const userFriendlyMessage = getUserFriendlyErrorMessage(response.status);
        const error = new Error(userFriendlyMessage);
        error.status = response.status;
        error.originalMessage = errorData;
        throw error;
      }
      const data = await response.json();
      setIsLoading(false);
      return data;
    } catch (err) {
      setIsLoading(false);
      setError(err);
      throw err;
    }
  }, []);
  // Return the mutation function with unwrap method
  const setActiveTransportMutation = useCallback((variables) => {
    const promise = setActiveTransport(variables);
    promise.unwrap = () => promise;
    return promise;
  }, [setActiveTransport]);
  return [setActiveTransportMutation, { isLoading, error }];
};
// Custom hook for finalizing transport
export const useFinalizeTransportMutation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const finalizeTransport = useCallback(async (activeTransportId) => {
    setIsLoading(true);
    setError(null);
    try {
      const token = await waitForAuthToken();
      const response = await fetch(`${BASE_URL}finish-transport/${activeTransportId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        const errorData = await response.text();
        // Create user-friendly error message
        const userFriendlyMessage = getUserFriendlyErrorMessage(response.status);
        const error = new Error(userFriendlyMessage);
        error.status = response.status;
        error.originalMessage = errorData;
        throw error;
      }
      const data = await response.json();
      setIsLoading(false);
      return data;
    } catch (err) {
      setIsLoading(false);
      setError(err);
      throw err;
    }
  }, []);
  // Return the mutation function with unwrap method
  const finalizeTransportMutation = useCallback((variables) => {
    const promise = finalizeTransport(variables);
    promise.unwrap = () => promise;
    return promise;
  }, [finalizeTransport]);
  return [finalizeTransportMutation, { isLoading, error }];
};
// Custom hook for getting transport by ID (for active transport from profile)
export const useGetTransportByIdQuery = (transportId, options = {}) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);
  const fetchTransportById = useCallback(async () => {
    if (!transportId || options.skip) {
      return;
    }
    setIsFetching(true);
    setError(null);
    try {
      const token = await waitForAuthToken();
      const response = await fetch(`${BASE_URL}transports?id=${transportId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        const errorData = await response.text();
        if (response.status === 401) {
          // Before clearing token, verify it's actually invalid
          const isTokenValid = await verifyTokenValidity(token);
          if (!isTokenValid) {
            await AsyncStorage.multiRemove([
              'authToken', 'driverId', 'userName', 'userCompany', 'isDriver', 'isDispatcher'
            ]);
          }
        }
        // Create user-friendly error message
        const userFriendlyMessage = getUserFriendlyErrorMessage(response.status);
        const error = new Error(userFriendlyMessage);
        error.status = response.status;
        error.originalMessage = errorData;
        throw error;
      }
      const responseData = await response.json();
      // Handle both single transport and array responses
      let transport;
      if (Array.isArray(responseData)) {
        transport = responseData.find(t => t.id === parseInt(transportId));
        if (!transport) {
          throw new Error(`Transport with ID ${transportId} not found in response`);
        }
      } else if (responseData.transports && Array.isArray(responseData.transports)) {
        transport = responseData.transports.find(t => t.id === parseInt(transportId));
        if (!transport) {
          throw new Error(`Transport with ID ${transportId} not found in transports array`);
        }
      } else {
        // Assume single transport object
        transport = responseData;
      }
      // Transform the API data to match the component structure
      const transformedTransport = {
        id: transport.id,
        truck_combination: `Truck #${transport.truck} + Trailer #${transport.trailer}`,
        destination: transport.email_destinatar || 'N/A',
        status_truck: transport.status_truck || 'not started',
        status_goods: transport.status_goods || 'not started',
        status_trailer_wagon: transport.status_trailer || 'not started',
        status_transport: transport.status_transport || 'not started',
        status_coupling: transport.status_coupling || 'not started',
        status_loaded_truck: transport.status_loaded_truck || 'not started',
        departure_time: 'N/A',
        arrival_time: 'N/A',
        distance: 'N/A',
        // Additional fields from API
        email_expeditor: transport.email_expeditor,
        email_destinatar: transport.email_destinatar,
        status: transport.status,
        is_finished: transport.is_finished,
        status_truck_problems: transport.status_truck_problems,
        status_trailer_description: transport.status_trailer_description,
        delay_estimation: transport.delay_estimation,
        company: transport.company,
        dispatcher: transport.dispatcher,
        driver: transport.driver,
        truck: transport.truck,
        trailer: transport.trailer,
        // Route data from PTV API (backend doesn't have 'route' field anymore)
        route_id: transport.route_id,
        route_id_expires_at: transport.route_id_expires_at,
        route_polyline: transport.route_polyline,
        route_distance: transport.route_distance,
        route_travel_time: transport.route_travel_time,
        route_toll_costs: transport.route_toll_costs,
        route_full_data: transport.route_full_data,
        route_calculated_at: transport.route_calculated_at
      };
      // If route_id exists but route_polyline is null, fetch route details from PTV
      if (transport.route_id && !transport.route_polyline) {
        try {
          const routeResponse = await fetch(`${BASE_URL}routes/${transport.route_id}/`, {
            method: 'GET',
            headers: {
              'Authorization': `Token ${token}`,
              'Content-Type': 'application/json',
            },
          });
          if (routeResponse.ok) {
            const routeData = await routeResponse.json();
            // Add route data to transformed transport
            transformedTransport.route_polyline = routeData.polyline;
            transformedTransport.route_distance = routeData.distance;
            transformedTransport.route_travel_time = routeData.travelTime;
            // Extract toll costs if available
            if (routeData.toll?.costs?.prices && routeData.toll.costs.prices.length > 0) {
              transformedTransport.route_toll_costs = routeData.toll.costs.prices[0].price;
            }
            transformedTransport.route_full_data = routeData;
          } else {
          }
        } catch (error) {
          // Continue without route data - it's not critical
        }
      }
      setData(transformedTransport);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  }, [transportId, options.skip]);
  // Initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTransportById();
    }, 100);
    return () => clearTimeout(timer);
  }, [fetchTransportById]);
  return {
    data,
    isLoading,
    isFetching,
    error,
    refetch: fetchTransportById,
  };
};
// Custom hook for getting driver's assigned transports (for My Transports page)
export const useGetDriverTransportsQuery = (options = {}) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);
  const fetchDriverTransports = useCallback(async () => {
    if (options.skip) return;
    setIsFetching(true);
    setError(null);
    try {
      const token = await waitForAuthToken();
      const driverId = await AsyncStorage.getItem('driverId');
      let response;
      let endpointUsed = '';
      // Primary: Use driver-specific endpoint (should return ALL driver's transports)
      if (driverId) {
        response = await fetch(`${BASE_URL}transport/driver/${driverId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
        });
        endpointUsed = 'driver-specific';
        // If driver-specific fails, try assigned-transports
        if (!response.ok) {
          response = await fetch(`${BASE_URL}assigned-transports/`, {
            method: 'GET',
            headers: {
              'Authorization': `Token ${token}`,
              'Content-Type': 'application/json',
            },
          });
          endpointUsed = 'assigned-transports';
          // If both fail, try general transports as last resort
          if (!response.ok) {
            response = await fetch(`${BASE_URL}transports`, {
              method: 'GET',
              headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json',
              },
            });
            endpointUsed = 'general-transports';
            if (!response.ok) {
              const errorData = await response.text();
              throw new Error(`All endpoints failed. Last: ${endpointUsed} - HTTP ${response.status}: ${errorData}`);
            }
          }
        }
      } else {
        throw new Error('Driver ID not found in storage');
      }
      const transportData = await response.json();
      // Handle different response structures from different endpoints
      let transports = [];
      if (endpointUsed === 'driver-specific') {
        // Response from /transport/driver/{driver_id}
        if (transportData.transports && Array.isArray(transportData.transports)) {
          transports = transportData.transports;
        } else if (Array.isArray(transportData)) {
          transports = transportData;
        }
      } else if (endpointUsed === 'assigned-transports') {
        if (transportData.assigned_transports && Array.isArray(transportData.assigned_transports)) {
          // Response with full transport objects
          transports = transportData.assigned_transports;
        } else if (transportData.id_transports && Array.isArray(transportData.id_transports)) {
          // Response with transport IDs only - need to fetch details
          const transportIds = transportData.id_transports;
          const transportPromises = transportIds.map(async (transportId) => {
            try {
              const transportResponse = await fetch(`${BASE_URL}transports/${transportId}`, {
                method: 'GET',
                headers: {
                  'Authorization': `Token ${token}`,
                  'Content-Type': 'application/json',
                },
              });
              if (transportResponse.ok) {
                return await transportResponse.json();
              }
              return null;
            } catch (error) {
              return null;
            }
          });
          const transportDetails = await Promise.all(transportPromises);
          transports = transportDetails.filter(transport => transport !== null);
        }
      } else {
        // General transports endpoint
        if (transportData.transports && Array.isArray(transportData.transports)) {
          transports = transportData.transports;
        } else if (Array.isArray(transportData)) {
          transports = transportData;
        }
      }
      // Transform all transports
      const transformedTransports = transports.map(transport => {
        const isFinished = transport.is_finished ||
                          transport.status === 'completed' ||
                          transport.status === 'finished' ||
                          transport.status === 'delivered' ||
                          false;
        return {
          id: transport.id,
          origin: transport.origin || 'N/A',
          destination: transport.destination || transport.email_destinatar || 'N/A',
          status: transport.status || transport.status_transport || 'not_started',
          is_finished: isFinished,
          email_expeditor: transport.email_expeditor,
          email_destinatar: transport.email_destinatar,
          pickup_date: transport.pickup_date,
          delivery_date: transport.delivery_date,
          cargo_details: transport.cargo_details,
          dispatcher: transport.dispatcher,
          truck: transport.truck,
          trailer: transport.trailer,
          // Route fields (backend doesn't have 'route' field anymore)
          route_id: transport.route_id,
          route_distance: transport.route_distance,
          route_travel_time: transport.route_travel_time,
          route_toll_costs: transport.route_toll_costs,
          route_polyline: transport.route_polyline,
          route_calculated_at: transport.route_calculated_at,
          company: transport.company,
          created_at: transport.created_at,
          updated_at: transport.updated_at,
          // Status fields for the UI
          status_truck: transport.status_truck || (isFinished ? 'completed' : 'not started'),
          status_goods: transport.status_goods || (isFinished ? 'completed' : 'not started'),
          status_trailer: transport.status_trailer || (isFinished ? 'completed' : 'not started'),
          status_transport: transport.status_transport || (isFinished ? 'completed' : 'not started'),
          status_coupling: transport.status_coupling || (isFinished ? 'completed' : 'not started'),
          status_loaded_truck: transport.status_loaded_truck || (isFinished ? 'completed' : 'not started'),
          delay_estimation: transport.delay_estimation,
          // Additional transformed fields for UI
          truck_combination: `Truck #${transport.truck || 'N/A'} + Trailer #${transport.trailer || 'N/A'}`,
        };
      });
      // Separate active and completed transports
      const activeTransports = transformedTransports.filter(t => !t.is_finished);
      const completedTransports = transformedTransports.filter(t => t.is_finished);
      setData({
        allTransports: transformedTransports,
        activeTransports: activeTransports,
        completedTransports: completedTransports,
        totalTransports: transformedTransports.length,
        activeCount: activeTransports.length,
        completedCount: completedTransports.length,
      });
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  }, [options.skip]);
  // Initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDriverTransports();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchDriverTransports]);
  return {
    data,
    isLoading,
    isFetching,
    error,
    refetch: fetchDriverTransports,
  };
};
// Custom hook for getting total transports count for profile
export const useGetTotalTransportsQuery = (options = {}) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);
  const fetchTotalTransports = useCallback(async () => {
    if (options.skip) return;
    setIsFetching(true);
    setError(null);
    try {
      const token = await waitForAuthToken();
      const response = await fetch(`${BASE_URL}active-transports`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        const errorData = await response.text();
        // Create user-friendly error message
        const userFriendlyMessage = getUserFriendlyErrorMessage(response.status);
        const error = new Error(userFriendlyMessage);
        error.status = response.status;
        error.originalMessage = errorData;
        throw error;
      }
      const transportData = await response.json();
      setData({
        totalTransports: transportData.number_of_active_transports || (transportData.active_transports || []).length,
        allTransports: transportData.active_transports || []
      });
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  }, [options.skip]);
  // Initial load with longer delay
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTotalTransports();
    }, 600); // Even longer delay for this one
    return () => clearTimeout(timer);
  }, [fetchTotalTransports]);
  return {
    data,
    isLoading,
    isFetching,
    error,
    refetch: fetchTotalTransports,
  };
};
// ===============================
// QUEUE TRANSPORT SYSTEM HOOKS
// ===============================
// Custom hook for getting driver's transport queue
export const useGetDriverQueueQuery = (options = {}) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);
  const fetchDriverQueue = useCallback(async () => {
    if (options.skip) return;
    setIsFetching(true);
    setError(null);
    try {
      const token = await waitForAuthToken();
      const response = await fetch(`${BASE_URL}queue/my-queue/`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        const errorData = await response.text();
        if (response.status === 401) {
          const isTokenValid = await verifyTokenValidity(token);
          if (!isTokenValid) {
            await AsyncStorage.multiRemove([
              'authToken', 'driverId', 'userName', 'userCompany', 'isDriver', 'isDispatcher'
            ]);
          }
        }
        // Create user-friendly error message
        const userFriendlyMessage = getUserFriendlyErrorMessage(response.status);
        const error = new Error(userFriendlyMessage);
        error.status = response.status;
        error.originalMessage = errorData;
        throw error;
      }
      const queueData = await response.json();
      // Transform queue data for better UI handling
      const transformedQueue = (queueData.queue || []).map(transport => ({
        id: transport.transport_id,
        queue_position: transport.queue_position,
        can_start: transport.can_start,
        is_current: transport.is_current,
        status: transport.status || transport.transport_status,
        expeditor_email: transport.expeditor_email,
        // Add other transport details if available
        ...transport
      }));
      const finalData = {
        queue_count: queueData.queue_count || 0,
        next_transport_id: queueData.next_transport_id,
        current_transport_id: queueData.current_transport_id,
        has_transportable: queueData.has_transportable || false,
        queue: transformedQueue,
        raw_response: queueData
      };
      setData(finalData);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  }, [options.skip]);
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDriverQueue();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchDriverQueue]);
  return {
    data,
    isLoading,
    isFetching,
    error,
    refetch: fetchDriverQueue,
  };
};
// Custom hook for starting next transport in queue
export const useStartNextTransportMutation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const startNextTransport = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = await waitForAuthToken();
      const response = await fetch(`${BASE_URL}queue/start-next/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        const errorData = await response.text();
        if (response.status === 401) {
          // Token validation logic here if needed
        }
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }
      const data = await response.json();
      setIsLoading(false);
      return data;
    } catch (err) {
      setIsLoading(false);
      setError(err);
      throw err;
    }
  }, []);
  const startNextTransportMutation = useCallback(() => {
    const promise = startNextTransport();
    promise.unwrap = () => promise;
    return promise;
  }, [startNextTransport]);
  return [startNextTransportMutation, { isLoading, error }];
};
// Custom hook for getting next available transport
export const useGetNextTransportQuery = (options = {}) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);
  const fetchNextTransport = useCallback(async () => {
    if (options.skip) return;
    setIsFetching(true);
    setError(null);
    try {
      const token = await waitForAuthToken();
      const response = await fetch(`${BASE_URL}queue/next-transport/`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        const errorData = await response.text();
        // Create user-friendly error message
        const userFriendlyMessage = getUserFriendlyErrorMessage(response.status);
        const error = new Error(userFriendlyMessage);
        error.status = response.status;
        error.originalMessage = errorData;
        throw error;
      }
      const nextTransportData = await response.json();
      setData(nextTransportData);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  }, [options.skip]);
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchNextTransport();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchNextTransport]);
  return {
    data,
    isLoading,
    isFetching,
    error,
    refetch: fetchNextTransport,
  };
};