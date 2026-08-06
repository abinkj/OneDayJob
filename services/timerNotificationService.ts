import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

class TimerNotificationService {
  private channelId: string = "job_timer_channel";

  async initialize() {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync(this.channelId, {
        name: "Job Timer",
        importance: Notifications.AndroidImportance.HIGH,
      });
    }
    
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  }

  async startOngoingNotification(jobName: string) {
    await this.initialize();

    const notificationId = `timer_${jobName}`;

    await Notifications.scheduleNotificationAsync({
      identifier: notificationId,
      content: {
        title: "Job is Live",
        body: `Timer is running for: ${jobName}`,
        sticky: true, // Prevents user from dismissing on Android
        autoDismiss: false,
      },
      trigger: null, // Send immediately
    });
  }

  async stopNotification(jobName: string) {
    const notificationId = `timer_${jobName}`;
    await Notifications.dismissNotificationAsync(notificationId);
  }
}

export default new TimerNotificationService();
