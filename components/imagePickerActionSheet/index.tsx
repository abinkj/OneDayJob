import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ActionSheet, { ActionSheetRef } from "react-native-actions-sheet";
import * as ImagePicker from "expo-image-picker";

export interface ImagePickerActionSheetRef {
  show: () => void;
  hide: () => void;
}

interface ImagePickerActionSheetProps {
  onImageSelected: (imageUri: string) => void;
  onError?: (error: string) => void;
  title?: string;
  primaryColor?: string;
  containerStyle?: object;
  titleStyle?: object;
  buttonStyle?: object;
  buttonTextStyle?: object;
  cancelButtonStyle?: object;
  cancelTextStyle?: object;
}

const ImagePickerActionSheet = forwardRef<
  ImagePickerActionSheetRef,
  ImagePickerActionSheetProps
>(
  (
    {
      onImageSelected,
      onError,
      title = "Change Profile Picture",
      primaryColor = "#007AFF",
      containerStyle,
      titleStyle,
      buttonStyle,
      buttonTextStyle,
      cancelButtonStyle,
      cancelTextStyle,
    },
    ref
  ) => {
    const actionSheetRef = useRef<ActionSheetRef>(null);

    useImperativeHandle(ref, () => ({
      show: () => actionSheetRef.current?.show(),
      hide: () => actionSheetRef.current?.hide(),
    }));

    const handleTakePhoto = async () => {
      actionSheetRef.current?.hide();
      try {
        // Request camera permissions
        const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
        if (cameraPermission.status !== "granted") {
          onError?.("Camera permission is required to take photos");
          return;
        }

        const result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [1, 1],
          base64: false,
          quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
          onImageSelected(result.assets[0].uri);
        }
      } catch (error) {
        onError?.("Failed to take photo");
      }
    };

    const handleChooseFromGallery = async () => {
      actionSheetRef.current?.hide();
      try {
        // Request media library permissions
        const libraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (libraryPermission.status !== "granted") {
          onError?.("Photo library permission is required to choose images");
          return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsMultipleSelection: false,
          selectionLimit: 1,
          allowsEditing: true,
          aspect: [1, 1],
          base64: false,
          quality: 0.8,
          exif: false,
        });

        if (!result.canceled && result.assets[0]) {
          onImageSelected(result.assets[0].uri);
        }
      } catch (error) {
        onError?.("Failed to pick image");
      }
    };

    const defaultContainerStyle = {
      backgroundColor: "#fff",
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      ...containerStyle,
    };

    const defaultTitleStyle = {
      fontSize: 18,
      fontWeight: "600" as const,
      textAlign: "center" as const,
      marginBottom: 20,
      color: "#333",
      ...titleStyle,
    };

    const defaultButtonStyle = {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      paddingVertical: 15,
      paddingHorizontal: 10,
      borderRadius: 8,
      marginBottom: 10,
      ...buttonStyle,
    };

    const defaultButtonTextStyle = {
      fontSize: 16,
      marginLeft: 15,
      color: "#333",
      ...buttonTextStyle,
    };

    const defaultCancelButtonStyle = {
      backgroundColor: "#f0f0f0",
      paddingVertical: 15,
      borderRadius: 8,
      alignItems: "center" as const,
      ...cancelButtonStyle,
    };

    const defaultCancelTextStyle = {
      fontSize: 16,
      color: "#666",
      fontWeight: "500" as const,
      ...cancelTextStyle,
    };

    return (
      <ActionSheet
        ref={actionSheetRef}
        containerStyle={defaultContainerStyle}
        indicatorStyle={{
          width: 40,
          backgroundColor: "#ccc",
        }}
        gestureEnabled={true}
        defaultOverlayOpacity={0.7}
        closeOnTouchBackdrop={true}
        closeOnPressBack={true}
        statusBarTranslucent={true}
        animated={true}
      >
        <View style={{ padding: 20 }}>
          <Text style={defaultTitleStyle}>{title}</Text>

          <TouchableOpacity
            style={defaultButtonStyle}
            onPress={handleTakePhoto}
            activeOpacity={0.7}
          >
            <Ionicons name="camera" size={24} color={primaryColor} />
            <Text style={defaultButtonTextStyle}>Take Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={defaultButtonStyle}
            onPress={handleChooseFromGallery}
            activeOpacity={0.7}
          >
            <Ionicons name="images" size={24} color={primaryColor} />
            <Text style={defaultButtonTextStyle}>Choose from Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={defaultCancelButtonStyle}
            onPress={() => actionSheetRef.current?.hide()}
            activeOpacity={0.7}
          >
            <Text style={defaultCancelTextStyle}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ActionSheet>
    );
  }
);

ImagePickerActionSheet.displayName = "ImagePickerActionSheet";

export default ImagePickerActionSheet;