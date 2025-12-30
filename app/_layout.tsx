// import { Stack } from "expo-router";

// export default function RootLayout() {
//   return <Stack screenOptions={{ headerShown: false }} />;
// }
import React, { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "../redux/store";
import { Stack } from "expo-router";
import Toast from "react-native-toast-message";
import toastConfig from "../components/customToast";
import { NotificationProvider } from "../contexts/NotificationContext";
import socketService from "../services/socketService";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../services/queryClient";
import AppLayout from "../components/ui/layout";
import { AlertProvider } from "../components/CustomAlert/AlertProvider";
import { ThemeProvider } from "../contexts/ThemeContext";

export default function RootLayout() {
  useEffect(() => {
    // Initialize socket connection when app starts
    const initializeSocket = async () => {
      try {
        console.log("🔌 Initializing global socket connection...");
        await socketService.connect();
        console.log("✅ Global socket connection initialized");
      } catch (error) {
        console.error(
          "❌ Failed to initialize global socket connection:",
          error
        );
      }
    };

    initializeSocket();

    // Cleanup on unmount
    return () => {
      console.log("🔌 Disconnecting global socket...");
      socketService.disconnect();
    };
  }, []);

  return (
    <Provider store={store}>
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
