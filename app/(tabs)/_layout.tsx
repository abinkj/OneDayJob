import React, { useEffect } from "react";
import { DeviceEventEmitter } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";

// Import your screens
import HomeScreen from "./Home/index";
import StatusScreen from "./Status";
import PostJobScreen from "../(tabs)/PostJob/index";
import ChatScreen from "./Chat";
import ProfileScreen from "../(tabs)/Profile/index";

// Import the custom tab bar
import CustomTabBar from "../../components/CustomTabBar";

// Import ErrorBoundary
import ErrorBoundary from "../../components/ErrorBoundary";

const Tab = createBottomTabNavigator();

// Wrap each screen component with ErrorBoundary
const HomeWithErrorBoundary = () => (
  <ErrorBoundary>
    <HomeScreen />
  </ErrorBoundary>
);

const StatusWithErrorBoundary = () => (
  <ErrorBoundary>
    <StatusScreen />
  </ErrorBoundary>
);

const PostJobWithErrorBoundary = ({ navigation }: any) => (
  <ErrorBoundary>
    <PostJobScreen navigation={navigation} />
  </ErrorBoundary>
);

const ChatWithErrorBoundary = () => (
  <ErrorBoundary>
    <ChatScreen />
  </ErrorBoundary>
);

const ProfileWithErrorBoundary = () => (
  <ErrorBoundary>
    <ProfileScreen />
  </ErrorBoundary>
);

export default function TabLayout() {
  const navigation = useNavigation<any>();

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      "navigate_from_notification",
      (data) => {
        if (data.screen) {
          navigation.navigate(data.screen, data.params);
        }
      }
    );

    return () => {
      subscription.remove();
    };
  }, [navigation]);

  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={HomeWithErrorBoundary} />
      <Tab.Screen name="Status" component={StatusWithErrorBoundary} />
      <Tab.Screen
        name="PostJob"
        component={PostJobWithErrorBoundary}
        options={{ tabBarStyle: { display: "none" } }}
      />
      <Tab.Screen name="Chat" component={ChatWithErrorBoundary} />
      <Tab.Screen name="Profile" component={ProfileWithErrorBoundary} />
    </Tab.Navigator>
  );
}
