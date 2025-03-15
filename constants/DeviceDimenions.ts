import { Dimensions } from "react-native";

const { width: screenWidth, height: screenHeight } = Dimensions.get("screen");

const heightRatio = screenHeight / 852; 
const widthRatio = screenWidth / 393;   

const DeviceDimensions = { screenWidth, screenHeight, heightRatio, widthRatio };

export default DeviceDimensions;
