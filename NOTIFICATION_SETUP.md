# Notification System Setup Guide

## 🚀 Quick Setup

### 1. Update Expo Configuration

The `app.json` has been updated with notification configuration. You need to:

1. **Get your EAS Project ID**:
   ```bash
   npx expo install --fix
   eas init
   ```
   This will create an EAS project and give you a project ID.

2. **Update the project ID in `app.json`**:
   Replace `"your-project-id-here"` with your actual EAS project ID.

### 2. Install Dependencies (Already Done)

The following packages are already installed:
- `expo-notifications`
- `expo-device`
- `expo-constants`

### 3. Test the Notification System

#### Option A: Test with Existing Code
The notification system is already integrated with your existing notification icon in the Home screen. You should see:
- A notification badge on the notification icon (if there are unread notifications)
- The existing notification screen now uses the new notification system

#### Option B: Add Test Button (Optional)
Add this to any screen to test notifications:

```typescript
import { useNotifications } from '../contexts/NotificationContext';

const TestButton = () => {
  const { 
    sendVerificationCodeNotification, 
    sendJobUpdateNotification, 
    sendMessageNotification 
  } = useNotifications();

  const testNotifications = () => {
    sendVerificationCodeNotification('test-job-123', 'Test Job', '123456');
    sendJobUpdateNotification('test-job-123', 'Test Job', 'Job status updated');
    sendMessageNotification('test-conversation-123', 'John Doe', 'Hello!');
  };

  return (
    <TouchableOpacity onPress={testNotifications}>
      <Text>Test Notifications</Text>
    </TouchableOpacity>
  );
};
```

## 🔧 Configuration

### Notification Types
- **Verification Codes**: Automatically sent when codes are generated
- **Job Updates**: Job status changes, new applications
- **Application Status**: Application accepted/rejected
- **Messages**: New chat messages
- **System**: Important system notifications

### Permission Handling
- The system automatically requests notification permissions
- Users can enable/disable specific notification types in settings
- Permission modal appears on first app launch

## 📱 Features

### In-App Notifications
- Toast notifications for immediate feedback
- Notification badge on home screen icon
- Real-time updates via Socket.IO

### Background Notifications
- Push notifications when app is closed
- Deep linking to relevant screens
- Proper notification channels for Android

### Notification Management
- View all notifications in dedicated screen
- Mark as read/unread
- Filter by notification type
- Clear all notifications

## 🐛 Troubleshooting

### "Project ID not found" Error
1. Run `eas init` to create an EAS project
2. Update the project ID in `app.json`
3. Restart the development server

### Notifications Not Working
1. Check if notification permissions are granted
2. Verify the EAS project ID is correct
3. Test on a physical device (notifications don't work in simulators)

### No Visible Changes
The notification system is integrated with your existing notification icon and screen. You should see:
- Notification badge on the home screen notification icon
- Updated notification screen with new functionality
- Toast notifications when verification codes are received

## 🎯 Next Steps

1. **Get EAS Project ID**: Run `eas init` and update `app.json`
2. **Test on Device**: Test notifications on a physical device
3. **Backend Integration**: Connect with your existing notification service
4. **Customize**: Adjust notification settings and preferences

## 📞 Support

If you encounter issues:
1. Check the console for error messages
2. Verify all dependencies are installed
3. Ensure you're testing on a physical device
4. Check notification permissions in device settings









