// Create a new file: Mobile/services/statusUpdateService.js
import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../utils/BASE_URL.js';

// Custom hook for updating driver status
export const useUpdateDriverStatusMutation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateDriverStatus = useCallback(async (statusData) => {
    setIsLoading(true);
    setError(null);

    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        throw new Error('No auth token found');
      }

      console.log('Updating driver status with:', statusData);
      console.log('API URL:', `${BASE_URL}status/`);
      
      const response = await fetch(`${BASE_URL}status/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(statusData),
      });

      console.log('Update driver status response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.text();
        console.log('Update driver status error response:', errorData);
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }

      // Handle response - some endpoints might return empty response
      let data;
      const responseText = await response.text();
      if (responseText) {
        data = JSON.parse(responseText);
      } else {
        data = { success: true, status: 'updated' };
      }
      
      console.log('Driver status updated successfully:', data);
      
      setIsLoading(false);
      return data;
    } catch (err) {
      console.error('Driver status update error:', err);
      setIsLoading(false);
      setError(err);
      throw err;
    }
  }, []);

  // Return the mutation function with unwrap method
  const updateDriverStatusMutation = useCallback((variables) => {
    const promise = updateDriverStatus(variables);
    promise.unwrap = () => promise;
    return promise;
  }, [updateDriverStatus]);

  return [updateDriverStatusMutation, { isLoading, error }];
};

// Alternative hook if you need to send specific format based on your API
export const useChangeDriverStatusMutation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const changeDriverStatus = useCallback(async ({ on_road }) => {
    setIsLoading(true);
    setError(null);

    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        throw new Error('No auth token found');
      }

      // Prepare the payload based on your Postman example
      const payload = {
        "driver": {
          "on_road": on_road
        }
      };

      console.log('Changing driver status with payload:', payload);
      console.log('API URL:', `${BASE_URL}status/`);
      
      const response = await fetch(`${BASE_URL}status/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('Change driver status response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.text();
        console.log('Change driver status error response:', errorData);
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }

      let data;
      const responseText = await response.text();
      if (responseText) {
        data = JSON.parse(responseText);
      } else {
        data = { success: true, on_road: on_road };
      }
      
      console.log('Driver status changed successfully:', data);
      
      setIsLoading(false);
      return data;
    } catch (err) {
      console.error('Driver status change error:', err);
      setIsLoading(false);
      setError(err);
      throw err;
    }
  }, []);

  // Return the mutation function with unwrap method
  const changeDriverStatusMutation = useCallback((variables) => {
    const promise = changeDriverStatus(variables);
    promise.unwrap = () => promise;
    return promise;
  }, [changeDriverStatus]);

  return [changeDriverStatusMutation, { isLoading, error }];
};