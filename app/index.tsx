import { Redirect, SplashScreen } from "expo-router";
import { useFonts } from "expo-font";
import { useCallback } from "react";


export default function Index() {
  const [fontsLoaded] = useFonts({
    "regular": require("../assets/fonts/Roboto-Regular.ttf"),
    "medium": require("../assets/fonts/Roboto-Medium.ttf"),
    "bold": require("../assets/fonts/Roboto-Bold.ttf"),
  });

  const onboardingComplete = false; 

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null; // Don't render UI until fonts are loaded
  }


  if (onboardingComplete) {
    return <Redirect href="/(tabs)/" />;
  } else {
    return <Redirect href="/(auth)/" />;
  }
}
