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
} from "../../utilities/jobUtils";

const JobCard = ({
  data,
  onPress,
  onWithdraw,
  onDelete,
  onPayment,
  onSummary,
  onRepost,
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
  withdraw?: boolean;
  isEmployer?: boolean;
  applicationStatus?: string;
  showPaymentButton?: boolean;
}) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

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
  } = data || {};

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
    ? `${location.address}${location.city ? ", " + location.city : ""}${
        location.state ? ", " + location.state : ""
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
    <View style={styles.card}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.categoryContainer}>
          <Text style={styles.category}>
            {category?.name?.toUpperCase() || "GENERAL"}
          </Text>
        </View>

        <StatusBadge statusInfo={statusInfo} size="medium" showIcon={true} />
      </View>

      {/* Job Title */}
      <Text style={styles.title}>{name || "Untitled Job"}</Text>

      {/* Description */}
      {description && (
        <Text style={styles.description} numberOfLines={2}>
          {description}
        </Text>
      )}

      {/* Price & Applicants */}
      <View style={styles.metaRow}>
        <Text style={styles.price}>
          ₹{budget ? budget.toLocaleString() : "0"}
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

      {/* Location & Date */}
      <View style={styles.metaRow}>
        <Ionicons
          name={isRemote ? "laptop" : "location"}
          size={14}
          color={colors.iconBlack}
        />
        <Text style={styles.metaLocation}>
          {isRemote ? "Remote Work" : formattedLocation}
        </Text>
        <Ionicons
          name="calendar"
          size={14}
          color={colors.iconBlack}
          style={{ marginLeft: 14 }}
        />
        <Text style={styles.metaText}>
          {onDate
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
        <Ionicons name="time" size={14} color={colors.iconBlack} />
        <Text style={styles.metaText}>
          {formatTimePreference(timePreference)}
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
            <TouchableOpacity style={styles.primaryButton} onPress={() => onPress()}>
              {!isEmployer ? (
                // Workers always see "View Details" regardless of withdraw state
                <Text style={styles.buttonText}>View Details</Text>
              ) : isInProgress ? (
                <Text style={styles.buttonText}>Start Timer</Text>
              ) : (
                <Text style={styles.buttonText}>View Requests</Text>
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

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.white,
      borderRadius: 16,
      padding: 12,
      shadowColor: "#000",
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
      marginVertical: 8,
      width: "100%",
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
