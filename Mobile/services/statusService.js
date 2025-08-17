// services/statusService.js
import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../utils/BASE_URL.js';

// Custom hook for getting active transport status
export const useGetActiveTransportStatusQuery = (activeTransportId, options = {}) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);

  const fetchActiveTransportStatus = useCallback(async () => {
    if (options.skip || !activeTransportId) return;

    setIsFetching(true);
    setError(null);

    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        throw new Error('No auth token found');
      }

      console.log('Fetching active transport status for ID:', activeTransportId);
      const response = await fetch(`${BASE_URL}transports/${activeTransportId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Active transport status response status:', response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.log('Active transport status error response:', errorData);
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }

      const statusData = await response.json();
      console.log('Active transport status data received:', statusData);

      setData(statusData);
    } catch (err) {
      console.error('Active transport status fetch error:', err);
      setError(err);
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  }, [activeTransportId, options.skip]);

  // Initial load
  useEffect(() => {
    fetchActiveTransportStatus();
  }, [fetchActiveTransportStatus]);

  return {
    data,
    isLoading,
    isFetching,
    error,
    refetch: fetchActiveTransportStatus,
  };
};

// Custom hook for updating transport status
export const useUpdateTransportStatusMutation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateTransportStatus = useCallback(async ({ statusData, activeTransportId }) => {
    setIsLoading(true);
    setError(null);

    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        throw new Error('No auth token found');
      }

      console.log('Updating transport status with:', statusData);
      const response = await fetch(`${BASE_URL}transports/${activeTransportId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(statusData),
      });

      console.log('Update transport status response status:', response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.log('Update transport status error response:', errorData);
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }

      const data = await response.json();
      console.log('Transport status updated successfully:', data);
      
      setIsLoading(false);
      return data;
    } catch (err) {
      console.error('Transport status update error:', err);
      setIsLoading(false);
      setError(err);
      throw err;
    }
  }, []);

  // Return the mutation function with unwrap method
  const updateTransportStatusMutation = useCallback((variables) => {
    const promise = updateTransportStatus(variables);
    promise.unwrap = () => promise;
    return promise;
  }, [updateTransportStatus]);

  return [updateTransportStatusMutation, { isLoading, error }];
};

// Custom hook for uploading goods photos
export const useUploadGoodsPhotosMutation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const uploadGoodsPhotos = useCallback(async ({ activeTransportId, photos }) => {
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
          name: photo.name || `goods_photo_${index}.jpg`,
        });
      });

      console.log('Uploading goods photos for transport:', activeTransportId);
      const response = await fetch(`${BASE_URL}transport/goods-photos/${activeTransportId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      console.log('Upload goods photos response status:', response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.log('Upload goods photos error response:', errorData);
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }

      const data = await response.json();
      console.log('Goods photos uploaded successfully:', data);
      
      setIsLoading(false);
      return data;
    } catch (err) {
      console.error('Goods photos upload error:', err);
      setIsLoading(false);
      setError(err);
      throw err;
    }
  }, []);

  // Return the mutation function with unwrap method
  const uploadGoodsPhotosMutation = useCallback((variables) => {
    const promise = uploadGoodsPhotos(variables);
    promise.unwrap = () => promise;
    return promise;
  }, [uploadGoodsPhotos]);

  return [uploadGoodsPhotosMutation, { isLoading, error }];
};

// Custom hook for getting goods photos
export const useGetGoodsPhotosQuery = (activeTransportId, options = {}) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);

  const fetchGoodsPhotos = useCallback(async () => {
    if (options.skip || !activeTransportId) return;

    setIsFetching(true);
    setError(null);

    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        throw new Error('No auth token found');
      }

      console.log('Fetching goods photos for transport:', activeTransportId);
      const response = await fetch(`${BASE_URL}transport/goods-photos/${activeTransportId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Goods photos response status:', response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.log('Goods photos error response:', errorData);
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }

      const photosData = await response.json();
      console.log('Goods photos data received:', photosData);

      setData(photosData);
    } catch (err) {
      console.error('Goods photos fetch error:', err);
      setError(err);
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  }, [activeTransportId, options.skip]);

  // Initial load
  useEffect(() => {
    fetchGoodsPhotos();
  }, [fetchGoodsPhotos]);

  return {
    data,
    isLoading,
    isFetching,
    error,
    refetch: fetchGoodsPhotos,
  };
};