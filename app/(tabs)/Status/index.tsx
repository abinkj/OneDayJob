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
  DeviceEventEmitter,
  TouchableOpacity,
} from "react-native";
import {
  TabView,
  SceneMap,
  SceneRendererProps,
  NavigationState,
} from "react-native-tab-view";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
// import { Colors } from "../../../constants/Colors";
import JobCard from "../../../components/jobCard";
import StatusFilter from "../../../components/statusFilter";
import { JobCardSkeleton } from "../../../components/Shimmer/Skeletons";
// import PaymentModal from "../../../components/paymentModal";
import {
  useUserJobPostings,
  useUserAppliedJobs,
  useDeleteJob,
  useWithdrawApplication,
} from "../../../hooks/useJobs";
import { useSelector } from "react-redux";
import { JobPost } from "../../../types";
import {
  getJobStatusInfo,
  getApplicationStatusInfo,
  getDisplayStatus,
  JOB_STATUSES,
  APPLICATION_STATUSES,
} from "../../../utilities/statusUtils";
import { createStyles } from "./styles";
import { useTheme } from "../../../contexts/ThemeContext";
import Toast from "react-native-toast-message";
import { isJobOwner, isAssignedWorker, isJobToday, isJobLiveOrDueToday, formatJobDate } from "../../../utilities/jobUtils";
import { fontSizes } from "../../../themes/fonts";

type Route = {
  key: string;
  title: string;
};

type State = NavigationState<Route>;

const MyPostTab = () => {
  const { colors } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
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
    isFetching,
  } = useUserJobPostings(userId);

  const deleteJobMutation = useDeleteJob();

  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  // const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  // const [selectedJobForPayment, setSelectedJobForPayment] = useState<JobPost | null>(null);

  // Flatten data
  const posts = React.useMemo(() => {
    return data?.pages.flatMap((page) => page.data) || [];
  }, [data]);

  const [filteredPosts, setFilteredPosts] = useState<JobPost[]>([]);
  const flatListRef = React.useRef<FlatList<JobPost>>(null);

  React.useEffect(() => {
    const subscription = DeviceEventEmitter.addListener("scrollToTop_Status", () => {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    });
    return () => {
      subscription.remove();
    };
  }, []);

  const handleNext = (jobId: string) => {
    navigation.navigate("RequestVerification", { jobId: jobId });
  };

  // const handlePayment = (job: JobPost) => {
  //   console.log("Opening payment modal for job:", job._id);
  //   setSelectedJobForPayment(job);
  //   setPaymentModalVisible(true);
  // };

  // const handlePaymentSuccess = () => {
  //   // Refresh the posts list after successful payment
  //   refetch();
  //   Toast.show({
  //     type: "success",
  //     text1: "Payment Successful",
  //     text2: "The payment has been processed successfully",
  //   });
  // };

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

  const handleSummary = (jobId: string, jobName: string) => {
    navigation.navigate("JobTimer", {
      jobId,
      jobName,
      isEmployer: true,
    });
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
      const filtered = posts.filter((post) => {
        const statusInfo = getJobStatusInfo(post.jobStatus || "posted");
        return statusInfo.label === selectedStatus;
      });
      setFilteredPosts(filtered);
    }
  }, [selectedStatus, posts]);

  // Find active jobs for employer highlight
  const activeEmployerJobs = React.useMemo(() => {
    return posts.filter(post => post.jobStatus === 'in_progress' || (post.onDate === 'today' && post.jobStatus === 'open' && (post.applicantCount || 0) > 0));
  }, [posts]);

  if (isLoading && !isRefetching && posts.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <JobCardSkeleton />
        <JobCardSkeleton />
        <JobCardSkeleton />
      </View>
    );
  }

  // Get available statuses for filtering
  // Get available statuses for filtering - SIMPLIFIED
  const availableStatuses = [
    getJobStatusInfo(JOB_STATUSES.POSTED),
    getJobStatusInfo(JOB_STATUSES.IN_PROGRESS),
    getJobStatusInfo(JOB_STATUSES.COMPLETED),
    getJobStatusInfo(JOB_STATUSES.CANCELLED),
  ];

  const renderItem = ({ item }: { item: JobPost }) => (
    <JobCard
      key={item._id}
      data={item}
      onPress={() => handleNext(item._id)}
      onDelete={() => handleDelete(item._id)}
      onSummary={() => handleSummary(item._id, item.name)}
      // onPayment={() => handlePayment(item)}
      isEmployer={true}
    // showPaymentButton={true}
    />
  );

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={{ padding: 20, alignItems: "center" }}>
        <ActivityIndicator size="small" color={colors.grey} />
      </View>
    );
  };

  const renderEmpty = () => {
    // Don't show empty state if currently fetching data
    if (isFetching || isLoading) return null;

    return (
      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
          flex: 1,
          padding: 20,
          minHeight: 400,
        }}
      >
        <Ionicons name="document-outline" size={64} color={colors.grey} />
        <Text style={{ fontSize: fontSizes.size18, fontFamily: "regular", color: colors.grey, marginTop: 16 }}>
          {selectedStatus
            ? `No ${selectedStatus.toLowerCase()} jobs`
            : "No job posts yet"}
        </Text>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {posts.length > 0 && (
        <StatusFilter
          statuses={availableStatuses}
          selectedStatus={selectedStatus}
          onStatusSelect={setSelectedStatus}
          showAll={true}
        />
      )}

      {/* Active Job Highlight for Employer */}
      {activeEmployerJobs.length > 0 && selectedStatus === null && (
        <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <View style={{ backgroundColor: '#F59E0B', width: 4, height: 16, borderRadius: 2 }} />
            <Text style={{ fontSize: fontSizes.size16, fontFamily: 'bold', color: colors.black, marginLeft: 8 }}>Live Now</Text>
          </View>
          {activeEmployerJobs.map(job => (
            <TouchableOpacity 
              key={job._id}
              style={{
                backgroundColor: colors.white,
                borderRadius: 14,
                padding: 14,
                marginBottom: 10,
                borderWidth: 1,
                borderColor: '#F59E0B' + '40',
                flexDirection: 'row',
                alignItems: 'center',
                shadowColor: '#F59E0B',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 3
              }}
              onPress={() => handleNext(job._id)}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: fontSizes.size15, fontFamily: 'bold', color: colors.black }} numberOfLines={1}>{job.name}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                  <Text style={{ fontSize: fontSizes.size13, color: '#F59E0B', fontFamily: 'medium' }}>
                    {job.jobStatus === 'in_progress' ? 'Running' : 'Ready to Start'}
                  </Text>
                  <Text style={{ fontSize: fontSizes.size13, color: colors.grey, fontFamily: 'regular' }}> • {job.applicantCount || 0} Workers</Text>
                </View>
              </View>
              <View style={{ backgroundColor: '#F59E0B', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 }}>
                <Text style={{ color: colors.white, fontFamily: 'bold', fontSize: fontSizes.size13 }}>Verify</Text>
              </View>
            </TouchableOpacity>
          ))}
          <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 10, opacity: 0.5 }} />
        </View>
      )}
      <FlatList
        ref={flatListRef}
        data={filteredPosts}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}

        contentContainerStyle={[
          styles.listContent,
          filteredPosts.length === 0 && { flexGrow: 1 }
        ]}
        showsVerticalScrollIndicator={false}
        bounces={false}
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

      />
      {/* {selectedJobForPayment && (
        <PaymentModal
          visible={paymentModalVisible}
          onClose={() => setPaymentModalVisible(false)}
          jobId={selectedJobForPayment._id}
          jobName={selectedJobForPayment.name}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )} */}
    </View>
  );
};

