import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
  Dimensions,
  type FlatList,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  interpolate,
  Extrapolation,
  type SharedValue,
} from "react-native-reanimated";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { useTheme } from "../../../../contexts/ThemeContext";
import DeviceDimensions from "../../../../constants/DeviceDimenions";
import { fontSizes } from "../../../../themes/fonts";

const { width } = Dimensions.get("window");
const BANNER_WIDTH = width - 32; // Assuming 16 horizontal padding on each side

type BannerItem = {
  id: string;
  image: any;
  title: string;
  subtitle: string;
  buttonText: string;
  navigateTo: string;
};

const BANNER_DATA: BannerItem[] = [
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

interface PaginationDotProps {
  index: number;
  scrollX: SharedValue<number>;
  color: string;
}

const PaginationDot = ({ index, scrollX, color }: PaginationDotProps) => {
  const animatedStyle = useAnimatedStyle(() => {
    "worklet";
    const dotWidth = interpolate(
      scrollX.value,
      [(index - 1) * BANNER_WIDTH, index * BANNER_WIDTH, (index + 1) * BANNER_WIDTH],
      [8, 20, 8],
      Extrapolation.CLAMP
    );
    const opacity = interpolate(
      scrollX.value,
      [(index - 1) * BANNER_WIDTH, index * BANNER_WIDTH, (index + 1) * BANNER_WIDTH],
      [0.3, 1, 0.3],
      Extrapolation.CLAMP
    );

    return {
      width: dotWidth,
      opacity,
    };
  });

  return (
    <Animated.View
      style={[
        styles.dot,
        { backgroundColor: color },
        animatedStyle,
      ]}
    />
  );
};

const BannerCarousel = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useSharedValue(0);
  const flatListRef = useRef<FlatList<BannerItem>>(null);

  // Auto-scroll logic
  useEffect(() => {
    if (!isFocused) return;

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
  }, [currentIndex, isFocused]);

  // UI-thread animated scroll handler
  const handleScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      "worklet";
      scrollX.value = event.contentOffset.x;
    },
  });

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems[0] && viewableItems[0].index !== undefined && viewableItems[0].index !== null) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfigRef = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

  const getItemLayout = (_: any, index: number) => ({
    length: BANNER_WIDTH,
    offset: BANNER_WIDTH * index,
    index,
  });

  const renderItem = ({ item }: { item: BannerItem }) => {
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
              <Text style={[styles.postNowText, { color: colors.primary }]}>
                {item.buttonText}
              </Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Animated.FlatList
        ref={flatListRef as any}
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
        getItemLayout={getItemLayout}
      />
      <View style={styles.paginationContainer}>
        {BANNER_DATA.map((_, i) => (
          <PaginationDot
            key={i.toString()}
            index={i}
            scrollX={scrollX}
            color={colors.primary}
          />
        ))}
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
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  bannerSubtitle: {
    fontSize: fontSizes.size14,
    fontFamily: "regular",
    color: "#FFFFFF",
    marginTop: 4 * DeviceDimensions.heightRatio,
    opacity: 0.9,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
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
