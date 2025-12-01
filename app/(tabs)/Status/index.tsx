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
  useUserJobPostings,
  useUserAppliedJobs,
  useDeleteJob,
  useWithdrawApplication,
} from "../../../hooks/useJobs";
import { useSelector } from "react-redux";
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
  const userData = useSelector((state: any) => state.authentication.userData);
  const userId = userData?.id || userData?._id;

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
    isRefetching,
  } = useUserJobPostings(userId);

  const deleteJobMutation = useDeleteJob();

  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [selectedJobForPayment, setSelectedJobForPayment] = useState<JobPost | null>(null);

  // Flatten data
  const posts = React.useMemo(() => {
    return data?.pages.flatMap((page) => page.data) || [];
  }, [data]);

  const [filteredPosts, setFilteredPosts] = useState<JobPost[]>([]);

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
    refetch();
    Toast.show({
      type: "success",
      text1: "Payment Successful",
      text2: "The payment has been processed successfully",
    });
  };

  const handleDelete = async (jobId: string) => {
    try {
      await deleteJobMutation.mutateAsync(jobId);
      Toast.show({
        type: "success",
        text1: "Deleted",
        text2: "Job post deleted successfully",
      });
    } catch (error: any) {
      console.error("Delete failed:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.response?.data?.message || "Failed to delete job",
      });
    }
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
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

  // Add refresh on app state change (when app comes to foreground)
  React.useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active') {
        refetch(); // Refresh when app becomes active
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [refetch]);

  // Add periodic refresh every 30 seconds when component is focused
  React.useEffect(() => {
    const interval = setInterval(() => {
      // Only refetch if not already fetching to avoid conflicts
      if (!isLoading && !isRefetching && !isFetchingNextPage) {
        refetch(); 
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isLoading, isRefetching, isFetchingNextPage, refetch]);

  if (isLoading && !isRefetching && posts.length === 0) {
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
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
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
            refreshing={isRefetching}
            onRefresh={() => refetch()}
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
  const userData = useSelector((state: any) => state.authentication.userData);
  const userId = userData?.id || userData?._id;

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
    isRefetching,
  } = useUserAppliedJobs(userId);

  const withdrawMutation = useWithdrawApplication();

  const [selectedStatus, setSelectedStatus] = React.useState<string | null>(null);

  // Flatten data and filter valid applications
  const appliedJobs = React.useMemo(() => {
    const allApps = data?.pages.flatMap((page) => page.data) || [];
    return allApps.filter(
      (application: any) =>
        application &&
        application.job &&
        application.job._id &&
        application.applicationId &&
        application.status !== 'withdrawn'
    );
  }, [data]);

  const [filteredJobs, setFilteredJobs] = React.useState<any[]>([]);

  const handleNext = (job: any) => {
    if (job && job._id) {
      navigation.navigate("JobDetails", { jobId: job._id, jobData: job });
    }
  };

  const handleWithdraw = async (applicationId: string, jobId: string) => {
    try {
      console.log("Withdrawing application - jobId:", jobId, "applicationId:", applicationId);

      await withdrawMutation.mutateAsync(jobId);

      Toast.show({
        type: "success",
        text1: "Withdrawn",
        text2: "You have withdrawn your application successfully",
      });
    } catch (error: any) {
      console.error("Error withdrawing application:", error);
      console.error("Error details:", error.response?.data);

      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Could not withdraw application",
      });
    }
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
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

  // Add refresh on app state change (when app comes to foreground)
  React.useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active') {
        refetch(); // Refresh when app becomes active
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [refetch]);

  // Add periodic refresh every 30 seconds when component is focused
  React.useEffect(() => {
    const interval = setInterval(() => {
      if (!isLoading && !isRefetching && !isFetchingNextPage) {
        refetch();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isLoading, isRefetching, isFetchingNextPage, refetch]);

  if (isLoading && !isRefetching && appliedJobs.length === 0) {
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
            refreshing={isRefetching}
            onRefresh={() => refetch()}
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
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      renderTabBar={renderTabBar}
      onIndexChange={onIndexChange}
      initialLayout={{ width: layout.width }}
    />
  );
};

export default Status;