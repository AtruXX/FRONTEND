// services/cmrService.js
import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../utils/BASE_URL.js';

// Enhanced CMR error types for better error handling
export const CMR_ERROR_TYPES = {
  NOT_FOUND: 'CMR_NOT_FOUND',
  NETWORK_ERROR: 'NETWORK_ERROR',
  AUTH_ERROR: 'AUTH_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
};

// Helper function to categorize CMR errors
const categorizeCMRError = (error, response) => {
  if (response?.status === 404) {
    return {
      type: CMR_ERROR_TYPES.NOT_FOUND,
      message: 'CMR nu există pentru acest transport',
      canCreate: true,
      originalError: error
    };
  } else if (response?.status === 401 || response?.status === 403) {
    return {
      type: CMR_ERROR_TYPES.AUTH_ERROR,
      message: 'Nu aveți permisiuni pentru a accesa acest CMR',
      canCreate: false,
      originalError: error
    };
  } else if (response?.status >= 500) {
    return {
      type: CMR_ERROR_TYPES.SERVER_ERROR,
      message: 'Eroare de server. Încercați din nou.',
      canCreate: false,
      originalError: error
    };
  } else if (!navigator.onLine || error.name === 'NetworkError') {
    return {
      type: CMR_ERROR_TYPES.NETWORK_ERROR,
      message: 'Verificați conexiunea la internet',
      canCreate: false,
      originalError: error
    };
  }

  return {
    type: CMR_ERROR_TYPES.UNKNOWN_ERROR,
    message: 'A apărut o eroare neașteptată',
    canCreate: false,
    originalError: error
  };
};

