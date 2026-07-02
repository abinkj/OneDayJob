import React from "react";
import RootStackLayout from "./navigation";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useOTAUpdate } from "../hooks/useOTAupdates";

export default function Index() {
  useOTAUpdate();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <RootStackLayout />
    </GestureHandlerRootView>
  );
}
