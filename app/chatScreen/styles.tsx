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
    borderRadius: 12,
    marginVertical: 6,
    maxWidth: "80%",
  },
  myMessage: {
    backgroundColor: Colors.subGrey,
    alignSelf: "flex-end",
  },
  otherMessage: {
    backgroundColor: Colors.messagageBubble,
    alignSelf: "flex-start",
  },
  messageText: {
    color: "#fff",
    fontWeight:'400',
    fontSize: 16,
  },
  messageTime: {
    fontSize: 10,
    color: "#ccc",
    marginTop: 4,
    alignSelf: "flex-end",
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
