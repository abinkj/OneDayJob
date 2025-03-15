import { StyleSheet } from "react-native";
import DeviceDimensions from "../../constants/DeviceDimenions";
import { Colors } from "../../constants/Colors";

export  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: Colors.white,
      alignItems: 'center'
    },
    title: {
      fontSize: 24,
      fontFamily: 'bold',
      marginTop: 56 * DeviceDimensions.heightRatio,
      color: Colors.grey,

    },
    image: {
      width: 272 * DeviceDimensions.widthRatio,
      height: 206 * DeviceDimensions.heightRatio,
      marginTop: 35,
    },
    subtitle: {
      fontSize: 18,
      lineHeight: 22,
      textAlign: "center",
      fontFamily: 'regular',
      color: Colors.grey,
      marginTop: 34,
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      borderBottomWidth: 1,
      borderBottomColor: Colors.grey,
      width: DeviceDimensions.screenWidth * 0.8,
      paddingBottom: 5,
      marginTop: 60 * DeviceDimensions.heightRatio,
    },
    inputContainerSignUp: {
        flexDirection: "row",
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: Colors.grey,
        width: DeviceDimensions.screenWidth * 0.8,
        paddingBottom: 5,
        marginTop: 40 * DeviceDimensions.heightRatio,
      },
      phoneContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: Colors.grey,
        width: DeviceDimensions.screenWidth * 0.8,
        paddingBottom: 5,
        marginTop: 20 * DeviceDimensions.heightRatio,
      },
    countryCode: {
      fontSize: 16,
      marginRight: 10,
      fontFamily: 'regular',
      color: Colors.grey,

  
    },
    input: {
      flex: 1,
      fontSize: 16,
      fontFamily: 'regular',
      color: Colors.grey,

  
    },
    button: {
      backgroundColor: Colors.black,
      width: 361 * DeviceDimensions.widthRatio,
      height: 42,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: 'center',
      marginTop: 162 * DeviceDimensions.heightRatio,
    },
    buttonSign: {
        backgroundColor: Colors.black,
        width: 361 * DeviceDimensions.widthRatio,
        height: 42,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: 'center',
        marginTop: 106* DeviceDimensions.heightRatio,
      },
    buttonText: {
        color: Colors.white,
        fontSize: 16,
      fontFamily: 'bold',
    },
    footerText: {
      fontSize: 14,
      color: Colors.grey,
      fontFamily: 'regular',
  
    },
    createAccount: {
      fontSize: 14,
      color: Colors.grey,
      fontFamily: 'bold',
      marginLeft: 10
    },
    row: {
      flexDirection: 'row',
      marginTop: 32
    },
  });