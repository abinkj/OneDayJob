import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
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
  TabBar,
  SceneRendererProps,
  NavigationState,
} from "react-native-tab-view";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../../constants/Colors";
import JobCard from "../../../components/jobCard";
import {
  getAppliedJobsByUserId,
  getJobPostingsByUserId,
} from "../../../services/api";
import { getUserData } from "../../../utilities/asyncStore";
import { JobPost } from "../../../types";
import  styles  from "./styles";

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

  const handleNext = () => {
    navigation.navigate("RequestVerification");
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const user = await getUserData(); // Assuming it returns { id: '...' }
      if (!user?.id) {
        console.error("No user ID found");
        setPosts([]);
        return;
      }
      const res = await getJobPostingsByUserId(user.id);
      setPosts(res.data || []); // if API returns array
    } catch (error) {
      console.error("Error fetching job postings", error);
      setPosts([]);
    } finally {
      setLoading(false);
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
      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
          flex: 1,
          padding: 20,
        }}
      >
        <Ionicons name="document-outline" size={64} color={Colors.grey} />
        <Text
          style={{
            fontSize: 18,
            color: Colors.grey,
            marginTop: 16,
            textAlign: "center",
          }}
        >
          No job posts yet
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: Colors.grey,
            marginTop: 8,
            textAlign: "center",
          }}
        >
          Create your first job post to get started
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={false} onRefresh={() => {}} />
      }
    >
      {posts.map((post) => (
        <JobCard key={post._id} data={post} onPress={handleNext} />
      ))}
    </ScrollView>
  );
};

const AppliedTab = () => {
  const navigation = useNavigation<any>();
  const [appliedJobs, setAppliedJobs] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);

  const handleNext = () => {
    navigation.navigate("RequestVerification");
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
          onPress={handleNext}
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
