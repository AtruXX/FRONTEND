// services/cmrService.js
import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../utils/BASE_URL.js';

// Custom hook for getting CMR data for active transport
export const useGetCMRDataQuery = (activeTransportId, options = {}) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);

  const fetchCMRData = useCallback(async () => {
    if (options.skip || !activeTransportId) return;

    setIsFetching(true);
    setError(null);

    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        throw new Error('No auth token found');
      }

      console.log('Fetching CMR data for transport:', activeTransportId);
      const response = await fetch(`${BASE_URL}transport-cmr/${activeTransportId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('CMR data response status:', response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.log('CMR data error response:', errorData);
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }

      const cmrData = await response.json();
      console.log('CMR data received:', cmrData);

      setData(cmrData);
    } catch (err) {
      console.error('CMR data fetch error:', err);
      setError(err);
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  }, [activeTransportId, options.skip]);

  // Initial load
  useEffect(() => {
    fetchCMRData();
  }, [fetchCMRData]);

  return {
    data,
    isLoading,
    isFetching,
    error,
    refetch: fetchCMRData,
  };
};

// Custom hook for updating CMR data
export const useUpdateCMRDataMutation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateCMRData = useCallback(async ({ activeTransportId, cmrData }) => {
    setIsLoading(true);
    setError(null);

    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        throw new Error('No auth token found');
      }

      console.log('Updating CMR data with:', cmrData);
      const response = await fetch(`${BASE_URL}transport-cmr/${activeTransportId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cmrData),
      });

      console.log('Update CMR data response status:', response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.log('Update CMR data error response:', errorData);
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }

      const data = await response.json();
      console.log('CMR data updated successfully:', data);
      
      setIsLoading(false);
      return data;
    } catch (err) {
      console.error('CMR data update error:', err);
      setIsLoading(false);
      setError(err);
      throw err;
    }
  }, []);

  // Return the mutation function with unwrap method
  const updateCMRDataMutation = useCallback((variables) => {
    const promise = updateCMRData(variables);
    promise.unwrap = () => promise;
    return promise;
  }, [updateCMRData]);

  return [updateCMRDataMutation, { isLoading, error }];
};

// Custom hook for uploading CMR photos
export const useUploadCMRPhotosMutation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const uploadCMRPhotos = useCallback(async ({ activeTransportId, photos }) => {
    setIsLoading(true);
    setError(null);

    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        throw new Error('No auth token found');
      }

      const formData = new FormData();
      
      // Add photos to form data
      photos.forEach((photo, index) => {
        formData.append('photos', {
          uri: photo.uri,
          type: photo.type || 'image/jpeg',
          name: photo.name || `cmr_photo_${index}.jpg`,
        });
      });

      console.log('Uploading CMR photos for transport:', activeTransportId);
      const response = await fetch(`${BASE_URL}cmr/photos/${activeTransportId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      console.log('Upload CMR photos response status:', response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.log('Upload CMR photos error response:', errorData);
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }

      const data = await response.json();
      console.log('CMR photos uploaded successfully:', data);
      
      setIsLoading(false);
      return data;
    } catch (err) {
      console.error('CMR photos upload error:', err);
      setIsLoading(false);
      setError(err);
      throw err;
    }
  }, []);

  // Return the mutation function with unwrap method
  const uploadCMRPhotosMutation = useCallback((variables) => {
    const promise = uploadCMRPhotos(variables);
    promise.unwrap = () => promise;
    return promise;
  }, [uploadCMRPhotos]);

  return [uploadCMRPhotosMutation, { isLoading, error }];
};

// Custom hook for downloading CMR document
export const useDownloadCMRDocumentMutation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const downloadCMRDocument = useCallback(async (activeTransportId) => {
    setIsLoading(true);
    setError(null);

    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        throw new Error('No auth token found');
      }

      console.log('Downloading CMR document for transport:', activeTransportId);
      const response = await fetch(`${BASE_URL}cmr/download/${activeTransportId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
        },
      });

      console.log('Download CMR document response status:', response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.log('Download CMR document error response:', errorData);
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }

      // Handle the file download response
      const blob = await response.blob();
      console.log('CMR document downloaded successfully');
      
      setIsLoading(false);
      return {
        blob,
        filename: `CMR_Transport_${activeTransportId}.pdf`,
        url: URL.createObjectURL(blob)
      };
    } catch (err) {
      console.error('CMR document download error:', err);
      setIsLoading(false);
      setError(err);
      throw err;
    }
  }, []);

  // Return the mutation function with unwrap method
  const downloadCMRDocumentMutation = useCallback((variables) => {
    const promise = downloadCMRDocument(variables);
    promise.unwrap = () => promise;
    return promise;
  }, [downloadCMRDocument]);

  return [downloadCMRDocumentMutation, { isLoading, error }];
};