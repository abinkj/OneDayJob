import React from "react";
import {
  View,
  StatusBar,
  StyleSheet,
  Platform,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const AppLayout = ({ children }) => {
  const theme = useColorScheme();

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: theme === "dark" ? "#000" : "#fff" },
      ]}
    >
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={theme === "dark" ? "light-content" : "dark-content"}
      />

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
