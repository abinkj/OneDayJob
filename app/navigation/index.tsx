import React, { useEffect, useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useDispatch, useSelector } from "react-redux";
import { ActivityIndicator, View } from "react-native";

import MainStack from "./mainStack";
import OnBoardingStack from "./onBoardingStack";
import KycStack from "./kycStack";
import { restoreSession } from "../../utilities/authentication";

const RootStack = createNativeStackNavigator();

const RootStackLayout = () => {
  const dispatch = useDispatch();
  const { isLoggedIn, kycStatus } = useSelector(
    (state) => state.authentication
  );
  console.log('Kyc stats',kycStatus);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkLogin = async () => {
      try {
        await dispatch(restoreSession());
      } catch (error) {
        console.error("Error restoring session:", error);
      } finally {
        setIsLoading(false);
      }
    };
    checkLogin();
  }, [dispatch]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <RootStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      {isLoggedIn ? (
        kycStatus === "completed" || kycStatus === "skipped" ? (
          <RootStack.Screen name="MainStack" component={MainStack} />
        ) : (
          <RootStack.Screen name="KycStack" component={KycStack} />
        )
      ) : (
        <RootStack.Screen name="OnBoardingStack" component={OnBoardingStack} />
      )}
    </RootStack.Navigator>
  );
};

export default RootStackLayout;
