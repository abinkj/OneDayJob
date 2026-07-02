import React, { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { store, persistor } from "../redux/store";
import { PersistGate } from "redux-persist/integration/react";
import { Stack, SplashScreen } from "expo-router";
import { useFonts } from "expo-font";
import Toast from "react-native-toast-message";
import toastConfig from "../components/customToast";
import { NotificationProvider } from "../contexts/NotificationContext";
import { initializeStorage } from "../utilities/mmkvStore";
import "../utilities/i18n";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../services/queryClient";
import AppLayout from "../components/ui/layout";
import { AlertProvider } from "../components/CustomAlert/AlertProvider";
import { ThemeProvider } from "../contexts/ThemeContext";
import { KeyboardProvider } from "react-native-keyboard-controller";

import NetworkSyncBootstrap from "../offline/NetworkSyncBootstrap";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const [fontsLoaded, fontError] = useFonts({
    regular: require("../assets/fonts/Roboto-Regular.ttf"),
    medium: require("../assets/fonts/Roboto-Medium.ttf"),
    bold: require("../assets/fonts/Roboto-Bold.ttf"),
    italic: require("../assets/fonts/Roboto-Italic.ttf"),
    light: require("../assets/fonts/Roboto-Light.ttf"),
    thin: require("../assets/fonts/Roboto-Thin.ttf"),
  });

  useEffect(() => {
    initializeStorage()
      .then(() => setReady(true))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (ready && (fontsLoaded || fontError)) {
      SplashScreen.hideAsync().catch(console.warn);
    }
  }, [ready, fontsLoaded, fontError]);

  if (!ready || (!fontsLoaded && !fontError)) {
    return null;
  }

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {/* <NetworkSyncBootstrap /> */}
        <QueryClientProvider client={queryClient}>
          <NotificationProvider>
            <KeyboardProvider>
              <AlertProvider>
                <ThemeProvider>
                  <AppLayout>
                    <Stack screenOptions={{ headerShown: false }} />
                    <Toast config={toastConfig} />
                  </AppLayout>
                </ThemeProvider>
              </AlertProvider>
            </KeyboardProvider>
          </NotificationProvider>
        </QueryClientProvider>
      </PersistGate>
    </Provider>
  );
}
