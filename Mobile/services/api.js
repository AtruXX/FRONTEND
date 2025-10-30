// services/api.js - Fixed version with better performance and error handling
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../utils/BASE_URL.js';
// Enhanced base query with better performance
const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: async (headers, { getState, endpoint }) => {
    try {
      // Get token from AsyncStorage for mobile apps
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        headers.set('authorization', `Token ${token}`);
      }
      // Only set content-type for non-FormData requests
      if (endpoint !== 'uploadPersonalDocument' && endpoint !== 'uploadCMRPhotos') {
        headers.set('content-type', 'application/json');
      }
      return headers;
    } catch (error) {
      return headers;
    }
  },
  // Add timeout to prevent hanging requests
  timeout: 15000,
});
// Base query with error handling and token refresh
const baseQueryWithReauth = async (args, api, extraOptions) => {
  try {
    let result = await baseQuery(args, api, extraOptions);
    // Handle 401 - token expired
    if (result.error && result.error.status === 401) {
      // Clear auth data
      await AsyncStorage.multiRemove([
        'authToken',
        'driverId', 
        'userName',
        'userCompany',
        'isDriver',
        'isDispatcher'
      ]);
      // You could dispatch a logout action here if needed
      // api.dispatch(authSlice.actions.logout());
    }
    // Handle network errors
    if (result.error && result.error.status === 'FETCH_ERROR') {
    }
    return result;
  } catch (error) {
    return {
      error: {
        status: 'CUSTOM_ERROR',
        error: error.message,
      },
    };
  }
};
export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  // Configure caching and refetching behavior for better performance
  keepUnusedDataFor: 60, // Keep data for 60 seconds after component unmounts
  refetchOnMountOrArgChange: 30, // Refetch if data is older than 30 seconds
  refetchOnFocus: false, // Don't refetch when app comes into focus (can be slow on mobile)
  refetchOnReconnect: true, // Refetch when connection is restored
  tagTypes: [
    'User',
    'Profile', 
    'Driver',
    'Transport',
    'ActiveTransport',
    'Vehicle',
    'Truck',
    'Document',
    'PersonalDocument',
    'DriverDocument',
    'TransportDocument',
    'CMRData',
    'TruckDocument'
  ],
  endpoints: () => ({}), // We'll inject endpoints in separate files
});
// Export hooks for better performance
export const {
  // Auth endpoints will be injected
  useLoginMutation,
  useLogoutMutation,
  useCreateAccountMutation,
  // Profile endpoints
  useGetProfileQuery,
  useUpdateProfileMutation,
  // Transport endpoints
  useGetTransportByDriverIdQuery,
  useGetActiveTransportQuery,
  // Vehicle endpoints
  useGetTruckQuery,
  useGetTruckDocumentsQuery,
  // Document endpoints
  useGetPersonalDocumentsQuery,
  useUploadPersonalDocumentMutation,
  useDeletePersonalDocumentMutation,
  // CMR endpoints
  useGetCMRDataQuery,
  useUpdateCMRDataMutation,
  useUploadCMRPhotosMutation,
  useDownloadCMRDocumentMutation,
} = api;