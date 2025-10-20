import TabLayout from "@/(tabs)/_layout";
import ChatScreen from "@/main/chatScreen";
import EditProfile from "@/main/editProfile";
import Notification from "@/main/notification";
import RequestVerification from "@/main/requestVerification";
import JobDetails from "@/main/jobDetails";
import JobTimer from "@/main/jobTimer";

import { createNativeStackNavigator } from "@react-navigation/native-stack";
import RequestProfile from "@/main/requestProfile";
import BankAccountScreen from "@/main/bankAccount";
import PaymentHistoryScreen from "@/main/paymentHistory";

const Stack = createNativeStackNavigator();

const MainStack = () => {
  return (
    <Stack.Navigator
      id={undefined}
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="MainHome" component={TabLayout} />
      <Stack.Screen name="ChatScreen" component={ChatScreen} />
      <Stack.Screen name="RequestProfile" component={RequestProfile} />
      <Stack.Screen
        name="RequestVerification"
        component={RequestVerification}
      />
      <Stack.Screen name="Notification" component={Notification} />
      <Stack.Screen name="EditProfile" component={EditProfile} />
      <Stack.Screen name="JobDetails" component={JobDetails} />
      <Stack.Screen name="JobTimer" component={JobTimer} />
      {/* <Stack.Screen name="RequestDetails" component={RequestDetails} /> */}
      <Stack.Screen name="BankAccount" component={BankAccountScreen} />
      <Stack.Screen name="PaymentHistory" component={PaymentHistoryScreen} />
    </Stack.Navigator>
  );
};

export default MainStack;
// This file defines the main stack navigator for the application, which includes the tab layout as a screen.
