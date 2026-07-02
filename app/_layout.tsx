import React, { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { store, persistor } from "../redux/store";
import { PersistGate } from "redux-persist/integration/react";
import { Stack } from "expo-router";
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

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initializeStorage()
      .then(() => setReady(true))
      .catch(console.error);
  }, []);
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
