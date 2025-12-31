import { useMemo } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { useRoute } from "@react-navigation/native";
import { Header } from "../../../components/header";
import { ThemeColors } from "../../../constants/Colors";
import WebView from "react-native-webview";
import { useTheme } from "../../../contexts/ThemeContext";


const PrivacyPolicy = () => {
  const route = useRoute<any>();
  const { url, title } = route.params || {};
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const displayUrl = url || "https://www.google.com";
  const displayTitle = title || "Privacy Policy";

  return (
    <View style={styles.container}>
      <Header title={displayTitle} showBackButton />
      <WebView
        source={{ uri: displayUrl }}
        style={styles.webview}
        startInLoadingState
        originWhitelist={["*"]}
        bounces={false}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}
      />
    </View>
  );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  webview: { flex: 1, backgroundColor: colors.background },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
});

export default PrivacyPolicy;
