import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from "../../utils/BASE_URL";
import {
  useGetNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useDismissNotificationMutation,
  useMarkAllNotificationsAsReadMutation,
  useDismissAllNotificationsMutation,
  NotificationUtils
} from '../../services/notificationService';
import productionNotificationService from '../../services/productionNotificationService';

const NotificationsContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};

export const NotificationsProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const ws = useRef(null);
  const reconnectTimeout = useRef(null);
  const [userId, setUserId] = useState(null);

  // Backend API hooks
  const { data: notificationsData, refetch: refetchNotifications, isLoading } = useGetNotificationsQuery();
  const [markAsReadMutation] = useMarkNotificationAsReadMutation();
  const [dismissMutation] = useDismissNotificationMutation();
  const [markAllAsReadMutation] = useMarkAllNotificationsAsReadMutation();
  const [dismissAllMutation] = useDismissAllNotificationsMutation();

  // Load notifications from backend API
  useEffect(() => {
    if (notificationsData?.results) {
      setNotifications(notificationsData.results);
      const unread = notificationsData.results.filter(n => !n.is_read).length;
      setUnreadCount(unread);
    }
  }, [notificationsData]);

  const connectWebSocket = async () => {
    try {
      const storedUserId = await AsyncStorage.getItem('driverId') || await AsyncStorage.getItem('userId');
      if (!storedUserId) {
        console.log('No user ID found for WebSocket connection');
        return;
      }

      setUserId(storedUserId);

      // Use individual user notification channel as per backend specs
      const wsUrl = `wss://atrux-717ecf8763ea.herokuapp.com/ws/notifications-server/${storedUserId}/`;
      console.log('Connecting to WebSocket:', wsUrl);

      // Close existing connection if any
      if (ws.current && ws.current.readyState !== WebSocket.CLOSED) {
        ws.current.close();
      }

      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log('WebSocket connected to individual notification channel');
        setIsConnected(true);
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket message received:', data);

          // Handle connection established
          if (data.type === 'connection_established') {
            console.log('WebSocket connection established:', data.message);
            return;
          }

          // Handle notifications - support both message formats
          if (data.type === 'notification') {
            if (data.message) {
              // Backend format: { type: "notification", message: { ... } }
              handleIncomingNotification(data.message);
            } else {
              // Direct format: { type: "notification", notification_category: "...", message: "..." }
              handleIncomingNotification(data);
            }
          }

          // Also handle direct notification format without type wrapper
          if (data.notification_category && data.message && !data.type) {
            handleIncomingNotification(data);
          }

        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
          console.error('Raw message data:', event.data);
        }
      };

      ws.current.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);

        // Exponential backoff for reconnection
        const backoffTime = Math.min(3000 * Math.pow(1.5, reconnectTimeout.current?.attempts || 0), 30000);
        reconnectTimeout.current = setTimeout(() => {
          connectWebSocket();
        }, backoffTime);
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

    } catch (error) {
      console.error('Error connecting WebSocket:', error);
    }
  };

  const handleIncomingNotification = async (data) => {
    console.log('🔔 Processing incoming notification:', data);

    // Get current user details for logging
    const isDriverStr = await AsyncStorage.getItem('isDriver');
    const isDispatcherStr = await AsyncStorage.getItem('isDispatcher');
    const currentUserId = await AsyncStorage.getItem('driverId') || await AsyncStorage.getItem('userId');

    const userRole = isDriverStr === 'true' ? 'driver' :
                     isDispatcherStr === 'true' ? 'dispatcher' : 'unknown';

    console.log('🧑‍💼 Current user details:', {
      role: userRole,
      userId: currentUserId,
      isDriver: isDriverStr,
      isDispatcher: isDispatcherStr
    });

    // Map notification category to type
    const getNotificationType = (category) => {
      if (category?.toLowerCase().includes('documente')) return 'document_expiration';
      if (category?.toLowerCase().includes('sofer') || category?.toLowerCase().includes('status')) return 'driver_status_change';
      if (category?.toLowerCase().includes('transport')) return 'transport_update';
      return 'system_alert';
    };

    const notificationType = data.notification_type || getNotificationType(data.notification_category);

    console.log('📝 Notification details:', {
      type: notificationType,
      category: data.notification_category,
      message: data.message,
      notificationUserId: data.user_id,
      currentUserId: currentUserId
    });

    // DEFENSIVE FILTERING: While the backend should handle notification routing,
    // we'll add client-side filtering to prevent dispatcher notifications from showing in driver app
    if (userRole === 'driver') {
      // Driver should only receive notifications relevant to their work
      const allowedTypesForDriver = [
        'document_expiration',     // Document expiration alerts
        'transport_update',        // Transport-related updates
        'system_alert'            // General system notifications
      ];

      if (!allowedTypesForDriver.includes(notificationType)) {
        console.log(`🚫 FILTERED: Driver received ${notificationType} notification - rejecting as it's not relevant for drivers`);
        return; // Don't process this notification
      }

      // Special case: Reject driver_status_change notifications for drivers
      if (notificationType === 'driver_status_change') {
        console.log('🚫 FILTERED: Driver received driver_status_change notification - this should only go to dispatchers');
        return; // Don't process this notification
      }
    }

    console.log(`✅ ${userRole.toUpperCase()} received valid notification via individual channel: ${notificationType}`);

    // Transform backend notification format to frontend format
    const newNotification = {
      id: data.id || `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      notification_type: notificationType,
      title: data.notification_category || data.title || 'Notificare',
      message: data.message || '',
      data: data.data || {
        user_id: data.user_id,
        truck_id: data.truck_id,
        trailer_id: data.trailer_id
      },
      created_at: new Date().toISOString(),
      is_read: false,
      is_dismissed: false,
      user_id: data.user_id || userId,
      truck_id: data.truck_id,
      trailer_id: data.trailer_id
    };

    console.log('Transformed notification for', userRole, ':', newNotification);

    // Add to local state for real-time display
    setNotifications(prev => {
      // Avoid duplicates
      const existingIds = prev.map(n => n.id);
      if (existingIds.includes(newNotification.id)) {
        console.log('Notification already exists, skipping:', newNotification.id);
        return prev;
      }

      console.log('Adding new notification to state');
      return [newNotification, ...prev];
    });

    setUnreadCount(prev => {
      const newCount = prev + 1;
      // Update badge count for production notifications
      productionNotificationService.setBadgeCount(newCount);
      return newCount;
    });

    // Show production background notification if available
    if (productionNotificationService) {
      productionNotificationService.handleWebSocketNotification(data);
    }

    // Log for debugging
    console.log(`✅ ${userRole.toUpperCase()} received notification:`, newNotification.title, '-', newNotification.message);

    // Refetch from backend to sync with server state (delayed to avoid conflicts)
    setTimeout(() => {
      console.log('Refetching notifications from backend for sync');
      refetchNotifications();
    }, 2000);
  };

  const markAsRead = async (notificationId) => {
    try {
      await markAsReadMutation(notificationId);

      // Update local state optimistically
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, is_read: true }
            : notification
        )
      );

      setUnreadCount(prev => {
        const newCount = Math.max(0, prev - 1);
        // Update badge count for production notifications
        productionNotificationService.setBadgeCount(newCount);
        return newCount;
      });

      // Refetch to ensure sync
      refetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const dismissNotification = async (notificationId) => {
    try {
      await dismissMutation(notificationId);

      // Update local state optimistically
      setNotifications(prev => {
        const updated = prev.filter(notification => notification.id !== notificationId);
        const deletedNotification = prev.find(n => n.id === notificationId);
        if (deletedNotification && !deletedNotification.is_read) {
          setUnreadCount(count => {
            const newCount = Math.max(0, count - 1);
            // Update badge count for production notifications
            productionNotificationService.setBadgeCount(newCount);
            return newCount;
          });
        }
        return updated;
      });

      // Refetch to ensure sync
      refetchNotifications();
    } catch (error) {
      console.error('Error dismissing notification:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await markAllAsReadMutation();

      // Update local state optimistically
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, is_read: true }))
      );
      setUnreadCount(0);
      // Clear badge count for production notifications
      productionNotificationService.clearBadge();

      // Refetch to ensure sync
      refetchNotifications();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const dismissAllNotifications = async () => {
    try {
      await dismissAllMutation();

      // Update local state optimistically
      setNotifications([]);
      setUnreadCount(0);
      // Clear badge count for production notifications
      productionNotificationService.clearBadge();

      // Refetch to ensure sync
      refetchNotifications();
    } catch (error) {
      console.error('Error dismissing all notifications:', error);
    }
  };

  // Backward compatibility methods
  const deleteNotification = dismissNotification;
  const clearAllNotifications = dismissAllNotifications;

  // Send notification (if your server supports it) - keeping for backward compatibility
  const sendNotification = (message) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    }
  };

  // Initialize WebSocket connection and background notifications when user ID is available
  useEffect(() => {
    const initializeNotificationSystem = async () => {
      try {
        // Initialize production notification service in background (non-blocking)
        productionNotificationService.initialize()
          .then((serviceInitialized) => {
            if (serviceInitialized) {
              console.log('✅ Production notification service initialized');

              // Sync with backend in background
              productionNotificationService.syncWithBackend()
                .catch(error => console.log('Background sync failed:', error));

              console.log('🔔 Notification system fully initialized');
            } else {
              console.log('⚠️ Production notification service failed to initialize');
            }
          })
          .catch(error => {
            console.error('❌ Failed to initialize production notification service:', error);
          });

        // Connect to WebSocket immediately (non-blocking)
        connectWebSocket();

      } catch (error) {
        console.error('❌ Failed to initialize notification system:', error);
        // Fallback to basic WebSocket connection
        connectWebSocket();
      }
    };

    // Use setTimeout to make initialization non-blocking
    setTimeout(() => {
      initializeNotificationSystem();
    }, 100);

    return () => {
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
      if (ws.current) {
        ws.current.close();
      }
      // Clean up production notification service in background
      setTimeout(() => {
        productionNotificationService.cleanup();
      }, 0);
    };
  }, []);

  // Remove legacy local storage management since we're using backend API
  // The backend handles persistence

  const value = {
    notifications,
    unreadCount,
    isConnected,
    isLoading,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    dismissAllNotifications,
    // Backward compatibility
    deleteNotification,
    clearAllNotifications,
    sendNotification,
    userId,
    refetchNotifications,
    // Utility functions
    NotificationUtils
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};