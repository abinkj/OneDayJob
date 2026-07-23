import notifee, {
  AndroidImportance,
  AndroidVisibility,
} from "@notifee/react-native";
import { Platform } from "react-native";

class TimerNotificationService {
  private channelId: string = "job_timer_channel";

  async initialize() {
    if (Platform.OS === "android") {
      // Create a channel (required for Android)
      await notifee.createChannel({
        id: this.channelId,
        name: "Job Timer",
        importance: AndroidImportance.HIGH,
        visibility: AndroidVisibility.PUBLIC,
      });
    }
  }

  async startOngoingNotification(jobName: string) {
    await this.initialize();

    const notificationId = `timer_${jobName}`;

    await notifee.displayNotification({
      id: notificationId,
      title: "Job is Live ⏱️",
      body: `Timer is running for: ${jobName}`,
      android: {
        channelId: this.channelId,
        ongoing: true, // Prevents user from dismissing
        importance: AndroidImportance.HIGH,
        pressAction: {
          id: "default",
        },
      },
      ios: {
        foregroundPresentationOptions: {
          banner: true,
          badge: true,
          sound: true,
        },
      },
    });
  }

  async stopNotification(jobName: string) {
    const notificationId = `timer_${jobName}`;
    await notifee.cancelNotification(notificationId);
  }
}

export default new TimerNotificationService();
