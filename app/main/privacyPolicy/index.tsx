import { useEffect, useMemo, useState } from "react";
import { View, StyleSheet, ActivityIndicator, Text } from "react-native";
import { useRoute } from "@react-navigation/native";
import { Header } from "../../../components/header";
import { ThemeColors } from "../../../constants/Colors";
import WebView from "react-native-webview";
import { useTheme } from "../../../contexts/ThemeContext";
import NetInfo from "@react-native-community/netinfo";
import { fontSizes } from "../../../themes/fonts";

const PrivacyPolicy = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [loading, setLoading] = useState(true);

  const route = useRoute<any>();
  const { url, title } = route.params || {};
  const { colors } = useTheme();

  const styles = useMemo(() => createStyles(colors), [colors]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(!!state.isConnected);
    });

    return unsubscribe;
  }, []);

  const displayUrl = url || "https://www.google.com";
  const displayTitle = title || "Privacy Policy";

  if (!isConnected) {
    return (
      <View style={styles.container}>
        <Header title={displayTitle} showBackButton />
        <View style={styles.loadingContainer}>
          <Text
            style={{
              color: colors.black,
              fontSize: fontSizes.size18,
              fontWeight: "bold",
            }}
          >
            No internet connection
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title={displayTitle} showBackButton />

      <View style={{ flex: 1 }}>
        <WebView
          source={{ uri: displayUrl }}
          style={styles.webview}
          originWhitelist={["*"]}
          bounces={false}
          decelerationRate="fast"
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
        />

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}
      </View>
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    webview: {
      flex: 1,
      backgroundColor: colors.background,
    },
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
