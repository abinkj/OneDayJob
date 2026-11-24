import * as ImagePicker from "expo-image-picker";
import { Linking } from "react-native";

interface CaptureSelfieOptions {
  onSuccess: (uri: string) => void;
  onError?: (errorMessage: string) => void;
  showAlert?: (options: {
    type: "error" | "warning" | "info" | "success";
    title: string;
    message: string;
    buttons?: Array<{
      text: string;
      style?: "default" | "cancel" | "destructive";
      onPress?: () => void;
    }>;
  }) => void;
}

/**
 * Platform-tested front-camera capture utility for profile pictures.
 * Enforces front-camera only, square 1:1 aspect ratio, and proper permission handling on both iOS and Android.
 */
export const captureProfileSelfie = async ({
  onSuccess,
  onError,
  showAlert,
}: CaptureSelfieOptions) => {
  try {
    // 1. Request camera permission
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.status !== ImagePicker.PermissionStatus.GRANTED) {
      if (!permissionResult.canAskAgain && showAlert) {
        // Permission was permanently denied -> prompt to open Settings
        showAlert({
          type: "warning",
          title: "Camera Permission Needed",
          message:
            "Camera access is required to take your profile picture selfie. Please enable camera access in your device settings.",
          buttons: [
            { text: "Cancel", style: "cancel" },
            {
              text: "Open Settings",
              onPress: () => {
                Linking.openSettings().catch(() => {});
              },
            },
          ],
        });
      } else {
        const errorMsg = "Camera permission is required to take a profile picture.";
        if (showAlert) {
          showAlert({
            type: "error",
            title: "Permission Denied",
            message: errorMsg,
          });
        } else if (onError) {
          onError(errorMsg);
        }
      }
      return;
    }

    // 2. Launch front camera directly with square crop
    const result = await ImagePicker.launchCameraAsync({
      cameraType: ImagePicker.CameraType.front,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      mediaTypes: ["images"],
    });

    // 3. Process captured image
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      if (asset?.uri) {
        onSuccess(asset.uri);
      }
    }
  } catch (error: any) {
    console.error("Error launching front camera:", error);
    const message =
      error?.message || "Failed to open front camera. Please try again.";
    if (showAlert) {
      showAlert({
        type: "error",
        title: "Camera Error",
        message,
      });
    } else if (onError) {
      onError(message);
    }
  }
};
