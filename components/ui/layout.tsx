import React from "react";
import {
  View,
  StatusBar,
  StyleSheet,
  Platform,
} from "react-native";
import { useTheme } from "../../contexts/ThemeContext";
import { SafeAreaView } from "react-native-safe-area-context";
import OfflineIndicator from "../OfflineIndicator";
import { useTimerRedirect } from "../../hooks/useTimerRedirect";

const AppLayout = ({ children }) => {
  const { theme, colors } = useTheme();
  
  // Force redirect worker to timer if session is active
  useTimerRedirect();

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: colors.background },
      ]}
    >
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={theme === "dark" ? "light-content" : "dark-content"}
      />

      <OfflineIndicator />

      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
});

export default AppLayout;
