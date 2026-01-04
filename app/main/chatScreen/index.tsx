import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { Header } from "../../../components/header";
import { ChatScreenSkeleton } from "../../../components/Shimmer/Skeletons";
import { useTheme } from "../../../contexts/ThemeContext";
import { createStyles } from "./styles";
import { useRoute } from "@react-navigation/native";
import MessageBubble from "../../../components/messageBubble";
import socketService from "../../../services/socketService";
import {
  useMessages,
  useSendMessage,
  useMarkMessagesAsRead,
} from "../../../hooks/useChat";
import { getCurrentUser } from "../../../services/api";
import Toast from "react-native-toast-message";
import { useQueryClient } from "@tanstack/react-query";

export default function ChatScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const route = useRoute();
  const queryClient = useQueryClient();
  const { conversationId, participant } = (route.params as any) || {};

  const conversationIdString = Array.isArray(conversationId)
    ? conversationId[0]
    : conversationId;

  const {
    data: rawMessages,
    isLoading: messagesLoading,
    refetch: refetchMessages,
    isRefetching: refreshing,
  } = useMessages(conversationIdString);

  const sendMessageMutation = useSendMessage();
  const markAsReadMutation = useMarkMessagesAsRead();

  const [input, setInput] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<any>(null);
  const currentUserRef = useRef<any>(null);

  // Parse participant data
  const participantData =
    typeof participant === "string" ? JSON.parse(participant) : participant;

  // Helper to normalize user IDs
  const normalizeUserId = (user: any) => {
    return String(user?.id || user?._id || "");
  };

  // Transform messages for display
  const messages = useMemo(() => {
    if (!rawMessages || !currentUser) return [];

    return rawMessages.map((msg: any) => {
      const currentUserId = normalizeUserId(currentUser);
      const senderId = normalizeUserId(msg.sender);
      const messageType = senderId === currentUserId ? "me" : "other";

      return {
        id: msg._id || msg.id,
        type: messageType,
        text: msg.content?.text || msg.text || "",
        time: new Date(msg.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        senderId: senderId,
      };
    });
  }, [rawMessages, currentUser]);

  // Setup socket listeners
  useEffect(() => {
    if (!conversationIdString || !currentUser) return;

    const handleNewMessage = (data: any) => {
      if (data.conversationId === conversationIdString) {
        console.log("Socket: New message received", data.message);

        // Update React Query cache manually
        queryClient.setQueryData(
          ["messages", conversationIdString],
          (oldData: any[]) => {
            const exists = oldData?.some(
              (msg) =>
                (msg._id || msg.id) === (data.message._id || data.message.id)
            );
            if (exists) return oldData;
            return [...(oldData || []), data.message];
          }
        );

        // Also invalidate conversations list
        queryClient.invalidateQueries({ queryKey: ["conversations"] });
      }
    };

    const handleTyping = (data: any) => {
      if (
        data.conversationId === conversationIdString &&
        normalizeUserId({ id: data.userId }) !== normalizeUserId(currentUser)
      ) {
        setOtherUserTyping(data.isTyping);
      }
    };

    socketService.on("new-message", handleNewMessage);
    socketService.on("user-typing", handleTyping);

    return () => {
      socketService.off("new-message");
      socketService.off("user-typing");
    };
  }, [conversationIdString, currentUser, queryClient]);

  // Initial load
  useEffect(() => {
    const init = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
        currentUserRef.current = user;

        if (conversationIdString) {
          await socketService.connect();
          socketService.joinConversation(conversationIdString);
          markAsReadMutation.mutate(conversationIdString);
        }
      } catch (error) {
        console.error("Chat init error:", error);
      }
    };
    init();

    return () => {
      if (conversationIdString) {
        socketService.leaveConversation(conversationIdString);
      }
    };
  }, [conversationIdString]);

  const handleSendMessage = async () => {
    if (
      input.trim() === "" ||
      !conversationIdString ||
      sendMessageMutation.isPending
    )
      return;

    const messageText = input.trim();
    setInput("");

    try {
      // We still use the mutation which calls the API,
      // but the real-time logic often prefers socket.
      // However, if we use React Query, the mutation's onSuccess will invalidate and fetch OR we can do both.
      // Current project seems to use socket for real-time and API for persistence.

      if (socketService.isSocketConnected()) {
        socketService.sendMessage(conversationIdString, messageText, "text");
        // Socket listener will handle adding it to cache
      } else {
        // Fallback to API via mutation
        await sendMessageMutation.mutateAsync({
          conversationId: conversationIdString,
          text: messageText,
        });
      }

      if (socketService.isSocketConnected()) {
        socketService.stopTyping(conversationIdString);
      }
      setIsTyping(false);
    } catch (error) {
      console.error("Send error:", error);
      setInput(messageText);
      Toast.show({ type: "error", text1: "Failed to send message" });
    }
  };

  const handleInputChange = (text: string) => {
    setInput(text);
    if (!conversationIdString || !socketService.isSocketConnected()) return;

    if (text.length > 0 && !isTyping) {
      setIsTyping(true);
      socketService.startTyping(conversationIdString);
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socketService.stopTyping(conversationIdString);
    }, 1000);
  };

  const handleAttachmentSelect = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      base64: true,
      quality: 1,
    });
    if (!result.canceled) {
      // Handle image upload...
    }
  };

  if (messagesLoading && !currentUser) {
    return <ChatScreenSkeleton />;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      <Header title={participantData?.name || "Chat"} showBackButton />
      <Text style={styles.dateLabel}>
        {new Date().toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </Text>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MessageBubble text={item.text} time={item.time} type={item.type} />
        )}
        contentContainerStyle={styles.messagesContainer}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => refetchMessages()}
          />
        }
        ListFooterComponent={
          otherUserTyping ? (
            <View style={{ padding: 10, alignItems: "center" }}>
              <Text
                style={{
                  color: colors.grey,
                  fontSize: 14,
                  fontStyle: "italic",
                }}
              >
                {participantData?.name || "Someone"} is typing...
              </Text>
            </View>
          ) : null
        }
      />

      <View style={styles.inputContainer}>
        <AntDesign
          name="plus"
          size={24}
          color={colors.tabBlue}
          style={{ marginLeft: 12 }}
          onPress={handleAttachmentSelect}
        />
        <View style={styles.subInputContainer}>
          <TextInput
            placeholder="Type a message"
            value={input}
            onChangeText={handleInputChange}
            style={styles.input}
            multiline
            placeholderTextColor={colors.grey}
          />
          <TouchableOpacity
            onPress={handleSendMessage}
            disabled={sendMessageMutation.isPending || !input.trim()}
          >
            {sendMessageMutation.isPending ? (
              <ActivityIndicator
                size="small"
                color="white"
                style={styles.sendIcon}
              />
            ) : (
              <Ionicons
                name="send"
                size={24}
                color={input.trim() ? "white" : colors.grey}
                style={styles.sendIcon}
              />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
