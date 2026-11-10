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

export interface JobPostSuccessModalProps {
  visible: boolean;
  onClose: () => void;
  onTrackStatus?: () => void;
  onBackToHome?: () => void;
  jobTitle?: string;
}

export const JobPostSuccessModal: React.FC<JobPostSuccessModalProps> = ({
  visible,
  onClose,
  onTrackStatus,
  onBackToHome,
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
            { maxHeight: Math.min(screenHeight * 0.9, 680) },
          ]}
        >
          {/* Close button in top-right */}
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
            {/* Top Celebration Avatar / Glow Badge */}
            <View style={styles.badgeOuter}>
              <View style={styles.badgeRing}>
                <View style={styles.badgeInner}>
                  <Ionicons name="sparkles" size={32} color="#FFFFFF" />
                </View>
              </View>
            </View>

            {/* Pill Tag */}
            <View style={styles.statusPill}>
              <View style={styles.statusDot} />
              <Text style={styles.statusPillText}>Zoopol Smart Matching ⚡</Text>
            </View>

            {/* Title */}
            <Text style={styles.title}>Congrats on Your Job Post! 🎉</Text>

            {/* Job Title if provided */}
            {jobTitle ? (
              <View style={styles.jobTag}>
                <Ionicons
                  name="briefcase-outline"
                  size={15}
                  color={isDark ? "#818CF8" : "#6366F1"}
                />
                <Text style={styles.jobTagText} numberOfLines={1}>
                  {jobTitle}
                </Text>
              </View>
            ) : null}

            {/* Reassuring Hero Message */}
            <View style={styles.heroBox}>
              <Text style={styles.heroText}>
                Zoopol will actively manage the workers and accept the best
                selected match for you.
              </Text>
              <Text style={styles.heroSubText}>
                You don't need to worry about anything — sit back and relax!
                We'll notify you the moment people are confirmed. See you on the
                workday! 🤝
              </Text>
            </View>

            {/* 3 Interactive Feature / Assurance Cards */}
            <View style={styles.cardsContainer}>
              {/* Feature 1 */}
              <View style={styles.featureCard}>
                <View
                  style={[
                    styles.featureIconBox,
                    { backgroundColor: isDark ? "rgba(99, 102, 241, 0.2)" : "#EEF2FF" },
                  ]}
                >
                  <Ionicons
                    name="shield-checkmark"
                    size={20}
                    color={isDark ? "#818CF8" : "#6366F1"}
                  />
                </View>
                <View style={styles.featureTextBox}>
                  <Text style={styles.featureTitle}>Automated Processing</Text>
                  <Text style={styles.featureDesc}>
                    Zoopol screens and accepts verified, top-rated workers for
                    your task.
                  </Text>
                </View>
              </View>

              {/* Feature 2 */}
              <View style={styles.featureCard}>
                <View
                  style={[
                    styles.featureIconBox,
                    { backgroundColor: isDark ? "rgba(16, 185, 129, 0.2)" : "#ECFDF5" },
                  ]}
                >
                  <Ionicons
                    name="notifications"
                    size={20}
                    color={isDark ? "#34D399" : "#10B981"}
                  />
                </View>
                <View style={styles.featureTextBox}>
                  <Text style={styles.featureTitle}>Instant Updates</Text>
                  <Text style={styles.featureDesc}>
                    Get pinged instantly when workers are selected and assigned.
                  </Text>
                </View>
              </View>

              {/* Feature 3 */}
              <View style={styles.featureCard}>
                <View
                  style={[
                    styles.featureIconBox,
                    { backgroundColor: isDark ? "rgba(245, 158, 11, 0.2)" : "#FEF3C7" },
                  ]}
                >
                  <Ionicons
                    name="cafe"
                    size={20}
                    color={isDark ? "#FBBF24" : "#F59E0B"}
                  />
                </View>
                <View style={styles.featureTextBox}>
                  <Text style={styles.featureTitle}>Sit Back & Relax</Text>
                  <Text style={styles.featureDesc}>
                    Zero hassle. We handle the process so you can focus on what
                    matters.
                  </Text>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionRow}>
              {onTrackStatus ? (
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={onTrackStatus}
                  activeOpacity={0.85}
                >
                  <Ionicons name="eye-outline" size={19} color="#FFFFFF" />
                  <Text style={styles.primaryButtonText}>Track Job in Status</Text>
                  <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                </TouchableOpacity>
              ) : null}

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={onBackToHome || onClose}
                activeOpacity={0.8}
              >
                <Text style={styles.secondaryButtonText}>Back to Home</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default JobPostSuccessModal;

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
      backgroundColor: isDark ? "rgba(99, 102, 241, 0.18)" : "rgba(99, 102, 241, 0.12)",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: isDark ? "rgba(99, 102, 241, 0.35)" : "rgba(99, 102, 241, 0.25)",
    },
    badgeInner: {
      width: 62,
      height: 62,
      borderRadius: 31,
      backgroundColor: colors.primary || "#6366F1",
      alignItems: "center",
      justifyContent: "center",
      shadowColor: colors.primary || "#6366F1",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.45,
      shadowRadius: 10,
      elevation: 8,
    },
    statusPill: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isDark ? "rgba(99, 102, 241, 0.2)" : "#EEF2FF",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: isDark ? "rgba(99, 102, 241, 0.3)" : "#E0E7FF",
    },
    statusDot: {
      width: 7,
      height: 7,
      borderRadius: 3.5,
      backgroundColor: isDark ? "#818CF8" : "#6366F1",
      marginRight: 6,
    },
    statusPillText: {
      fontSize: 12,
      fontWeight: "700",
      color: isDark ? "#A5B4FC" : "#4F46E5",
      letterSpacing: 0.3,
    },
    title: {
      fontSize: isSmallDevice ? 21 : 23,
      fontWeight: "800",
      color: isDark ? "#FFFFFF" : colors.black,
      textAlign: "center",
      lineHeight: isSmallDevice ? 27 : 30,
      marginBottom: 6,
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
      marginBottom: 18,
      borderLeftWidth: 4,
      borderLeftColor: colors.primary || "#6366F1",
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
    cardsContainer: {
      width: "100%",
      gap: 10,
      marginBottom: 20,
    },
    featureCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "#FFFFFF",
      borderWidth: 1,
      borderColor: isDark ? "rgba(255,255,255,0.07)" : "#E2E8F0",
      borderRadius: 14,
      padding: 12,
    },
    featureIconBox: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    featureTextBox: {
      flex: 1,
    },
    featureTitle: {
      fontSize: 14,
      fontWeight: "700",
      color: isDark ? "#F1F5F9" : "#0F172A",
      marginBottom: 2,
    },
    featureDesc: {
      fontSize: 12,
      color: isDark ? "#94A3B8" : "#64748B",
      lineHeight: 16,
    },
    actionRow: {
      width: "100%",
      gap: 10,
      marginTop: 4,
    },
    primaryButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: colors.primary || "#6366F1",
      height: 52,
      borderRadius: 16,
      shadowColor: colors.primary || "#6366F1",
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

