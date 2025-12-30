import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { ThemeColors } from "../../constants/Colors";
import { useTheme } from "../../contexts/ThemeContext";

const MessageBubble = ({ text, time, type }) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View
      style={[
        styles.messageBubble,
        type === "me" ? styles.myMessage : styles.otherMessage,
      ]}
    >
      <Text
        style={[
          styles.messageText,
          type === "me" ? styles.messageText : styles.otherMessageText,
        ]}
      >
        {text}
      </Text>

      <View style={styles.timeContainer}>
        <Text
          style={[
            styles.messageTime,
            type === "me" ? styles.messageTime : styles.otherMessageTime,
          ]}
        >
          {time}
        </Text>
        {type === "me" && (
          <>
            <AntDesign
              name="check"
              size={12}
              color="rgba(255, 255, 255, 0.7)"
              style={styles.tickIcon}
            />
            <AntDesign
              name="check"
              size={12}
              color="rgba(255, 255, 255, 0.7)"
              style={styles.tickIcon2}
            />
          </>
        )}
      </View>
    </View>
  );
};

export default MessageBubble;

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  messageBubble: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginVertical: 6,
    maxWidth: "85%", // Increased from 80%
    minWidth: 120, // Added minWidth to prevent cramping on short messages
    height: "auto",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  myMessage: {
    backgroundColor: colors.primary,
    alignSelf: "flex-end",
    borderBottomStartRadius: 21,
    borderBottomEndRadius: 4, // Make it look like a bubble
    borderTopStartRadius: 21,
    borderTopEndRadius: 21,
  },
  otherMessage: {
    backgroundColor: colors.white,
    alignSelf: "flex-start",
    borderBottomStartRadius: 4, // Make it look like a bubble
    borderBottomEndRadius: 21,
    borderTopEndRadius: 21,
    borderTopStartRadius: 21,
    borderWidth: 0,
  },
  messageText: {
    color: colors.white, // Text on primary color
    fontWeight: "400",
    fontSize: 16,
    paddingRight: 55, // Increased padding to avoid overlap with time
  },
  otherMessageText: {
    color: colors.black, // Text on white/dark background
  },
  timeContainer: {
    flexDirection: "row",
    position: "absolute",
    right: 10,
    bottom: 8,
    alignItems: "center",
  },
  messageTime: {
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.7)",
    marginRight: 4,
  },
  otherMessageTime: {
    color: colors.grey,
  },
  tickIcon: {
    marginLeft: 1,
  },
  tickIcon2: {
    marginLeft: -8,
  },
});
