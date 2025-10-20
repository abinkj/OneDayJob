import { useNotifications } from '../contexts/NotificationContext';
import { testNotification } from './notificationApi';

// Test notification system
export const testNotificationSystem = async () => {
  console.log('🧪 Testing notification system...');

  try {
    // Test 1: Send test notification via API
    console.log('📱 Testing API notification...');
    const apiResult = await testNotification('test');
    console.log('API Test Result:', apiResult);

    // Test 2: Test local notifications
    console.log('📲 Testing local notifications...');
    
    // You can call these from a component that has access to useNotifications
    console.log('To test local notifications, use the useNotifications hook in a component:');
    console.log(`
    const { 
      sendVerificationCodeNotification, 
      sendJobUpdateNotification, 
      sendMessageNotification 
    } = useNotifications();

    // Test verification code
    sendVerificationCodeNotification('test-job-123', 'Test Job', '123456');
    
    // Test job update
    sendJobUpdateNotification('test-job-123', 'Test Job', 'Job status updated');
    
    // Test message
    sendMessageNotification('test-conversation-123', 'John Doe', 'Hello!');
    `);

    return {
      success: true,
      message: 'Notification system test completed',
      apiResult
    };

  } catch (error) {
    console.error('❌ Notification system test failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Test push token registration
export const testPushTokenRegistration = async (expoPushToken: string) => {
  console.log('🔑 Testing push token registration...');
  
  try {
    const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/notifications/register-device`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // You'll need to add your auth token here
        // 'Authorization': `Bearer ${yourAuthToken}`
      },
      body: JSON.stringify({
        expoPushToken,
        platform: 'ios', // or 'android'
        deviceId: 'test-device-123'
      })
    });

    const result = await response.json();
    console.log('Push token registration result:', result);
    
    return result;
  } catch (error) {
    console.error('❌ Push token registration failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Test notification permissions
export const testNotificationPermissions = async () => {
  console.log('🔐 Testing notification permissions...');
  
  try {
    const { getNotificationPermissions, requestNotificationPermissions } = await import('./notificationService');
    
    // Check current permissions
    const currentPermissions = await getNotificationPermissions();
    console.log('Current permissions:', currentPermissions);
    
    if (!currentPermissions.granted) {
      console.log('Requesting notification permissions...');
      const granted = await requestNotificationPermissions();
      console.log('Permission granted:', granted);
    }
    
    return currentPermissions;
  } catch (error) {
    console.error('❌ Permission test failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

export default {
  testNotificationSystem,
  testPushTokenRegistration,
  testNotificationPermissions
};
