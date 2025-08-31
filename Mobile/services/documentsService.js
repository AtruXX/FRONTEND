// services/documentsService.js
import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../utils/BASE_URL.js';

// Custom hook for getting personal documents query
export const useGetPersonalDocumentsQuery = (options = {}) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);

  const fetchPersonalDocuments = useCallback(async () => {
    if (options.skip) return;

    setIsFetching(true);
    setError(null);

    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        throw new Error('No auth token found');
      }

      console.log('Fetching personal documents');
      const response = await fetch(`${BASE_URL}personal-documents/`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Personal documents response status:', response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.log('Personal documents error response:', errorData);
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }

      const documentsData = await response.json();
      console.log('Personal documents data received:', documentsData);

      // Helper function to extract file extension from URL
      const getFileExtension = (url) => {
        if (!url) return '';
        const filename = url.split('?')[0]; // Remove query parameters
        const extension = filename.split('.').pop().toUpperCase();
        return extension || '';
      };

      // Map document category to status for display
      const getCategoryStatus = (category) => {
        const statusMap = {
          'permis_de_conducere': 'approved',
          'atestate': 'approved',
          'certificat_medical': 'pending',
          'aviz_psihologic': 'pending',
          'buletin': 'approved',
          'fisa_postului': 'approved',
          'contract_munca': 'approved',
          'adeverinta_angajator': 'pending',
          'formular_eu': 'pending',
          'cereri_de_concediu': 'pending',
          'alte_documente_personale': 'pending',
        };
        return statusMap[category] || 'pending';
      };

      // Transform the API response to match the component structure
      const formattedDocuments = documentsData.map((doc) => ({
        id: doc.id,
        name: doc.title,
        type: getFileExtension(doc.document),
        size: '1.0 MB', // Placeholder size since not provided by API
        date: new Date(doc.created_at || Date.now()).toLocaleDateString(), // Use created_at or current date
        status: getCategoryStatus(doc.category),
        url: doc.document,
        category: doc.category,
        created_at: doc.created_at,
        updated_at: doc.updated_at,
        expiration_date: doc.expiration_date, // Include expiration_date from API
      }));

      setData(formattedDocuments);
    } catch (err) {
      console.error('Personal documents fetch error:', err);
      setError(err);
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  }, [options.skip]);

  // Initial load
  useEffect(() => {
    fetchPersonalDocuments();
  }, [fetchPersonalDocuments]);

  return {
    data,
    isLoading,
    isFetching,
    error,
    refetch: fetchPersonalDocuments,
  };
};

