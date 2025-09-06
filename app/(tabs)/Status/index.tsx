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
import {
  deleteJobPosting,
  getAppliedJobsByUserId,
  getJobPostingsByUserId,
  withdrawApplication,
} from "../../../services/api";
import { getUserData } from "../../../utilities/asyncStore";
import { JobPost } from "../../../types";
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
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = React.useState(false);

  const handleNext = (jobId: string) => {
    navigation.navigate("RequestVerification", { jobId: jobId });
  };

  const handleDelete = async (jobId: string) => {
    try {
      const res = await deleteJobPosting(jobId); // make sure you're importing the frontend API fn

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
      setPosts(res.data || []);
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

  useFocusEffect(
    React.useCallback(() => {
      fetchPosts();
    }, [])
  );

  if (loading) {
    return (
      <View style={{ justifyContent: "center", alignItems: "center", flex: 1 }}>
        <ActivityIndicator size="large" color={Colors.grey} />
      </View>
    );
  }

  if (posts.length === 0) {
    return (
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.contentContainer}
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
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            flex: 1,
            padding: 20,
          }}
        >
          <Ionicons name="document-outline" size={64} color={Colors.grey} />
          <Text style={{ fontSize: 18, color: Colors.grey, marginTop: 16 }}>
            No job posts yet
          </Text>
        </View>
      </ScrollView>
    );
  }

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
      {posts.map((post) => (
        <JobCard
          key={post._id}
          data={post}
          onPress={() => handleNext(post._id)}
          onDelete={() => handleDelete(post._id)}
        />
      ))}
    </ScrollView>
  );
};

const AppliedTab = () => {
  const navigation = useNavigation<any>();
  const [appliedJobs, setAppliedJobs] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);

  const handleNext = (job: any) => {
    navigation.navigate("JobDetails", { jobId: job.id, jobData: job });
  };

  const handleWithdraw = async (job: any) => {
    try {
      await withdrawApplication(job._id);
      fetchAppliedJobs(true);
      Toast.show({
        type: "success",
        text1: "Withdrawn",
        text2: "You have withdrawn your application successfully",
      });
    } catch (error) {
      console.error("Error withdrawing application:", error);

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
      setAppliedJobs(res.data || []);
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

  useFocusEffect(
    React.useCallback(() => {
      fetchAppliedJobs();
    }, [])
  );

  if (loading) {
    return (
      <View style={{ justifyContent: "center", alignItems: "center", flex: 1 }}>
        <ActivityIndicator size="large" color={Colors.grey} />
      </View>
    );
  }

  if (appliedJobs.length === 0) {
    return (
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.contentContainer}
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
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            flex: 1,
            padding: 20,
          }}
        >
          <Ionicons name="document-outline" size={64} color={Colors.grey} />
          <Text style={{ fontSize: 18, color: Colors.grey, marginTop: 16 }}>
            No applied jobs yet
          </Text>
        </View>
      </ScrollView>
    );
  }

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
      {appliedJobs.map((application) => (
        <JobCard
          key={application.applicationId}
          data={{ ...application.job, status: "applied" }}
          onPress={() => {
            handleNext(application.job);
          }}
          withdraw={true}
          onWithdraw={() => {
            handleWithdraw(application.job);
          }}
        />
      ))}
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
