// utils/errorHandler.js - Centralized error handling utility

/**
 * Converts technical errors into user-friendly Romanian messages
 * @param {Error|string|number} error - The error object, message, or status code
 * @param {string} defaultMessage - Default message if no specific mapping found
 * @returns {string} User-friendly Romanian error message
 */
export const getUserFriendlyErrorMessage = (error, defaultMessage = 'A apărut o eroare neașteptată.') => {
  // Handle different error formats
  let statusCode = null;
  let errorMessage = '';

  if (typeof error === 'number') {
    statusCode = error;
  } else if (error?.status) {
    statusCode = error.status;
    errorMessage = error.message || '';
  } else if (error?.message) {
    errorMessage = error.message;
    // Try to extract status code from message
    const statusMatch = errorMessage.match(/HTTP (\d+):/);
    if (statusMatch) {
      statusCode = parseInt(statusMatch[1]);
    }
  } else if (typeof error === 'string') {
    errorMessage = error;
  }

  // Check for network/connection issues
  if (errorMessage.toLowerCase().includes('network') ||
      errorMessage.toLowerCase().includes('connection') ||
      errorMessage.toLowerCase().includes('fetch') ||
      statusCode === 0) {
    return 'Problemă de conexiune. Verificați internetul și încercați din nou.';
  }

  // Handle specific HTTP status codes
  switch (statusCode) {
    case 400:
      return 'Datele trimise nu sunt valide. Verificați informațiile introduse.';
    case 401:
      return 'Sesiunea a expirat. Vă rugăm să vă autentificați din nou.';
    case 403:
      return 'Nu aveți permisiunea să efectuați această acțiune.';
    case 404:
      return 'Resursa solicitată nu a fost găsită.';
    case 408:
      return 'Cererea a expirat. Încercați din nou.';
    case 413:
      return 'Fișierul este prea mare. Selectați un fișier mai mic.';
    case 422:
      return 'Datele nu sunt valide. Verificați informațiile introduse.';
    case 429:
      return 'Prea multe cereri. Așteptați câteva minute și încercați din nou.';
    case 500:
      return 'Problemă pe server. Încercați din nou mai târziu.';
    case 502:
      return 'Serviciul este temporar indisponibil. Încercați din nou.';
    case 503:
      return 'Serviciul este în mentenanță. Încercați din nou mai târziu.';
    case 504:
      return 'Serverul nu răspunde. Încercați din nou.';
    default:
      if (statusCode >= 500) {
        return 'Problemă pe server. Încercați din nou mai târziu.';
      }
      break;
  }

  // Handle specific error keywords in message
  if (errorMessage.toLowerCase().includes('timeout')) {
    return 'Cererea a expirat. Verificați conexiunea și încercați din nou.';
  }

  if (errorMessage.toLowerCase().includes('unauthorized')) {
    return 'Sesiunea a expirat. Vă rugăm să vă autentificați din nou.';
  }

  if (errorMessage.toLowerCase().includes('forbidden')) {
    return 'Nu aveți permisiunea să efectuați această acțiune.';
  }

  if (errorMessage.toLowerCase().includes('not found')) {
    return 'Resursa solicitată nu a fost găsită.';
  }

  if (errorMessage.toLowerCase().includes('too large') ||
      errorMessage.toLowerCase().includes('file size')) {
    return 'Fișierul este prea mare. Selectați un fișier mai mic.';
  }

  if (errorMessage.toLowerCase().includes('invalid format') ||
      errorMessage.toLowerCase().includes('unsupported')) {
    return 'Formatul fișierului nu este acceptat.';
  }

  return defaultMessage;
};

/**
 * Logs error details for debugging while showing user-friendly message
 * @param {Error} error - The original error object
 * @param {string} context - Context where the error occurred
 * @param {string} userMessage - The user-friendly message to show
 */
export const logAndShowError = (error, context, userMessage) => {
  // Log detailed error for developers
  console.error(`[${context}] Error:`, {
    message: error?.message,
    status: error?.status,
    stack: error?.stack,
    originalMessage: error?.originalMessage,
    timestamp: new Date().toISOString()
  });

  return userMessage;
};

/**
 * Common error messages in Romanian for consistent UI
 */
export const ERROR_MESSAGES = {
  NETWORK: 'Problemă de conexiune. Verificați internetul și încercați din nou.',
  SESSION_EXPIRED: 'Sesiunea a expirat. Vă rugăm să vă autentificați din nou.',
  PERMISSION_DENIED: 'Nu aveți permisiunea să efectuați această acțiune.',
  FILE_TOO_LARGE: 'Fișierul este prea mare. Selectați un fișier mai mic.',
  INVALID_FORMAT: 'Formatul fișierului nu este acceptat.',
  SERVER_ERROR: 'Problemă pe server. Încercați din nou mai târziu.',
  SERVICE_UNAVAILABLE: 'Serviciul este temporar indisponibil.',
  VALIDATION_ERROR: 'Datele introduse nu sunt valide.',
  NOT_FOUND: 'Resursa solicitată nu a fost găsită.',
  TIMEOUT: 'Cererea a expirat. Încercați din nou.',
  RATE_LIMIT: 'Prea multe cereri. Așteptați câteva minute și încercați din nou.',
  GENERIC: 'A apărut o eroare neașteptată. Încercați din nou.'
};

