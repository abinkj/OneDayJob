import { StyleSheet } from "react-native";

const styles= StyleSheet.create({
container: {
    backgroundColor: "#fff",
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 10,
  },
  status: {
    backgroundColor: "#eee",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    fontSize: 12,
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    color: "#888",
    marginBottom: 5,
    textTransform: "uppercase",
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  name: {
    fontSize: 14,
    fontWeight: "600",
  },
  timeAgo: {
    fontSize: 12,
    color: "#888",
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  value: {
    fontSize: 14,
    fontWeight: "500",
  },
  subValue: {
    fontSize: 13,
    color: "#666",
  },
  description: {
    fontSize: 14,
    color: "#444",
    marginBottom: 20,
  },
  photos: {
    marginBottom: 20,
  },
  photo: {
    width: 100,
    height: 70,
    marginRight: 10,
    borderRadius: 8,
  },
  requirement: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  check: {
    fontSize: 16,
    color: "#4CAF50",
    marginRight: 8,
  },
  requirementText: {
    fontSize: 14,
  },
});
export default styles;
