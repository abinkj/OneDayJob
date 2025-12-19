import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { AppState, AppStateStatus } from "react-native";
import notificationService, {
  NotificationData,
  NotificationPermission,
} from "../services/notificationService";
import { getUserData } from "../utilities/mmkvStore";
import socketService from "../services/socketService";

interface NotificationContextType {
  // Permission state
  permission: NotificationPermission | null;
  requestPermission: () => Promise<boolean>;

  // Notification state
  notifications: NotificationData[];
  unreadCount: number;

  // Actions
  sendVerificationCodeNotification: (
    jobId: string,
    jobName: string,
    code: string
  ) => Promise<void>;
  sendJobUpdateNotification: (
    jobId: string,
    jobName: string,
    update: string
  ) => Promise<void>;
  sendApplicationStatusNotification: (
    jobId: string,
    jobName: string,
    status: string
  ) => Promise<void>;
  sendMessageNotification: (
    conversationId: string,
    senderName: string,
    message: string
  ) => Promise<void>;

  // Utility
  clearAllNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => void;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const [permission, setPermission] = useState<NotificationPermission | null>(
    null
  );
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize notification service
  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        // Initialize the notification service
        const initialized = await notificationService.initialize();
        if (initialized) {
          // Get current permissions
          const currentPermission =
            await notificationService.getNotificationPermissions();
          setPermission(currentPermission);

          // Register device with backend if permissions are granted
          if (currentPermission.granted) {
            await notificationService.registerDeviceWithBackend();
          }

          setIsInitialized(true);
        }
      } catch (error) {
        console.error("Failed to initialize notifications:", error);
      }
    };

    initializeNotifications();
  }, []);

  // Handle app state changes
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === "active" && isInitialized) {
        // App became active, refresh notifications
        refreshNotifications();
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );
    return () => subscription?.remove();
  }, [isInitialized]);

  // Set up socket event listeners for real-time notifications
  useEffect(() => {
    if (!isInitialized) return;

    console.log("🎧 Setting up socket event listeners for notifications...");

    // Handle new application notifications (for employers)
    const handleNewApplication = (data: any) => {
      console.log("📋 New application notification received:", data);
      const notification: NotificationData = {
        type: "application_status",
        title: "📋 New Application Received",
        body: `${data.applicantName} has applied for "${data.jobName}"`,
        jobId: data.jobId,
        timestamp: new Date().toISOString(),
        data: data,
      };

      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    };

    // Handle application status updates (for employees)
    const handleApplicationStatus = (data: any) => {
      console.log("📊 Application status notification received:", data);
      const statusText = data.status === "accepted" ? "accepted" : "rejected";
      const notification: NotificationData = {
        type: "application_status",
        title: "📋 Application Update",
        body: `Your application for "${data.jobName}" has been ${statusText}`,
        jobId: data.jobId,
        timestamp: new Date().toISOString(),
        data: data,
      };

      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    };

    // Handle verification code notifications (for employees)
    const handleVerificationCode = (data: any) => {
      console.log("🔑 Verification code notification received:", data);
      const notification: NotificationData = {
        type: "verification_code",
        title: "🔑 Verification Code Received",
        body: `Your verification code for "${data.jobName}" is: ${data.code}`,
        jobId: data.jobId,
        timestamp: new Date().toISOString(),
        data: data,
      };

      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    };

    // Set up socket event listeners
    socketService.on("new_application", handleNewApplication);
    socketService.on("application_status_update", handleApplicationStatus);
    socketService.on("verification-codes-generated", handleVerificationCode);
    socketService.on("verification-code-received", handleVerificationCode);
    socketService.on("verification-status-updated", handleApplicationStatus);

    // Cleanup event listeners
    return () => {
      console.log("🧹 Cleaning up socket event listeners...");
      socketService.off("new_application", handleNewApplication);
      socketService.off("application_status_update", handleApplicationStatus);
      socketService.off("verification-codes-generated", handleVerificationCode);
      socketService.off("verification-code-received", handleVerificationCode);
      socketService.off("verification-status-updated", handleApplicationStatus);
    };
  }, [isInitialized]);

  // Request notification permissions
  const requestPermission = async (): Promise<boolean> => {
    try {
      const granted =
        await notificationService.requestNotificationPermissions();
      if (granted) {
        const newPermission =
          await notificationService.getNotificationPermissions();
        setPermission(newPermission);

        // Register device with backend
        await notificationService.registerDeviceWithBackend();
      }
      return granted;
    } catch (error) {
      console.error("Error requesting notification permissions:", error);
      return false;
    }
  };

  // Send verification code notification
  const sendVerificationCodeNotification = async (
    jobId: string,
    jobName: string,
    code: string
  ): Promise<void> => {
    try {
      await notificationService.sendVerificationCodeNotification(
        jobId,
        jobName,
        code
      );

      // Add to local notifications list
      const notification: NotificationData = {
        type: "verification_code",
        title: "🔑 Verification Code Received",
        body: `Your verification code for "${jobName}" is: ${code}`,
        jobId,
        timestamp: new Date().toISOString(),
      };

      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    } catch (error) {
      console.error("Error sending verification code notification:", error);
    }
  };

  // Send job update notification
  const sendJobUpdateNotification = async (
    jobId: string,
    jobName: string,
    update: string
  ): Promise<void> => {
    try {
      await notificationService.sendJobUpdateNotification(
        jobId,
        jobName,
        update
      );

      const notification: NotificationData = {
        type: "job_update",
        title: "💼 Job Update",
        body: `Update for "${jobName}": ${update}`,
        jobId,
        timestamp: new Date().toISOString(),
      };

      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    } catch (error) {
      console.error("Error sending job update notification:", error);
    }
  };

  // Send application status notification
  const sendApplicationStatusNotification = async (
    jobId: string,
    jobName: string,
    status: string
  ): Promise<void> => {
    try {
      await notificationService.sendApplicationStatusNotification(
        jobId,
        jobName,
        status
      );

      const notification: NotificationData = {
        type: "application_status",
        title: "📋 Application Update",
        body: `Your application for "${jobName}" status: ${status}`,
        jobId,
        timestamp: new Date().toISOString(),
      };

      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    } catch (error) {
      console.error("Error sending application status notification:", error);
    }
  };

  // Send message notification
  const sendMessageNotification = async (
    conversationId: string,
    senderName: string,
    message: string
  ): Promise<void> => {
    try {
      await notificationService.sendMessageNotification(
        conversationId,
        senderName,
        message
      );

      const notification: NotificationData = {
        type: "message",
        title: `💬 Message from ${senderName}`,
        body: message,
        data: { conversationId },
        timestamp: new Date().toISOString(),
      };

      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    } catch (error) {
      console.error("Error sending message notification:", error);
    }
  };

  // Clear all notifications
  const clearAllNotifications = async (): Promise<void> => {
    try {
      await notificationService.clearAllNotifications();
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error("Error clearing notifications:", error);
    }
  };

  // Mark notification as read
  const markAsRead = (notificationId: string): void => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.jobId === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  // Refresh notifications from backend
  const refreshNotifications = async (): Promise<void> => {
    try {
      // This would typically fetch notifications from your backend
      // For now, we'll just update the local state
      console.log("Refreshing notifications...");
    } catch (error) {
      console.error("Error refreshing notifications:", error);
    }
  };

  const contextValue: NotificationContextType = {
    permission,
    requestPermission,
    notifications,
    unreadCount,
    sendVerificationCodeNotification,
    sendJobUpdateNotification,
    sendApplicationStatusNotification,
    sendMessageNotification,
    clearAllNotifications,
    markAsRead,
    refreshNotifications,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

// Hook to use notification context
export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};

export default NotificationContext;
