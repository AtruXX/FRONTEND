// services/authService.js - Fixed version with proper unwrap()
import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../utils/BASE_URL.js';

// Custom hook for login mutation
export const useLoginMutation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = useCallback(async ({ phone_number, password }) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Attempting login with:', phone_number);
      console.log('URL:', `${BASE_URL}auth/token/login`);
      
      const response = await fetch(`${BASE_URL}auth/token/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone_number, password }),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.log('Error response:', errorData);
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }

      const data = await response.json();
      console.log('Login successful:', data);

      // Store token
      if (data.auth_token) {
        await AsyncStorage.setItem('authToken', data.auth_token);
        console.log('Token stored successfully');
      }

      setIsLoading(false);
      return data;
    } catch (err) {
      console.error('Login error:', err);
      setIsLoading(false);
      setError(err);
      throw err;
    }
  }, []);

  // Return the mutation function with unwrap method
  const loginMutation = useCallback((variables) => {
    const promise = login(variables);
    
    // Add unwrap method to the promise
    promise.unwrap = () => promise;
    
    return promise;
  }, [login]);

  return [loginMutation, { isLoading, error }];
};

// Custom hook for profile query
export const useGetProfileQuery = (arg, options = {}) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);

  const fetchProfile = useCallback(async () => {
    setIsFetching(true);
    setError(null);

    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        throw new Error('No auth token found');
      }

      console.log('Fetching profile with token');
      const response = await fetch(`${BASE_URL}profile/`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Profile response status:', response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.log('Profile error response:', errorData);
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }

      const profileData = await response.json();
      console.log('Profile data received:', profileData);

      // Store profile data in AsyncStorage
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

      await Promise.all(storagePromises);
      console.log('Profile data stored in AsyncStorage');

      setData(profileData);
    } catch (err) {
      console.error('Profile fetch error:', err);
      setError(err);
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchProfile();
  }, []);

  return {
    data,
    isLoading,
    isFetching,
    error,
    refetch: fetchProfile,
  };
};

// Custom hook for logout mutation
export const useLogoutMutation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const logout = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = await AsyncStorage.getItem('authToken');

      if (token) {
        try {
          console.log('Calling logout endpoint');
          const response = await fetch(`${BASE_URL}auth/token/logout`, {
            method: 'POST',
            headers: {
              'Authorization': `Token ${token}`,
              'Content-Type': 'application/json',
            },
          });
          console.log('Logout response status:', response.status);
        } catch (logoutError) {
          console.warn('Logout API call failed, but continuing with local cleanup');
        }
      }

      // Always clear storage
      await AsyncStorage.multiRemove([
        'authToken',
        'driverId',
        'userName',
        'userCompany',
        'isDriver',
        'isDispatcher'
      ]);

      console.log('Auth data cleared from storage');
      setIsLoading(false);
      return { success: true };
    } catch (err) {
      console.error('Logout error:', err);
      setIsLoading(false);
      setError(err);
      throw err;
    }
  }, []);

  // Return the mutation function with unwrap method
  const logoutMutation = useCallback(() => {
    const promise = logout();
    promise.unwrap = () => promise;
    return promise;
  }, [logout]);

  return [logoutMutation, { isLoading, error }];
};

// Custom hook for update profile mutation
export const useUpdateProfileMutation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateProfile = useCallback(async (profileData) => {
    setIsLoading(true);
    setError(null);

    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        throw new Error('No auth token found');
      }

      console.log('Updating profile with:', profileData);
      const response = await fetch(`${BASE_URL}profile/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      console.log('Update profile response status:', response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.log('Update profile error response:', errorData);
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }

      const data = await response.json();
      console.log('Profile updated successfully:', data);
      
      setIsLoading(false);
      return data;
    } catch (err) {
      console.error('Profile update error:', err);
      setIsLoading(false);
      setError(err);
      throw err;
    }
  }, []);

  // Return the mutation function with unwrap method
  const updateProfileMutation = useCallback((variables) => {
    const promise = updateProfile(variables);
    promise.unwrap = () => promise;
    return promise;
  }, [updateProfile]);

  return [updateProfileMutation, { isLoading, error }];
};

// Dummy hook for create account
export const useCreateAccountMutation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const createAccount = useCallback(async (userData) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Creating account with:', userData);
      const response = await fetch(`${BASE_URL}accounts/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      console.log('Create account response status:', response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.log('Create account error response:', errorData);
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }

      const data = await response.json();
      setIsLoading(false);
      return data;
    } catch (err) {
      console.error('Create account error:', err);
      setIsLoading(false);
      setError(err);
      throw err;
    }
  }, []);

  // Return the mutation function with unwrap method
  const createAccountMutation = useCallback((variables) => {
    const promise = createAccount(variables);
    promise.unwrap = () => promise;
    return promise;
  }, [createAccount]);

  return [createAccountMutation, { isLoading, error }];
};

// Transport service hooks (simplified)
export const useGetTransportByDriverIdQuery = (driverId, options = {}) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTransport = useCallback(async () => {
    if (!driverId || options.skip) return;

    setIsLoading(true);
    setError(null);

    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        throw new Error('No auth token found');
      }

      console.log(`Fetching transport for driver ${driverId}`);
      const response = await fetch(`${BASE_URL}transports?driver_id=${driverId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Transport response status:', response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.log('Transport error response:', errorData);
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }

      const transportData = await response.json();
      console.log('Transport data received:', transportData);
      setData(transportData);
    } catch (err) {
      console.error('Transport fetch error:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [driverId, options.skip]);

  useEffect(() => {
    fetchTransport();
  }, [fetchTransport]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchTransport,
  };
};