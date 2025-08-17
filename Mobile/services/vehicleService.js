// services/vehicleService.js
import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../utils/BASE_URL.js';

// Custom hook for getting specific transport details using transport ID
export const useGetActiveTransportQuery = (transportId, options = {}) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);

  const fetchActiveTransport = useCallback(async () => {
    if (options.skip || !transportId) return;

    setIsFetching(true);
    setError(null);

    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        throw new Error('No auth token found');
      }

      console.log('Fetching transport details for ID:', transportId);
      // First, let's try to get all transports and filter for our specific transport
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

      const transportsData = await response.json();
      console.log('Transports data received:', transportsData);

      // Find the specific transport by ID
      let specificTransport = null;
      if (transportsData.transports && Array.isArray(transportsData.transports)) {
        specificTransport = transportsData.transports.find(transport => transport.id === transportId);
      }

      if (!specificTransport) {
        throw new Error(`Transport with ID ${transportId} not found`);
      }

      console.log('Active transport found:', specificTransport);
      setData(specificTransport);
    } catch (err) {
      console.error('Active transport fetch error:', err);
      setError(err);
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  }, [transportId, options.skip]);

  // Initial load
  useEffect(() => {
    fetchActiveTransport();
  }, [fetchActiveTransport]);

  return {
    data,
    isLoading,
    isFetching,
    error,
    refetch: fetchActiveTransport,
  };
};

// Custom hook for getting truck details
export const useGetTruckQuery = (truckId, options = {}) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);

  const fetchTruck = useCallback(async () => {
    if (options.skip || !truckId) return;

    setIsFetching(true);
    setError(null);

    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        throw new Error('No auth token found');
      }

      console.log('Fetching truck details for ID:', truckId);
      const response = await fetch(`${BASE_URL}trucks/${truckId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Truck response status:', response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.log('Truck error response:', errorData);
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }

      const truckData = await response.json();
      console.log('Truck data received:', truckData);

      // Get the first truck from the array
      const truck = Array.isArray(truckData) ? truckData[0] : truckData;
      setData(truck);
    } catch (err) {
      console.error('Truck fetch error:', err);
      setError(err);
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  }, [truckId, options.skip]);

  // Initial load
  useEffect(() => {
    fetchTruck();
  }, [fetchTruck]);

  return {
    data,
    isLoading,
    isFetching,
    error,
    refetch: fetchTruck,
  };
};

// Custom hook for getting truck documents
export const useGetTruckDocumentsQuery = (truckId, options = {}) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);

  const fetchTruckDocuments = useCallback(async () => {
    if (options.skip || !truckId) return;

    setIsFetching(true);
    setError(null);

    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        throw new Error('No auth token found');
      }

      console.log('Fetching truck documents for ID:', truckId);
      const response = await fetch(`${BASE_URL}truck-documents/${truckId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Truck documents response status:', response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.log('Truck documents error response:', errorData);
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }

      const documentsData = await response.json();
      console.log('Truck documents data received:', documentsData);

      setData(documentsData);
    } catch (err) {
      console.error('Truck documents fetch error:', err);
      setError(err);
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  }, [truckId, options.skip]);

  // Initial load
  useEffect(() => {
    fetchTruckDocuments();
  }, [fetchTruckDocuments]);

  return {
    data,
    isLoading,
    isFetching,
    error,
    refetch: fetchTruckDocuments,
  };
};