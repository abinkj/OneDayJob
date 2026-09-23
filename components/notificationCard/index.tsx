import React, { useMemo, useCallback } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../../contexts/ThemeContext";
import { createStyles } from "./styles";

interface NotificationCardProps {
  title: string;
  subtitle: string;
  time: string;
  count?: number;
  onPress: () => void;
  onDelete?: () => void;
  onLongPress?: () => void;
  type?: string;
  isRead?: boolean;
}

const EMOJI_REGEX =
  /[\u{1F300}-\u{1F9FF}\u{2600}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2300}-\u{23FF}\u{2B50}\u{FE0F}\u{200D}]/gu;

const sanitizeText = (text?: string): string => {
  if (!text) return "";
  return text.replace(EMOJI_REGEX, "").trim();
};

const NotificationCard: React.FC<NotificationCardProps> = ({
  title,
  subtitle,
  time,
  count,
  onPress,
  onDelete,
  onLongPress,
  type,
  isRead,
}) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const displayTitle = useMemo(() => sanitizeText(title), [title]);
  const displaySubtitle = useMemo(() => sanitizeText(subtitle), [subtitle]);

  const getIcon = useCallback(() => {
    switch (type) {
      case "job_update":
      case "application_status":
        return "briefcase-outline";
      case "message":
        return "message-text-outline";
      case "system":
        return "information-outline";
      default:
        return "bell-outline";
    }
  }, [type]);

  const handleLongPress = useCallback(() => {
    if (onLongPress) {
      onLongPress();
    } else if (onDelete) {
      onDelete();
    }
  }, [onLongPress, onDelete]);

  const showBadge = Boolean(count && count > 0 && !isRead);

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      onLongPress={handleLongPress}
      style={styles.cardContainer}
    >
      {!isRead && <View style={styles.unreadIndicator} />}
      <View style={[styles.card, !isRead && styles.unreadCard]}>
        <View
          style={[styles.left, isRead ? styles.iconBoxRead : styles.iconBoxUnread]}
        >
          <MaterialCommunityIcons
            name={getIcon()}
            size={22}
            color={isRead ? colors.grey : colors.primary}
          />
        </View>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text
              style={[styles.title, !isRead && styles.titleUnread]}
              numberOfLines={1}
            >
              {displayTitle}
            </Text>
            <Text style={styles.time}>{time}</Text>
            {onDelete && (
              <TouchableOpacity
                onPress={onDelete}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={styles.deleteButton}
                activeOpacity={0.6}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={16}
                  color={colors.grey}
                />
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.subtitle} numberOfLines={2}>
            {displaySubtitle}
          </Text>
        </View>
        {showBadge && (
          <View style={styles.badge}>
            <View style={styles.activeDot} />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default React.memo(NotificationCard);
