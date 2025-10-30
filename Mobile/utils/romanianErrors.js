// utils/romanianErrors.js - Comprehensive Romanian error messages for all contexts

export const ROMANIAN_ERRORS = {
  // Authentication & Session
  AUTH: {
    LOGIN_FAILED: 'Autentificare eșuată. Verificați datele de conectare.',
    INVALID_CREDENTIALS: 'Numărul de telefon sau parola sunt incorecte.',
    SESSION_EXPIRED: 'Sesiunea a expirat. Vă rugăm să vă autentificați din nou.',
    LOGOUT_FAILED: 'Eroare la deconectare. Încercați din nou.',
    TOKEN_INVALID: 'Token invalid. Vă rugăm să vă autentificați din nou.',
  },

  // Network & Connection
  NETWORK: {
    NO_CONNECTION: 'Fără conexiune la internet. Verificați conexiunea și încercați din nou.',
    TIMEOUT: 'Cererea a expirat. Verificați conexiunea și încercați din nou.',
    SERVER_UNREACHABLE: 'Serverul nu răspunde. Încercați din nou mai târziu.',
    SLOW_CONNECTION: 'Conexiune lentă. Încercați din nou.',
  },

  // Transport Operations
  TRANSPORT: {
    NOT_FOUND: 'Transportul nu a fost găsit.',
    NO_ACTIVE: 'Nu aveți un transport activ în acest moment.',
    START_FAILED: 'Nu s-a putut începe transportul. Încercați din nou.',
    FINALIZE_FAILED: 'Nu s-a putut finaliza transportul. Încercați din nou.',
    UPDATE_FAILED: 'Nu s-a putut actualiza transportul. Încercați din nou.',
    ALREADY_ACTIVE: 'Aveți deja un transport activ. Finalizați-l înainte de a începe altul.',
    QUEUE_ERROR: 'Eroare la încărcarea listei de transporturi.',
    STATUS_UPDATE_FAILED: 'Nu s-a putut actualiza statusul transportului.',
  },

  // CMR Operations
  CMR: {
    NOT_FOUND: 'CMR-ul nu a fost găsit pentru acest transport.',
    DOWNLOAD_FAILED: 'Nu s-a putut descărca CMR-ul. Încercați din nou.',
    UPLOAD_FAILED: 'Nu s-a putut încărca fotografia CMR. Încercați din nou.',
    UPDATE_FAILED: 'Nu s-a putut actualiza CMR-ul. Încercați din nou.',
    UIT_UPDATE_FAILED: 'Nu s-a putut actualiza codul UIT. Încercați din nou.',
    PHOTO_REQUIRED: 'Este necesară cel puțin o fotografie.',
    PHOTO_TOO_LARGE: 'Fotografia este prea mare. Dimensiunea maximă este 10MB.',
  },

  // Document Operations
  DOCUMENT: {
    UPLOAD_FAILED: 'Nu s-a putut încărca documentul. Încercați din nou.',
    DELETE_FAILED: 'Nu s-a putut șterge documentul. Încercați din nou.',
    DOWNLOAD_FAILED: 'Nu s-a putut descărca documentul. Încercați din nou.',
    NOT_FOUND: 'Documentul nu a fost găsit.',
    TOO_LARGE: 'Fișierul este prea mare. Dimensiunea maximă acceptată este 20MB.',
    INVALID_FORMAT: 'Formatul fișierului nu este acceptat. Folosiți doar PDF, JPG, PNG sau DOCX.',
    ALREADY_EXISTS: 'Aveți deja un document de acest tip. Ștergeți documentul existent înainte.',
    CATEGORY_REQUIRED: 'Selectați categoria documentului.',
    EXPIRATION_INVALID: 'Data de expirare nu este validă.',
  },

  // Profile & User
  PROFILE: {
    LOAD_FAILED: 'Nu s-au putut încărca datele profilului.',
    UPDATE_FAILED: 'Nu s-a putut actualiza profilul. Încercați din nou.',
    PERMISSION_DENIED: 'Nu aveți permisiunea să efectuați această acțiune.',
  },

  // Vehicle Operations
  VEHICLE: {
    NOT_FOUND: 'Vehiculul nu a fost găsit.',
    LOAD_FAILED: 'Nu s-au putut încărca datele vehiculului.',
    NO_TRUCK_ASSIGNED: 'Nu aveți un camion asignat pentru acest transport.',
  },

  // Leave Management
  LEAVE: {
    REQUEST_FAILED: 'Nu s-a putut trimite cererea de concediu.',
    LOAD_FAILED: 'Nu s-au putut încărca cererile de concediu.',
    DELETE_FAILED: 'Nu s-a putut șterge cererea. Încercați din nou.',
    INVALID_DATES: 'Datele selectate nu sunt valide.',
    START_AFTER_END: 'Data de început trebuie să fie înainte de data de sfârșit.',
    REASON_REQUIRED: 'Motivul concediului este obligatoriu.',
    OVERLAPPING: 'Există deja o cerere de concediu pentru această perioadă.',
  },

  // Route & Map
  ROUTE: {
    NOT_FOUND: 'Nu există o rută calculată pentru acest transport.',
    LOAD_FAILED: 'Nu s-a putut încărca ruta. Încercați din nou.',
    NAVIGATION_FAILED: 'Nu s-a putut deschide navigația. Verificați dacă aveți aplicația instalată.',
    NO_MAPS_APP: 'Nu aveți nicio aplicație de navigație instalată.',
  },

  // Notifications
  NOTIFICATION: {
    PERMISSION_DENIED: 'Permisiunea pentru notificări a fost refuzată.',
    REGISTRATION_FAILED: 'Nu s-a putut înregistra dispozitivul pentru notificări.',
    LOAD_FAILED: 'Nu s-au putut încărca notificările.',
    MARK_READ_FAILED: 'Nu s-a putut marca notificarea ca citită.',
  },

  // Server Errors
  SERVER: {
    ERROR_500: 'Problemă pe server. Încercați din nou mai târziu.',
    ERROR_502: 'Serviciul este temporar indisponibil.',
    ERROR_503: 'Serviciul este în mentenanță. Încercați din nou mai târziu.',
    ERROR_504: 'Serverul nu răspunde. Verificați conexiunea și încercați din nou.',
    MAINTENANCE: 'Serverul este în mentenanță. Încercați din nou în câteva minute.',
  },

  // Validation
  VALIDATION: {
    REQUIRED_FIELDS: 'Toate câmpurile obligatorii trebuie completate.',
    INVALID_EMAIL: 'Adresa de email nu este validă.',
    INVALID_PHONE: 'Numărul de telefon nu este valid.',
    INVALID_DATE: 'Data introdusă nu este validă.',
    INVALID_FORMAT: 'Formatul introdus nu este valid.',
    PASSWORD_TOO_SHORT: 'Parola trebuie să conțină cel puțin 8 caractere.',
    PASSWORDS_DONT_MATCH: 'Parolele nu coincid.',
  },

  // Generic
  GENERIC: {
    UNKNOWN_ERROR: 'A apărut o eroare neașteptată. Încercați din nou.',
    TRY_AGAIN: 'Încercați din nou.',
    OPERATION_FAILED: 'Operațiunea a eșuat. Încercați din nou.',
    NO_DATA: 'Nu există date disponibile.',
    LOADING_FAILED: 'Nu s-au putut încărca datele.',
  },

  // Permissions
  PERMISSION: {
    CAMERA_DENIED: 'Permisiunea pentru cameră a fost refuzată. Activați-o din setări.',
    LOCATION_DENIED: 'Permisiunea pentru locație a fost refuzată. Activați-o din setări.',
    STORAGE_DENIED: 'Permisiunea pentru stocare a fost refuzată. Activați-o din setări.',
    NOTIFICATIONS_DENIED: 'Permisiunea pentru notificări a fost refuzată. Activați-o din setări.',
  },
};

