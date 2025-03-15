import { Redirect } from "expo-router";

export default function Index() {
  const onboardingComplete = false; // Change this dynamically based on AsyncStorage or state

  if (onboardingComplete) {
    return <Redirect href="/(tabs)/" />;
  } else {
    return <Redirect href="/(auth)/" />;
  }
}
