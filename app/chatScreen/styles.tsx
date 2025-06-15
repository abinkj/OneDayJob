import { StyleSheet } from "react-native";
import { Colors } from "../../constants/Colors";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  dateLabel: {
    alignSelf: "center",
    fontSize: 12,
    marginVertical: 10,
    color: "#888",
  },
  messagesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  messageBubble: {
    height: "auto",
    padding: 10,
    marginVertical: 6,
    maxWidth: "80%",
  },
  myMessage: {
    backgroundColor: Colors.subGrey,
    alignSelf: "flex-end",
    borderBottomStartRadius: 21,
    borderBottomEndRadius: 21,
    borderTopStartRadius: 21,
  },
  otherMessage: {
    backgroundColor: Colors.messagageBubble,
    alignSelf: "flex-start",
    borderBottomStartRadius: 21,
    borderBottomEndRadius: 21,
    borderTopEndRadius: 21,
  },
  messageText: {
    color: "#fff",
    fontWeight: "400",
    fontSize: 16,
  },
  messageTime: {
    fontSize: 10,
    color: "#ccc",
    alignSelf: "flex-end",
  },
  timeContainer: {
    flexDirection: "row",
    position: "absolute",
    right: 8,
    bottom: 6,
    alignItems: "center",
  },
  tickIcon: {
    marginLeft: 1,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    marginVertical: 10,
    marginHorizontal: 16,
  },
  subInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    borderRadius: 28,
    marginLeft: 8,
    paddingLeft: 16,
    paddingRight: 12,
    borderWidth: 0.15,
    borderColor: Colors.borderGrey,
    backgroundColor: "white",
  },
  input: {
    flex: 1,
  },
  sendIcon: {
    justifyContent: "center",
    alignItems: "center",

    backgroundColor: Colors.subGrey,
    padding: 8,
    borderRadius: 1234,
    marginLeft: 8,
    height: 40,
    width: 40,
  },
});
