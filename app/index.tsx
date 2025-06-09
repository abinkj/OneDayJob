import { SplashScreen } from "expo-router";
import { useFonts } from "expo-font";
import { useCallback } from "react";
import { Provider } from "react-redux";

import RootStackLayout from "./navigation";
import { store } from "./redux/store";

export default function Index() {
  const [fontsLoaded] = useFonts({
    regular: require("../assets/fonts/Roboto-Regular.ttf"),
    medium: require("../assets/fonts/Roboto-Medium.ttf"),
    bold: require("../assets/fonts/Roboto-Bold.ttf"),
  });

  //const onboardingComplete = false;

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  // if (onboardingComplete) {
  //   console.log("Onboarding complete, redirecting to tabs layout");
  //   return <Redirect href="/(tabs)/" />;
  // } else {
  //   return <Redirect href="/(auth)/" />;
  // }
  return (
    <Provider store={store}>
      <RootStackLayout />
    </Provider>
  );
}
