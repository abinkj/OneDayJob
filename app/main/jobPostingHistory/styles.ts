import { StyleSheet } from "react-native";
import { ThemeColors } from "../../../constants/Colors";
import DeviceDimensions from "../../../constants/DeviceDimenions";

export const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 40, // Increased for safe area
    backgroundColor: colors.background,
  },
  emptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    padding: 20,
    minHeight: 400,
  },
  emptyText: {
    fontSize: 18,
    color: colors.grey,
    marginTop: 16,
    textAlign: "center",
  },
  footer: {
    padding: 20,
    alignItems: "center",
  },
  // Added from Status styles to match JobCard requirements
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
    color: colors.black,
  },
  statusDescription: {
    fontSize: 10,
    color: colors.subGrey,
    fontStyle: 'italic',
    marginTop: 2,
  },
});
