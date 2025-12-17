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
    marginBottom: 30,
    width: '100%',
  },
  title: {
    fontSize: 28, // Slightly smaller to fit if needed, or keep 32
    fontFamily: "bold",
    color: Colors.black,
    marginBottom: 8,
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
  image: {
    width: 180 * DeviceDimensions.widthRatio,
    height: 135 * DeviceDimensions.heightRatio,
    marginTop: 20,
    marginBottom: 20,
    resizeMode: 'contain',
  },
  formContainer: {
    width: '100%',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: "medium",
    color: Colors.black,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 16,
    height: 56,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputWrapperFocused: {
    borderColor: Colors.primary,
  },
  countryCode: {
    fontSize: 16,
    fontFamily: "medium",
    color: Colors.black,
    marginRight: 12,
    paddingRight: 12,
    borderRightWidth: 1,
    borderRightColor: Colors.addressGrey,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: "regular",
    color: Colors.black,
    height: '100%',
  },
  button: {
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
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: Colors.grey,
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 18,
    fontFamily: "bold",
  },
  footer: {
    flexDirection: "row",
    marginTop: 'auto',
    marginBottom: 30,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: Colors.grey,
    fontFamily: "regular",
  },
  createAccount: {
    fontSize: 14,
    color: Colors.blue,
    fontFamily: "bold",
    marginLeft: 4,
  },
});

export default styles;
