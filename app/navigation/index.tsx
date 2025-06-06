import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useSelector } from "react-redux";
import MainStack from "./mainStack";
import OnBoardingStack from "./onBoardingStack";

const RootStack = createNativeStackNavigator();

const RootStackLayout = () => {
  const isLoggedIn = useSelector((state) => state.authentication.isLoggedIn);

  return (
    <RootStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        gestureEnabled: true,
        gestureDirection: "horizontal",
        contentStyle: { backgroundColor: "transparent" },
        presentation: "modal",
      }}
    >
      {!isLoggedIn ? (
        <RootStack.Screen
          name="MainStack"
          component={MainStack}
          options={{ animation: "slide_from_right" }}
        />
      ) : (
        <RootStack.Screen
          name="OnboardingStack"
          component={OnBoardingStack}
          options={{ animation: "slide_from_right" }}
        />
      )}
    </RootStack.Navigator>
  );
};

export default RootStackLayout;
