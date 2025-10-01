// import { Stack } from "expo-router";

// export default function RootLayout() {
//   return <Stack screenOptions={{ headerShown: false }} />;
// }
import React from "react";
import { Provider } from "react-redux";
import { store } from "../redux/store";
import { Stack } from "expo-router";
import Toast from "react-native-toast-message";
import toastConfig from "../components/customToast";
import { NotificationProvider } from "../contexts/NotificationContext";

export default function RootLayout() {
  return (
    <Provider store={store}>
      <NotificationProvider>
        <Stack screenOptions={{ headerShown: false }} />
        <Toast config={toastConfig} />
      </NotificationProvider>
    </Provider>
  );
}
