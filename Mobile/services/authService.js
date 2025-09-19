// services/authService.js - Fixed version with better token handling
import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../utils/BASE_URL.js';

// Helper function to store data with verification
const storeWithVerification = async (key, value) => {
  await AsyncStorage.setItem(key, value);
  // Verify it was stored
  const stored = await AsyncStorage.getItem(key);
  if (stored !== value) {
    await AsyncStorage.setItem(key, value);
  }
};

// Custom hook for login mutation
export const useLoginMutation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = useCallback(async ({ phone_number, password }) => {
    setIsLoading(true);
    setError(null);

    try {
      
      const response = await fetch(`${BASE_URL}auth/token/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone_number, password }),
      });


      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }

      const data = await response.json();

      // Store token FIRST and verify it
      if (data.auth_token) {
        await storeWithVerification('authToken', data.auth_token);
        
        // Small delay to ensure storage completion
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Verify token was stored correctly
        const verifyToken = await AsyncStorage.getItem('authToken');
        if (!verifyToken) {
          throw new Error('Failed to store auth token');
        }

        // Now fetch profile with the verified token
        try {
          const profileResponse = await fetch(`${BASE_URL}profile/`, {
            method: 'GET',
            headers: {
              'Authorization': `Token ${data.auth_token}`,
              'Content-Type': 'application/json',
            },
          });

          if (profileResponse.ok) {
            const profileData = await profileResponse.json();

            // Store profile data sequentially with verification
            const profileStorage = [
              { key: 'driverId', value: profileData.id?.toString() },
              { key: 'userName', value: profileData.name },
              { key: 'userCompany', value: profileData.company },
              { key: 'isDriver', value: profileData.is_driver?.toString() },
              { key: 'isDispatcher', value: profileData.is_dispatcher?.toString() }
            ];

            // Store each item with verification
            for (const item of profileStorage) {
              if (item.value) {
                await storeWithVerification(item.key, item.value);
              }
            }

            // Final verification of all stored data
            const finalVerification = await AsyncStorage.multiGet([
              'authToken', 'driverId', 'userName', 'userCompany', 'isDriver', 'isDispatcher'
            ]);
            
            
          } else {
          }
        } catch (profileError) {
          // Don't fail the login if profile fetch fails
        }
      } else {
        throw new Error('No auth token received');
      }

      setIsLoading(false);
      return data;
    } catch (err) {
      setIsLoading(false);
      setError(err);
      throw err;
    }
  }, []);

  // Return the mutation function with unwrap method
  const loginMutation = useCallback((variables) => {
    const promise = login(variables);
    promise.unwrap = () => promise;
    return promise;
  }, [login]);

  return [loginMutation, { isLoading, error }];
};

// Custom hook for profile query with better error handling
export const useGetProfileQuery = (arg, options = {}) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);

  const fetchProfile = useCallback(async () => {
    if (options.skip) return;

    setIsFetching(true);
    setError(null);

    try {
      // Wait a bit for token to be available after login
      let token = await AsyncStorage.getItem('authToken');
      let retries = 0;
      
      while (!token && retries < 5) {
        await new Promise(resolve => setTimeout(resolve, 200));
        token = await AsyncStorage.getItem('authToken');
        retries++;
      }

      if (!token) {
        throw new Error('No auth token found after waiting');
      }

      const response = await fetch(`${BASE_URL}profile/`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });


      if (!response.ok) {
        const errorData = await response.text();
        
        if (response.status === 401) {
          // Token is invalid, clear it
          await AsyncStorage.removeItem('authToken');
        }
        
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }

      const profileData = await response.json();

      // Store profile data with verification (but don't fail if storage fails)
      try {
        const profileStorage = [
          { key: 'driverId', value: profileData.id?.toString() },
          { key: 'userName', value: profileData.name },
          { key: 'userCompany', value: profileData.company },
          { key: 'isDriver', value: profileData.is_driver?.toString() },
          { key: 'isDispatcher', value: profileData.is_dispatcher?.toString() }
        ];

        for (const item of profileStorage) {
          if (item.value) {
            await storeWithVerification(item.key, item.value);
          }
        }
      } catch (storageError) {
      }

      setData(profileData);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  }, [options.skip]);

  // Initial load
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

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
          const response = await fetch(`${BASE_URL}auth/token/logout`, {
            method: 'POST',
            headers: {
              'Authorization': `Token ${token}`,
              'Content-Type': 'application/json',
            },
          });
        } catch (logoutError) {
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

      // Verify storage was cleared
      const verification = await AsyncStorage.multiGet([
        'authToken', 'driverId', 'userName'
      ]);

      setIsLoading(false);
      return { success: true };
    } catch (err) {
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

      const response = await fetch(`${BASE_URL}profile/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });


      if (!response.ok) {
        const errorData = await response.text();
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
      const response = await fetch(`${BASE_URL}accounts/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });


      if (!response.ok) {
        const errorData = await response.text();
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

  // Return the mutation function with unwrap method
  const createAccountMutation = useCallback((variables) => {
    const promise = createAccount(variables);
    promise.unwrap = () => promise;
    return promise;
  }, [createAccount]);

  return [createAccountMutation, { isLoading, error }];
};

// Transport service hook with better error handling
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

      const response = await fetch(`${BASE_URL}transports?driver_id=${driverId}`, {
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

      const transportData = await response.json();
      setData(transportData);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [driverId, options.skip]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTransport();
    }, 100);

    return () => clearTimeout(timer);
  }, [fetchTransport]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchTransport,
  };
};