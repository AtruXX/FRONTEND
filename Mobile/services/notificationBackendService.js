// Production notification service that integrates with AtruX backend API
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../utils/BASE_URL.js';
class NotificationBackendService {
  constructor() {
    this.baseUrl = BASE_URL;
    this.authToken = null;
    this.userId = null;
  }
  // Initialize service with auth credentials
  async initialize() {
    try {
      this.authToken = await AsyncStorage.getItem('authToken');
      this.userId = await AsyncStorage.getItem('driverId') || await AsyncStorage.getItem('userId');
      if (!this.authToken || !this.userId) {
        return false;
      }
      return true;
    } catch (error) {
      return false;
    }
  }
  // Get request headers with authentication
  getHeaders() {
    return {
      'Authorization': `Token ${this.authToken}`,
      'Content-Type': 'application/json',
    };
  }
  // Get user notifications from backend
  async getUserNotifications(options = {}) {
    try {
      const {
        includeRead = true,
        limit = 50,
        notificationType = null
      } = options;
      let url = `${this.baseUrl}notifications/?limit=${limit}&include_read=${includeRead}`;
      if (notificationType) {
        url += `&notification_type=${notificationType}`;
      }
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          notifications: data.notifications || [],
          count: data.count || 0,
          unreadCount: data.unread_count || 0
        };
      } else {
        const errorText = await response.text();
        return { success: false, error: errorText };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  // Mark notification as read
  async markNotificationAsRead(notificationId) {
    try {
      const response = await fetch(`${this.baseUrl}notifications/${notificationId}/read/`, {
        method: 'PATCH',
        headers: this.getHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      } else {
        const errorText = await response.text();
        return { success: false, error: errorText };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  // Dismiss notification (delete)
  async dismissNotification(notificationId) {
    try {
      const response = await fetch(`${this.baseUrl}notifications/${notificationId}/dismiss/`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      } else {
        const errorText = await response.text();
        return { success: false, error: errorText };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  // Mark all notifications as read
  async markAllNotificationsAsRead() {
    try {
      const response = await fetch(`${this.baseUrl}notifications/read-all/`, {
        method: 'PATCH',
        headers: this.getHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      } else {
        const errorText = await response.text();
        return { success: false, error: errorText };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  // Dismiss all notifications (delete all)
  async dismissAllNotifications() {
    try {
      const response = await fetch(`${this.baseUrl}notifications/dismiss-all/`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      } else {
        const errorText = await response.text();
        return { success: false, error: errorText };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  // Get notification statistics
  async getNotificationStats() {
    try {
      const result = await this.getUserNotifications({ limit: 1 });
      if (result.success) {
        return {
          success: true,
          totalCount: result.count,
          unreadCount: result.unreadCount
        };
      }
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  // Register device for push notifications (future implementation)
  async registerDevice(expoPushToken, deviceInfo = {}) {
    try {
      // TODO: This endpoint needs to be implemented in the backend
      // For now, we'll store the token locally
      await AsyncStorage.setItem('expoPushToken', expoPushToken);
      await AsyncStorage.setItem('deviceInfo', JSON.stringify({
        ...deviceInfo,
        registeredAt: new Date().toISOString()
      }));
      // Future implementation:
      /*
      const response = await fetch(`${this.baseUrl}notifications/register-device/`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          expo_push_token: expoPushToken,
          device_type: deviceInfo.platform || 'unknown',
          device_model: deviceInfo.deviceModel,
          os_version: deviceInfo.osVersion,
          app_version: deviceInfo.appVersion,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      } else {
        const errorText = await response.text();
        return { success: false, error: errorText };
      }
      */
      return { success: true, message: 'Device registration stored locally' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  // Update auth credentials (called when user logs in/out)
  async updateCredentials() {
    return await this.initialize();
  }
  // Batch operations for efficiency
  async batchMarkAsRead(notificationIds) {
    try {
      const results = await Promise.allSettled(
        notificationIds.map(id => this.markNotificationAsRead(id))
      );
      const successful = results.filter(result =>
        result.status === 'fulfilled' && result.value.success
      ).length;
      return { success: true, successCount: successful, totalCount: notificationIds.length };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  async batchDismiss(notificationIds) {
    try {
      const results = await Promise.allSettled(
        notificationIds.map(id => this.dismissNotification(id))
      );
      const successful = results.filter(result =>
        result.status === 'fulfilled' && result.value.success
      ).length;
      return { success: true, successCount: successful, totalCount: notificationIds.length };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  // Health check for the service
  async healthCheck() {
    try {
      const stats = await this.getNotificationStats();
      return {
        isHealthy: stats.success,
        hasAuth: !!(this.authToken && this.userId),
        lastCheck: new Date().toISOString(),
        error: stats.success ? null : stats.error
      };
    } catch (error) {
      return {
        isHealthy: false,
        hasAuth: !!(this.authToken && this.userId),
        lastCheck: new Date().toISOString(),
        error: error.message
      };
    }
  }
}
// Create singleton instance
const notificationBackendService = new NotificationBackendService();
export default notificationBackendService;
export { NotificationBackendService };