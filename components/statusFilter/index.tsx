import React, { useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemeColors } from "../../constants/Colors";
import { StatusInfo } from "../../utilities/statusUtils";
import { useTheme } from "../../contexts/ThemeContext";

interface StatusFilterProps {
  statuses: StatusInfo[];
  selectedStatus: string | null;
  onStatusSelect: (status: string | null) => void;
  showAll?: boolean;
}

const StatusFilter: React.FC<StatusFilterProps> = ({
  statuses,
  selectedStatus,
  onStatusSelect,
  showAll = true,
}) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {showAll && (
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedStatus === null && styles.activeFilter,
          ]}
          onPress={() => onStatusSelect(null)}
        >
          <Text
            style={[
              styles.filterText,
              selectedStatus === null && styles.activeFilterText,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
      )}

      {statuses.map((status, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.filterButton,
            selectedStatus === status.label && styles.activeFilter,
          ]}
          onPress={() => onStatusSelect(status.label)}
        >
          <Ionicons
            name={status.icon as any}
            size={14}
            color={
              selectedStatus === status.label ? colors.white : status.color
            }
            style={styles.filterIcon}
          />
          <Text
            style={[
              styles.filterText,
              selectedStatus === status.label && styles.activeFilterText,
              {
                color:
                  selectedStatus === status.label ? colors.white : status.color,
              },
            ]}
          >
            {status.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      marginVertical: 8,
      backgroundColor: colors.background,
      maxHeight: 50,
      flexGrow: 0,
    },
    contentContainer: {
      paddingHorizontal: 16,
      gap: 8,
    },
    filterButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: colors.white,
      borderWidth: 1,
      borderColor: colors.subGrey + "30",
      marginRight: 8,
    },
    activeFilter: {
      backgroundColor: colors.blue,
      borderColor: colors.blue,
    },
    filterIcon: {
      marginRight: 4,
    },
    filterText: {
      fontSize: 12,
      fontWeight: "500",
      color: colors.black,
    },
    activeFilterText: {
      color: colors.white,
    },
  });

export default React.memo(StatusFilter);
