import TabLayout from "@/(tabs)/_layout";
import ChatScreen from "@/chatScreen";
import EditProfile from "@/main/editProfile";
import Notification from "@/main/notification";
import RequestDetails from "@/publicProfile/requestDetails";
import RequestVerification from "@/requestVerification";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

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
      <Stack.Screen name="RequestDetails" component={RequestDetails} />
      <Stack.Screen
        name="RequestVerification"
        component={RequestVerification}
      />
      <Stack.Screen name="Notification" component={Notification} />
      <Stack.Screen name="EditProfile" component={EditProfile} />
      {/* <Stack.Screen name="RequestDetails" component={RequestDetails} /> */}
    </Stack.Navigator>
  );
};

export default MainStack;
// This file defines the main stack navigator for the application, which includes the tab layout as a screen.
