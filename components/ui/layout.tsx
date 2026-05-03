import { StatusBar, StyleSheet } from "react-native";
import { useTheme } from "../../contexts/ThemeContext";
import { SafeAreaView } from "react-native-safe-area-context";
import OfflineIndicator from "../OfflineIndicator";
import { useAlertInitializer } from "../CustomAlert/AlertProvider";

const AppLayout = ({ children }) => {
  const { theme, colors } = useTheme();
  useAlertInitializer();

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
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
