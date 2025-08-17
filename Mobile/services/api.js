import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../utils/BASE_URL.js';

const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: async (headers, { getState }) => {
    // Get token from AsyncStorage for mobile apps
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      headers.set('authorization', `Token ${token}`);
    }
    headers.set('content-type', 'application/json');
    return headers;
  },
});

// Base query with error handling and token refresh
const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);
  
  // Handle 401 - token expired
  if (result.error && result.error.status === 401) {
    console.log('Token expired, clearing auth data');
    // Clear auth data
    await AsyncStorage.multiRemove([
      'authToken',
      'driverId',
      'userName',
      'userCompany',
      'isDriver',
      'isDispatcher'
    ]);
    // You could also dispatch a logout action here
  }
  
  return result;
};

export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'User',
    'Profile',
    'Driver',
    'Transport',
    'Vehicle',
    'Document',
    'PersonalDocument',
    'DriverDocument',
    'TransportDocument'
  ],
  endpoints: () => ({}), // We'll inject endpoints in separate files
});
