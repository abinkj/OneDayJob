import Login from "@/(auth)/login";
import SignUp from "@/(auth)/signUp";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Otp from "@/(auth)/otp";
import ProfileCompletion from "@/(onboarding)/profileCompletion";

const Stack = createNativeStackNavigator();

const OnBoardingStack = () => {
  return (
    <Stack.Navigator
      id={undefined}
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        gestureEnabled: true,
      }}
      initialRouteName="Login"
    >
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Signup" component={SignUp} />
      <Stack.Screen name="Otp" component={Otp} />
      <Stack.Screen name="ProfileCompletion" component={ProfileCompletion} />
    </Stack.Navigator>
  );
};

export default OnBoardingStack;
