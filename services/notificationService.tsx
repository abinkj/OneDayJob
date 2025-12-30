import { Platform, Alert, Linking } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { getAccessToken } from '../utilities/secureStore';
import Toast from 'react-native-toast-message';

// Notification types
export interface NotificationData {
  type: 'verification_code' | 'job_update' | 'application_status' | 'message' | 'system';
  title: string;
  body: string;
  data?: any;
  jobId?: string;
  userId?: string;
  timestamp?: string;
  read?: boolean;
}

export interface NotificationPermission {
  granted: boolean;
  canAskAgain: boolean;
  status: 'granted' | 'denied' | 'undetermined';
}

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

class NotificationService {
  private expoPushToken: string | null = null;
  private notificationListener: any = null;
  private responseListener: any = null;

  // Initialize the notification service
  async initialize(): Promise<boolean> {
    try {
      // Register for push notifications
      await this.registerForPushNotificationsAsync();

      // Set up notification listeners
      this.setupNotificationListeners();

      return true;
    } catch (error) {
      console.error('Failed to initialize notification service:', error);
      return false;
    }
  }

  // Register for push notifications
  async registerForPushNotificationsAsync(): Promise<string | null> {
    let token: string | null = null;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return null;
      }

      try {
        const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
        if (!projectId) {
          throw new Error('Project ID not found');
        }

        token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
        console.log('Expo push token:', token);
      } catch (error) {
        console.error('Error getting push token:', error);
        return null;
      }
    } else {
      console.log('Must use physical device for Push Notifications');
    }

    this.expoPushToken = token;
    return token;
  }

  // Set up notification listeners
  private setupNotificationListeners(): void {
    // Listener for notifications received while app is running
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
      this.handleIncomingNotification(notification);
    });

    // Listener for notification interactions (taps)
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      this.handleNotificationResponse(response);
    });
  }

  // Handle incoming notifications
  private handleIncomingNotification(notification: Notifications.Notification): void {
    const { data } = notification.request.content;
    const notificationData = data as unknown as NotificationData;

    // Show in-app toast based on notification type
    this.showInAppNotification(notificationData);

    // Handle specific notification types
    switch (notificationData.type) {
      case 'verification_code':
        this.handleVerificationCodeNotification(notificationData);
        break;
      case 'job_update':
        this.handleJobUpdateNotification(notificationData);
        break;
      case 'application_status':
        this.handleApplicationStatusNotification(notificationData);
        break;
      case 'message':
        this.handleMessageNotification(notificationData);
        break;
      default:
        console.log('Unknown notification type:', notificationData.type);
    }
  }

  // Handle notification tap responses
  private handleNotificationResponse(response: Notifications.NotificationResponse): void {
    const { data } = response.notification.request.content;
    const notificationData = data as unknown as NotificationData;

    // Navigate based on notification type
    switch (notificationData.type) {
      case 'verification_code':
        if (notificationData.jobId) {
          // Navigate to job details or verification screen
          this.navigateToJobDetails(notificationData.jobId);
        }
        break;
      case 'job_update':
        if (notificationData.jobId) {
          this.navigateToJobDetails(notificationData.jobId);
        }
        break;
      case 'application_status':
        if (notificationData.jobId) {
          this.navigateToJobDetails(notificationData.jobId);
        }
        break;
      case 'message':
        if (notificationData.data?.conversationId) {
          this.navigateToChat(notificationData.data.conversationId);
        }
        break;
    }
  }

  // Show in-app notification toast
  private showInAppNotification(notificationData: NotificationData): void {
    const { type, title, body } = notificationData;

    let toastType: 'success' | 'info' | 'error' = 'info';
    let icon = '🔔';

    switch (type) {
      case 'verification_code':
        toastType = 'success';
        icon = '🔑';
        break;
      case 'job_update':
        toastType = 'info';
        icon = '💼';
        break;
      case 'application_status':
        toastType = 'success';
        icon = '✅';
        break;
      case 'message':
        toastType = 'info';
        icon = '💬';
        break;
      case 'system':
        toastType = 'info';
        icon = '⚙️';
        break;
    }

    Toast.show({
      type: toastType,
      text1: `${icon} ${title}`,
      text2: body,
      visibilityTime: 5000,
      autoHide: true,
      topOffset: 60,
      bottomOffset: 40,
    });
  }

  // Handle verification code notifications
  private handleVerificationCodeNotification(data: NotificationData): void {
    console.log('Verification code notification received:', data);
    // Additional handling for verification codes
    // Could trigger specific UI updates or state changes
  }

  // Handle job update notifications
  private handleJobUpdateNotification(data: NotificationData): void {
    console.log('Job update notification received:', data);
    // Handle job status changes, new applications, etc.
  }

  // Handle application status notifications
  private handleApplicationStatusNotification(data: NotificationData): void {
    console.log('Application status notification received:', data);
    // Handle application status changes (accepted, rejected, etc.)
  }

  // Handle message notifications
  private handleMessageNotification(data: NotificationData): void {
    console.log('Message notification received:', data);
    // Handle new messages in conversations
  }

  // Navigation helpers
  private navigateToJobDetails(jobId: string): void {
    // This would typically use navigation service
    console.log('Navigate to job details:', jobId);
    // navigation.navigate('JobDetails', { jobId });
  }

  private navigateToChat(conversationId: string): void {
    // This would typically use navigation service
    console.log('Navigate to chat:', conversationId);
    // navigation.navigate('Chat', { conversationId });
  }

  // Send local notification
  async sendLocalNotification(title: string, body: string, data?: any): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: 'default',
        },
        trigger: null, // Show immediately
      });
    } catch (error) {
      console.error('Error sending local notification:', error);
    }
  }

  // Send verification code notification
  async sendVerificationCodeNotification(jobId: string, jobName: string, code: string): Promise<void> {
    const title = '🔑 Verification Code Received';
    const body = `Your verification code for "${jobName}" is: ${code}`;

    await this.sendLocalNotification(title, body, {
      type: 'verification_code',
      jobId,
      jobName,
      code,
    });
  }

  // Send job update notification
  async sendJobUpdateNotification(jobId: string, jobName: string, update: string): Promise<void> {
    const title = '💼 Job Update';
    const body = `Update for "${jobName}": ${update}`;

    await this.sendLocalNotification(title, body, {
      type: 'job_update',
      jobId,
      jobName,
      update,
    });
  }

  // Send application status notification
  async sendApplicationStatusNotification(jobId: string, jobName: string, status: string): Promise<void> {
    const title = '📋 Application Update';
    const body = `Your application for "${jobName}" status: ${status}`;

    await this.sendLocalNotification(title, body, {
      type: 'application_status',
      jobId,
      jobName,
      status,
    });
  }

  // Send message notification
  async sendMessageNotification(conversationId: string, senderName: string, message: string): Promise<void> {
    const title = `💬 Message from ${senderName}`;
    const body = message;

    await this.sendLocalNotification(title, body, {
      type: 'message',
      conversationId,
      senderName,
    });
  }

  // Get notification permissions
  async getNotificationPermissions(): Promise<NotificationPermission> {
    const { status, canAskAgain } = await Notifications.getPermissionsAsync();

    return {
      granted: status === 'granted',
      canAskAgain,
      status: status as 'granted' | 'denied' | 'undetermined',
    };
  }

  // Request notification permissions
  async requestNotificationPermissions(): Promise<boolean> {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  // Get expo push token
  getExpoPushToken(): string | null {
    return this.expoPushToken;
  }

  // Register device with backend
  async registerDeviceWithBackend(): Promise<boolean> {
    try {
      if (!this.expoPushToken) {
        console.log('No push token available');
        return false;
      }

      const token = await getAccessToken();
      if (!token) {
        console.log('No access token available');
        return false;
      }

      // Send push token to backend
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
        console.log('Device registered with backend');
        return true;
      } else {
        console.error('Failed to register device with backend');
        return false;
      }
    } catch (error) {
      console.error('Error registering device with backend:', error);
      return false;
    }
  }

  // Clear all notifications
  async clearAllNotifications(): Promise<void> {
    try {
      await Notifications.dismissAllNotificationsAsync();
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  }

  // Set notification badge count
  async setBadgeCount(count: number): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('Error setting badge count:', error);
    }
  }

  // Clean up listeners
  cleanup(): void {
    if (this.notificationListener) {
      this.notificationListener.remove();
    }
    if (this.responseListener) {
      this.responseListener.remove();
    }
  }
}

// Create singleton instance
const notificationService = new NotificationService();

export default notificationService;

