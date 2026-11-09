import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../contexts/ThemeContext";
import { ThemeColors } from "../../constants/Colors";
import { createJobPosting } from "../../services/api";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import Toast from "react-native-toast-message";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useQueryClient } from "@tanstack/react-query";
import {
  extractCoordinates,
  normalizeLocationCoordinates,
} from "../../utilities/jobUtils";

export interface RepostJobModalProps {
  visible: boolean;
  job: any | null;
  onClose: () => void;
  onSuccess?: (repostedJob: any) => void;
  onEditFullDetails: (jobData: any) => void;
}

export const RepostJobModal: React.FC<RepostJobModalProps> = ({
  visible,
  job,
  onClose,
  onSuccess,
  onEditFullDetails,
}) => {
  const { colors, theme } = useTheme();
  const isDark = theme === "dark";
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const user = useSelector((state: RootState) => state.authentication.userData);
  const queryClient = useQueryClient();

  // Date presets
  const today = useMemo(() => new Date(), []);
  const tomorrow = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d;
  }, []);
  const dayAfter = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d;
  }, []);

  const [selectedDate, setSelectedDate] = useState<Date>(tomorrow);
  const [dateChoice, setDateChoice] = useState<
    "today" | "tomorrow" | "dayAfter" | "custom"
  >("tomorrow");
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Time preference
  const [timePref, setTimePref] = useState<string>("morning");

  // Budget
  const [budget, setBudget] = useState<number>(300);

  // Loading state
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (job) {
      setBudget(Number(job.budget) || 300);
      setSelectedDate(tomorrow);
      setDateChoice("tomorrow");
      if (Array.isArray(job.timePreference) && job.timePreference.length > 0) {
        setTimePref(job.timePreference[0]);
      } else {
        setTimePref("morning");
      }
    }
  }, [job, tomorrow]);

  const handleDateSelect = (
    choice: "today" | "tomorrow" | "dayAfter" | "custom"
  ) => {
    setDateChoice(choice);
    if (choice === "today") setSelectedDate(today);
    else if (choice === "tomorrow") setSelectedDate(tomorrow);
    else if (choice === "dayAfter") setSelectedDate(dayAfter);
    else if (choice === "custom") setShowDatePicker(true);
  };

  const handleCustomDateChange = (_: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
      setDateChoice("custom");
    }
  };

  const incrementBudget = () => {
    setBudget((prev) => prev + 50);
  };

  const decrementBudget = () => {
    setBudget((prev) => Math.max(50, prev - 50));
  };

  const formatDateLabel = (d: Date) => {
    return d.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  const formatFullDate = (d: Date) => {
    return d.toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Prepare full job object with updated date, budget & normalized coordinates
  const prepareJobDataForFullEdit = () => {
    if (!job) return null;
    const coords = extractCoordinates(job.location) || extractCoordinates(job);
    return {
      ...job,
      budget,
      onDate: selectedDate.toISOString(),
      timePreference: timePref !== "flexible" ? [timePref] : [],
      location: {
        address:
          job.location?.address ||
          job.taskAddress ||
          job.address ||
          "Selected Location",
        city: job.location?.city || "",
        state: job.location?.state || "",
        country: job.location?.country || "",
        zipCode: job.location?.zipCode || "",
        coordinates: coords || { latitude: 0, longitude: 0 },
      },
      taskAddress:
        job.location?.address || job.taskAddress || job.address || "",
    };
  };

  const handleEditFullDetailsPress = () => {
    const prepared = prepareJobDataForFullEdit();
    onClose();
    if (prepared) {
      onEditFullDetails(prepared);
    }
  };

  const handleConfirmRepost = async () => {
    if (!job) return;
    const userId = user?.id || user?._id;
    if (!userId) {
      Toast.show({
        type: "error",
        text1: "Authentication Error",
        text2: "Please log in to repost this job",
      });
      return;
    }

    const categoryId =
      typeof job.category === "object"
        ? job.category?._id || job.category?.id
        : job.category;

    if (!categoryId) {
      Toast.show({
        type: "error",
        text1: "Category Error",
        text2: "Unable to find job category. Tap 'Need to change location or details?'.",
      });
      return;
    }

    // Safely extract location coordinates
    const coords = extractCoordinates(job.location) || extractCoordinates(job);
    if (!coords || isNaN(coords.latitude) || isNaN(coords.longitude)) {
      Toast.show({
        type: "error",
        text1: "Location Coordinates Missing",
        text2: "Tap 'Need to change location or details?' to select a location.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const day = String(selectedDate.getDate()).padStart(2, "0");
      const isoDate = `${year}-${month}-${day}T09:00:00.000Z`;

      const payload: any = {
        userId,
        category: categoryId,
        name: job.name,
        description: job.description || "",
        isMultiVacancy: Boolean(job.isMultiVacancy),
        participantsNumber: Number(job.participantsNumber) || 1,
        isRemote: Boolean(job.isRemote),
        requirements: Array.isArray(job.requirements) ? job.requirements : [],
        photos: Array.isArray(job.photos) ? job.photos : [],
        onDate: isoDate,
        isFlexible: timePref === "flexible",
        timePreference: timePref !== "flexible" ? [timePref] : [],
        budget: Number(budget),
        isOpen: true,
        location: {
          address:
            job.location?.address ||
            job.taskAddress ||
            job.address ||
            "Selected Location",
          city: job.location?.city || "",
          state: job.location?.state || "",
          country: job.location?.country || "",
          zipCode: job.location?.zipCode || "",
          coordinates: {
            latitude: Number(coords.latitude),
            longitude: Number(coords.longitude),
          },
        },
        taskAddress:
          job.location?.address || job.taskAddress || job.address || "",
      };

      console.log("[RepostJobModal] Submitting payload:", JSON.stringify(payload, null, 2));
      const res = await createJobPosting(payload);

      // Invalidate queries so lists update immediately
      queryClient.invalidateQueries({ queryKey: ["myJobPostings"] });
      queryClient.invalidateQueries({ queryKey: ["jobPostings"] });

      Toast.show({
        type: "success",
        text1: "Job Reposted Successfully! 🎉",
        text2: "Your job has been published with the new date.",
      });

      onClose();
      if (onSuccess) {
        onSuccess(res.data);
      }
    } catch (err: any) {
      console.error("[RepostJobModal] Repost error:", err);
      const errMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to repost job. Try 'Edit Full Details'.";
      Toast.show({
        type: "error",
        text1: "Repost Failed",
        text2: errMsg,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!visible || !job) return null;

  const jobAddress =
    job.location?.address ||
    job.taskAddress ||
    job.location?.city ||
    "Address on file";

  const categoryName =
    typeof job.category === "object"
      ? job.category?.name
      : job.category || "General";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={styles.headerIconBadge}>
                <Ionicons name="repeat" size={18} color="#10B981" />
              </View>
              <Text style={styles.headerTitle}>Repost This Job</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons name="close" size={22} color={colors.grey} />
            </TouchableOpacity>
          </View>

          {/* Scrollable Content */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Job Summary Card */}
            <View style={styles.jobSummaryCard}>
              <View style={styles.categoryPill}>
                <Text style={styles.categoryPillText}>
                  {categoryName.toUpperCase()}
                </Text>
              </View>
              <Text style={styles.jobTitle} numberOfLines={2}>
                {job.name}
              </Text>
              <View style={styles.jobAddressRow}>
                <Ionicons
                  name="location-sharp"
                  size={15}
                  color={colors.primary}
                />
                <Text style={styles.jobAddressText} numberOfLines={1}>
                  {jobAddress}
                </Text>
              </View>
            </View>

            {/* Date Selection Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                📅 When do you need this done?
              </Text>

              {/* Row 1 */}
              <View style={styles.gridRow}>
                <TouchableOpacity
                  style={[
                    styles.chip,
                    dateChoice === "today" && styles.chipActive,
                  ]}
                  onPress={() => handleDateSelect("today")}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.chipTitle,
                      dateChoice === "today" && styles.chipTitleActive,
                    ]}
                  >
                    Today
                  </Text>
                  <Text
                    style={[
                      styles.chipSub,
                      dateChoice === "today" && styles.chipSubActive,
                    ]}
                  >
                    {formatDateLabel(today)}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.chip,
                    dateChoice === "tomorrow" && styles.chipActive,
                  ]}
                  onPress={() => handleDateSelect("tomorrow")}
                  activeOpacity={0.8}
                >
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularBadgeText}>Popular</Text>
                  </View>
                  <Text
                    style={[
                      styles.chipTitle,
                      dateChoice === "tomorrow" && styles.chipTitleActive,
                    ]}
                  >
                    Tomorrow
                  </Text>
                  <Text
                    style={[
                      styles.chipSub,
                      dateChoice === "tomorrow" && styles.chipSubActive,
                    ]}
                  >
                    {formatDateLabel(tomorrow)}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Row 2 */}
              <View style={styles.gridRow}>
                <TouchableOpacity
                  style={[
                    styles.chip,
                    dateChoice === "dayAfter" && styles.chipActive,
                  ]}
                  onPress={() => handleDateSelect("dayAfter")}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.chipTitle,
                      dateChoice === "dayAfter" && styles.chipTitleActive,
                    ]}
                  >
                    Day After
                  </Text>
                  <Text
                    style={[
                      styles.chipSub,
                      dateChoice === "dayAfter" && styles.chipSubActive,
                    ]}
                  >
                    {formatDateLabel(dayAfter)}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.chip,
                    dateChoice === "custom" && styles.chipActive,
                  ]}
                  onPress={() => handleDateSelect("custom")}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="calendar-outline"
                    size={16}
                    color={
                      dateChoice === "custom" ? colors.primary : colors.black
                    }
                  />
                  <Text
                    style={[
                      styles.chipTitle,
                      dateChoice === "custom" && styles.chipTitleActive,
                    ]}
                  >
                    {dateChoice === "custom"
                      ? formatDateLabel(selectedDate)
                      : "Pick Date"}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Selected Date Confirmation Banner */}
              <View style={styles.selectedDateBanner}>
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color={colors.primary}
                />
                <Text style={styles.selectedDateBannerText}>
                  Scheduled for:{" "}
                  <Text style={{ fontWeight: "800" }}>
                    {formatFullDate(selectedDate)}
                  </Text>
                </Text>
              </View>
            </View>

            {/* Time of Day Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>⏰ Preferred Time of Day</Text>

              {/* Row 1 */}
              <View style={styles.gridRow}>
                <TouchableOpacity
                  style={[
                    styles.chip,
                    timePref === "morning" && styles.chipActive,
                  ]}
                  onPress={() => setTimePref("morning")}
                  activeOpacity={0.8}
                >
                  <Text style={styles.timeIcon}>☀️</Text>
                  <Text
                    style={[
                      styles.chipTitle,
                      timePref === "morning" && styles.chipTitleActive,
                    ]}
                  >
                    Morning
                  </Text>
                  <Text style={styles.chipSub}>8 AM - 12 PM</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.chip,
                    timePref === "afternoon" && styles.chipActive,
                  ]}
                  onPress={() => setTimePref("afternoon")}
                  activeOpacity={0.8}
                >
                  <Text style={styles.timeIcon}>⛅</Text>
                  <Text
                    style={[
                      styles.chipTitle,
                      timePref === "afternoon" && styles.chipTitleActive,
                    ]}
                  >
                    Afternoon
                  </Text>
                  <Text style={styles.chipSub}>12 PM - 5 PM</Text>
                </TouchableOpacity>
              </View>

              {/* Row 2 */}
              <View style={styles.gridRow}>
                <TouchableOpacity
                  style={[
                    styles.chip,
                    timePref === "evening" && styles.chipActive,
                  ]}
                  onPress={() => setTimePref("evening")}
                  activeOpacity={0.8}
                >
                  <Text style={styles.timeIcon}>🌙</Text>
                  <Text
                    style={[
                      styles.chipTitle,
                      timePref === "evening" && styles.chipTitleActive,
                    ]}
                  >
                    Evening
                  </Text>
                  <Text style={styles.chipSub}>5 PM - 9 PM</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.chip,
                    timePref === "flexible" && styles.chipActive,
                  ]}
                  onPress={() => setTimePref("flexible")}
                  activeOpacity={0.8}
                >
                  <Text style={styles.timeIcon}>⚡</Text>
                  <Text
                    style={[
                      styles.chipTitle,
                      timePref === "flexible" && styles.chipTitleActive,
                    ]}
                  >
                    Flexible
                  </Text>
                  <Text style={styles.chipSub}>Any time</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Budget Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>💰 Budget</Text>
              <View style={styles.budgetContainer}>
                <TouchableOpacity
                  style={styles.budgetStepperBtn}
                  onPress={decrementBudget}
                  activeOpacity={0.7}
                >
                  <Ionicons name="remove" size={24} color={colors.primary} />
                </TouchableOpacity>

                <View style={styles.budgetDisplay}>
                  <Text style={styles.currencySymbol}>₹</Text>
                  <Text style={styles.budgetAmount}>{budget}</Text>
                </View>

                <TouchableOpacity
                  style={styles.budgetStepperBtn}
                  onPress={incrementBudget}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add" size={24} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* "Edit Additional Details" Card / Action */}
            <TouchableOpacity
              style={styles.editFullDetailsCard}
              onPress={handleEditFullDetailsPress}
              activeOpacity={0.7}
            >
              <View style={styles.editFullIconCircle}>
                <Ionicons name="create-outline" size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.editFullTitle}>
                  Need to change location or details?
                </Text>
                <Text style={styles.editFullSubtitle}>
                  Edit title, description, address or requirements in full flow
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={colors.primary}
              />
            </TouchableOpacity>
          </ScrollView>

          {/* Fixed Footer CTA Button */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.confirmBtn,
                isSubmitting && styles.confirmBtnDisabled,
              ]}
              onPress={handleConfirmRepost}
              disabled={isSubmitting}
              activeOpacity={0.85}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Ionicons name="repeat" size={20} color="#fff" />
                  <Text style={styles.confirmBtnText}>
                    Confirm & Repost Job
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Date Picker Dialog */}
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === "ios" ? "inline" : "default"}
          minimumDate={new Date()}
          onChange={handleCustomDateChange}
        />
      )}
    </Modal>
  );
};

