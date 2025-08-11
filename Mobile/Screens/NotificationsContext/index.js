import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from "../../utils/BASE_URL";

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

  // WebSocket connection setup
  const connectWebSocket = async () => {
    try {
      // Get user ID from AsyncStorage or wherever you store it
      const storedUserId = await AsyncStorage.getItem('userId');
      if (!storedUserId) return;
      
      setUserId(storedUserId);
      
      // Replace with your WebSocket server URL
      const wsUrl = `wss://atrux-717ecf763ea.herokuapp.com/ws/notifications-server/`;
      
      ws.current = new WebSocket(wsUrl);
      
      ws.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        
        // Send user identification to server
        ws.current.send(JSON.stringify({
          type: 'authenticate',
          userId: storedUserId
        }));
      };
      
      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleIncomingNotification(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      ws.current.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        
        // Attempt to reconnect after 3 seconds
        reconnectTimeout.current = setTimeout(() => {
          connectWebSocket();
        }, 3000);
      };
      
      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
      
    } catch (error) {
      console.error('Error connecting WebSocket:', error);
    }
  };

  // Handle incoming notifications
  const handleIncomingNotification = (data) => {
    const newNotification = {
      id: data.id || Date.now().toString(),
      title: data.title || 'New Notification',
      message: data.message || '',
      type: data.type || 'info', // info, success, warning, error
      timestamp: data.timestamp || new Date().toISOString(),
      read: false,
      data: data.data || {} // Additional data
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);
    
    // You can also trigger local push notifications here
    // showLocalNotification(newNotification);
  };

  // Mark notification as read
  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
    
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  };

  // Delete notification
  const deleteNotification = (notificationId) => {
    setNotifications(prev => {
      const updated = prev.filter(notification => notification.id !== notificationId);
      const deletedNotification = prev.find(n => n.id === notificationId);
      if (deletedNotification && !deletedNotification.read) {
        setUnreadCount(count => Math.max(0, count - 1));
      }
      return updated;
    });
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  // Send notification (if your server supports it)
  const sendNotification = (message) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    }
  };

  // Initialize WebSocket connection when user ID is available
  useEffect(() => {
    connectWebSocket();
    
    return () => {
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  // Load notifications from storage on app start
  useEffect(() => {
    const loadStoredNotifications = async () => {
      try {
        const stored = await AsyncStorage.getItem('notifications');
        if (stored) {
          const parsedNotifications = JSON.parse(stored);
          setNotifications(parsedNotifications);
          
          const unread = parsedNotifications.filter(n => !n.read).length;
          setUnreadCount(unread);
        }
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
    };
    
    loadStoredNotifications();
  }, []);

  // Save notifications to storage whenever they change
  useEffect(() => {
    const saveNotifications = async () => {
      try {
        await AsyncStorage.setItem('notifications', JSON.stringify(notifications));
      } catch (error) {
        console.error('Error saving notifications:', error);
      }
    };
    
    if (notifications.length > 0) {
      saveNotifications();
    }
  }, [notifications]);

  const value = {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    sendNotification,
    userId
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};