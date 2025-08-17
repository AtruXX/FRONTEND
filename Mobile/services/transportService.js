// services/transportService.js
import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../utils/BASE_URL.js';

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
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        throw new Error('No auth token found');
      }

      console.log('Fetching transports');
      const response = await fetch(`${BASE_URL}transports`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Transports response status:', response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.log('Transports error response:', errorData);
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }

      const transportData = await response.json();
      console.log('Transports data received:', transportData);

      // Filter only assigned transports ("atribuit" status)
      const assignedTransports = transportData.transports?.filter(transport => 
        transport.status === 'atribuit' && !transport.is_finished
      ) || [];

      // Transform the API data to match the component structure
      const transformedTransports = assignedTransports.map(transport => ({
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

      setData({ transports: transformedTransports });
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

// Note: Driver profile functionality moved to profileService.js
// Use useGetUserProfileQuery from profileService instead

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
        throw new Error('No auth token found');
      }

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