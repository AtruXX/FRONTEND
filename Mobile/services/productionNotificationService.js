// Production-ready notification service with cross-platform background processing
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { Platform, AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../utils/BASE_URL.js';

// Background task names for cross-platform support
const BACKGROUND_NOTIFICATION_TASK = 'background-notification-sync';
const BACKGROUND_WEBSOCKET_TASK = 'background-websocket-check';

// Configure notification behavior for production
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    priority: Platform.OS === 'android' ? Notifications.AndroidNotificationPriority.HIGH : undefined,
  }),
});

// Define background tasks for cross-platform support
TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, async () => {
  try {
    console.log('🔄 Running background notification sync...');

    // Get auth token
    const authToken = await AsyncStorage.getItem('authToken');
    if (!authToken) {
      console.log('❌ No auth token for background sync');
      return BackgroundFetch.BackgroundFetchResult.Failed;
    }

    // Fetch notifications from backend
    const response = await fetch(`${BASE_URL}notifications/?limit=20`, {
      method: 'GET',
      headers: {
        'Authorization': `Token ${authToken}`,
        'Content-Type': 'application/json',
      },
      timeout: 15000, // 15 second timeout for background tasks
    });

    if (response.ok) {
      const data = await response.json();

      // Check for new notifications
      const lastSyncTime = await AsyncStorage.getItem('lastNotificationSync');
      const newNotifications = data.results?.filter(notification => {
        if (!lastSyncTime) return true;
        return new Date(notification.created_at) > new Date(lastSyncTime);
      }) || [];

      // Show notifications for new items
      for (const notification of newNotifications) {
        if (!notification.is_read) {
          await productionNotificationService.scheduleLocalNotification(
            notification.title || 'AtruX Notification',
            notification.message || 'You have a new notification',
            {
              notificationId: notification.id,
              type: notification.notification_type,
              priority: 'high',
              channelId: productionNotificationService.getNotificationConfig(notification.notification_type).channelId
            }
          );
        }
      }

      // Update last sync time
      await AsyncStorage.setItem('lastNotificationSync', new Date().toISOString());

      // Update badge count
      await Notifications.setBadgeCountAsync(data.unread_count || 0);

      console.log(`✅ Background sync: ${newNotifications.length} new notifications`);
      return BackgroundFetch.BackgroundFetchResult.NewData;
    } else {
      console.log('❌ Background sync failed:', response.status);
      return BackgroundFetch.BackgroundFetchResult.Failed;
    }
  } catch (error) {
    console.error('❌ Background task error:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

TaskManager.defineTask(BACKGROUND_WEBSOCKET_TASK, async () => {
  try {
    console.log('🌐 Checking WebSocket connection status...');

    // Check if WebSocket should be reconnected
    const lastActiveTime = await AsyncStorage.getItem('lastActiveTime');
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;

    if (lastActiveTime && (now - parseInt(lastActiveTime)) > fiveMinutes) {
      // App has been in background for more than 5 minutes
      // Store flag to reconnect WebSocket when app becomes active
      await AsyncStorage.setItem('shouldReconnectWebSocket', 'true');
      console.log('📱 Marked WebSocket for reconnection');
    }

    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error('❌ WebSocket check error:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

class ProductionNotificationService {
  constructor() {
    this.expoPushToken = null;
    this.notificationListener = null;
    this.responseListener = null;
    this.appStateListener = null;
    this.isInitialized = false;
    this.syncInterval = null;
    this.backgroundTasksRegistered = false;
    this.isAndroidDevice = Platform.OS === 'android' && Device.isDevice;
    this.isIOSDevice = Platform.OS === 'ios' && Device.isDevice;
  }

  // Initialize the production notification service
  async initialize() {
    try {
      console.log('🚀 Initializing production notification service...');

      if (this.isInitialized) {
        console.log('✅ Service already initialized');
        return true;
      }

      // Set up notification channels for Android
      await this.setupNotificationChannels();

      // Request permissions and get token
      const hasPermissions = await this.requestPermissions();
      if (!hasPermissions) {
        console.warn('⚠️ Notification permissions not granted');
        return false;
      }

      // Get push token
      await this.getPushToken();

      // Set up listeners
      this.setupNotificationListeners();
      this.setupAppStateListener();

      // Set up periodic backend sync
      this.setupBackendSync();

      // Set up background tasks for both platforms
      if (this.isAndroidDevice || this.isIOSDevice) {
        try {
          await this.setupBackgroundTasks();
        } catch (backgroundError) {
          console.warn('⚠️ Background tasks setup failed but continuing initialization:', backgroundError);
          // Continue initialization even if background tasks fail
          // This allows the app to work without background sync
        }
      } else {
        console.log('📱 Skipping background tasks setup - running on simulator/emulator');
      }

      this.isInitialized = true;
      console.log('✅ Production notification service initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize production notification service:', error);
      return false;
    }
  }

  // Setup notification channels (Android) and categories (iOS)
  async setupNotificationChannels() {
    if (Platform.OS === 'android') {
      // Default channel
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#1976d2',
        description: 'General notifications',
        enableLights: true,
        enableVibrate: true,
        showBadge: true,
      });

      // Transport updates
      await Notifications.setNotificationChannelAsync('transport-updates', {
        name: 'Transport Updates',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#1976d2',
        description: 'Transport status updates',
        enableLights: true,
        enableVibrate: true,
        showBadge: true,
      });

      // Document expiration
      await Notifications.setNotificationChannelAsync('document-expiration', {
        name: 'Document Expiration',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 500, 250, 500],
        lightColor: '#FF8C00',
        description: 'Document expiration warnings',
        enableLights: true,
        enableVibrate: true,
        showBadge: true,
      });

      // Driver status
      await Notifications.setNotificationChannelAsync('driver-status', {
        name: 'Driver Status',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250],
        lightColor: '#4CAF50',
        description: 'Driver status changes',
        enableLights: true,
        enableVibrate: true,
        showBadge: false,
      });

      // Background sync
      await Notifications.setNotificationChannelAsync('background-sync', {
        name: 'Background Sync',
        importance: Notifications.AndroidImportance.LOW,
        vibrationPattern: [],
        description: 'Background synchronization notifications',
        enableLights: false,
        enableVibrate: false,
        showBadge: false,
      });

      // Set up notification categories with actions
      await this.setupNotificationCategories();

      console.log('📱 Android notification channels configured');
    } else if (Platform.OS === 'ios') {
      // iOS notification categories
      await this.setupIOSNotificationCategories();
      console.log('🍎 iOS notification categories configured');
    }
  }

  // Setup notification categories with action buttons (Android)
  async setupNotificationCategories() {
    if (Platform.OS === 'android') {
      try {
        // Transport action category
        await Notifications.setNotificationCategoryAsync('transport_actions', [
          {
            identifier: 'view_transport',
            buttonTitle: 'View Details',
            options: {
              opensAppToForeground: true,
            },
          },
          {
            identifier: 'mark_read',
            buttonTitle: 'Mark Read',
            options: {
              opensAppToForeground: false,
            },
          },
        ]);

        // Document action category
        await Notifications.setNotificationCategoryAsync('document_actions', [
          {
            identifier: 'view_documents',
            buttonTitle: 'View Document',
            options: {
              opensAppToForeground: true,
            },
          },
          {
            identifier: 'mark_read',
            buttonTitle: 'Mark Read',
            options: {
              opensAppToForeground: false,
            },
          },
        ]);

        console.log('📱 Android notification categories configured');
      } catch (error) {
        console.error('❌ Error setting up notification categories:', error);
      }
    }
  }

  // Setup iOS notification categories
  async setupIOSNotificationCategories() {
    try {
      // Transport action category for iOS
      await Notifications.setNotificationCategoryAsync('transport_actions', [
        {
          identifier: 'view_transport',
          buttonTitle: 'View Details',
          options: {
            opensAppToForeground: true,
          },
        },
        {
          identifier: 'mark_read',
          buttonTitle: 'Mark as Read',
          options: {
            opensAppToForeground: false,
          },
        },
      ]);

      // Document action category for iOS
      await Notifications.setNotificationCategoryAsync('document_actions', [
        {
          identifier: 'view_documents',
          buttonTitle: 'View Document',
          options: {
            opensAppToForeground: true,
          },
        },
        {
          identifier: 'mark_read',
          buttonTitle: 'Mark as Read',
          options: {
            opensAppToForeground: false,
          },
        },
      ]);

      // Leave request category for iOS
      await Notifications.setNotificationCategoryAsync('leave_actions', [
        {
          identifier: 'view_leave',
          buttonTitle: 'View Request',
          options: {
            opensAppToForeground: true,
          },
        },
        {
          identifier: 'mark_read',
          buttonTitle: 'Mark as Read',
          options: {
            opensAppToForeground: false,
          },
        },
      ]);

      console.log('🍎 iOS notification categories configured');
    } catch (error) {
      console.error('❌ Error setting up iOS notification categories:', error);
    }
  }

  // Request notification permissions
  async requestPermissions() {
    try {
      if (!Device.isDevice) {
        console.warn('⚠️ Must use physical device for Push Notifications');
        return false;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
            allowAnnouncements: true,
          },
        });
        finalStatus = status;
      }

      const granted = finalStatus === 'granted';
      console.log(`🔐 Notification permissions: ${granted ? 'GRANTED' : 'DENIED'}`);
      return granted;
    } catch (error) {
      console.error('❌ Error requesting permissions:', error);
      return false;
    }
  }

  // Get push token
  async getPushToken() {
    try {
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      this.expoPushToken = token;

      // Store token locally
      await AsyncStorage.setItem('expoPushToken', token);
      await AsyncStorage.setItem('tokenUpdatedAt', new Date().toISOString());

      console.log('📱 Push token obtained:', token.substring(0, 50) + '...');
      return token;
    } catch (error) {
      console.error('❌ Error getting push token:', error);
      return null;
    }
  }

  // Setup notification listeners
  setupNotificationListeners() {
    // Listener for notifications received while app is foregrounded
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('📬 Notification received:', notification.request.content.title);
      this.handleForegroundNotification(notification);
    });

    // Listener for when user taps notification
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👆 Notification tapped:', response.notification.request.content.title);
      this.handleNotificationResponse(response);
    });

    console.log('👂 Notification listeners set up');
  }

  // Setup app state listener for badge management and cross-platform background handling
  setupAppStateListener() {
    this.appStateListener = AppState.addEventListener('change', async (nextAppState) => {
      if (nextAppState === 'active') {
        // App came to foreground
        await AsyncStorage.setItem('lastActiveTime', Date.now().toString());

        // Clear badge
        this.clearBadge();

        // Sync with backend
        this.syncWithBackend();

        // Check if WebSocket needs reconnection (both platforms)
        if (this.isAndroidDevice || this.isIOSDevice) {
          const shouldReconnect = await AsyncStorage.getItem('shouldReconnectWebSocket');
          if (shouldReconnect === 'true') {
            console.log('🔄 Reconnecting WebSocket after background...');
            await AsyncStorage.removeItem('shouldReconnectWebSocket');
            // Trigger WebSocket reconnection via notification context
            // This will be handled by the NotificationsContext
          }
        }
      } else if (nextAppState === 'background') {
        // App went to background
        await AsyncStorage.setItem('lastActiveTime', Date.now().toString());

        // Ensure background tasks are still registered (both platforms)
        if (this.isAndroidDevice || this.isIOSDevice) {
          this.ensureBackgroundTasks();
        }
      }
    });

    console.log('📱 App state listener set up');
  }

  // Setup background tasks for both Android and iOS
  async setupBackgroundTasks() {
    try {
      console.log(`${Platform.OS === 'ios' ? '🍎' : '🤖'} Setting up ${Platform.OS} background tasks...`);

      // Check iOS background fetch status first
      if (Platform.OS === 'ios') {
        const backgroundFetchStatus = await BackgroundFetch.getStatusAsync();

        if (backgroundFetchStatus === BackgroundFetch.BackgroundFetchStatus.Denied ||
            backgroundFetchStatus === BackgroundFetch.BackgroundFetchStatus.Restricted) {
          console.log('⚠️ iOS Background Fetch is disabled or restricted');
          console.log('📋 Please ensure UIBackgroundModes includes "background-fetch" in Info.plist');
          this.backgroundTasksRegistered = false;
          return;
        }

        if (backgroundFetchStatus === BackgroundFetch.BackgroundFetchStatus.Available) {
          console.log('✅ iOS Background Fetch is available');
        } else {
          console.log('⚠️ iOS Background Fetch status unknown, proceeding with caution');
        }
      }

      // Different intervals for iOS vs Android due to platform limitations
      const notificationInterval = Platform.OS === 'ios' ? 60 * 60 : 15 * 60; // iOS: 1 hour, Android: 15 minutes
      const websocketInterval = Platform.OS === 'ios' ? 120 * 60 : 30 * 60; // iOS: 2 hours, Android: 30 minutes

      // Register background fetch for notification sync
      try {
        await BackgroundFetch.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK, {
          minimumInterval: notificationInterval,
          stopOnTerminate: false, // Continue after app termination
          startOnBoot: Platform.OS === 'android', // Only Android supports startOnBoot
        });
        console.log(`✅ ${Platform.OS} notification background task registered`);
      } catch (taskError) {
        console.error(`❌ Failed to register notification task on ${Platform.OS}:`, taskError);
        if (Platform.OS === 'ios') {
          console.log('💡 This might be due to missing Info.plist configuration or iOS simulator limitations');
        }
        throw taskError;
      }

      // Register WebSocket check task
      try {
        await BackgroundFetch.registerTaskAsync(BACKGROUND_WEBSOCKET_TASK, {
          minimumInterval: websocketInterval,
          stopOnTerminate: false,
          startOnBoot: Platform.OS === 'android',
        });
        console.log(`✅ ${Platform.OS} WebSocket background task registered`);
      } catch (taskError) {
        console.error(`❌ Failed to register WebSocket task on ${Platform.OS}:`, taskError);
        if (Platform.OS === 'ios') {
          console.log('💡 This might be due to missing Info.plist configuration or iOS simulator limitations');
        }
        throw taskError;
      }

      this.backgroundTasksRegistered = true;
      console.log(`✅ ${Platform.OS} background tasks registered successfully`);
    } catch (error) {
      console.error(`❌ Error setting up ${Platform.OS} background tasks:`, error);
      this.backgroundTasksRegistered = false;

      // On iOS, if background fetch is not configured, provide helpful guidance
      if (Platform.OS === 'ios' && error.message?.includes('Background Fetch has not been configured')) {
        console.log('🔧 iOS BACKGROUND FETCH CONFIGURATION ISSUE:');
        console.log('📋 The app.json is configured but iOS native build may be missing background capabilities.');
        console.log('🚨 SOLUTION: Rebuild the iOS app with: npx expo run:ios');
        console.log('💡 Or if using EAS Build: eas build --platform ios');
        console.log('⚠️ Background notifications will be limited until rebuild is complete.');
        console.log('');
        console.log('Current app.json has:');
        console.log('✅ "UIBackgroundModes": ["background-fetch", "remote-notification"]');
        console.log('✅ expo-background-fetch plugin configured');
        console.log('');
        console.log('If this persists after rebuild, check:');
        console.log('1. iOS Simulator limitations (test on real device)');
        console.log('2. iOS Settings > General > Background App Refresh');
        console.log('3. iOS Settings > Notifications > [App Name] > Allow Notifications');
      }
    }
  }

  // Ensure background tasks are still registered (both platforms)
  async ensureBackgroundTasks() {
    try {
      const isNotificationTaskRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_NOTIFICATION_TASK);
      const isWebSocketTaskRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_WEBSOCKET_TASK);

      if (!isNotificationTaskRegistered || !isWebSocketTaskRegistered) {
        console.log(`⚠️ Re-registering ${Platform.OS} background tasks...`);
        await this.setupBackgroundTasks();
      }
    } catch (error) {
      console.error(`❌ Error checking ${Platform.OS} background tasks:`, error);
    }
  }

  // Setup periodic backend sync
  setupBackendSync() {
    // Sync every 5 minutes
    this.syncInterval = setInterval(() => {
      this.syncWithBackend();
    }, 5 * 60 * 1000);

    console.log('🔄 Backend sync scheduled (5 min intervals)');
  }

  // Handle notification received in foreground
  handleForegroundNotification(notification) {
    const { title, body, data } = notification.request.content;

    // You can customize in-app notification display here
    console.log(`📬 Foreground notification: ${title} - ${body}`);

    // Update badge count if needed
    this.updateBadgeFromData(data);
  }

  // Handle user interaction with notification
  handleNotificationResponse(response) {
    const { notification } = response;
    const { title, data } = notification.request.content;

    console.log(`🎯 User tapped notification: ${title}`);

    // Handle navigation based on notification data
    if (data?.action === 'navigate' && data?.screen) {
      console.log(`🧭 Should navigate to: ${data.screen}`);
      // Implement navigation logic here
    }

    // Mark as read if it has an ID
    if (data?.originalId) {
      this.markNotificationAsRead(data.originalId);
    }
  }

  // Schedule local notification with Android optimization
  async scheduleLocalNotification(title, body, data = {}, trigger = null) {
    try {
      const config = this.getNotificationConfig(data.type || 'system_alert');

      const notificationContent = {
        title,
        body,
        data: {
          ...data,
          timestamp: Date.now(),
          platform: Platform.OS,
        },
        sound: true,
        priority: data.priority === 'high' ?
          Notifications.AndroidNotificationPriority.HIGH :
          Notifications.AndroidNotificationPriority.DEFAULT,
      };

      // Platform-specific enhancements
      if (Platform.OS === 'android') {
        notificationContent.channelId = data.channelId || config.channelId;
        notificationContent.color = '#1976d2'; // AtruX brand color
        notificationContent.sticky = data.priority === 'high'; // Make high priority notifications sticky
        notificationContent.vibrate = data.priority === 'high' ? [0, 250, 250, 250] : [0, 250];

        // Add large icon for important notifications
        if (data.priority === 'high') {
          notificationContent.largeIcon = './assets/notification-icon.png';
        }

        // Add action buttons for certain notification types
        if (data.type === 'transport_update') {
          notificationContent.categoryIdentifier = 'transport_actions';
        } else if (data.type === 'document_expiration') {
          notificationContent.categoryIdentifier = 'document_actions';
        }
      } else if (Platform.OS === 'ios') {
        // iOS-specific enhancements
        notificationContent.sound = data.priority === 'high' ? 'default' : true;
        notificationContent.badge = 1; // iOS badge management
        notificationContent.interruptionLevel = data.priority === 'high' ? 'timeSensitive' : 'active';

        // Add action buttons for certain notification types
        if (data.type === 'transport_update') {
          notificationContent.categoryIdentifier = 'transport_actions';
        } else if (data.type === 'document_expiration') {
          notificationContent.categoryIdentifier = 'document_actions';
        } else if (data.type?.includes('leave')) {
          notificationContent.categoryIdentifier = 'leave_actions';
        }

        // Critical alerts for high priority (requires special entitlement)
        if (data.priority === 'high' && data.type === 'document_expiration') {
          notificationContent.critical = true;
          notificationContent.criticalSoundVolume = 1.0;
        }
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: notificationContent,
        trigger: trigger || null,
      });

      console.log('📅 Local notification scheduled:', notificationId);

      // Store notification locally for tracking
      await this.storeNotificationLocally({
        ...data,
        title,
        body,
        localNotificationId: notificationId,
        scheduledAt: new Date().toISOString(),
      });

      return notificationId;
    } catch (error) {
      console.error('❌ Error scheduling notification:', error);
      throw error;
    }
  }

  // Handle WebSocket notifications
  async handleWebSocketNotification(notificationData) {
    if (!this.isInitialized) {
      console.warn('⚠️ Service not initialized, skipping notification');
      return;
    }

    const { notification_category, message, notification_type, title } = notificationData;

    console.log('🌐 Processing WebSocket notification:', notification_type);

    try {
      // Get notification configuration
      const config = this.getNotificationConfig(notification_type);

      // Schedule local notification
      await this.scheduleLocalNotification(
        notification_category || title || 'AtruX Notification',
        message || 'You have a new notification',
        {
          type: notification_type,
          channelId: config.channelId,
          priority: config.priority,
          ...notificationData,
        }
      );

      // Store locally for offline access
      await this.storeNotificationLocally(notificationData);

      // Update badge count
      this.updateBadgeCount(1);

      console.log('✅ WebSocket notification processed');
    } catch (error) {
      console.error('❌ Error processing WebSocket notification:', error);
    }
  }

  // Get notification configuration
  getNotificationConfig(type) {
    const configs = {
      'document_expiration': { channelId: 'document-expiration', priority: 'high' },
      'transport_update': { channelId: 'transport-updates', priority: 'high' },
      'driver_status_change': { channelId: 'driver-status', priority: 'default' },
      'system_alert': { channelId: 'default', priority: 'high' },
      'leave_request': { channelId: 'default', priority: 'default' },
      'leave_approved': { channelId: 'default', priority: 'default' },
      'leave_rejected': { channelId: 'default', priority: 'default' },
    };

    return configs[type] || configs['system_alert'];
  }

  // Store notification locally
  async storeNotificationLocally(notificationData) {
    try {
      const stored = await AsyncStorage.getItem('localNotifications');
      const notifications = stored ? JSON.parse(stored) : [];

      notifications.unshift({
        ...notificationData,
        localId: Date.now().toString(),
        receivedAt: new Date().toISOString(),
        isRead: false,
      });

      // Keep only last 100 notifications
      const trimmed = notifications.slice(0, 100);
      await AsyncStorage.setItem('localNotifications', JSON.stringify(trimmed));

      console.log('💾 Notification stored locally');
    } catch (error) {
      console.error('❌ Error storing notification locally:', error);
    }
  }

  // Sync with backend
  async syncWithBackend() {
    try {
      const authToken = await AsyncStorage.getItem('authToken');
      if (!authToken) return;

      const response = await fetch(`${BASE_URL}notifications/?limit=50`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();

        // Update badge with unread count
        await this.setBadgeCount(data.unread_count || 0);

        // Store backend notifications
        await AsyncStorage.setItem('backendNotifications', JSON.stringify(data.notifications || []));

        console.log(`🔄 Synced: ${data.notifications?.length || 0} notifications, ${data.unread_count || 0} unread`);
        return data;
      }
    } catch (error) {
      console.error('❌ Sync error:', error);
    }
  }

  // Mark notification as read
  async markNotificationAsRead(notificationId) {
    try {
      const authToken = await AsyncStorage.getItem('authToken');
      if (!authToken) return false;

      const response = await fetch(`${BASE_URL}notifications/${notificationId}/read/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      return response.ok;
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
      return false;
    }
  }

  // Badge management
  async setBadgeCount(count) {
    try {
      await Notifications.setBadgeCountAsync(count);
      console.log(`🔢 Badge count set to: ${count}`);
    } catch (error) {
      console.error('❌ Error setting badge count:', error);
    }
  }

  async clearBadge() {
    await this.setBadgeCount(0);
  }

  async updateBadgeCount(increment) {
    try {
      const current = await AsyncStorage.getItem('badgeCount');
      const newCount = Math.max(0, (parseInt(current) || 0) + increment);
      await AsyncStorage.setItem('badgeCount', newCount.toString());
      await this.setBadgeCount(newCount);
    } catch (error) {
      console.error('❌ Error updating badge count:', error);
    }
  }

  updateBadgeFromData(data) {
    if (data?.unreadCount !== undefined) {
      this.setBadgeCount(data.unreadCount);
    }
  }

  // Check if notifications are enabled
  async areNotificationsEnabled() {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      return false;
    }
  }

  // Test notifications
  async sendTestNotification() {
    try {
      await this.scheduleLocalNotification(
        'Test Notification',
        'Background notifications are working correctly!',
        { type: 'test', timestamp: Date.now() }
      );
      console.log('✅ Test notification sent');
      return true;
    } catch (error) {
      console.error('❌ Error sending test notification:', error);
      return false;
    }
  }

  // Cleanup
  cleanup() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
    if (this.appStateListener) {
      this.appStateListener.remove();
    }
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.isInitialized = false;
    console.log('🧹 Production notification service cleaned up');
  }

  // Get background task status (cross-platform)
  async getBackgroundStatus() {
    if (!this.isAndroidDevice && !this.isIOSDevice) {
      return { supported: false, reason: 'Not a physical device or unsupported platform' };
    }

    try {
      const notificationTaskRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_NOTIFICATION_TASK);
      const websocketTaskRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_WEBSOCKET_TASK);
      const backgroundFetchStatus = await BackgroundFetch.getStatusAsync();

      return {
        supported: true,
        platform: Platform.OS,
        backgroundFetchStatus,
        tasks: {
          notificationSync: {
            registered: notificationTaskRegistered,
            name: BACKGROUND_NOTIFICATION_TASK,
          },
          websocketCheck: {
            registered: websocketTaskRegistered,
            name: BACKGROUND_WEBSOCKET_TASK,
          },
        },
        lastBackgroundSync: await AsyncStorage.getItem('lastNotificationSync'),
        shouldReconnectWebSocket: await AsyncStorage.getItem('shouldReconnectWebSocket') === 'true',
      };
    } catch (error) {
      console.error(`❌ Error getting ${Platform.OS} background status:`, error);
      return { supported: false, error: error.message, platform: Platform.OS };
    }
  }

  // Force background sync (for testing)
  async forceBackgroundSync() {
    if (!this.isAndroidDevice && !this.isIOSDevice) {
      console.warn('⚠️ Background sync only available on physical devices');
      return false;
    }

    try {
      console.log('🔄 Forcing background sync...');

      // Manually trigger the background task logic
      const authToken = await AsyncStorage.getItem('authToken');
      if (!authToken) {
        console.log('❌ No auth token for forced sync');
        return false;
      }

      const response = await fetch(`${BASE_URL}notifications/?limit=20`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        await AsyncStorage.setItem('lastNotificationSync', new Date().toISOString());
        await Notifications.setBadgeCountAsync(data.unread_count || 0);

        console.log('✅ Forced background sync completed');
        return true;
      } else {
        console.log('❌ Forced background sync failed:', response.status);
        return false;
      }
    } catch (error) {
      console.error('❌ Error during forced background sync:', error);
      return false;
    }
  }

  // Get service status
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      hasToken: !!this.expoPushToken,
      tokenPreview: this.expoPushToken ? this.expoPushToken.substring(0, 20) + '...' : null,
      lastSync: new Date().toISOString(),
      platform: Platform.OS,
      isAndroidDevice: this.isAndroidDevice,
      isIOSDevice: this.isIOSDevice,
      backgroundTasksRegistered: this.backgroundTasksRegistered,
    };
  }
}

// Create singleton instance
const productionNotificationService = new ProductionNotificationService();

export default productionNotificationService;
export { ProductionNotificationService };