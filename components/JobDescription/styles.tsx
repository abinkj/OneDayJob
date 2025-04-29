import { StyleSheet } from "react-native";
import { Colors } from "../../constants/Colors";
import DeviceDimensions from "../../constants/DeviceDimenions";

 export const styles = StyleSheet.create({
    unifiedContainer: {
      backgroundColor: Colors.white,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: Colors.border,
      marginBottom: 16 * DeviceDimensions.heightRatio,
      overflow: 'hidden'
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 12 * DeviceDimensions.widthRatio,
      paddingTop: 12 * DeviceDimensions.heightRatio
    },
    sectionTitle: {
      fontSize: 16,
      fontFamily: 'bold',
      color: Colors.black
    },
    inputHelper: {
      fontSize: 12,
      fontFamily: 'regular',
      color: Colors.subGrey
    },
    textArea: {
      fontSize: 16,
      fontFamily: 'regular',
      color: Colors.black,
      padding: 12 * DeviceDimensions.widthRatio,
      minHeight: 100 * DeviceDimensions.heightRatio,
      textAlignVertical: 'top',
    },
    separator: {
      height: 1,
      backgroundColor: '#E0E0E0',
      marginVertical: 4 * DeviceDimensions.heightRatio
    },
    optionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 12 * DeviceDimensions.widthRatio
    },
    optionLeftSection: {
      flexDirection: 'row',
      alignItems: 'center'
    },
    optionText: {
      fontSize: 16,
      fontFamily: 'regular',
      color: Colors.black,
      marginLeft: 8 * DeviceDimensions.widthRatio
    },
    expandedInnerSection: {
      paddingHorizontal: 12 * DeviceDimensions.widthRatio,
      paddingBottom: 12 * DeviceDimensions.heightRatio
    },
    requirementItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8 * DeviceDimensions.heightRatio
    },
    requirementText: {
      fontSize: 14,
      fontFamily: 'regular',
      color: Colors.black,
      marginLeft: 8 * DeviceDimensions.widthRatio,
      flex: 1
    },
    editButton: {
      alignSelf: 'flex-end',
      padding: 8 * DeviceDimensions.widthRatio
    },
    photoContainer: {
      marginRight: 8 * DeviceDimensions.widthRatio
    },
    photoThumbnail: {
      width: 70,
      height: 70,
      borderRadius: 8
    }
  });