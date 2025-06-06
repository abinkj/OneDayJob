
import TabLayout from "@/(tabs)/_layout";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Stack = createNativeStackNavigator();

const MainStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        gestureEnabled: true,
      }}
    >
     <Stack.Screen name="MainHome" component={TabLayout} />
    </Stack.Navigator>
  );
}

export default MainStack;
// This file defines the main stack navigator for the application, which includes the tab layout as a screen.