import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Image,
  Platform,
} from "react-native";
import { useDispatch } from "react-redux";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  interpolate,
  interpolateColor,
  Extrapolation,
} from "react-native-reanimated";
import { setHasSeenOnboarding } from "../../redux/slices/authSlice";
import { saveHasSeenOnboarding } from "../../utilities/mmkvStore";
import CustomButton from "../../components/CustomButton";
import { Colors } from "../../constants/Colors";
import { LinearGradient } from "expo-linear-gradient";
import { fontSizes, fontFamilies } from "../../themes/fonts";
import { strings } from "../../utilities/strings";

const { width } = Dimensions.get("window");

const slides = [
  {
    id: "1",
    title: strings.onboarding.slides[0].title,
    image: require("../../assets/images/onboarding/ob1.png"),
  },
  {
    id: "2",
    title: strings.onboarding.slides[1].title,
    image: require("../../assets/images/onboarding/ob2.png"),
  },
  {
    id: "3",
    title: strings.onboarding.slides[2].title,
    image: require("../../assets/images/onboarding/ob3.png"),
  },
  {
    id: "4",
    title: strings.onboarding.slides[3].title,
    image: require("../../assets/images/onboarding/ob4.png"),
  },
];

const PaginationDot = ({ index, scrollX }: { index: number; scrollX: any }) => {
  const animatedStyle = useAnimatedStyle(() => {
    const dotWidth = interpolate(
      scrollX.value,
      [(index - 1) * width, index * width, (index + 1) * width],
      [8, 20, 8],
      Extrapolation.CLAMP,
    );

    const opacity = interpolate(
      scrollX.value,
      [(index - 1) * width, index * width, (index + 1) * width],
      [0.4, 1, 0.4],
      Extrapolation.CLAMP,
    );

    const backgroundColor = interpolateColor(
      scrollX.value,
      [(index - 1) * width, index * width, (index + 1) * width],
      ["#333", "#000", "#333"],
    );

    return { width: dotWidth, opacity, backgroundColor };
  });

  return <Animated.View style={[styles.dot, animatedStyle]} />;
};

const Onboarding = () => {
  const dispatch = useDispatch();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const scrollX = useSharedValue(0);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const handleFinish = async () => {
    try {
      setLoading(true);
      await saveHasSeenOnboarding(true);
      dispatch(setHasSeenOnboarding(true));
    } catch (error) {
      console.error("Error saving onboarding status:", error);
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      handleFinish();
    }
  };

  const handleSkip = () => {
    handleFinish();
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }).current;

  return (
    <LinearGradient colors={["white", Colors.primary]} style={styles.container}>
      <View style={styles.skipContainer}>
        <TouchableOpacity onPress={handleSkip}>
          <Text style={styles.skipText}>{strings.onboarding.buttons.skip}</Text>
        </TouchableOpacity>
      </View>

      <Animated.FlatList
        ref={flatListRef as any}
        data={slides}
        onScroll={onScroll}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <View style={styles.imageContainer}>
              <Image
                source={item.image}
                style={styles.image}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.title}>{item.title}</Text>
          </View>
        )}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
      />

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <PaginationDot key={index} index={index} scrollX={scrollX} />
          ))}
        </View>

        <CustomButton
          text={currentIndex === slides.length - 1 ? strings.onboarding.buttons.getStarted : strings.onboarding.buttons.next}
          onPress={handleNext}
          color={Colors.blue}
        />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipContainer: {
    alignItems: "flex-end",
    marginRight: 16,
    marginTop: "5%",
  },
  skipText: {
    fontSize: fontSizes.size16,
    color: Colors.switchBorder,
    fontFamily: fontFamilies.bold,
  },
  slide: {
    width,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    marginTop: -60,
  },
  imageContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },
  image: {
    width: width,
    height: width,
  },
  title: {
    fontSize: fontSizes.size38,
    fontFamily: fontFamilies.bold,
    color: "#fff",
    textAlign: "center",
    marginBottom: 10,
    lineHeight: 50,
    ...Platform.select({
      android: {
        includeFontPadding: false,
      },
    }),
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 40,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#333",
    marginHorizontal: 4,
  },
});

export default Onboarding;
