import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
  Dimensions,
  Animated,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../../../../contexts/ThemeContext";
import DeviceDimensions from "../../../../constants/DeviceDimenions";
import { fontSizes } from "../../../../themes/fonts";

const { width } = Dimensions.get("window");
const BANNER_WIDTH = width - 32; // Assuming 16 horizontal padding on each side

const BANNER_DATA = [
  {
    id: "1",
    image: require("../../../../assets/images/banner.png"),
    title: "Help Is One Click Away –",
    subtitle: "Post Your Job Now!",
    buttonText: "Post Now",
    navigateTo: "PostJob",
  },
  {
    id: "2",
    image: require("../../../../assets/images/banner2.png"),
    title: "Find The Best Professionals ",
    subtitle: "Hire skilled workers instantly!",
    buttonText: "Post Now",
    navigateTo: "PostJob",
  },
  {
    id: "3",
    image: require("../../../../assets/images/banner3.png"),
    title: "Earn Money",
    subtitle: "Browse flexible local jobs!",
    buttonText: "Post Now",
    navigateTo: "PostJob",
  },
];

const BannerCarousel = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<any>(null);

  // Auto-scroll logic
  useEffect(() => {
    const timer = setInterval(() => {
      let nextIndex = currentIndex + 1;
      if (nextIndex >= BANNER_DATA.length) {
        nextIndex = 0;
      }
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
      setCurrentIndex(nextIndex);
    }, 4000); // 4 seconds interval

    return () => clearInterval(timer);
  }, [currentIndex]);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false } // Width/position isn't fully supported with native driver for custom pagination dots sometimes
  );

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems[0]) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const renderItem = ({ item }: { item: typeof BANNER_DATA[0] }) => {
    return (
      <View style={[styles.bannerContainer, { width: BANNER_WIDTH }]}>
        <ImageBackground
          style={styles.banner}
          source={item.image}
          resizeMode="stretch"
          imageStyle={{ borderRadius: 16 }}
        >
          <View style={styles.bannerTextContainer}>
            <Text style={styles.bannerTitle}>{item.title}</Text>
            <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
            <TouchableOpacity
              style={styles.postNowButton}
              onPress={() => navigation.navigate(item.navigateTo)}
            >
              <Text style={[styles.postNowText, { color: colors.primary }]}>{item.buttonText}</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Animated.FlatList
        ref={flatListRef}
        data={BANNER_DATA}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewConfigRef}
      />
      <View style={styles.paginationContainer}>
        {BANNER_DATA.map((_, i) => {
          const inputRange = [(i - 1) * BANNER_WIDTH, i * BANNER_WIDTH, (i + 1) * BANNER_WIDTH];
          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 20, 8],
            extrapolate: "clamp",
          });
          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: "clamp",
          });
          return (
            <Animated.View
              key={i.toString()}
              style={[
                styles.dot,
                { width: dotWidth, opacity, backgroundColor: colors.primary },
              ]}
            />
          );
        })}
      </View>
    </View>
  );
};

export default BannerCarousel;

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    marginBottom: 4 * DeviceDimensions.heightRatio,
    width: "100%",
  },
  bannerContainer: {
    height: 140.21 * DeviceDimensions.heightRatio,
    borderRadius: 16,
    overflow: "hidden", // Ensure borderRadius applies to inner content
  },
  banner: {
    width: "100%",
    height: "100%",
  },
  bannerTextContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  bannerTitle: {
    fontSize: fontSizes.size20,
    fontFamily: "bold",
    color: "#FFFFFF",
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  bannerSubtitle: {
    fontSize: fontSizes.size14,
    fontFamily: "regular",
    color: "#FFFFFF",
    marginTop: 4 * DeviceDimensions.heightRatio,
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  postNowButton: {
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    alignSelf: "flex-start",
    marginTop: 16 * DeviceDimensions.heightRatio,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  postNowText: {
    fontSize: fontSizes.size12,
    fontFamily: "bold",
  },
  paginationContainer: {
    flexDirection: "row",
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
});
