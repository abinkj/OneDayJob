import { Dimensions, PixelRatio, Platform } from "react-native";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;
const scale = SCREEN_WIDTH / 393; // Base width for scaling
const scaleHeight = SCREEN_HEIGHT / 852; // Base height for scaling

export function actuatedNormalize(size: any): any {
  const newSize = size * scale;
  if (Platform.OS === "ios") {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  } else {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  }
}

export const fontSizes = {
  size10: actuatedNormalize(10),
  size11: actuatedNormalize(11),
  size12: actuatedNormalize(12),
  size13: actuatedNormalize(13),
  size14: actuatedNormalize(14),
  size15: actuatedNormalize(15),
  size16: actuatedNormalize(16),
  size17: actuatedNormalize(17),
  size18: actuatedNormalize(18),
  size19: actuatedNormalize(19),
  size20: actuatedNormalize(20),
  size21: actuatedNormalize(21),
  size22: actuatedNormalize(22),
  size23: actuatedNormalize(23),
  size24: actuatedNormalize(24),
  size25: actuatedNormalize(25),
  size26: actuatedNormalize(26),
  size27: actuatedNormalize(27),
  size28: actuatedNormalize(28),
  size29: actuatedNormalize(29),
  size30: actuatedNormalize(30),
  size31: actuatedNormalize(31),
  size32: actuatedNormalize(32),
  size33: actuatedNormalize(33),
  size34: actuatedNormalize(34),
  size35: actuatedNormalize(35),
  size36: actuatedNormalize(36),
  size38: actuatedNormalize(38),
  size40: actuatedNormalize(40),
  size48: actuatedNormalize(48),
};
