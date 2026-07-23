import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StatusInfo } from "../../utilities/statusUtils";
import { useTheme } from "../../contexts/ThemeContext";
import { ThemeColors } from "../../constants/Colors";

interface StatusBadgeProps {
  statusInfo: StatusInfo;
  size?: "small" | "medium" | "large";
  showIcon?: boolean;
  showDescription?: boolean;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  statusInfo,
  size = "medium",
  showIcon = true,
  showDescription = false,
}) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const getSizeStyles = () => {
    switch (size) {
      case "small":
        return {
          container: styles.smallContainer,
          text: styles.smallText,
          icon: 12,
        };
      case "large":
        return {
          container: styles.largeContainer,
          text: styles.largeText,
          icon: 16,
        };
      default:
        return {
          container: styles.mediumContainer,
          text: styles.mediumText,
          icon: 14,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.container,
          sizeStyles.container,
          { backgroundColor: statusInfo.backgroundColor },
        ]}
      >
        {showIcon && (
          <Ionicons
            name={statusInfo.icon as any}
            size={sizeStyles.icon}
            color={statusInfo.color}
            style={styles.icon}
          />
        )}
        <Text
          style={[styles.text, sizeStyles.text, { color: statusInfo.color }]}
        >
          {statusInfo.label}
        </Text>
      </View>
      {showDescription && (
        <Text style={styles.description}>{statusInfo.description}</Text>
      )}
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    wrapper: {
      alignItems: "flex-start",
    },
    container: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    smallContainer: {
      paddingHorizontal: 6,
      paddingVertical: 3,
      borderRadius: 8,
    },
    mediumContainer: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    largeContainer: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
    },
    icon: {
      marginRight: 4,
    },
    text: {
      fontWeight: "600",
      textAlign: "center",
    },
    smallText: {
      fontSize: 10,
    },
    mediumText: {
      fontSize: 12,
    },
    largeText: {
      fontSize: 14,
    },
    description: {
      fontSize: 10,
      color: colors.grey,
      marginTop: 2,
      fontStyle: "italic",
    },
  });

export default React.memo(StatusBadge);
