import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import ShimmerPlaceholder from "./ShimmerPlaceholder";
import { useTheme } from "../../contexts/ThemeContext";

// === Job Card Skeleton (Home, Status Listeners) ===
export const JobCardSkeleton = () => {
  const { colors } = useTheme();
  return (
    <View style={[styles.cardContainer, { backgroundColor: colors.white }]}>
      <View style={styles.cardHeader}>
        <ShimmerPlaceholder width={50} height={50} borderRadius={25} />
        <View style={styles.cardHeaderText}>
          <ShimmerPlaceholder
            width="80%"
            height={20}
            style={{ marginBottom: 6 }}
          />
          <ShimmerPlaceholder width="50%" height={14} />
        </View>
      </View>
      <View style={styles.cardBody}>
        <ShimmerPlaceholder
          width="100%"
          height={16}
          style={{ marginBottom: 8 }}
        />
        <ShimmerPlaceholder
          width="100%"
          height={16}
          style={{ marginBottom: 8 }}
        />
        <ShimmerPlaceholder width="60%" height={16} />
      </View>
      <View style={styles.cardFooter}>
        <ShimmerPlaceholder width={80} height={24} borderRadius={12} />
        <ShimmerPlaceholder
          width={80}
          height={24}
          borderRadius={12}
          style={{ marginLeft: 8 }}
        />
      </View>
    </View>
  );
};

// === Job Details Skeleton ===
export const JobDetailsSkeleton = () => {
  const { colors } = useTheme();
  return (
    <View style={[styles.detailsContainer, { backgroundColor: colors.background }]}>
      {/* Header / Map placeholder */}
      <ShimmerPlaceholder
        width="100%"
        height={200}
        borderRadius={0}
        style={{ marginBottom: 16 }}
      />

      <View style={{ paddingHorizontal: 16 }}>
        {/* Title and Price */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <ShimmerPlaceholder width="60%" height={24} />
          <ShimmerPlaceholder width="30%" height={24} />
        </View>

        {/* Description paragraphs */}
        <ShimmerPlaceholder
          width="100%"
          height={16}
          style={{ marginBottom: 8 }}
        />
        <ShimmerPlaceholder
          width="100%"
          height={16}
          style={{ marginBottom: 8 }}
        />
        <ShimmerPlaceholder
          width="100%"
          height={16}
          style={{ marginBottom: 8 }}
        />
        <ShimmerPlaceholder
          width="80%"
          height={16}
          style={{ marginBottom: 24 }}
        />

        {/* Job Info Rows */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <ShimmerPlaceholder width="45%" height={60} borderRadius={8} />
          <ShimmerPlaceholder width="45%" height={60} borderRadius={8} />
        </View>

        {/* User Info */}
        <View
          style={{ flexDirection: "row", alignItems: "center", marginTop: 16 }}
        >
          <ShimmerPlaceholder
            width={50}
            height={50}
            borderRadius={25}
            style={{ marginRight: 12 }}
          />
          <View>
            <ShimmerPlaceholder
              width={120}
              height={18}
              style={{ marginBottom: 6 }}
            />
            <ShimmerPlaceholder width={80} height={14} />
          </View>
        </View>
      </View>
    </View>
  );
};

// === Profile Skeleton ===
export const ProfileSkeleton = () => {
  const { colors } = useTheme();
  return (
    <View style={[styles.profileContainer, { backgroundColor: colors.background }]}>
      {/* Profile Header */}
      <View style={{ alignItems: "center", marginVertical: 20 }}>
        <ShimmerPlaceholder
          width={100}
          height={100}
          borderRadius={50}
          style={{ marginBottom: 16 }}
        />
        <ShimmerPlaceholder
          width={150}
          height={24}
          style={{ marginBottom: 8 }}
        />
        <ShimmerPlaceholder width={100} height={16} />
      </View>

      {/* Menu Items */}
      {[1, 2, 3, 4, 5].map((item) => (
        <View
          key={item}
          style={{
            flexDirection: "row",
            alignItems: "center",
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
        >
          <ShimmerPlaceholder
            width={24}
            height={24}
            borderRadius={12}
            style={{ marginRight: 16 }}
          />
          <ShimmerPlaceholder width="80%" height={20} />
        </View>
      ))}
    </View>
  );
};

// === Chat List Skeleton ===
export const ChatListSkeleton = () => {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <View key={item} style={[styles.chatListItem, { borderBottomColor: colors.border }]}>
          <ShimmerPlaceholder
            width={50}
            height={50}
            borderRadius={25}
            style={{ marginRight: 12 }}
          />
          <View style={{ flex: 1 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 6,
              }}
            >
              <ShimmerPlaceholder width={120} height={18} />
              <ShimmerPlaceholder width={40} height={14} />
            </View>
            <ShimmerPlaceholder width="90%" height={14} />
          </View>
        </View>
      ))}
    </View>
  );
};

// === Chat Screen Skeleton (Messages) ===
export const ChatScreenSkeleton = () => {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: colors.background }}>
      <View style={{ alignSelf: "flex-start", marginBottom: 16, width: "70%" }}>
        <ShimmerPlaceholder width="100%" height={60} borderRadius={12} />
      </View>
      <View style={{ alignSelf: "flex-end", marginBottom: 16, width: "70%" }}>
        <ShimmerPlaceholder width="100%" height={40} borderRadius={12} />
      </View>
      <View style={{ alignSelf: "flex-start", marginBottom: 16, width: "60%" }}>
        <ShimmerPlaceholder width="100%" height={50} borderRadius={12} />
      </View>
      <View style={{ alignSelf: "flex-end", marginBottom: 16, width: "80%" }}>
        <ShimmerPlaceholder width="100%" height={80} borderRadius={12} />
      </View>
    </View>
  );
};

// === List Skeleton ===
export const ListSkeleton = () => {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, padding: 16 }}>
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <View
          key={item}
          style={{
            marginBottom: 16,
            backgroundColor: colors.white,
            padding: 16,
            borderRadius: 12,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <ShimmerPlaceholder width={100} height={20} />
            <ShimmerPlaceholder width={60} height={20} />
          </View>
          <ShimmerPlaceholder width="100%" height={16} />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    padding: 16,
    margin: 16,
    // backgroundColor: "white", // Moved to dynamic style
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  cardHeaderText: {
    marginLeft: 12,
    flex: 1,
  },
  cardBody: {
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: "row",
  },
  detailsContainer: {
    flex: 1,
    // backgroundColor: "#fff", // Moved to dynamic style
  },
  profileContainer: {
    flex: 1,
    // backgroundColor: "#fff", // Moved to dynamic style
  },
  chatListItem: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
    borderBottomWidth: 1,
    // borderBottomColor: "#f0f0f0", // Moved to dynamic style
  },
});
