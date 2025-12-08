import { StyleSheet } from "react-native";
import DeviceDimensions from "../../../constants/DeviceDimenions";
import { Colors } from "../../../constants/Colors";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
  },
  locationSelector: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationTitle: {
    fontSize: 16,
    fontFamily: "bold",
    color: Colors.black,
    marginRight: 4 * DeviceDimensions.widthRatio,
  },
  locationSubtitle: {
    fontSize: 12,
    fontFamily: "regular",
    color: Colors.grey,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8E8E8",
    borderRadius: 12,
    width: 361 * DeviceDimensions.widthRatio,
    height: 50 * DeviceDimensions.heightRatio,
    marginTop: 16 * DeviceDimensions.heightRatio,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8 * DeviceDimensions.widthRatio,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "regular",
    color: Colors.black,
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
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  bannerTitle: {
    fontSize: 18,
    fontFamily: "bold",
    color: Colors.white,
  },
  bannerSubtitle: {
    fontSize: 14,
    fontFamily: "regular",
    color: Colors.white,
    marginTop: 4 * DeviceDimensions.heightRatio,
  },
  postNowButton: {
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    alignSelf: "flex-start",
    marginTop: 16 * DeviceDimensions.heightRatio,
    height: 28 * DeviceDimensions.heightRatio,
    width: 71 * DeviceDimensions.widthRatio,
  },
  postNowText: {
    color: Colors.blue,
    fontSize: 11,
    fontFamily: "medium",
  },
  bannerImage: {
    flex: 2,
    height: "100%",
  },
  filtersScrollContainer: {
    backgroundColor: Colors.background,
    paddingVertical: 8,
  },
  stickyFilterContainer: {
    backgroundColor: Colors.background,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grey + "20",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  filtersContainer: {
    alignItems: "center",
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.black,
    paddingHorizontal: 12 * DeviceDimensions.widthRatio,
    paddingVertical: 8 * DeviceDimensions.heightRatio,
    marginRight: 12 * DeviceDimensions.widthRatio,
  },
  filterText: {
    fontSize: 14,
    fontFamily: "regular",
    color: Colors.black,
    marginRight: 4 * DeviceDimensions.widthRatio,
  },
  jobCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16 * DeviceDimensions.widthRatio,
    marginBottom: 16 * DeviceDimensions.heightRatio,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    width: 361 * DeviceDimensions.widthRatio,
  },
  jobCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12 * DeviceDimensions.heightRatio,
  },
  categoryContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    width: 24 * DeviceDimensions.widthRatio,
    height: 24 * DeviceDimensions.widthRatio,
    borderRadius: 1234,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8 * DeviceDimensions.widthRatio,
  },
  avatarText: {
    color: Colors.white,
    fontSize: 14,
    fontFamily: "bold",
  },
  categoryText: {
    fontSize: 12,
    fontFamily: "regular",
    color: Colors.grey,
  },
  priceText: {
    fontSize: 16,
    fontFamily: "bold",
    color: Colors.black,
  },
  jobTitle: {
    fontSize: 16,
    fontFamily: "medium",
    color: Colors.black,
    marginBottom: 12 * DeviceDimensions.heightRatio,
    flex: 1,              // take remaining space
    marginRight: 8,
  },
  jobDetailsContainer: {
    flexDirection: "row",
    marginBottom: 16 * DeviceDimensions.heightRatio,
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
    marginRight: 16 * DeviceDimensions.widthRatio,
  },
  locationText: {
    fontSize: 14,
    fontFamily: "regular",
    color: Colors.grey,
    marginLeft: 4 * DeviceDimensions.widthRatio,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateText: {
    fontSize: 14,
    fontFamily: "regular",
    color: Colors.grey,
    marginLeft: 4 * DeviceDimensions.widthRatio,
  },
  jobFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  vacanciesContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  vacanciesText: {
    fontSize: 12,
    fontFamily: "regular",
    color: Colors.grey,
  },
  timeAgoText: {
    fontSize: 12,
    fontFamily: "regular",
    color: Colors.grey,
  },
  statusContainer: {
    backgroundColor: Colors.tabGrey,
    paddingHorizontal: 12 * DeviceDimensions.widthRatio,
    height: 22,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  statusText: {
    fontSize: 12,
    fontFamily: "medium",
    color: Colors.black,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.background, // or your background color
  },

  sectionHeaderText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.primary,
    marginRight: 12,
  },

  sectionHeaderLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.grey + "30", // 30% opacity
  },

  // Distance Text Style (add to job card)
  distanceText: {
    fontSize: 12,
    color: Colors.grey,
    marginTop: 2,
    fontWeight: "500",
  },


  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.addressGrey,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.black,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.addressGrey,
  },
  selectedOption: {
    backgroundColor: Colors.addressGrey,
  },
  modalOptionText: {
    fontSize: 16,
    color: Colors.black,
  },
  selectedOptionText: {
    color: Colors.primary,
    fontWeight: '500',
  },

  // Active filters styles
  activeFiltersContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.addressGrey,
    marginHorizontal: 16,
    borderRadius: 8,
    marginVertical: 8,
  },
  activeFiltersTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.black,
    marginBottom: 8,
  },
  activeFiltersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  activeFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.primary,
    marginBottom: 4,
  },
  activeFilterText: {
    fontSize: 12,
    color: Colors.primary,
    marginRight: 4,
  },

  // Results and pagination styles
  resultsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  resultsText: {
    fontSize: 14,
    color: Colors.grey,
    fontWeight: '500',
  },
  loadMoreContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadMoreButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  loadMoreText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  endOfResultsContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  endOfResultsText: {
    fontSize: 14,
    color: Colors.grey,
    fontStyle: 'italic',
  },

});


export default styles;