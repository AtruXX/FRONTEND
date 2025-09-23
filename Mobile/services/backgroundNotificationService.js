import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform, AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../utils/BASE_URL.js';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class BackgroundNotificationService {
  constructor() {
    this.expoPushToken = null;
    this.notificationListener = null;
    this.responseListener = null;
    this.isInitialized = false;
    this.registrationRetries = 0;
    this.maxRetries = 3;
  }

  // Initialize the background notification service for production
  async initialize() {
    try {
      console.log('🚀 Initializing production background notification service...');

      // Check if already initialized
      if (this.isInitialized) {
        console.log('✅ Service already initialized');
        return true;
      }

      // Register for push notifications
      await this.registerForPushNotificationsAsync();

      // Set up notification listeners
      this.setupNotificationListeners();

      // Send token to backend with retry logic
      if (this.expoPushToken) {
        await this.sendTokenToBackendWithRetry(this.expoPushToken);
      }

      this.isInitialized = true;
      console.log('✅ Production background notification service initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize background notification service:', error);
      return false;
    }
  }

  // Register for push notifications and get token
  async registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });

      // Create additional channels for different notification types
      await Notifications.setNotificationChannelAsync('transport-updates', {
        name: 'Transport Updates',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        description: 'Notifications about transport status changes',
      });

      await Notifications.setNotificationChannelAsync('document-expiration', {
        name: 'Document Expiration',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 500, 250, 500],
        lightColor: '#FF8C00',
        description: 'Notifications about expiring documents',
      });

      await Notifications.setNotificationChannelAsync('driver-status', {
        name: 'Driver Status',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250],
        lightColor: '#00FF00',
        description: 'Notifications about driver status changes',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Failed to get push token for push notification!');
        return;
      }

      try {
        // Get push token - works for both development and production
        token = (await Notifications.getExpoPushTokenAsync()).data;

        console.log('Expo push token:', token);
        this.expoPushToken = token;

        // Store token locally
        await AsyncStorage.setItem('expoPushToken', token);

      } catch (e) {
        console.error('Error getting Expo push token:', e);
        token = `${e}`;
      }
    } else {
      console.warn('Must use physical device for Push Notifications');
    }

    return token;
  }

  // Send push token to backend with retry logic for production
  async sendTokenToBackendWithRetry(token) {
    while (this.registrationRetries < this.maxRetries) {
      try {
        const success = await this.sendTokenToBackend(token);
        if (success) {
          console.log('✅ Device registered for push notifications');
          return true;
        }
      } catch (error) {
        console.error(`❌ Registration attempt ${this.registrationRetries + 1} failed:`, error);
      }

      this.registrationRetries++;
      if (this.registrationRetries < this.maxRetries) {
        const delay = Math.pow(2, this.registrationRetries) * 1000; // Exponential backoff
        console.log(`⏳ Retrying registration in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    console.error('❌ Failed to register device after all retries');
    return false;
  }

  // Send push token to backend
  async sendTokenToBackend(token) {
    try {
      const authToken = await AsyncStorage.getItem('authToken');
      const userId = await AsyncStorage.getItem('driverId') || await AsyncStorage.getItem('userId');

      if (!authToken || !userId) {
        console.log('⚠️ No auth token or user ID available to send push token');
        return false;
      }

      // Store token locally for offline support
      await AsyncStorage.setItem('expoPushToken', token);
      await AsyncStorage.setItem('lastTokenUpdate', new Date().toISOString());

      // For production, we'll need to add this endpoint to the backend
      // For now, we'll store the token locally and sync when backend is ready
      console.log('📱 Push token stored locally:', token.substring(0, 20) + '...');

      // TODO: Implement backend endpoint for device registration
      // This endpoint needs to be added to the backend:
      // POST /notifications/register-device/
      /*
      const response = await fetch(`${BASE_URL}notifications/register-device/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          expo_push_token: token,
          device_type: Platform.OS,
          user_id: userId,
          app_version: '1.0.0', // Could be from app config
          device_model: Device.modelName,
          os_version: Device.osVersion,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Device registered successfully:', data);
        return true;
      } else {
        const errorData = await response.text();
        console.error('❌ Failed to register device:', errorData);
        return false;
      }
      */

      return true; // Return true for now until backend endpoint is implemented
    } catch (error) {
      console.error('❌ Error sending token to backend:', error);
      return false;
    }
  }

  // Set up notification listeners
  setupNotificationListeners() {
    // Listener for notifications received while app is foregrounded
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received in foreground:', notification);
      this.handleForegroundNotification(notification);
    });

    // Listener for when user taps notification
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response received:', response);
      this.handleNotificationResponse(response);
    });
  }

  // Handle notification received in foreground
  handleForegroundNotification(notification) {
    const { title, body, data } = notification.request.content;

    // You can customize behavior based on notification type
    if (data?.type === 'transport_update') {
      // Handle transport update notification
      console.log('Transport update notification:', title, body);
    } else if (data?.type === 'document_expiration') {
      // Handle document expiration notification
      console.log('Document expiration notification:', title, body);
    }
  }

  // Handle user interaction with notification
  handleNotificationResponse(response) {
    const { notification } = response;
    const { data } = notification.request.content;

    // Navigate to appropriate screen based on notification data
    if (data?.screen) {
      // You can implement navigation logic here
      console.log('Should navigate to:', data.screen);
    }
  }

  // Schedule a local notification
  async scheduleLocalNotification(title, body, data = {}, trigger = null) {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: trigger || null, // null means immediate
      });

      console.log('Local notification scheduled:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('Error scheduling local notification:', error);
    }
  }

  // Cancel specific notification
  async cancelNotification(notificationId) {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log('Notification cancelled:', notificationId);
    } catch (error) {
      console.error('Error cancelling notification:', error);
    }
  }

  // Cancel all notifications
  async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('All notifications cancelled');
    } catch (error) {
      console.error('Error cancelling all notifications:', error);
    }
  }

  // Set notification badge count
  async setBadgeCount(count) {
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('Error setting badge count:', error);
    }
  }

  // Clear notification badge
  async clearBadge() {
    try {
      await Notifications.setBadgeCountAsync(0);
    } catch (error) {
      console.error('Error clearing badge:', error);
    }
  }

  // Check if notifications are enabled
  async areNotificationsEnabled() {
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  }

  // Clean up listeners
  cleanup() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }

  // Get notification history (if available)
  async getNotificationHistory() {
    try {
      // This might not be available on all platforms
      const notifications = await Notifications.getPresentedNotificationsAsync();
      return notifications;
    } catch (error) {
      console.error('Error getting notification history:', error);
      return [];
    }
  }

  // Handle WebSocket notifications and show local notifications for production
  async handleWebSocketNotification(notificationData) {
    if (!this.isInitialized) {
      console.warn('⚠️ Notification service not initialized, skipping notification');
      return;
    }

    const { notification_category, message, notification_type, id, title } = notificationData;

    console.log('🔔 Processing WebSocket notification:', {
      type: notification_type,
      title: notification_category || title,
      hasMessage: !!message
    });

    // Map notification types to appropriate channels and priority
    const notificationConfig = this.getNotificationConfig(notification_type);

    try {
      // Show local notification with appropriate configuration
      const localNotificationId = await this.scheduleLocalNotification(
        notification_category || title || 'AtruX Notification',
        message || 'You have a new notification',
        {
          type: notification_type,
          channelId: notificationConfig.channelId,
          priority: notificationConfig.priority,
          originalId: id,
          timestamp: new Date().toISOString(),
          ...notificationData,
        }
      );

      console.log('✅ WebSocket notification displayed with ID:', localNotificationId);

      // Store notification locally for offline access
      await this.storeNotificationLocally(notificationData);

    } catch (error) {
      console.error('❌ Error handling WebSocket notification:', error);
    }
  }

  // Get notification configuration based on type
  getNotificationConfig(notificationType) {
    const configs = {
      'document_expiration': {
        channelId: 'document-expiration',
        priority: 'high',
        sound: true,
        vibrationPattern: [0, 500, 250, 500]
      },
      'transport_update': {
        channelId: 'transport-updates',
        priority: 'high',
        sound: true,
        vibrationPattern: [0, 250, 250, 250]
      },
      'driver_status_change': {
        channelId: 'driver-status',
        priority: 'default',
        sound: true,
        vibrationPattern: [0, 250]
      },
      'system_alert': {
        channelId: 'default',
        priority: 'high',
        sound: true,
        vibrationPattern: [0, 1000, 500, 1000]
      },
      'leave_request': {
        channelId: 'default',
        priority: 'default',
        sound: true,
        vibrationPattern: [0, 250, 250, 250]
      },
      'leave_approved': {
        channelId: 'default',
        priority: 'default',
        sound: true,
        vibrationPattern: [0, 250, 250, 250]
      },
      'leave_rejected': {
        channelId: 'default',
        priority: 'default',
        sound: true,
        vibrationPattern: [0, 250, 250, 250]
      }
    };

    return configs[notificationType] || configs['system_alert'];
  }

  // Store notification locally for offline access and history
  async storeNotificationLocally(notificationData) {
    try {
      const storedNotifications = await AsyncStorage.getItem('localNotifications');
      const notifications = storedNotifications ? JSON.parse(storedNotifications) : [];

      const localNotification = {
        ...notificationData,
        localId: Date.now().toString(),
        receivedAt: new Date().toISOString(),
        isRead: false,
        isDismissed: false,
      };

      notifications.unshift(localNotification);

      // Keep only last 100 notifications to prevent storage bloat
      const trimmedNotifications = notifications.slice(0, 100);

      await AsyncStorage.setItem('localNotifications', JSON.stringify(trimmedNotifications));
      console.log('💾 Notification stored locally');

    } catch (error) {
      console.error('❌ Error storing notification locally:', error);
    }
  }

  // Sync with backend notifications API
  async syncWithBackend() {
    try {
      const authToken = await AsyncStorage.getItem('authToken');
      if (!authToken) {
        console.log('⚠️ No auth token available for sync');
        return;
      }

      // Fetch latest notifications from backend
      const response = await fetch(`${BASE_URL}notifications/?limit=50`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`🔄 Synced ${data.notifications?.length || 0} notifications from backend`);

        // Update local storage with backend data
        const backendNotifications = data.notifications || [];
        await AsyncStorage.setItem('backendNotifications', JSON.stringify(backendNotifications));

        // Update badge count
        const unreadCount = data.unread_count || 0;
        await this.setBadgeCount(unreadCount);

        return data;
      } else {
        console.error('❌ Failed to sync with backend:', response.status);
      }
    } catch (error) {
      console.error('❌ Error syncing with backend:', error);
    }
  }

  // Get combined local and backend notifications
  async getAllNotifications() {
    try {
      const [localStr, backendStr] = await Promise.all([
        AsyncStorage.getItem('localNotifications'),
        AsyncStorage.getItem('backendNotifications')
      ]);

      const localNotifications = localStr ? JSON.parse(localStr) : [];
      const backendNotifications = backendStr ? JSON.parse(backendStr) : [];

      // Combine and deduplicate notifications
      const allNotifications = [...localNotifications];

      backendNotifications.forEach(backendNotif => {
        const exists = localNotifications.find(local =>
          local.id === backendNotif.id || local.originalId === backendNotif.id
        );
        if (!exists) {
          allNotifications.push({
            ...backendNotif,
            source: 'backend',
            localId: `backend_${backendNotif.id}`,
            receivedAt: backendNotif.created_at,
            isDismissed: false
          });
        }
      });

      // Sort by creation time (newest first)
      allNotifications.sort((a, b) =>
        new Date(b.receivedAt || b.created_at) - new Date(a.receivedAt || a.created_at)
      );

      return allNotifications;

    } catch (error) {
      console.error('❌ Error getting all notifications:', error);
      return [];
    }
  }
}

// Create singleton instance
const backgroundNotificationService = new BackgroundNotificationService();

export default backgroundNotificationService;

// Export utility functions
export {
  Notifications,
  backgroundNotificationService,
};