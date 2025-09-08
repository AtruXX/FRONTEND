// services/transportService.js - Fixed version with better error handling
import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../utils/BASE_URL.js';

// Helper function to wait for auth token with retries
const waitForAuthToken = async (maxRetries = 5, delay = 200) => {
  for (let i = 0; i < maxRetries; i++) {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      console.log(`✅ Auth token found on attempt ${i + 1}:`, `${token.substring(0, 10)}...`);
      return token;
    }
    console.log(`⏳ Waiting for auth token, attempt ${i + 1}/${maxRetries}`);
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
    console.log('Token verification failed:', error);
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
      console.log('🚛 Starting transport fetch...');
      
      // Wait for auth token to be available
      const token = await waitForAuthToken();
      
      // Double-check we have driver ID too
      const driverId = await AsyncStorage.getItem('driverId');
      if (!driverId) {
        console.warn('⚠️ No driver ID found, but proceeding with token');
      }

      console.log('🔑 Using token for transport request');
      console.log('👤 Driver ID:', driverId);
      
      const response = await fetch(`${BASE_URL}active-transports`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Transports response status:', response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('❌ Transports error response:', errorData);
        
        if (response.status === 401) {
          console.error('🚫 Authentication failed for transports');
          
          // Before clearing token, verify it's actually invalid
          const isTokenValid = await verifyTokenValidity(token);
          if (!isTokenValid) {
            console.error('🗑️ Token verified as invalid, clearing storage');
            await AsyncStorage.multiRemove([
              'authToken', 'driverId', 'userName', 'userCompany', 'isDriver', 'isDispatcher'
            ]);
          } else {
            console.log('🤔 Token seems valid, this might be an endpoint-specific issue');
          }
        }
        
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }

      const transportData = await response.json();
      console.log('📦 Transports data received:', transportData);

      // Handle new API structure with active_transports array
      const rawTransports = transportData.active_transports || [];
      
      // Filter only non-finished transports (is_finished: false)
      const activeTransports = rawTransports.filter(transport => 
        !transport.is_finished
      );

      console.log(`🎯 Filtered ${activeTransports.length} active transports from ${rawTransports.length} total`);

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
        route: transport.route
      }));

      console.log('✅ Transport data processed successfully');

      // Store all transports (for profile count) and filtered transports
      setData({ 
        transports: transformedTransports,
        allTransports: rawTransports,
        totalTransports: rawTransports.length,
        numberOfActiveTransports: transportData.number_of_active_transports || rawTransports.length
      });
    } catch (err) {
      console.error('💥 Transports fetch error:', err);
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
      console.log('🎯 Setting active transport:', transportId);
      
      // Wait for auth token to be available
      const token = await waitForAuthToken();
      
      const response = await fetch(`${BASE_URL}set-active-transport/${transportId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Set active transport response status:', response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('❌ Set active transport error response:', errorData);
        
        if (response.status === 401) {
          console.error('🚫 Authentication failed for set active transport');
          // Don't clear token here, let other parts handle it
        }
        
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }

      const data = await response.json();
      console.log('✅ Active transport set successfully:', data);

      setIsLoading(false);
      return data;
    } catch (err) {
      console.error('💥 Set active transport error:', err);
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
      console.log('🏁 Finalizing transport:', activeTransportId);
      
      const token = await waitForAuthToken();
      
      const response = await fetch(`${BASE_URL}finish-transport/${activeTransportId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Finalize transport response status:', response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('❌ Finalize transport error response:', errorData);
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }

      const data = await response.json();
      console.log('✅ Transport finalized successfully:', data);

      setIsLoading(false);
      return data;
    } catch (err) {
      console.error('💥 Finalize transport error:', err);
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
    console.log(`🔍 useGetTransportByIdQuery called with:`, {
      transportId,
      skipOption: options.skip,
      shouldSkip: !transportId || options.skip
    });

    if (!transportId || options.skip) {
      console.log('⏭️ Skipping transport fetch:', { transportId, skip: options.skip });
      return;
    }

    console.log('🚀 Starting transport by ID fetch process...');
    setIsFetching(true);
    setError(null);

    try {
      console.log(`🎯 Fetching transport by ID: ${transportId}`);
      console.log(`📍 Full endpoint URL: ${BASE_URL}transports/${transportId}`);
      
      const token = await waitForAuthToken();
      console.log(`🔑 Got auth token for transport request: ${token?.substring(0, 10)}...`);
      
      const response = await fetch(`${BASE_URL}transports?id=${transportId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Transport by ID response status:', response.status);
      console.log('📡 Transport by ID response headers:', Object.fromEntries(response.headers));

      if (!response.ok) {
        const errorData = await response.text();
        console.error('❌ Transport by ID error response:', errorData);
        
        if (response.status === 401) {
          console.error('🚫 Authentication failed for transport by ID');
          
          // Before clearing token, verify it's actually invalid
          const isTokenValid = await verifyTokenValidity(token);
          if (!isTokenValid) {
            console.error('🗑️ Token verified as invalid, clearing storage');
            await AsyncStorage.multiRemove([
              'authToken', 'driverId', 'userName', 'userCompany', 'isDriver', 'isDispatcher'
            ]);
          }
        }
        
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }

      const responseData = await response.json();
      console.log('📦 Transport by ID RAW response received:', responseData);
      
      // Handle both single transport and array responses
      let transport;
      if (Array.isArray(responseData)) {
        console.log('📋 Response is array, looking for transport with ID:', transportId);
        transport = responseData.find(t => t.id === parseInt(transportId));
        if (!transport) {
          throw new Error(`Transport with ID ${transportId} not found in response`);
        }
      } else if (responseData.transports && Array.isArray(responseData.transports)) {
        console.log('📋 Response has transports array, looking for transport with ID:', transportId);
        transport = responseData.transports.find(t => t.id === parseInt(transportId));
        if (!transport) {
          throw new Error(`Transport with ID ${transportId} not found in transports array`);
        }
      } else {
        // Assume single transport object
        transport = responseData;
      }
      
      console.log('📋 Transport details breakdown:', {
        id: transport.id,
        status: transport.status,
        is_finished: transport.is_finished,
        company: transport.company,
        dispatcher: transport.dispatcher,
        driver: transport.driver,
        truck: transport.truck,
        trailer: transport.trailer,
        email_destinatar: transport.email_destinatar,
        route: transport.route
      });

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
        route: transport.route
      };

      console.log('✅ Transport by ID data processed successfully');
      console.log('🔄 Transformed transport data:', transformedTransport);
      setData(transformedTransport);
    } catch (err) {
      console.error('💥 Transport by ID fetch error:', err);
      setError(err);
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  }, [transportId, options.skip]);

  // Initial load
  useEffect(() => {
    console.log('⏰ useEffect triggered in useGetTransportByIdQuery', {
      transportId,
      currentData: data,
      currentError: error,
      isCurrentlyLoading: isLoading
    });
    
    const timer = setTimeout(() => {
      console.log('🔄 Timer fired, calling fetchTransportById...');
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
      console.log('📊 Fetching total transports...');
      
      const token = await waitForAuthToken();
      
      const response = await fetch(`${BASE_URL}active-transports`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Total transports response status:', response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('❌ Total transports error response:', errorData);
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }

      const transportData = await response.json();
      console.log('📦 Total transports data received:', transportData);

      setData({ 
        totalTransports: transportData.number_of_active_transports || (transportData.active_transports || []).length,
        allTransports: transportData.active_transports || []
      });
    } catch (err) {
      console.error('💥 Total transports fetch error:', err);
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