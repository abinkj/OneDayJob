import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/Colors";
import { JobCardData } from "../../types";

const JobCard = ({
  data,
  onPress,
  onWithdraw,
  onDelete,
  withdraw = false,
}: {
  data: JobCardData;
  onPress: Function;
  onWithdraw?: Function;
  onDelete?: Function;
  withdraw?: boolean;
}) => {
  const {
    name,
    budget,
    applicantCount,
    location,
    createdAt,
    status = "active",
    category,
    description,
    isRemote,
    isFlexible,
    requirements,
    timePreference,
  } = data || {};

  const isApplied = status?.toLowerCase() === "applied";
  const isInProgress = status?.toLowerCase() === "in_progress" || status?.toLowerCase() === "in progress";

  const formattedLocation = location?.address
    ? `${location.address}${location.city ? ", " + location.city : ""}${
        location.state ? ", " + location.state : ""
      }${location.country ? ", " + location.country : ""}`
    : location?.country || "Remote";

  const formatTimePreference = (timePrefs: string[]) => {
    if (!timePrefs || timePrefs.length === 0) return "Flexible";
    return timePrefs
      .map((time) => time.charAt(0).toUpperCase() + time.slice(1))
      .join(", ");
  };

  const formatRequirements = (reqs: string[]) => {
    if (!reqs || reqs.length === 0) return "No specific requirements";
    return (
      reqs.slice(0, 2).join(", ") +
      (reqs.length > 2 ? ` +${reqs.length - 2} more` : "")
    );
  };

  return (
    <View style={styles.card}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.categoryContainer}>
          <Text style={styles.category}>
            {category?.name?.toUpperCase() || "GENERAL"}
          </Text>
        </View>

        <View
          style={[
            styles.statusTag,
            isApplied && { backgroundColor: "#28a745" }, // green background if applied
            isInProgress && { backgroundColor: "#FF9800" }, // orange background if in progress
          ]}
        >
          <Text
            style={[
              styles.statusText,
              isApplied && { color: "#fff" }, // white text if applied
              isInProgress && { color: "#fff" }, // white text if in progress
            ]}
          >
            {isApplied ? "Applied" : isInProgress ? "In Progress" : status}
          </Text>
        </View>
      </View>

      {/* Job Title */}
      <Text style={styles.title}>{name || "Untitled Job"}</Text>

      {/* Description */}
      {description && (
        <Text style={styles.description} numberOfLines={2}>
          {description}
        </Text>
      )}

      {/* Price & Applicants */}
      <View style={styles.metaRow}>
        <Text style={styles.price}>
          ₹{budget ? budget.toLocaleString() : "0"}
        </Text>
        <Text style={styles.separator}>|</Text>
        <Text style={styles.slots}>{applicantCount || 0}</Text>
        <Ionicons
          name="person"
          size={14}
          color="#386BF6"
          style={{ marginLeft: 8 }}
        />
      </View>

      {/* Location & Date */}
      <View style={styles.metaRow}>
        <Ionicons
          name={isRemote ? "laptop" : "location"}
          size={14}
          color={Colors.iconBlack}
        />
        <Text style={styles.metaLocation}>
          {isRemote ? "Remote Work" : formattedLocation}
        </Text>
        <Ionicons
          name="calendar"
          size={14}
          color={Colors.iconBlack}
          style={{ marginLeft: 14 }}
        />
        <Text style={styles.metaText}>
          {createdAt ? new Date(createdAt).toLocaleDateString() : "N/A"}
        </Text>
      </View>

      {/* Time Preference */}
      <View style={styles.metaRow}>
        <Ionicons name="time" size={14} color={Colors.iconBlack} />
        <Text style={styles.metaText}>
          {formatTimePreference(timePreference)}
        </Text>
        {isFlexible && (
          <>
            <Text style={styles.separator}>|</Text>
            <Text style={styles.flexibleText}>Flexible</Text>
          </>
        )}
      </View>

      {/* Requirements */}
      {requirements && requirements.length > 0 && (
        <View style={styles.metaRow}>
          <Ionicons name="construct" size={14} color={Colors.iconBlack} />
          <Text style={styles.metaText}>
            {formatRequirements(requirements)}
          </Text>
        </View>
      )}

      {/* Bottom Row */}
      <View style={styles.bottomRow1}>
        <View style={styles.avatars}>
          <Image
            source={{ uri: "https://i.pravatar.cc/20?img=1" }}
            style={styles.avatar}
          />
          <Image
            source={{ uri: "https://i.pravatar.cc/20?img=2" }}
            style={styles.avatar}
          />
          <Image
            source={{ uri: "https://i.pravatar.cc/20?img=3" }}
            style={styles.avatar}
          />
          <Text style={styles.requestText}>
            {applicantCount > 10
              ? "10+ Requests"
              : `${applicantCount || 0} Requests`}
          </Text>
        </View>
        <View style={styles.bottomRow}>
          <TouchableOpacity style={styles.button} onPress={() => onPress()}>
            {withdraw ? (
              <Text style={styles.buttonText}>View Details</Text>
            ) : isInProgress ? (
              <Text style={styles.buttonText}>Start Timer</Text>
            ) : (
              <Text style={styles.buttonText}>View Requests</Text>
            )}
          </TouchableOpacity>
          {withdraw ? (
            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: Colors.red, marginLeft: 12 },
              ]}
              onPress={() => {
                if (onWithdraw) onWithdraw();
              }}
            >
              <Text style={[styles.buttonText, { color: Colors.white }]}>
                Withdraw
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: Colors.red, marginLeft: 12 },
              ]}
              onPress={() => {
                if (onDelete) onDelete();
              }}
            >
              <Text style={[styles.buttonText, { color: Colors.white }]}>
                Delete
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginVertical: 8,
    width: "100%",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  categoryContainer: {
    backgroundColor: Colors.blue + "20",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  category: {
    fontSize: 10,
    fontWeight: "600",
    color: Colors.blue,
  },
  statusTag: {
    backgroundColor: Colors.whiteBack,
    paddingHorizontal: 19,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.black,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: Colors.black,
  },
  description: {
    fontSize: 14,
    color: Colors.subGrey,
    marginBottom: 8,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  price: {
    color: Colors.blue,
    fontWeight: "600",
    fontSize: 14,
  },
  separator: {
    marginHorizontal: 8,
    color: Colors.subGrey,
  },
  slots: {
    fontSize: 14,
    color: Colors.subGrey,
  },
  metaText: {
    fontSize: 14,
    color: Colors.subGrey,
    fontWeight: "400",
    marginLeft: 4,
  },
  metaLocation: {
    fontSize: 14,
    color: Colors.subGrey,
    fontWeight: "400",
    marginLeft: 4,
    flex: 1,
  },
  flexibleText: {
    fontSize: 12,
    color: Colors.blue,
    fontWeight: "500",
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 12,
  },
  bottomRow1: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  avatars: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 18,
    height: 18,
    borderRadius: 30,
    marginRight: -5,
  },
  requestText: {
    marginLeft: 8,
    fontSize: 12,
    color: Colors.subGrey,
    fontWeight: "500",
  },
  button: {
    borderColor: Colors.black,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  buttonText: {
    fontSize: 12,
    fontWeight: "400",
  },
});

export default JobCard;
