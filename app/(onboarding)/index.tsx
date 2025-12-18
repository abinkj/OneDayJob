import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { useDispatch } from "react-redux";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  interpolate,
  Extrapolate,
  interpolateColor,
} from "react-native-reanimated";
import { setHasSeenOnboarding } from "../../redux/reducers/authReducers";
import { saveHasSeenOnboarding } from "../../utilities/asyncStore";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomButton from "../../components/CustomButton";
import { Colors } from "../../constants/Colors";

const { width } = Dimensions.get("window");

const slides = [
  {
    id: "1",
    title: "Find Your Perfect Job",
    description:
      "Browse through thousands of job listings to find the one that suits you best.",
    image: undefined, // Placeholder
  },
  {
    id: "2",
    title: "Easy Application",
    description: "Apply to jobs with just a single tap. No complicated forms.",
    image: undefined, // Placeholder
  },
  {
    id: "3",
    title: "Get Hired Quickly",
    description:
      "Connect with employers directly and start working in no time.",
    image: undefined, // Placeholder
  },
];

const PaginationDot = ({ index, scrollX }: { index: number; scrollX: any }) => {
  const animatedStyle = useAnimatedStyle(() => {
    const dotWidth = interpolate(
      scrollX.value,
      [(index - 1) * width, index * width, (index + 1) * width],
      [8, 20, 8],
      Extrapolate.CLAMP
    );

    const opacity = interpolate(
      scrollX.value,
      [(index - 1) * width, index * width, (index + 1) * width],
      [0.5, 1, 0.5],
      Extrapolate.CLAMP
    );

    const backgroundColor = interpolateColor(
      scrollX.value,
      [(index - 1) * width, index * width, (index + 1) * width],
      ["#ccc", Colors.primary, "#ccc"]
    );

    return {
      width: dotWidth,
      opacity,
      backgroundColor,
    };
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
    flatListRef.current?.scrollToIndex({ index: slides.length - 1 });
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }).current;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        {currentIndex < slides.length - 1 && (
          <TouchableOpacity onPress={handleSkip}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>
      <Animated.FlatList
        ref={flatListRef as any}
        data={slides}
        onScroll={onScroll}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <Image
              source={item.image}
              style={styles.image}
              resizeMode="contain"
            />
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
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

        <View style={styles.buttonsContainer}>
          <CustomButton
            text={currentIndex === slides.length - 1 ? "Get Started" : "Next"}
            onPress={handleNext}
            isLoading={loading}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    alignItems: "flex-end",
    paddingRight: 16,
    height: 50,
    justifyContent: "center",
  },
  skipText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  slide: {
    width,
    alignItems: "center",
    padding: 20,
    justifyContent: "center",
  },
  image: {
    width: width * 0.8,
    height: width * 0.8,
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ccc",
    marginHorizontal: 4,
  },
  buttonsContainer: {
    marginTop: 20,
    flex: 1,
  },
});

export default Onboarding;
