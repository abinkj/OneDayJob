import { StyleSheet, Dimensions } from "react-native";
import { Colors } from "../../../constants/Colors";
import DeviceDimensions from "../../../constants/DeviceDimenions";

const { width } = Dimensions.get("window");

export const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  profileCard: {
    backgroundColor: colors.white,
    margin: 10,
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  profileImage: {
    width: 100 * DeviceDimensions.widthRatio,
    height: 100 * DeviceDimensions.widthRatio,
    borderRadius: 50,
    marginBottom: 10,
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.black,
    marginBottom: 5,
    textAlign: "center",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  locationText: {
    marginLeft: 5,
    color: colors.grey,
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 10,
  },
  statBox: {
    alignItems: "center",
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: colors.grey,
    fontWeight: "600",
    marginBottom: 5,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.black,
  },
  statSubLabel: {
    fontSize: 12,
    color: colors.grey,
    marginTop: 2,
  },
  separator: {
    width: 1,
    backgroundColor: colors.border,
    height: "100%",
  },
  completionRateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoIcon: {
    marginLeft: 4,
  },
  reviewContainer: {
    backgroundColor: colors.white,
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  reviewerInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  reviewerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  reviewerNameContainer: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.black,
  },
  stars: {
    flexDirection: "row",
    marginTop: 2,
  },
  reviewDate: {
    fontSize: 12,
    color: colors.grey,
  },
  reviewText: {
    fontSize: 14,
    color: colors.black,
    lineHeight: 20,
  },
  buttonContainer: {
    padding: 20,
  },
});

export default createStyles;
