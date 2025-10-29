import Login from "@/(auth)/login";
import SignUp from "@/(auth)/signUp";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Otp from "@/(auth)/otp";
import BankAccount from "@/main/bankAccount";

const Stack = createNativeStackNavigator();

const KycStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        gestureEnabled: true,
      }}
      initialRouteName="BankAccount"
    >
      <Stack.Screen name="BankAccount" component={BankAccount} />
    </Stack.Navigator>
  );
};

export default KycStack;
