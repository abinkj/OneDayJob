import { StyleSheet } from "react-native";
import DeviceDimensions from "../../../constants/DeviceDimenions";
import { Colors } from "../../../constants/Colors";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  profileCard: {
    backgroundColor: "rgba(255,255,255,0.5)",
    //backgroundColor: Colors.tabGrey,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 9 * DeviceDimensions.heightRatio,
    padding: 16,
    alignItems: "center",
    // shadowColor:'black',
    // shadowOffset:{width:0, height:4},
    // shadowRadius:6,

    // elevation:4
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 8,
  },
  name: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 8,
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  locationText: {
    fontSize: 14,
    color: "gray",
    marginLeft: 4,
  },
  statsContainer: {
    flexDirection: "row",
    width: "100%",
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    paddingTop: 16,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
  },
  statLabel: {
    fontSize: 12,
    color: "#888",
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
  },
  statSubLabel: {
    fontSize: 12,
    color: "#888",
    marginTop: 4,
  },
  completionRateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoIcon: {
    marginLeft: 4,
  },
  separator: {
    width: 1,
    backgroundColor: "#E0E0E0",
    height: "80%",
    alignSelf: "center",
  },
  dropdown: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  dropdownText: {
    fontSize: 16,
    fontWeight: "500",
  },
  dropdownDetail: {
    fontSize: 14,
    color: "#333",
    marginBottom: 8,
  },
  reviewContainer: {
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 20,
  },
  reviewerInfo: {
    flexDirection: "row",
    marginBottom: 12,
  },
  reviewerImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  reviewerNameContainer: {
    flex: 1,
    justifyContent: "center",
    marginLeft: 12,
  },
  reviewerName: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 4,
  },
  stars: {
    flexDirection: "row",
  },
  starIcon: {
    marginRight: 3,
  },
  reviewDate: {
    fontSize: 12,
    color: "#888",
    alignSelf: "flex-start",
  },
  reviewText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#333",
  },
  seeAllButton: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 24,
  },
  seeAllText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "500",
  },
  experienceContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    margin: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    overflow: "hidden", // Important for animated height
  },
  dropdownHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  dropdownContent: {
    paddingTop: 10,
    overflow: "hidden",
  },
  imageRow: {
    marginTop: 10,
    marginBottom: 5,
  },
  imagePlaceholder: {
    width: 92 * DeviceDimensions.widthRatio,
    height: 67 * DeviceDimensions.heightRatio,
    backgroundColor: "#f0f0f0",
    borderRadius: 6,
  },
  buttonContainer: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  fixedBottomContainer: {
    position: "absolute",
    bottom: 200,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  bankDetailsCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  bankDetailsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  bankDetailsHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  bankDetailsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.black,
  },
  editIconButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.blue + "10",
  },
  bankDetailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  bankDetailsLabel: {
    fontSize: 14,
    color: Colors.grey,
    fontWeight: "500",
  },
  bankDetailsValue: {
    fontSize: 14,
    color: Colors.black,
    fontWeight: "600",
    flex: 1,
    textAlign: "right",
    marginLeft: 16,
  },
  editBankButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    paddingVertical: 10,
    gap: 6,
  },
  editBankButtonText: {
    fontSize: 14,
    color: Colors.blue,
    fontWeight: "600",
  },
  addBankCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  addBankTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.black,
    marginTop: 12,
    marginBottom: 8,
  },
  addBankText: {
    fontSize: 14,
    color: Colors.grey,
    textAlign: "center",
    marginBottom: 16,
  },
  addBankButton: {
    backgroundColor: Colors.blue,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  addBankButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "600",
  },
});

export default styles;
