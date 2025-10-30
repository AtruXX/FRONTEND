import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import NotificationItem from './NotificationItem';
import { useNotifications } from '../../Screens/NotificationsContext';
const NotificationsList = ({
  navigation,
  showHeader = true,
  emptyMessage = "Nu ai notificări",
  filterType = 'all'
}) => {
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    dismissNotification,
    markAllAsRead,
    dismissAllNotifications,
    refetchNotifications,
  } = useNotifications();
  const [refreshing, setRefreshing] = useState(false);
  // Filter notifications based on filterType
  const filteredNotifications = notifications.filter(notification => {
    switch (filterType) {
      case 'unread':
        return !notification.is_read;
      case 'documents':
        return notification.notification_type === 'document_expiration';
      case 'transport':
        return notification.notification_type === 'transport_update';
      case 'all':
      default:
        return true;
    }
  });
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetchNotifications();
    } catch (error) {
    } finally {
      setRefreshing(false);
    }
  };
  const handleMarkAllAsRead = () => {
    if (unreadCount === 0) return;
    Alert.alert(
      'Marchează toate ca citite',
      `Dorești să marchezi toate ${unreadCount} notificările ca citite?`,
      [
        {
          text: 'Anulează',
          style: 'cancel',
        },
        {
          text: 'Marchează',
          onPress: markAllAsRead,
        },
      ]
    );
  };
  const handleDismissAll = () => {
    if (notifications.length === 0) return;
    Alert.alert(
      'Șterge toate notificările',
      `Dorești să ștergi toate ${notifications.length} notificările? Această acțiune nu poate fi anulată.`,
      [
        {
          text: 'Anulează',
          style: 'cancel',
        },
        {
          text: 'Șterge',
          style: 'destructive',
          onPress: dismissAllNotifications,
        },
      ]
    );
  };
  const handleNotificationPress = (notification) => {
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
        // For system alerts or unknown types, stay on current screen
        break;
    }
  };
  const renderNotificationItem = ({ item }) => (
    <NotificationItem
      notification={item}
      onPress={handleNotificationPress}
      onMarkAsRead={markAsRead}
      onDismiss={dismissNotification}
    />
  );
  const renderHeader = () => {
    if (!showHeader) return null;
    return (
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Notificări</Text>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        <View style={styles.headerActions}>
          {unreadCount > 0 && (
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleMarkAllAsRead}
            >
              <Ionicons name="checkmark-done-outline" size={20} color="#4ECDC4" />
            </TouchableOpacity>
          )}
          {notifications.length > 0 && (
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleDismissAll}
            >
              <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="notifications-off-outline" size={64} color="#ccc" />
      <Text style={styles.emptyText}>{emptyMessage}</Text>
      <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
        <Ionicons name="refresh-outline" size={20} color="#6366F1" />
        <Text style={styles.refreshText}>Reîmprospătează</Text>
      </TouchableOpacity>
    </View>
  );
  const renderSeparator = () => <View style={styles.separator} />;
  return (
    <View style={styles.container}>
      {renderHeader()}
      <FlatList
        data={filteredNotifications}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderNotificationItem}
        ItemSeparatorComponent={renderSeparator}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#6366F1']}
            tintColor="#6366F1"
          />
        }
        showsVerticalScrollIndicator={false}
        style={styles.list}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  badge: {
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  list: {
    flex: 1,
  },
  separator: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginLeft: 68,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#6366F1',
  },
  refreshText: {
    color: '#6366F1',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
});
export default NotificationsList;