// Helper function to check if CMR exists for a transport
const checkCMRExists = async (transportId, token) => {
  try {
    const response = await fetch(`${BASE_URL}cmr-exists/${transportId}/`, {
      method: 'GET',
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return { exists: false, canCreate: true };
      }
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return { exists: data.exists || false, canCreate: !data.exists };
  } catch (error) {
    console.warn('CMR existence check failed:', error);
    return { exists: false, canCreate: true };
  }
};

// Custom hook for getting CMR data with enhanced error handling
export const useGetCMRDataQuery = (activeTransportId, options = {}) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);
  const [cmrExists, setCmrExists] = useState(null);

  const fetchCMRData = useCallback(async () => {
    if (options.skip || !activeTransportId) {
      setIsLoading(false);
      return;
    }

    setIsFetching(true);
    setError(null);

    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        throw new Error('No auth token found');
      }

      // First, check if CMR exists
      const existsResult = await checkCMRExists(activeTransportId, token);
      setCmrExists(existsResult.exists);

      if (!existsResult.exists) {
        // CMR doesn't exist, create a user-friendly error
        const notFoundError = {
          type: CMR_ERROR_TYPES.NOT_FOUND,
          message: 'CMR nu există pentru acest transport',
          canCreate: existsResult.canCreate,
          originalError: new Error('CMR not found')
        };
        setError(notFoundError);
        setIsLoading(false);
        setIsFetching(false);
        return;
      }

      // CMR exists, fetch the data
      const response = await fetch(`${BASE_URL}transport-cmr/${activeTransportId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.text();

        // Create categorized error for better handling
        const categorizedError = categorizeCMRError(
          new Error(`HTTP ${response.status}: ${errorData}`),
          response
        );

        throw categorizedError;
      }

      const cmrData = await response.json();
      setData(cmrData);
      setCmrExists(true);
    } catch (err) {
      setError(err);

      // If it's not already a categorized error, categorize it
      if (!err.type) {
        const categorizedError = categorizeCMRError(err);
        setError(categorizedError);
      }
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
    cmrExists,
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

      const response = await fetch(`${BASE_URL}transport-cmr/${activeTransportId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cmrData),
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
  const updateCMRDataMutation = useCallback((variables) => {
    const promise = updateCMRData(variables);
    promise.unwrap = () => promise;
    return promise;
  }, [updateCMRData]);

  return [updateCMRDataMutation, { isLoading, error }];
};

// Custom hook for creating new CMR data
export const useCreateCMRDataMutation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const createCMRData = useCallback(async ({ activeTransportId, cmrData }) => {
    setIsLoading(true);
    setError(null);

    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        throw new Error('No auth token found');
      }

      console.log('🚀 Creating CMR for transport:', activeTransportId);
      console.log('📝 CMR Data:', cmrData);

      const response = await fetch(`${BASE_URL}transport-cmr/${activeTransportId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cmrData),
      });

      console.log('📡 CMR Creation Response Status:', response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('❌ CMR Creation Failed:', errorData);

        // Create user-friendly error message
        let userMessage = 'Nu s-a putut crea CMR-ul.';
        if (response.status === 400) {
          userMessage = 'Datele furnizate nu sunt valide pentru crearea CMR-ului.';
        } else if (response.status === 403) {
          userMessage = 'Nu aveți permisiuni pentru a crea CMR pentru acest transport.';
        } else if (response.status === 404) {
          userMessage = 'Transportul specificat nu a fost găsit.';
        } else if (response.status >= 500) {
          userMessage = 'Eroare de server. Încercați din nou peste câteva momente.';
        }

        throw new Error(userMessage);
      }

      const data = await response.json();
      console.log('✅ CMR Created Successfully:', data);

      setIsLoading(false);
      return data;
    } catch (err) {
      setIsLoading(false);
      setError(err);
      throw err;
    }
  }, []);

  // Return the mutation function with unwrap method
  const createCMRDataMutation = useCallback((variables) => {
    const promise = createCMRData(variables);
    promise.unwrap = () => promise;
    return promise;
  }, [createCMRData]);

  return [createCMRDataMutation, { isLoading, error }];
};

// Custom hook for uploading CMR documents/photos as transport documents
export const useUploadCMRDocumentsMutation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const uploadCMRDocuments = useCallback(async ({ activeTransportId, documents }) => {
    setIsLoading(true);
    setError(null);

    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        throw new Error('No auth token found');
      }

      // Upload each document separately as the backend expects individual uploads
      const uploadResults = [];

      for (let i = 0; i < documents.length; i++) {
        const document = documents[i];
        const formData = new FormData();

        // Add document to form data with correct field name
        formData.append('document', {
          uri: document.uri,
          type: document.type || (document.mimeType || 'image/jpeg'),
          name: document.name || `cmr_document_${i + 1}.${document.type === 'document' ? 'pdf' : 'jpg'}`,
        });

        // Add required fields for transport document
        formData.append('title', document.title || `CMR Document ${i + 1}`);
        formData.append('category', 'cmr');

        const response = await fetch(`${BASE_URL}transport-documents/${activeTransportId}`, {
          method: 'POST',
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'multipart/form-data',
          },
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorData}`);
        }

        const data = await response.json();
        uploadResults.push(data);
      }

      setIsLoading(false);
      return {
        success: true,
        uploadedDocuments: uploadResults,
        message: `${uploadResults.length} CMR document(s) uploaded successfully`
      };
    } catch (err) {
      setIsLoading(false);
      setError(err);
      throw err;
    }
  }, []);

  // Return the mutation function with unwrap method
  const uploadCMRDocumentsMutation = useCallback((variables) => {
    const promise = uploadCMRDocuments(variables);
    promise.unwrap = () => promise;
    return promise;
  }, [uploadCMRDocuments]);

  return [uploadCMRDocumentsMutation, { isLoading, error }];
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

      const response = await fetch(`${BASE_URL}cmr/download/${activeTransportId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }

      // Handle the file download response
      const blob = await response.blob();
      
      setIsLoading(false);
      return {
        blob,
        filename: `CMR_Transport_${activeTransportId}.pdf`,
        url: URL.createObjectURL(blob)
      };
    } catch (err) {
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