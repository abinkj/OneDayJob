import TabLayout from "@/(tabs)/_layout";
import ChatScreen from "@/main/chatScreen";
import EditProfile from "@/main/editProfile";
import Notification from "@/main/notification";
import RequestVerification from "@/main/requestVerification";
import JobDetails from "@/main/jobDetails";
import JobTimer from "@/main/jobTimer";
import NewRequest from "@/main/newRequest";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import RequestProfile from "@/main/requestProfile";
import BankAccountScreen from "@/main/bankAccount";
import PaymentHistoryScreen from "@/main/paymentHistory";
import Settings from "@/main/settings";
import PrivacyPolicy from "@/main/privacyPolicy";
import SavedAddressesScreen from "@/main/savedAddresses";
import AddEditAddressScreen from "@/main/addEditAddress";
import Language from "@/main/language";
import JobPostingHistory from "@/main/jobPostingHistory";
import TestSocketScreen from "@/main/testSocket";
import { useTheme } from "../../contexts/ThemeContext";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";

const Stack = createNativeStackNavigator();

const MainStack = () => {
  const { colors } = useTheme();
  const activeJob = useSelector((state: RootState) => state.activeJob);
  const hasActiveJob = activeJob.isTimerRunning && !!activeJob.activeJobId;
  console.log("activeJob reduxxx",activeJob);
  return (
    <Stack.Navigator
      id={undefined}
      initialRouteName={hasActiveJob ? "JobTimer" : "MainHome"}
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        gestureEnabled: true,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="MainHome" component={TabLayout} />
      
      <Stack.Screen 
        name="JobTimer" 
        component={JobTimer} 
        options={{ animation: hasActiveJob ? 'fade_from_bottom' : 'slide_from_right' }}
        initialParams={hasActiveJob ? {
          jobId: activeJob.activeJobId,
          jobName: activeJob.activeJobName,
          employerId: activeJob.employerId,
          employerName: activeJob.employerName,
          employerImage: activeJob.employerImage,
        } : undefined}
      />
      <Stack.Screen name="ChatScreen" component={ChatScreen} />
      <Stack.Screen name="RequestProfile" component={RequestProfile} />
      <Stack.Screen name="RequestVerification" component={RequestVerification} />
      <Stack.Screen name="NewRequest" component={NewRequest} />
      <Stack.Screen name="Notification" component={Notification} />
      <Stack.Screen name="EditProfile" component={EditProfile} />
      <Stack.Screen name="JobDetails" component={JobDetails} />
      <Stack.Screen name="BankAccount" component={BankAccountScreen} />
      <Stack.Screen name="PaymentHistory" component={PaymentHistoryScreen} />
      <Stack.Screen name="Settings" component={Settings} />
      <Stack.Screen name="SavedAddresses" component={SavedAddressesScreen} />
      <Stack.Screen name="AddEditAddress" component={AddEditAddressScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy} />
      <Stack.Screen name="Language" component={Language} />
      <Stack.Screen name="JobPostingHistory" component={JobPostingHistory} />
      <Stack.Screen name="TestSocket" component={TestSocketScreen} />
    </Stack.Navigator>
  );
};

export default MainStack;