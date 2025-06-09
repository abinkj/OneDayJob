// wont work with expo-router
// This file is used to manage navigation in a React Native app using React Navigation.
import { createNavigationContainerRef } from "@react-navigation/native";

export const navigationRef = createNavigationContainerRef();

export function navigate(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  } else {
    console.warn("Navigation not ready");
  }
}
