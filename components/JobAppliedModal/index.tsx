import React, { useMemo } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../contexts/ThemeContext";

export interface JobAppliedModalProps {
  visible: boolean;
  onClose: () => void;
  onViewApplications?: () => void;
  onExploreMore?: () => void;
  jobTitle?: string;
}

export const JobAppliedModal: React.FC<JobAppliedModalProps> = ({
  visible,
  onClose,
  onViewApplications,
  onExploreMore,
  jobTitle,
}) => {
  const { colors, theme } = useTheme();
  const isDark = theme === "dark";
  const { height: screenHeight, width: screenWidth } = useWindowDimensions();

  const isSmallDevice = screenWidth < 370;

  const styles = useMemo(
    () => createStyles(colors, isDark, isSmallDevice),
    [colors, isDark, isSmallDevice]
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.modalCard,
            { maxHeight: Math.min(screenHeight * 0.9, 700) },
          ]}
        >
          {/* Close button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            activeOpacity={0.7}
          >
            <Ionicons
              name="close"
              size={22}
              color={isDark ? "#94A3B8" : "#64748B"}
            />
          </TouchableOpacity>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            bounces={false}
          >
            {/* Top Celebration Avatar / Flame Glow Badge */}
            <View style={styles.badgeOuter}>
              <View style={styles.badgeRing}>
                <View style={styles.badgeInner}>
                  <Ionicons name="flame" size={34} color="#FFFFFF" />
                </View>
              </View>
            </View>

            {/* Pill Tag */}
            <View style={styles.statusPill}>
              <View style={styles.statusDot} />
              <Text style={styles.statusPillText}>Application Received ⚡</Text>
            </View>

            {/* Title */}
            <Text style={styles.title}>Yei ma bwoii! 🔥</Text>
            <Text style={styles.subTitle}>You're in the running!</Text>

            {/* Job Title if provided */}
            {jobTitle ? (
              <View style={styles.jobTag}>
                <Ionicons
                  name="briefcase-outline"
                  size={15}
                  color={isDark ? "#34D399" : "#059669"}
                />
                <Text style={styles.jobTagText} numberOfLines={1}>
                  {jobTitle}
                </Text>
              </View>
            ) : null}

            {/* Reassuring Hero Message */}
            <View style={styles.heroBox}>
              <Text style={styles.heroText}>
                We will process your application and match you with the employer!
              </Text>
              <Text style={styles.heroSubText}>
                Zoopol is reviewing applicant profiles. We will let you know as
                soon as you are accepted. Sit tight, get ready, and see you at
                the workday! 🚀
              </Text>
            </View>

            {/* Interactive 3-Step Timeline Progression */}
            <View style={styles.timelineContainer}>
              {/* Step 1: Done */}
              <View style={styles.timelineItem}>
                <View style={styles.timelineLeft}>
                  <View
                    style={[
                      styles.timelineIconCircle,
                      { backgroundColor: isDark ? "rgba(16, 185, 129, 0.2)" : "#ECFDF5" },
                    ]}
                  >
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#10B981"
                    />
                  </View>
                  <View
                    style={[
                      styles.timelineConnector,
                      { backgroundColor: "#10B981" },
                    ]}
                  />
                </View>
                <View style={styles.timelineContent}>
                  <View style={styles.timelineTitleRow}>
                    <Text style={styles.timelineTitle}>
                      Application Submitted
                    </Text>
                    <View style={styles.badgeDone}>
                      <Text style={styles.badgeDoneText}>Done ✓</Text>
                    </View>
                  </View>
                  <Text style={styles.timelineDesc}>
                    Your details have been received securely.
                  </Text>
                </View>
              </View>

              {/* Step 2: In Progress */}
              <View style={styles.timelineItem}>
                <View style={styles.timelineLeft}>
                  <View
                    style={[
                      styles.timelineIconCircle,
                      {
                        backgroundColor: isDark
                          ? "rgba(99, 102, 241, 0.25)"
                          : "#EEF2FF",
                        borderColor: isDark ? "#818CF8" : "#6366F1",
                        borderWidth: 1.5,
                      },
                    ]}
                  >
                    <Ionicons
                      name="hourglass"
                      size={17}
                      color={isDark ? "#818CF8" : "#6366F1"}
                    />
                  </View>
                  <View
                    style={[
                      styles.timelineConnector,
                      {
                        backgroundColor: isDark
                          ? "rgba(255,255,255,0.12)"
                          : "#E2E8F0",
                      },
                    ]}
                  />
                </View>
                <View style={styles.timelineContent}>
                  <View style={styles.timelineTitleRow}>
                    <Text style={styles.timelineTitle}>
                      Matching & Reviewing
                    </Text>
                    <View style={styles.badgeActive}>
                      <Text style={styles.badgeActiveText}>In Progress ⚡</Text>
                    </View>
                  </View>
                  <Text style={styles.timelineDesc}>
                    Zoopol matches and confirms with employer.
                  </Text>
                </View>
              </View>

              {/* Step 3: Upcoming */}
              <View style={[styles.timelineItem, { marginBottom: 0 }]}>
                <View style={styles.timelineLeft}>
                  <View
                    style={[
                      styles.timelineIconCircle,
                      {
                        backgroundColor: isDark
                          ? "rgba(255, 255, 255, 0.05)"
                          : "#F1F5F9",
                      },
                    ]}
                  >
                    <Ionicons
                      name="notifications-outline"
                      size={18}
                      color={isDark ? "#94A3B8" : "#64748B"}
                    />
                  </View>
                </View>
                <View style={styles.timelineContent}>
                  <View style={styles.timelineTitleRow}>
                    <Text style={styles.timelineTitle}>
                      Workday Acceptance
                    </Text>
                    <View style={styles.badgeUpcoming}>
                      <Text style={styles.badgeUpcomingText}>Next 🔔</Text>
                    </View>
                  </View>
                  <Text style={styles.timelineDesc}>
                    You will be alerted instantly when selected!
                  </Text>
                </View>
              </View>
            </View>

            {/* Pro Tip Card */}
            <View style={styles.tipCard}>
              <Ionicons
                name="bulb-outline"
                size={18}
                color={isDark ? "#FBBF24" : "#D97706"}
              />
              <Text style={styles.tipText}>
                Keep notifications ON so you don't miss the acceptance alert!
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionRow}>
              {onViewApplications ? (
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={onViewApplications}
                  activeOpacity={0.85}
                >
                  <Ionicons name="clipboard-outline" size={19} color="#FFFFFF" />
                  <Text style={styles.primaryButtonText}>
                    View in My Applications
                  </Text>
                  <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                </TouchableOpacity>
              ) : null}

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={onExploreMore || onClose}
                activeOpacity={0.8}
              >
                <Text style={styles.secondaryButtonText}>Explore More Jobs</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default JobAppliedModal;

