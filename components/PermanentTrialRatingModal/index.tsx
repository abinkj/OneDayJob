import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Linking,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../contexts/ThemeContext";

interface PermanentTrialRatingModalProps {
  visible: boolean;
  jobData: any;
  onSubmit: (feedback: {
    rating: number;
    comment: string;
    isSatisfied: boolean;
    grievanceReason?: string;
    grievanceNote?: string;
  }) => Promise<void>;
  onClose: () => void;
}

const GRIEVANCE_REASONS = [
  "Punctuality / Frequent Late Arrival",
  "Poor Work Quality / Incomplete Tasks",
  "Behavior or Attitude Concern",
  "Left Without Notice / Absenteeism",
  "Wage / Payment Disagreement",
  "Other Grievance",
];

const CUSTOMER_CARE_PHONE = "+919876543210"; // Zoopol Support Desk

export const PermanentTrialRatingModal: React.FC<
  PermanentTrialRatingModalProps
> = ({ visible, jobData, onSubmit, onClose }) => {
  const { colors, theme } = useTheme();
  const isDark = theme === "dark";
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const isSmallDevice = screenWidth < 370;

  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState("");
  const [isSatisfied, setIsSatisfied] = useState(true);
  const [selectedGrievance, setSelectedGrievance] = useState(GRIEVANCE_REASONS[0]);
  const [grievanceNote, setGrievanceNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const styles = useMemo(
    () => createStyles(colors, isDark, isSmallDevice),
    [colors, isDark, isSmallDevice]
  );

  const worker = jobData?.worker;
  const workerName = worker
    ? `${worker.firstName || ""} ${worker.lastName || ""}`.trim()
    : "Your Worker";

  const handleRatingChange = (val: number) => {
    setRating(val);
    if (val <= 3) {
      setIsSatisfied(false);
    } else {
      setIsSatisfied(true);
    }
  };

  const handleCallCare = () => {
    Linking.openURL(`tel:${CUSTOMER_CARE_PHONE}`).catch((err) =>
      console.error("Failed to open dialer:", err)
    );
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onSubmit({
        rating,
        comment,
        isSatisfied,
        grievanceReason: !isSatisfied ? selectedGrievance : undefined,
        grievanceNote: !isSatisfied ? grievanceNote : undefined,
      });
      onClose();
    } catch (err) {
      console.error("Error submitting rating:", err);
    } finally {
      setSubmitting(false);
    }
  };

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
            { maxHeight: Math.min(screenHeight * 0.92, 720) },
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
            {/* Top Star Glow Badge */}
            <View style={styles.badgeRing}>
              <View style={styles.badgeInner}>
                <Ionicons name="star" size={30} color="#FFFFFF" />
              </View>
            </View>

            {/* Pill Tag */}
            <View style={styles.statusPill}>
              <View style={styles.statusDot} />
              <Text style={styles.statusPillText}>7-Day Placement Review ⏱️</Text>
            </View>

            {/* Title */}
            <Text style={styles.title}>How is {workerName} Doing?</Text>
            <Text style={styles.subTitle}>
              Your 7-day placement trial has completed for {jobData?.name || "your permanent staff"}. Please share your honest rating.
            </Text>

            {/* Star Rating Bar */}
            <View style={styles.starRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => handleRatingChange(star)}
                  style={styles.starButton}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={star <= rating ? "star" : "star-outline"}
                    size={36}
                    color={star <= rating ? "#F59E0B" : "#CBD5E1"}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.ratingLabel}>
              {rating === 5
                ? "🌟 Excellent Fit!"
                : rating === 4
                  ? "👍 Good Experience"
                  : rating === 3
                    ? "😐 Average / Needs Guidance"
                    : "⚠️ Unsatisfactory Performance"}
            </Text>

            {/* Satisfaction Toggle */}
            <View style={styles.satisfactionToggleRow}>
              <TouchableOpacity
                style={[
                  styles.satisfactionBtn,
                  isSatisfied && styles.satisfiedBtnActive,
                ]}
                onPress={() => setIsSatisfied(true)}
              >
                <Ionicons
                  name="happy-outline"
                  size={18}
                  color={isSatisfied ? "#FFFFFF" : colors.black || "#64748B"}
                />
                <Text
                  style={[
                    styles.satisfactionBtnText,
                    isSatisfied && styles.satisfactionActiveText,
                  ]}
                >
                  Satisfied with Staff
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.satisfactionBtn,
                  !isSatisfied && styles.dissatisfiedBtnActive,
                ]}
                onPress={() => setIsSatisfied(false)}
              >
                <Ionicons
                  name="sad-outline"
                  size={18}
                  color={!isSatisfied ? "#FFFFFF" : colors.black || "#64748B"}
                />
                <Text
                  style={[
                    styles.satisfactionBtnText,
                    !isSatisfied && styles.satisfactionActiveText,
                  ]}
                >
                  Have Concerns
                </Text>
              </TouchableOpacity>
            </View>

            {/* If Not Satisfied: Grievance Section + Call Zoopol Care */}
            {!isSatisfied && (
              <View style={styles.grievanceBox}>
                <View style={styles.careCallRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.careCallTitle}>Need Immediate Help?</Text>
                    <Text style={styles.careCallDesc}>
                      Speak with our placement coordinator to request an immediate worker replacement.
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.callCareBtn}
                    onPress={handleCallCare}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="call" size={16} color="#FFFFFF" />
                    <Text style={styles.callCareBtnText}>Call Care</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.fieldLabel}>Select Grievance Reason:</Text>
                <View style={styles.reasonList}>
                  {GRIEVANCE_REASONS.map((reason) => (
                    <TouchableOpacity
                      key={reason}
                      style={[
                        styles.reasonChip,
                        selectedGrievance === reason && styles.selectedReasonChip,
                      ]}
                      onPress={() => setSelectedGrievance(reason)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.reasonChipText,
                          selectedGrievance === reason && styles.selectedReasonText,
                        ]}
                      >
                        {reason}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.fieldLabel}>Describe Your Issue / Grievance:</Text>
                <TextInput
                  style={styles.textArea}
                  value={grievanceNote}
                  onChangeText={setGrievanceNote}
                  placeholder="Tell us what went wrong. Our team will review this report."
                  placeholderTextColor="#94A3B8"
                  multiline
                  numberOfLines={3}
                />
              </View>
            )}

            {/* General Feedback Comment */}
            {isSatisfied && (
              <View style={{ width: "100%", marginBottom: 16 }}>
                <Text style={styles.fieldLabel}>Write a Review (Optional):</Text>
                <TextInput
                  style={styles.textArea}
                  value={comment}
                  onChangeText={setComment}
                  placeholder={`Share your experience with ${workerName}...`}
                  placeholderTextColor="#94A3B8"
                  multiline
                  numberOfLines={3}
                />
              </View>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                !isSatisfied && { backgroundColor: "#EF4444" },
              ]}
              onPress={handleSubmit}
              disabled={submitting}
              activeOpacity={0.85}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.submitButtonText}>
                    {!isSatisfied ? "Submit Grievance to Zoopol" : "Submit Rating"}
                  </Text>
                  <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                </>
              )}
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
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: isDark ? "rgba(245, 158, 11, 0.2)" : "rgba(245, 158, 11, 0.12)",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 10,
      borderWidth: 2,
      borderColor: isDark ? "rgba(245, 158, 11, 0.4)" : "rgba(245, 158, 11, 0.25)",
    },
    badgeInner: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: "#F59E0B",
      alignItems: "center",
      justifyContent: "center",
    },
    statusPill: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isDark ? "rgba(245, 158, 11, 0.15)" : "#FEF3C7",
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: 20,
      marginBottom: 8,
    },
    statusDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: "#F59E0B",
      marginRight: 6,
    },
    statusPillText: {
      fontSize: 12,
      fontWeight: "700",
      color: isDark ? "#FDE68A" : "#B45309",
    },
    title: {
      fontSize: isSmallDevice ? 19 : 21,
      fontWeight: "800",
      color: isDark ? "#FFFFFF" : "#0F172A",
      textAlign: "center",
      marginBottom: 4,
    },
    subTitle: {
      fontSize: 12,
      color: isDark ? "#94A3B8" : "#64748B",
      textAlign: "center",
      lineHeight: 17,
      marginBottom: 14,
    },
    starRow: {
      flexDirection: "row",
      gap: 10,
      marginBottom: 6,
    },
    starButton: {
      padding: 4,
    },
    ratingLabel: {
      fontSize: 13,
      fontWeight: "700",
      color: isDark ? "#F1F5F9" : "#1E293B",
      marginBottom: 16,
    },
    satisfactionToggleRow: {
      flexDirection: "row",
      gap: 10,
      width: "100%",
      marginBottom: 16,
    },
    satisfactionBtn: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      paddingVertical: 10,
      borderRadius: 12,
      backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "#F1F5F9",
      borderWidth: 1,
      borderColor: isDark ? "rgba(255,255,255,0.08)" : "#E2E8F0",
    },
    satisfiedBtnActive: {
      backgroundColor: "#10B981",
      borderColor: "#10B981",
    },
    dissatisfiedBtnActive: {
      backgroundColor: "#EF4444",
      borderColor: "#EF4444",
    },
    satisfactionBtnText: {
      fontSize: 12,
      fontWeight: "600",
      color: isDark ? "#CBD5E1" : "#475569",
    },
    satisfactionActiveText: {
      color: "#FFFFFF",
      fontWeight: "700",
    },
    grievanceBox: {
      width: "100%",
      backgroundColor: isDark ? "rgba(239, 68, 68, 0.08)" : "#FEF2F2",
      borderRadius: 16,
      padding: 14,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: isDark ? "rgba(239, 68, 68, 0.25)" : "#FCA5A5",
    },
    careCallRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isDark ? "rgba(15, 23, 42, 0.7)" : "#FFFFFF",
      padding: 12,
      borderRadius: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: isDark ? "rgba(255,255,255,0.06)" : "#FEE2E2",
    },
    careCallTitle: {
      fontSize: 13,
      fontWeight: "700",
      color: isDark ? "#FFFFFF" : "#991B1B",
      marginBottom: 2,
    },
    careCallDesc: {
      fontSize: 11,
      color: isDark ? "#94A3B8" : "#7F1D1D",
      lineHeight: 14,
    },
    callCareBtn: {
      backgroundColor: "#EF4444",
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 10,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    callCareBtnText: {
      fontSize: 12,
      fontWeight: "700",
      color: "#FFFFFF",
    },
    fieldLabel: {
      fontSize: 12,
      fontWeight: "700",
      color: isDark ? "#E2E8F0" : "#1E293B",
      marginBottom: 6,
    },
    reasonList: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 6,
      marginBottom: 12,
    },
    reasonChip: {
      backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "#FFFFFF",
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderWidth: 1,
      borderColor: isDark ? "rgba(255,255,255,0.08)" : "#E2E8F0",
    },
    selectedReasonChip: {
      backgroundColor: "#EF4444",
      borderColor: "#EF4444",
    },
    reasonChipText: {
      fontSize: 11,
      color: isDark ? "#CBD5E1" : "#475569",
    },
    selectedReasonText: {
      color: "#FFFFFF",
      fontWeight: "700",
    },
    textArea: {
      width: "100%",
      backgroundColor: isDark ? "rgba(15, 23, 42, 0.6)" : "#FFFFFF",
      borderRadius: 12,
      padding: 12,
      fontSize: 13,
      color: isDark ? "#FFFFFF" : "#0F172A",
      borderWidth: 1,
      borderColor: isDark ? "rgba(255,255,255,0.1)" : "#E2E8F0",
      textAlignVertical: "top",
      minHeight: 70,
    },
    submitButton: {
      width: "100%",
      height: 48,
      borderRadius: 14,
      backgroundColor: "#10B981",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      shadowColor: "#10B981",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
    },
    submitButtonText: {
      fontSize: 14,
      fontWeight: "700",
      color: "#FFFFFF",
    },
  });
