import React from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Header } from "../../../components/header";
import Images from "../../../utilities/images";
import ratingStars from "../../../components/ratingStars";
import DeviceDimensions from "../../../constants/DeviceDimenions";
import { Colors } from "../../../constants/Colors";

const RequestDetails = () => {
  return (
    <View style={styles.container}>
      <Header title="Request" showBackButton />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Main Content */}
        <Text style={styles.readyText}>Darell is ready to work for you</Text>

        {/* Profile Section */}
        <View style={styles.profileSection}>
          <Image
            source={Images.profile.profileImage}
            style={styles.profileImage}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.name}>Darell Steward</Text>
            <View style={styles.ratingContainer}>
              {ratingStars(4)}
              <Text style={styles.reviewCount}>(12)</Text>
            </View>
          </View>
        </View>

        {/* Applied Date */}
        <Text style={styles.appliedText}>
          Applied on: Mar 31, 2025, 2:00 pm
        </Text>

        {/* Description */}
        <Text style={styles.descriptionText}>
          I have experience moving heavy furniture and can bring an extra hand
          if needed. Available on Feb 12 at 2 PM.
        </Text>

        {/* Details Section */}
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Expected Pay</Text>
            <Text style={styles.detailValue}>₹500/hr</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Available</Text>
            <Text style={styles.detailValue}>Mar 31, 2025, 2:00 pm</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.rejectButton} onPress={() => {}}>
            <Text style={styles.rejectButtonText}>Reject</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.acceptButton} onPress={() => {}}>
            <Text style={styles.acceptButtonText}>Accept</Text>
          </TouchableOpacity>
        </View>

        {/* Post Job Button */}
        <TouchableOpacity style={styles.postJobButton} onPress={() => {}}>
          <Text style={styles.postJobButtonText}>Post Job</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingTop: 35 * DeviceDimensions.heightRatio,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },

  readyText: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "left",
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
    marginTop: 30,
    alignContent: "center",
  },
  profileImage: {
    width: 24,
    height: 24,
    borderRadius: 25,
    marginRight: 15,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: "400",
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  reviewCount: {
    marginLeft: 5,
    color: "#666",
    fontSize: 14,
  },
  appliedText: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
    marginBottom: 15,
  },
  descriptionText: {
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 20,
    color: "#333",
  },
  detailsContainer: {
    marginBottom: 20,
  },
  detailRow: {
    marginBottom: 20,
  },
  detailLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  detailValue: {
    fontSize: 18,
    fontWeight: "500",
    color: "#000",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  rejectButton: {
    flex: 1,
    backgroundColor: "#E5E5E5",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginRight: 8,
  },
  rejectButtonText: {
    color: "#333",
    fontWeight: "500",
    fontSize: 16,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: "#4A4A4A",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginLeft: 8,
  },
  acceptButtonText: {
    color: "#fff",
    fontWeight: "500",
    fontSize: 16,
  },
  postJobButton: {
    marginHorizontal: 20,
    padding: 15,
    alignItems: "center",
    marginTop: "auto",
  },
  postJobButtonText: {
    color: "#007AFF",
    fontSize: 16,
  },
});

export default RequestDetails;
