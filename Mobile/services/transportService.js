// services/transportService.js
import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../utils/BASE_URL.js';

// Debug function to check auth state
const checkAuthState = async () => {
  const token = await AsyncStorage.getItem('authToken');
  const driverId = await AsyncStorage.getItem('driverId');
  const userName = await AsyncStorage.getItem('userName');
  
  console.log('=== AUTH STATE DEBUG ===');
  console.log('Token:', token ? `${token.substring(0, 10)}...` : 'null');
  console.log('Driver ID:', driverId);
  console.log('User Name:', userName);
  console.log('========================');
  
  return { token, driverId, userName };
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
      // Add small delay to ensure token is fully stored
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        console.error('No auth token found in AsyncStorage');
        throw new Error('No auth token found');
      }

      const driverId = await AsyncStorage.getItem('driverId');
      if (!driverId) {
        console.error('No driver ID found in AsyncStorage');
        throw new Error('No driver ID found');
      }

      console.log('Using same pattern as profile service...');
      console.log('Token for transport request:', token);
      console.log('Fetching transports for driver:', driverId);
      
      // Test: First verify token works with profile endpoint
      const profileHeaders = {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
      };
     
      const response = await fetch(`${BASE_URL}assigned-transports`, {
        method: 'GET',
        headers: profileHeaders,  
      });

      console.log('Transports response status:', response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.log('Transports error response:', errorData);
        
       
        
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }

      const transportData = await response.json();
      console.log('Transports data received:', transportData);

      // Filter only non-finished transports (is_finished: false)
      const activeTransports = transportData.transports?.filter(transport => 
        !transport.is_finished
      ) || [];

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

      // Store all transports (for profile count) and filtered transports
      setData({ 
        transports: transformedTransports,
        allTransports: transportData.transports || [],
        totalTransports: (transportData.transports || []).length
      });
    } catch (err) {
      console.error('Transports fetch error:', err);
      setError(err);
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  }, [options.skip]);

  // Initial load
  useEffect(() => {
    fetchTransports();
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
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        console.error('No auth token found in AsyncStorage');
        throw new Error('No auth token found');
      }

      console.log('Token found:', token ? `${token.substring(0, 10)}...` : 'null');
      console.log('Setting active transport:', transportId);
      const response = await fetch(`${BASE_URL}set-active-transport/${transportId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Set active transport response status:', response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.log('Set active transport error response:', errorData);
        
        // If it's a 401 error, token might be invalid or expired
        if (response.status === 401) {
          console.log('Authentication failed - token might be expired');
          // Note: authToken should only be cleared on explicit logout, not on 401 errors
        }
        
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }

      const data = await response.json();
      console.log('Active transport set successfully:', data);

      setIsLoading(false);
      return data;
    } catch (err) {
      console.error('Set active transport error:', err);
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
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        throw new Error('No auth token found');
      }

      console.log('Finalizing transport:', activeTransportId);
      const response = await fetch(`${BASE_URL}finish-transport/${activeTransportId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Finalize transport response status:', response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.log('Finalize transport error response:', errorData);
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }

      const data = await response.json();
      console.log('Transport finalized successfully:', data);

      setIsLoading(false);
      return data;
    } catch (err) {
      console.error('Finalize transport error:', err);
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
      // Add small delay to ensure token is fully stored
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Debug auth state first
      const token = await AsyncStorage.getItem('authToken');
      console.log(token);
      const response = await fetch(`${BASE_URL}assigned-transports`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Total transports response status:', response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.log('Total transports error response:', errorData);
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }

      const transportData = await response.json();
      console.log('Total transports data received:', transportData);

      setData({ 
        totalTransports: (transportData.transports || []).length,
        allTransports: transportData.transports || []
      });
    } catch (err) {
      console.error('Total transports fetch error:', err);
      setError(err);
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  }, [options.skip]);

  // Initial load
  useEffect(() => {
    fetchTotalTransports();
  }, [fetchTotalTransports]);

  return {
    data,
    isLoading,
    isFetching,
    error,
    refetch: fetchTotalTransports,
  };
};