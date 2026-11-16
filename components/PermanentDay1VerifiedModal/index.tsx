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

interface PermanentDay1VerifiedModalProps {
  visible: boolean;
  jobTitle?: string;
  workerName?: string;
  isWorker?: boolean;
  onClose: () => void;
}

export const PermanentDay1VerifiedModal: React.FC<
  PermanentDay1VerifiedModalProps
> = ({ visible, jobTitle, workerName = "your staff", isWorker = false, onClose }) => {
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
            { maxHeight: Math.min(screenHeight * 0.88, 620) },
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
            {/* Top Verified Shield Glow */}
            <View style={styles.badgeRing}>
              <View style={styles.badgeInner}>
                <Ionicons name="checkmark-done" size={32} color="#FFFFFF" />
              </View>
            </View>

            {/* Pill Tag */}
            <View style={styles.statusPill}>
              <View style={styles.statusDot} />
              <Text style={styles.statusPillText}>
                {isWorker ? "Reporting Verified ✅" : "Placement Active & Verified ✅"}
              </Text>
            </View>

            {/* Title */}
            <Text style={styles.title}>
              {isWorker
                ? "Welcome to Your New Role!"
                : "Staff Arrival Verified!"}
            </Text>

            <Text style={styles.subTitle}>
              {isWorker
                ? `You have reported successfully for ${jobTitle || "your permanent job"}. We wish you a fulfilling placement!`
                : `We have matched you with ${workerName} and hope you love having them!`}
            </Text>

            {/* Reassurance Cards */}
            <View style={styles.cardsContainer}>
              <View style={styles.cardItem}>
                <View style={styles.cardIconBox}>
                  <Ionicons name="calendar" size={20} color="#6366F1" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>7-Day Trial Commenced</Text>
                  <Text style={styles.cardDesc}>
                    {isWorker
                      ? "Your 7-day initial orientation period has begun. Do your best and adhere to the work schedule."
                      : "Your 7-day orientation period starts today. In 7 days, there will be a feedback check-in."}
                  </Text>
                </View>
              </View>

              {!isWorker && (
                <View style={styles.cardItem}>
                  <View style={[styles.cardIconBox, { backgroundColor: "rgba(16, 185, 129, 0.12)" }]}>
                    <Ionicons name="star" size={20} color="#10B981" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>7-Day Rating & Feedback</Text>
                    <Text style={styles.cardDesc}>
                      You will receive an in-app check-in to submit your rating. If you are not satisfied, our Zoopol Care team will assist you with a replacement.
                    </Text>
                  </View>
                </View>
              )}

              <View style={styles.cardItem}>
                <View style={[styles.cardIconBox, { backgroundColor: "rgba(245, 158, 11, 0.12)" }]}>
                  <Ionicons name="call" size={20} color="#F59E0B" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>Zoopol Support Desk</Text>
                  <Text style={styles.cardDesc}>
                    Any questions or guidance needed? Our team is always one tap away to support both employers and workers.
                  </Text>
                </View>
              </View>
            </View>

            {/* Action Button */}
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={onClose}
              activeOpacity={0.85}
            >
              <Text style={styles.actionBtnText}>Continue to App</Text>
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
      backgroundColor: "rgba(0, 0, 0, 0.72)",
      justifyContent: "center",
      alignItems: "center",
      padding: isSmallDevice ? 16 : 20,
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
      shadowOpacity: 0.35,
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
      paddingHorizontal: isSmallDevice ? 18 : 22,
      paddingTop: 28,
      paddingBottom: 22,
      alignItems: "center",
    },
    badgeRing: {
      width: 76,
      height: 76,
      borderRadius: 38,
      backgroundColor: isDark ? "rgba(16, 185, 129, 0.2)" : "rgba(16, 185, 129, 0.12)",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 10,
      borderWidth: 2,
      borderColor: isDark ? "rgba(16, 185, 129, 0.4)" : "rgba(16, 185, 129, 0.25)",
    },
    badgeInner: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: "#10B981",
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#10B981",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.4,
      shadowRadius: 10,
      elevation: 8,
    },
    statusPill: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isDark ? "rgba(16, 185, 129, 0.15)" : "#ECFDF5",
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: 20,
      marginBottom: 8,
    },
    statusDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: "#10B981",
      marginRight: 6,
    },
    statusPillText: {
      fontSize: 12,
      fontWeight: "700",
      color: isDark ? "#6EE7B7" : "#059669",
    },
    title: {
      fontSize: isSmallDevice ? 19 : 21,
      fontWeight: "800",
      color: isDark ? "#FFFFFF" : "#0F172A",
      textAlign: "center",
      marginBottom: 4,
    },
    subTitle: {
      fontSize: 13,
      color: isDark ? "#94A3B8" : "#64748B",
      textAlign: "center",
      lineHeight: 18,
      marginBottom: 16,
    },
    cardsContainer: {
      width: "100%",
      gap: 10,
      marginBottom: 20,
    },
    cardItem: {
      flexDirection: "row",
      alignItems: "flex-start",
      backgroundColor: isDark ? "rgba(30, 41, 59, 0.6)" : "#F8FAFC",
      borderRadius: 14,
      padding: 12,
      borderWidth: 1,
      borderColor: isDark ? "rgba(255,255,255,0.06)" : "#E2E8F0",
    },
    cardIconBox: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: isDark ? "rgba(99, 102, 241, 0.15)" : "#EEF2FF",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 10,
    },
    cardTitle: {
      fontSize: 13,
      fontWeight: "700",
      color: isDark ? "#F1F5F9" : "#1E293B",
      marginBottom: 2,
    },
    cardDesc: {
      fontSize: 11,
      color: isDark ? "#94A3B8" : "#64748B",
      lineHeight: 15,
    },
    actionBtn: {
      width: "100%",
      height: 48,
      borderRadius: 14,
      backgroundColor: "#6366F1",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      shadowColor: "#6366F1",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
    },
    actionBtnText: {
      fontSize: 14,
      fontWeight: "700",
      color: "#FFFFFF",
    },
  });

