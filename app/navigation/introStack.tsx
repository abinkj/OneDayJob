import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Onboarding from "../(onboarding)";
import ProfileCompletion from "@/(auth)/profileCompletion";

const Stack = createNativeStackNavigator();

const IntroStack = () => {
  return (
    <Stack.Navigator
      id={undefined}
      screenOptions={{
        headerShown: false,
        animation: "fade",
      }}
    >
      <Stack.Screen name="Onboarding" component={Onboarding} />
      <Stack.Screen name="ProfileCompletion" component={ProfileCompletion} />
    </Stack.Navigator>
  );
};

export default IntroStack;
