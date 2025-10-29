import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
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

  const fetchPosts = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      const user = await getUserData();
      if (!user?.id) {
        console.error("No user ID found");
        setPosts([]);
        return;
      }
      const res = await getJobPostingsByUserId(user.id);
      const postsData = res.data || [];
      setPosts(postsData);
      setFilteredPosts(postsData);
    } catch (error) {
      console.error("Error fetching job postings", error);
      setPosts([]);
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
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

  return (
    <ScrollView
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
    >
      {/* Always show status filter, even when there are no posts */}
      {posts.length > 0 && (
        <StatusFilter
          statuses={availableStatuses}
          selectedStatus={selectedStatus}
          onStatusSelect={setSelectedStatus}
          showAll={true}
        />
      )}
      
      {filteredPosts.length === 0 ? (
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            flex: 1,
            padding: 20,
            minHeight: 400, // Add minimum height to ensure proper centering
          }}
        >
          <Ionicons name="document-outline" size={64} color={Colors.grey} />
          <Text style={{ fontSize: 18, color: Colors.grey, marginTop: 16 }}>
            {selectedStatus ? `No ${selectedStatus.toLowerCase()} jobs` : 'No job posts yet'}
          </Text>
        </View>
      ) : (
        <>
          {filteredPosts.map((post) => (
            <JobCard
              key={post._id}
              data={post}
              onPress={() => handleNext(post._id)}
              onDelete={() => handleDelete(post._id)}
              onPayment={() => handlePayment(post)}
              isEmployer={true}
              showPaymentButton={true}
            />
          ))}
          {/* Payment Modal */}
          {selectedJobForPayment && (
            <PaymentModal
              visible={paymentModalVisible}
              onClose={() => setPaymentModalVisible(false)}
              jobId={selectedJobForPayment._id}
              jobName={selectedJobForPayment.name}
              onPaymentSuccess={handlePaymentSuccess}
            />
          )}
        </>
      )}
    </ScrollView>
  );
};

const AppliedTab = () => {
  const navigation = useNavigation<any>();
  const [appliedJobs, setAppliedJobs] = React.useState<any[]>([]);
  const [filteredJobs, setFilteredJobs] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
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

  const fetchAppliedJobs = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      const user = await getUserData();
      if (!user?.id) {
        console.error("No user ID found");
        setAppliedJobs([]);
        return;
      }
      const res = await getAppliedJobsByUserId(user.id);
      console.log("Applied jobs response:", JSON.stringify(res, null, 2));
      
      // Debug: Log all application statuses
      const allApplications = res.data || [];
      console.log("All application statuses:", allApplications.map(app => ({ 
        id: app.applicationId, 
        status: app.status,
        jobName: app.job?.name,
        appliedAt: app.appliedAt
      })));
      
      // Check if there are any withdrawn applications
      const withdrawnApps = allApplications.filter(app => app.status === 'withdrawn');
      if (withdrawnApps.length > 0) {
        console.log("Found withdrawn applications:", withdrawnApps);
      }
      
      // Filter out applications with null or incomplete job data and withdrawn applications
      const validApplications = allApplications.filter(
        (application: any) => 
          application && 
          application.job && 
          application.job._id && 
          application.applicationId &&
          application.status !== 'withdrawn' // Filter out withdrawn applications
      );
      
      console.log("Valid applications after filtering:", validApplications.length);
      console.log("Filtered out withdrawn applications:", allApplications.length - validApplications.length);
      setAppliedJobs(validApplications);
      setFilteredJobs(validApplications);
    } catch (error) {
      console.error("Error fetching applied jobs", error);
      setAppliedJobs([]);
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
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

  return (
    <ScrollView
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
    >
      {/* Always show status filter, even when there are no applied jobs */}
      {appliedJobs.length > 0 && (
        <StatusFilter
          statuses={availableStatuses}
          selectedStatus={selectedStatus}
          onStatusSelect={setSelectedStatus}
          showAll={true}
        />
      )}
      
      {filteredJobs.length === 0 ? (
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            flex: 1,
            padding: 20,
            minHeight: 400, // Add minimum height to ensure proper centering
          }}
        >
          <Ionicons name="document-outline" size={64} color={Colors.grey} />
          <Text style={{ fontSize: 18, color: Colors.grey, marginTop: 16 }}>
            {selectedStatus ? `No ${selectedStatus.toLowerCase()} applications` : 'No applied jobs yet'}
          </Text>
        </View>
      ) : (
        filteredJobs.map((application) => {
          // Additional safety check
          if (!application || !application.job || !application.applicationId) {
            return null;
          }

          return (
            <JobCard
              key={application.applicationId}
              data={{
                ...application.job,
                status: application.job.jobStatus || "posted"
              }}
              onPress={() => handleNext(application.job)}
              withdraw={true}
              onWithdraw={() => 
                handleWithdraw(application.applicationId, application.job._id)
              }
              isEmployer={false}
              applicationStatus={application.status}
            />
          );
        })
      )}
    </ScrollView>
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