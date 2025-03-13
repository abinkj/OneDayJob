import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="Status" options={{ title: "Status" }} />
      <Tabs.Screen name="PostJob" options={{ title: "Post Job" }} />
      <Tabs.Screen name="Chat" options={{ title: "Chat" }} />
      <Tabs.Screen name="Profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
