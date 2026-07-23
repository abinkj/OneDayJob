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
import * as notificationApi from "../services/notificationApi";
import { useSelector } from "react-redux";

interface NotificationContextType {
  // Permission state
  permission: NotificationPermission | null;
  requestPermission: () => Promise<boolean>;

  // Notification state
  notifications: NotificationData[];
  unreadCount: number;

  // Actions
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
  deleteNotification: (notificationId: string) => Promise<void>;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  registerDevice: () => Promise<void>;
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
  const { isLoggedIn } = useSelector((state: any) => state.authentication);

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

          // Register device with backend if permissions are granted and user is logged in
          if (currentPermission.granted && isLoggedIn) {
            await notificationService.registerDeviceWithBackend();
          }

          setIsInitialized(true);
        }
      } catch (error) {
        console.error("Failed to initialize notifications:", error);
      }
    };

    initializeNotifications();
  }, [isLoggedIn]);

  // Clear notification state on logout
  useEffect(() => {
    if (!isLoggedIn) {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isLoggedIn]);

  // Fetch notifications from backend on initialization or when user logs in
  useEffect(() => {
    if (isInitialized && isLoggedIn) {
      refreshNotifications();
    }
  }, [isInitialized, isLoggedIn]);

  // Handle app state changes
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === "active" && isInitialized && isLoggedIn) {
        // App became active, refresh notifications
        refreshNotifications();
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );
    return () => subscription?.remove();
  }, [isInitialized, isLoggedIn]);

  // Set up socket event listeners for real-time notifications
  useEffect(() => {
    if (!isInitialized || !isLoggedIn) return;

    // Handle new application notifications (for employers)
    const handleNewApplication = (data: any) => {
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
    socketService.on("verification-status-updated", handleApplicationStatus);

    // Cleanup event listeners
    return () => {
      socketService.off("new_application", handleNewApplication);
      socketService.off("application_status_update", handleApplicationStatus);
      socketService.off("verification-status-updated", handleApplicationStatus);
    };
  }, [isInitialized, isLoggedIn]);

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

  // Explicitly register device (e.g. after login)
  const registerDevice = async (): Promise<void> => {
    try {
      // Ensure we have a token first
      const token = await notificationService.ensureToken();

      if (token) {
        // Register with backend
        const success = await notificationService.registerDeviceWithBackend();
        if (success) {
          // Update permission state
          const newPermission =
            await notificationService.getNotificationPermissions();
          setPermission(newPermission);
        }
      }
    } catch (error) {
      console.error("Error registering device:", error);
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
      // Call backend API
      await notificationApi.clearAllNotifications();

      // Clear local notifications
      await notificationService.clearAllNotifications();

      // Update state
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error("Error clearing notifications:", error);
    }
  };

  // Delete a single notification
  const deleteNotification = async (notificationId: string): Promise<void> => {
    // Optimistic update
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    setUnreadCount((prev) => Math.max(0, prev - 1)); // Potentially inaccurate if deleting read note, but safe enough

    try {
      await notificationApi.deleteNotification(notificationId);
    } catch (error) {
      console.error("Failed to delete notification:", error);
      // Could revert state here if needed, but low risk
    }
  };

  // Mark notification as read
  const markAsRead = (notificationId: string): void => {
    // Update local state optimistically
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId ||
        notification.jobId === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    // Call backend API to persist the change
    notificationApi.markNotificationAsRead(notificationId).catch((error) => {
      console.error("Failed to mark notification as read on backend:", error);
    });
  };

  // Mark all notifications as read
  const markAllAsRead = async (): Promise<void> => {
    // Update local state optimistically
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true }))
    );
    setUnreadCount(0);

    try {
      await notificationApi.markAllNotificationsAsRead();
    } catch (error) {
      console.error(
        "Failed to mark all notifications as read on backend:",
        error
      );
      // Could revert here, but re-fetching later will correct it
    }
  };

  // Refresh notifications from backend
  const refreshNotifications = async (): Promise<void> => {
    try {
      const response = await notificationApi.getNotificationHistory(1, 50);

      // The backend returns { success: true, data: { notifications, total, page, hasMore } }
      // The api.tsx returns response.data, so we get { success, data: { notifications, ... } }
      if (
        response &&
        response.data &&
        response.data.notifications &&
        Array.isArray(response.data.notifications)
      ) {
        const fetchedNotifications: NotificationData[] =
          response.data.notifications.map((n) => ({
            id: n.id,
            type: n.type as any,
            title: n.title,
            body: n.body,
            data: n.data,
            jobId: n.jobId,
            timestamp: n.timestamp,
            read: n.read,
          }));

        setNotifications(fetchedNotifications);

        // Calculate unread count
        const unread = fetchedNotifications.filter((n) => !n.read).length;
        setUnreadCount(unread);
      } else {
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Error refreshing notifications:", error);
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  const contextValue: NotificationContextType = {
    permission,
    requestPermission,
    notifications,
    unreadCount,
    sendJobUpdateNotification,
    sendApplicationStatusNotification,
    sendMessageNotification,
    clearAllNotifications,
    deleteNotification,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
    registerDevice,
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
