import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

// Import your screens
import HomeScreen from "./Home/index";
import StatusScreen from "./Status";
import PostJobScreen from "../(tabs)/PostJob/index";
import ChatScreen from "./Chat";
import ProfileScreen from "../(tabs)/Profile/index";

// Import the custom tab bar
import CustomTabBar from "../../components/CustomTabBar";

const Tab = createBottomTabNavigator();

export default function TabLayout() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Status" component={StatusScreen} />
      <Tab.Screen
        name="PostJob"
        component={PostJobScreen}
        options={{ tabBarStyle: { display: "none" } }}
      />
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
