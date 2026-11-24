import api from "./api";

export interface NotificationSettings {
  verificationCodes: boolean;
  jobUpdates: boolean;
  applicationStatus: boolean;
  messages: boolean;
  systemUpdates: boolean;
}

export interface NotificationHistory {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  timestamp: string;
  data?: any;
  jobId?: string;
}

// Register device for push notifications
export const registerDevice = async (
  expoPushToken: string,
  platform: string,
  deviceId: string
) => {
  try {
    const response = await api.post("/notifications/register-device", {
      expoPushToken,
      platform,
      deviceId,
    });
    return response.data;
  } catch (error) {
    console.error("Error registering device:", error);
    throw error;
  }
};

// Get notification settings
export const getNotificationSettings =
  async (): Promise<NotificationSettings> => {
    try {
      const response = await api.get("/notifications/settings");
      return response.data;
    } catch (error) {
      console.error("Error fetching notification settings:", error);
      throw error;
    }
  };

// Update notification settings
export const updateNotificationSettings = async (
  settings: Partial<NotificationSettings>
) => {
  try {
    const response = await api.put("/notifications/settings", settings);
    return response.data;
  } catch (error) {
    console.error("Error updating notification settings:", error);
    throw error;
  }
};

// Get notification history
export const getNotificationHistory = async (
  page: number = 1,
  limit: number = 20
): Promise<{
  success: boolean;
  data: {
    notifications: NotificationHistory[];
    total: number;
    page: number;
    hasMore: boolean;
  };
}> => {
  try {
    const response = await api.get(
      `/notifications/history?page=${page}&limit=${limit}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching notification history:", error);
    throw error;
  }
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId: string) => {
  try {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response.data;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async () => {
  try {
    const response = await api.put("/notifications/mark-all-read");
    return response.data;
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw error;
  }
};

// Delete notification
export const deleteNotification = async (notificationId: string) => {
  try {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting notification:", error);
    throw error;
  }
};

// Clear all notifications
export const clearAllNotifications = async () => {
  try {
    const response = await api.delete("/notifications/clear-all");
    return response.data;
  } catch (error) {
    console.error("Error clearing all notifications:", error);
    throw error;
  }
};

// Test notification delivery
export const testNotification = async (type: string = "test") => {
  try {
    const response = await api.post("/notifications/test", { type });
    return response.data;
  } catch (error) {
    console.error("Error testing notification:", error);
    throw error;
  }
};

// Get notification statistics
export const getNotificationStats = async () => {
  try {
    const response = await api.get("/notifications/stats");
    return response.data;
  } catch (error) {
    console.error("Error fetching notification stats:", error);
    throw error;
  }
};
