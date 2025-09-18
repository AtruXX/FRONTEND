import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NotificationUtils } from '../../services/notificationService';

const NotificationItem = ({
  notification,
  onPress,
  onMarkAsRead,
  onDismiss,
  showActions = true
}) => {
  const getNotificationIcon = () => {
    return NotificationUtils.getNotificationIcon(notification.notification_type);
  };

  const getNotificationColor = () => {
    return NotificationUtils.getNotificationColor(notification.notification_type);
  };

  const formatTimestamp = () => {
    return NotificationUtils.formatTimestamp(notification.created_at);
  };

  const handlePress = () => {
    if (!notification.is_read && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
    if (onPress) {
      onPress(notification);
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        !notification.is_read && styles.unreadContainer
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.leftContent}>
        <View style={[styles.iconContainer, { backgroundColor: getNotificationColor() }]}>
          <Ionicons
            name={getNotificationIcon()}
            size={20}
            color="white"
          />
        </View>
      </View>

      <View style={styles.middleContent}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>
            {notification.title}
          </Text>
          <Text style={styles.timestamp}>
            {formatTimestamp()}
          </Text>
        </View>

        <Text style={styles.message} numberOfLines={2}>
          {notification.message}
        </Text>

        {notification.data && Object.keys(notification.data).length > 0 && (
          <View style={styles.metaInfo}>
            {notification.user_id && (
              <Text style={styles.metaText}>User: {notification.user_id}</Text>
            )}
            {notification.truck_id && (
              <Text style={styles.metaText}>Truck: {notification.truck_id}</Text>
            )}
            {notification.trailer_id && (
              <Text style={styles.metaText}>Trailer: {notification.trailer_id}</Text>
            )}
          </View>
        )}
      </View>

      {showActions && (
        <View style={styles.rightContent}>
          {!notification.is_read && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={(e) => {
                e.stopPropagation();
                onMarkAsRead && onMarkAsRead(notification.id);
              }}
            >
              <Ionicons name="checkmark-circle-outline" size={20} color="#4ECDC4" />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.actionButton}
            onPress={(e) => {
              e.stopPropagation();
              onDismiss && onDismiss(notification.id);
            }}
          >
            <Ionicons name="close-circle-outline" size={20} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
      )}

      {!notification.is_read && (
        <View style={styles.unreadIndicator} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    position: 'relative',
  },
  unreadContainer: {
    backgroundColor: '#f8f9fa',
  },
  leftContent: {
    marginRight: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  middleContent: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
    marginRight: 8,
  },
  timestamp: {
    fontSize: 12,
    color: '#888',
  },
  message: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 4,
  },
  metaInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#888',
    marginRight: 12,
    marginBottom: 2,
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
  unreadIndicator: {
    position: 'absolute',
    right: 8,
    top: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6366F1',
  },
});

export default NotificationItem;