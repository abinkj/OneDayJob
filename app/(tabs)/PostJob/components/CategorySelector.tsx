import React, { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CategorySkeleton } from "../../../../components/Shimmer/Skeletons";
import { PermanentInfoModal } from "../../../../components/PermanentInfoModal";
import { defaultPermanentCategories } from "../../../../constants/JobConstants";
import { useTheme } from "../../../../contexts/ThemeContext";

interface Category {
  id: string;
  name: string;
  icon: any;
}

interface CategorySelectorProps {
  categories: Category[];
  permanentCategories?: Category[];
  selectedCategory: string | null;
  selectedJobType?: "one_day" | "permanent";
  isEditMode?: boolean;
  onSelectJobType?: (type: "one_day" | "permanent") => void;
  onSelect: (categoryId: string, categoryName: string, jobType?: "one_day" | "permanent") => void;
  styles: any;
  loading?: boolean;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  categories,
  permanentCategories = defaultPermanentCategories,
  selectedCategory,
  selectedJobType = "one_day",
  isEditMode = false,
  onSelectJobType,
  onSelect,
  styles,
  loading = false,
}) => {
  const { colors, theme } = useTheme();
  const isDark = theme === "dark";
  const localStyles = useMemo(() => createLocalStyles(colors, isDark), [colors, isDark]);

  const [activeTab, setActiveTab] = useState<"one_day" | "permanent">(selectedJobType || "one_day");
  const [pendingPermanentCat, setPendingPermanentCat] = useState<{ id: string; name: string } | null>(null);
  const [showPermanentModal, setShowPermanentModal] = useState(false);

  React.useEffect(() => {
    if (selectedJobType) {
      setActiveTab(selectedJobType);
    }
  }, [selectedJobType]);

  if (loading) {
    return <CategorySkeleton />;
  }

  const handleTabChange = (tab: "one_day" | "permanent") => {
    if (isEditMode) return;
    setActiveTab(tab);
    if (onSelectJobType) {
      onSelectJobType(tab);
    }
  };

  const handlePermanentItemPress = (catId: string, catName: string) => {
    if (isEditMode) return;
    setPendingPermanentCat({ id: catId, name: catName });
    setShowPermanentModal(true);
  };

  const handleProceedPermanent = () => {
    if (isEditMode) return;
    if (pendingPermanentCat) {
      onSelect(pendingPermanentCat.id, pendingPermanentCat.name, "permanent");
    }
    setShowPermanentModal(false);
  };

  return (
    <View style={{ paddingBottom: 20 }}>
      {/* Edit Mode Category Lock Banner */}
      {isEditMode && (
        <View style={localStyles.lockedBanner}>
          <View style={localStyles.lockIconCircle}>
            <Ionicons name="lock-closed" size={15} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={localStyles.lockedBannerTitle}>Category & Type Locked</Text>
            <Text style={localStyles.lockedBannerSubtitle}>
              Job type ({activeTab === "permanent" ? "Permanent" : "One-Day"}) and category cannot be changed for an existing job. Tap Next to edit title, description, dates, budget and other details.
            </Text>
          </View>
        </View>
      )}

      {/* Segmented Job Type Selector Tabs */}
      <View style={localStyles.tabContainer}>
        <TouchableOpacity
          style={[
            localStyles.tabButton,
            activeTab === "one_day" && localStyles.activeTabButton,
            isEditMode && activeTab !== "one_day" && { opacity: 0.4 },
          ]}
          onPress={() => handleTabChange("one_day")}
          disabled={isEditMode}
          activeOpacity={0.8}
        >
          <Ionicons
            name="flash"
            size={16}
            color={activeTab === "one_day" ? "#FFFFFF" : "#64748B"}
          />
          <Text
            style={[
              localStyles.tabButtonText,
              activeTab === "one_day" && localStyles.activeTabText,
            ]}
          >
            One-Day Jobs
          </Text>
          {isEditMode && activeTab === "one_day" && (
            <Ionicons name="lock-closed" size={12} color="#FFFFFF" style={{ marginLeft: 2 }} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            localStyles.tabButton,
            activeTab === "permanent" && localStyles.activePermanentTabButton,
            isEditMode && activeTab !== "permanent" && { opacity: 0.4 },
          ]}
          onPress={() => handleTabChange("permanent")}
          disabled={isEditMode}
          activeOpacity={0.8}
        >
          <Ionicons
            name="briefcase"
            size={16}
            color={activeTab === "permanent" ? "#FFFFFF" : "#64748B"}
          />
          <Text
            style={[
              localStyles.tabButtonText,
              activeTab === "permanent" && localStyles.activePermanentTabText,
            ]}
          >
            Permanent Staff ✨
          </Text>
          {isEditMode && activeTab === "permanent" && (
            <Ionicons name="lock-closed" size={12} color="#FFFFFF" style={{ marginLeft: 2 }} />
          )}
        </TouchableOpacity>
      </View>

      {/* Section Header */}
      <View style={localStyles.headerRow}>
        <Text style={styles.sectionTitle}>
          {activeTab === "permanent"
            ? "Permanent Roles (Monthly Retainer)"
            : "Select Job Category"}
        </Text>
      </View>

      {/* Permanent Information Callout Banner */}
      {activeTab === "permanent" && (
        <View style={localStyles.bannerBox}>
          <View style={localStyles.bannerIcon}>
            <Ionicons name="sparkles" size={18} color="#6366F1" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={localStyles.bannerTitle}>Managed Placement by Zoopol Desk</Text>
            <Text style={localStyles.bannerSubtitle}>
              Monthly verified staff • Free early-supporter placement • 7-Day trial guarantee
            </Text>
          </View>
        </View>
      )}

      {/* Category Grid */}
      <View style={styles.categoryContainer}>
        {(activeTab === "permanent" ? permanentCategories : categories)
          .filter((c) => c.id !== "custom")
          .map((category) => {
            const isSelected = selectedCategory === category.id;
            return (
              <View
                style={[
                  styles.CategoryView,
                  localStyles.categoryCardWrapper,
                ]}
                key={category.id}
              >
                <TouchableOpacity
                  style={[
                    styles.categoryItem,
                    isSelected && styles.selectedCategory,
                    activeTab === "permanent" && localStyles.permanentCategoryBorder,
                    isEditMode && !isSelected && { opacity: 0.35 },
                  ]}
                  disabled={isEditMode}
                  onPress={() => {
                    if (isEditMode) return;
                    if (activeTab === "permanent") {
                      handlePermanentItemPress(category.id, category.name);
                    } else {
                      onSelect(category.id, category.name, "one_day");
                    }
                  }}
                >
                  <Image
                    source={category.icon}
                    style={[styles.categoryIcon, isEditMode && !isSelected && { opacity: 0.4 }]}
                    resizeMode="contain"
                  />
                  {isEditMode && isSelected && (
                    <View style={localStyles.selectedLockedBadge}>
                      <Ionicons name="lock-closed" size={10} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>
                <Text
                  style={[
                    styles.categoryName,
                    localStyles.categoryLabelText,
                    isEditMode && !isSelected && { opacity: 0.45 },
                  ]}
                  numberOfLines={2}
                >
                  {category.name}
                </Text>
              </View>
            );
          })}
      </View>

      {/* Custom Category Card for both One-Day and Permanent */}
      {(() => {
        const customCat = categories.find((c) => c.id === "custom") || {
          id: "custom",
          name: "Custom",
          icon: require("../../../../assets/images/custom.png"),
        };
        const isCustomSelected =
          selectedCategory === "custom" &&
          (activeTab === selectedJobType || !selectedJobType);

        return (
          <View style={styles.customCategoryContainer}>
            <TouchableOpacity
              style={[
                styles.customCategoryCard,
                activeTab === "permanent" && localStyles.customPermanentCard,
                isCustomSelected &&
                  (activeTab === "permanent"
                    ? localStyles.customPermanentCardSelected
                    : styles.customCategoryCardSelected),
                isEditMode && !isCustomSelected && { opacity: 0.35 },
              ]}
              disabled={isEditMode}
              onPress={() => {
                if (isEditMode) return;
                if (activeTab === "permanent") {
                  handlePermanentItemPress("custom", "Custom Staff Role");
                } else {
                  onSelect("custom", "Custom", "one_day");
                }
              }}
              activeOpacity={0.75}
            >
              <View
                style={[
                  styles.customCategoryIconContainer,
                  activeTab === "permanent" && {
                    backgroundColor: isDark
                      ? "rgba(99, 102, 241, 0.2)"
                      : "#EEF2FF",
                  },
                ]}
              >
                <Image
                  source={customCat.icon}
                  style={styles.customCategoryIcon}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.customCategoryContent}>
                <Text style={styles.customCategoryTitle}>
                  {activeTab === "permanent"
                    ? "Other / Custom Permanent Role"
                    : "Other / Custom Job"}
                </Text>
                <Text style={styles.customCategorySubtitle}>
                  {activeTab === "permanent"
                    ? "Don't see your role? Create a custom permanent monthly position."
                    : "Don't see your category? Create a custom job posting."}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        );
      })()}

      {/* Permanent Job Explainer Modal */}
      <PermanentInfoModal
        visible={showPermanentModal}
        categoryName={pendingPermanentCat?.name}
        onProceed={handleProceedPermanent}
        onClose={() => setShowPermanentModal(false)}
      />
    </View>
  );
};

const createLocalStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    tabContainer: {
      flexDirection: "row",
      backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "#F1F5F9",
      borderRadius: 14,
      padding: 4,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: isDark ? "rgba(255,255,255,0.1)" : "#E2E8F0",
    },
    tabButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      paddingVertical: 10,
      borderRadius: 10,
    },
    activeTabButton: {
      backgroundColor: isDark ? colors.primary : "#0F172A",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 3,
    },
    activePermanentTabButton: {
      backgroundColor: "#6366F1",
      shadowColor: "#6366F1",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 3,
    },
    tabButtonText: {
      fontSize: 13,
      fontWeight: "600",
      color: isDark ? "#94A3B8" : "#64748B",
    },
    activeTabText: {
      color: "#FFFFFF",
      fontWeight: "700",
    },
    activePermanentTabText: {
      color: "#FFFFFF",
      fontWeight: "700",
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 6,
    },
    bannerBox: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isDark
        ? "rgba(99, 102, 241, 0.15)"
        : "rgba(99, 102, 241, 0.08)",
      borderRadius: 12,
      padding: 10,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: isDark
        ? "rgba(99, 102, 241, 0.35)"
        : "rgba(99, 102, 241, 0.2)",
    },
    bannerIcon: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: isDark ? "rgba(99, 102, 241, 0.3)" : "#EEF2FF",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 10,
    },
    bannerTitle: {
      fontSize: 12,
      fontWeight: "700",
      color: isDark ? "#A5B4FC" : "#4338CA",
      marginBottom: 1,
    },
    bannerSubtitle: {
      fontSize: 11,
      color: isDark ? "#CBD5E1" : "#6366F1",
      lineHeight: 14,
    },
    permanentCategoryBorder: {
      borderColor: "rgba(99, 102, 241, 0.35)",
    },
    categoryCardWrapper: {
      height: undefined,
      aspectRatio: undefined,
      minHeight: 112,
      marginBottom: 18,
      width: "30%",
      alignItems: "center",
      justifyContent: "flex-start",
    },
    categoryLabelText: {
      fontSize: 12,
      lineHeight: 15,
      textAlign: "center",
      marginTop: 4,
      paddingHorizontal: 2,
      width: "100%",
      color: isDark ? "#E2E8F0" : colors.black,
    },
    customPermanentCard: {
      borderColor: "#6366F1",
      borderStyle: "dashed",
    },
    customPermanentCardSelected: {
      backgroundColor: isDark ? "rgba(99, 102, 241, 0.2)" : "#EEF2FF",
      borderStyle: "solid",
      borderWidth: 2,
      borderColor: "#6366F1",
    },
    lockedBanner: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isDark ? "rgba(245, 158, 11, 0.15)" : "#FEF3C7",
      borderRadius: 12,
      padding: 12,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: isDark ? "rgba(245, 158, 11, 0.35)" : "#FDE68A",
      gap: 10,
    },
    lockIconCircle: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: "#D97706",
      alignItems: "center",
      justifyContent: "center",
    },
    lockedBannerTitle: {
      fontSize: 12,
      fontWeight: "700",
      color: isDark ? "#FBBF24" : "#92400E",
      marginBottom: 2,
    },
    lockedBannerSubtitle: {
      fontSize: 11,
      color: isDark ? "#FDE68A" : "#B45309",
      lineHeight: 15,
    },
    selectedLockedBadge: {
      position: "absolute",
      top: -3,
      right: -3,
      width: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: "#D97706",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1.5,
      borderColor: "#FFFFFF",
    },
  });

export default React.memo(CategorySelector);
