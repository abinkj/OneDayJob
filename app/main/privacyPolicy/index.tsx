import { useEffect, useMemo, useState } from "react";
import { View, StyleSheet, ActivityIndicator, Text } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Header } from "../../../components/header";
import { ThemeColors } from "../../../constants/Colors";
import * as WebBrowser from "expo-web-browser";
import { useTheme } from "../../../contexts/ThemeContext";
import NetInfo from "@react-native-community/netinfo";
import { fontSizes } from "../../../themes/fonts";

const PrivacyPolicy = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [loading, setLoading] = useState(true);
  const [errorOccurred, setErrorOccurred] = useState(false);

  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { url, title } = route.params || {};
  const { colors } = useTheme();

  const styles = useMemo(() => createStyles(colors), [colors]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(!!state.isConnected);
    });

    return unsubscribe;
  }, []);

  const displayUrl = url || "https://www.zoopol.com/privacy-policy";
  const displayTitle = title || "Privacy Policy";

  useEffect(() => {
    if (!isConnected) return;

    let isMounted = true;

    const openBrowser = async () => {
      setLoading(true);
      try {
        await WebBrowser.openBrowserAsync(displayUrl, {
          toolbarColor: colors.white,
          controlsColor: colors.primary,
          preferredBarTintColor: colors.white,
          preferredControlTintColor: colors.primary,
          showTitle: true,
          enableBarCollapsing: true,
        });
      } catch (error) {
        console.error("Failed to open web browser:", error);
        if (isMounted) {
          setErrorOccurred(true);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          navigation.goBack();
        }
      }
    };

    openBrowser();

    return () => {
      isMounted = false;
    };
  }, [isConnected, displayUrl, navigation, colors]);

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

      <View style={styles.loadingContainer}>
        {loading && <ActivityIndicator size="large" color={colors.primary} />}
        {errorOccurred && (
          <Text style={{ color: colors.black, fontSize: fontSizes.size16 }}>
            Failed to open browser.
          </Text>
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
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.background,
    },
  });

export default PrivacyPolicy;

