import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useSelector } from "react-redux";
import MainStack from "./mainStack";
import OnBoardingStack from "./onBoardingStack";

const RootStack = createNativeStackNavigator();

const RootStackLayout = () => {
  const isLoggedIn = useSelector((state) => state.authentication.isLoggedIn);

  return (
    <RootStack.Navigator
      id={undefined}
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
