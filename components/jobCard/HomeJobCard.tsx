import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { JobPost } from "../../types";
import { getCategoryIcon } from "../../constants/JobConstants";
import {
  isJobOwner,
  isAssignedWorker,
  formatDateDDMMYYYY,
} from "../../utilities/jobUtils";

interface HomeJobCardProps {
  item: JobPost & { distance?: number | null; isExpired?: boolean };
  userData: any;
  colors: any;
  styles: any;
  navigation: any;
  arrivingJobId?: string;
  arrivalLoading?: boolean;
  locationAddress?: string;
  handleArrival?: (item: any) => void;
}

export const HomeJobCard: React.FC<HomeJobCardProps> = ({
  item,
  userData,
  colors,
  styles,
  navigation,
  arrivingJobId,
  arrivalLoading,
  locationAddress,
  handleArrival,
}) => {
  const isExpired = !!item.isExpired;
  const isInProgress =
    item.jobStatus?.toLowerCase() === "in_progress" ||
    item.status?.toLowerCase() === "in_progress";
  const isCompleted =
    item.jobStatus?.toLowerCase() === "completed" ||
    item.status?.toLowerCase() === "completed";

  const jobItem = item as any;
  const jobOwnerId =
    jobItem.userId?._id ||
    jobItem.userId?.id ||
    jobItem.postedBy?._id ||
    jobItem.postedBy?.id ||
    jobItem.createdBy ||
    jobItem.ownerId ||
    (typeof jobItem.userId === "string" ? jobItem.userId : "");

  const userId = userData?.id || userData?._id;
  const isEmployer = isJobOwner(item, userId);
  const isAccepted = isAssignedWorker(item, userId);

  const showArrivalFeature =
    !isEmployer && isAccepted && !isCompleted && !isExpired;

  const handleJobPress = () => {
    if (isExpired) return;
    if (isInProgress) {
      navigation.navigate("JobTimer", {
        jobId: item._id,
        jobName: item.name,
        isEmployer,
        employerId: jobOwnerId,
        employerName:
          `${item.userId?.firstName || ""} ${item.userId?.lastName || ""}`.trim(),
        employerPhoneNumber: item.userId?.phoneNumber,
        employerImage: item.userId?.profilePicture,
      });
    } else {
      navigation.navigate("JobDetails", { jobId: item._id, jobData: item });
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.jobCard,
        isInProgress && { borderLeftColor: "#FF9800" },
        isExpired && styles.jobCardExpired,
      ]}
      onPress={handleJobPress}
      disabled={isExpired}
      activeOpacity={isExpired ? 1 : 0.7}
    >
      <View style={styles.jobCardHeader}>
        <View
          style={[
            styles.categoryContainer,
            isExpired && { backgroundColor: "#E5E7EB" },
          ]}
        >
          <Image
            style={[styles.avatarContainer, isExpired && { opacity: 0.5 }]}
            source={getCategoryIcon(item.category?.name)}
          />
          <Text
            style={[
              styles.categoryText,
              isExpired && { color: "#6B7280" },
            ]}
          >
            {item.category?.name || "GENERAL"}
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          {isExpired && (
            <View style={styles.expiredTag}>
              <Text style={styles.expiredTagText}>Expired</Text>
            </View>
          )}
          <View style={styles.priceContainer}>
            <Text
              style={[
                styles.priceText,
                isExpired && { color: "#9CA3AF" },
              ]}
            >
              ₹{item.budget || 0}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.titleContainer}>
        <Text
          style={[
            styles.jobTitle,
            isExpired && { color: "#9CA3AF" },
          ]}
          numberOfLines={2}
        >
          {item.name}
        </Text>
        {isInProgress && !isExpired && (
          <View
            style={[styles.statusContainer, styles.statusContainerInProgress]}
          >
            <Text style={[styles.statusText, styles.statusTextInProgress]}>
              In Progress
            </Text>
          </View>
        )}
      </View>

      <View style={styles.jobDetailsContainer}>
        {item.distance !== null && item.distance !== undefined && (
          <View style={styles.detailRow}>
            <Ionicons
              name="navigate-circle-outline"
              size={14}
              color={isExpired ? "#9CA3AF" : colors.grey}
            />
            <Text
              style={[
                styles.distanceText,
                isExpired && { color: "#9CA3AF" },
              ]}
            >
              {item.distance}km away
            </Text>
          </View>
        )}
        <View style={styles.locationContainer}>
          <Text
            style={[
              styles.locationText,
              isExpired && { color: "#9CA3AF" },
            ]}
            numberOfLines={1}
          >
            {item.isRemote
              ? "Remote Work"
              : item.location?.address ||
                item.location?.city ||
                item.location?.state ||
                "Location not specified"}
          </Text>
        </View>
      </View>

      <View style={styles.jobFooter}>
        <View style={styles.vacanciesContainer}>
          <Ionicons
            name="people-outline"
            size={14}
            color={isExpired ? "#9CA3AF" : colors.grey}
          />
          <Text
            style={[
              styles.vacanciesText,
              isExpired && { color: "#9CA3AF" },
            ]}
          >
            {item.participantsNumber || 1} Needed
          </Text>
        </View>
        <Text
          style={[
            styles.timeAgoText,
            isExpired && { color: "#9CA3AF" },
          ]}
        >
          {item.createdAt ? formatDateDDMMYYYY(item.createdAt) : "Recently"}
        </Text>
      </View>

      {showArrivalFeature && handleArrival && (
        <View style={styles.arrivalButtonContainer}>
          <TouchableOpacity
            style={[
              styles.arrivalButton,
              {
                backgroundColor:
                  (item as any).hasArrived ||
                  (arrivalLoading && arrivingJobId === (item as any)._id)
                    ? colors.grey
                    : colors.darkGreen,
                shadowColor: colors.darkGreen,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity:
                  (item as any).hasArrived || arrivalLoading ? 0 : 0.3,
                shadowRadius: 4,
                elevation: (item as any).hasArrived || arrivalLoading ? 0 : 3,
              },
            ]}
            onPress={() =>
              (item as any).hasArrived
                ? Toast.show({
                    type: "info",
                    text1: "Waiting for Approval",
                    text2:
                      "Please ask your employer to verify you on their screen.",
                  })
                : handleArrival(item)
            }
            disabled={
              (item as any).hasArrived ||
              (arrivalLoading && arrivingJobId === (item as any)._id)
            }
            activeOpacity={0.8}
          >
            {arrivalLoading && arrivingJobId === (item as any)._id ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons
                  name={
                    (item as any).hasArrived ? "checkmark-circle" : "location"
                  }
                  size={18}
                  color="#fff"
                  style={styles.arrivalButtonIcon}
                />
                <Text style={styles.arrivalButtonText}>
                  {(item as any).hasArrived
                    ? "Arrived - Waiting for Approval"
                    : "I Have Reached the Location"}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {(item as any).hasArrived && (
            <Text style={styles.arrivalSuccessText}>
              Arrival marked! Ask employer to verify you.
            </Text>
          )}

          <View style={styles.locationInfoContainer}>
            <View style={styles.locationInfoRow}>
              <Ionicons
                name="navigate"
                size={12}
                color={colors.grey}
                style={styles.locationInfoIcon}
              />
              <Text
                style={styles.currentLocationText}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                Current: {locationAddress || "Getting location..."}
              </Text>
            </View>
            {item.distance !== null && item.distance !== undefined && (
              <Text style={styles.distanceFromSiteText}>
                ~{item.distance}km from site
              </Text>
            )}
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default HomeJobCard;
