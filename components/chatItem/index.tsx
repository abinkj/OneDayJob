import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Colors } from "../../constants/Colors";

export default function ChatItem({ item, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <Image
        source={
          item.avatar
            ? { uri: item.avatar }
            : require("../../assets/images/profile/profile.png")
        }
        style={styles.avatar}
      />
      <View style={styles.textContainer}>
        <Text style={styles.name}>{item.name}</Text>
        <Text numberOfLines={1} style={styles.message}>
          {item.message}
        </Text>
      </View>
      {item.unread > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.unread}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", padding: 16, alignItems: "center" },
  avatar: { width: 48, height: 48, borderRadius: 24, marginRight: 12 },
  textContainer: { flex: 1 },
  name: { fontWeight: "bold", fontSize: 16 },
  message: { color: "#555" },
  badge: {
    backgroundColor: Colors.grey,
    borderRadius: 1234,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  badgeText: { color: "#fff", fontSize: 12 },
});
