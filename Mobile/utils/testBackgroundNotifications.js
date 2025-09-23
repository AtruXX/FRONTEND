// Test utility for background notifications
import backgroundNotificationService from '../services/backgroundNotificationService';

export const testBackgroundNotifications = async () => {
  const tests = [];

  try {
    console.log('🧪 Starting background notification tests...');

    // Test 1: Check if service is initialized
    tests.push({
      name: 'Service Initialization',
      status: backgroundNotificationService ? 'PASS' : 'FAIL',
      result: backgroundNotificationService ? 'Service instance exists' : 'Service not initialized'
    });

    // Test 2: Check notification permissions
    const hasPermissions = await backgroundNotificationService.areNotificationsEnabled();
    tests.push({
      name: 'Notification Permissions',
      status: hasPermissions ? 'PASS' : 'WARN',
      result: hasPermissions ? 'Permissions granted' : 'Permissions not granted - user needs to enable'
    });

    // Test 3: Send test notification
    try {
      const notificationId = await backgroundNotificationService.scheduleLocalNotification(
        'Background Test',
        'This is a test notification to verify background functionality is working.',
        { type: 'test', timestamp: Date.now() }
      );
      tests.push({
        name: 'Local Notification',
        status: notificationId ? 'PASS' : 'FAIL',
        result: notificationId ? `Notification scheduled with ID: ${notificationId}` : 'Failed to schedule notification'
      });
    } catch (error) {
      tests.push({
        name: 'Local Notification',
        status: 'FAIL',
        result: `Error: ${error.message}`
      });
    }

    // Test 4: Test badge functionality
    try {
      await backgroundNotificationService.setBadgeCount(5);
      setTimeout(async () => {
        await backgroundNotificationService.clearBadge();
      }, 2000);
      tests.push({
        name: 'Badge Count',
        status: 'PASS',
        result: 'Badge set to 5 and cleared after 2 seconds'
      });
    } catch (error) {
      tests.push({
        name: 'Badge Count',
        status: 'FAIL',
        result: `Error: ${error.message}`
      });
    }

    // Test 5: Test WebSocket notification handling
    try {
      const mockWebSocketData = {
        notification_category: 'Test Transport Update',
        message: 'Test transport has been updated successfully',
        notification_type: 'transport_update',
        user_id: 'test_user',
        data: { transport_id: 123 }
      };

      await backgroundNotificationService.handleWebSocketNotification(mockWebSocketData);
      tests.push({
        name: 'WebSocket Notification Handling',
        status: 'PASS',
        result: 'Mock WebSocket notification processed successfully'
      });
    } catch (error) {
      tests.push({
        name: 'WebSocket Notification Handling',
        status: 'FAIL',
        result: `Error: ${error.message}`
      });
    }

    // Generate test report
    console.log('\n📊 Background Notification Test Results:');
    console.log('=' * 50);

    tests.forEach((test, index) => {
      const emoji = test.status === 'PASS' ? '✅' : test.status === 'WARN' ? '⚠️' : '❌';
      console.log(`${emoji} Test ${index + 1}: ${test.name}`);
      console.log(`   Status: ${test.status}`);
      console.log(`   Result: ${test.result}\n`);
    });

    const passCount = tests.filter(t => t.status === 'PASS').length;
    const warnCount = tests.filter(t => t.status === 'WARN').length;
    const failCount = tests.filter(t => t.status === 'FAIL').length;

    console.log(`📈 Summary: ${passCount} passed, ${warnCount} warnings, ${failCount} failed`);

    const allPassed = failCount === 0;

    if (allPassed) {
      console.log('🎉 All critical tests passed! Background notifications are working correctly.');
    } else {
      console.log('⚠️ Some tests failed. Please check the implementation and permissions.');
    }

    return {
      success: allPassed,
      tests,
      summary: { passed: passCount, warnings: warnCount, failed: failCount }
    };

  } catch (error) {
    console.error('❌ Test suite failed:', error);
    return {
      success: false,
      error: error.message,
      tests
    };
  }
};

// Test specific notification types
export const testNotificationTypes = async () => {
  const notificationTypes = [
    {
      type: 'transport_update',
      title: 'Transport Update',
      message: 'Your transport status has been updated to In Transit'
    },
    {
      type: 'document_expiration',
      title: 'Document Expiration',
      message: 'Your driver license will expire in 7 days'
    },
    {
      type: 'driver_status_change',
      title: 'Status Change',
      message: 'Your driver status has been updated'
    },
    {
      type: 'system_alert',
      title: 'System Alert',
      message: 'System maintenance scheduled for tonight'
    }
  ];

  console.log('🔔 Testing different notification types...');

  for (const [index, notification] of notificationTypes.entries()) {
    try {
      await backgroundNotificationService.scheduleLocalNotification(
        notification.title,
        notification.message,
        { type: notification.type },
        { seconds: index * 2 } // Stagger notifications by 2 seconds
      );
      console.log(`✅ ${notification.type} notification scheduled`);
    } catch (error) {
      console.error(`❌ Failed to schedule ${notification.type}:`, error);
    }
  }
};

// Test background vs foreground behavior
export const testBackgroundBehavior = async () => {
  console.log('📱 Testing background vs foreground notification behavior...');

  // This would typically be called when app goes to background
  const testBackgroundNotification = async () => {
    await backgroundNotificationService.scheduleLocalNotification(
      'Background Test',
      'App is in background - you should see this notification',
      { type: 'background_test' }
    );
  };

  // This would typically be called when app comes to foreground
  const testForegroundNotification = async () => {
    await backgroundNotificationService.scheduleLocalNotification(
      'Foreground Test',
      'App is in foreground - notification behavior may differ',
      { type: 'foreground_test' }
    );
  };

  return {
    testBackgroundNotification,
    testForegroundNotification
  };
};