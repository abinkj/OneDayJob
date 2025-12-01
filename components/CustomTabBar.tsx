import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import { useSelector } from "react-redux";
import DeviceDimensions from "../constants/DeviceDimenions";
import { Colors } from "../constants/Colors";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";
import SvgImage from "../utilities/svg";
import Toast from "react-native-toast-message";

const CustomTabBar = ({ state, descriptors, navigation }) => {
  const focusedOptions = descriptors[state.routes[state.index].key].options;
  const currentRoute = state.routes[state.index];
  const routeName =
    getFocusedRouteNameFromRoute(currentRoute) || currentRoute.name;
  const { kycStatus } = useSelector((state) => state.authentication);

  // Animated values for each tab - hooks must be called before any early returns
  const scales = state.routes.map(
    (_, i) => useRef(new Animated.Value(i === state.index ? 1.1 : 0.8)).current
  );

  useEffect(() => {
    scales.forEach((scale, i) => {
      Animated.spring(scale, {
        toValue: i === state.index ? 1 : 0.9,
        useNativeDriver: true,
        speed: 5,
        bounciness: 10,

      }).start();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.index]);

  const handlePostJobPress = () => {
    if (kycStatus === 'completed') {
      navigation.navigate("PostJob");
    } else {
      Toast.show({
        type: "info",
        text1: "KYC Required",
        text2: "Please complete your KYC to post jobs",
      });
      navigation.navigate("BankAccount");
    }
  };

  const hiddenTabBarScreens = ["PostJob"];
  if (
    hiddenTabBarScreens.includes(routeName) ||
    focusedOptions.tabBarVisible === false
  ) {
    return null;
  }

  const renderTab = (index, route, iconName, label) => (
    <TouchableOpacity
      key={route.key}
      style={styles.tabItem}
      onPress={() => navigation.navigate(route.name)}
      activeOpacity={0.7}
    >
      <Animated.View style={{ transform: [{ scale: scales[index] }] }}>
        <SvgImage
          icon={state.index === index ? iconName + "Active" : iconName}
          width={24}
          height={24}
        />
      </Animated.View>
      <Text
        style={[
          styles.tabText,
          { color: state.index === index ? Colors.tabBlue : Colors.tabGrey },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
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
              { color: state.index === 2 ? Colors.tabBlue : Colors.tabGrey },
            ]}
          >
            Post Job
          </Text>
        </View>

        {renderTab(3, state.routes[3], "message", "Chat")}
        {renderTab(4, state.routes[4], "profile", "Profile")}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    width: DeviceDimensions.screenWidth,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.8,
    shadowRadius: 3.84,
    elevation: 5,
    backgroundColor: "transparent",
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    height: 75 * DeviceDimensions.heightRatio,
    width: DeviceDimensions.screenWidth,
    alignItems: "center",
    justifyContent: "space-around",
  },
  tabItem: { alignItems: "center", justifyContent: "center", flex: 1 },
  tabText: { fontSize: 12, fontFamily: "regular", marginTop: 5 },
  JobPostText: { fontSize: 12, fontFamily: "regular", marginTop: 5 },
  centerButtonContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20 * DeviceDimensions.heightRatio,
  },
  centerButton: { alignItems: "center", justifyContent: "center" },
});

export default CustomTabBar;