const createStyles = (colors: any, isDark: boolean, isSmallDevice: boolean) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(10, 15, 29, 0.75)",
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: isSmallDevice ? 14 : 20,
      paddingVertical: 24,
    },
    modalCard: {
      width: "100%",
      maxWidth: 440,
      backgroundColor: isDark ? "#1E2230" : "#FFFFFF",
      borderRadius: 28,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.05)",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 14 },
      shadowOpacity: 0.35,
      shadowRadius: 24,
      elevation: 16,
    },
    closeButton: {
      position: "absolute",
      top: 16,
      right: 16,
      zIndex: 10,
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
      alignItems: "center",
      justifyContent: "center",
    },
    scrollContent: {
      paddingHorizontal: isSmallDevice ? 18 : 24,
      paddingTop: 32,
      paddingBottom: 24,
      alignItems: "center",
    },
    badgeOuter: {
      marginBottom: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    badgeRing: {
      width: 82,
      height: 82,
      borderRadius: 41,
      backgroundColor: isDark ? "rgba(249, 115, 22, 0.18)" : "rgba(249, 115, 22, 0.12)",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: isDark ? "rgba(249, 115, 22, 0.35)" : "rgba(249, 115, 22, 0.25)",
    },
    badgeInner: {
      width: 62,
      height: 62,
      borderRadius: 31,
      backgroundColor: "#F97316",
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#F97316",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.45,
      shadowRadius: 10,
      elevation: 8,
    },
    statusPill: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isDark ? "rgba(249, 115, 22, 0.18)" : "#FFF7ED",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: isDark ? "rgba(249, 115, 22, 0.3)" : "#FED7AA",
    },
    statusDot: {
      width: 7,
      height: 7,
      borderRadius: 3.5,
      backgroundColor: "#F97316",
      marginRight: 6,
    },
    statusPillText: {
      fontSize: 12,
      fontWeight: "700",
      color: isDark ? "#FB923C" : "#EA580C",
      letterSpacing: 0.3,
    },
    title: {
      fontSize: isSmallDevice ? 23 : 25,
      fontWeight: "900",
      color: isDark ? "#FFFFFF" : colors.black,
      textAlign: "center",
      letterSpacing: -0.5,
    },
    subTitle: {
      fontSize: 15,
      fontWeight: "700",
      color: isDark ? "#34D399" : "#059669",
      marginBottom: 6,
      textAlign: "center",
    },
    jobTag: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "#F1F5F9",
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: 14,
      marginBottom: 14,
      maxWidth: "90%",
    },
    jobTagText: {
      fontSize: 13,
      fontWeight: "600",
      color: isDark ? "#E2E8F0" : "#334155",
    },
    heroBox: {
      width: "100%",
      backgroundColor: isDark ? "rgba(30, 41, 59, 0.7)" : "#F8FAFC",
      borderRadius: 16,
      padding: isSmallDevice ? 14 : 16,
      marginBottom: 16,
      borderLeftWidth: 4,
      borderLeftColor: "#10B981",
    },
    heroText: {
      fontSize: isSmallDevice ? 14 : 15,
      fontWeight: "700",
      color: isDark ? "#F8FAFC" : "#1E293B",
      lineHeight: 21,
      marginBottom: 6,
    },
    heroSubText: {
      fontSize: 13,
      color: isDark ? "#94A3B8" : "#64748B",
      lineHeight: 19,
      fontWeight: "500",
    },
    timelineContainer: {
      width: "100%",
      backgroundColor: isDark ? "rgba(255,255,255,0.02)" : "#FFFFFF",
      borderWidth: 1,
      borderColor: isDark ? "rgba(255,255,255,0.07)" : "#E2E8F0",
      borderRadius: 16,
      padding: 14,
      marginBottom: 14,
    },
    timelineItem: {
      flexDirection: "row",
      marginBottom: 14,
    },
    timelineLeft: {
      alignItems: "center",
      marginRight: 12,
      width: 32,
    },
    timelineIconCircle: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    timelineConnector: {
      width: 2,
      flex: 1,
      marginTop: 4,
      borderRadius: 1,
    },
    timelineContent: {
      flex: 1,
      justifyContent: "center",
    },
    timelineTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 2,
    },
    timelineTitle: {
      fontSize: 13.5,
      fontWeight: "700",
      color: isDark ? "#F1F5F9" : "#0F172A",
    },
    badgeDone: {
      backgroundColor: isDark ? "rgba(16, 185, 129, 0.2)" : "#ECFDF5",
      paddingHorizontal: 7,
      paddingVertical: 2,
      borderRadius: 8,
    },
    badgeDoneText: {
      fontSize: 10.5,
      fontWeight: "700",
      color: "#10B981",
    },
    badgeActive: {
      backgroundColor: isDark ? "rgba(99, 102, 241, 0.25)" : "#EEF2FF",
      paddingHorizontal: 7,
      paddingVertical: 2,
      borderRadius: 8,
    },
    badgeActiveText: {
      fontSize: 10.5,
      fontWeight: "700",
      color: isDark ? "#A5B4FC" : "#6366F1",
    },
    badgeUpcoming: {
      backgroundColor: isDark ? "rgba(255, 255, 255, 0.08)" : "#F1F5F9",
      paddingHorizontal: 7,
      paddingVertical: 2,
      borderRadius: 8,
    },
    badgeUpcomingText: {
      fontSize: 10.5,
      fontWeight: "600",
      color: isDark ? "#94A3B8" : "#64748B",
    },
    timelineDesc: {
      fontSize: 12,
      color: isDark ? "#94A3B8" : "#64748B",
      lineHeight: 16,
    },
    tipCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: isDark ? "rgba(245, 158, 11, 0.12)" : "#FFFBEB",
      borderWidth: 1,
      borderColor: isDark ? "rgba(245, 158, 11, 0.25)" : "#FEF3C7",
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
      width: "100%",
      marginBottom: 18,
    },
    tipText: {
      flex: 1,
      fontSize: 12,
      fontWeight: "500",
      color: isDark ? "#FDE68A" : "#92400E",
      lineHeight: 17,
    },
    actionRow: {
      width: "100%",
      gap: 10,
    },
    primaryButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: "#10B981",
      height: 52,
      borderRadius: 16,
      shadowColor: "#10B981",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.35,
      shadowRadius: 10,
      elevation: 6,
    },
    primaryButtonText: {
      fontSize: 15,
      fontWeight: "700",
      color: "#FFFFFF",
      letterSpacing: 0.3,
    },
    secondaryButton: {
      height: 46,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "#F1F5F9",
    },
    secondaryButtonText: {
      fontSize: 14,
      fontWeight: "600",
      color: isDark ? "#CBD5E1" : "#475569",
    },
  });

