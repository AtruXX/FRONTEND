// services/vehicleService.js
import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../utils/BASE_URL.js';
// Custom hook for getting specific transport details using transport ID
export const useGetActiveTransportQuery = (transportId, options = {}) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(!transportId ? false : true);
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
      // First, let's try to get all transports and filter for our specific transport
      const response = await fetch(`${BASE_URL}transports`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }
      const transportsData = await response.json();
      // Find the specific transport by ID
      let specificTransport = null;
      if (transportsData.transports && Array.isArray(transportsData.transports)) {
        specificTransport = transportsData.transports.find(transport => transport.id === transportId);
      }
      if (!specificTransport) {
        throw new Error(`Transport with ID ${transportId} not found`);
      }
      setData(specificTransport);
    } catch (err) {
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
  const [isLoading, setIsLoading] = useState(!truckId ? false : true);
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
      const response = await fetch(`${BASE_URL}trucks/${truckId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }
      const truckData = await response.json();
      // Get the first truck from the array
      const truck = Array.isArray(truckData) ? truckData[0] : truckData;
      setData(truck);
    } catch (err) {
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
  const [isLoading, setIsLoading] = useState(!truckId ? false : true);
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
      const response = await fetch(`${BASE_URL}truck-documents/${truckId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }
      const documentsData = await response.json();
      setData(documentsData);
    } catch (err) {
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
// Custom hook for getting trailer details
export const useGetTrailerQuery = (trailerId, options = {}) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(!trailerId ? false : true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);
  const fetchTrailer = useCallback(async () => {
    if (options.skip || !trailerId) return;
    setIsFetching(true);
    setError(null);
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        throw new Error('No auth token found');
      }
      const response = await fetch(`${BASE_URL}trailers/${trailerId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }
      const trailerData = await response.json();
      // Get the first trailer from the array if it's an array
      const trailer = Array.isArray(trailerData) ? trailerData[0] : trailerData;
      setData(trailer);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  }, [trailerId, options.skip]);
  // Initial load
  useEffect(() => {
    fetchTrailer();
  }, [fetchTrailer]);
  return {
    data,
    isLoading,
    isFetching,
    error,
    refetch: fetchTrailer,
  };
};