import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemeColors } from "../../../../constants/Colors";
import { useRouter } from "expo-router";
import { createConversation } from "../../../../services/api";
import Toast from "react-native-toast-message";
import CustomButton from "../../../../components/CustomButton";

interface VerificationPendingViewProps {
  colors: ThemeColors;
  onRefresh: () => void;
  actionLoading?: boolean;
  forbiddenMessage?: string | null;
  employerId?: string;
  employerName?: string;
  employerPhoneNumber?: string;
}

const VerificationPendingView: React.FC<VerificationPendingViewProps> = ({
  colors,
  onRefresh,
  actionLoading = false,
  forbiddenMessage,
  employerId,
  employerName,
  employerPhoneNumber,
}) => {
  const router = useRouter();
  const [chatLoading, setChatLoading] = React.useState(false);

  const handleChat = async () => {
    if (!employerId) {
      Toast.show({
        type: "info",
        text1: "Contact Info Missing",
        text2: "Could not find employer contact details.",
      });
      return;
    }

    try {
      setChatLoading(true);
      const response = await createConversation(employerId);
      if (response.data.success) {
        // Navigate to Chat screen using correct parameters
        router.push({
          pathname: "/main/chatScreen",
          params: {
            conversationId: response.data.data._id,
            participant: JSON.stringify({
              id: employerId,
              name: employerName || "Employer",
            }),
          },
        });
      }
    } catch (error) {
      console.error("Error starting chat:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to start chat with employer",
      });
    } finally {
      setChatLoading(false);
    }
  };

  const handleCall = async () => {
    if (!employerPhoneNumber) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Phone number not available",
      });
      return;
    }

    const phoneUrl = `tel:${employerPhoneNumber}`;

    try {
      const supported = await Linking.canOpenURL(phoneUrl);
      if (supported) {
        await Linking.openURL(phoneUrl);
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Unable to make phone calls on this device",
        });
      }
    } catch (error) {
      console.error("Error making phone call:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to initiate call. Please try again.",
      });
    }
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: colors.primary + "15" },
        ]}
      >
        <Ionicons name="time-outline" size={60} color={colors.primary} />
      </View>

      <Text style={[styles.title, { color: colors.black }]}>
        Waiting for Approval
      </Text>

      <Text style={[styles.description, { color: colors.grey }]}>
        {forbiddenMessage ||
          "Your employer needs to verify your arrival before you can access the job timer."}
      </Text>

      <View
        style={[
          styles.infoCard,
          { backgroundColor: colors.white, borderColor: colors.border },
        ]}
      >
        <Ionicons
          name="information-circle-outline"
          size={20}
          color={colors.primary}
        />
        <Text style={[styles.infoText, { color: colors.black }]}>
          Please show your "Arrived" status to the employer and ask them to tap
          "Verify" on their dashboard.
        </Text>
      </View>

      {employerId && (
        <View style={styles.actionRow}>
          {/* <TouchableOpacity
            style={[styles.chatButtonHalf, { borderColor: colors.primary }]}
            onPress={handleChat}
            disabled={chatLoading}
          >
            {chatLoading ? (
              <ActivityIndicator color={colors.primary} size="small" />
            ) : (
              <>
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={20}
                  color={colors.primary}
                  style={{ marginRight: 8 }}
                />
                <Text
                  style={[styles.chatButtonText, { color: colors.primary }]}
                >
                  Chat
                </Text>
              </>
            )}
          </TouchableOpacity> */}

          {employerPhoneNumber && (
            <TouchableOpacity style={styles.contactButton} onPress={handleCall}>
              <Ionicons
                name="call"
                size={20}
                color="#fff"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.contactButtonText}>Call</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <TouchableOpacity style={styles.notRespondingButton} onPress={() => {}}>
        <Text style={[styles.notRespondingText, { color: colors.grey }]}>
          Employer not responding?
        </Text>
      </TouchableOpacity>

      <CustomButton
        text="Refresh Status"
        onPress={onRefresh}
        isLoading={actionLoading}
        style={{ width: "100%", marginTop: 10 }}
        icon={<Ionicons name="refresh" size={20} color="white" />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  description: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 25,
  },
  infoCard: {
    flexDirection: "row",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 25,
    alignItems: "flex-start",
  },
  infoText: {
    fontSize: 13,
    marginLeft: 10,
    flex: 1,
    lineHeight: 18,
  },
  chatButton: {
    flexDirection: "row",
    height: 50,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginBottom: 12,
    borderWidth: 1.5,
  },
  chatButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  actionRow: {
    flexDirection: "row",
    width: "100%",
    marginBottom: 12,
    justifyContent: "space-between",
  },
  chatButtonHalf: {
    flexDirection: "row",
    height: 50,
    paddingHorizontal: 12,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    marginRight: 8,
    borderWidth: 1.5,
  },
  contactButton: {
    flexDirection: "row",
    height: 50,
    paddingHorizontal: 12,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    backgroundColor: "#10B981",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  contactButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  notRespondingButton: {
    paddingVertical: 10,
    marginBottom: 15,
  },
  notRespondingText: {
    fontSize: 14,
    textDecorationLine: "underline",
  },
});

export default VerificationPendingView;