/**
 * Get error message by category and key
 * @param {string} category - Error category (e.g., 'AUTH', 'TRANSPORT')
 * @param {string} key - Error key within category
 * @param {string} fallback - Fallback message if not found
 * @returns {string} Romanian error message
 */
export const getErrorMessage = (category, key, fallback = ROMANIAN_ERRORS.GENERIC.UNKNOWN_ERROR) => {
  return ROMANIAN_ERRORS[category]?.[key] || fallback;
};

/**
 * Get error message based on HTTP status code
 * @param {number} statusCode - HTTP status code
 * @returns {string} Romanian error message
 */
export const getErrorByStatus = (statusCode) => {
  const statusMessages = {
    400: 'Datele trimise nu sunt valide. Verificați informațiile introduse.',
    401: ROMANIAN_ERRORS.AUTH.SESSION_EXPIRED,
    403: ROMANIAN_ERRORS.PROFILE.PERMISSION_DENIED,
    404: 'Resursa solicitată nu a fost găsită.',
    408: ROMANIAN_ERRORS.NETWORK.TIMEOUT,
    413: ROMANIAN_ERRORS.DOCUMENT.TOO_LARGE,
    422: ROMANIAN_ERRORS.VALIDATION.INVALID_FORMAT,
    429: 'Prea multe cereri. Așteptați câteva minute și încercați din nou.',
    500: ROMANIAN_ERRORS.SERVER.ERROR_500,
    502: ROMANIAN_ERRORS.SERVER.ERROR_502,
    503: ROMANIAN_ERRORS.SERVER.ERROR_503,
    504: ROMANIAN_ERRORS.SERVER.ERROR_504,
  };

  return statusMessages[statusCode] || ROMANIAN_ERRORS.GENERIC.UNKNOWN_ERROR;
};
