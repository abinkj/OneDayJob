import { Redirect } from "expo-router";


export default function Index() {
  const onboardingComplete = true;

  return onboardingComplete ? (
    <Redirect href="/(tabs)/" />
  ) : (
    <Redirect href="/(auth)/" />
  );

};


