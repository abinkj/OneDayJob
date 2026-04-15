import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../../contexts/ThemeContext";
import { ThemeColors } from "../../constants/Colors";

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
  showEditButton?: boolean;
  onEditPress?: () => void;
  showChatButton?: boolean;
  onChatPress?: () => void;
  showSkipButton?: boolean;
  onSkipPress?: () => void;
  showMessageIcon?: boolean;
  headerRight?: React.ReactNode;
  onBackPress?: () => void;
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
  showMessageIcon = false,
  headerRight,
  onBackPress,
}) => {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      {showBackButton && (
        <TouchableOpacity style={styles.backIcon} onPress={handleBack}>
          <Ionicons name="chevron-back" size={24} color={colors.black} />
        </TouchableOpacity>
      )}

      <Text style={styles.title}>{title}</Text>

      {headerRight && (
        <View style={styles.rightContainer}>
          {headerRight}
        </View>
      )}

      {showSkipButton && (
        <TouchableOpacity style={styles.skipIcon} onPress={onSkipPress}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}

      {showEditButton && (
        <TouchableOpacity style={styles.editIcon} onPress={onEditPress}>
          <MaterialIcons name="settings" size={22} color={colors.black} />
        </TouchableOpacity>
      )}

      {(showChatButton || showMessageIcon) && (
        <TouchableOpacity style={styles.chatIcon} onPress={onChatPress}>
          <Ionicons name="chatbubble-outline" size={22} color={colors.black} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    position: "relative",
    paddingBottom: 12,
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
    color: colors.grey,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.black,
  },
  rightContainer: {
    position: "absolute",
    right: 16,
    top: 16,
    zIndex: 1,
    padding: 10,
    margin: -10,
  },
});
