import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { LinearGradient } from "expo-linear-gradient";
import { JobPost } from "../../../../types";
import { useTheme } from "../../../../contexts/ThemeContext";
import { isJobOwner } from "../../../../utilities/jobUtils";
import { fontSizes } from "../../../../themes/fonts";

interface LiveJobHeaderProps {
  job: JobPost;
  activeWorkerCount: number;
  totalWorkerCount: number;
}

const { width } = Dimensions.get("window");

const LiveJobHeader: React.FC<LiveJobHeaderProps> = ({
  job,
  activeWorkerCount,
  totalWorkerCount,
}) => {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const userData = useSelector((state: any) => state.authentication.userData);
  const userId = userData?.id || userData?._id;

  // Animation for the sweep effect
  const moveAnim = useRef(new Animated.Value(0)).current;
  // Animation for the pulsing live dot
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const startSweepAnimation = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(moveAnim, {
            toValue: 1,
            duration: 2500,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
            useNativeDriver: true,
          }),
          Animated.delay(1000), // pause between sweeps
        ])
      ).start();
    };

    const startPulseAnimation = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.4,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    startSweepAnimation();
    startPulseAnimation();
  }, [moveAnim, pulseAnim]);

  // Interpolate for sliding translation
  const translateX = moveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-width * 0.8, width], // Slide across fully
  });

  const handlePress = () => {
    const isEmployer = isJobOwner(job, userId);

    if (
      isEmployer &&
      (job.jobStatus === "open" || job.jobStatus === "filled")
    ) {
      navigation.navigate("RequestVerification", {
        jobId: job._id,
        jobName: job.name,
      });
    } else {
      navigation.navigate("JobTimer", {
        jobId: job._id,
        jobName: job.name,
        isEmployer: isEmployer,
      });
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.85}
      onPress={handlePress}
    >
      <LinearGradient
        colors={["#4F46E5", "#7C3AED", "#9333EA"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      >
        {/* Animated Light Sweep Effect */}
        <Animated.View
          style={[styles.sweepContainer, { transform: [{ translateX }] }]}
        >
          <LinearGradient
            colors={[
              "rgba(255,255,255,0)",
              "rgba(255,255,255,0.3)",
              "rgba(255,255,255,0)",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.sweepBeam}
          />
        </Animated.View>

        {/* Background Pattern/Texture (Optional subtle circles) */}
        <View style={styles.circleDecoration1} />
        <View style={styles.circleDecoration2} />

        <View style={styles.contentContainer}>
          <View style={styles.topRow}>
            <View style={styles.liveBadge}>
              <Animated.View
                style={[
                  styles.liveDot,
                  { opacity: pulseAnim, transform: [{ scale: pulseAnim }] },
                ]}
              />
              <Text style={styles.liveText}>LIVE JOB</Text>
            </View>
            {totalWorkerCount > 0 && (
              <View style={styles.counterContainer}>
                <Ionicons
                  name="people"
                  size={14}
                  color="rgba(255,255,255,0.9)"
                />
                <Text style={styles.counterText}>
                  {activeWorkerCount}/{totalWorkerCount} Active
                </Text>
              </View>
            )}
          </View>

          <View style={styles.jobInfo}>
            <Text style={styles.jobName} numberOfLines={1}>
              {job.name}
            </Text>
            <View style={styles.actionRow}>
              <Text style={styles.tapText}>Tap to manage live details</Text>
              <Ionicons
                name="arrow-forward-circle"
                size={16}
                color="rgba(255,255,255,0.9)"
              />
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 12,
    borderRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#7C3AED",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  gradientBackground: {
    width: "100%",
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 20,
    overflow: "hidden",
  },
  sweepContainer: {
    ...StyleSheet.absoluteFillObject,
    width: 100,
    height: "200%",
    top: "-50%",
    transform: [{ rotate: "20deg" }],
    zIndex: 0,
  },
  sweepBeam: {
    flex: 1,
    width: "100%",
  },
  circleDecoration1: {
    position: "absolute",
    top: -30,
    right: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.1)",
    zIndex: 0,
  },
  circleDecoration2: {
    position: "absolute",
    bottom: -40,
    left: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.08)",
    zIndex: 0,
  },
  contentContainer: {
    zIndex: 1,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10B981", // Green for "live"
    marginRight: 8,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 3,
  },
  liveText: {
    color: "white",
    fontSize: fontSizes.size12,
    fontFamily: "bold",
    letterSpacing: 1,
  },
  counterContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  counterText: {
    color: "white",
    fontSize: fontSizes.size12,
    marginLeft: 6,
    fontFamily: "medium",
    letterSpacing: 0.5,
  },
  jobInfo: {
    marginTop: 2,
  },
  jobName: {
    color: "white",
    fontSize: fontSizes.size20,
    fontFamily: "bold",
    marginBottom: 6,
    letterSpacing: 0.5,
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  tapText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: fontSizes.size13,
    marginRight: 6,
    fontFamily: "medium",
  },
});

export default LiveJobHeader;
