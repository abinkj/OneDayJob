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
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../constants/Colors";

export default function RootLayout() {
  useEffect(() => {
    // Initialize socket connection when app starts
    const initializeSocket = async () => {
      try {
        console.log('🔌 Initializing global socket connection...');
        await socketService.connect();
        console.log('✅ Global socket connection initialized');
      } catch (error) {
        console.error('❌ Failed to initialize global socket connection:', error);
      }
    };

    initializeSocket();

    // Cleanup on unmount
    return () => {
      console.log('🔌 Disconnecting global socket...');
      socketService.disconnect();
    };
  }, []);

  return (
    <Provider store={store}>
      <NotificationProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }} edges={['top', 'left', 'right']}>
          <Stack screenOptions={{ headerShown: false }} />
        </SafeAreaView>
        <Toast config={toastConfig} />
      </NotificationProvider>
    </Provider>
  );
}
