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
} from "react-native";
import { TabView, SceneMap, TabBar, SceneRendererProps, NavigationState } from "react-native-tab-view";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../../constants/Colors";
import JobCard from "../../../components/jobCard";
import { getJobPostingsByUserId } from "../../../services/api";
import { getUserData } from "../../../utilities/asyncStore";
import { JobPost } from "../../../types";
import { styles } from "./styles";

type Route = {
  key: string;
  title: string;
};

type State = NavigationState<Route>;

const MyPostTab = () => {
  const navigation = useNavigation<any>();
  const [posts, setPosts] = useState<JobPost[]>([]);
  const [loading, setLoading] = useState(true);

  const handleNext = () => {
    navigation.navigate("RequestVerification");
  };

  React.useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const user = await getUserData(); // Assuming it returns { id: '...' }
        if (!user?.id) {
          console.error("No user ID found");
          setPosts([]);
          return;
        }
        console.log("Fetching posts for user ID:", user.id);
        const res = await getJobPostingsByUserId(user.id);
        console.log("Fetched posts:", res.data);
        setPosts(res.data || []); // if API returns array
      } catch (error) {
        console.error("Error fetching job postings", error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return (
      <View style={{ justifyContent: "center", alignItems: "center", flex: 1 }}>
       <ActivityIndicator size="large" color={Colors.grey} />
      </View>
    );
  }

  if (posts.length === 0) {
    return (
      <View style={{ justifyContent: "center", alignItems: "center", flex: 1, padding: 20 }}>
        <Ionicons name="document-outline" size={64} color={Colors.grey} />
        <Text style={{ fontSize: 18, color: Colors.grey, marginTop: 16, textAlign: 'center' }}>
          No job posts yet
        </Text>
        <Text style={{ fontSize: 14, color: Colors.grey, marginTop: 8, textAlign: 'center' }}>
          Create your first job post to get started
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
    >
      {posts.map((post) => (
        <JobCard key={post._id} data={post} onPress={handleNext} />
      ))}
    </ScrollView>
  );
};

const AppliedTab = () => {
  const navigation = useNavigation<any>();
  const handleNext = () => {
    console.log("Next button pressed");
    //navigation.navigate("RequestDetails"); this is not the correct go to reqVerification then req Detail
    navigation.navigate("RequestVerification");
  };
  
  // Mock data structure that matches JobCardData type
  const posts = [
    {
      _id: "2",
      name: "My house needs to be painted",
      budget: 500,
      applicantCount: 10,
      location: {
        address: "Downtown, New York",
        country: "United States"
      },
      createdAt: new Date().toISOString(),
      status: "active",
      category: {
        _id: "1",
        name: "Painting"
      },
      description: "House painting job in downtown area",
      isRemote: false,
      isFlexible: true,
      requirements: ["Paint brushes", "Ladders"],
      timePreference: ["morning", "afternoon"],
      userId: {
        firstName: "John",
        id: "user1",
        lastName: "Doe",
        phoneNumber: "+1234567890"
      }
    },
  ];

  return (
    <ScrollView
      style={styles.scrollContainer}
      scrollEnabled={true}
      showsVerticalScrollIndicator={false}
      bounces={false} // iOS only
    >
      {posts.map((post) => (
        <JobCard key={post._id} data={post} onPress={handleNext} />
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
