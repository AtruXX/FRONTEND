import { getApps, initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
let firebaseAppInstance = null;
let authInitialized = false;
let hasPlaceholderWarning = false;
const requiredFirebaseKeys = [
  'apiKey',
  'appId',
  'projectId',
  'storageBucket',
  'messagingSenderId',
];
const getConfig = () => {
  const config = Constants?.expoConfig?.extra?.firebase;
  if (!config) {
    return null;
  }
  const missingKeys = requiredFirebaseKeys.filter(
    (key) => !config[key] || config[key].startsWith('REPLACE_WITH')
  );
  if (missingKeys.length && !hasPlaceholderWarning) {
    hasPlaceholderWarning = true;
  }
  return missingKeys.length ? null : config;
};
export const ensureFirebaseInitialized = () => {
  if (firebaseAppInstance) {
    return firebaseAppInstance;
  }
  const config = getConfig();
  if (!config) {
    return null;
  }
  firebaseAppInstance = getApps().length ? getApps()[0] : initializeApp(config);
  return firebaseAppInstance;
};
export const ensureFirebaseAuth = () => {
  if (authInitialized) {
    return getAuth();
  }
  const app = ensureFirebaseInitialized();
  if (!app) {
    return null;
  }
  try {
    initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (error) {
    const alreadyInitialised =
      error?.code === 'auth/already-initialized' ||
      error?.message?.includes('already initialized');
    if (!alreadyInitialised) {
    }
  }
  authInitialized = true;
  return getAuth(app);
};
export default ensureFirebaseInitialized;