const createStyles = (colors: ThemeColors, isDark: boolean) =>
  StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.65)",
      justifyContent: "flex-end",
    },
    modalContainer: {
      backgroundColor: isDark ? colors.background : colors.white,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      maxHeight: "88%",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: -3 },
      shadowOpacity: 0.25,
      shadowRadius: 10,
      elevation: 10,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingTop: 18,
      paddingBottom: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    headerIconBadge: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: isDark ? colors.green : "#ECFDF5",
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "800",
      color: colors.black,
    },
    closeBtn: {
      padding: 4,
    },
    scrollContent: {
      paddingHorizontal: 18,
      paddingTop: 16,
      paddingBottom: 24,
    },

    // Job Brief Card
    jobSummaryCard: {
      backgroundColor: isDark ? colors.white : "#F8FAFC",
      borderRadius: 14,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 18,
      gap: 6,
    },
    categoryPill: {
      alignSelf: "flex-start",
      backgroundColor: isDark ? colors.categoryBox : "#EEF2FF",
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
    },
    categoryPillText: {
      fontSize: 10,
      fontWeight: "700",
      color: colors.primary,
    },
    jobTitle: {
      fontSize: 16,
      fontWeight: "800",
      color: colors.black,
    },
    jobAddressRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    jobAddressText: {
      fontSize: 13,
      color: colors.grey,
      flex: 1,
    },

    // Sections
    section: {
      marginBottom: 18,
    },
    sectionTitle: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.black,
      marginBottom: 10,
    },

    // Explicit 2-Column Row Grid (never overlaps!)
    gridRow: {
      flexDirection: "row",
      gap: 10,
      marginBottom: 10,
    },
    chip: {
      flex: 1,
      backgroundColor: colors.white,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 10,
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      minHeight: 58,
    },
    chipActive: {
      borderColor: colors.primary,
      backgroundColor: isDark ? colors.primary + "26" : colors.primary + "12",
    },
    popularBadge: {
      position: "absolute",
      top: -8,
      right: 8,
      backgroundColor: colors.primary,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    },
    popularBadgeText: {
      fontSize: 9,
      fontWeight: "700",
      color: "#fff",
    },
    chipTitle: {
      fontSize: 14,
      fontWeight: "700",
      color: colors.black,
      marginBottom: 2,
    },
    chipTitleActive: {
      color: colors.primary,
    },
    chipSub: {
      fontSize: 11,
      color: colors.grey,
    },
    chipSubActive: {
      color: colors.primary,
      fontWeight: "600",
    },
    timeIcon: {
      fontSize: 16,
      marginBottom: 2,
    },

    // Selected Date Banner
    selectedDateBanner: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: isDark ? colors.green : "#F0FDF4",
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      marginTop: 2,
      borderWidth: 1,
      borderColor: isDark ? colors.green : "#DCFCE7",
    },
    selectedDateBannerText: {
      fontSize: 13,
      color: isDark ? colors.darkGreen : "#166534",
    },

    // Budget Stepper
    budgetContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: isDark ? colors.white : "#F8FAFC",
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 14,
      paddingVertical: 10,
    },
    budgetStepperBtn: {
      width: 48,
      height: 48,
      borderRadius: 12,
      backgroundColor: isDark ? colors.categoryBox : colors.white,
      borderWidth: 1.5,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
      elevation: 1,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
    },
    budgetDisplay: {
      flexDirection: "row",
      alignItems: "baseline",
      gap: 4,
    },
    currencySymbol: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.primary,
    },
    budgetAmount: {
      fontSize: 28,
      fontWeight: "900",
      color: colors.black,
    },

    // Edit full details card
    editFullDetailsCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isDark ? colors.white : "#EEF2FF",
      borderRadius: 14,
      padding: 12,
      gap: 12,
      borderWidth: 1,
      borderColor: isDark ? colors.border : "#C7D2FE",
      marginTop: 4,
    },
    editFullIconCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: isDark ? colors.categoryBox : colors.white,
      alignItems: "center",
      justifyContent: "center",
    },
    editFullTitle: {
      fontSize: 13,
      fontWeight: "700",
      color: colors.primary,
    },
    editFullSubtitle: {
      fontSize: 11,
      color: colors.grey,
      marginTop: 1,
    },

    // Footer
    footer: {
      paddingHorizontal: 18,
      paddingVertical: 14,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: isDark ? colors.background : colors.white,
    },
    confirmBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#10B981",
      paddingVertical: 15,
      borderRadius: 14,
      gap: 8,
      shadowColor: "#10B981",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.25,
      shadowRadius: 5,
      elevation: 4,
    },
    confirmBtnDisabled: {
      opacity: 0.65,
    },
    confirmBtnText: {
      fontSize: 16,
      fontWeight: "800",
      color: "#fff",
    },
  });

export default RepostJobModal;
