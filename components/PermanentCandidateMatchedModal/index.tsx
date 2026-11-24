import React, { useMemo } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../contexts/ThemeContext";

interface PermanentCandidateMatchedModalProps {
  visible: boolean;
  jobData: any;
  onAcknowledge: () => void;
  onViewJob: () => void;
}

export const PermanentCandidateMatchedModal: React.FC<
  PermanentCandidateMatchedModalProps
> = ({ visible, jobData, onAcknowledge, onViewJob }) => {
  const { colors, theme } = useTheme();
  const isDark = theme === "dark";
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const isSmallDevice = screenWidth < 370;

  const styles = useMemo(
    () => createStyles(colors, isDark, isSmallDevice),
    [colors, isDark, isSmallDevice]
  );

  const worker = jobData?.worker;
  const workerName = worker
    ? `${worker.firstName || ""} ${worker.lastName || ""}`.trim()
    : "Your Assigned Worker";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onAcknowledge}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.modalCard,
            { maxHeight: Math.min(screenHeight * 0.9, 660) },
          ]}
        >
          {/* Close button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onAcknowledge}
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
            {/* Top Celebration Avatar / Glow Badge */}
            <View style={styles.badgeRing}>
              <View style={styles.badgeInner}>
                <Ionicons name="sparkles" size={32} color="#FFFFFF" />
              </View>
            </View>

            {/* Pill Tag */}
            <View style={styles.statusPill}>
              <View style={styles.statusDot} />
              <Text style={styles.statusPillText}>Suitable Worker Matched! 🎉</Text>
            </View>

            {/* Title */}
            <Text style={styles.title}>Congrats! We've Picked Your Worker</Text>
            <Text style={styles.subTitle}>
              Our Zoopol placement team has screened and handpicked a verified candidate for {jobData?.name || "your permanent job"}.
            </Text>

            {/* Candidate Card */}
            <View style={styles.candidateCard}>
              <View style={styles.avatarBox}>
                {worker?.profilePicture ? (
                  <Image
                    source={{ uri: worker.profilePicture }}
                    style={styles.avatarImg}
                  />
                ) : (
                  <Ionicons name="person" size={28} color="#6366F1" />
                )}
              </View>
              <View style={styles.candidateInfo}>
                <View style={styles.verifiedRow}>
                  <Text style={styles.candidateName}>{workerName}</Text>
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                </View>
                <Text style={styles.candidateCategory}>
                  {jobData?.category?.name || "Permanent Staff"}
                </Text>
                {jobData?.monthlySalary ? (
                  <Text style={styles.salaryText}>
                    ₹{Number(jobData.monthlySalary).toLocaleString("en-IN")} / month
                  </Text>
                ) : null}
              </View>
            </View>

            {/* Early Supporter Note Box */}
            <View style={styles.earlySupporterBox}>
              <View style={styles.supporterHeader}>
                <Ionicons name="gift" size={18} color="#F59E0B" />
                <Text style={styles.supporterTitle}>Early Supporter Privilege 🎁</Text>
              </View>
              <Text style={styles.supporterDesc}>
                Since you are one of our initial supporters of the Zoopol app, you get to experience this placement service <Text style={{ fontWeight: "700", color: isDark ? "#FDE68A" : "#B45309" }}>100% free of cost</Text>! No placement commission or hidden agency fees.
              </Text>
            </View>

            {/* Next Steps Note */}
            <View style={styles.stepsNote}>
              <Ionicons name="information-circle-outline" size={18} color="#6366F1" />
              <Text style={styles.stepsText}>
                Your worker will report to your address on the start date. You will verify their arrival to start your 7-day trial.
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={onViewJob}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryButtonText}>View Job & Candidate</Text>
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={onAcknowledge}
                activeOpacity={0.7}
              >
                <Text style={styles.secondaryButtonText}>Got it, Thanks!</Text>
              </TouchableOpacity>
            </View>
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
      backgroundColor: "rgba(0, 0, 0, 0.7)",
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
      backgroundColor: isDark ? "rgba(99, 102, 241, 0.2)" : "rgba(99, 102, 241, 0.12)",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 12,
      borderWidth: 2,
      borderColor: isDark ? "rgba(99, 102, 241, 0.4)" : "rgba(99, 102, 241, 0.25)",
    },
    badgeInner: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: "#6366F1",
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#6366F1",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.4,
      shadowRadius: 10,
      elevation: 8,
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
      fontSize: isSmallDevice ? 19 : 21,
      fontWeight: "800",
      color: isDark ? "#FFFFFF" : "#0F172A",
      textAlign: "center",
      marginBottom: 6,
      lineHeight: 26,
    },
    subTitle: {
      fontSize: 13,
      color: isDark ? "#94A3B8" : "#64748B",
      textAlign: "center",
      lineHeight: 18,
      marginBottom: 16,
    },
    candidateCard: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isDark ? "rgba(30, 41, 59, 0.7)" : "#F8FAFC",
      borderRadius: 16,
      padding: 14,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: isDark ? "rgba(255,255,255,0.08)" : "#E2E8F0",
    },
    avatarBox: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: isDark ? "rgba(99, 102, 241, 0.15)" : "#EEF2FF",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 14,
      overflow: "hidden",
      borderWidth: 1.5,
      borderColor: "#6366F1",
    },
    avatarImg: {
      width: "100%",
      height: "100%",
    },
    candidateInfo: {
      flex: 1,
    },
    verifiedRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginBottom: 2,
    },
    candidateName: {
      fontSize: 15,
      fontWeight: "700",
      color: isDark ? "#FFFFFF" : "#0F172A",
    },
    candidateCategory: {
      fontSize: 12,
      color: isDark ? "#94A3B8" : "#64748B",
      marginBottom: 2,
    },
    salaryText: {
      fontSize: 13,
      fontWeight: "700",
      color: "#6366F1",
    },
    earlySupporterBox: {
      width: "100%",
      backgroundColor: isDark ? "rgba(245, 158, 11, 0.1)" : "#FFFBEB",
      borderRadius: 14,
      padding: 14,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: isDark ? "rgba(245, 158, 11, 0.25)" : "#FDE68A",
    },
    supporterHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 4,
    },
    supporterTitle: {
      fontSize: 13,
      fontWeight: "700",
      color: isDark ? "#FBBF24" : "#B45309",
    },
    supporterDesc: {
      fontSize: 12,
      color: isDark ? "#F3F4F6" : "#4B5563",
      lineHeight: 17,
    },
    stepsNote: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      width: "100%",
      backgroundColor: isDark ? "rgba(99, 102, 241, 0.08)" : "#F1F5F9",
      padding: 10,
      borderRadius: 12,
      marginBottom: 18,
    },
    stepsText: {
      flex: 1,
      fontSize: 11,
      color: isDark ? "#CBD5E1" : "#475569",
      lineHeight: 15,
    },
    actionRow: {
      width: "100%",
      gap: 10,
    },
    primaryButton: {
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
    primaryButtonText: {
      fontSize: 14,
      fontWeight: "700",
      color: "#FFFFFF",
    },
    secondaryButton: {
      height: 42,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "#F1F5F9",
    },
    secondaryButtonText: {
      fontSize: 13,
      fontWeight: "600",
      color: isDark ? "#94A3B8" : "#64748B",
    },
  });

