// import { Stack } from "expo-router";

// export default function RootLayout() {
//   return <Stack screenOptions={{ headerShown: false }} />;
// }
import React, { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { store } from "../redux/store";
import { Stack } from "expo-router";
import Toast from "react-native-toast-message";
import toastConfig from "../components/customToast";
import { NotificationProvider } from "../contexts/NotificationContext";
import socketService from "../services/socketService";
import { initializeStorage } from "../utilities/mmkvStore";
import "../utilities/i18n";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../services/queryClient";
import AppLayout from "../components/ui/layout";
import { AlertProvider } from "../components/CustomAlert/AlertProvider";
import { ThemeProvider } from "../contexts/ThemeContext";

import NetworkSyncBootstrap from "../offline/NetworkSyncBootstrap";

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initializeStorage()
      .then(() => setReady(true))
      .catch(console.error);
  }, []);

  useEffect(() => {
    // Initialize app services
    const initializeApp = async () => {
      try {
        // Initialize MMKV storage with secure encryption key
        console.log("🔐 Initializing secure storage...");
        await initializeStorage();
        console.log("✅ Secure storage initialized");

        // Initialize socket connection
        console.log("🔌 Initializing global socket connection...");
        await socketService.connect();
        console.log("✅ Global socket connection initialized");
      } catch (error) {
        console.error("❌ Failed to initialize app services:", error);
      }
    };

    initializeApp();

    // Cleanup on unmount
    return () => {
      console.log("Disconnecting global socket...");
      socketService.disconnect();
    };
  }, []);

  return (
    <Provider store={store}>
      <NetworkSyncBootstrap />
      <QueryClientProvider client={queryClient}>
        <NotificationProvider>
          <AlertProvider>
            <ThemeProvider>
              <AppLayout>
                <Stack screenOptions={{ headerShown: false }} />
                <Toast config={toastConfig} />
              </AppLayout>
            </ThemeProvider>
          </AlertProvider>
        </NotificationProvider>
      </QueryClientProvider>
    </Provider>
  );
}
