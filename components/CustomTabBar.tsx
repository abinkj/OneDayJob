import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  DeviceEventEmitter,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import DeviceDimensions from "../constants/DeviceDimenions";
import { useTheme } from "../contexts/ThemeContext";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";
import SvgImage from "../utilities/svg";

interface TabIconProps {
  isFocused: boolean;
  iconName: string;
}

const TabIcon = ({ isFocused, iconName }: TabIconProps) => {
  const scale = useSharedValue(isFocused ? 1 : 0.9);

  useEffect(() => {
    scale.value = withSpring(isFocused ? 1 : 0.9, {
      damping: 10,
      stiffness: 100,
    });
  }, [isFocused, scale]);

  const animatedStyle = useAnimatedStyle(() => {
    "worklet";
    return {
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <Animated.View style={animatedStyle}>
      <SvgImage
        icon={isFocused ? iconName + "Active" : iconName}
        width={24}
        height={24}
      />
    </Animated.View>
  );
};

const CustomTabBar = ({ state, descriptors, navigation }) => {
  const focusedOptions = descriptors[state.routes[state.index].key].options;
  const currentRoute = state.routes[state.index];
  const routeName =
    getFocusedRouteNameFromRoute(currentRoute) || currentRoute.name;
  const { colors } = useTheme();

  // Animated value for tab bar visibility
  const tabBarTranslateY = useSharedValue(0);
  const tabBarOpacity = useSharedValue(1);

  // Check if tab bar should be hidden
  const hiddenTabBarScreens = ["PostJob"];
  const shouldHideTabBar =
    hiddenTabBarScreens.includes(routeName) ||
    focusedOptions.tabBarVisible === false;

  // Animate tab bar visibility with both slide and fade on the UI thread
  useEffect(() => {
    tabBarTranslateY.value = withTiming(shouldHideTabBar ? 100 : 0, {
      duration: 250,
    });
    tabBarOpacity.value = withTiming(shouldHideTabBar ? 0 : 1, {
      duration: 100,
    });
  }, [shouldHideTabBar, tabBarTranslateY, tabBarOpacity]);

  const containerAnimatedStyle = useAnimatedStyle(() => {
    "worklet";
    return {
      transform: [{ translateY: tabBarTranslateY.value }],
      opacity: tabBarOpacity.value,
    };
  });

  const handlePostJobPress = () => {
    navigation.navigate("PostJob");
  };

  const handleTabPress = (index, route) => {
    // If already on this tab, emit scroll to top event
    if (state.index === index) {
      if (route.name === "Home") {
        DeviceEventEmitter.emit("scrollToTop_Home");
      } else if (route.name === "Status") {
        DeviceEventEmitter.emit("scrollToTop_Status");
      }
    } else {
      navigation.navigate(route.name);
    }
  };

  const renderTab = (index, route, iconName, label) => (
    <TouchableOpacity
      key={route.key}
      style={styles.tabItem}
      onPress={() => handleTabPress(index, route)}
      activeOpacity={0.7}
    >
      <TabIcon isFocused={state.index === index} iconName={iconName} />
      <Text
        style={[
          styles.tabText,
          { color: state.index === index ? colors.tabBlue : colors.tabGrey },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Animated.View style={[styles.container, containerAnimatedStyle]}>
      <View style={[styles.tabBar, { backgroundColor: colors.white }]}>
        {renderTab(0, state.routes[0], "home", "Home")}
        {renderTab(1, state.routes[1], "status", "Status")}

        <View style={styles.centerButtonContainer}>
          <TouchableOpacity
            style={styles.centerButton}
            onPress={handlePostJobPress}
          >
            <SvgImage icon={"postJob"} width={72} height={72} />
          </TouchableOpacity>
          <Text
            style={[
              styles.JobPostText,
              { color: state.index === 2 ? colors.tabBlue : colors.tabGrey },
            ]}
          >
            Post Job
          </Text>
        </View>

        {renderTab(3, state.routes[3], "message", "Chat")}
        {renderTab(4, state.routes[4], "profile", "Profile")}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    width: DeviceDimensions.screenWidth,
    alignItems: "center",
    //shadowColor: "#000",
    //shadowOffset: { width: 0, height: -2 },
    //shadowOpacity: 0.8,
    //shadowRadius: 3.84,
    //elevation: 5,
    backgroundColor: "transparent",
  },
  tabBar: {
    flexDirection: "row",
    // backgroundColor: Colors.white,
    height: 75 * DeviceDimensions.heightRatio,
    width: DeviceDimensions.screenWidth,
    alignItems: "center",
    justifyContent: "space-around",
  },
  tabItem: { alignItems: "center", justifyContent: "center", flex: 1 },
  tabText: { fontSize: 12, fontWeight: "500", marginTop: 5 },
  JobPostText: { fontSize: 12, fontWeight: "500", marginTop: 5 },
  centerButtonContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20 * DeviceDimensions.heightRatio,
  },
  centerButton: { alignItems: "center", justifyContent: "center" },
});

export default React.memo(CustomTabBar);
