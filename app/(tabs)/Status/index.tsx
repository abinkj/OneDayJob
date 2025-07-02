import React, { useState } from "react";
import {
  View,
  Text,
  TouchableWithoutFeedback,
  useWindowDimensions,
  Animated,
  ScrollView,
} from "react-native";
import {
  TabView,
  SceneMap,
  SceneRendererProps,
  NavigationState,
} from "react-native-tab-view";
import JobCard from "../../../components/jobCard";
import { styles } from "./styles";
import { useNavigation } from "@react-navigation/native";

type Route = {
  key: string;
  title: string;
};

type State = NavigationState<Route>;

const MyPostTab = () => {
  const navigation = useNavigation();
  const handleNext = () => {
    console.log("Next button pressed");
    navigation.navigate("RequestDetails");
  };
  const posts = [
    {
      id: "1",
      title: "Need a painter to paint a 2-bedroom apartment. Contact ASAP!",
      rate: "₹500/hr",
      applicants: "0/1",
      location: "Downtown, New York",
      date: "Monday, Mar, 31",
      requests: 10,
    },
    {
      id: "2",
      title: "My house needs to be painted",
      rate: "₹500/hr",
      applicants: "0/1",
      location: "Downtown, New York",
      date: "Monday, Mar, 31",
      requests: 10,
    },
    {
      id: "3",
      title: "My house needs to be painted",
      rate: "₹500/hr",
      applicants: "0/1",
      location: "Downtown, New York",
      date: "Monday, Mar, 31",
      requests: 10,
    },
    {
      id: "4",
      title: "My house needs to be painted",
      rate: "₹500/hr",
      applicants: "0/1",
      location: "Downtown, New York",
      date: "Monday, Mar, 31",
      requests: 10,
    },
    {
      id: "5",
      title: "My house needs to be painted",
      rate: "₹500/hr",
      applicants: "0/1",
      location: "Downtown, New York",
      date: "Monday, Mar, 31",
      requests: 10,
    },
  ];

  return (
    <ScrollView
      style={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
    >
      {posts.map((post) => (
        <JobCard key={post.id} data={post} onPress={handleNext} />
      ))}
    </ScrollView>
  );
};

const AppliedTab = () => {
  const navigation = useNavigation();
  const handleNext = () => {
    console.log("Next button pressed");
    navigation.navigate("RequestDetails");
  };
  const posts = [
    {
      id: "2",
      title: "My house needs to be painted",
      rate: "₹500/hr",
      applicants: "0/1",
      location: "Downtown, New York",
      date: "Monday, Mar, 31",
      requests: 10,
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
        <JobCard key={post.id} data={post} onPress={handleNext} />
      ))}
    </ScrollView>
  );
};

const Status = () => {
  const layout = useWindowDimensions();
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
