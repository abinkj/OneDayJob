import { createNativeStackNavigator } from "@react-navigation/native-stack";
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
