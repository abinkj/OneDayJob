import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { FontAwesome6 } from "@expo/vector-icons";

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
  showEditButton?: boolean;
  onEditPress?: () => void;
  showChatButton?: boolean;
  onChatPress?: () => void;
  showSkipButton?: boolean;
  onSkipPress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBackButton,
  showEditButton = false,
  onEditPress,
  showChatButton = false,
  onChatPress,
  showSkipButton = false,
  onSkipPress,
}) => {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      {showBackButton && (
        <TouchableOpacity style={styles.backIcon} onPress={handleBack}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
      )}

      <Text style={styles.title}>{title}</Text>

      {showSkipButton && (
        <TouchableOpacity style={styles.skipIcon} onPress={onSkipPress}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}

      {showEditButton && (
        <TouchableOpacity style={styles.editIcon} onPress={onEditPress}>
          <MaterialIcons name="settings" size={22} color="black" />
        </TouchableOpacity>
      )}

      {showChatButton && (
        <TouchableOpacity style={styles.chatIcon} onPress={onChatPress}>
          <Ionicons name="chatbubble-outline" size={22} color="black" />
        </TouchableOpacity>
      )}
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    position: "relative",
  },
  backIcon: {
    position: "absolute",
    left: 16,
    top: 16,
    zIndex: 1,
    padding: 20,
    margin: -20,
  },
  editIcon: {
    position: "absolute",
    right: 16,
    top: 16,
    zIndex: 1,
    padding: 20,
    margin: -20,
  },
  chatIcon: {
    position: "absolute",
    right: 60,
    top: 16,
    zIndex: 1,
    padding: 20,
    margin: -20,
  },
  skipIcon: {
    position: "absolute",
    right: 16,
    top: 16,
    zIndex: 1,
    padding: 20,
    margin: -20,
  },
  skipText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
  },
});