/**
 * Document upload specific error handler based on AtruX backend documentation
 * @param {Error|Response} error - The error object or response
 * @param {string} context - Context where the error occurred
 * @returns {string} Romanian error message for document uploads
 */
export const getDocumentUploadErrorMessage = (error, context = 'document_upload') => {
  let statusCode = null;
  let errorMessage = '';

  if (typeof error === 'object' && error.status) {
    statusCode = error.status;
    errorMessage = error.message || '';
  } else if (error?.message) {
    errorMessage = error.message;
  }

  // Check specific backend error messages
  if (errorMessage.includes('You already have a document of this type')) {
    return 'Aveți deja un document de acest tip încărcat. Ștergeți documentul existent înainte de a încărca unul nou.';
  }

  if (errorMessage.includes('Invalid category') || errorMessage.includes('category')) {
    return 'Categoria documentului nu este validă. Selectați o categorie din lista disponibilă.';
  }

  if (errorMessage.includes('document is required') || errorMessage.includes('title is required')) {
    return 'Toate câmpurile obligatorii trebuie completate: document, titlu și categorie.';
  }

  // File size validation (backend has 20MB limit)
  if (statusCode === 413 || errorMessage.includes('too large') || errorMessage.includes('size')) {
    return 'Fișierul este prea mare. Dimensiunea maximă acceptată este 20MB.';
  }

  // Format validation - backend accepts PDF, JPG, PNG, DOCX
  if (errorMessage.includes('format') || errorMessage.includes('type') || errorMessage.includes('unsupported')) {
    return 'Formatul fișierului nu este acceptat. Folosiți doar PDF, JPG, PNG sau DOCX.';
  }

  // Authentication and permissions
  if (statusCode === 401 || errorMessage.includes('unauthorized') || errorMessage.includes('token')) {
    return 'Sesiunea a expirat. Vă rugăm să vă autentificați din nou.';
  }

  if (statusCode === 403 || errorMessage.includes('forbidden') || errorMessage.includes('permission')) {
    return 'Nu aveți permisiunea să încărcați documente sau să efectuați această acțiune.';
  }

  // Server validation errors (400)
  if (statusCode === 400) {
    return 'Datele documentului nu sunt valide. Verificați toate câmpurile și încercați din nou.';
  }

  // Network and server errors
  if (statusCode >= 500) {
    return 'Problemă pe serverul AtruX. Încercați din nou în câteva minute.';
  }

  if (statusCode === 0 || errorMessage.includes('network') || errorMessage.includes('connection')) {
    return 'Problemă de conexiune. Verificați internetul și încercați din nou.';
  }

  // Default document upload error
  return 'Nu s-a putut încărca documentul. Verificați fișierul și încercați din nou.';
};

/**
 * Document deletion specific error handler
 * @param {Error|Response} error - The error object or response
 * @param {string} context - Context where the error occurred
 * @returns {string} Romanian error message for document deletion
 */
export const getDocumentDeleteErrorMessage = (error, context = 'document_delete') => {
  let statusCode = null;
  let errorMessage = '';

  if (typeof error === 'object' && error.status) {
    statusCode = error.status;
    errorMessage = error.message || '';
  } else if (error?.message) {
    errorMessage = error.message;
  }

  if (statusCode === 404 || errorMessage.includes('not found')) {
    return 'Documentul nu a fost găsit. Probabil a fost deja șters.';
  }

  if (statusCode === 403 || errorMessage.includes('forbidden') || errorMessage.includes('permission')) {
    return 'Nu aveți permisiunea să ștergeți acest document.';
  }

  if (statusCode === 401 || errorMessage.includes('unauthorized')) {
    return 'Sesiunea a expirat. Vă rugăm să vă autentificați din nou.';
  }

  if (statusCode >= 500) {
    return 'Problemă pe serverul AtruX. Încercați din nou în câteva minute.';
  }

  return 'Nu s-a putut șterge documentul. Încercați din nou.';
};

/**
 * Enhanced error handler for API responses
 * @param {Response} response - Fetch response object
 * @param {string} context - Context where the error occurred
 * @returns {Promise<Error>} Enhanced error with user-friendly message
 */
export const handleApiError = async (response, context) => {
  let errorData = '';
  try {
    errorData = await response.text();
  } catch (parseError) {
    errorData = 'Could not parse error response';
  }

  let userFriendlyMessage;

  // Use context-specific error handlers
  if (context === 'document_upload') {
    userFriendlyMessage = getDocumentUploadErrorMessage({ status: response.status, message: errorData }, context);
  } else if (context === 'document_delete') {
    userFriendlyMessage = getDocumentDeleteErrorMessage({ status: response.status, message: errorData }, context);
  } else {
    userFriendlyMessage = getUserFriendlyErrorMessage(response.status);
  }

  const error = new Error(userFriendlyMessage);
  error.status = response.status;
  error.originalMessage = `HTTP ${response.status}: ${errorData}`;
  error.context = context;

  // Log for debugging
  logAndShowError(error, context, userFriendlyMessage);

  return error;
};