import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { Colors } from "../../constants/Colors"; 

const MessageBubble = ({ text, time, type }) => {
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
              color="#ccc"
              style={styles.tickIcon}
            />
            <AntDesign
              name="check"
              size={12}
              color="#ccc"
              style={styles.tickIcon2}
            />
          </>
        )}
      </View>
    </View>
  );
};

export default MessageBubble;

const styles = StyleSheet.create({
  messageBubble: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 6,
    maxWidth: "80%",
    height: "auto",
    position: "relative",
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
    color: Colors.white,
    fontWeight: "400",
    fontSize: 16,
    paddingRight: 40,
  },
  otherMessageText: {
    color: "#343434",
  },
  timeContainer: {
    flexDirection: "row",
    position: "absolute",
    right: 8,
    bottom: 6,
    alignItems: "center",
  },
  messageTime: {
    fontSize: 10,
    color: "#ccc",
    marginRight: 4,
  },
  otherMessageTime: {
    color: "#4A4A4A",
  },
  tickIcon: {
    marginLeft: 1,
  },
  tickIcon2: {
    marginLeft: -8,
  },
});
