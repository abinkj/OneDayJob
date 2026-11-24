import React from "react";
import RootStackLayout from "./navigation";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function Index() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <RootStackLayout />
    </GestureHandlerRootView>
  );
}
