import Login from "@/(auth)/login";
import SignUp from "@/(auth)/signUp";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Success from "@/(auth)/success/indes";
import Otp from "@/(auth)/otp";

const Stack = createNativeStackNavigator();

const OnBoardingStack = () => {
  return (
    <Stack.Navigator
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
      <Stack.Screen name="Success" component={Success} />
    </Stack.Navigator>
  );
};

export default OnBoardingStack;
