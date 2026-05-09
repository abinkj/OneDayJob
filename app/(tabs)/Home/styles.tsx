import { StyleSheet } from "react-native";
import DeviceDimensions from "../../../constants/DeviceDimenions";
import { ThemeColors } from "../../../constants/Colors";

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 16,
    },
    scrollContainer: {
      flex: 1,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    locationHeader: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1, // Allow text to take available space
      marginRight: 16, // Space before notification icon
    },
    iconContainer: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.primary + "15", // 15% opacity primary color
      justifyContent: "center",
      alignItems: "center",
      marginRight: 10,
    },
    locationSelector: {
      flexDirection: "row",
      alignItems: "center",
    },
    locationTitleHeader: {
      fontSize: 16,
      fontFamily: "bold",
      color: colors.black,
      lineHeight: 20,
      flexShrink: 1, // Prevent overlapping with notification button
    },
    locationSubtitleHeader: {
      fontSize: 12,
      fontFamily: "medium",
      color: colors.grey,
      marginTop: 0,
      lineHeight: 16,
    },
    locationTextContainer: {
      flex: 1,
    },
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.whiteBack, // Changed from hardcoded #E8E8E8 to use theme color if available or keep hardcoded if not in theme
      borderRadius: 12,
      width: "100%",
      height: 50 * DeviceDimensions.heightRatio,
      marginTop: 16 * DeviceDimensions.heightRatio,
      paddingHorizontal: 12,
    },
    searchIcon: {
      marginRight: 10 * DeviceDimensions.widthRatio,
    },
    searchInput: {
      flex: 1,
      fontSize: 14,
      fontFamily: "regular",
      color: colors.black,
    },
    bannerContainer: {
      borderRadius: 16,
      marginTop: 8,
      marginBottom: 16 * DeviceDimensions.heightRatio,
      flexDirection: "row",
      height: 140.21 * DeviceDimensions.heightRatio,
      width: "100%",
    },
    banner: {
      width: "100%",
      height: "100%",
    },
    bannerTextContainer: {
      flex: 3,
      justifyContent: "center",
      paddingHorizontal: 16,
      paddingVertical: 16,
    },
    bannerTitle: {
      fontSize: 20,
      fontFamily: "bold",
      color: colors.white, // Keep as white for banner potentially
      textShadowColor: "rgba(0, 0, 0, 0.2)",
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    bannerSubtitle: {
      fontSize: 14,
      fontFamily: "regular",
      color: colors.white,
      marginTop: 4 * DeviceDimensions.heightRatio,
      opacity: 0.9,
    },
    postNowButton: {
      backgroundColor: colors.white,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 8,
      alignSelf: "flex-start",
      marginTop: 16 * DeviceDimensions.heightRatio,
      paddingHorizontal: 16,
      paddingVertical: 8,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    postNowText: {
      color: colors.primary,
      fontSize: 12,
      fontFamily: "bold",
    },
    bannerImage: {
      flex: 2,
      height: "100%",
    },
    filtersScrollContainer: {
      backgroundColor: colors.background,

      paddingBottom: 6,
    },
    stickyFilterContainer: {
      backgroundColor: colors.background,
      paddingVertical: 6,
      paddingHorizontal: 6,
      //borderBottomWidth: 1,
      //borderBottomColor: colors.grey + "10",
      // shadowColor: "#000",
      // shadowOffset: {
      //   width: 0,
      //   height: 2,
      // },
      // shadowOpacity: 0.05,
      // shadowRadius: 4,
      // elevation: 4,
    },
    filtersContainer: {
      alignItems: "center",
    },
    filterButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.white,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.switchBorder, // Changed from addressGrey
      paddingHorizontal: 14 * DeviceDimensions.widthRatio,
      paddingVertical: 8 * DeviceDimensions.heightRatio,
      marginRight: 10 * DeviceDimensions.widthRatio,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    filterText: {
      fontSize: 13,
      fontFamily: "medium",
      color: colors.black,
      marginRight: 4 * DeviceDimensions.widthRatio,
    },
    jobCard: {
      backgroundColor: colors.white,
      borderRadius: 16,
      padding: 16 * DeviceDimensions.widthRatio,
      marginBottom: 16 * DeviceDimensions.heightRatio,
      shadowColor: colors.primary,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
      width: "100%",
      borderLeftWidth: 5,
      borderLeftColor: colors.primary,
    },
    jobCardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 14 * DeviceDimensions.heightRatio,
    },
    categoryContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.categoryBox,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 12,
    },
    avatarContainer: {
      width: 20 * DeviceDimensions.widthRatio,
      height: 20 * DeviceDimensions.widthRatio,
      borderRadius: 10,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 6 * DeviceDimensions.widthRatio,
    },
    categoryText: {
      fontSize: 12,
      fontFamily: "bold",
      color: colors.primary,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    priceText: {
      fontSize: 18,
      fontFamily: "bold",
      color: colors.primary,
    },
    jobTitle: {
      fontSize: 17,
      fontFamily: "bold",
      color: colors.black,
      marginBottom: 12 * DeviceDimensions.heightRatio,
      flex: 1,
      marginRight: 8,
      lineHeight: 22,
    },
    jobDetailsContainer: {
      flexDirection: "row",
      marginBottom: 16 * DeviceDimensions.heightRatio,
      flexWrap: "wrap",
      gap: 12,
      alignItems: "center",
    },
    detailRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    distanceText: {
      fontSize: 12,
      fontFamily: "medium",
      color: colors.grey,
    },
    titleContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 12 * DeviceDimensions.heightRatio,
      width: "100%",
    },
    locationContainer: {
      flexDirection: "row",
      alignItems: "center",
      // REMOVED BACKGROUND COLOR: backgroundColor: colors.whiteBack,
      // paddingHorizontal: 10,
      // paddingVertical: 4,
      // borderRadius: 8,
    },
    locationText: {
      fontSize: 13,
      fontFamily: "medium",
      color: colors.grey,
      // marginLeft: 4 * DeviceDimensions.widthRatio,
    },
    jobFooter: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 4,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.borderGrey + "20", // Use borderGrey with opacity
    },
    vacanciesContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.background,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
      gap: 6,
    },
    vacanciesText: {
      fontSize: 12,
      fontFamily: "medium",
      color: colors.grey, // Changed to grey to be less distracting
    },
    timeAgoText: {
      fontSize: 12,
      fontFamily: "medium",
      color: colors.grey,
    },
    statusContainer: {
      backgroundColor: colors.tabGrey,
      paddingHorizontal: 12 * DeviceDimensions.widthRatio,
      height: 24,
      borderRadius: 20,
      justifyContent: "center",
      alignItems: "center",
    },
    statusText: {
      fontSize: 11,
      fontFamily: "bold",
      color: colors.black,
      textTransform: "uppercase",
    },

    // Distance Text Style (add to job card)
    // distanceText: {
    //   fontSize: 11,
    //   color: colors.grey,
    //   marginTop: 2,
    //   fontWeight: "600",
    //   textAlign: "right",
    // },

    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "flex-end",
    },
    modalContainer: {
      backgroundColor: colors.background,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      maxHeight: "75%",
      paddingTop: 24,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 10,
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 24,
      paddingBottom: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.addressGrey,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: colors.black,
    },
    modalOption: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 18,
      paddingHorizontal: 24,
      borderBottomWidth: 1,
      borderBottomColor: colors.addressGrey,
    },
    selectedOption: {
      backgroundColor: colors.categoryBox + "40", // 40% opacity
    },
    modalOptionText: {
      fontSize: 16,
      color: colors.black,
      fontWeight: "500",
    },
    selectedOptionText: {
      color: colors.primary,
      fontWeight: "bold",
    },

    // Active filters styles
    activeFiltersContainer: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      backgroundColor: colors.white,
      marginHorizontal: 16,
      borderRadius: 12,
      marginVertical: 8,
      borderWidth: 1,
      borderColor: colors.addressGrey,
    },
    activeFiltersTitle: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.primary,
      marginBottom: 8,
      textTransform: "uppercase",
    },
    activeFiltersRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    activeFilterChip: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.white,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.primary,
      marginBottom: 4,
    },
    activeFilterText: {
      fontSize: 12,
      color: colors.primary,
      marginRight: 4,
    },

    // Results and pagination styles
    resultsContainer: {
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    resultsText: {
      fontSize: 14,
      color: colors.grey,
      fontWeight: "500",
    },
    loadMoreContainer: {
      alignItems: "center",
      paddingVertical: 20,
    },
    loadMoreButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
    },
    loadMoreText: {
      color: "white",
      fontSize: 16,
      fontWeight: "500",
    },
    endOfResultsContainer: {
      alignItems: "center",
      paddingVertical: 16,
    },
    endOfResultsText: {
      fontSize: 14,
      color: colors.grey,
      fontStyle: "italic",
    },

    // Arrival Feature Styles
    priceContainer: {
      alignItems: "flex-end",
    },
    statusContainerInProgress: {
      backgroundColor: "#FF9800",
    },
    statusTextInProgress: {
      color: "#fff",
    },
    arrivalButtonContainer: {
      marginTop: 10,
    },
    arrivalButton: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    arrivalButtonIcon: {
      marginRight: 8,
    },
    arrivalButtonText: {
      color: "#fff",
      fontWeight: "700",
      fontSize: 14,
      letterSpacing: 0.3,
    },
    arrivalSuccessText: {
      fontSize: 11,
      color: "#10B981",
      marginTop: 4,
      textAlign: "center",
      fontWeight: "500",
    },
    locationInfoContainer: {
      marginTop: 6,
      paddingHorizontal: 4,
    },
    locationInfoRow: {
      flexDirection: "row",
      alignItems: "flex-start",
    },
    locationInfoIcon: {
      marginTop: 2,
    },
    currentLocationText: {
      fontSize: 11,
      color: colors.grey,
      marginLeft: 4,
      flex: 1,
      lineHeight: 15,
    },
    distanceFromSiteText: {
      fontSize: 10,
      color: colors.grey,
      marginLeft: 16,
      marginTop: 2,
    },

    // Empty/No Nearby State Styles
    emptyStateContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 32,
      minHeight: 400,
    },
    emptyStateIconWrapper: {
      width: 120,
      height: 120,
      borderRadius: 60,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 24,
      borderWidth: 1,
      elevation: 6,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
    },
    emptyStateTitle: {
      fontSize: 22,
      color: colors.black,
      fontWeight: "700",
      marginBottom: 10,
      textAlign: "center",
    },
    emptyStateSubtitle: {
      fontSize: 15,
      color: colors.grey,
      textAlign: "center",
      lineHeight: 22,
      marginBottom: 28,
    },
    locationHighlight: {
      fontWeight: "600",
      color: colors.black,
    },
    primaryButton: {
      paddingVertical: 14,
      paddingHorizontal: 28,
      backgroundColor: colors.primary,
      borderRadius: 12,
      marginBottom: 12,
      width: "100%",
      alignItems: "center",
      shadowColor: colors.primary,
      shadowOpacity: 0.3,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 4,
    },
    primaryButtonText: {
      color: "white",
      fontSize: 15,
      fontWeight: "700",
    },
    outlineButton: {
      paddingVertical: 12,
      paddingHorizontal: 28,
      borderRadius: 12,
      width: "100%",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.grey + "44",
    },
    outlineButtonText: {
      color: colors.grey,
      fontSize: 14,
      fontWeight: "600",
    },

    // Miscellaneous Styles
    stickyFilterAbsolute: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
    },
    flatListContent: {
      paddingBottom: 20,
    },
    notificationButton: {
      position: "relative",
      marginRight: 10,
    },
    locationChevron: {
      marginLeft: 4,
      marginTop: 2,
    },
    allJobsBanner: {
      marginHorizontal: 16,
      marginBottom: 8,
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderRadius: 10,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#FFF3E0",
      borderWidth: 1,
      borderColor: "#FF9800",
    },
    allJobsBannerIcon: {
      marginRight: 8,
    },
    allJobsBannerContent: {
      flex: 1,
    },
    allJobsBannerTitle: {
      fontSize: 13,
      color: "#B45309",
      fontWeight: "600",
    },
    allJobsBannerSubtitle: {
      fontSize: 12,
      color: "#B45309",
      marginTop: 1,
    },
    loadingIndicatorContainer: {
      padding: 10,
      alignItems: "center",
    },
    loadingText: {
      marginTop: 10,
      color: colors.grey,
    },
  });
