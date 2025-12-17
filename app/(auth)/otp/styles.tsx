import { StyleSheet } from "react-native";
import DeviceDimensions from "../../../constants/DeviceDimenions";
import { Colors } from "../../../constants/Colors";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
    color: Colors.black,
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    fontFamily: "regular",
    color: Colors.grey,
    maxWidth: '80%',
  },
  subtitleOtp: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    fontFamily: "regular",
    color: Colors.grey,
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
    backgroundColor: Colors.white,
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
    borderColor: Colors.primary,
    borderWidth: 1,
    backgroundColor: Colors.white,
    transform: [{ scale: 1.05 }], // Subtle scale effect on focus
  },
  pinCodeText: {
    fontSize: 24,
    fontFamily: "bold",
    color: Colors.black,
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
    color: Colors.grey,
    textAlign: "center",
    fontFamily: "regular",
  },
  resendButton: {
    color: Colors.primary, // Use primary color for action
    fontFamily: "bold",
  },

  buttonOtp: {
    backgroundColor: Colors.primary,
    width: '100%',
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.primary,
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
    backgroundColor: Colors.grey,
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: Colors.white,
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
    color: Colors.black,
    fontFamily: "bold",
  },
});

export default styles;
