import React, { useMemo, useCallback } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../contexts/ThemeContext";
import { createStyles, getTypeConfig } from "./styles";

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
  const typeConfig = useMemo(() => getTypeConfig(type, colors), [type, colors]);

  const displayTitle = useMemo(() => sanitizeText(title), [title]);
  const displaySubtitle = useMemo(() => sanitizeText(subtitle), [subtitle]);

  const handleLongPress = useCallback(() => {
    if (onLongPress) {
      onLongPress();
    } else if (onDelete) {
      onDelete();
    }
  }, [onLongPress, onDelete]);

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      onLongPress={handleLongPress}
      style={[styles.cardContainer, !isRead && styles.cardContainerUnread]}
    >
      {/* Icon Circle */}
      <View style={[styles.iconCircle, { backgroundColor: typeConfig.bgColor }]}>
        <MaterialCommunityIcons
          name={typeConfig.icon as any}
          size={20}
          color={typeConfig.color}
        />
        {/* Unread dot badge on icon */}
        {!isRead && <View style={[styles.unreadDot, { backgroundColor: typeConfig.color }]} />}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Row 1: Title + Time */}
        <View style={styles.titleRow}>
          <Text
            style={[styles.title, !isRead && styles.titleUnread]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {displayTitle}
          </Text>
          <Text style={styles.time}>{time}</Text>
        </View>

        {/* Row 2: Subtitle */}
        <Text style={styles.subtitle} numberOfLines={2}>
          {displaySubtitle}
        </Text>
      </View>

      {/* Dismiss button */}
      {onDelete && (
        <TouchableOpacity
          onPress={onDelete}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={styles.deleteButton}
          activeOpacity={0.6}
        >
          <Ionicons name="close" size={14} color={colors.grey} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

export default React.memo(NotificationCard);



