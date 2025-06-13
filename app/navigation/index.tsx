// import { createNativeStackNavigator } from "@react-navigation/native-stack";
// import { useSelector } from "react-redux";
// import MainStack from "./mainStack";
// import OnBoardingStack from "./onBoardingStack";

// const RootStack = createNativeStackNavigator();

// const RootStackLayout = () => {
//   const isLoggedIn = useSelector((state) => state.authentication.isLoggedIn);

//   return (
//     <RootStack.Navigator
//       id={undefined}
//       screenOptions={{
//         headerShown: false,
//         animation: "slide_from_right",
//       }}
//     >
//       {isLoggedIn ? (
//         <RootStack.Screen name="MainStack" component={MainStack} />
//       ) : (
//         <RootStack.Screen name="OnboardingStack" component={OnBoardingStack} />
//       )}
//     </RootStack.Navigator>
//   );
// };

// export default RootStackLayout;


import React, { useEffect, useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useDispatch, useSelector } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";

import MainStack from "./mainStack";
import OnBoardingStack from "./onBoardingStack";
import { login } from "../../redux/reducers/authReducers";

const RootStack = createNativeStackNavigator();

const RootStackLayout = () => {
  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state) => state.authentication.isLoggedIn);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        const storedToken = await AsyncStorage.getItem("token");

        if (storedUser && storedToken) {
          const userData = JSON.parse(storedUser);
          dispatch(login(userData));  // dispatch the login action
        }
      } catch (e) {
        console.error("Error loading auth state:", e);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, [dispatch]);

  if (isLoading) {
    return null;  // or a loading spinner
  }

  return (
    <RootStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      {isLoggedIn ? (
        <RootStack.Screen name="MainStack" component={MainStack} />
      ) : (
        <RootStack.Screen name="OnboardingStack" component={OnBoardingStack} />
      )}
    </RootStack.Navigator>
  );
};

export default RootStackLayout;
