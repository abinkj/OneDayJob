import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import LottieView from "lottie-react-native";

import DeviceDimensions from "../../constants/DeviceDimenions";
import { useTheme } from "../../contexts/ThemeContext";

type SuccessAnimationProps = {
  message?: string;
};

const SuccessAnimation: React.FC<SuccessAnimationProps> = ({
  message = "Verified Successfully",
}) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={[styles.container, styles.center]}>
      <LottieView
        source={require("@/../assets/animations/success.json")}
        autoPlay
        loop={false}
        style={styles.animationContainer}
        speed={0.6}
        resizeMode="contain"
        testID="success-animation"
      />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
};

export default SuccessAnimation;

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
      backgroundColor: colors.white,
    },
    center: {
      alignItems: "center",
      paddingTop: 150 * DeviceDimensions.heightRatio,
    },
    animationContainer: {
      width: 200 * DeviceDimensions.widthRatio,
      height: 200 * DeviceDimensions.heightRatio,
    },
    text: {
      paddingTop: 5,
      fontSize: 26,
      color: colors.grey,
      fontWeight: "600",
      textAlign: "center",
    },
  });
