import Login from "@/(auth)/login";
import SignUp from "@/(auth)/signUp";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Stack = createNativeStackNavigator();

const OnBoardingStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        gestureEnabled: true,
      }}
    >
      <Stack.Screen
        name="Login"
        component={Login}
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="Signup"
        component={SignUp}
        options={{ animation: "slide_from_right" }}
      />
    </Stack.Navigator>
  );
};

export default OnBoardingStack;
