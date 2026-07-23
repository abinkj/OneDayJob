import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  actionContainer: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flex: 0.48,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  messageCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: "row",
    alignItems: "center",
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  textContent: {
    flex: 1,
  },
  messageText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  detailText: {
    fontSize: 12,
  },
  timestampText: {
    fontSize: 10,
    marginTop: 4,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 14,
  },
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#007BFF",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "600",
  },
  activeTabText: {
    color: "#007BFF",
  },
  simulatorContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  simButton: {
    width: "80%",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 10,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 4,
    alignSelf: "flex-start",
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  bannerContainer: {
    margin: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  bannerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  bannerTextContent: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 2,
  },
  bannerSubtitle: {
    fontSize: 13,
  },
});

export default styles;
