import React from "react";
import { View, FlatList } from "react-native";
import ChatItem from "../../../components/chatItem";
import { Header } from "../../../components/header";
import  styles  from "./styles";
import { router } from "expo-router";
import { useNavigation } from "@react-navigation/native";

const chats = [
  { id: "1", name: "Darrell Steward", message: "HEY", avatar: "", unread: 0 },
  {
    id: "2",
    name: "Cody Fisher",
    message: "Good Morning Dude!!!! How you doing? Is everything alright? and.",
    avatar: "",
    unread: 8,
  },
  { id: "3", name: "Jacob Jones", message: "HEY", avatar: "", unread: 0 },
  { id: "4", name: "Jerome Bell", message: "HEY", avatar: "", unread: 0 },
  {
    id: "5",
    name: "Devon Lane",
    message:
      "Good Morning Dude!!!! How you doing? Is everything alright? and how you doing bro..",
    avatar: "",
    unread: 0,
  },
  { id: "6", name: "Kathryn Murphy", message: "HEY", avatar: "", unread: 8 },
  { id: "7", name: "Kristin Watson", message: "HEY", avatar: "", unread: 0 },
  { id: "8", name: "Ralph Edwards", message: "HEY", avatar: "", unread: 0 },
];
export default function Chat() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Header title="Chats" />
      <View style={styles.chatHeader} />
      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ChatItem
            item={item}
            onPress={() => {
              navigation.navigate("ChatScreen");
            }}
          />
        )}
      />
    </View>
  );
}
