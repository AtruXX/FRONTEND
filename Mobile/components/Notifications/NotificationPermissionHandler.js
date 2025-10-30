import React, { useState, useEffect } from 'react';
import { View, Text, Alert, StyleSheet, TouchableOpacity, Platform, AppState } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import backgroundNotificationService from '../../services/backgroundNotificationService';
const NotificationPermissionHandler = ({ onPermissionGranted, onPermissionDenied }) => {
  const [permissionStatus, setPermissionStatus] = useState('unknown');
  const [isLoading, setIsLoading] = useState(false);
  const [batteryOptimizationStatus, setBatteryOptimizationStatus] = useState('unknown');
  const [isAndroidDevice, setIsAndroidDevice] = useState(false);
  useEffect(() => {
    initializePermissionHandler();
  }, []);
  const initializePermissionHandler = async () => {
    // Check if Android device
    const isAndroid = Platform.OS === 'android' && Device.isDevice;
    setIsAndroidDevice(isAndroid);
    // Initial permission check
    await checkPermissionStatus();
    // For Android, also check battery optimization
    if (isAndroid) {
      await checkBatteryOptimizationStatus();
      setupAppStateListener();
    }
  };
  const setupAppStateListener = () => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        // Recheck permissions when app becomes active
        checkPermissionStatus();
      }
    });
    return () => subscription?.remove();
  };
  const checkPermissionStatus = async () => {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      setPermissionStatus(status);
      if (status === 'granted' && onPermissionGranted) {
        onPermissionGranted();
      } else if (status === 'denied' && onPermissionDenied) {
        onPermissionDenied();
      }
    } catch (error) {
    }
  };
  const checkBatteryOptimizationStatus = async () => {
    try {
      // Check if we've asked about battery optimization recently
      const lastAsked = await AsyncStorage.getItem('batteryOptimizationAsked');
      const now = Date.now();
      const oneWeek = 7 * 24 * 60 * 60 * 1000;
      if (!lastAsked || (now - parseInt(lastAsked)) > oneWeek) {
        setBatteryOptimizationStatus('not_asked');
      } else {
        setBatteryOptimizationStatus('asked');
      }
    } catch (error) {
      setBatteryOptimizationStatus('unknown');
    }
  };
  const requestPermissions = async () => {
    setIsLoading(true);
    try {
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
          allowAnnouncements: true,
        },
        android: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
      });
      setPermissionStatus(status);
      if (status === 'granted') {
        // For Android, also check battery optimization after granting permissions
        if (isAndroidDevice) {
          await handleAndroidOptimizations();
        }
        Alert.alert(
          'Notifications Enabled',
          'You will now receive important notifications about your transports and documents.',
          [{ text: 'OK' }]
        );
        if (onPermissionGranted) {
          onPermissionGranted();
        }
      } else {
        showPermissionDeniedAlert();
        if (onPermissionDenied) {
          onPermissionDenied();
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to request notification permissions');
    } finally {
      setIsLoading(false);
    }
  };
  const handleAndroidOptimizations = async () => {
    // Ask about battery optimization after notification permissions are granted
    if (batteryOptimizationStatus === 'not_asked') {
      setTimeout(() => {
        showBatteryOptimizationAlert();
      }, 1000); // Delay to not overwhelm user
    }
  };
  const showPermissionDeniedAlert = () => {
    Alert.alert(
      'Notifications Disabled',
      'To receive important updates about your transports and documents, please enable notifications in your device settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Settings', onPress: openSettings },
      ]
    );
  };
  const showBatteryOptimizationAlert = async () => {
    Alert.alert(
      'Android Battery Optimization',
      'For reliable background notifications, please disable battery optimization for AtruX:\n\n1. Go to Settings → Battery → Battery Optimization\n2. Find AtruX and select "Don\'t optimize"\n\nThis ensures you receive notifications even when the app is closed.',
      [
        {
          text: 'Later',
          style: 'cancel',
          onPress: async () => {
            await AsyncStorage.setItem('batteryOptimizationAsked', Date.now().toString());
          }
        },
        {
          text: 'Open Settings',
          onPress: async () => {
            await AsyncStorage.setItem('batteryOptimizationAsked', Date.now().toString());
            setBatteryOptimizationStatus('asked');
            Linking.openSettings();
          }
        }
      ]
    );
  };
  const showAndroidSetupGuide = () => {
    Alert.alert(
      'Android Setup Guide',
      'For best notification experience:\n\n' +
      '• Allow notifications when prompted\n' +
      '• Disable battery optimization for AtruX\n' +
      '• Add AtruX to auto-start apps (if available)\n' +
      '• Disable "Optimize for battery" in app settings\n\n' +
      'Different manufacturers may have slightly different settings.',
      [
        { text: 'Got it', style: 'default' },
        { text: 'Start Setup', onPress: requestPermissions }
      ]
    );
  };
  const openSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };
  const testNotification = async () => {
    try {
      await backgroundNotificationService.scheduleLocalNotification(
        'Test Notification',
        'This is a test notification to verify background notifications are working!',
        { type: 'test' }
      );
      Alert.alert('Test Sent', 'A test notification has been sent!');
    } catch (error) {
      Alert.alert('Error', 'Failed to send test notification');
    }
  };
  const renderAndroidOptimizationStatus = () => {
    if (!isAndroidDevice) return null;
    return (
      <View style={styles.androidContainer}>
        <Text style={styles.androidTitle}>Android Optimization</Text>
        <View style={styles.permissionContainer}>
          <Ionicons
            name={batteryOptimizationStatus === 'asked' ? 'checkmark-circle' : 'alert-circle'}
            size={20}
            color={batteryOptimizationStatus === 'asked' ? '#4CAF50' : '#FF9800'}
          />
          <Text style={styles.androidText}>
            {batteryOptimizationStatus === 'asked'
              ? 'Battery optimization addressed'
              : 'Battery optimization needs attention'}
          </Text>
          {batteryOptimizationStatus !== 'asked' && (
            <TouchableOpacity style={styles.miniButton} onPress={showBatteryOptimizationAlert}>
              <Text style={styles.miniButtonText}>Fix</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };
  const renderPermissionStatus = () => {
    switch (permissionStatus) {
      case 'granted':
        return (
          <View>
            <View style={styles.permissionContainer}>
              <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
              <Text style={styles.permissionText}>Notifications Enabled</Text>
              <TouchableOpacity style={styles.testButton} onPress={testNotification}>
                <Text style={styles.testButtonText}>Send Test</Text>
              </TouchableOpacity>
            </View>
            {renderAndroidOptimizationStatus()}
          </View>
        );
      case 'denied':
        return (
          <View>
            <View style={styles.permissionContainer}>
              <Ionicons name="close-circle" size={24} color="#F44336" />
              <Text style={styles.permissionText}>Notifications Disabled</Text>
              <TouchableOpacity style={styles.enableButton} onPress={openSettings}>
                <Text style={styles.enableButtonText}>Enable in Settings</Text>
              </TouchableOpacity>
            </View>
            {isAndroidDevice && (
              <TouchableOpacity style={styles.guideButton} onPress={showAndroidSetupGuide}>
                <Text style={styles.guideButtonText}>Android Setup Guide</Text>
              </TouchableOpacity>
            )}
          </View>
        );
      case 'undetermined':
        return (
          <View>
            <View style={styles.permissionContainer}>
              <Ionicons name="help-circle" size={24} color="#FF9800" />
              <Text style={styles.permissionText}>Notifications Not Set Up</Text>
              <TouchableOpacity
                style={styles.enableButton}
                onPress={requestPermissions}
                disabled={isLoading}
              >
                <Text style={styles.enableButtonText}>
                  {isLoading ? 'Requesting...' : 'Enable Notifications'}
                </Text>
              </TouchableOpacity>
            </View>
            {isAndroidDevice && (
              <TouchableOpacity style={styles.guideButton} onPress={showAndroidSetupGuide}>
                <Text style={styles.guideButtonText}>Android Setup Guide</Text>
              </TouchableOpacity>
            )}
          </View>
        );
      default:
        return (
          <View style={styles.permissionContainer}>
            <Ionicons name="time" size={24} color="#9E9E9E" />
            <Text style={styles.permissionText}>Checking permissions...</Text>
          </View>
        );
    }
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Background Notifications</Text>
      <Text style={styles.description}>
        Enable notifications to receive important updates about transports,
        document expirations, and system alerts even when the app is closed.
        {isAndroidDevice && '\n\nAndroid requires additional setup for reliable background notifications.'}
      </Text>
      {renderPermissionStatus()}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    margin: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  permissionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  permissionText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  enableButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  enableButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  testButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  testButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  androidContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#FF9800',
  },
  androidTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  androidText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: '#666',
  },
  guideButton: {
    marginTop: 8,
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  guideButtonText: {
    color: '#1976d2',
    fontSize: 13,
    fontWeight: '600',
  },
  miniButton: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  miniButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});
export default NotificationPermissionHandler;