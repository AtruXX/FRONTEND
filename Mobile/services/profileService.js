// services/profileService.js - FIXED VERSION
import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../utils/BASE_URL.js';

// Custom hook for getting user profile (driver info)
export const useGetUserProfileQuery = (options = {}) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);

  const fetchUserProfile = useCallback(async () => {
    if (options.skip) return;

    setIsFetching(true);
    setError(null);

    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        throw new Error('No auth token found');
      }

      console.log('Fetching user profile from /profile/');
      const response = await fetch(`${BASE_URL}profile/`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('User profile response status:', response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.log('User profile error response:', errorData);
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }

      const profileData = await response.json();
      console.log('User profile data received:', profileData);

      // Store profile data in AsyncStorage (as you were doing before)
      const storagePromises = [];

      if (profileData.id) {
        storagePromises.push(
          AsyncStorage.setItem('driverId', profileData.id.toString())
        );
      }

      if (profileData.name) {
        storagePromises.push(
          AsyncStorage.setItem('userName', profileData.name)
        );
      }

      if (profileData.company) {
        storagePromises.push(
          AsyncStorage.setItem('userCompany', profileData.company)
        );
      }

      if (profileData.is_driver !== undefined) {
        storagePromises.push(
          AsyncStorage.setItem('isDriver', profileData.is_driver.toString())
        );
      }

      if (profileData.is_dispatcher !== undefined) {
        storagePromises.push(
          AsyncStorage.setItem('isDispatcher', profileData.is_dispatcher.toString())
        );
      }

      // Use sequential storage to avoid race conditions with authToken
      for (const promise of storagePromises) {
        await promise;
      }
      console.log('Profile data stored in AsyncStorage');

      // Transform profile data for easier consumption - FIXED MAPPING
      const transformedProfile = {
        id: profileData.id,
        name: profileData.name,
        email: profileData.email,
        phone_number: profileData.phone_number,
        company: profileData.company,
        is_driver: profileData.is_driver,
        is_dispatcher: profileData.is_dispatcher,
        is_admin: profileData.is_admin,
        is_active: profileData.is_active,
        license_expiration_date: profileData.license_expiration_date,
        last_login: profileData.last_login,
        hire_date: profileData.hire_date,
        dob: profileData.dob,
        
        // Driver specific data - FIXED TO USE CORRECT FIELD NAMES
        driver: profileData.driver ? {
          average_rating: profileData.driver.average_rating,
          on_road: profileData.driver.on_road,
          active_transport_id: profileData.driver.active_transport_id, // THIS IS THE CORRECT FIELD
          id_transports: profileData.driver.id_transports
        } : null,
        
        // Dispatcher specific data
        dispatcher: profileData.dispatcher,
        
        // Computed fields for easier UI consumption
        role: profileData.is_driver ? "Driver" : (profileData.is_dispatcher ? "Dispatcher" : "User"),
        initials: profileData.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '',
        
        // FIXED: Use the correct field name from API response
        active_transport: profileData.driver?.active_transport_id || null,
        on_road: profileData.driver?.on_road || false,
      };

      console.log('🔧 FIXED: Active transport ID from profile:', transformedProfile.active_transport);
      setData(transformedProfile);
    } catch (err) {
      console.error('User profile fetch error:', err);
      setError(err);
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  }, [options.skip]);

  // Initial load
  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  return {
    data,
    isLoading,
    isFetching,
    error,
    refetch: fetchUserProfile,
  };
};

// Custom hook for updating user profile
export const useUpdateUserProfileMutation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateUserProfile = useCallback(async (profileData) => {
    setIsLoading(true);
    setError(null);

    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        throw new Error('No auth token found');
      }

      console.log('Updating user profile with:', profileData);
      const response = await fetch(`${BASE_URL}profile`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      console.log('Update user profile response status:', response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.log('Update user profile error response:', errorData);
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }

      const data = await response.json();
      console.log('User profile updated successfully:', data);
      
      setIsLoading(false);
      return data;
    } catch (err) {
      console.error('User profile update error:', err);
      setIsLoading(false);
      setError(err);
      throw err;
    }
  }, []);

  // Return the mutation function with unwrap method
  const updateUserProfileMutation = useCallback((variables) => {
    const promise = updateUserProfile(variables);
    promise.unwrap = () => promise;
    return promise;
  }, [updateUserProfile]);

  return [updateUserProfileMutation, { isLoading, error }];
};