import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/Colors";
import { useNotifications } from "../../contexts/NotificationContext";

interface NotificationPermissionProps {
  onPermissionGranted?: () => void;
  onPermissionDenied?: () => void;
  showAsModal?: boolean;
}

const NotificationPermission: React.FC<NotificationPermissionProps> = ({
  onPermissionGranted,
  onPermissionDenied,
  showAsModal = false,
}) => {
  const { permission, requestPermission } = useNotifications();
  const [isRequesting, setIsRequesting] = useState(false);

  const handleRequestPermission = async () => {
    try {
      setIsRequesting(true);
      const granted = await requestPermission();

      if (granted) {
        onPermissionGranted?.();
      } else {
        onPermissionDenied?.();
        showPermissionDeniedAlert();
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      onPermissionDenied?.();
    } finally {
      setIsRequesting(false);
    }
  };

  const showPermissionDeniedAlert = () => {
    Alert.alert(
      "Notifications Disabled",
      "To receive important updates about your jobs and applications, please enable notifications in your device settings.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Open Settings",
          onPress: () => Linking.openSettings(),
        },
      ]
    );
  };

  // Don't show if permission is already granted
  if (permission?.granted) {
    return null;
  }

  return (
    <View style={[styles.container, showAsModal && styles.modalContainer]}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons
            name="notifications-outline"
            size={32}
            color={Colors.blue}
          />
        </View>

        <Text style={styles.title}>Enable Notifications</Text>
        <Text style={styles.description}>
          Stay updated with job applications, verification codes, and important
          messages.
        </Text>

        <View style={styles.benefits}>
          <View style={styles.benefitItem}>
            <Ionicons name="checkmark-circle" size={16} color={Colors.blue} />
            <Text style={styles.benefitText}>
              Instant verification code alerts
            </Text>
          </View>
          <View style={styles.benefitItem}>
            <Ionicons name="checkmark-circle" size={16} color={Colors.blue} />
            <Text style={styles.benefitText}>
              Job application status updates
            </Text>
          </View>
          <View style={styles.benefitItem}>
            <Ionicons name="checkmark-circle" size={16} color={Colors.blue} />
            <Text style={styles.benefitText}>New message notifications</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, isRequesting && styles.buttonDisabled]}
          onPress={handleRequestPermission}
          disabled={isRequesting}
        >
          <Text style={styles.buttonText}>
            {isRequesting ? "Requesting..." : "Enable Notifications"}
          </Text>
        </TouchableOpacity>

        {permission?.status === "denied" && (
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => Linking.openSettings()}
          >
            <Text style={styles.settingsButtonText}>Open Settings</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    margin: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  modalContainer: {
    margin: 0,
    borderRadius: 0,
    flex: 1,
    justifyContent: "center",
  },
  content: {
    padding: 24,
    alignItems: "center",
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.blue + "20",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.black,
    marginBottom: 8,
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    color: Colors.subGrey,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  benefits: {
    width: "100%",
    marginBottom: 24,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  benefitText: {
    fontSize: 14,
    color: Colors.black,
    marginLeft: 8,
  },
  button: {
    backgroundColor: Colors.blue,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: Colors.subGrey,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  settingsButton: {
    marginTop: 12,
    paddingVertical: 8,
  },
  settingsButtonText: {
    color: Colors.blue,
    fontSize: 14,
    fontWeight: "500",
  },
});

export default NotificationPermission;
