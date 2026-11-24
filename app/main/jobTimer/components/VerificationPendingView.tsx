import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemeColors } from "../../../../constants/Colors";
import { useRouter } from "expo-router";
import { createConversation, remindArrivalEmployer } from "../../../../services/api";
import {
  CUSTOMER_SUPPORT_PHONE,
  CUSTOMER_SUPPORT_PHONE_DISPLAY,
} from "../../../../utilities/strings";
import Toast from "react-native-toast-message";
import CustomButton from "../../../../components/CustomButton";

interface VerificationPendingViewProps {
  colors: ThemeColors;
  onRefresh: () => void;
  jobId?: string;
  actionLoading?: boolean;
  forbiddenMessage?: string | null;
  employerId?: string;
  employerName?: string;
  employerPhoneNumber?: string;
}

const VerificationPendingView: React.FC<VerificationPendingViewProps> = ({
  colors,
  onRefresh,
  jobId,
  actionLoading = false,
  forbiddenMessage,
  employerId,
  employerName,
  employerPhoneNumber,
}) => {
  const router = useRouter();
  const [chatLoading, setChatLoading] = useState(false);
  const [remindLoading, setRemindLoading] = useState(false);
  const [remindCooldown, setRemindCooldown] = useState(0);

  // Cooldown countdown
  useEffect(() => {
    if (remindCooldown <= 0) return;
    const timer = setInterval(() => {
      setRemindCooldown((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [remindCooldown]);

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
        text2: "Employer phone number not available",
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

  const handleCallSupport = async () => {
    const phoneUrl = `tel:${CUSTOMER_SUPPORT_PHONE}`;
    try {
      const supported = await Linking.canOpenURL(phoneUrl);
      if (supported) {
        await Linking.openURL(phoneUrl);
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: `Dial support manually: ${CUSTOMER_SUPPORT_PHONE_DISPLAY}`,
        });
      }
    } catch (error) {
      console.error("Error calling customer support:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: `Please dial support: ${CUSTOMER_SUPPORT_PHONE_DISPLAY}`,
      });
    }
  };

  const handleRemindEmployer = async () => {
    if (!jobId) {
      Toast.show({
        type: "info",
        text1: "Please Refresh",
        text2: "Tap Refresh Status to reload job session info.",
      });
      return;
    }

    if (remindCooldown > 0) {
      Toast.show({
        type: "info",
        text1: "Please Wait",
        text2: `You can remind employer again in ${remindCooldown}s`,
      });
      return;
    }

    try {
      setRemindLoading(true);
      const response = await remindArrivalEmployer(jobId);
      if (response.data.success) {
        setRemindCooldown(60);
        Toast.show({
          type: "success",
          text1: "Reminder Sent",
          text2: "Employer has been notified that you are waiting.",
        });
      } else if (response.data.cooldownRemainingSeconds) {
        setRemindCooldown(response.data.cooldownRemainingSeconds);
        Toast.show({
          type: "info",
          text1: "Please Wait",
          text2: response.data.message,
        });
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to send reminder.";
      Toast.show({
        type: "error",
        text1: "Reminder Failed",
        text2: msg,
      });
    } finally {
      setRemindLoading(false);
    }
  };

  const handleNotResponding = () => {
    Alert.alert(
      "Employer Not Responding?",
      `Choose an option below, or call Zoopol Customer Support at ${CUSTOMER_SUPPORT_PHONE_DISPLAY} for immediate assistance.`,
      [
        ...(employerPhoneNumber
          ? [
              {
                text: "Call Employer",
                onPress: handleCall,
              },
            ]
          : []),
        {
          text: remindCooldown > 0 ? `Nudge Employer (${remindCooldown}s)` : "Nudge Employer",
          onPress: handleRemindEmployer,
        },
        {
          text: `Call Support (${CUSTOMER_SUPPORT_PHONE_DISPLAY})`,
          onPress: handleCallSupport,
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Hero Status Section */}
      <View style={styles.heroSection}>
        <View
          style={[
            styles.pulseRingOuter,
            {
              backgroundColor: colors.primary + "12",
              borderColor: colors.primary + "25",
            },
          ]}
        >
          <View
            style={[
              styles.pulseRingInner,
              { backgroundColor: colors.primary + "22" },
            ]}
          >
            <Ionicons name="time" size={38} color={colors.primary} />
          </View>
        </View>

        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: colors.categoryBox,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={[styles.statusDot, { backgroundColor: colors.primary }]} />
          <Text style={[styles.statusBadgeText, { color: colors.primary }]}>
            Arrived • Awaiting Approval
          </Text>
        </View>

        <Text style={[styles.title, { color: colors.black }]}>
          Waiting for Approval
        </Text>

        <Text style={[styles.description, { color: colors.grey }]}>
          {forbiddenMessage ||
            "You are at the job site. Please let your employer know you've arrived so they can verify and start the job."}
        </Text>
      </View>

      {/* Unified Verification Info Card (Cohesive theme-native card) */}
      <View
        style={[
          styles.guideCard,
          {
            backgroundColor: colors.categoryBox,
            borderColor: colors.border,
          },
        ]}
      >
        {/* Step 1: On-site verification */}
        <View style={styles.guideRow}>
          <View
            style={[
              styles.guideIconContainer,
              { backgroundColor: colors.primary + "16" },
            ]}
          >
            <Ionicons
              name="phone-portrait-outline"
              size={20}
              color={colors.primary}
            />
          </View>
          <View style={styles.guideTextContainer}>
            <Text style={[styles.guideTitle, { color: colors.black }]}>
              Show Screen to Employer
            </Text>
            <Text style={[styles.guideSubtitle, { color: colors.grey }]}>
              Ask the employer to tap "Verify" on their dashboard to start the job timer.
            </Text>
          </View>
        </View>

        {/* Subtle Divider */}
        <View
          style={[styles.guideDivider, { backgroundColor: colors.border }]}
        />

        {/* Step 2: Auto-approval protection */}
        <View style={styles.guideRow}>
          <View
            style={[
              styles.guideIconContainer,
              { backgroundColor: colors.darkGreen + "18" },
            ]}
          >
            <Ionicons
              name="shield-checkmark-outline"
              size={20}
              color={colors.darkGreen}
            />
          </View>
          <View style={styles.guideTextContainer}>
            <View style={styles.autoApproveHeader}>
              <Text style={[styles.guideTitle, { color: colors.black }]}>
                Auto-Approval Protection
              </Text>
              <View
                style={[
                  styles.autoApproveChip,
                  { backgroundColor: colors.darkGreen + "18" },
                ]}
              >
                <Text
                  style={[
                    styles.autoApproveChipText,
                    { color: colors.darkGreen },
                  ]}
                >
                  15 min
                </Text>
              </View>
            </View>
            <Text style={[styles.guideSubtitle, { color: colors.grey }]}>
              If your employer doesn't confirm within 15 minutes, your arrival is automatically approved.
            </Text>
          </View>
        </View>
      </View>

      {/* Action Buttons Section */}
      <View style={styles.actionSection}>
        {employerPhoneNumber ? (
          <View style={styles.dualActionRow}>
            <TouchableOpacity
              style={[
                styles.primaryActionButton,
                { backgroundColor: colors.primary },
              ]}
              onPress={handleCall}
              activeOpacity={0.8}
            >
              <Ionicons
                name="call"
                size={17}
                color="#fff"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.primaryActionText}>Call Employer</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.secondaryActionButton,
                {
                  backgroundColor: colors.categoryBox,
                  borderColor:
                    remindCooldown > 0 ? colors.border : colors.primary,
                  opacity: remindCooldown > 0 ? 0.6 : 1,
                },
              ]}
              onPress={handleRemindEmployer}
              disabled={remindLoading || remindCooldown > 0}
              activeOpacity={0.8}
            >
              {remindLoading ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <>
                  <Ionicons
                    name="notifications-outline"
                    size={17}
                    color={colors.primary}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={[
                      styles.secondaryActionText,
                      { color: colors.primary },
                    ]}
                  >
                    {remindCooldown > 0
                      ? `Nudge (${remindCooldown}s)`
                      : "Nudge"}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[
              styles.singleActionButton,
              {
                backgroundColor: colors.primary,
                opacity: remindCooldown > 0 ? 0.6 : 1,
              },
            ]}
            onPress={handleRemindEmployer}
            disabled={remindLoading || remindCooldown > 0}
            activeOpacity={0.8}
          >
            {remindLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons
                  name="notifications"
                  size={18}
                  color="#fff"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.primaryActionText}>
                  {remindCooldown > 0
                    ? `Nudge Employer (${remindCooldown}s)`
                    : "Nudge Employer"}
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {/* Support Card */}
        <TouchableOpacity
          style={[
            styles.supportCard,
            {
              backgroundColor: colors.categoryBox,
              borderColor: colors.border,
            },
          ]}
          onPress={handleCallSupport}
          activeOpacity={0.7}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons
              name="headset-outline"
              size={18}
              color={colors.primary}
              style={{ marginRight: 8 }}
            />
            <Text style={[styles.supportCardTitle, { color: colors.black }]}>
              Support: {CUSTOMER_SUPPORT_PHONE_DISPLAY}
            </Text>
          </View>
          <Ionicons name="call-outline" size={15} color={colors.primary} />
        </TouchableOpacity>

        {/* Employer Not Responding Link */}
        <TouchableOpacity
          style={styles.notRespondingContainer}
          onPress={handleNotResponding}
          activeOpacity={0.6}
        >
          <Text style={[styles.notRespondingText, { color: colors.grey }]}>
            Employer not responding?{" "}
            <Text style={{ color: colors.primary, fontWeight: "600" }}>
              Tap for help
            </Text>
          </Text>
        </TouchableOpacity>

        {/* Refresh Status Button */}
        <CustomButton
          text="Refresh Status"
          onPress={onRefresh}
          isLoading={actionLoading}
          style={{ width: "100%", marginTop: 4 }}
          icon={<Ionicons name="refresh" size={18} color="white" />}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 8,
    paddingBottom: 24,
  },
  heroSection: {
    alignItems: "center",
    marginBottom: 20,
    width: "100%",
  },
  pulseRingOuter: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  pulseRingInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: "center",
    justifyContent: "center",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 12,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 7,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  description: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
    paddingHorizontal: 16,
  },
  guideCard: {
    width: "100%",
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 18,
  },
  guideRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  guideIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    marginTop: 1,
  },
  guideTextContainer: {
    flex: 1,
  },
  guideTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 3,
  },
  guideSubtitle: {
    fontSize: 12,
    lineHeight: 17,
  },
  guideDivider: {
    height: 1,
    marginVertical: 12,
    opacity: 0.5,
  },
  autoApproveHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 3,
  },
  autoApproveChip: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
    marginLeft: 8,
  },
  autoApproveChipText: {
    fontSize: 10,
    fontWeight: "700",
  },
  actionSection: {
    width: "100%",
  },
  dualActionRow: {
    flexDirection: "row",
    width: "100%",
    gap: 10,
    marginBottom: 10,
  },
  primaryActionButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryActionText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  secondaryActionButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryActionText: {
    fontSize: 14,
    fontWeight: "600",
  },
  singleActionButton: {
    width: "100%",
    height: 48,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  supportCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  supportCardTitle: {
    fontSize: 13,
    fontWeight: "500",
  },
  notRespondingContainer: {
    paddingVertical: 6,
    alignItems: "center",
    marginBottom: 8,
  },
  notRespondingText: {
    fontSize: 13,
  },
});

export default VerificationPendingView;