const AppliedTab = () => {
  const { colors } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
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
    isFetching,
  } = useUserAppliedJobs(userId);

  const withdrawMutation = useWithdrawApplication();

  const [selectedStatus, setSelectedStatus] = React.useState<string | null>(
    null
  );

  // Flatten data and filter valid applications
  const appliedJobs = React.useMemo(() => {
    const allApps = data?.pages.flatMap((page) => page.data) || [];
    return allApps.filter(
      (application: any) =>
        application &&
        application.job &&
        application.job._id &&
        application.applicationId &&
        application.status !== "withdrawn"
    );
  }, [data]);

  const [filteredJobs, setFilteredJobs] = React.useState<any[]>([]);
  const flatListRef = React.useRef<FlatList<any>>(null);

  React.useEffect(() => {
    const subscription = DeviceEventEmitter.addListener("scrollToTop_Status", () => {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    });
    return () => {
      subscription.remove();
    };
  }, []);

  const handleNext = (job: any) => {
    if (job && job._id) {
      navigation.navigate("JobDetails", { jobId: job._id, jobData: job });
    }
  };

  const handleWithdraw = async (applicationId: string, jobId: string) => {
    try {
      console.log(
        "Withdrawing application - jobId:",
        jobId,
        "applicationId:",
        applicationId
      );

      await withdrawMutation.mutateAsync(jobId);

      Toast.show({
        type: "success",
        text1: "Withdrawn",
        text2: "You have withdrawn your application successfully",
        visibilityTime: 2000,
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

  const handleSummary = (jobId: string, jobName: string) => {
    navigation.navigate("JobTimer", {
      jobId,
      jobName,
      isEmployer: false,
    });
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
      const filtered = appliedJobs.filter((application) => {
        const displayStatus = getDisplayStatus(
          application.job?.jobStatus,
          application.status,
          false
        );
        const statusInfo = getApplicationStatusInfo(displayStatus);
        return statusInfo.label === selectedStatus;
      });
      setFilteredJobs(filtered);
    }
  }, [selectedStatus, appliedJobs]);

  // Find active jobs for worker highlight
  const activeWorkerJobs = React.useMemo(() => {
    return appliedJobs.filter(app => {
      const job = app.job;
      if (!job) return false;
      const isAccepted = app.status === 'accepted';
      const isLive = job.jobStatus === 'in_progress';
      const isToday = job.onDate === 'today';
      return isLive || (isAccepted && isToday);
    });
  }, [appliedJobs]);

  if (isLoading && !isRefetching && appliedJobs.length === 0) {
    return (
      <View style={{ flex: 1 }}>
        <JobCardSkeleton />
        <JobCardSkeleton />
        <JobCardSkeleton />
      </View>
    );
  }

  // Get available application statuses for filtering
  // Get available application statuses for filtering - SIMPLIFIED
  const availableStatuses = [
    getApplicationStatusInfo(APPLICATION_STATUSES.APPLIED),
    getApplicationStatusInfo(APPLICATION_STATUSES.ACCEPTED),
    getApplicationStatusInfo(APPLICATION_STATUSES.REJECTED),
    getJobStatusInfo(JOB_STATUSES.COMPLETED),
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
          status: item.job.jobStatus || "posted",
        }}
        onPress={() => handleNext(item.job)}
        withdraw={true}
        onWithdraw={() => handleWithdraw(item.applicationId, item.job._id)}
        onSummary={() => handleSummary(item.job._id, item.job.name)}
        isEmployer={false}
        applicationStatus={item.status}
      />
    );
  };

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={{ padding: 20, alignItems: "center" }}>
        <ActivityIndicator size="small" color={colors.grey} />
      </View>
    );
  };

  const renderEmpty = () => {
    // Don't show empty state if currently fetching data
    if (isFetching || isLoading) return null;

    return (
      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
          flex: 1,
          padding: 20,
          minHeight: 400,
        }}
      >
        <Ionicons name="document-outline" size={64} color={colors.grey} />
        <Text style={{ fontSize: fontSizes.size18, fontFamily: "regular", color: colors.grey, marginTop: 16 }}>
          {selectedStatus
            ? `No ${selectedStatus.toLowerCase()} applications`
            : "No applied jobs yet"}
        </Text>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {appliedJobs.length > 0 && (
        <StatusFilter
          statuses={availableStatuses}
          selectedStatus={selectedStatus}
          onStatusSelect={setSelectedStatus}
          showAll={true}
        />
      )}

      {/* Active Job Highlight for Worker */}
      {activeWorkerJobs.length > 0 && selectedStatus === null && (
        <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <View style={{ backgroundColor: colors.primary, width: 4, height: 16, borderRadius: 2 }} />
            <Text style={{ fontSize: fontSizes.size16, fontFamily: 'bold', color: colors.black, marginLeft: 8 }}>Live Now</Text>
          </View>
          {activeWorkerJobs.map(app => (
            <TouchableOpacity 
              key={app.applicationId}
              style={{
                backgroundColor: colors.white,
                borderRadius: 14,
                padding: 14,
                marginBottom: 10,
                borderWidth: 1,
                borderColor: colors.primary + '30',
                flexDirection: 'row',
                alignItems: 'center',
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 3
              }}
              onPress={() => app.job.jobStatus === 'in_progress' ? handleSummary(app.job._id, app.job.name) : handleNext(app.job)}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: fontSizes.size15, fontFamily: 'bold', color: colors.black }} numberOfLines={1}>{app.job.name}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                  <Text style={{ fontSize: fontSizes.size13, color: colors.primary, fontFamily: 'medium' }}>
                    {app.job.jobStatus === 'in_progress' ? 'Running' : 'Ready to Start'}
                  </Text>
                  <Text style={{ fontSize: fontSizes.size13, color: colors.grey, fontFamily: 'regular' }}> • {app.job.locationName || 'Location site'}</Text>
                </View>
              </View>
              <View style={{ backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 }}>
                <Text style={{ color: colors.white, fontFamily: 'bold', fontSize: fontSizes.size13 }}>
                  {app.job.jobStatus === 'in_progress' ? 'Timer' : 'Arrive'}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
          <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 10, opacity: 0.5 }} />
        </View>
      )}
      <FlatList
        ref={flatListRef}
        data={filteredJobs}
        renderItem={renderItem}

        keyExtractor={(item) => item.applicationId}
        contentContainerStyle={[
          styles.listContent,
          filteredJobs.length === 0 && { flexGrow: 1 }
        ]}
        showsVerticalScrollIndicator={false}
        bounces={false}
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

      />
    </View>
  );
};

const Status = () => {
  const { colors } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const layout = Dimensions.get("window");
  const [index, onIndexChange] = useState(0);
  const [routes] = useState<Route[]>([
    { key: "myPost", title: "My Jobs" },
    { key: "applied", title: "Applied Jobs" },
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
