import React, { useMemo } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemeColors } from "../../constants/Colors";
import { JobCardData } from "../../types";
import StatusBadge from "../statusBadge";
import {
  getJobStatusInfo,
  getApplicationStatusInfo,
  getDisplayStatus,
  isWorkCompleted,
  getEmployerDisplayStatus,
} from "../../utilities/statusUtils";
import { useTheme } from "../../contexts/ThemeContext";
import {
  formatDateDDMMYYYY,
  formatTimePreference,
  canEditJob,
} from "../../utilities/jobUtils";

const JobCard = ({
  data,
  onPress,
  onWithdraw,
  onDelete,
  onPayment,
  onSummary,
  onRepost,
  onEdit,
  withdraw = false,
  isEmployer = false,
  applicationStatus,
  showPaymentButton = false,
}: {
  data: JobCardData;
  onPress: Function;
  onWithdraw?: Function;
  onDelete?: Function;
  onPayment?: Function;
  onSummary?: Function;
  onRepost?: Function;
  onEdit?: Function;
  withdraw?: boolean;
  isEmployer?: boolean;
  applicationStatus?: string;
  showPaymentButton?: boolean;
}) => {
  const { colors, theme } = useTheme();
  const isDark = theme === "dark";
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  const isEditable = useMemo(() => {
    if (data?.canEdit !== undefined) return data.canEdit;
    return canEditJob(data).canEdit;
  }, [data]);

  const {
    name,
    budget,
    applicantCount,
    location,
    createdAt,
    onDate,
    beforeDate,
    status = "active",
    jobStatus, // Backend job status
    category,
    description,
    isRemote,
    isFlexible,
    requirements,
    timePreference,
    jobType,
    startDate,
    reportingTime,
    monthlySalary,
  } = (data as any) || {};

  const isPermanent = jobType === "permanent";

  // Use jobStatus if available, otherwise fall back to status
  const actualStatus = jobStatus || status;

  // Get the appropriate status for display
  const displayStatus = getDisplayStatus(
    actualStatus,
    applicationStatus,
    isEmployer
  );

  // Get status info based on context, deriving display label from isPaymentDone at render time
  const statusInfo = isEmployer
    ? getJobStatusInfo(displayStatus, data?.isPaymentDone)
    : getApplicationStatusInfo(displayStatus, data?.isPaymentDone);

  const isApplied =
    displayStatus?.toLowerCase() === "applied" ||
    displayStatus?.toLowerCase() === "accepted";
  const isInProgress =
    displayStatus?.toLowerCase() === "in_progress" ||
    displayStatus?.toLowerCase() === "in progress";
  const isCompleted =
    displayStatus?.toLowerCase() === "completed" ||
    displayStatus?.toLowerCase() === "work_completed";
  const isWorkCompletedStatus =
    isCompleted && data?.isPaymentDone !== true;

  // Check if work is completed based on status or backend flags
  // Use actualStatus instead of displayStatus to check the real backend status
  const isWorkFinished = isWorkCompleted(
    actualStatus,
    data?.isCompletedByWorker,
    data?.isVerifiedByEmployer
  );


  const formattedLocation = location?.address
    ? `${location.address}${location.city ? ", " + location.city : ""}${location.state ? ", " + location.state : ""
    }${location.country ? ", " + location.country : ""}`
    : location?.country || "Remote";

  const formatRequirements = (reqs: string[]) => {
    if (!reqs || reqs.length === 0) return "No specific requirements";
    return (
      reqs.slice(0, 2).join(", ") +
      (reqs.length > 2 ? ` +${reqs.length - 2} more` : "")
    );
  };

  return (
    <View
      style={[
        styles.card,
        isPermanent && styles.permanentCard,
      ]}
    >
      {/* Permanent Job Exclusive Top Accent Banner */}
      {isPermanent && (
        <View style={styles.permanentTopBanner}>
          <View style={styles.permanentBadge}>
            <Ionicons name="sparkles" size={11} color="#FFFFFF" />
            <Text style={styles.permanentBadgeText}>PERMANENT JOB</Text>
          </View>
          <View style={styles.permanentTierBadge}>
            <Ionicons name="shield-checkmark" size={12} color={isDark ? "#818CF8" : "#4F46E5"} />
            <Text style={styles.permanentTierText}>Zoopol Placement</Text>
          </View>
        </View>
      )}

      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flexShrink: 1 }}>
          <View style={[styles.categoryContainer, isPermanent && styles.permanentCategoryContainer]}>
            <Text style={[styles.category, isPermanent && styles.permanentCategoryText]}>
              {category?.name?.toUpperCase() || "GENERAL"}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <StatusBadge statusInfo={statusInfo} size="medium" showIcon={true} />

          {/* Employer: show Edit icon at the top right of the job card */}
          {isEmployer && onEdit && isEditable && (
            <TouchableOpacity
              style={[styles.topRightEditButton, isPermanent && styles.permanentEditButton]}
              onPress={() => onEdit(data)}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="create-outline" size={16} color={isPermanent ? (isDark ? "#818CF8" : "#6366F1") : colors.primary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Job Title */}
      <Text style={styles.title}>{name || "Untitled Job"}</Text>

      {/* Description */}
      {description && (
        <Text style={styles.description} numberOfLines={2}>
          {description}
        </Text>
      )}

      {/* Price & Applicants Display */}
      {!isPermanent ? (
        <View style={styles.metaRow}>
          <Text style={styles.price}>
            ₹{(budget ? budget.toLocaleString() : "0")}
          </Text>
          <Text style={styles.separator}>|</Text>
          <Text style={styles.slots}>{applicantCount || 0}</Text>
          <Ionicons
            name="person"
            size={14}
            color="#386BF6"
            style={{ marginLeft: 8 }}
          />
        </View>
      ) : (
        <View style={styles.permanentSalaryCard}>
          <View>
            <Text style={styles.permanentSalaryLabel}>MONTHLY SALARY</Text>
            <View style={{ flexDirection: "row", alignItems: "baseline" }}>
              <Text style={styles.permanentSalaryAmount}>
                ₹{(monthlySalary || budget ? (monthlySalary || budget).toLocaleString() : "0")}
              </Text>
              <Text style={styles.permanentSalaryPeriod}> / month</Text>
            </View>
          </View>
          <View style={styles.permanentApplicantsPill}>
            <Ionicons name="people" size={13} color={isDark ? "#818CF8" : "#4F46E5"} />
            <Text style={styles.permanentApplicantsText}>
              {applicantCount || 0} {applicantCount === 1 ? "Candidate" : "Candidates"}
            </Text>
          </View>
        </View>
      )}

      {/* Location & Date */}
      <View style={styles.metaRow}>
        <Ionicons
          name={isRemote ? "laptop" : "location"}
          size={14}
          color={isPermanent ? (isDark ? "#A5B4FC" : "#6366F1") : colors.iconBlack}
        />
        <Text style={[styles.metaLocation, isPermanent && styles.permanentMetaText]}>
          {isRemote ? "Remote Work" : formattedLocation}
        </Text>
        <Ionicons
          name="calendar"
          size={14}
          color={isPermanent ? (isDark ? "#A5B4FC" : "#6366F1") : colors.iconBlack}
          style={{ marginLeft: 14 }}
        />
        <Text
          style={[
            styles.metaText,
            isPermanent && styles.permanentDateHighlight,
          ]}
        >
          {isPermanent
            ? `Starts: ${formatDateDDMMYYYY(startDate || onDate)}`
            : onDate
            ? formatDateDDMMYYYY(onDate)
            : beforeDate
            ? formatDateDDMMYYYY(beforeDate)
            : createdAt
            ? formatDateDDMMYYYY(createdAt)
            : "N/A"}
        </Text>
      </View>

      {/* Time Preference */}
      <View style={styles.metaRow}>
        <Ionicons
          name="time"
          size={14}
          color={isPermanent ? (isDark ? "#A5B4FC" : "#6366F1") : colors.iconBlack}
        />
        <Text style={[styles.metaText, isPermanent && styles.permanentMetaText]}>
          {isPermanent
            ? data.fromTime && data.toTime
              ? `Hours: ${data.fromTime} - ${data.toTime}`
              : reportingTime
              ? `Report by: ${reportingTime}`
              : formatTimePreference(timePreference)
            : formatTimePreference(timePreference)}
        </Text>
        {isFlexible && (
          <>
            <Text style={styles.separator}>|</Text>
            <Text style={styles.flexibleText}>Flexible</Text>
          </>
        )}
      </View>

      {/* Requirements */}
      {requirements && requirements.length > 0 && (
        <View style={styles.metaRow}>
          <Ionicons name="construct" size={14} color={colors.iconBlack} />
          <Text style={styles.metaText}>
            {formatRequirements(requirements)}
          </Text>
        </View>
      )}

      {/* Bottom Row */}
      <View style={styles.bottomRow1}>
        <View style={styles.avatars}>
          <Image
            source={{ uri: "https://i.pravatar.cc/20?img=1" }}
            style={styles.avatar}
          />
          <Image
            source={{ uri: "https://i.pravatar.cc/20?img=2" }}
            style={styles.avatar}
          />
          <Image
            source={{ uri: "https://i.pravatar.cc/20?img=3" }}
            style={styles.avatar}
          />
          <Text style={styles.requestText}>
            {applicantCount > 10
              ? "10+ Requests"
              : `${applicantCount || 0} Requests`}
          </Text>
        </View>
        {isWorkFinished ? (
          <View style={{ flexDirection: "row", gap: 6, alignItems: "center" }}>
            {isEmployer && onRepost && (
              <TouchableOpacity
                style={styles.smallRepostButton}
                onPress={() => onRepost(data)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="repeat"
                  size={14}
                  color={colors.white}
                />
                <Text style={styles.smallRepostButtonText}>Repost</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.primaryButton, styles.summaryButton]}
              onPress={() => onSummary && onSummary()}
            >
              <Ionicons
                name="document-text-outline"
                size={15}
                color={colors.white}
                style={{ marginRight: 4 }}
              />
              <Text style={styles.buttonText}>View Summary</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.bottomRow}>
            {/* Primary button */}
            <TouchableOpacity
              style={[
                styles.primaryButton,
                isPermanent && styles.permanentPrimaryButton,
              ]}
              onPress={() => onPress()}
            >
              {!isEmployer ? (
                // Workers always see View Details / Role Details
                <Text style={styles.buttonText}>
                  {isPermanent ? "View Role Details" : "View Details"}
                </Text>
              ) : isInProgress && !isPermanent ? (
                <Text style={styles.buttonText}>Start Timer</Text>
              ) : (
                <Text style={styles.buttonText}>
                  {isInProgress
                    ? "Manage Staff"
                    : isPermanent
                    ? "Review Candidates"
                    : "View Requests"}
                </Text>
              )}
            </TouchableOpacity>

            {/* Employer: show Repost button */}
            {isEmployer && onRepost && (
              <TouchableOpacity
                style={styles.smallRepostButton}
                onPress={() => onRepost(data)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="repeat"
                  size={14}
                  color={colors.white}
                />
                <Text style={styles.smallRepostButtonText}>
                  Repost
                </Text>
              </TouchableOpacity>
            )}

            {/* Secondary button */}
            {isEmployer ? (
              // Employer: show Delete button as compact icon button
              <TouchableOpacity
                style={styles.deleteIconButton}
                onPress={() => {
                  if (onDelete) onDelete();
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="trash-outline" size={15} color={colors.white} />
              </TouchableOpacity>
            ) : withdraw ? (
              // Worker + cutoff not passed: show Withdraw button
              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  {
                    backgroundColor: colors.red,
                  },
                ]}
                onPress={() => {
                  if (onWithdraw) onWithdraw();
                }}
              >
                <Text style={[styles.buttonText, { color: colors.white }]}>
                  Withdraw
                </Text>
              </TouchableOpacity>
            ) : null /* Worker + cutoff passed: no secondary button */}
          </View>
        )}
      </View>
    </View>
  );
};

const createStyles = (colors: ThemeColors, isDark: boolean) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.white,
      borderRadius: 16,
      padding: 14,
      shadowColor: "#000",
      shadowOpacity: isDark ? 0.3 : 0.06,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 2,
      marginVertical: 8,
      width: "100%",
    },
    permanentCard: {
      backgroundColor: isDark ? "#17192A" : "#FAFAFF",
      borderWidth: 1.5,
      borderColor: isDark ? "rgba(129, 140, 248, 0.4)" : "rgba(99, 102, 241, 0.28)",
      borderLeftWidth: 5,
      borderLeftColor: isDark ? "#818CF8" : "#6366F1",
      shadowColor: "#6366F1",
      shadowOpacity: isDark ? 0.35 : 0.12,
      shadowRadius: 10,
      elevation: 4,
    },
    permanentTopBanner: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 10,
      paddingBottom: 8,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(99, 102, 241, 0.12)",
    },
    permanentBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isDark ? "#6366F1" : "#4F46E5",
      paddingHorizontal: 8,
      paddingVertical: 3.5,
      borderRadius: 6,
      gap: 4,
    },
    permanentBadgeText: {
      color: "#FFFFFF",
      fontSize: 10,
      fontWeight: "800",
      letterSpacing: 0.5,
    },
    permanentTierBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isDark ? "rgba(129, 140, 248, 0.15)" : "rgba(99, 102, 241, 0.1)",
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
      gap: 4,
    },
    permanentTierText: {
      color: isDark ? "#A5B4FC" : "#4F46E5",
      fontSize: 10,
      fontWeight: "700",
    },
    permanentCategoryContainer: {
      backgroundColor: isDark ? "rgba(129, 140, 248, 0.18)" : "rgba(99, 102, 241, 0.1)",
      borderColor: isDark ? "rgba(129, 140, 248, 0.3)" : "rgba(99, 102, 241, 0.2)",
      borderWidth: 1,
    },
    permanentCategoryText: {
      color: isDark ? "#A5B4FC" : "#4F46E5",
      fontWeight: "700",
    },
    permanentSalaryCard: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: isDark ? "rgba(99, 102, 241, 0.12)" : "rgba(99, 102, 241, 0.07)",
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 10,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: isDark ? "rgba(129, 140, 248, 0.22)" : "rgba(99, 102, 241, 0.18)",
    },
    permanentSalaryLabel: {
      fontSize: 9,
      fontWeight: "800",
      letterSpacing: 0.6,
      color: isDark ? "#A5B4FC" : "#6366F1",
      marginBottom: 2,
    },
    permanentSalaryAmount: {
      fontSize: 16,
      fontWeight: "800",
      color: isDark ? "#FFFFFF" : "#1E1B4B",
    },
    permanentSalaryPeriod: {
      fontSize: 12,
      fontWeight: "600",
      color: isDark ? "#A5B4FC" : "#6366F1",
    },
    permanentApplicantsPill: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isDark ? "rgba(129, 140, 248, 0.18)" : "rgba(99, 102, 241, 0.12)",
      paddingHorizontal: 9,
      paddingVertical: 4,
      borderRadius: 8,
      gap: 5,
    },
    permanentApplicantsText: {
      fontSize: 11,
      fontWeight: "700",
      color: isDark ? "#E0E7FF" : "#3730A3",
    },
    permanentMetaText: {
      color: isDark ? "#CBD5E1" : "#475569",
    },
    permanentDateHighlight: {
      color: isDark ? "#818CF8" : "#4F46E5",
      fontWeight: "700",
    },
    permanentPrimaryButton: {
      backgroundColor: isDark ? "#6366F1" : "#4F46E5",
    },
    permanentEditButton: {
      backgroundColor: isDark ? "rgba(129, 140, 248, 0.2)" : "rgba(99, 102, 241, 0.15)",
      borderColor: isDark ? "rgba(129, 140, 248, 0.4)" : "rgba(99, 102, 241, 0.3)",
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 12,
    },
    categoryContainer: {
      backgroundColor: colors.blue + "20",
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
    },
    category: {
      fontSize: 10,
      fontWeight: "600",
      color: colors.blue,
    },
    statusTag: {
      backgroundColor: colors.whiteBack,
      paddingHorizontal: 19,
      paddingVertical: 4,
      borderRadius: 12,
    },
    statusText: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.black,
    },
    title: {
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 8,
      color: colors.black,
    },
    description: {
      fontSize: 14,
      color: colors.subGrey,
      marginBottom: 8,
      lineHeight: 20,
    },
    metaRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    price: {
      color: colors.blue,
      fontWeight: "600",
      fontSize: 14,
    },
    separator: {
      marginHorizontal: 8,
      color: colors.subGrey,
    },
    slots: {
      fontSize: 14,
      color: colors.subGrey,
    },
    metaText: {
      fontSize: 14,
      color: colors.subGrey,
      fontWeight: "400",
      marginLeft: 4,
    },
    metaLocation: {
      fontSize: 14,
      color: colors.subGrey,
      fontWeight: "400",
      marginLeft: 4,
      flex: 1,
    },
    flexibleText: {
      fontSize: 12,
      color: colors.blue,
      fontWeight: "500",
    },
    bottomRow: {
      flexDirection: "row",
      justifyContent: "flex-end",
      alignItems: "center",
      gap: 6,
      flexShrink: 1,
    },
    bottomRow1: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 12,
      gap: 6,
    },
    avatars: {
      flexDirection: "row",
      alignItems: "center",
      flexShrink: 0,
    },
    avatar: {
      width: 18,
      height: 18,
      borderRadius: 30,
      marginRight: -5,
    },
    requestText: {
      marginLeft: 8,
      fontSize: 12,
      color: colors.subGrey,
      fontWeight: "500",
    },
    button: {
      backgroundColor: colors.primary,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 9,
      alignItems: "center",
      justifyContent: "center",
      elevation: 2,
    },
    primaryButton: {
      backgroundColor: colors.primary,
      borderRadius: 10,
      paddingHorizontal: 11,
      paddingVertical: 9,
      alignItems: "center",
      justifyContent: "center",
      elevation: 2,
    },
    smallRepostButton: {
      backgroundColor: "#10B981",
      borderRadius: 10,
      paddingHorizontal: 9,
      paddingVertical: 9,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
      elevation: 2,
    },
    smallRepostButtonText: {
      fontSize: 12,
      fontWeight: "700",
      color: colors.white,
    },
    deleteIconButton: {
      width: 33,
      height: 33,
      borderRadius: 9,
      backgroundColor: colors.red,
      alignItems: "center",
      justifyContent: "center",
      elevation: 2,
    },
    topRightEditButton: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.primary + "18",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.primary + "35",
    },
    editIconButton: {
      width: 33,
      height: 33,
      borderRadius: 9,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      elevation: 2,
    },
    summaryButton: {
      flexDirection: "row",
      alignItems: "center",
    },
    buttonText: {
      fontSize: 12,
      fontWeight: "700",
      color: colors.white,
    },
    paymentButtonContent: {
      flexDirection: "row",
      alignItems: "center",
    },
  });

export default React.memo(JobCard);
