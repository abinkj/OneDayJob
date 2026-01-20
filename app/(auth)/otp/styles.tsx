import { StyleSheet } from "react-native";
import DeviceDimensions from "../../../constants/DeviceDimenions";
import { ThemeColors } from "../../../constants/Colors";

export const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
    width: '100%',
  },
  title: {
    fontSize: 28,
    fontFamily: "bold",
    color: colors.black,
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    fontFamily: "regular",
    color: colors.grey,
    maxWidth: '80%',
  },
  subtitleOtp: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    fontFamily: "regular",
    color: colors.grey,
    marginTop: 8,
    maxWidth: '90%',
  },
  // OTP Input Specific Styles
  containerOtp: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 40,
    marginBottom: 10,
    width: '100%',
    gap: 8, // Add gap between inputs
  },
  pinCodeContainer: {
    width: 48,
    height: 56, // Taller for modern look
    borderWidth: 1,
    borderColor: 'transparent', // Remove border color for cleaner look with shadow
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.white,
    // Add shadow
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  activePinCodeContainer: {
    borderColor: colors.primary,
    borderWidth: 1,
    backgroundColor: colors.white,
    transform: [{ scale: 1.05 }], // Subtle scale effect on focus
  },
  pinCodeText: {
    fontSize: 24,
    fontFamily: "bold",
    color: colors.black,
    textAlign: "center",
  },

  // Resend Section
  resendContainer: {
    marginTop: 20,
    marginBottom: 10,
    alignItems: 'center',
  },
  resendText: {
    fontSize: 14,
    color: colors.grey,
    textAlign: "center",
    fontFamily: "regular",
  },
  resendButton: {
    color: colors.primary, // Use primary color for action
    fontFamily: "bold",
  },

  buttonOtp: {
    backgroundColor: colors.primary,
    width: '100%',
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 40,
  },
  disabledButton: {
    backgroundColor: colors.grey,
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: colors.white,
    fontSize: 18,
    fontFamily: "bold",
  },

  // Success view styles
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  animationContainer: {
    width: 200 * DeviceDimensions.widthRatio,
    height: 200 * DeviceDimensions.heightRatio,
  },
  text: {
    marginTop: 20,
    fontSize: 24,
    color: colors.black,
    fontFamily: "bold",
  },

  // Custom loading animation styles
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  logoCircleInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoText: {
    fontSize: 48,
    fontFamily: "bold",
    color: colors.white,
  },
  logoImage: {
    width: 70,
    height: 70,
  },
  brandName: {
    fontSize: 32,
    fontFamily: "bold",
    marginBottom: 12,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: "regular",
    marginBottom: 24,
  },
  dotsContainer: {
    flexDirection: "row",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
