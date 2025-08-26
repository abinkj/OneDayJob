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
import Toast from "../../../components/toast";
import { getAppliedUser } from "../../../services/api";

type Route = {
  key: string;
  title: string;
};
type State = NavigationState<Route>;

/* -------------------- Request Card -------------------- */
const RequestCard = ({ data, isSelected, onSelect }) => {
  return (
    <TouchableOpacity
      style={[styles.requestCard, isSelected && styles.selectedCard]}
      onPress={() => onSelect(data._id)}
    >
      <View style={styles.requestHeader}>
        <View style={styles.profileSection}>
          <Image
            source={{ uri: data.avatar || "https://via.placeholder.com/40" }}
            style={styles.profileImage}
          />
          <TouchableOpacity style={styles.profileInfo}>
            <Text style={styles.profileName}>{data.name}</Text>
            <View style={styles.ratingContainer}>
              {ratingStars(data.rating)}
              <Text style={styles.ratingText}>({data.rating})</Text>
            </View>
          </TouchableOpacity>
        </View>
        <Text style={styles.rate}>{data.rate}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.available}>Applied On:</Text>
        <Text style={styles.available}>{data.appliedOn}</Text>
      </View>

      <Text style={styles.requestDescription}>{data.description}</Text>

      <View style={styles.requestDetails}>
        <Text style={styles.detailText}>Available</Text>
        <Text style={styles.detailValue}>{data.availability}</Text>
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
        console.log("resultttt------>", response)

        // ✅ normalize API response into array
        const applied = Array.isArray(response)
          ? response
          : response?.requests || [];

        setRequests(applied);
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

    // Example filter logic (adjust according to your API)
    if (selectedFilter === "Highly rated") {
      return requests.filter((req) => req.rating >= 4.5);
    }
    if (selectedFilter === "Budget Friendly") {
      return requests.filter((req) => req.rate && req.rate < 50);
    }

    return requests;
  };

  const handleSelectRequest = (requestId: string) => {
    setSelectedRequests((prev) =>
      prev.includes(requestId)
        ? prev.filter((id) => id !== requestId)
        : [...prev, requestId]
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

  const handleAcceptSelected = () => {
    console.log("Accept selected:", selectedRequests);
    setSelectedRequests([]);
  };

  const handleRejectSelected = () => {
    console.log("Reject selected:", selectedRequests);
    setSelectedRequests([]);
  };

  const renderRequest = ({ item }) => (
    <RequestCard
      data={item}
      isSelected={selectedRequests.includes(item._id)}
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

      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onHide={hideToast}
        duration={3000}
      />
    </View>
  );
};

export default RequestVerification;
