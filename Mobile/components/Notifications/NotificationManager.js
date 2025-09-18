import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import NotificationToast from './NotificationToast';
import { useNotifications } from '../../Screens/NotificationsContext';

const NotificationManager = ({ navigation }) => {
  const { notifications } = useNotifications();
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    // Show toast for new notifications
    if (notifications.length > 0) {
      const latestNotification = notifications[0];

      // Check if this is a new notification (not already shown as toast)
      const isNewNotification = !toasts.find(toast => toast.id === latestNotification.id);

      if (isNewNotification && !latestNotification.is_read) {
        showToast(latestNotification);
      }
    }
  }, [notifications]);

  const showToast = (notification) => {
    const toastId = `toast_${notification.id}_${Date.now()}`;

    const newToast = {
      id: toastId,
      notification,
      timestamp: Date.now(),
    };

    setToasts(prev => [...prev, newToast]);

    // Auto-remove toast after delay
    setTimeout(() => {
      removeToast(toastId);
    }, 5000);
  };

  const removeToast = (toastId) => {
    setToasts(prev => prev.filter(toast => toast.id !== toastId));
  };

  const handleToastPress = (notification) => {
    // Handle navigation based on notification type
    switch (notification.notification_type) {
      case 'document_expiration':
        navigation?.navigate('DocumentsGeneral');
        break;
      case 'driver_status_change':
        navigation?.navigate('Profile');
        break;
      case 'transport_update':
        if (notification.data?.transport_id) {
          navigation?.navigate('TransportMainPage', {
            transportId: notification.data.transport_id
          });
        } else {
          navigation?.navigate('Transports');
        }
        break;
      default:
        // For system alerts or unknown types, navigate to notifications screen
        navigation?.navigate('NotificationsScreen');
        break;
    }
  };

  if (toasts.length === 0) {
    return null;
  }

  return (
    <View style={styles.container} pointerEvents="box-none">
      {toasts.map((toast, index) => (
        <NotificationToast
          key={toast.id}
          notification={toast.notification}
          onPress={handleToastPress}
          onDismiss={() => removeToast(toast.id)}
          position="top"
          style={{
            top: 100 + (index * 10), // Offset multiple toasts
            zIndex: 9999 - index,
          }}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    pointerEvents: 'box-none',
  },
});

export default NotificationManager;