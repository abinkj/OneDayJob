# 🔧 Notification System Debug Guide

## 🚨 Current Issue
You have the Expo push token but notifications aren't working. Here's how to debug and fix this issue.

## 🔍 Step-by-Step Debugging

### 1. Check Frontend Setup

#### A. Verify Notification Service Initialization
```typescript
// In your app's main component or App.tsx
import notificationService from './services/notificationService';

// Check if notification service is properly initialized
useEffect(() => {
  const initNotifications = async () => {
    const initialized = await notificationService.initialize();
    console.log('Notification service initialized:', initialized);
    
    // Check if we have a push token
    const token = notificationService.getExpoPushToken();
    console.log('Expo push token:', token);
  };
  
  initNotifications();
}, []);
```

#### B. Test Local Notifications First
```typescript
import { useNotifications } from './contexts/NotificationContext';

const TestComponent = () => {
  const { sendVerificationCodeNotification } = useNotifications();
  
  const testLocalNotification = () => {
    // This should work even without backend
    sendVerificationCodeNotification('test-job-123', 'Test Job', '123456');
  };
  
  return (
    <TouchableOpacity onPress={testLocalNotification}>
      <Text>Test Local Notification</Text>
    </TouchableOpacity>
  );
};
```

### 2. Check Backend Setup

#### A. Install Required Dependencies
```bash
cd C:\Users\abink\Desktop\onedayjob-api
npm install expo-server-sdk
```

#### B. Verify Backend Routes
Make sure the notification routes are properly registered in your backend:
- ✅ `/api/notifications/register-device` - Register device
- ✅ `/api/notifications/test` - Test notification
- ✅ `/api/notifications/settings` - Get/update settings

#### C. Test Backend Endpoints
```bash
# Test device registration
curl -X POST http://localhost:3000/api/notifications/register-device \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "expoPushToken": "ExponentPushToken[ERkPVhGpFiMUlRNue3UIl9]",
    "platform": "ios",
    "deviceId": "test-device-123"
  }'

# Test notification sending
curl -X POST http://localhost:3000/api/notifications/test \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"type": "test"}'
```

### 3. Check Environment Variables

#### A. Frontend (.env or app.json)
```json
{
  "expo": {
    "extra": {
      "eas": {
        "projectId": "your-actual-project-id"
      }
    }
  }
}
```

#### B. Backend (.env)
```env
EXPO_PUBLIC_API_URL=http://localhost:3000
# Add your backend URL here
```

### 4. Test Push Token Registration

#### A. Check if Token is Being Sent to Backend
```typescript
// In your notification service
async registerDeviceWithBackend(): Promise<boolean> {
  try {
    if (!this.expoPushToken) {
      console.log('❌ No push token available');
      return false;
    }

    const token = await getAccessToken();
    if (!token) {
      console.log('❌ No access token available');
      return false;
    }

    console.log('🔑 Sending push token to backend:', this.expoPushToken);
    
    const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/notifications/register-device`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        expoPushToken: this.expoPushToken,
        platform: Platform.OS,
        deviceId: Device.osInternalBuildId,
      }),
    });

    if (response.ok) {
      console.log('✅ Device registered with backend');
      return true;
    } else {
      console.error('❌ Failed to register device with backend:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ Error registering device with backend:', error);
    return false;
  }
}
```

### 5. Test Notification Flow

#### A. Test Local Notifications First
```typescript
// This should work immediately
await notificationService.sendLocalNotification(
  'Test Notification',
  'This is a test notification',
  { type: 'test' }
);
```

#### B. Test Backend Integration
```typescript
// Test the full flow
const testFullNotificationFlow = async () => {
  try {
    // 1. Initialize notification service
    await notificationService.initialize();
    
    // 2. Register device with backend
    const registered = await notificationService.registerDeviceWithBackend();
    console.log('Device registered:', registered);
    
    // 3. Test local notification
    await notificationService.sendVerificationCodeNotification(
      'test-job-123',
      'Test Job',
      '123456'
    );
    
    // 4. Test backend notification (if you have auth token)
    // This would require proper authentication
    console.log('Full notification flow test completed');
    
  } catch (error) {
    console.error('Notification flow test failed:', error);
  }
};
```

## 🐛 Common Issues & Solutions

### 1. "No access token available"
**Problem**: User is not authenticated
**Solution**: 
- Make sure user is logged in
- Check if `getAccessToken()` is working
- Verify JWT token is valid

### 2. "Project ID not found"
**Problem**: EAS project ID is missing
**Solution**:
```bash
# Get your EAS project ID
npx expo install --fix
eas init
# Update app.json with the project ID
```

### 3. "Device registration failed"
**Problem**: Backend endpoint not working
**Solution**:
- Check if backend is running
- Verify notification routes are registered
- Check CORS settings
- Verify authentication middleware

### 4. "Notifications not showing"
**Problem**: Permission or configuration issue
**Solution**:
- Check notification permissions in device settings
- Verify notification channels (Android)
- Test on physical device (not simulator)

## 🧪 Testing Checklist

### Frontend Tests
- [ ] Notification service initializes
- [ ] Push token is generated
- [ ] Local notifications work
- [ ] Device registration with backend works
- [ ] Notification permissions are granted

### Backend Tests
- [ ] Notification routes are registered
- [ ] Device registration endpoint works
- [ ] Test notification endpoint works
- [ ] Database updates with push token
- [ ] Expo SDK is installed

### Integration Tests
- [ ] Frontend can register device with backend
- [ ] Backend can send push notifications
- [ ] Notifications appear on device
- [ ] Notification data is correct

## 🚀 Quick Fix Commands

### 1. Install Backend Dependencies
```bash
cd C:\Users\abink\Desktop\onedayjob-api
npm install expo-server-sdk
```

### 2. Restart Backend
```bash
cd C:\Users\abink\Desktop\onedayjob-api
npm run dev
```

### 3. Test Frontend
```bash
cd C:\Users\abink\Desktop\one-day
npx expo start
```

### 4. Test on Physical Device
```bash
# Build and install on physical device
npx expo run:ios
# or
npx expo run:android
```

## 📱 Testing on Device

1. **Install on physical device** (notifications don't work in simulator)
2. **Grant notification permissions** when prompted
3. **Test local notifications first** (should work immediately)
4. **Test backend integration** (requires authentication)
5. **Check device settings** for notification permissions

## 🔧 Debug Commands

```typescript
// Add this to your app to debug
console.log('🔍 Debug Info:');
console.log('Push Token:', notificationService.getExpoPushToken());
console.log('Permissions:', await notificationService.getNotificationPermissions());
console.log('API URL:', process.env.EXPO_PUBLIC_API_URL);
```

## 📞 Next Steps

1. **Test local notifications first** - This should work immediately
2. **Fix authentication** - Make sure user is logged in
3. **Test backend integration** - Register device and send test notification
4. **Verify on physical device** - Notifications don't work in simulator

The key issue is likely that your backend doesn't have the notification endpoints set up yet. Follow the steps above to create them, then test the full flow.
