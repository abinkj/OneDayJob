import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  Animated,
  FlatList,
  Image,
  ScrollView,
  ActivityIndicator,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  TabView,
  SceneRendererProps,
  NavigationState,
} from "react-native-tab-view";
import { useNavigation, useRoute } from "@react-navigation/native";
import styles from "./styles";
import { Header } from "../../../components/header";
import ratingStars from "../../../components/ratingStars";
import AcceptRejectButtons from "../../../components/acceptRejectButtons";
import VerificationCode from "../../../components/verificationCode";
import {
  getAppliedUser,
  rejectApplicants,
  selectApplicants,
} from "../../../services/api";
import Toast from "react-native-toast-message";

type Route = {
  key: string;
  title: string;
};
type State = NavigationState<Route>;

/* -------------------- Request Card -------------------- */
const RequestCard = ({ 
  data, 
  isSelected, 
  onSelect, 
  onAccept, 
  onReject, 
  loading = false 
}) => {
  const user = data.user || {};
  const navigation = useNavigation();

  const handleProfilePress = (userId: string) => {
    navigation.navigate("RequestProfile", { userId });
  };

  const handleAccept = () => {
    onAccept(data._id);
  };

  const handleReject = () => {
    onReject(data._id);
  };

  const getStatusInfo = () => {
    switch (data.status) {
      case 'accepted':
        return { isAccepted: true, isRejected: false };
      case 'rejected':
        return { isAccepted: false, isRejected: true };
      default:
        return { isAccepted: false, isRejected: false };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <View style={[styles.requestCard, isSelected && styles.selectedCard]}>
      <TouchableOpacity
        style={styles.cardContent}
        onPress={() => onSelect(data._id)}
        disabled={statusInfo.isAccepted || statusInfo.isRejected}
      >
        <View style={styles.requestHeader}>
          <View style={styles.profileSection}>
            <Image
              source={{ uri: user.avatar || "https://via.placeholder.com/40" }}
              style={styles.profileImage}
            />
            <TouchableOpacity
              style={styles.profileInfo}
              onPress={() => handleProfilePress(user.id)}
            >
              <Text style={styles.profileName}>{user.name}</Text>
              <View style={styles.ratingContainer}>
                {ratingStars(user.rating)}
                <Text style={styles.ratingText}>({user.rating})</Text>
              </View>
            </TouchableOpacity>
          </View>
          <Text style={styles.rate}>{user.rate}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.available}>Applied On:</Text>
          <Text style={styles.available}>
            {new Date(data.appliedAt).toLocaleDateString()}
          </Text>
        </View>

        <Text style={styles.requestDescription}>{user.description}</Text>

        <View style={styles.requestDetails}>
          <Text style={styles.detailText}>Available</Text>
          <Text style={styles.detailValue}>{user.availability}</Text>
        </View>

        {isSelected && !statusInfo.isAccepted && !statusInfo.isRejected && (
          <View style={styles.checkboxContainer}>
            <View style={styles.checkbox}>
              <Text style={styles.checkboxText}>✓</Text>
            </View>
          </View>
        )}
      </TouchableOpacity>

      {/* Individual Accept/Reject Buttons */}
      {!statusInfo.isAccepted && !statusInfo.isRejected && (
        <View style={styles.actionButtonsContainer}>
          <AcceptRejectButtons
            onAccept={handleAccept}
            onReject={handleReject}
            loading={loading}
          />
        </View>
      )}

      {/* Status Display */}
      {(statusInfo.isAccepted || statusInfo.isRejected) && (
        <View style={styles.statusContainer}>
          <AcceptRejectButtons
            onAccept={() => {}}
            onReject={() => {}}
            isAccepted={statusInfo.isAccepted}
            isRejected={statusInfo.isRejected}
          />
        </View>
      )}
    </View>
  );
};

