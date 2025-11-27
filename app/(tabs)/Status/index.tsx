import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableWithoutFeedback,
  Dimensions,
  ActivityIndicator,
  Animated,
  RefreshControl,
  AppState,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  TabView,
  SceneMap,
  SceneRendererProps,
  NavigationState,
} from "react-native-tab-view";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../../constants/Colors";
import JobCard from "../../../components/jobCard";
import StatusFilter from "../../../components/statusFilter";
import PaymentModal from "../../../components/paymentModal";
import {
  deleteJobPosting,
  getAppliedJobsByUserId,
  getJobPostingsByUserId,
  withdrawApplication,
} from "../../../services/api";
import { getUserData } from "../../../utilities/asyncStore";
import { JobPost } from "../../../types";
import { getJobStatusInfo, getApplicationStatusInfo, JOB_STATUSES, APPLICATION_STATUSES } from "../../../utilities/statusUtils";
import styles from "./styles";
import Toast from "react-native-toast-message";

type Route = {
  key: string;
  title: string;
};

type State = NavigationState<Route>;

const MyPostTab = () => {
  const navigation = useNavigation<any>();
  const [posts, setPosts] = useState<JobPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<JobPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [selectedJobForPayment, setSelectedJobForPayment] = useState<JobPost | null>(null);

  const handleNext = (jobId: string) => {
    navigation.navigate("RequestVerification", { jobId: jobId });
  };

  const handlePayment = (job: JobPost) => {
    console.log("Opening payment modal for job:", job._id);
    setSelectedJobForPayment(job);
    setPaymentModalVisible(true);
  };

  const handlePaymentSuccess = () => {
    // Refresh the posts list after successful payment
    fetchPosts();
    Toast.show({
      type: "success",
      text1: "Payment Successful",
      text2: "The payment has been processed successfully",
    });
  };

  const handleDelete = async (jobId: string) => {
    try {
      const res = await deleteJobPosting(jobId);

      if (res?.data.success) {
        fetchPosts();

        Toast.show({
          type: "success",
          text1: "Deleted",
          text2: "Job post deleted successfully",
        });
      }
    } catch (error: any) {
      console.error("Delete failed:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.response?.data?.message || "Failed to delete job",
      });
    }
  };

  const fetchPosts = async (isRefresh = false, loadMore = false) => {
    try {
      if (!isRefresh && !loadMore) setLoading(true);
      if (loadMore) setLoadingMore(true);

      const user = await getUserData();
      if (!user?.id) {
        console.error("No user ID found");
        setPosts([]);
        return;
      }

      const currentPage = isRefresh ? 1 : (loadMore ? page : 1);
      const res = await getJobPostingsByUserId(user.id, currentPage, 10);
      const postsData = res.data || [];
      const hasMoreData = res.hasMore || false;

      if (isRefresh) {
        setPosts(postsData);
        setFilteredPosts(postsData);
        setPage(2);
        setHasMore(hasMoreData);
      } else if (loadMore) {
        setPosts(prev => [...prev, ...postsData]);
        setFilteredPosts(prev => [...prev, ...postsData]);
        setPage(prev => prev + 1);
        setHasMore(hasMoreData);
      } else {
        setPosts(postsData);
        setFilteredPosts(postsData);
        setPage(2);
        setHasMore(hasMoreData);
      }
    } catch (error) {
      console.error("Error fetching job postings", error);
      if (!loadMore) setPosts([]);
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else if (loadMore) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchPosts(false, true);
    }
  };

  // Filter posts based on selected status
  React.useEffect(() => {
    if (selectedStatus === null) {
      setFilteredPosts(posts);
    } else {
      const filtered = posts.filter(post => {
        const statusInfo = getJobStatusInfo(post.jobStatus || 'posted');
        return statusInfo.label === selectedStatus;
      });
      setFilteredPosts(filtered);
    }
  }, [selectedStatus, posts]);

  useFocusEffect(
    React.useCallback(() => {
      setPage(1);
      setHasMore(true);
      fetchPosts();
    }, [])
  );

  // Add refresh on app state change (when app comes to foreground)
  React.useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active') {
        fetchPosts(true); // Refresh when app becomes active
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, []);

  // Add periodic refresh every 30 seconds when component is focused
  React.useEffect(() => {
    const interval = setInterval(() => {
      fetchPosts(true); // Silent refresh every 30 seconds
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Reset pagination when status filter changes
  React.useEffect(() => {
    setPage(1);
    setHasMore(true);
  }, [selectedStatus]);

  if (loading) {
    return (
      <View style={{ justifyContent: "center", alignItems: "center", flex: 1 }}>
        <ActivityIndicator size="large" color={Colors.grey} />
      </View>
    );
  }

  // Get available statuses for filtering
  const availableStatuses = [
    getJobStatusInfo(JOB_STATUSES.POSTED),
    getJobStatusInfo(JOB_STATUSES.FILLED),
    getJobStatusInfo(JOB_STATUSES.IN_PROGRESS),
    getJobStatusInfo(JOB_STATUSES.WORK_COMPLETED),
    getJobStatusInfo(JOB_STATUSES.COMPLETED),
    getJobStatusInfo(JOB_STATUSES.CANCELLED),
  ];

  const renderItem = ({ item }: { item: JobPost }) => (
    <JobCard
      key={item._id}
      data={item}
      onPress={() => handleNext(item._id)}
      onDelete={() => handleDelete(item._id)}
      onPayment={() => handlePayment(item)}
      isEmployer={true}
      showPaymentButton={true}
    />
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={{ padding: 20, alignItems: 'center' }}>
        <ActivityIndicator size="small" color={Colors.grey} />
      </View>
    );
  };

  const renderEmpty = () => (
    <View
      style={{
        justifyContent: "center",
        alignItems: "center",
        flex: 1,
        padding: 20,
        minHeight: 400,
      }}
    >
      <Ionicons name="document-outline" size={64} color={Colors.grey} />
      <Text style={{ fontSize: 18, color: Colors.grey, marginTop: 16 }}>
        {selectedStatus ? `No ${selectedStatus.toLowerCase()} jobs` : 'No job posts yet'}
      </Text>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      {posts.length > 0 && (
        <StatusFilter
          statuses={availableStatuses}
          selectedStatus={selectedStatus}
          onStatusSelect={setSelectedStatus}
          showAll={true}
        />
      )}
      <FlatList
        data={filteredPosts}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchPosts(true);
            }}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        contentContainerStyle={filteredPosts.length === 0 ? { flexGrow: 1 } : undefined}
      />
      {selectedJobForPayment && (
        <PaymentModal
          visible={paymentModalVisible}
          onClose={() => setPaymentModalVisible(false)}
          jobId={selectedJobForPayment._id}
          jobName={selectedJobForPayment.name}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </View>
  );
};

const AppliedTab = () => {
  const navigation = useNavigation<any>();
  const [appliedJobs, setAppliedJobs] = React.useState<any[]>([]);
  const [filteredJobs, setFilteredJobs] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(true);
  const [selectedStatus, setSelectedStatus] = React.useState<string | null>(null);

  const handleNext = (job: any) => {
    if (job && job._id) {
      navigation.navigate("JobDetails", { jobId: job._id, jobData: job });
    }
  };

  const handleWithdraw = async (applicationId: string, jobId: string) => {
    try {
      console.log("Withdrawing application - jobId:", jobId, "applicationId:", applicationId);

      // Immediately remove from UI for better UX
      setAppliedJobs(prev => prev.filter(app => app.applicationId !== applicationId));

      // Use jobId for withdrawal, not applicationId
      await withdrawApplication(jobId);

      // Refresh the list to ensure consistency
      await fetchAppliedJobs(true);

      Toast.show({
        type: "success",
        text1: "Withdrawn",
        text2: "You have withdrawn your application successfully",
      });
    } catch (error) {
      console.error("Error withdrawing application:", error);
      console.error("Error details:", error.response?.data);

      // If withdrawal failed, refresh the list to restore the card
      await fetchAppliedJobs(true);

      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Could not withdraw application",
      });
    }
  };

  const fetchAppliedJobs = async (isRefresh = false, loadMore = false) => {
    try {
      if (!isRefresh && !loadMore) setLoading(true);
      if (loadMore) setLoadingMore(true);

      const user = await getUserData();
      if (!user?.id) {
        console.error("No user ID found");
        setAppliedJobs([]);
        return;
      }

      const currentPage = isRefresh ? 1 : (loadMore ? page : 1);
      const res = await getAppliedJobsByUserId(user.id, currentPage, 10);
      const hasMoreData = res.hasMore || false;

      const allApplications = res.data || [];

      // Filter out applications with null or incomplete job data and withdrawn applications
      const validApplications = allApplications.filter(
        (application: any) =>
          application &&
          application.job &&
          application.job._id &&
          application.applicationId &&
          application.status !== 'withdrawn'
      );

      if (isRefresh) {
        setAppliedJobs(validApplications);
        setFilteredJobs(validApplications);
        setPage(2);
        setHasMore(hasMoreData);
      } else if (loadMore) {
        setAppliedJobs(prev => [...prev, ...validApplications]);
        setFilteredJobs(prev => [...prev, ...validApplications]);
        setPage(prev => prev + 1);
        setHasMore(hasMoreData);
      } else {
        setAppliedJobs(validApplications);
        setFilteredJobs(validApplications);
        setPage(2);
        setHasMore(hasMoreData);
      }
    } catch (error) {
      console.error("Error fetching applied jobs", error);
      if (!loadMore) setAppliedJobs([]);
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else if (loadMore) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchAppliedJobs(false, true);
    }
  };

  // Filter applied jobs based on selected status
  React.useEffect(() => {
    if (selectedStatus === null) {
      setFilteredJobs(appliedJobs);
    } else {
      const filtered = appliedJobs.filter(application => {
        const statusInfo = getApplicationStatusInfo(application.status);
        return statusInfo.label === selectedStatus;
      });
      setFilteredJobs(filtered);
    }
  }, [selectedStatus, appliedJobs]);

  useFocusEffect(
    React.useCallback(() => {
      setPage(1);
      setHasMore(true);
      fetchAppliedJobs();
    }, [])
  );

  // Add refresh on app state change (when app comes to foreground)
  React.useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active') {
        fetchAppliedJobs(true); // Refresh when app becomes active
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, []);

  // Add periodic refresh every 30 seconds when component is focused
  React.useEffect(() => {
    const interval = setInterval(() => {
      fetchAppliedJobs(true); // Silent refresh every 30 seconds
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Reset pagination when status filter changes
  React.useEffect(() => {
    setPage(1);
    setHasMore(true);
  }, [selectedStatus]);

  if (loading) {
    return (
      <View style={{ justifyContent: "center", alignItems: "center", flex: 1 }}>
        <ActivityIndicator size="large" color={Colors.grey} />
      </View>
    );
  }

  // Get available application statuses for filtering
  const availableStatuses = [
    getApplicationStatusInfo(APPLICATION_STATUSES.APPLIED),
    getApplicationStatusInfo(APPLICATION_STATUSES.ACCEPTED),
    getApplicationStatusInfo(APPLICATION_STATUSES.REJECTED),
    getApplicationStatusInfo(APPLICATION_STATUSES.WITHDRAWN),
  ];

  const renderItem = ({ item }: { item: any }) => {
    if (!item || !item.job || !item.applicationId) {
      return null;
    }

    return (
      <JobCard
        key={item.applicationId}
        data={{
          ...item.job,
          status: item.job.jobStatus || "posted"
        }}
        onPress={() => handleNext(item.job)}
        withdraw={true}
        onWithdraw={() =>
          handleWithdraw(item.applicationId, item.job._id)
        }
        isEmployer={false}
        applicationStatus={item.status}
      />
    );
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={{ padding: 20, alignItems: 'center' }}>
        <ActivityIndicator size="small" color={Colors.grey} />
      </View>
    );
  };

  const renderEmpty = () => (
    <View
      style={{
        justifyContent: "center",
        alignItems: "center",
        flex: 1,
        padding: 20,
        minHeight: 400,
      }}
    >
      <Ionicons name="document-outline" size={64} color={Colors.grey} />
      <Text style={{ fontSize: 18, color: Colors.grey, marginTop: 16 }}>
        {selectedStatus ? `No ${selectedStatus.toLowerCase()} applications` : 'No applied jobs yet'}
      </Text>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      {appliedJobs.length > 0 && (
        <StatusFilter
          statuses={availableStatuses}
          selectedStatus={selectedStatus}
          onStatusSelect={setSelectedStatus}
          showAll={true}
        />
      )}
      <FlatList
        data={filteredJobs}
        renderItem={renderItem}
        keyExtractor={(item) => item.applicationId}
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchAppliedJobs(true);
            }}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        contentContainerStyle={filteredJobs.length === 0 ? { flexGrow: 1 } : undefined}
      />
    </View>
  );
};

const Status = () => {
  const layout = Dimensions.get("window");
  const [index, onIndexChange] = useState(0);
  const [routes] = useState<Route[]>([
    { key: "myPost", title: "My post" },
    { key: "applied", title: "Applied" },
  ]);

  const renderScene = SceneMap({
    myPost: MyPostTab,
    applied: AppliedTab,
  });

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
          <TouchableWithoutFeedback
            key={route.key}
            onPress={() => props.jumpTo(route.key)}
          >
            <View style={styles.tab}>
              <Text
                style={[
                  styles.label,
                  index === i ? styles.active : styles.inactive,
                ]}
              >
                {route.title}
              </Text>
            </View>
          </TouchableWithoutFeedback>
        ))}
        <Animated.View
          style={[
            styles.underline,
            {
              width: layout.width / 2.68,
              transform: [{ translateX }],
            },
          ]}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        renderTabBar={renderTabBar}
        onIndexChange={onIndexChange}
        initialLayout={{ width: layout.width }}
      />
    </SafeAreaView>
  );
};

export default Status;