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

interface PermanentInfoModalProps {
  visible: boolean;
  categoryName?: string;
  onProceed: () => void;
  onClose: () => void;
}

export const PermanentInfoModal: React.FC<PermanentInfoModalProps> = ({
  visible,
  categoryName = "Permanent Staff",
  onProceed,
  onClose,
}) => {
  const { colors, theme } = useTheme();
  const isDark = theme === "dark";
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
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
            { maxHeight: Math.min(screenHeight * 0.88, 640) },
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
              size={20}
              color={isDark ? "#94A3B8" : "#64748B"}
            />
          </TouchableOpacity>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            bounces={false}
          >
            {/* Header Icon */}
            <View style={styles.badgeRing}>
              <View style={styles.badgeInner}>
                <Ionicons name="briefcase" size={30} color="#FFFFFF" />
              </View>
            </View>

            {/* Pill Tag */}
            <View style={styles.statusPill}>
              <View style={styles.statusDot} />
              <Text style={styles.statusPillText}>Zoopol Monthly Hire ✨</Text>
            </View>

            {/* Title */}
            <Text style={styles.title}>What is a Permanent Job?</Text>
            <Text style={styles.subTitle}>
              Hiring for {categoryName} on a monthly recurring basis.
            </Text>

            {/* Explainer / Perks Box */}
            <View style={styles.infoBox}>
              <View style={styles.perkRow}>
                <View style={styles.perkIconBox}>
                  <Ionicons name="calendar-outline" size={20} color="#6366F1" />
                </View>
                <View style={styles.perkTextContainer}>
                  <Text style={styles.perkTitle}>Monthly Retainer Basis</Text>
                  <Text style={styles.perkDesc}>
                    Unlike daily jobs, permanent roles are full-time or part-time staff with fixed monthly salaries.
                  </Text>
                </View>
              </View>

              <View style={styles.perkRow}>
                <View style={styles.perkIconBox}>
                  <Ionicons name="shield-checkmark-outline" size={20} color="#10B981" />
                </View>
                <View style={styles.perkTextContainer}>
                  <Text style={styles.perkTitle}>Handpicked & Screened by Zoopol</Text>
                  <Text style={styles.perkDesc}>
                    Our dedicated recruitment desk verifies candidates, checks backgrounds, and assigns the best match.
                  </Text>
                </View>
              </View>

              <View style={styles.perkRow}>
                <View style={styles.perkIconBox}>
                  <Ionicons name="gift-outline" size={20} color="#F59E0B" />
                </View>
                <View style={styles.perkTextContainer}>
                  <Text style={styles.perkTitle}>Early Supporter Free Experience</Text>
                  <Text style={styles.perkDesc}>
                    Zero platform matching fee or commission! Enjoy this placement service 100% free of cost.
                  </Text>
                </View>
              </View>

              <View style={[styles.perkRow, { borderBottomWidth: 0, paddingBottom: 0 }]}>
                <View style={styles.perkIconBox}>
                  <Ionicons name="star-outline" size={20} color="#EC4899" />
                </View>
                <View style={styles.perkTextContainer}>
                  <Text style={styles.perkTitle}>7-Day Satisfaction Review</Text>
                  <Text style={styles.perkDesc}>
                    After 7 days of onboarding, rate your worker. If not satisfied, Zoopol Care helps you rematch.
                  </Text>
                </View>
              </View>
            </View>

            {/* Action Button */}
            <TouchableOpacity
              style={styles.proceedButton}
              onPress={onProceed}
              activeOpacity={0.85}
            >
              <Text style={styles.proceedButtonText}>Proceed to Job Details</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const createStyles = (colors: any, isDark: boolean, isSmallDevice: boolean) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.65)",
      justifyContent: "center",
      alignItems: "center",
      padding: isSmallDevice ? 16 : 22,
    },
    modalCard: {
      width: "100%",
      backgroundColor: isDark ? "#0F172A" : "#FFFFFF",
      borderRadius: 24,
      overflow: "hidden",
      position: "relative",
      borderWidth: 1,
      borderColor: isDark ? "rgba(255,255,255,0.1)" : "#E2E8F0",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 12,
    },
    closeButton: {
      position: "absolute",
      top: 14,
      right: 14,
      zIndex: 10,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
      alignItems: "center",
      justifyContent: "center",
    },
    scrollContent: {
      paddingHorizontal: isSmallDevice ? 18 : 24,
      paddingTop: 28,
      paddingBottom: 24,
      alignItems: "center",
    },
    badgeRing: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: isDark ? "rgba(99, 102, 241, 0.2)" : "rgba(99, 102, 241, 0.12)",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 12,
      borderWidth: 2,
      borderColor: isDark ? "rgba(99, 102, 241, 0.4)" : "rgba(99, 102, 241, 0.25)",
    },
    badgeInner: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: "#6366F1",
      alignItems: "center",
      justifyContent: "center",
    },
    statusPill: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isDark ? "rgba(99, 102, 241, 0.2)" : "#EEF2FF",
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: 20,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: isDark ? "rgba(99, 102, 241, 0.3)" : "#E0E7FF",
    },
    statusDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: "#6366F1",
      marginRight: 6,
    },
    statusPillText: {
      fontSize: 12,
      fontWeight: "700",
      color: isDark ? "#A5B4FC" : "#4F46E5",
    },
    title: {
      fontSize: isSmallDevice ? 20 : 22,
      fontWeight: "800",
      color: isDark ? "#FFFFFF" : "#0F172A",
      textAlign: "center",
      marginBottom: 4,
    },
    subTitle: {
      fontSize: 13,
      color: isDark ? "#94A3B8" : "#64748B",
      textAlign: "center",
      marginBottom: 18,
    },
    infoBox: {
      width: "100%",
      backgroundColor: isDark ? "rgba(30, 41, 59, 0.5)" : "#F8FAFC",
      borderRadius: 16,
      padding: 14,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: isDark ? "rgba(255,255,255,0.06)" : "#E2E8F0",
    },
    perkRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      paddingBottom: 12,
      marginBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? "rgba(255,255,255,0.06)" : "#EDF2F7",
    },
    perkIconBox: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "#FFFFFF",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
      borderWidth: 1,
      borderColor: isDark ? "rgba(255,255,255,0.08)" : "#E2E8F0",
    },
    perkTextContainer: {
      flex: 1,
    },
    perkTitle: {
      fontSize: 13,
      fontWeight: "700",
      color: isDark ? "#F1F5F9" : "#1E293B",
      marginBottom: 2,
    },
    perkDesc: {
      fontSize: 12,
      color: isDark ? "#94A3B8" : "#64748B",
      lineHeight: 16,
    },
    proceedButton: {
      width: "100%",
      height: 50,
      borderRadius: 16,
      backgroundColor: "#6366F1",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      shadowColor: "#6366F1",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 8,
      elevation: 6,
    },
    proceedButtonText: {
      fontSize: 15,
      fontWeight: "700",
      color: "#FFFFFF",
    },
  });

