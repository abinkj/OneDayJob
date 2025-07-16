import React, { useEffect, useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useDispatch, useSelector } from "react-redux";
import { ActivityIndicator } from "react-native";

import MainStack from "./mainStack";
import OnBoardingStack from "./onBoardingStack";
import { restoreSession } from "../../utilities/authentication";

const RootStack = createNativeStackNavigator();

const RootStackLayout = () => {
  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state) => state.authentication.isLoggedIn);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkLogin = async () => {
      try {
        await dispatch(restoreSession()); // This should set isLoggedIn in Redux
      } catch (error) {
        console.error("Error restoring session:", error);
      } finally {
        setIsLoading(false);
      }
    };
    checkLogin();
  }, [dispatch]);

  if (isLoading) {
    return <ActivityIndicator size="large" style={{ flex: 1 }} />;
  }

  return (
    <RootStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      {!isLoggedIn ? (
        <RootStack.Screen name="MainStack" component={MainStack} />
      ) : (
        <RootStack.Screen name="OnboardingStack" component={OnBoardingStack} />
      )}
    </RootStack.Navigator>
  );
};

export default RootStackLayout;
