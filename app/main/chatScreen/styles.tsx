import { StyleSheet } from "react-native";
import { ThemeColors } from "../../../constants/Colors";

export const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  dateLabel: {
    alignSelf: "center",
    fontSize: 12,
    marginVertical: 10,
    color: colors.grey,
  },
  messagesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  // Legacy/Unused styles kept for safety but updated for theme
  messageBubble: {
    height: "auto",
    padding: 10,
    marginVertical: 6,
    maxWidth: "80%",
  },
  myMessage: {
    backgroundColor: colors.subGrey,
    alignSelf: "flex-end",
    borderBottomStartRadius: 21,
    borderBottomEndRadius: 21,
    borderTopStartRadius: 21,
  },
  otherMessage: {
    backgroundColor: colors.messagageBubble,
    alignSelf: "flex-start",
    borderBottomStartRadius: 21,
    borderBottomEndRadius: 21,
    borderTopEndRadius: 21,
  },
  messageText: {
    color: colors.white,
    fontWeight: "400",
    fontSize: 16,
  },
  messageTime: {
    fontSize: 10,
    color: colors.grey,
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
  // End Legacy
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    marginHorizontal: 16,
    borderRadius:24
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
    borderColor: colors.borderGrey,
    backgroundColor: colors.white,
  },
  input: {
    flex: 1,
    color: colors.black,
  },
  sendIcon: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.primary,
    padding: 8,
    borderRadius: 1234,
    marginLeft: 8,
    height: 40,
    width: 40,
  },
  typingIndicator: {
    padding: 10,
    alignItems: 'center',
  },
  typingText: {
    color: colors.grey,
    fontSize: 14,
    fontStyle: 'italic',
  },
});