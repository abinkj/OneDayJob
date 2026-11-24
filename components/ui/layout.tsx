import { useEffect } from "react";
import { StatusBar, StyleSheet, Platform } from "react-native";
import { useTheme } from "../../contexts/ThemeContext";
import { SafeAreaView } from "react-native-safe-area-context";
import OfflineIndicator from "../OfflineIndicator";
import { useAlertInitializer } from "../CustomAlert/AlertProvider";
import * as NavigationBar from "expo-navigation-bar";

const AppLayout = ({ children }) => {
  const { theme, colors } = useTheme();
  useAlertInitializer();

  useEffect(() => {
    if (Platform.OS === "android") {
      NavigationBar.setBackgroundColorAsync(colors.background);
      NavigationBar.setButtonStyleAsync(theme === "dark" ? "light" : "dark");
    }
  }, [theme, colors.background]);

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <StatusBar
        animated={true}
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
