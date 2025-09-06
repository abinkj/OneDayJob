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
} from "react-native";
import {
  TabView,
  SceneRendererProps,
  NavigationState,
} from "react-native-tab-view";
import { useNavigation, useRoute } from "@react-navigation/native";
import styles from "./styles";
import { Header } from "../../../components/header";
import ratingStars from "../../../components/ratingStars";
import { getAppliedUser, selectApplicants } from "../../../services/api";
import Toast from "react-native-toast-message";

type Route = {
  key: string;
  title: string;
};
type State = NavigationState<Route>;

/* -------------------- Request Card -------------------- */
const RequestCard = ({ data, isSelected, onSelect }) => {
  const user = data.user || {};
  console.log("Rendering RequestCard for user:", user);
  const navigation = useNavigation();

  const handleProfilePress = (userId: string) => {
    navigation.navigate("RequestProfile", { userId });
  };

  return (
    <TouchableOpacity
      style={[styles.requestCard, isSelected && styles.selectedCard]}
      onPress={() => onSelect(user.id)} /* ✅ pass user.id, not data._id */
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

      {isSelected && (
        <View style={styles.checkboxContainer}>
          <View style={styles.checkbox}>
            <Text style={styles.checkboxText}>✓</Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

/* -------------------- Requests Tab -------------------- */
const RequestsTab = ({ jobId }) => {
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [showMenu, setShowMenu] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const filters = ["All", "Highly rated", "Budget Friendly"];

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const response = await getAppliedUser(jobId);

        // ✅ keep full application objects, not just users
        const appliedUsers = Array.isArray(response?.data)
          ? response.data.map((item) => ({
              _id: item._id, // application id
              appliedAt: item.appliedAt,
              status: item.status,
              user: {
                id: item.user.id,
                name: `${item.user.firstName} ${item.user.lastName}`,
                avatar: item.user.profilePicture,
                rating: item.user.rating ?? 0,
                rate: item.user.rate ?? "$0/hr",
                description: item.user.description ?? "No description provided",
                availability: item.user.availability ?? "Not specified",
              },
            }))
          : [];

        setRequests(appliedUsers);
      } catch (error) {
        console.error("Error fetching applied users:", error);
        setRequests([]); // fallback
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, [jobId]);

  const getFilteredRequests = () => {
    if (!Array.isArray(requests)) return [];
    if (selectedFilter === "All") return requests;

    if (selectedFilter === "Highly rated") {
      return requests.filter((req) => req.user?.rating >= 4.5);
    }
    if (selectedFilter === "Budget Friendly") {
      return requests.filter((req) => req.user?.rate && req.user.rate < 50);
    }

    return requests;
  };

  const handleSelectRequest = (userId: string) => {
    console.log("Toggling selection for user ID:", userId);
    setSelectedRequests((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
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
      console.log("Select applicants response:", response);
      if (response.success) {
        Toast.show({
          type: "success",
          text1: "Applicants Selected",
          text2: "You have successfully selected applicants.",
        });

        // ✅ clear selection
        setSelectedRequests([]);

        // ✅ refresh the applicants list
        const refreshed = await getAppliedUser(jobId);
        const appliedUsers = Array.isArray(refreshed?.data)
          ? refreshed.data.map((item) => ({
              _id: item._id,
              appliedAt: item.appliedAt,
              status: item.status,
              user: {
                id: item.user.id,
                name: `${item.user.firstName} ${item.user.lastName}`,
                avatar: item.user.profilePicture,
                rating: item.user.rating ?? 0,
                rate: item.user.rate ?? "$0/hr",
                description: item.user.description ?? "No description provided",
                availability: item.user.availability ?? "Not specified",
              },
            }))
          : [];
        setRequests(appliedUsers);
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

  const handleRejectSelected = () => {
    console.log("Reject selected:", selectedRequests);
    setSelectedRequests([]);
  };

  const renderRequest = ({ item }) => (
    <RequestCard
      data={item}
      isSelected={selectedRequests.includes(item.user.id)} // ✅ check against user.id
      onSelect={handleSelectRequest}
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
              No applicants found
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

/* -------------------- Verify Tab -------------------- */
const RequestsVerifyTab = ({ onShowToast }) => {
  return (
    <View style={styles.tabContainer}>
      <Text>Accepted applicants will show here</Text>
    </View>
  );
};

/* -------------------- Main Screen -------------------- */
const RequestVerification = () => {
  const layout = useWindowDimensions();
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { jobId } = route.params;

  const [index, onIndexChange] = useState(0);
  const [routes] = useState([
    { key: "requests", title: "Requests" },
    { key: "requestsVerify", title: "Accepted" },
  ]);

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");

  const showToast = (message, type = "success") => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  const hideToast = () => setToastVisible(false);

  const renderScene = ({ route }) => {
    switch (route.key) {
      case "requests":
        return <RequestsTab jobId={jobId} />;
      case "requestsVerify":
        return <RequestsVerifyTab onShowToast={showToast} />;
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
              {route.title}
            </Text>
          </TouchableOpacity>
        ))}
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
