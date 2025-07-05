import React, { useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "./styles";
import { Header } from "../../components/header";
import { Colors } from "../../constants/Colors";
import { useLocalSearchParams } from "expo-router";
import MessageBubble from "../../components/messageBubble";

export default function ChatScreen() {
  const { chat } = useLocalSearchParams();
  console.log("Chat :", chat); // Log the chat ID for debugging
  const chatData = chat ? JSON.parse(chat) : null;
  const [messages, setMessages] = useState([
    { id: "1", type: "other", text: "Hey Lucas !", time: "10:10 am" },
    {
      id: "2",
      type: "other",
      text: "How’s your project going?",
      time: "10:10 am",
    },
    { id: "3", type: "me", text: "Hi Brooke", time: "10:10 am" },
    {
      id: "4",
      type: "me",
      text: "It’s going well, Thanks for asking, How about you?",
      time: "10:10 am",
    },
  ]);

  const [input, setInput] = useState("");
  const flatListRef = useRef(null);

  const handleAttachmentSelect = async () => {
    console.log("Attachment button pressed");
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: false,
      selectionLimit: 1,
      aspect: [4, 3],
      quality: 1,
      allowsEditing: true,
      base64: true,
    });

    if (!result.canceled) {
      console.log(result.assets[0].base64);
    }
  };

  const sendMessage = () => {
    if (input.trim() === "") return;

    const newMessage = {
      id: Date.now().toString(),
      type: "me",
      text: input.trim(),
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput("");

    // Scroll to bottom after slight delay to allow rendering
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const renderItem = ({ item }) => (
    // <View
    //   style={[
    //     styles.messageBubble,
    //     item.type === "me" ? styles.myMessage : styles.otherMessage,
    //   ]}
    // >
    //   <Text style={styles.messageText}>{item.text}</Text>

    //   <View style={styles.timeContainer}>
    //     <Text style={styles.messageTime}>{item.time}</Text>
    //     {item.type === "me" && (
    //       <>
    //         <AntDesign
    //           name="check"
    //           size={12}
    //           color="#ccc"
    //           style={styles.tickIcon}
    //         />
    //         <AntDesign
    //           name="check"
    //           size={12}
    //           color="#ccc"
    //           style={styles.tickIcon}
    //         />
    //       </>
    //     )}
    //   </View>
    // </View>
    <MessageBubble text={item.text} time={item.time} type={item.type} />
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      <Header title={chatData?.name} showBackButton />
      <Text style={styles.dateLabel}>8 August 2025</Text>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesContainer}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
      />

      <View style={styles.inputContainer}>
        <AntDesign
          name="plus"
          size={24}
          color={Colors.tabBlue}
          style={{ marginLeft: 12 }}
          onPress={handleAttachmentSelect}
        />
        <View style={styles.subInputContainer}>
          <TextInput
            placeholder="Type a message"
            value={input}
            onChangeText={setInput}
            style={styles.input}
            onSubmitEditing={sendMessage}
            returnKeyType="default"
            multiline
          />
          <TouchableOpacity onPress={sendMessage}>
            <Ionicons
              name="send"
              size={24}
              color="white"
              style={styles.sendIcon}
            />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
