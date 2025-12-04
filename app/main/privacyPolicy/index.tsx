import React from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { useRoute } from "@react-navigation/native";
import { Header } from "../../../components/header";
import { Colors } from "../../../constants/Colors";
import WebView from "react-native-webview";

const PrivacyPolicy = () => {
  const route = useRoute<any>();
  const { url, title } = route.params || {};

  const displayUrl = url || "https://www.google.com";
  const displayTitle = title || "Privacy Policy";

  return (
    <View style={styles.container}>
      <Header title={displayTitle} showBackButton />
      <WebView
        source={{ uri: displayUrl }}
        style={styles.webview}
        startInLoadingState
        decelerationRate="normal"
        overScrollMode="never"
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.blue} />
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  webview: { flex: 1 },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});

export default PrivacyPolicy;