/* -------------------- Accepted User Card -------------------- */
const AcceptedUserCard = ({ data, onSelect, isSelected = false }) => {
  const user = data.user || {};

  const handleCall = (phoneNumber: string) => {
    if (phoneNumber) {
      Linking.openURL(`tel:${phoneNumber}`);
    }
  };

  const handleCardPress = () => {
    if (onSelect) {
      onSelect(data);
    }
  };

  return (
    <TouchableOpacity 
      style={[
        styles.acceptedCardNew, 
        isSelected && styles.selectedAcceptedCard
      ]}
      onPress={handleCardPress}
    >
      <View style={styles.acceptedCardContent}>
        {/* Profile Picture */}
        <Image
          source={{ uri: user.avatar || "https://via.placeholder.com/50" }}
          style={styles.acceptedProfileImage}
        />
        
        {/* User Info */}
        <View style={styles.acceptedUserInfoNew}>
          <Text style={styles.acceptedUserNameNew}>{user.name}</Text>
          
          {/* Phone Number with Icon */}
          <View style={styles.phoneContainer}>
            <View style={styles.phoneIconContainer}>
              <Ionicons name="call" size={16} color="#007AFF" />
            </View>
            <TouchableOpacity onPress={() => handleCall(user.phoneNumber || user.phone)}>
              <Text style={styles.phoneNumberNew}>
                {user.phoneNumber || user.phone || "Not provided"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Verified Badge */}
        {data.isVerified && (
          <View style={styles.verifiedBadgeNew}>
            <Text style={styles.verifiedBadgeTextNew}>Verified</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

/* -------------------- Requests Tab -------------------- */
const RequestsTab = ({ jobId, onCountUpdate }) => {
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [showMenu, setShowMenu] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const filters = ["All", "Highly rated", "Budget Friendly"];

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await getAppliedUser(jobId);

      const appliedUsers = Array.isArray(response?.data)
        ? response.data.map((item) => ({
            _id: item._id,
            appliedAt: item.appliedAt,
            status: item.status,
            acceptedAt: item.acceptedAt,
            user: {
              id: item.user.id,
              name: `${item.user.firstName} ${item.user.lastName}`,
              avatar: item.user.profilePicture,
              rating: item.user.rating ?? 0,
              rate: item.user.rate ?? "$0/hr",
              description: item.user.description ?? "No description provided",
              availability: item.user.availability ?? "Not specified",
              phoneNumber: item.user.phoneNumber || item.user.phone,
              email: item.user.email,
            },
          }))
        : [];

      setRequests(appliedUsers);
      
      // Update counts
      const pending = appliedUsers.filter(req => req.status !== "accepted" && req.status !== "rejected").length;
      const accepted = appliedUsers.filter(req => req.status === "accepted").length;
      const verified = appliedUsers.filter(req => req.status === "accepted" && req.isVerified).length;
      
      if (onCountUpdate) {
        onCountUpdate(pending, accepted, verified);
      }
    } catch (error) {
      console.error("Error fetching applied users:", error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [jobId]);

  const getFilteredRequests = () => {
    if (!Array.isArray(requests)) return [];
    
    // Filter out accepted and rejected applications - only show pending
    const pendingRequests = requests.filter(
      (req) => req.status !== "accepted" && req.status !== "rejected"
    );

    if (selectedFilter === "All") return pendingRequests;

    if (selectedFilter === "Highly rated") {
      return pendingRequests.filter((req) => req.user?.rating >= 4.5);
    }
    if (selectedFilter === "Budget Friendly") {
      return pendingRequests.filter((req) => req.user?.rate && req.user.rate < 50);
    }

    return pendingRequests;
  };

  const handleSelectRequest = (appId: string) => {
    setSelectedRequests((prev) =>
      prev.includes(appId)
        ? prev.filter((id) => id !== appId)
        : [...prev, appId]
    );
  };

  const handleSelectAll = () => {
    const filteredRequests = getFilteredRequests();
    setSelectedRequests(filteredRequests.map((req) => req._id));
    setShowMenu(false);
  };

  const handleSelectFirst10 = () => {
    const filteredRequests = getFilteredRequests();
    const first10 = filteredRequests.slice(0, 10).map((req) => req._id);
    setSelectedRequests(first10);
    setShowMenu(false);
  };

  const handleDeselectAll = () => {
    setSelectedRequests([]);
    setShowMenu(false);
  };

  const handleAcceptSelected = async () => {
    try {
      if (selectedRequests.length === 0) {
        return Toast.show({
          type: "error",
          text1: "No applicants selected",
          text2: "Please select at least one applicant.",
        });
      }
      
      const response = await selectApplicants(jobId, selectedRequests);
      if (response.success) {
        Toast.show({
          type: "success",
          text1: "Applicants Selected",
          text2: "You have successfully selected applicants.",
        });
        setSelectedRequests([]);
        // Refresh the requests list
        fetchRequests();
      }
    } catch (error) {
      console.error("Error selecting applicants:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to select applicants. Please try again.",
      });
    }
  };

  const handleRejectSelected = async () => {
    try {
      if (selectedRequests.length === 0) {
        return Toast.show({
          type: "error",
          text1: "No applicants selected",
          text2: "Please select at least one applicant.",
        });
      }
      
      // Fixed: Use selectedApplicationIds instead of selectedUserIds
      const response = await rejectApplicants(jobId, selectedRequests);
      if (response.success) {
        Toast.show({
          type: "success",
          text1: "Applicants Rejected",
          text2: "You have successfully rejected applicants.",
        });
        setSelectedRequests([]);
        // Refresh the requests list
        fetchRequests();
      }
    } catch (error) {
      console.error("Error rejecting applicants:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to reject applicants. Please try again.",
      });
    }
  };

  // Individual accept/reject handlers
  const handleIndividualAccept = async (applicationId: string) => {
    try {
      setActionLoading(applicationId);
      const response = await selectApplicants(jobId, [applicationId]);
      if (response.success) {
        Toast.show({
          type: "success",
          text1: "Applicant Accepted",
          text2: "The applicant has been accepted successfully.",
        });
        fetchRequests();
      }
    } catch (error) {
      console.error("Error accepting applicant:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to accept applicant. Please try again.",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleIndividualReject = async (applicationId: string) => {
    try {
      setActionLoading(applicationId);
      const response = await rejectApplicants(jobId, [applicationId]);
      if (response.success) {
        Toast.show({
          type: "success",
          text1: "Applicant Rejected",
          text2: "The applicant has been rejected successfully.",
        });
        fetchRequests();
      }
    } catch (error) {
      console.error("Error rejecting applicant:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to reject applicant. Please try again.",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const renderRequest = ({ item }) => (
    <RequestCard
      data={item}
      isSelected={selectedRequests.includes(item._id)}
      onSelect={handleSelectRequest}
      onAccept={handleIndividualAccept}
      onReject={handleIndividualReject}
      loading={actionLoading === item._id}
    />
  );

  const filteredRequests = getFilteredRequests();

  return (
    <View style={styles.tabContainer}>
      {selectedRequests.length > 0 && (
        <View style={styles.headerInfo}>
          <View style={styles.headerTitle}>
            <Text style={styles.requestCount}>
              {selectedRequests.length}/{filteredRequests.length} selected
            </Text>
          </View>
        </View>
      )}

      {/* Filter Section */}
      <View style={styles.filterSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                selectedFilter === filter && styles.activeFilterButton,
              ]}
              onPress={() => setSelectedFilter(filter)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  selectedFilter === filter && styles.activeFilterButtonText,
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Menu Button */}
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setShowMenu(!showMenu)}
        >
          <Text style={styles.menuButtonText}>⋮</Text>
        </TouchableOpacity>
      </View>

      {showMenu && (
        <View style={styles.menuOptions}>
          <TouchableOpacity style={styles.menuOption} onPress={handleSelectAll}>
            <Text style={styles.menuOptionText}>Select All</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuOption}
            onPress={handleSelectFirst10}
          >
            <Text style={styles.menuOptionText}>Select First 10</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuOption}
            onPress={handleDeselectAll}
          >
            <Text style={styles.menuOptionText}>Deselect All</Text>
          </TouchableOpacity>
        </View>
      )}

      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={filteredRequests}
          renderItem={renderRequest}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <Text style={{ textAlign: "center", marginTop: 20 }}>
              No pending applicants found
            </Text>
          }
        />
      )}

      {selectedRequests.length > 0 && (
        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={styles.rejectButton}
            onPress={handleRejectSelected}
          >
            <Text style={styles.rejectButtonText}>Reject Selected</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.acceptButton}
            onPress={handleAcceptSelected}
          >
            <Text style={styles.acceptButtonText}>Accept Selected</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

/* -------------------- Verify Tab (Accepted Users) -------------------- */
const RequestsVerifyTab = ({ jobId, onCountUpdate }) => {
  const [acceptedUsers, setAcceptedUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    const fetchAcceptedUsers = async () => {
      try {
        setLoading(true);
        const response = await getAppliedUser(jobId);

        const accepted = Array.isArray(response?.data)
          ? response.data
              .filter((item) => item.status === "accepted")
              .map((item) => ({
                _id: item._id,
                appliedAt: item.appliedAt,
                acceptedAt: item.acceptedAt,
                status: item.status,
                user: {
                  id: item.user.id,
                  name: `${item.user.firstName} ${item.user.lastName}`,
                  avatar: item.user.profilePicture,
                  rating: item.user.rating ?? 0,
                  rate: item.user.rate ?? "$0/hr",
                  description: item.user.description ?? "No description provided",
                  availability: item.user.availability ?? "Not specified",
                  phoneNumber: item.user.phoneNumber || item.user.phone,
                  email: item.user.email,
                },
              }))
          : [];

        setAcceptedUsers(accepted);
        
        // Update counts
        const verified = accepted.filter(user => user.isVerified).length;
        if (onCountUpdate) {
          onCountUpdate(0, accepted.length, verified);
        }
      } catch (error) {
        console.error("Error fetching accepted users:", error);
        setAcceptedUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAcceptedUsers();
  }, [jobId]);

  const handleVerifyCode = async (code: string) => {
    if (!selectedUser) return;
    
    try {
      setVerifying(true);
      // TODO: Implement actual verification API call
      // const response = await verifyUserCode(selectedUser._id, code);
      
      // Simulate verification for now
      setTimeout(() => {
        Toast.show({
          type: "success",
          text1: "Verification Successful",
          text2: `${selectedUser.user.name} has been verified.`,
        });
        setSelectedUser(null);
        setVerificationCode('');
        setVerifying(false);
      }, 1000);
    } catch (error) {
      console.error("Error verifying code:", error);
      Toast.show({
        type: "error",
        text1: "Verification Failed",
        text2: "Invalid verification code. Please try again.",
      });
      setVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (!selectedUser) return;
    
    try {
      // TODO: Implement actual resend code API call
      // const response = await resendVerificationCode(selectedUser._id);
      
      Toast.show({
        type: "success",
        text1: "Code Sent",
        text2: "A new verification code has been sent.",
      });
    } catch (error) {
      console.error("Error resending code:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to resend code. Please try again.",
      });
    }
  };

  const handleUserSelect = (user: any) => {
    setSelectedUser(user);
  };

  const renderAcceptedUser = ({ item }) => (
    <AcceptedUserCard 
      data={item} 
      onSelect={handleUserSelect}
      isSelected={selectedUser?._id === item._id}
    />
  );

  if (loading) {
    return (
      <View style={styles.tabContainer}>
        <ActivityIndicator size="large" style={{ marginTop: 20 }} />
      </View>
    );
  }

  const verifiedCount = acceptedUsers.filter(user => user.isVerified).length;

  return (
    <View style={styles.tabContainer}>
      {acceptedUsers.length === 0 ? (
        <Text style={{ textAlign: "center", marginTop: 20 }}>
          No accepted applicants yet
        </Text>
      ) : (
        <>
          <FlatList
            data={acceptedUsers}
            renderItem={renderAcceptedUser}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
          
          {/* Verification Code Section */}
          {selectedUser && (
            <VerificationCode
              userName={selectedUser.user.name}
              onVerify={handleVerifyCode}
              onResendCode={handleResendCode}
              loading={verifying}
            />
          )}
        </>
      )}
    </View>
  );
};

/* -------------------- Main Screen -------------------- */
const RequestVerification = () => {
  const layout = useWindowDimensions();
  const route = useRoute<any>();
  const { jobId } = route.params;

  const [index, onIndexChange] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [acceptedCount, setAcceptedCount] = useState(0);
  const [verifiedCount, setVerifiedCount] = useState(0);
  
  const [routes] = useState([
    { key: "requests", title: "Requests" },
    { key: "requestsVerify", title: "Accepted" },
  ]);

  const handleCountUpdate = (pending: number, accepted: number, verified: number) => {
    setPendingCount(pending);
    setAcceptedCount(accepted);
    setVerifiedCount(verified);
  };

  const renderScene = ({ route }) => {
    switch (route.key) {
      case "requests":
        return <RequestsTab jobId={jobId} onCountUpdate={handleCountUpdate} />;
      case "requestsVerify":
        return <RequestsVerifyTab jobId={jobId} onCountUpdate={handleCountUpdate} />;
      default:
        return null;
    }
  };

  const renderTabBar = (
    props: SceneRendererProps & { navigationState: State }
  ) => {
    const inputRange = props.navigationState.routes.map((_, i) => i);

    const translateX = props.position.interpolate({
      inputRange,
      outputRange: inputRange.map(
        (i) => i * (layout.width / props.navigationState.routes.length)
      ),
    });

    return (
      <View style={styles.tabbar}>
        {props.navigationState.routes.map((route, i) => (
          <TouchableOpacity
            key={route.key}
            onPress={() => props.jumpTo(route.key)}
            style={styles.tab}
          >
            <Text
              style={[
                styles.label,
                index === i ? styles.active : styles.inactive,
              ]}
            >
              {route.title} {route.key === 'requests' ? `(${pendingCount})` : `(${acceptedCount})`}
            </Text>
          </TouchableOpacity>
        ))}
        
        {/* Verification Status Indicator */}
        {index === 1 && verifiedCount > 0 && (
          <View style={styles.verificationStatus}>
            <Text style={styles.verificationStatusText}>
              {verifiedCount} out of {acceptedCount} Verified
            </Text>
          </View>
        )}
        
        <Animated.View
          style={[
            styles.underline,
            {
              width: layout.width / 2,
              transform: [{ translateX }],
            },
          ]}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header showBackButton={true} />
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        renderTabBar={renderTabBar}
        onIndexChange={onIndexChange}
        initialLayout={{ width: layout.width }}
      />
    </View>
  );
};

export default RequestVerification;