import { useNotifications } from '../contexts/NotificationContext';

// Test notification functions for development
export const testNotificationSystem = () => {
  // This function can be called from anywhere in your app to test notifications
  console.log('Testing notification system...');
  
  // You can call this from a button or console to test
  return {
    sendTestVerificationCode: () => {
      // This would be called from a component that has access to useNotifications
      console.log('Send test verification code notification');
    },
    sendTestJobUpdate: () => {
      console.log('Send test job update notification');
    },
    sendTestMessage: () => {
      console.log('Send test message notification');
    },
  };
};

// Example usage in a component:
/*
import { useNotifications } from '../contexts/NotificationContext';

const TestComponent = () => {
  const { 
    sendVerificationCodeNotification, 
    sendJobUpdateNotification, 
    sendMessageNotification 
  } = useNotifications();

  const testNotifications = () => {
    // Test verification code
    sendVerificationCodeNotification('test-job-123', 'Test Job', '123456');
    
    // Test job update
    sendJobUpdateNotification('test-job-123', 'Test Job', 'Job status updated to In Progress');
    
    // Test message
    sendMessageNotification('test-conversation-123', 'John Doe', 'Hello! How are you?');
  };

  return (
    <TouchableOpacity onPress={testNotifications}>
      <Text>Test Notifications</Text>
    </TouchableOpacity>
  );
};
*/