// Custom hook for uploading personal documents mutation
export const useUploadPersonalDocumentMutation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const uploadPersonalDocument = useCallback(async ({ document, title, category, expiration_date }) => {
    setIsLoading(true);
    setError(null);

    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        throw new Error('No auth token found');
      }

      console.log('Uploading personal document:', { title, category, expiration_date });

      // Helper functions for file handling
      const getFileName = (uri) => {
        return uri.split('/').pop();
      };

      const getFileExtension = (uri) => {
        return uri.split('.').pop().toLowerCase();
      };

      // Prepare file information
      const fileUri = document.uri;
      const fileName = getFileName(fileUri);
      const fileExtension = getFileExtension(fileUri);
      const fileType = document.mimeType || `application/${fileExtension}`;
      
      // Create form data
      const formData = new FormData();
      
      // Add the file
      formData.append('document', {
        uri: fileUri,
        name: fileName,
        type: fileType,
      });
      
      // Add other required fields
      formData.append('title', title);
      formData.append('category', category);
      
      // Add expiration date if provided
      if (expiration_date) {
        formData.append('expiration_date', expiration_date);
      }

      const response = await fetch(`${BASE_URL}personal-documents/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          // Note: Don't set Content-Type for FormData, let the browser set it
        },
        body: formData,
      });

      console.log('Upload personal document response status:', response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.log('Upload personal document error response:', errorData);
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }

      const data = await response.json();
      console.log('Personal document uploaded successfully:', data);

      setIsLoading(false);
      return data;
    } catch (err) {
      console.error('Upload personal document error:', err);
      setIsLoading(false);
      setError(err);
      throw err;
    }
  }, []);

  // Return the mutation function with unwrap method
  const uploadPersonalDocumentMutation = useCallback((variables) => {
    const promise = uploadPersonalDocument(variables);
    promise.unwrap = () => promise;
    return promise;
  }, [uploadPersonalDocument]);

  return [uploadPersonalDocumentMutation, { isLoading, error }];
};

// Custom hook for deleting personal documents mutation
export const useDeletePersonalDocumentMutation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const deletePersonalDocument = useCallback(async (documentId) => {
    setIsLoading(true);
    setError(null);

    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        throw new Error('No auth token found');
      }

      console.log('Deleting personal document:', documentId);
      const response = await fetch(`${BASE_URL}personal-documents/${documentId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Delete personal document response status:', response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.log('Delete personal document error response:', errorData);
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }

      console.log('Personal document deleted successfully');
      setIsLoading(false);
      return { success: true };
    } catch (err) {
      console.error('Delete personal document error:', err);
      setIsLoading(false);
      setError(err);
      throw err;
    }
  }, []);

  // Return the mutation function with unwrap method
  const deletePersonalDocumentMutation = useCallback((variables) => {
    const promise = deletePersonalDocument(variables);
    promise.unwrap = () => promise;
    return promise;
  }, [deletePersonalDocument]);

  return [deletePersonalDocumentMutation, { isLoading, error }];
};

// Custom hook for getting document expiration data
export const useGetDocumentExpirationQuery = (documentId) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDocumentExpiration = useCallback(async () => {
    if (!documentId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        throw new Error('No auth token found');
      }
      
      console.log('Fetching document expiration for:', documentId);
      const response = await fetch(`${BASE_URL}personal-documents/expiration/${documentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Document expiration response status:', response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.log('Document expiration error response:', errorData);
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }

      const expirationData = await response.json();
      console.log('Document expiration data received:', expirationData);

      setData(expirationData);
    } catch (err) {
      console.error('Document expiration fetch error:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [documentId]);

  // Use documentId directly in useEffect dependency to avoid infinite loops
  useEffect(() => {
    const fetchData = async () => {
      if (!documentId) {
        setData(null);
        setIsLoading(false);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const token = await AsyncStorage.getItem('authToken');
        if (!token) {
          throw new Error('No auth token found');
        }
        
        console.log('Fetching document expiration for:', documentId);
        const response = await fetch(`${BASE_URL}personal-documents/expiration/${documentId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
        });

        console.log('Document expiration response status:', response.status);

        if (!response.ok) {
          const errorData = await response.text();
          console.log('Document expiration error response:', errorData);
          throw new Error(`HTTP ${response.status}: ${errorData}`);
        }

        const expirationData = await response.json();
        console.log('Document expiration data received:', expirationData);

        setData(expirationData);
      } catch (err) {
        console.error('Document expiration fetch error:', err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [documentId]); // Only depend on documentId

  return {
    data,
    isLoading,
    error,
    refetch: fetchDocumentExpiration,
  };
};

// Document categories constant (can be imported where needed)
export const DOCUMENT_CATEGORIES = [
  { value: 'permis_de_conducere', label: 'Permis de conducere' },
  { value: 'atestate', label: 'Atestat profesional' },
  { value: 'certificat_medical', label: 'Certificat medical' },
  { value: 'aviz_psihologic', label: 'Aviz psihologic' },
  { value: 'buletin', label: 'Carte de identitate' },
  { value: 'fisa_postului', label: 'Fișa postului' },
  { value: 'contract_munca', label: 'Contract individual de muncă' },
  { value: 'adeverinta_angajator', label: 'Adeverință angajator' },
  { value: 'formular_eu', label: 'Formular A1/Portable Document A1 (UE)' },
  { value: 'cereri_de_concediu', label: 'Cereri concediu' },
  { value: 'alte_documente_personale', label: 'Alte documente' }
];