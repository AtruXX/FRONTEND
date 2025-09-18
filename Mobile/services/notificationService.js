import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../utils/BASE_URL.js';

const NOTIFICATION_TYPES = {
  DOCUMENT_EXPIRATION: 'document_expiration',
  DRIVER_STATUS_CHANGE: 'driver_status_change',
  TRANSPORT_UPDATE: 'transport_update',
  SYSTEM_ALERT: 'system_alert'
};

const NOTIFICATION_CATEGORIES = {
  DOCUMENTS: 'Documente',
  TRUCK_DOCUMENTS: 'Documente Camion',
  DRIVER_STATUS: 'Status Sofer',
  TRANSPORT: 'Transport',
  SYSTEM: 'System'
};

export const useGetNotificationsQuery = (options = {}) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);

  const fetchNotifications = useCallback(async (params = {}) => {
    if (options.skip) return;

    setIsFetching(true);
    setError(null);

    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        throw new Error('No auth token found');
      }

      const queryParams = new URLSearchParams({
        page: params.page || 1,
        page_size: params.page_size || 20,
        ...(params.is_read !== undefined && { is_read: params.is_read }),
        ...(params.is_dismissed !== undefined && { is_dismissed: params.is_dismissed }),
        ...(params.notification_type && { notification_type: params.notification_type })
      });

      console.log('Fetching notifications from /notifications/');
      const response = await fetch(`${BASE_URL}notifications/?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Notifications response status:', response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.log('Notifications error response:', errorData);
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }

      const notificationsData = await response.json();
      console.log('Notifications data received:', notificationsData);

      setData(notificationsData);
    } catch (err) {
      console.error('Notifications fetch error:', err);
      setError(err);
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  }, [options.skip]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    data,
    isLoading,
    isFetching,
    error,
    refetch: fetchNotifications,
  };
};

export const useMarkNotificationAsReadMutation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const markAsRead = useCallback(async (notificationId) => {
    setIsLoading(true);
    setError(null);

    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        throw new Error('No auth token found');
      }

      console.log(`Marking notification ${notificationId} as read`);
      const response = await fetch(`${BASE_URL}notifications/${notificationId}/read/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Mark as read response status:', response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.log('Mark as read error response:', errorData);
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }

      const data = await response.json();
      console.log('Notification marked as read:', data);

      setIsLoading(false);
      return data;
    } catch (err) {
      console.error('Mark as read error:', err);
      setIsLoading(false);
      setError(err);
      throw err;
    }
  }, []);

  const markAsReadMutation = useCallback((variables) => {
    const promise = markAsRead(variables);
    promise.unwrap = () => promise;
    return promise;
  }, [markAsRead]);

  return [markAsReadMutation, { isLoading, error }];
};

export const useDismissNotificationMutation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const dismissNotification = useCallback(async (notificationId) => {
    setIsLoading(true);
    setError(null);

    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        throw new Error('No auth token found');
      }

      console.log(`Dismissing notification ${notificationId}`);
      const response = await fetch(`${BASE_URL}notifications/${notificationId}/dismiss/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Dismiss notification response status:', response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.log('Dismiss notification error response:', errorData);
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }

      const data = await response.json();
      console.log('Notification dismissed:', data);

      setIsLoading(false);
      return data;
    } catch (err) {
      console.error('Dismiss notification error:', err);
      setIsLoading(false);
      setError(err);
      throw err;
    }
  }, []);

  const dismissNotificationMutation = useCallback((variables) => {
    const promise = dismissNotification(variables);
    promise.unwrap = () => promise;
    return promise;
  }, [dismissNotification]);

  return [dismissNotificationMutation, { isLoading, error }];
};

export const useMarkAllNotificationsAsReadMutation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const markAllAsRead = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        throw new Error('No auth token found');
      }

      console.log('Marking all notifications as read');
      const response = await fetch(`${BASE_URL}notifications/read-all/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Mark all as read response status:', response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.log('Mark all as read error response:', errorData);
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }

      const data = await response.json();
      console.log('All notifications marked as read:', data);

      setIsLoading(false);
      return data;
    } catch (err) {
      console.error('Mark all as read error:', err);
      setIsLoading(false);
      setError(err);
      throw err;
    }
  }, []);

  const markAllAsReadMutation = useCallback(() => {
    const promise = markAllAsRead();
    promise.unwrap = () => promise;
    return promise;
  }, [markAllAsRead]);

  return [markAllAsReadMutation, { isLoading, error }];
};

export const useDismissAllNotificationsMutation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const dismissAllNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        throw new Error('No auth token found');
      }

      console.log('Dismissing all notifications');
      const response = await fetch(`${BASE_URL}notifications/dismiss-all/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Dismiss all notifications response status:', response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.log('Dismiss all notifications error response:', errorData);
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }

      const data = await response.json();
      console.log('All notifications dismissed:', data);

      setIsLoading(false);
      return data;
    } catch (err) {
      console.error('Dismiss all notifications error:', err);
      setIsLoading(false);
      setError(err);
      throw err;
    }
  }, []);

  const dismissAllNotificationsMutation = useCallback(() => {
    const promise = dismissAllNotifications();
    promise.unwrap = () => promise;
    return promise;
  }, [dismissAllNotifications]);

  return [dismissAllNotificationsMutation, { isLoading, error }];
};

export const NotificationUtils = {
  formatTimestamp: (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return 'Acum';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}z`;
  },

  getNotificationIcon: (type) => {
    switch (type) {
      case NOTIFICATION_TYPES.DOCUMENT_EXPIRATION:
        return 'document-text-outline';
      case NOTIFICATION_TYPES.DRIVER_STATUS_CHANGE:
        return 'person-outline';
      case NOTIFICATION_TYPES.TRANSPORT_UPDATE:
        return 'car-outline';
      case NOTIFICATION_TYPES.SYSTEM_ALERT:
        return 'warning-outline';
      default:
        return 'notifications-outline';
    }
  },

  getNotificationColor: (type) => {
    switch (type) {
      case NOTIFICATION_TYPES.DOCUMENT_EXPIRATION:
        return '#FF6B6B';
      case NOTIFICATION_TYPES.DRIVER_STATUS_CHANGE:
        return '#4ECDC4';
      case NOTIFICATION_TYPES.TRANSPORT_UPDATE:
        return '#45B7D1';
      case NOTIFICATION_TYPES.SYSTEM_ALERT:
        return '#FFA726';
      default:
        return '#6366F1';
    }
  },

  getCategoryDisplayName: (category) => {
    return Object.values(NOTIFICATION_CATEGORIES).includes(category)
      ? category
      : NOTIFICATION_CATEGORIES.SYSTEM;
  }
};

export { NOTIFICATION_TYPES, NOTIFICATION_CATEGORIES };